import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_PATH = path.resolve(__dirname, "../../syllabus btech.pdf");
const OUTPUT_PATH = path.resolve(__dirname, "../data/paperCredits.json");
const DEBUG = process.argv.includes("--debug");

async function extractCredits() {
  let pdfParse;
  try {
    const mod = await import("pdf-parse");
    pdfParse = mod.default?.default || mod.default || mod;
    if (typeof pdfParse !== "function") throw new Error("not a function");
  } catch {
    console.error("Error: 'pdf-parse' package not found.");
    console.error("Run: npm install pdf-parse");
    process.exit(1);
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`Error: PDF not found at ${PDF_PATH}`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  const data = await pdfParse(buffer);
  const text = data.text;

  if (DEBUG) {
    const debugPath = path.resolve(__dirname, "../data/pdfDebug.txt");
    fs.writeFileSync(debugPath, text);
    console.log(`Debug: raw PDF text written to ${debugPath}`);
    console.log(`Total pages: ${data.numpages}`);
    console.log(`Text length: ${text.length} chars`);
    console.log("\n--- First 3000 chars of extracted text ---\n");
    console.log(text.substring(0, 3000));
    console.log("\n--- End of preview ---\n");
  }

  const credits = {};
  const seen = new Set();

  function addCode(code, credit) {
    const normalized = code.replace(/\s+/g, "-").toUpperCase();
    if (credit >= 1 && credit <= 6 && !seen.has(normalized)) {
      credits[normalized] = credit;
      seen.add(normalized);
    }
  }

  // Pattern 1: "Subject Code: XX-NNN ... Credits: N"
  const blockRegex = /(?:Subject|Paper)\s*(?:Code|No\.?)\s*[:;\-=\s]*([A-Z]{1,4}[-\s]?\d{2,4})[\s\S]*?(?:Credits?|Credit\s*Hours?|L-T-P|L\s*[-–]\s*T\s*[-–]\s*P)\s*[:;\-=\s]*(\d)/gi;
  let match;
  while ((match = blockRegex.exec(text)) !== null) {
    addCode(match[1], parseInt(match[2], 10));
  }

  // Pattern 2: "XX-NNN ... (N Credits)" or "XX-NNN ... [N Cr]"
  const inlineRegex = /\b([A-Z]{1,4}[-]?\d{2,4})\b[\s\S]{0,80}?\((\d)\s*(?:Credits?|Cr\.?)\)/gi;
  while ((match = inlineRegex.exec(text)) !== null) {
    addCode(match[1], parseInt(match[2], 10));
  }

  // Pattern 3: Table-style rows with pipe separators
  // "BS-103 | Applied Chemistry | 3 | 4" or "BS-103  Applied Chemistry  3-0-0  3"
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    // Pipe-separated: Code | Name | Something | Credits
    const pipeMatch = trimmed.match(/^([A-Z]{1,4}[-]?\d{2,4})\s*[\|]\s*.+?\s*[\|]\s*.+?\s*[\|]\s*(\d)\s*$/);
    if (pipeMatch) {
      addCode(pipeMatch[1], parseInt(pipeMatch[2], 10));
      continue;
    }

    // Tab/space-separated table row: code  name  l-t-p  credits
    const spaceMatch = trimmed.match(/^([A-Z]{1,4}[-]?\d{2,4})\s{2,}[A-Za-z].+?\s{2,}\d[-–]\d[-–]\d\s{2,}(\d)\s*$/);
    if (spaceMatch) {
      addCode(spaceMatch[1], parseInt(spaceMatch[2], 10));
      continue;
    }

    // Flexible spacing: "BS-103  Applied Chemistry  3  3" (code ... something ... number ... credits)
    const flexMatch = trimmed.match(/^([A-Z]{1,4}[-]?\d{2,4})\s+[A-Za-z].+?\s+(\d)\s*$/);
    if (flexMatch) {
      const lastNum = parseInt(flexMatch[2], 10);
      if (lastNum >= 1 && lastNum <= 6) {
        addCode(flexMatch[1], lastNum);
      }
    }
  }

  // Pattern 4: L-T-P near subject code
  // "BS-103 ... 3-0-0 ... 3" or "BS-103 ... 3 – 0 – 0 ... 3"
  const ltpRegex = /\b([A-Z]{1,4}[-]?\d{2,4})\b[\s\S]{0,100}?(\d)\s*[-–]\s*(\d)\s*[-–]\s*(\d)[\s\S]{0,50}?(\d)\b/g;
  while ((match = ltpRegex.exec(text)) !== null) {
    addCode(match[1], parseInt(match[5], 10));
  }

  // Pattern 5: "Credits: N" near a subject code (within 300 chars)
  const allCodes = [...text.matchAll(/\b([A-Z]{1,4}[-]?\d{2,4})\b/g)].map(m => ({
    code: m[1],
    index: m.index,
  }));

  const allCredits = [...text.matchAll(/\bCredits?\s*[:;\-=\s]*(\d)/gi)].map(m => ({
    credit: parseInt(m[1], 10),
    index: m.index,
  }));

  for (const codeEntry of allCodes) {
    if (seen.has(codeEntry.code.replace(/\s+/g, "-").toUpperCase())) continue;
    const nearestCredit = allCredits.find(
      c => c.credit >= 1 && c.credit <= 6 && Math.abs(c.index - codeEntry.index) < 300
    );
    if (nearestCredit) {
      addCode(codeEntry.code, nearestCredit.credit);
    }
  }

  // Pattern 6: Find any "XX-NNN" that hasn't been matched yet, look for a standalone
  // digit 1-6 within 150 chars after it
  const remainingCodes = [...text.matchAll(/\b([A-Z]{1,4}[-]?\d{2,4})\b/g)].map(m => ({
    code: m[1],
    index: m.index,
  }));

  for (const codeEntry of remainingCodes) {
    if (seen.has(codeEntry.code.replace(/\s+/g, "-").toUpperCase())) continue;
    const afterText = text.substring(codeEntry.index, codeEntry.index + 150);
    // Look for a standalone digit 1-6 (likely credits) near the end of the snippet
    const creditMatch = afterText.match(/\b([1-6])\b\s*$/m);
    if (creditMatch) {
      addCode(codeEntry.code, parseInt(creditMatch[1], 10));
    }
  }

  // Sort keys and write output
  const sorted = Object.fromEntries(
    Object.entries(credits).sort(([a], [b]) => a.localeCompare(b))
  );

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2) + "\n");

  const count = Object.keys(sorted).length;
  console.log(`Extracted ${count} paper codes with credits.`);
  console.log(`Output written to: ${OUTPUT_PATH}`);

  if (DEBUG) {
    console.log("\n--- Extracted codes ---");
    for (const [code, credit] of Object.entries(sorted)) {
      console.log(`  ${code}: ${credit}`);
    }
  }
}

extractCredits().catch((err) => {
  console.error("Extraction failed:", err.message);
  process.exit(1);
});
