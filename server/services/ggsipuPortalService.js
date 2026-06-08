import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPortalSession } from "./sessionStore.js";
import { loginToPortal } from "./ggsipuClient.js";
import { createHttpError } from "../utils/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTAL_BASE_URL = process.env.GGSIPU_PORTAL_BASE_URL || "https://examweb.ggsipu.ac.in/web";
const REQUEST_TIMEOUT_MS = Number(process.env.GGSIPU_REQUEST_TIMEOUT_MS || 20000);

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

/**
 * Log into GGSIPU portal and create a portal session.
 */
export async function login({ sessionId, enrollment, password, captcha }) {
  return loginToPortal({ sessionId, enrollment, password, captcha });
}

/**
 * Fetch and scrape internal marks for a given semester from the portal.
 */
export async function fetchInternalMarks({ sessionId, semester }) {
  const portalSession = getPortalSession(sessionId);

  if (!portalSession) {
    throw createHttpError(440, "SESSION_EXPIRED", "Portal session expired. Please login again.");
  }

  const client = createPortalClient(portalSession.jar);

  try {
    console.log("[portal:internals] Fetching studenthome...");
    const homeResponse = await client.get("/student/studenthome.jsp");
    const $home = cheerio.load(homeResponse.data);

    console.log("[portal:internals] Fetching StudentSearchProcess?flag=IM JSON...");
    const response = await client.get("/StudentSearchProcess?flag=IM");
    
    let list = [];
    try {
      list = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    } catch (e) {
      console.error("[portal:internals] Failed to parse flag=IM JSON response:", e.message);
      throw createHttpError(502, "PORTAL_ERROR", "Failed to parse internal marks JSON response from portal.");
    }

    if (!Array.isArray(list)) {
      console.error("[portal:internals] flag=IM response is not an array:", list);
      throw createHttpError(502, "PORTAL_ERROR", "Internal marks response format is invalid.");
    }

    const targetSemNum = parseInt(semester, 10);
    const filteredList = list.filter(item => {
      const semVal = parseInt(item.euno, 10);
      return semVal === targetSemNum;
    });

    const subjects = filteredList.map(item => ({
      paperCode: item.papercode || "",
      paperName: item.papername || "",
      maxMarks: item.maxmarks != null ? Number(item.maxmarks) : 40,
      internalMarks: item.marks != null ? String(item.marks) : "-",
    }));

    // Parse student details from home page HTML
    let studentName = "";
    let enrollmentNo = portalSession.enrollment || "";
    let collegeName = "";
    let course = "";

    const homeText = $home.text();
    const nameMatch = homeText.match(/(?:Student Name|Name)\s*:\s*([^:\n\r\t]+)/i);
    if (nameMatch) {
      studentName = nameMatch[1].trim();
    }
    const enrollmentMatch = homeText.match(/(?:Enrollment|Roll Number|Roll No)\s*:\s*(\d+)/i);
    if (enrollmentMatch) {
      enrollmentNo = enrollmentMatch[1].trim();
    }
    const collegeMatch = homeText.match(/(?:College|Institute|Institute Name|College Name)\s*:\s*([^:\n\r\t]+)/i);
    if (collegeMatch) {
      collegeName = collegeMatch[1].trim();
    }
    const courseMatch = homeText.match(/(?:Programme|Program|Course|Branch)\s*:\s*([^:\n\r\t]+)/i);
    if (courseMatch) {
      course = courseMatch[1].trim();
    }

    // Fallback name/roll from JSON if not found in HTML
    if (filteredList.length > 0) {
      if (!studentName || studentName === "Student") {
        studentName = filteredList[0].stname || "Student";
      }
      if (!enrollmentNo) {
        enrollmentNo = filteredList[0].nrollno || "";
      }
    }

    return {
      enrollmentNo,
      studentName: studentName || "Student",
      collegeName: collegeName || "N/A",
      course: course || "N/A",
      semester: targetSemNum || semester,
      subjects,
    };
  } catch (error) {
    const errorDetails = {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      data: error.config?.data,
    };
    console.error("[portal:internals:error]", errorDetails);
    if (error.statusCode) throw error;
    throw createHttpError(502, "PORTAL_ERROR", `Failed to retrieve internal marks: ${error.message}`);
  }
}

function parseMarksTable($) {
  const subjects = [];
  
  $("table").each((_ti, table) => {
    const $table = $(table);
    const headers = [];
    
    // Find table headers
    $table.find("tr").first().find("th, td").each((_hi, cell) => {
      headers.push($(cell).text().trim().toLowerCase());
    });
    
    // Find column indexes dynamically
    const paperCodeIdx = headers.findIndex(h => h.includes("paper code") || h.includes("subject code") || h.includes("code"));
    const paperNameIdx = headers.findIndex(h => h.includes("paper name") || h.includes("subject name") || h.includes("subject") || h.includes("name"));
    const maxMarksIdx = headers.findIndex(h => h.includes("max"));
    const internalMarksIdx = headers.findIndex(h => h.includes("internal"));

    // Expected defaults if not found
    const codeIdx = paperCodeIdx !== -1 ? paperCodeIdx : 2;
    const nameIdx = paperNameIdx !== -1 ? paperNameIdx : 3;
    const maxIdx = maxMarksIdx !== -1 ? maxMarksIdx : 4;
    const intIdx = internalMarksIdx !== -1 ? internalMarksIdx : 5;

    console.log("[portal:internals] Parsing marks table with indexes:", { codeIdx, nameIdx, maxIdx, intIdx, headers });

    // Skip the header row and map rows
    $table.find("tr").slice(1).each((_ri, row) => {
      const cells = $(row).find("td, th").map((_j, cell) => $(cell).text().trim()).get();
      
      if (cells.length > Math.max(codeIdx, nameIdx, maxIdx, intIdx)) {
        const paperCode = cells[codeIdx];
        const paperName = cells[nameIdx];
        const maxMarksRaw = cells[maxIdx];
        const internalMarksRaw = cells[intIdx];
        
        // Match paper codes (alphanumeric) and numeric max marks
        if (/^[A-Z0-9\-\s]+$/i.test(paperCode) && /^\d+$/.test(maxMarksRaw)) {
          const maxMarks = parseInt(maxMarksRaw, 10);
          const internalMarks = /^\d+$/.test(internalMarksRaw) ? parseInt(internalMarksRaw, 10) : internalMarksRaw;
          
          subjects.push({
            paperCode,
            paperName,
            maxMarks,
            internalMarks,
          });
        }
      }
    });
  });
  
  return subjects;
}

function formatResult(defaultEnrollment, $, semester, subjects) {
  let studentName = "";
  let enrollmentNo = defaultEnrollment || "";
  let collegeName = "";
  let course = "";

  const pageText = $.text();
  const nameMatch = pageText.match(/(?:Student Name|Name)\s*:\s*([^:\n\r\t]+)/i);
  if (nameMatch) {
    studentName = nameMatch[1].trim();
  }
  const enrollmentMatch = pageText.match(/(?:Enrollment|Roll Number|Roll No)\s*:\s*(\d+)/i);
  if (enrollmentMatch) {
    enrollmentNo = enrollmentMatch[1].trim();
  }
  const collegeMatch = pageText.match(/(?:College|Institute|Institute Name|College Name)\s*:\s*([^:\n\r\t]+)/i);
  if (collegeMatch) {
    collegeName = collegeMatch[1].trim();
  }
  const courseMatch = pageText.match(/(?:Programme|Program|Course|Branch)\s*:\s*([^:\n\r\t]+)/i);
  if (courseMatch) {
    course = courseMatch[1].trim();
  }

  return {
    enrollmentNo,
    studentName: studentName || "Student",
    collegeName: collegeName || "N/A",
    course: course || "N/A",
    semester: parseInt(semester, 10) || semester,
    subjects,
  };
}
