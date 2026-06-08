import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, "..", "data", "internals.pdf");
const outputPath = path.join(__dirname, "..", "data", "internals.json");

async function parseInternals() {
  console.log("Reading PDF...");
  const buf = fs.readFileSync(pdfPath);

  console.log("Parsing PDF text (this may take a while for large files)...");
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const text = result.text;
  console.log(`Extracted ${text.length} characters from ${result.total} pages.`);

  const lines = text.split("\n");
  const students = [];
  let currentStudent = null;

  const enrollmentPattern = /Enrollment\s*:\s*(\d+)\s+Student Name\s*:\s*(.+)/i;
  const subjectPattern = /([A-Z][A-Z\s]+\d{3})\((\d+|AB|C|D|RL)\)/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const enrollMatch = line.match(enrollmentPattern);
    if (enrollMatch) {
      if (currentStudent && currentStudent.subjects.length > 0) {
        students.push(currentStudent);
      }

      currentStudent = {
        enrollment: enrollMatch[1],
        name: enrollMatch[2].trim(),
        subjects: [],
      };
      continue;
    }

    if (currentStudent) {
      let match;
      subjectPattern.lastIndex = 0;
      while ((match = subjectPattern.exec(line)) !== null) {
        const subjectCode = match[1].trim();
        const rawMarks = match[2];

        let internal = null;
        if (/^\d+$/.test(rawMarks)) {
          internal = parseInt(rawMarks, 10);
        }

        currentStudent.subjects.push({
          subject: subjectCode,
          internal: internal,
          status: /^\d+$/.test(rawMarks) ? null : rawMarks,
        });
      }
    }
  }

  if (currentStudent && currentStudent.subjects.length > 0) {
    students.push(currentStudent);
  }

  console.log(`Parsed ${students.length} students.`);
  fs.writeFileSync(outputPath, JSON.stringify(students, null, 2));
  console.log(`Saved to ${outputPath}`);
}

parseInternals().catch((err) => {
  console.error("Failed to parse internals:", err);
  process.exit(1);
});
