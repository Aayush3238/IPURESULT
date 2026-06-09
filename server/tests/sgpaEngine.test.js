import assert from "node:assert";
import { calculateGradePoint, calculateSGPA, calculateCGPA } from "../services/sgpaEngine.js";

console.log("================================================");
console.log("Running SGPA Calculation Engine Unit Tests...");
console.log("================================================");

// 1. Test Grade Point Mapping
try {
  assert.strictEqual(calculateGradePoint(95), 10, "95 should map to 10 GP");
  assert.strictEqual(calculateGradePoint(90), 10, "90 should map to 10 GP");
  assert.strictEqual(calculateGradePoint(85), 9, "85 should map to 9 GP");
  assert.strictEqual(calculateGradePoint(80), 9, "80 should map to 9 GP");
  assert.strictEqual(calculateGradePoint(75), 8, "75 should map to 8 GP");
  assert.strictEqual(calculateGradePoint(70), 8, "70 should map to 8 GP");
  assert.strictEqual(calculateGradePoint(65), 7, "65 should map to 7 GP");
  assert.strictEqual(calculateGradePoint(60), 7, "60 should map to 7 GP");
  assert.strictEqual(calculateGradePoint(55), 6, "55 should map to 6 GP");
  assert.strictEqual(calculateGradePoint(50), 6, "50 should map to 6 GP");
  assert.strictEqual(calculateGradePoint(47), 5, "47 should map to 5 GP");
  assert.strictEqual(calculateGradePoint(42), 4, "42 should map to 4 GP");
  assert.strictEqual(calculateGradePoint(35), 0, "35 should map to 0 GP");
  console.log("✓ 1. Grade Point Mapping tests passed.");
} catch (err) {
  console.error("✗ 1. Grade Point Mapping tests failed:", err.message);
  process.exit(1);
}

// 2. Test SGPA calculation (First Semester matching 9.29 SGPA)
// Total credits: 21, Total points: 195. SGPA = 195 / 21 = 9.2857 -> 9.29
const sem1Subjects = [
  { code: "BS103", name: "APPLIED CHEMISTRY", credits: 4, total: 92 }, // GP 10, Points 48
  { code: "BS105", name: "APPLIED PHYSICS - I", credits: 4, total: 85 }, // GP 9, Points 36
  { code: "ES107", name: "ELECTRICAL SCIENCE", credits: 4, total: 91 }, // GP 10, Points 48
  { code: "BS101", name: "APPLIED MATHEMATICS - I", credits: 4, total: 80 }, // GP 9, Points 36
  { code: "HS119", name: "PROFESSIONAL ETHICS", credits: 2, total: 95 }, // GP 10, Points 20
  { code: "BS151", name: "PHYSICS LAB", credits: 1, total: 82 }, // GP 9, Points 9
  { code: "BS153", name: "CHEMISTRY LAB", credits: 1, total: 78 }, // GP 8, Points 8
  { code: "ES157", name: "ELECTRICAL LAB", credits: 1, total: 55 } // GP 6, Points 6
];

try {
  const result = calculateSGPA(sem1Subjects);
  assert.strictEqual(result.creditTotal, 21, "Total credits should be 21");
  assert.strictEqual(result.weightedPoints, 195, "Total weighted points should be 195");
  assert.strictEqual(result.sgpa, 9.29, "SGPA should be 9.29");
  console.log("✓ 2. SGPA calculation tests passed.");
} catch (err) {
  console.error("✗ 2. SGPA calculation tests failed:", err.message);
  process.exit(1);
}

// 3. Test CGPA calculation (Multiple Semesters)
// Semester 1: SGPA 9.29, Credits 21
// Semester 2: SGPA 8.50, Credits 24
// CGPA = ((9.29 * 21) + (8.50 * 24)) / (21 + 24) = (195.09 + 204) / 45 = 399.09 / 45 = 8.8686 -> 8.87
const semesters = [
  { sgpa: 9.29, creditTotal: 21 },
  { sgpa: 8.50, creditTotal: 24 }
];

try {
  const result = calculateCGPA(semesters);
  assert.strictEqual(result.creditTotal, 45, "Total credits should be 45");
  assert.strictEqual(result.cgpa, 8.87, "CGPA should be 8.87");
  assert.strictEqual(result.percentage, 88.7, "Percentage should be 88.7%");
  console.log("✓ 3. CGPA calculation tests passed.");
} catch (err) {
  console.error("✗ 3. CGPA calculation tests failed:", err.message);
  process.exit(1);
}

console.log("================================================");
console.log("All SGPA Engine Unit Tests Completed Successfully!");
console.log("================================================");
