import assert from "node:assert";
import { calculateGradePoint, calculateSGPA, calculateCGPA, getPaperCredits } from "../services/sgpaEngine.js";

console.log("================================================");
console.log("Running SGPA Calculation Engine Unit Tests...");
console.log("================================================");

// 1. Test Grade Point Mapping
try {
  assert.strictEqual(calculateGradePoint(95), 10, "95 should map to 10 GP");
  assert.strictEqual(calculateGradePoint(90), 10, "90 should map to 10 GP");
  assert.strictEqual(calculateGradePoint(85), 9, "85 should map to 9 GP");
  assert.strictEqual(calculateGradePoint(75), 9, "75 should map to 9 GP");
  assert.strictEqual(calculateGradePoint(74), 8, "74 should map to 8 GP");
  assert.strictEqual(calculateGradePoint(65), 8, "65 should map to 8 GP");
  assert.strictEqual(calculateGradePoint(64), 7, "64 should map to 7 GP");
  assert.strictEqual(calculateGradePoint(55), 7, "55 should map to 7 GP");
  assert.strictEqual(calculateGradePoint(54), 6, "54 should map to 6 GP");
  assert.strictEqual(calculateGradePoint(50), 6, "50 should map to 6 GP");
  assert.strictEqual(calculateGradePoint(47), 5, "47 should map to 5 GP");
  assert.strictEqual(calculateGradePoint(42), 4, "42 should map to 4 GP");
  assert.strictEqual(calculateGradePoint(35), 0, "35 should map to 0 GP");
  console.log("✓ 1. Grade Point Mapping tests passed.");
} catch (err) {
  console.error("✗ 1. Grade Point Mapping tests failed:", err.message);
  process.exit(1);
}

// 2. Test SGPA calculation (First Semester)
// paperCredits.json: BS-103=3, BS-105=3, ES-107=3, BS-151=1, ES-157=2
// BS101, HS119, BS153 not in paperCredits → fallback to parsed credits
// Total credits: 3+3+3+4+2+1+1+2 = 19
// Total points: 30+27+30+36+20+9+9+14 = 175. SGPA = 175 / 19 = 9.2105 -> 9.21
const sem1Subjects = [
  { code: "BS103", name: "APPLIED CHEMISTRY", credits: 3, total: 92 }, // GP 10, Points 30
  { code: "BS105", name: "APPLIED PHYSICS - I", credits: 3, total: 85 }, // GP 9, Points 27
  { code: "ES107", name: "ELECTRICAL SCIENCE", credits: 3, total: 91 }, // GP 10, Points 30
  { code: "BS101", name: "APPLIED MATHEMATICS - I", credits: 4, total: 80 }, // GP 9, Points 36
  { code: "HS119", name: "PROFESSIONAL ETHICS", credits: 2, total: 95 }, // GP 10, Points 20
  { code: "BS151", name: "PHYSICS LAB", credits: 1, total: 82 }, // GP 9, Points 9
  { code: "BS153", name: "CHEMISTRY LAB", credits: 1, total: 78 }, // GP 9, Points 9
  { code: "ES157", name: "ELECTRICAL LAB", credits: 2, total: 55 } // GP 7, Points 14
];

try {
  const result = calculateSGPA(sem1Subjects);
  assert.strictEqual(result.creditTotal, 19, "Total credits should be 19");
  assert.strictEqual(result.weightedPoints, 175, "Total weighted points should be 175");
  assert.strictEqual(result.sgpa, 9.21, "SGPA should be 9.21");
  console.log("✓ 2. SGPA calculation tests passed.");
} catch (err) {
  console.error("✗ 2. SGPA calculation tests failed:", err.message);
  process.exit(1);
}

// 3. Test CGPA calculation (Multiple Semesters)
// Semester 1: SGPA 9.21, Credits 19
// Semester 2: SGPA 8.50, Credits 24
// CGPA = ((9.21 * 19) + (8.50 * 24)) / (19 + 24) = (174.99 + 204) / 43 = 378.99 / 43 = 8.8137 -> 8.81
const semesters = [
  { sgpa: 9.21, creditTotal: 19 },
  { sgpa: 8.50, creditTotal: 24 }
];

try {
  const result = calculateCGPA(semesters);
  assert.strictEqual(result.creditTotal, 43, "Total credits should be 43");
  assert.strictEqual(result.cgpa, 8.81, "CGPA should be 8.81");
  assert.strictEqual(result.percentage, 88.1, "Percentage should be 88.1%");
  console.log("✓ 3. CGPA calculation tests passed.");
} catch (err) {
  console.error("✗ 3. CGPA calculation tests failed:", err.message);
  process.exit(1);
}

// 4. Official grades must win over marks-derived grades.
try {
  const result = calculateSGPA([
    { code: "BS101", name: "APPLIED MATHEMATICS - I", credits: 4, total: 42, grade: "F" },
    { code: "BS103", name: "APPLIED CHEMISTRY", credits: 3, total: 90, grade: "O" }
  ]);

  assert.strictEqual(result.subjectBreakdown[0].gradePoint, 0, "Official F grade should map to 0 GP even if marks are 42");
  assert.strictEqual(result.weightedPoints, 30, "Only the passed paper should contribute weighted grade points");
  assert.strictEqual(result.sgpa, 4.29, "SGPA should use official grade points");
  console.log("OK 4. Official grade override tests passed.");
} catch (err) {
  console.error("FAIL 4. Official grade override tests failed:", err.message);
  process.exit(1);
}

// 5. Credit lookup should normalize common portal code formats and use subject-name fallbacks.
try {
  assert.strictEqual(getPaperCredits("BS103"), 3, "BS103 should match BS-103 in paperCredits.json");
  assert.strictEqual(getPaperCredits("ES-107 / ES-108"), 3, "Slash-separated paper codes should match either listed code");
  assert.strictEqual(getPaperCredits("UNKNOWN153", undefined, "Applied Chemistry Lab"), 1, "Unknown lab papers should fall back to 1 credit");
  console.log("OK 5. Credit lookup tests passed.");
} catch (err) {
  console.error("FAIL 5. Credit lookup tests failed:", err.message);
  process.exit(1);
}

console.log("================================================");
console.log("All SGPA Engine Unit Tests Completed Successfully!");
console.log("================================================");
