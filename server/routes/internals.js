import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHttpError } from "../utils/errors.js";
import { getInternalsCollection, isMongoConfigured } from "../services/mongo.js";
import { fetchInternalMarks } from "../services/ggsipuPortalService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "internals.json");

const router = Router();

function loadInternals() {
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}

router.get("/live", async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId || req.headers["x-portal-session-id"];
    const semester = req.query.semester;

    if (!sessionId) {
      throw createHttpError(400, "VALIDATION_ERROR", "Portal session ID is required.");
    }

    if (!semester) {
      throw createHttpError(400, "VALIDATION_ERROR", "Semester is required.");
    }

    const data = await fetchInternalMarks({
      sessionId: String(sessionId).trim(),
      semester: String(semester).trim(),
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/:enrollment", async (req, res, next) => {
  try {
    const { enrollment } = req.params;
    const normalizedEnrollment = enrollment?.trim();

    if (!normalizedEnrollment || !/^\d{10,12}$/.test(normalizedEnrollment)) {
      throw createHttpError(
        400,
        "VALIDATION_ERROR",
        "Enter a valid 10-12 digit enrollment number."
      );
    }

    let student = null;

    if (isMongoConfigured()) {
      try {
        const collection = await getInternalsCollection();
        student = await collection.findOne(
          { enrollment: normalizedEnrollment },
          { projection: { _id: 0 } }
        );
      } catch (error) {
        console.warn("[internals:mongo:fallback]", error.message);
      }
    }

    if (!student) {
      const data = loadInternals();
      student = data.find((s) => s.enrollment === normalizedEnrollment);
    }

    if (!student) {
      throw createHttpError(
        404,
        "NOT_FOUND",
        "No internal marks found for this enrollment number."
      );
    }

    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
});

export default router;
