export function gradeFromMarks(totalMarks) {
  const marks = Number(totalMarks);
  if (!Number.isFinite(marks)) return "-";

  if (marks >= 90) return "O";
  if (marks >= 75) return "A+";
  if (marks >= 65) return "A";
  if (marks >= 55) return "B+";
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
  return estimateCredits(subject?.code, subject?.name);
}

export function normalizeSubject(subject) {
  const total = Number(subject?.total);
  const internal = Number(subject?.internal);
  const external = Number(subject?.external);
  const computedTotal =
    Number.isFinite(total)
      ? total
      : Number.isFinite(internal) && Number.isFinite(external)
        ? internal + external
        : subject?.total;
  const grade = gradeFromMarks(computedTotal);
  const credits = getSubjectCredits(subject);

  return {
    ...subject,
    total: Number.isFinite(Number(computedTotal)) ? String(computedTotal) : subject?.total || "-",
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
  return {
    ...result,
    subjects: semesterGrades.subjects,
    summary: {
      ...result.summary,
      sgpa: semesterGrades.sgpa,
      totalCredits: semesterGrades.totalCredits,
      creditPoints: semesterGrades.creditPoints,
      percentage: (Number(semesterGrades.sgpa) * 10).toFixed(1),
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
