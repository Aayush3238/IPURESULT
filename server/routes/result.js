import { Router } from "express";
import { fetchCaptcha, loginToPortal, fetchResultForSemester } from "../services/ggsipuClient.js";
import { fetchInternalMarks } from "../services/ggsipuPortalService.js";
import { getPortalSession } from "../services/sessionStore.js";
import { createHttpError } from "../utils/errors.js";

const router = Router();

async function fetchInternalsAsResult(portalSessionId, semester) {
  const internalData = await fetchInternalMarks({
    sessionId: portalSessionId,
    semester: String(semester),
  });

  return {
    student: {
      name: internalData.studentName || "Student",
      enrollmentNumber: internalData.enrollmentNo || "",
      collegeName: internalData.collegeName || "N/A",
      course: internalData.course || "N/A",
      semester: String(semester),
    },
    summary: {
      sgpa: "-",
      cgpa: "-",
      totalCredits: "-",
      status: "Internal Only",
    },
    subjects: (internalData.subjects || []).map((sub) => ({
      code: sub.paperCode,
      name: sub.paperName,
      internal: sub.internalMarks != null ? String(sub.internalMarks) : "-",
      external: "-",
      total: "-",
      grade: "-",
    })),
  };
}

router.get("/captcha", async (_req, res, next) => {
  try {
    const captcha = await fetchCaptcha();
    res.json(captcha);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { sessionId, enrollment, password, captcha } = req.body || {};

    if (!sessionId || !enrollment || !password || !captcha) {
      throw createHttpError(400, "VALIDATION_ERROR", "All fields are required.");
    }

    const result = await loginToPortal({
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

router.get("/semester/:semester", async (req, res, next) => {
  try {
    const { semester } = req.params;
    const portalSessionId = req.query.portalSessionId || req.headers["x-portal-session-id"];
    const semStr = String(semester).trim();

    if (!portalSessionId) {
      throw createHttpError(400, "VALIDATION_ERROR", "Portal session ID is required.");
    }

    if (!semester) {
      throw createHttpError(400, "VALIDATION_ERROR", "Semester is required.");
    }

    // Determine if the requested semester is the dynamic next unreleased semester
    const portalSession = getPortalSession(portalSessionId);
    let isNextSemester = false;
    
    if (portalSession && portalSession.semesters?.length > 0) {
      const availableSemNums = portalSession.semesters.map(s => parseInt(s.value, 10) || 0);
      const maxAvailableSem = Math.max(...availableSemNums, 0);
      const reqSemNum = parseInt(semStr, 10);
      
      if (reqSemNum === maxAvailableSem + 1) {
        isNextSemester = true;
      }
    }

    let resultData;
    if (isNextSemester) {
      console.log(`[api:result:semester] Next semester ${semStr} requested. Fetching internal marks directly...`);
      resultData = await fetchInternalsAsResult(portalSessionId, semStr);
    } else {
      try {
        resultData = await fetchResultForSemester({
          portalSessionId,
          semester: semStr,
        });

        // Fallback if the results call succeeded but returned zero subjects
        if (!resultData.subjects || resultData.subjects.length === 0) {
          console.log(`[api:result:semester] Results empty for semester ${semStr}. Falling back to internal marks.`);
          resultData = await fetchInternalsAsResult(portalSessionId, semStr);
        }
      } catch (err) {
        console.warn(`[api:result:semester] Failed to fetch standard results for semester ${semStr}. Falling back to internal marks...`);
        resultData = await fetchInternalsAsResult(portalSessionId, semStr);
      }
    }

    res.json(resultData);
  } catch (error) {
    next(error);
  }
});

export default router;
