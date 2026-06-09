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
    { "min": 80, "max": 89, "grade": "A+", "gp": 9 },
    { "min": 70, "max": 79, "grade": "A", "gp": 8 },
    { "min": 60, "max": 69, "grade": "B+", "gp": 7 },
    { "min": 50, "max": 59, "grade": "B", "gp": 6 },
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

export function calculateGradePoint(totalMarks) {
  const marks = Math.round(Number(totalMarks));
  if (isNaN(marks)) return 0;
  
  const match = boundaries.find(b => marks >= b.min && marks <= b.max);
  return match ? match.gp : 0;
}

export function getGradeDetails(totalMarks) {
  const marks = Math.round(Number(totalMarks));
  if (isNaN(marks)) return { grade: "-", gp: 0 };
  
  const match = boundaries.find(b => marks >= b.min && marks <= b.max);
  return match ? { grade: match.grade, gp: match.gp } : { grade: "F", gp: 0 };
}

export function getPaperCredits(paperCode, parsedCredits) {
  const code = String(paperCode || "").trim().toUpperCase();
  if (paperCredits[code] !== undefined) {
    return paperCredits[code];
  }
  
  const creditsNum = Number(parsedCredits);
  if (Number.isFinite(creditsNum) && creditsNum > 0) {
    return creditsNum;
  }
  
  const name = code.toLowerCase();
  if (name.includes("lab") || name.includes("practical") || name.includes("viva") || name.includes("workshop")) {
    return 1;
  }
  if (name.includes("ethics") || name.includes("values") || code.startsWith("HS")) {
    return 2;
  }
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
    
    const { grade, gp } = getGradeDetails(total);
    const credits = getPaperCredits(paperCode, sub.credits || sub.credit);
    
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
    const sgpa = Number(sem.sgpa || sem.summary?.sgpa || 0);
    const credits = Number(sem.creditTotal || sem.summary?.totalCredits || 0);
    
    if (sgpa > 0 && credits > 0) {
      creditTotal += credits;
      pointsTotal += (sgpa * credits);
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
