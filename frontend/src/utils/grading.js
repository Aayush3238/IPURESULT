export function gradeFromMarks(totalMarks) {
  const marks = Math.round(Number(totalMarks));
  if (isNaN(marks)) return "-";

  if (marks >= 90) return "O";
  if (marks >= 80) return "A+";
  if (marks >= 70) return "A";
  if (marks >= 60) return "B+";
  if (marks >= 50) return "B";
  if (marks >= 45) return "C";
  if (marks >= 40) return "P";
  return "F";
}

export function gradePointFromGrade(grade) {
  const points = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
    P: 4,
    F: 0,
  };

  return points[grade] ?? 0;
}

export function estimateCredits(subjectCode, subjectName) {
  const code = String(subjectCode || "").toUpperCase();
  const name = String(subjectName || "").toLowerCase();

  if (name.includes("lab") || name.includes("practical") || name.includes("viva") || name.includes("workshop")) {
    return 1;
  }

  const match = code.match(/[A-Z]+(\d+)/);
  if (match) {
    const numStr = match[1];
    if (numStr.length === 3) {
      const middleDigit = parseInt(numStr[1], 10);
      if (middleDigit === 5 || middleDigit === 6) {
        return 1;
      }
    }
  }

  if (name.includes("technical writing") || name.includes("ethics") || name.includes("values") || code.startsWith("HS")) {
    return 2;
  }

  return 4;
}

export function getSubjectCredits(subject) {
  const credits = Number(subject?.credits ?? subject?.credit);
  if (Number.isFinite(credits) && credits > 0) return credits;
  return estimateCredits(subject?.code || subject?.paperCode, subject?.name || subject?.subjectName);
}

export function normalizeSubject(subject) {
  const code = subject?.code || subject?.paperCode || "";
  const name = subject?.name || subject?.subjectName || "";
  
  let internalVal = subject?.internal;
  if (internalVal === undefined && subject?.internalMarks !== undefined) {
    internalVal = String(subject.internalMarks);
  }
  let externalVal = subject?.external;
  if (externalVal === undefined && subject?.externalMarks !== undefined) {
    externalVal = String(subject.externalMarks);
  }
  let totalVal = subject?.total;
  if (totalVal === undefined && subject?.totalMarks !== undefined) {
    totalVal = String(subject.totalMarks);
  }

  const total = Number(totalVal);
  const internal = Number(internalVal);
  const external = Number(externalVal);
  const computedTotal =
    Number.isFinite(total)
      ? total
      : Number.isFinite(internal) && Number.isFinite(external)
        ? internal + external
        : totalVal;
  const grade = gradeFromMarks(computedTotal);
  const credits = getSubjectCredits(subject);

  return {
    ...subject,
    code,
    name,
    internal: internalVal || "-",
    external: externalVal || "-",
    total: Number.isFinite(Number(computedTotal)) ? String(computedTotal) : totalVal || "-",
    grade: grade === "-" ? subject?.grade || "-" : grade,
    gradePoint: gradePointFromGrade(grade),
    credits,
  };
}

export function calculateSemesterGrades(subjects = []) {
  const normalizedSubjects = subjects.map(normalizeSubject);
  const totals = normalizedSubjects.reduce(
    (acc, subject) => {
      const credits = getSubjectCredits(subject);
      const grade = subject.grade && subject.grade !== "-" ? subject.grade : gradeFromMarks(subject.total);
      const gradePoint = gradePointFromGrade(grade);
      acc.credits += credits;
      acc.points += credits * gradePoint;
      return acc;
    },
    { credits: 0, points: 0 }
  );

  const sgpa = totals.credits > 0 ? totals.points / totals.credits : 0;

  return {
    subjects: normalizedSubjects,
    sgpa: sgpa.toFixed(2),
    totalCredits: totals.credits,
    creditPoints: totals.points,
  };
}

export function normalizeResult(result) {
  if (!result) return result;

  const semesterGrades = calculateSemesterGrades(result.subjects || []);
  
  const officialSgpa = result.summary?.sgpa;
  const hasOfficialSgpa = 
    officialSgpa && 
    officialSgpa !== "-" && 
    officialSgpa !== "0" && 
    officialSgpa !== "0.0" && 
    officialSgpa !== "0.00" && 
    officialSgpa !== "";

  const sgpaValue = hasOfficialSgpa ? String(officialSgpa) : semesterGrades.sgpa;

  return {
    ...result,
    subjects: semesterGrades.subjects,
    summary: {
      ...result.summary,
      sgpa: sgpaValue,
      totalCredits: result.summary?.totalCredits && result.summary.totalCredits !== "-" && result.summary.totalCredits !== ""
        ? result.summary.totalCredits 
        : semesterGrades.totalCredits,
      creditPoints: semesterGrades.creditPoints,
      percentage: (Number(sgpaValue) * 10).toFixed(1),
    },
  };
}

export function calculateCgpa(results = []) {
  const totals = results.reduce(
    (acc, result) => {
      const normalized = normalizeResult(result);
      const sgpa = Number(normalized?.summary?.sgpa);
      const credits = Number(normalized?.summary?.totalCredits);
      if (Number.isFinite(sgpa) && Number.isFinite(credits) && credits > 0) {
        acc.credits += credits;
        acc.points += sgpa * credits;
      }
      return acc;
    },
    { credits: 0, points: 0 }
  );

  const cgpa = totals.credits > 0 ? totals.points / totals.credits : 0;

  return {
    cgpa: cgpa.toFixed(2),
    totalCredits: totals.credits,
    percentage: (cgpa * 10).toFixed(1),
  };
}
