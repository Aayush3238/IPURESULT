import { calculateCgpa, normalizeResult } from "./grading.js";

export function computeSemesterAnalytics(result) {
  if (!result?.subjects?.length || !result?.summary) return null;

  const normalizedResult = normalizeResult(result);
  const { subjects } = normalizedResult;

  const totalMarks = subjects.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const maxPossible = subjects.length * 100;
  const percentage = normalizedResult.summary?.percentage || (maxPossible > 0 ? ((totalMarks / maxPossible) * 100).toFixed(1) : "0.0");
  const avgMarks = subjects.length > 0 ? (totalMarks / subjects.length).toFixed(1) : "0.0";

  const sorted = [...subjects].sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));
  const highestSubject = sorted[0] || null;
  const weakestSubject = sorted[sorted.length - 1] || null;

  const passCount = subjects.filter((s) => s.gradePoint > 0).length;
  const failCount = subjects.length - passCount;

  const gradeDistribution = {};
  subjects.forEach((s) => {
    const gp = s.gradePoint != null ? s.gradePoint : "N/A";
    gradeDistribution[gp] = (gradeDistribution[gp] || 0) + 1;
  });

  const pieData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    name: grade,
    value: count,
  }));

  const avgInternal =
    subjects.length > 0
      ? (subjects.reduce((sum, s) => sum + (Number(s.internal) || 0), 0) / subjects.length).toFixed(1)
      : "0.0";
  const avgExternal =
    subjects.length > 0
      ? (subjects.reduce((sum, s) => sum + (Number(s.external) || 0), 0) / subjects.length).toFixed(1)
      : "0.0";

  const barData = subjects.map((s) => ({
    name: s.code?.length > 10 ? s.code.slice(0, 10) + "..." : s.code,
    internal: Number(s.internal) || 0,
    external: Number(s.external) || 0,
  }));

  const subjectTrend = subjects.map((s) => ({
    name: s.code,
    total: Number(s.total) || 0,
  }));

  const areaData = subjects.map((s, i) => ({
    index: i + 1,
    name: s.code,
    marks: Number(s.total) || 0,
  }));

  return {
    percentage,
    avgMarks,
    totalMarks,
    highestSubject,
    weakestSubject,
    passCount,
    failCount,
    totalSubjects: subjects.length,
    gradeDistribution,
    pieData,
    avgInternal,
    avgExternal,
    barData,
    subjectTrend,
    areaData,
    sgpa: normalizedResult.summary?.sgpa || "0.00",
    totalCredits: normalizedResult.summary?.totalCredits || 0,
  };
}

export function computeOverallAnalytics(cache) {
  const entries = Object.entries(cache).filter(([, data]) => data !== null);
  if (entries.length === 0) return null;

  const allResults = entries.map(([sem, data]) => ({
    semester: sem,
    ...normalizeResult(data),
  }));

  allResults.sort((a, b) => {
    const numA = parseInt(a.semester) || 0;
    const numB = parseInt(b.semester) || 0;
    return numA - numB;
  });

  const allSubjects = allResults.flatMap((r) => r.subjects || []);
  const cgpaData = calculateCgpa(allResults);

  const totalMarksAll = allSubjects.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const maxPossibleAll = allSubjects.length * 100;
  const overallPercentage = cgpaData.percentage || (maxPossibleAll > 0 ? ((totalMarksAll / maxPossibleAll) * 100).toFixed(1) : "0.0");
  const overallAvgMarks =
    allSubjects.length > 0 ? (totalMarksAll / allSubjects.length).toFixed(1) : "0.0";
  const overallPassCount = allSubjects.filter((s) => s.gradePoint > 0).length;

  const gradeDist = {};
  allSubjects.forEach((s) => {
    const gp = s.gradePoint != null ? s.gradePoint : "N/A";
    gradeDist[gp] = (gradeDist[gp] || 0) + 1;
  });

  const pieData = Object.entries(gradeDist).map(([grade, count]) => ({
    name: grade,
    value: count,
  }));

  const avgInternalAll =
    allSubjects.length > 0
      ? (allSubjects.reduce((sum, s) => sum + (Number(s.internal) || 0), 0) / allSubjects.length).toFixed(1)
      : "0.0";
  const avgExternalAll =
    allSubjects.length > 0
      ? (allSubjects.reduce((sum, s) => sum + (Number(s.external) || 0), 0) / allSubjects.length).toFixed(1)
      : "0.0";

  const internalVsExternal = allResults.map((r) => {
    const subs = r.subjects || [];
    const avgInt =
      subs.length > 0
        ? subs.reduce((s, sub) => s + (Number(sub.internal) || 0), 0) / subs.length
        : 0;
    const avgExt =
      subs.length > 0
        ? subs.reduce((s, sub) => s + (Number(sub.external) || 0), 0) / subs.length
        : 0;
    return {
      semester: `Sem ${r.semester}`,
      internal: parseFloat(avgInt.toFixed(1)),
      external: parseFloat(avgExt.toFixed(1)),
    };
  });

  const semPercentages = allResults.map((r) => {
    return {
      semester: `Sem ${r.semester}`,
      percentage: parseFloat(((Number(r.summary?.sgpa) || 0) * 10).toFixed(1)),
    };
  });

  const growthData = semPercentages.map((item, i) => ({
    ...item,
    growth: i === 0
      ? 0
      : parseFloat(
          (((item.percentage - semPercentages[i - 1].percentage) /
            (semPercentages[i - 1].percentage || 1)) *
            100).toFixed(1)
        ),
  }));

  let growthPercent = 0;
  if (semPercentages.length >= 2) {
    const first = semPercentages[0].percentage;
    const last = semPercentages[semPercentages.length - 1].percentage;
    growthPercent = first > 0 ? parseFloat((((last - first) / first) * 100).toFixed(1)) : 0;
  }

  const allSorted = [...allSubjects].sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));
  const highestSubjectAll = allSorted[0] || null;
  const weakestSubjectAll = allSorted[allSorted.length - 1] || null;

  const strongestSemester = allResults.reduce(
    (best, r) => {
      const pct = (Number(r.summary?.sgpa) || 0) * 10;
      return pct > best.percentage
        ? { semester: r.semester, percentage: parseFloat(pct.toFixed(1)) }
        : best;
    },
    { semester: "-", percentage: 0 }
  );

  const weakestSemester = allResults.reduce(
    (worst, r) => {
      const pct = (Number(r.summary?.sgpa) || 0) * 10;
      return pct < worst.percentage || worst.percentage === 0
        ? { semester: r.semester, percentage: parseFloat(pct.toFixed(1)) }
        : worst;
    },
    { semester: "-", percentage: 0 }
  );

  const improvementTrend =
    semPercentages.length >= 2
      ? semPercentages[semPercentages.length - 1].percentage >=
        semPercentages[semPercentages.length - 2].percentage
        ? "improving"
        : "declining"
      : "neutral";

  const internalDominant =
    parseFloat(avgInternalAll) > parseFloat(avgExternalAll) ? "internal" : "external";

  return {
    semestersLoaded: entries.length,
    overallPercentage,
    overallAvgMarks,
    overallPassCount,
    totalSubjects: allSubjects.length,
    pieData,
    avgInternalAll,
    avgExternalAll,
    internalVsExternal,
    growthData,
    growthPercent,
    highestSubjectAll,
    weakestSubjectAll,
    strongestSemester,
    weakestSemester,
    improvementTrend,
    internalDominant,
    totalMarksAll,
    cgpa: cgpaData.cgpa,
    totalCredits: cgpaData.totalCredits,
  };
}

export function getInsights(semesterAnalytics, overallAnalytics, isAllMode) {
  const insights = [];

  if (isAllMode && overallAnalytics) {
    const { strongestSemester, weakestSemester, improvementTrend, growthPercent } = overallAnalytics;

    if (strongestSemester && strongestSemester.semester !== "-") {
      insights.push({
        type: "strongest",
        label: "Strongest Semester",
        value: `Semester ${strongestSemester.semester}`,
        detail: `Percentage: ${strongestSemester.percentage}%`,
        color: "cyan",
      });
    }

    if (improvementTrend === "improving") {
      insights.push({
        type: "trend",
        label: "Improvement Trend",
        value: "Upward Trajectory",
        detail: `+${growthPercent}% marks growth overall`,
        color: "success",
      });
    } else if (improvementTrend === "declining") {
      insights.push({
        type: "trend",
        label: "Performance Trend",
        value: "Needs Attention",
        detail: `${growthPercent}% marks change`,
        color: "warning",
      });
    } else {
      insights.push({
        type: "trend",
        label: "Performance Trend",
        value: "Stable",
        detail: "Consistent performance",
        color: "accent",
      });
    }

    const { avgInternalAll, avgExternalAll, internalDominant } = overallAnalytics;
    insights.push({
      type: "performance",
      label: "Score Insight",
      value: internalDominant === "internal" ? "Stronger Internals" : "Stronger Externals",
      detail: `Internal avg: ${avgInternalAll} | External avg: ${avgExternalAll}`,
      color: internalDominant === "internal" ? "accent" : "cyan",
    });
  } else if (semesterAnalytics) {
    const { highestSubject, weakestSubject, percentage, avgInternal, avgExternal } = semesterAnalytics;

    if (highestSubject) {
      insights.push({
        type: "strongest",
        label: "Top Subject",
        value: highestSubject.name,
        detail: `Score: ${highestSubject.total} (GP: ${highestSubject.gradePoint})`,
        color: "success",
      });
    }

    if (weakestSubject && weakestSubject.code !== highestSubject?.code) {
      insights.push({
        type: "weakest",
        label: "Needs Focus",
        value: weakestSubject.name,
        detail: `Score: ${weakestSubject.total} (GP: ${weakestSubject.gradePoint})`,
        color: "warning",
      });
    }

    const internalBetter = parseFloat(avgInternal) > parseFloat(avgExternal);
    insights.push({
      type: "performance",
      label: "Score Insight",
      value: internalBetter ? "Stronger Internals" : "Stronger Externals",
      detail: `Internal avg: ${avgInternal} | External avg: ${avgExternal}`,
      color: internalBetter ? "accent" : "cyan",
    });

    if (parseFloat(percentage) >= 85) {
      insights.push({
        type: "highlight",
        label: "Outstanding",
        value: "Exceptional Performance",
        detail: `${percentage}% - Top tier`,
        color: "cyan",
      });
    } else if (parseFloat(percentage) >= 75) {
      insights.push({
        type: "highlight",
        label: "Great Job",
        value: "Excellent Performance",
        detail: `${percentage}% overall`,
        color: "success",
      });
    } else if (parseFloat(percentage) >= 60) {
      insights.push({
        type: "highlight",
        label: "Good Work",
        value: "Good Performance",
        detail: `${percentage}% overall`,
        color: "accent",
      });
    }
  }

  return insights;
}
