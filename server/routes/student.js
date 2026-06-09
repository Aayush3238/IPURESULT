import { Router } from "express";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { fetchStudentProfile } from "../services/ggsipuClient.js";
import { getPortalSession } from "../services/sessionStore.js";
import { createHttpError } from "../utils/errors.js";

const router = Router();

router.get("/profile", async (req, res, next) => {
  try {
    const portalSessionId = req.query.portalSessionId || req.headers["x-portal-session-id"];
    if (!portalSessionId) {
      throw createHttpError(400, "VALIDATION_ERROR", "Portal session ID is required.");
    }

    const profile = await fetchStudentProfile({ portalSessionId });
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.get("/photo", async (req, res, next) => {
  try {
    const portalSessionId = req.query.portalSessionId || req.headers["x-portal-session-id"];
    const imgUrl = req.query.imgUrl;

    if (!portalSessionId) {
      throw createHttpError(400, "VALIDATION_ERROR", "Portal session ID is required.");
    }
    if (!imgUrl) {
      throw createHttpError(400, "VALIDATION_ERROR", "Image URL is required.");
    }

    const portalSession = getPortalSession(portalSessionId);
    if (!portalSession) {
      throw createHttpError(440, "SESSION_EXPIRED", "Portal session expired. Please login again.");
    }

    const PORTAL_BASE_URL = process.env.GGSIPU_PORTAL_BASE_URL || "https://examweb.ggsipu.ac.in/web";
    const absoluteUrl = new URL(imgUrl, `${PORTAL_BASE_URL}/`).toString();

    // Create axios client with the session's cookie jar
    const client = wrapper(
      axios.create({
        jar: portalSession.jar,
        withCredentials: true,
        responseType: "arraybuffer",
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Referer: `${PORTAL_BASE_URL}/student/profile.jsp`,
        },
      })
    );

    console.log("[portal:photo-proxy] Fetching student photo from GGSIPU:", absoluteUrl);
    const response = await client.get(absoluteUrl);
    const contentType = response.headers["content-type"] || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=600"); // Cache locally for 10 minutes
    res.send(response.data);
  } catch (error) {
    console.error("[portal:photo-proxy] Error proxying photo:", error.message);
    res.status(404).send("Image not found");
  }
});

export default router;
