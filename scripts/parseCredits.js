import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const textPath = path.resolve(__dirname, "../syllabus_text.txt");
const outPath = path.resolve(__dirname, "../server/data/paperCredits.json");

const text = fs.readFileSync(textPath, "utf8");
const lines = text.split("\n");

const credits = {};

function addCredit(code, val, sourceLine) {
  const cleaned = code.replace(/\s+/g, "").toUpperCase();
  if (!credits[cleaned]) {
    credits[cleaned] = val;
    if (/^[A-Z]-\d{3}$/.test(cleaned)) {
      console.log(`SUSPICIOUS: "${cleaned}" = ${val} from line ${sourceLine}: "${lines[sourceLine]?.trim()}"`);
    }
  }
}

function extractCodes(str) {
  const results = [];
  // Only match at start of string or after space/digit
  const re = /(?:^|[\s(])([A-Z]{2,4})\s*[-–]\s*(\d{3})\b/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    results.push(`${m[1]}-${m[2]}`);
  }
  return results;
}

let tableType = null;
let lineNum = 0;

for (lineNum = 0; lineNum < lines.length; lineNum++) {
  const line = lines[lineNum];
  const trimmed = line.trim();
  
  if (/Group\s+Code\s+Paper\s+L\s+P\s+Credits/.test(line) ||
      /Group\s+Paper\s+Code\s+Paper.*L\s+P\s+Credits/.test(line) ||
      /Semester.*Paper.*Group.*Code.*L.*P.*Credits/.test(line) ||
      /Group\s+Paper\s+Code\s+L\s+P\s+Credits/.test(line) ||
      /Group\s+Paper\s+L\s+P\s+Credits/.test(line)) {
    tableType = "3col";
    continue;
  }
  
  if (line.includes("---PAGE BREAK---")) {
    tableType = null;
    continue;
  }
  
  if (!tableType || !trimmed) continue;
  
  if (/^(Group|Theory|Practical|Total|\*|#|NSS|OR|Paper|Semester|Note|The |Teachers|In the |If a |The papers|The medium|The Paper|The attendance|The mid|%|By |Emerging|Open |Bridge|Applicable)/.test(trimmed)) continue;
  if (/^[ivx]+\./i.test(trimmed)) continue;
  if (/^\(\w\)/.test(trimmed)) continue;
  
  const codes = extractCodes(trimmed);
  if (codes.length === 0) continue;

  const parts = trimmed.split(/\s+/);
  const endNums = [];
  for (let j = parts.length - 1; j >= 0; j--) {
    const p = parts[j].replace(/[*#]/g, "");
    const n = parseInt(p, 10);
    if (!isNaN(n) && n >= 0) {
      endNums.unshift(n);
    } else if (p !== "-" && p !== "" && p !== "–") {
      break;
    }
  }
  
  if (endNums.length === 0) continue;
  
  let creditVal = null;
  
  if (endNums.length === 1) {
    creditVal = endNums[0];
  } else if (endNums.length === 2) {
    const hasStandaloneDash = /(?:\s|^)-(?:\s|$)/.test(trimmed);
    if (hasStandaloneDash) {
      creditVal = endNums[1];
    } else if (endNums[0] <= 6) {
      creditVal = endNums[1];
    }
  } else if (endNums.length >= 3) {
    creditVal = endNums[endNums.length - 1];
  }
  
  if (creditVal !== null && creditVal >= 1 && creditVal <= 25) {
    for (const code of codes) {
      addCredit(code, creditVal, lineNum);
    }
  }
}

// Eighth semester
for (let i = 2229; i <= 2243; i++) {
  const m = lines[i].trim().match(/(E?S-45[2468])\b.*?(\d+)\s*$/);
  if (m) addCredit(m[1], parseInt(m[2], 10), i);
}

// Manual entries
const manual = {
  "BS-103": 3, "BS-121": 3, "BS-109": 3, "BS-155": 1, "BS-161": 1,
  "BS-104": 3, "BS-120": 3, "BS-110": 3, "BS-156": 1, "BS-162": 1,
};
for (const [k, v] of Object.entries(manual)) addCredit(k, v, "manual");

addCredit("BC-181", 3, "manual"); addCredit("BC-183", 3, "manual");

delete credits["ES-164"];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
const sorted = Object.fromEntries(
  Object.entries(credits).sort((a, b) => a[0].localeCompare(b[0]))
);
fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2), "utf8");
console.log(`\nGenerated ${outPath} with ${Object.keys(sorted).length} entries.`);
