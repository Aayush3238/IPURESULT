import * as cheerio from "cheerio";
import { detectPortalFailure } from "./resultParser.js";

function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseProfileHtml(html, fallbackEnrollment) {
  const $ = cheerio.load(html || "");

  // Check for session/portal failures first
  const failure = detectPortalFailure(html, false);
  if (failure) throw failure;

  const data = {
    studentName: "",
    enrollmentNo: "",
    batch: "",
    admissionYear: "",
    fatherName: "",
    motherName: "",
    gender: "",
    email: "",
    contactNumber: "",
    institute: "",
    program: "",
    photoUrl: "",
  };

  try {
    const rawJsonText = $("#data").text().trim();
    if (rawJsonText) {
      const parsedArray = JSON.parse(rawJsonText);
      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        const p = parsedArray[0];

        data.studentName = cleanText(p.stname);
        data.enrollmentNo = cleanText(p.nrollno);
        data.batch = p.byoa ? String(p.byoa).trim() : "";
        data.admissionYear = p.yoa ? String(p.yoa).trim() : "";
        data.fatherName = cleanText(p.father);
        data.motherName = cleanText(p.mother);
        data.gender = cleanText(p.gender);
        data.email = cleanText(p.email);
        data.contactNumber = cleanText(p.mobno);
        data.institute = cleanText(p.iname);
        data.program = cleanText(p.prgname);

        if (p.stimage) {
          const cleanImage = String(p.stimage).replace(/\s+/g, "");
          if (cleanImage.startsWith("data:")) {
            data.photoUrl = cleanImage;
          } else {
            data.photoUrl = `data:image/jpeg;base64,${cleanImage}`;
          }
        }
      }
    }
  } catch (err) {
    console.error("[profileParser] Error parsing JSON from #data div:", err);
  }

  // Fallback enrollment if not found in parser
  if (!data.enrollmentNo && fallbackEnrollment) {
    data.enrollmentNo = fallbackEnrollment;
  }

  return data;
}
