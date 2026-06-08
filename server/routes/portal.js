import { Router } from "express";
import { login, fetchInternalMarks } from "../services/ggsipuPortalService.js";
import { getPortalSessionsMap } from "../services/sessionStore.js";
import { createHttpError } from "../utils/errors.js";

const router = Router();

router.get("/debug", async (req, res, next) => {
  try {
    const sessions = getPortalSessionsMap();
    const sessionIds = Array.from(sessions.keys());
    
    if (sessionIds.length === 0) {
      return res.json({ message: "No active portal sessions found. Please login first in the browser." });
    }

    const firstSessionId = sessionIds[0];
    const semester = req.query.semester || "1";
    
    console.log("[debug] Testing fetchInternalMarks with session:", firstSessionId, "semester:", semester);
    
    const data = await fetchInternalMarks({
      sessionId: firstSessionId,
      semester,
    });
    
    res.json({
      success: true,
      activeSessions: sessionIds,
      testFetch: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { sessionId, enrollment, password, captcha } = req.body || {};

    if (!sessionId || !enrollment || !password || !captcha) {
      throw createHttpError(400, "VALIDATION_ERROR", "All fields are required.");
    }

    const result = await login({
      sessionId,
      enrollment: String(enrollment).trim(),
      password: String(password),
      captcha: String(captcha).trim(),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
