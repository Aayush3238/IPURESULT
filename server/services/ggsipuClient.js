import crypto from "node:crypto";
import fs from "node:fs";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import {
  createSession,
  deleteSession,
  getSession,
  createPortalSession,
  getPortalSession,
} from "./sessionStore.js";
import { detectPortalFailure } from "./resultParser.js";
import { parseProfileHtml } from "./profileParser.js";
import { calculateSGPA } from "./sgpaEngine.js";
import { createHttpError, normalizePortalError } from "../utils/errors.js";

const PORTAL_BASE_URL = process.env.GGSIPU_PORTAL_BASE_URL || "https://examweb.ggsipu.ac.in/web";
const LOGIN_PATH = "/login.jsp";
const RESULT_PATH = process.env.GGSIPU_RESULT_PATH || "/StudentSearchProcess";
const REQUEST_TIMEOUT_MS = Number(process.env.GGSIPU_REQUEST_TIMEOUT_MS || 60000);

function createPortalClient(jar) {
  return wrapper(
    axios.create({
      baseURL: PORTAL_BASE_URL,
      jar,
      withCredentials: true,
      timeout: REQUEST_TIMEOUT_MS,
      maxRedirects: 5,
      responseType: "text",
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })
  );
}

function toAbsolutePortalPath(value, fallbackPath) {
  try {
    const url = new URL(value || fallbackPath, `${PORTAL_BASE_URL}/`);
    return `${url.pathname.replace(/^\/web/, "")}${url.search}`;
  } catch {
    return fallbackPath;
  }
}

function getCaptchaPath(loginHtml) {
  const $ = cheerio.load(loginHtml);
  const src = $("#captchaImage").attr("src") || $("img[src*='Captcha']").attr("src");

  if (!src) {
    throw createHttpError(
      502,
      "UNEXPECTED_HTML_STRUCTURE",
      "Captcha image was not found on the GGSIPU login page."
    );
  }

  return toAbsolutePortalPath(src, "/CaptchaServlet");
}

function getLoginAction(loginHtml) {
  const $ = cheerio.load(loginHtml);
  const action = $("#loginForm").attr("action") || $("form[name='loginForm']").attr("action");
  return toAbsolutePortalPath(action, "/Login");
}

function hashPortalPassword(password, captcha) {
  return crypto.createHash("sha256").update(`${password}${captcha}`).digest("base64");
}

function buildLoginPayload({ enrollment, password, captcha }) {
  const payload = new URLSearchParams();
  payload.set("username", enrollment);
  payload.set("passwd", hashPortalPassword(password, captcha));
  payload.set("captcha", captcha);
  return payload;
}

function parseSemesters(html) {
  const $ = cheerio.load(html || "");
  const semesters = [];

  $("select").each((_i, selectEl) => {
    const $sel = $(selectEl);
    const parentText = $sel.parent().text().toLowerCase();
    const prevText = $sel.prevAll("label,span,td,th").first().text().toLowerCase();

    const hasSemContext =
      parentText.includes("semester") ||
      prevText.includes("semester") ||
      ($sel.attr("name") || "").toLowerCase().includes("sem") ||
      ($sel.attr("id") || "").toLowerCase().includes("sem");

    if (!hasSemContext) {
      const options = $sel.find("option").map((_j, opt) => $(opt).text().trim()).get();
      const hasNumericOptions = options.some((t) => /^\d+$/.test(t));
      if (!hasNumericOptions) return;
    }

    $sel.find("option").each((_j, opt) => {
      const value = $(opt).attr("value");
      const text = $(opt).text().trim();
      if (value && text && value !== "" && !text.toLowerCase().includes("select")) {
        const valNum = parseInt(value, 10);
        if (!isNaN(valNum) && valNum >= 1 && valNum <= 8) {
          semesters.push({ value, label: text });
        }
      }
    });
  });

  return semesters;
}

function gradeFromMarks(totalMarks) {
  const marks = Number(totalMarks);
  if (!Number.isFinite(marks)) return "-";

  if (marks >= 90) return "O";
  if (marks >= 75) return "A+";
  if (marks >= 65) return "A";
  if (marks >= 55) return "B+";
  if (marks >= 50) return "B";
  if (marks >= 45) return "C";
  if (marks >= 40) return "P";
  return "F";
}

function transformResultJson(data, semester) {
  const profile = data.stprofile || {};
  const rows = data.stresult || [];
  const report = data.report || {};

  const student = {
    name: profile["student name"] || profile.studentName || profile.name || "",
    enrollmentNumber: profile["roll number"] || profile.rollNumber || profile.roll_no || "",
    collegeName: profile["institute"] || profile.instituteName || "",
    course: profile["programme"] || profile.program || "",
    semester: semester || "",
  };

  const parsedSubjects = rows.map((row) => {
    const internal = Number(row[3]);
    const external = Number(row[4]);
    const total =
      row[5] != null && row[5] !== ""
        ? Number(row[5])
        : Number.isFinite(internal) && Number.isFinite(external)
          ? internal + external
          : null;

    return {
      code: row[1] || "",
      name: row[2] || "",
      internal: row[3] != null ? String(row[3]) : "-",
      external: row[4] != null ? String(row[4]) : "-",
      total: Number.isFinite(total) ? String(total) : "-",
      credits: row.credit || row.credits || row[7] || row[0] || undefined,
    };
  });

  const engineResult = calculateSGPA(parsedSubjects);

  const summary = {
    sgpa: report.sgpa || report.SGPA || String(engineResult.sgpa) || "",
    cgpa: report.cgpa || report.CGPA || "",
    totalCredits: report.totalCredits || report.credits || String(engineResult.creditTotal) || "",
    status: report.status || report.Result || (engineResult.subjectBreakdown.length ? "Available" : ""),
    weightedPoints: engineResult.weightedPoints,
    sgpaEngine: {
      sgpa: engineResult.sgpa,
      creditTotal: engineResult.creditTotal,
      weightedPoints: engineResult.weightedPoints,
      subjectBreakdown: engineResult.subjectBreakdown
    }
  };

  return { student, summary, subjects: engineResult.subjectBreakdown };
}

export async function fetchCaptcha() {
  const jar = new CookieJar();
  const client = createPortalClient(jar);

  try {
    const loginResponse = await client.get(LOGIN_PATH);
    const captchaPath = getCaptchaPath(loginResponse.data);
    const captchaResponse = await client.get(captchaPath, {
      responseType: "arraybuffer",
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: `${PORTAL_BASE_URL}${LOGIN_PATH}`,
      },
    });

    const contentType = captchaResponse.headers["content-type"] || "image/png";
    const imageBase64 = Buffer.from(captchaResponse.data).toString("base64");
    const sessionId = createSession({
      jar,
      loginHtml: loginResponse.data,
      loginAction: getLoginAction(loginResponse.data),
    });

    return {
      sessionId,
      captchaImage: `data:${contentType};base64,${imageBase64}`,
    };
  } catch (error) {
    throw normalizePortalError(error);
  }
}

export async function loginToPortal({ sessionId, enrollment, password, captcha }) {
  const session = getSession(sessionId);

  if (!session) {
    throw createHttpError(440, "SESSION_EXPIRED", "Session expired. Refresh captcha and try again.");
  }

  const client = createPortalClient(session.jar);

  try {
    const loginResponse = await client.post(
      session.loginAction || "/Login",
      buildLoginPayload({ enrollment, password, captcha }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: PORTAL_BASE_URL.replace(/\/web$/, ""),
          Referer: `${PORTAL_BASE_URL}${LOGIN_PATH}`,
        },
      }
    );

    deleteSession(sessionId);

    const html = String(loginResponse.data || "");
    const failure = detectPortalFailure(html, true);
    if (failure) throw failure;

    const finalUrl = loginResponse.request?.res?.responseUrl || "";
    console.log("[portal:login] finalUrl:", finalUrl);

    let semesters = parseSemesters(html);
    if (semesters.length === 0) {
      console.log("[portal:login] No semesters parsed, using fallback [1-8]");
      semesters = Array.from({ length: 8 }, (_, i) => ({
        value: String(i + 1),
        label: `Semester ${i + 1}`,
      }));
    }

    const portalSessionId = createPortalSession({
      jar: session.jar,
      semesters,
      enrollment,
    });

    console.log("[portal:login] success", {
      portalSessionId,
      semestersCount: semesters.length,
      semesters: semesters.map((s) => s.value),
    });

    return { success: true, portalSessionId, semesters };
  } catch (error) {
    throw normalizePortalError(error);
  }
}

export async function fetchResultForSemester({ portalSessionId, semester }) {
  const portalSession = getPortalSession(portalSessionId);

  if (!portalSession) {
    throw createHttpError(440, "SESSION_EXPIRED", "Portal session expired. Please login again.");
  }

  const client = createPortalClient(portalSession.jar);

  try {
    console.log("[portal:fetch-result]", { semester, url: `${RESULT_PATH}?flag=2&euno=${semester}` });

    const response = await client.get(RESULT_PATH, {
      params: { flag: 2, euno: semester },
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        Referer: `${PORTAL_BASE_URL}/student/studenthome.jsp`,
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    let data;
    try {
      data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    } catch {
      const html = String(response.data || "");
      const failure = detectPortalFailure(html, false);
      if (failure) throw failure;

      console.error("[portal:fetch-result] Response is not JSON:", {
        htmlPreview: html.slice(0, 500),
      });
      throw createHttpError(
        502,
        "INVALID_RESPONSE",
        "The portal returned an unexpected response. Please try again."
      );
    }

    console.log("[portal:fetch-result] success", {
      hasProfile: !!data.stprofile,
      resultRows: (data.stresult || []).length,
      hasReport: !!data.report,
    });

    const result = transformResultJson(data, semester);

    let profileData = null;
    if (portalSession.profileCache) {
      profileData = portalSession.profileCache.data;
    } else {
      try {
        console.log("[portal:fetch-result] Profile not cached, fetching profile first to populate info...");
        profileData = await fetchStudentProfile({ portalSessionId });
      } catch (profileErr) {
        console.error("[portal:fetch-result] Failed to fetch profile fallback info:", profileErr.message);
      }
    }

    if (profileData) {
      if (!result.student.name && profileData.studentName) {
        result.student.name = profileData.studentName;
      }
      if ((!result.student.collegeName || result.student.collegeName === "N/A" || result.student.collegeName === "") && profileData.institute) {
        result.student.collegeName = profileData.institute;
      }
      if ((!result.student.course || result.student.course === "N/A" || result.student.course === "") && profileData.program) {
        result.student.course = profileData.program;
      }

      result.student.fatherName = profileData.fatherName || "";
      result.student.motherName = profileData.motherName || "";
      result.student.email = profileData.email || "";
      result.student.contactNumber = profileData.contactNumber || "";
      result.student.gender = profileData.gender || "";
      result.student.admissionYear = profileData.admissionYear || "";
      result.student.batch = profileData.batch || "";
    }

    return result;
  } catch (error) {
    if (error.statusCode) throw error;
    throw normalizePortalError(error);
  }
}

export async function fetchInternalMarksForSemester({ portalSessionId, semester }) {
  const portalSession = getPortalSession(portalSessionId);

  if (!portalSession) {
    throw createHttpError(440, "SESSION_EXPIRED", "Portal session expired. Please login again.");
  }

  const client = createPortalClient(portalSession.jar);

  try {
    console.log("[portal:fetch-internals]", { semester });

    const [homeResponse, marksResponse] = await Promise.all([
      client.get("/student/studenthome.jsp"),
      client.get("/StudentSearchProcess", {
        params: { flag: "IM" },
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          Referer: `${PORTAL_BASE_URL}/student/studenthome.jsp`,
          "X-Requested-With": "XMLHttpRequest",
        },
      }),
    ]);

    let rows;
    try {
      rows = typeof marksResponse.data === "string" ? JSON.parse(marksResponse.data) : marksResponse.data;
    } catch {
      const html = String(marksResponse.data || "");
      const failure = detectPortalFailure(html, false);
      if (failure) throw failure;

      throw createHttpError(
        502,
        "INVALID_RESPONSE",
        "The portal returned an unexpected internal marks response."
      );
    }

    if (!Array.isArray(rows)) {
      throw createHttpError(
        502,
        "INVALID_RESPONSE",
        "The portal returned an unexpected internal marks format."
      );
    }

    const semesterNumber = parseInt(semester, 10);
    const filteredRows = rows.filter((row) => parseInt(row.euno, 10) === semesterNumber);
    const firstRow = filteredRows[0] || {};
    const $home = cheerio.load(homeResponse.data || "");
    const homeText = $home.text();

    const matchText = (pattern) => homeText.match(pattern)?.[1]?.trim() || "";

    const student = {
      name:
        matchText(/(?:Student Name|Name)\s*:\s*([^:\n\r\t]+)/i) ||
        firstRow.stname ||
        "Student",
      enrollmentNumber:
        matchText(/(?:Enrollment|Roll Number|Roll No)\s*:\s*(\d+)/i) ||
        firstRow.nrollno ||
        "",
      collegeName:
        matchText(/(?:College|Institute|Institute Name|College Name)\s*:\s*([^:\n\r\t]+)/i) ||
        "N/A",
      course:
        matchText(/(?:Programme|Program|Course|Branch)\s*:\s*([^:\n\r\t]+)/i) ||
        "N/A",
      semester: String(semester),
    };

    let profileData = null;
    if (portalSession.profileCache) {
      profileData = portalSession.profileCache.data;
    } else {
      try {
        console.log("[portal:fetch-internals] Profile not cached, fetching profile first to populate info...");
        profileData = await fetchStudentProfile({ portalSessionId });
      } catch (profileErr) {
        console.error("[portal:fetch-internals] Failed to fetch profile fallback info:", profileErr.message);
      }
    }

    if (profileData) {
      if ((!student.name || student.name === "Student" || student.name === "") && profileData.studentName) {
        student.name = profileData.studentName;
      }
      if ((!student.collegeName || student.collegeName === "N/A" || student.collegeName === "") && profileData.institute) {
        student.collegeName = profileData.institute;
      }
      if ((!student.course || student.course === "N/A" || student.course === "") && profileData.program) {
        student.course = profileData.program;
      }

      student.fatherName = profileData.fatherName || "";
      student.motherName = profileData.motherName || "";
      student.email = profileData.email || "";
      student.contactNumber = profileData.contactNumber || "";
      student.gender = profileData.gender || "";
      student.admissionYear = profileData.admissionYear || "";
      student.batch = profileData.batch || "";
    }

    const subjects = filteredRows.map((row) => ({
      code: row.papercode || "",
      name: row.papername || "",
      maxMarks: row.maxmarks != null ? Number(row.maxmarks) : 40,
      internal: row.marks != null ? String(row.marks) : "-",
      external: "-",
      total: "-",
      grade: "-",
    }));

    console.log("[portal:fetch-internals] success", {
      semester,
      subjects: subjects.length,
    });

    return {
      student,
      summary: {
        sgpa: "-",
        cgpa: "-",
        totalCredits: "-",
        status: "Internal Only",
      },
      subjects,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw normalizePortalError(error);
  }
}

const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchStudentProfile({ portalSessionId }) {
  const portalSession = getPortalSession(portalSessionId);

  if (!portalSession) {
    throw createHttpError(440, "SESSION_EXPIRED", "Portal session expired. Please login again.");
  }

  const now = Date.now();
  if (
    portalSession.profileCache &&
    now - portalSession.profileCache.cachedAt < PROFILE_CACHE_TTL_MS
  ) {
    console.log("[portal:profile] Returning cached student profile.");
    return portalSession.profileCache.data;
  }

  const client = createPortalClient(portalSession.jar);

  try {
    console.log("[portal:fetch-profile] Fetching profile.jsp...");
    const response = await client.get("/student/profile.jsp");

    const html = String(response.data || "");
    const failure = detectPortalFailure(html, false);
    if (failure) throw failure;

    const fallbackEnrollment = portalSession.enrollment || "";
    const profileData = parseProfileHtml(html, fallbackEnrollment);

    if (profileData.photoUrl && !profileData.photoUrl.startsWith("data:")) {
      profileData.photoUrl = `/api/student/photo?portalSessionId=${encodeURIComponent(
        portalSessionId
      )}&imgUrl=${encodeURIComponent(profileData.photoUrl)}`;
    }

    portalSession.profileCache = {
      data: profileData,
      cachedAt: now,
    };

    console.log("[portal:fetch-profile] success for enrollment:", profileData.enrollmentNo);
    return profileData;
  } catch (error) {
    if (error.statusCode) throw error;
    throw normalizePortalError(error);
  }
}
