import fs from "node:fs";
import path from "node:path";
import { PDFParse } from "pdf-parse";

const PDF_PATH = process.argv[2];
if (!PDF_PATH) {
  console.error("Usage: node extractCredits.js <path-to-pdf>");
  process.exit(1);
}

const fullPath = path.resolve(PDF_PATH);
if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

const SUBJECT_CODE_RE = /\b[A-Z]{2,5}[-/]?\d{3,4}\b/;
const CREDIT_RE = /\b([1-5])\b/;

function isCreditLine(line) {
  const codeMatch = line.match(SUBJECT_CODE_RE);
  if (!codeMatch) return false;
  const numbers = line.match(CREDIT_RE);
  return !!numbers;
}

function extractPairs(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const pairs = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const codeMatch = line.match(SUBJECT_CODE_RE);
    if (!codeMatch) continue;

    const code = codeMatch[0].toUpperCase();
    const creditMatch = line.match(CREDIT_RE);
    let credits = creditMatch ? parseInt(creditMatch[1], 10) : null;

    if (!credits && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      const nextCreditMatch = nextLine.match(CREDIT_RE);
      if (nextCreditMatch) {
        credits = parseInt(nextCreditMatch[1], 10);
      }
    }

    if (credits && credits > 0 && credits <= 5) {
      pairs[code] = credits;
    }
  }

  return pairs;
}

async function main() {
  const buffer = fs.readFileSync(fullPath);
  const data = await pdf(buffer);
  const credits = extractPairs(data.text);

  const outPath = path.resolve("server/data/paperCredits.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(credits, null, 2));

  console.log(`Extracted ${Object.keys(credits).length} subject credits:`);
  console.log(JSON.stringify(credits, null, 2));
  console.log(`\nSaved to: ${outPath}`);
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
