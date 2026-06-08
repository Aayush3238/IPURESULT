import * as cheerio from "cheerio";
import { createHttpError } from "../utils/errors.js";

const STUDENT_LABELS = {
  name: ["student name", "name"],
  enrollmentNumber: ["enrollment", "enrolment", "roll no", "roll number", "user name"],
  collegeName: ["institute", "college"],
  course: ["programme", "program", "course", "branch"],
  semester: ["semester", "sem"],
};

const SUMMARY_LABELS = {
  sgpa: ["sgpa"],
  cgpa: ["cgpa"],
  totalCredits: ["total credit", "credits"],
  status: ["result", "status"],
};

function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLabel(value) {
  return cleanText(value).replace(/[:*]/g, "").toLowerCase();
}

function findValueByLabels(fields, labels) {
  const match = fields.find(([label]) =>
    labels.some((candidate) => label.includes(candidate))
  );
  return match?.[1] || "";
}

function extractLabelValueFields($) {
  const fields = [];

  $("tr").each((_index, row) => {
    const cells = $(row)
      .children("th,td")
      .map((_cellIndex, cell) => cleanText($(cell).text()))
      .get()
      .filter(Boolean);

    for (let index = 0; index < cells.length - 1; index += 2) {
      fields.push([normalizeLabel(cells[index]), cells[index + 1]]);
    }
  });

  $("label").each((_index, label) => {
    const text = cleanText($(label).text());
    const forId = $(label).attr("for");
    const value = forId ? cleanText($(`#${forId}`).val() || $(`#${forId}`).text()) : "";
    if (text && value) {
      fields.push([normalizeLabel(text), value]);
    }
  });

  return fields;
}

function cellAt(row, candidates) {
  const exact = row.find((cell) =>
    candidates.some((candidate) => cell.header === candidate)
  );
  if (exact) return exact.value;

  const partial = row.find((cell) =>
    candidates.some((candidate) => cell.header.includes(candidate))
  );
  return partial?.value || "";
}

function extractSubjectRows($) {
  const subjects = [];

  $("table").each((_tableIndex, table) => {
    const headers = $(table)
      .find("tr")
      .first()
      .children("th,td")
      .map((_index, cell) => normalizeLabel($(cell).text()))
      .get();

    const hasSubjectHeaders = headers.some((header) => header.includes("subject")) &&
      headers.some((header) => header.includes("grade") || header.includes("marks") || header.includes("credit"));

    if (!hasSubjectHeaders) {
      return;
    }

    $(table)
      .find("tr")
      .slice(1)
      .each((_rowIndex, row) => {
        const values = $(row)
          .children("td")
          .map((_index, cell) => cleanText($(cell).text()))
          .get();

        if (values.length < 3) {
          return;
        }

        const mapped = headers.map((header, index) => ({
          header,
          value: values[index] || "",
        }));

        const code = cellAt(mapped, ["subject code", "paper code", "code"]);
        const name = cellAt(mapped, ["subject name", "paper name", "subject", "paper"]);
        const total = cellAt(mapped, ["total", "total marks"]);
        const grade = cellAt(mapped, ["grade"]);

        if (!code && !name) {
          return;
        }

        subjects.push({
          code: code || name,
          name: name || code,
          internal: cellAt(mapped, ["internal", "minor"]) || "-",
          external: cellAt(mapped, ["external", "major", "end term"]) || "-",
          total: total || "-",
          grade: grade || "-",
        });
      });
  });

  return subjects;
}

function extractGenericTables($) {
  const tables = [];

  $("table").each((_tableIndex, table) => {
    const rows = $(table)
      .find("tr")
      .map((_rowIndex, row) =>
        $(row)
          .children("th,td")
          .map((_cellIndex, cell) => cleanText($(cell).text()))
          .get()
          .filter(Boolean)
      )
      .get()
      .filter((row) => Array.isArray(row) && row.length);

    if (rows.length) {
      tables.push(rows);
    }
  });

  return tables;
}

export function detectPortalFailure(html) {
  const $ = cheerio.load(html || "");
  const text = cleanText($.text()).toLowerCase();

  if ($("#loginForm").length || $("input[name='captcha']").length) {
    if (text.includes("captcha")) {
      return createHttpError(400, "INVALID_CAPTCHA", "Invalid captcha. Refresh and try again.");
    }

    return createHttpError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid enrollment number or password."
    );
  }

  if (
    text.includes("invalid captcha") ||
    text.includes("captcha does not") ||
    text.includes("captcha validation fails") ||
    text.includes("captcha validation failed")
  ) {
    return createHttpError(400, "INVALID_CAPTCHA", "Invalid captcha. Refresh and try again.");
  }

  if (
    text.includes("invalid username") ||
    text.includes("invalid password") ||
    text.includes("invalid user") ||
    text.includes("wrong password") ||
    text.includes("login fails") ||
    text.includes("login failed") ||
    text.includes("authentication failed")
  ) {
    return createHttpError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid enrollment number or password."
    );
  }

  if (text.includes("session expired") || text.includes("session timeout")) {
    return createHttpError(440, "SESSION_EXPIRED", "Session expired. Refresh captcha and try again.");
  }

  if (text.includes("user is not authorized") || text.includes("access denied")) {
    return createHttpError(
      403,
      "PORTAL_ACCESS_DENIED",
      "The portal rejected access for this account."
    );
  }

  return null;
}

export function parseResultHtml(html, fallbackEnrollment) {
  const $ = cheerio.load(html || "");
  const fields = extractLabelValueFields($);
  const subjects = extractSubjectRows($);

  const student = Object.fromEntries(
    Object.entries(STUDENT_LABELS).map(([key, labels]) => [
      key,
      findValueByLabels(fields, labels),
    ])
  );

  const summary = Object.fromEntries(
    Object.entries(SUMMARY_LABELS).map(([key, labels]) => [
      key,
      findValueByLabels(fields, labels),
    ])
  );

  student.enrollmentNumber = student.enrollmentNumber || fallbackEnrollment;
  summary.status = summary.status || (subjects.length ? "Available" : "");

  const tables = extractGenericTables($);
  const hasStructuredResult =
    subjects.length ||
    student.name ||
    student.course ||
    summary.sgpa ||
    summary.cgpa ||
    tables.length;

  if (!hasStructuredResult) {
    throw createHttpError(
      502,
      "UNEXPECTED_HTML_STRUCTURE",
      "The portal response was received, but its result structure was not recognized."
    );
  }

  return {
    student,
    summary,
    subjects,
    rawTables: subjects.length ? undefined : tables,
  };
}
