import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const boundariesPath = path.resolve(__dirname, "../data/gradeBoundaries.json");
const creditsPath = path.resolve(__dirname, "../data/paperCredits.json");

let boundaries = [];
try {
  boundaries = JSON.parse(fs.readFileSync(boundariesPath, "utf8"));
} catch (err) {
  console.warn("[sgpaEngine] Failed to load gradeBoundaries.json, using static fallbacks.", err.message);
  boundaries = [
    { "min": 90, "max": 100, "grade": "O", "gp": 10 },
    { "min": 75, "max": 89, "grade": "A+", "gp": 9 },
    { "min": 65, "max": 74, "grade": "A", "gp": 8 },
    { "min": 55, "max": 64, "grade": "B+", "gp": 7 },
    { "min": 50, "max": 54, "grade": "B", "gp": 6 },
    { "min": 45, "max": 49, "grade": "C", "gp": 5 },
    { "min": 40, "max": 44, "grade": "P", "gp": 4 },
    { "min": 0, "max": 39, "grade": "F", "gp": 0 }
  ];
}

let paperCredits = {};
try {
  paperCredits = JSON.parse(fs.readFileSync(creditsPath, "utf8"));
} catch (err) {
  console.warn("[sgpaEngine] Failed to load paperCredits.json:", err.message);
}

const KNOWN_TWO_LETTER_PREFIXES = [...new Set(
  Object.keys(paperCredits).map(k => k.split("-")[0]).filter(p => p.length === 2)
)];

export function calculateGradePoint(totalMarks) {
  const marks = Math.round(Number(totalMarks));
  if (isNaN(marks)) return 0;
  
  const match = boundaries.find(b => marks >= b.min && marks <= b.max);
  return match ? match.gp : 0;
}

export function gradePointFromGrade(grade) {
  const normalized = String(grade || "").trim().toUpperCase();
  const points = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
    P: 4,
    F: 0,
    ABSENT: 0,
    AB: 0
  };

  return points[normalized];
}

export function getGradeDetails(totalMarks) {
  const marks = Math.round(Number(totalMarks));
  if (isNaN(marks)) return { grade: "-", gp: 0 };
  
  const match = boundaries.find(b => marks >= b.min && marks <= b.max);
  return match ? { grade: match.grade, gp: match.gp } : { grade: "F", gp: 0 };
}

function normalizePaperCode(code) {
  const raw = String(code || "").trim().toUpperCase();
  const parts = raw.split(/[\/,;&]+/).map(part => part.trim()).filter(Boolean);
  const candidates = parts.length ? parts : [raw];

  for (const candidate of candidates) {
    if (paperCredits[candidate] !== undefined) return candidate;

    const compact = candidate.replace(/[^A-Z0-9]/g, "");
    if (paperCredits[compact] !== undefined) return compact;

    const dashed = compact.replace(/^([A-Z]+)(\d+[A-Z]?)$/, "$1-$2");
    if (paperCredits[dashed] !== undefined) return dashed;

    const singleLetterMatch = compact.match(/^([A-Z])(\d)(\d{3})$/);
    if (singleLetterMatch) {
      const letter = singleLetterMatch[1];
      const number = singleLetterMatch[3];
      for (const prefix of KNOWN_TWO_LETTER_PREFIXES) {
        if (prefix[0] === letter) {
          const tryCode = `${prefix}-${number}`;
          if (paperCredits[tryCode] !== undefined) return tryCode;
        }
      }
    }

    const baseCode = compact.replace(/^([A-Z]+)(\d+)[TP]$/, "$1$2");
    const baseDashed = baseCode.replace(/^([A-Z]+)(\d+)$/, "$1-$2");
    if (paperCredits[baseDashed] !== undefined) return baseDashed;
  }

  return raw;
}

export function getPaperCredits(paperCode, parsedCredits, subjectName = "") {
  const code = normalizePaperCode(paperCode);
  if (paperCredits[code] !== undefined) {
    return paperCredits[code];
  }
  
  const creditsNum = Number(parsedCredits);
  if (Number.isFinite(creditsNum) && creditsNum > 0) {
    console.warn(`[sgpaEngine] Credits for "${paperCode}" (normalized: "${code}") not in paperCredits.json. Using parsed value: ${creditsNum}`);
    return creditsNum;
  }
  
  const name = `${subjectName} ${code}`.toLowerCase();
  if (name.includes("lab") || name.includes("practical") || name.includes("viva") || name.includes("workshop")) {
    console.warn(`[sgpaEngine] Credits for "${paperCode}" (normalized: "${code}") not in paperCredits.json. Using heuristic: 1 (lab/practical/workshop)`);
    return 1;
  }
  if (name.includes("ethics") || name.includes("values") || code.startsWith("HS")) {
    console.warn(`[sgpaEngine] Credits for "${paperCode}" (normalized: "${code}") not in paperCredits.json. Using heuristic: 2 (ethics/values)`);
    return 2;
  }
  console.warn(`[sgpaEngine] Credits for "${paperCode}" (normalized: "${code}") not in paperCredits.json. Using heuristic: 4 (default)`);
  return 4;
}

export function calculateSGPA(subjectsList = []) {
  let creditTotal = 0;
  let weightedPoints = 0;
  
  const subjectBreakdown = subjectsList.map(sub => {
    const paperCode = String(sub.paperCode || sub.code || "").trim();
    const subjectName = String(sub.subjectName || sub.name || "").trim();
    
    let internal = null;
    if (sub.internalMarks !== undefined) {
      internal = sub.internalMarks;
    } else if (sub.internal !== undefined && sub.internal !== "-") {
      internal = Number(sub.internal);
    }
    
    let external = null;
    if (sub.externalMarks !== undefined) {
      external = sub.externalMarks;
    } else if (sub.external !== undefined && sub.external !== "-") {
      external = Number(sub.external);
    }
    
    let total = null;
    if (sub.totalMarks !== undefined) {
      total = sub.totalMarks;
    } else if (sub.total !== undefined && sub.total !== "-") {
      total = Number(sub.total);
    }
    
    if (total === null && internal !== null && external !== null) {
      total = internal + external;
    }
    
    const officialGrade = String(sub.grade || "").trim();
    const officialGp = gradePointFromGrade(officialGrade);
    const gradeDetails = officialGp !== undefined
      ? { grade: officialGrade.toUpperCase(), gp: officialGp }
      : getGradeDetails(total);
    const { grade, gp } = gradeDetails;
    const credits = getPaperCredits(paperCode, sub.credits || sub.credit, subjectName);
    
    creditTotal += credits;
    weightedPoints += (credits * gp);
    
    return {
      paperCode,
      subjectName,
      credits,
      internalMarks: internal !== null ? internal : 0,
      externalMarks: external !== null ? external : 0,
      totalMarks: total !== null ? total : 0,
      grade,
      gradePoint: gp,
      creditGPProduct: credits * gp
    };
  });
  
  const sgpaValue = creditTotal > 0 ? weightedPoints / creditTotal : 0;
  const sgpa = Number(sgpaValue.toFixed(2));
  
  return {
    sgpa,
    creditTotal,
    weightedPoints: Number(weightedPoints.toFixed(2)),
    subjectBreakdown
  };
}

export function calculateCGPA(semestersList = []) {
  let creditTotal = 0;
  let pointsTotal = 0;
  
  semestersList.forEach(sem => {
    const credits = Number(
      sem.creditTotal || sem.summary?.totalCredits || sem.summary?.sgpaEngine?.creditTotal || 0
    );
    const weightedPoints = Number(
      sem.weightedPoints ||
      sem.summary?.weightedPoints ||
      sem.summary?.sgpaEngine?.weightedPoints ||
      0
    );
    
    if (credits > 0) {
      creditTotal += credits;
      pointsTotal += weightedPoints;
    }
  });
  
  const cgpaValue = creditTotal > 0 ? pointsTotal / creditTotal : 0;
  const cgpa = Number(cgpaValue.toFixed(2));
  
  return {
    cgpa,
    creditTotal,
    percentage: Number((cgpa * 10).toFixed(1))
  };
}
