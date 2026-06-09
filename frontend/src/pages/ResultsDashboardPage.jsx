import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Printer, Share2, Sparkles, Loader2, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import SemesterSelector from "../components/SemesterSelector.jsx";
import StudentInfoCard from "../components/StudentInfoCard.jsx";
import SummaryCards from "../components/SummaryCards.jsx";
import GradePointCard from "../components/GradePointCard.jsx";
import MarksTable from "../components/MarksTable.jsx";
import SemesterAnalytics from "../components/SemesterAnalytics.jsx";
import OverallAnalytics from "../components/OverallAnalytics.jsx";
import AnalyticsLoadingSkeleton from "../components/AnalyticsLoadingSkeleton.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { computeSemesterAnalytics, computeOverallAnalytics, getInsights } from "../utils/analytics.js";
import { estimateCredits, normalizeResult } from "../utils/grading.js";
import { errorMessages } from "../data/mockResult.js";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function SuccessBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 p-3 text-success-light"
    >
      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-success animate-pulse shrink-0" />
      <p className="text-xs font-semibold leading-5 sm:text-sm">
        Result fetched successfully from the GGSIPU portal.
      </p>
    </motion.div>
  );
}

function InternalOnlyNoticeBanner({ semester }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/10 p-3.5 text-warning-light"
    >
      <Sparkles className="mt-0.5 h-4 w-4 flex-none" />
      <div>
        <p className="text-xs font-bold sm:text-sm">Semester {semester} Assessment Status</p>
        <p className="mt-0.5 text-xs text-navy-200">
          The university has released internal marks only. External marks will be shown at the time of external.
        </p>
      </div>
    </motion.div>
  );
}

export default function ResultsDashboardPage() {
  const { portalSessionId, semesters, logout, enrollment } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [status, setStatus] = useState("idle");
  const [alert, setAlert] = useState("");
  const [result, setResult] = useState(null);
  const [semesterCache, setSemesterCache] = useState({});
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  // SEO Title
  useEffect(() => {
    document.title = "IPUNex Results | Semester Results & Academic Dashboard";
  }, []);

  async function handleSemesterSelect(semesterValue, semesterLabel) {
    setAlert("");
    setSelectedSemester(semesterValue);

    if (semesterValue === "ALL") {
      setResult(null);
      setStatus("idle");
      return;
    }

    if (semesterCache[semesterValue]) {
      setResult(semesterCache[semesterValue]);
      setStatus("success");
      return;
    }

    setResult(null);
    setStatus("loading");

    try {
      const params = new URLSearchParams({ portalSessionId });
      const response = await fetch(
        `${API_BASE}/api/result/semester/${encodeURIComponent(semesterValue)}?${params}`
      );
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 440) {
          logout();
          return;
        }
        throw new Error(payload?.error?.message || errorMessages.generic);
      }

      const fetchedResult = normalizeResult({
        ...payload,
        student: {
          ...payload.student,
          enrollmentNumber: payload.student?.enrollmentNumber || enrollment,
          semester: payload.student?.semester || semesterLabel || semesterValue,
        },
        subjects: payload.subjects || [],
      });

      setStatus("success");
      setResult(fetchedResult);
      setSemesterCache((prev) => ({ ...prev, [semesterValue]: fetchedResult }));
    } catch (error) {
      setStatus("error");
      setAlert(error.message || errorMessages.generic);
    }
  }

  const isAllMode = selectedSemester === "ALL";
  const hasCachedData = Object.keys(semesterCache).length > 0;

  const semesterAnalytics = useMemo(() => {
    if (isAllMode || !result) return null;
    return computeSemesterAnalytics(result);
  }, [result, isAllMode]);

  const overallAnalytics = useMemo(() => {
    if (!isAllMode || !hasCachedData) return null;
    return computeOverallAnalytics(semesterCache);
  }, [semesterCache, isAllMode, hasCachedData]);

  const semesterInsights = useMemo(() => {
    return getInsights(semesterAnalytics, overallAnalytics, isAllMode);
  }, [semesterAnalytics, overallAnalytics, isAllMode]);

  const showOverallByDefault = !selectedSemester && hasCachedData && !result && status !== "loading";

  return (
    <div className="space-y-4 py-2">
      {alert && (
        <ErrorAlert message={alert} onDismiss={() => setAlert("")} />
      )}

      {/* Semester Selector */}
      <SemesterSelector
        semesters={semesters}
        selectedSemester={selectedSemester}
        onSelect={handleSemesterSelect}
        isLoading={status === "loading"}
        hasCachedData={hasCachedData}
      />

      {/* Loading state */}
      {status === "loading" && <LoadingState />}

      {/* Empty states */}
      {!selectedSemester && !hasCachedData && status !== "loading" && (
        <section className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-navy-600 bg-navy-800/30 p-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-cyan-light">
            <BookOpen className="h-7 w-7" />
          </div>
          <h2 className="font-heading text-base font-bold text-white sm:text-lg">
            Check Your Grades
          </h2>
          <p className="mt-2 max-w-md text-xs leading-5 text-navy-300 sm:text-sm">
            Select a semester from the controller above to retrieve your results.
          </p>
        </section>
      )}

      {isAllMode && !hasCachedData && (
        <section className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-navy-600 bg-navy-800/30 p-6 text-center">
          <h2 className="font-heading text-base font-bold text-white">No cached data</h2>
          <p className="mt-2 text-xs text-navy-300">
            Fetch at least one semester result first to load cumulative overall analytics.
          </p>
        </section>
      )}

      {/* Single Semester Result Display */}
      {result && !isAllMode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {result.summary?.status === "Internal Only" ? (
            <div className="space-y-6">
              {/* Internal Marks Table */}
              <div className="glass rounded-2xl p-5 shadow-card border border-navy-600/50">
                <div className="mb-4 flex items-center gap-3 border-b border-navy-600/50 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-white">Internal Marks</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-navy-700">
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-400">Paper Code</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-400">Paper Name</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-400 text-center">Credits</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-400 text-center">Max Marks</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-400 text-center">Internal Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-600/30">
                      {result.subjects.map((subject, index) => {
                        const credits = estimateCredits(subject.code, subject.name);
                        return (
                          <tr
                            key={subject.code}
                            className={`transition-colors hover:bg-navy-700/30 ${
                              index % 2 === 0 ? "bg-navy-800/10" : ""
                            }`}
                          >
                            <td className="whitespace-nowrap px-4 py-3.5">
                              <span className="inline-flex items-center rounded-lg bg-navy-800/80 px-2.5 py-1 font-mono text-xs font-bold text-navy-200 border border-navy-700/50">
                                {subject.code}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-white max-w-[300px] sm:max-w-none truncate">
                              {subject.name}
                            </td>
                            <td className="px-4 py-3.5 text-center font-semibold text-navy-200">
                              {credits}
                            </td>
                            <td className="px-4 py-3.5 text-center font-semibold text-navy-200">
                              {subject.maxMarks || 40}
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-amber-500 text-base">
                              {subject.internal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notice card */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-navy-600/30 bg-navy-800/20 p-8 text-center shadow-card">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800/60 text-navy-400">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Final Result Yet to be Released
                </h3>
                <p className="mt-1 text-sm text-navy-400">
                  Stay tuned.
                </p>
              </div>
            </div>
          ) : (
            <>
              <SuccessBanner />
              {result.summary?.status === "Internal Only" && (
                <InternalOnlyNoticeBanner semester={result.student.semester} />
              )}

              {/* Utility controls */}
              <div className="no-print flex flex-wrap gap-2 justify-between sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeveloperMode(prev => !prev)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold shadow-glow outline-none transition sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
                    isDeveloperMode 
                      ? "bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white" 
                      : "border border-navy-600 bg-navy-800/60 text-navy-150 hover:border-navy-500 hover:bg-navy-700/60"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {isDeveloperMode ? "Hide Dev Mode" : "Developer Mode"}
                </button>
                <div className="flex gap-2 sm:gap-3 ml-auto sm:ml-0">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-600 bg-navy-800/60 px-3 py-2 text-xs font-semibold text-navy-100 outline-none transition hover:border-navy-500 hover:bg-navy-700/60 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-600 bg-navy-800/60 px-3 py-2 text-xs font-semibold text-navy-100 outline-none transition hover:border-navy-500 hover:bg-navy-700/60 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                  >
                    <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Print
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-cyan px-3 py-2 text-xs font-semibold text-white shadow-glow outline-none transition hover:from-accent-hover hover:to-cyan-hover sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                  >
                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Cards layout */}
              <StudentInfoCard student={result.student} />
              <SummaryCards subjects={result.subjects} summary={result.summary} />
              
              <GradePointCard 
                sgpa={result.summary?.sgpa || "0.00"} 
                cgpa={result.summary?.cgpa || "0.00"}
                isCGPAMode={false}
                delay={0.2}
              />

              {/* Developer mode card */}
              {isDeveloperMode && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 shadow-card border border-cyan/20 space-y-4"
                >
                  <div className="flex items-center gap-3 border-b border-navy-600/40 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 text-cyan-light">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-white">SGPA Calculation Engine</h3>
                      <p className="text-xs text-navy-300">Detailed credit-weighting breakdown and formula execution.</p>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="bg-navy-900/40 border border-navy-700/50 rounded-xl p-4 font-mono text-xs sm:text-sm text-navy-150 space-y-2">
                    <p className="text-cyan-light font-bold">1. Mathematical Formula:</p>
                    <p className="pl-4">SGPA = Σ(Credit × Grade Point) / Σ(Credit)</p>
                    
                    <p className="text-cyan-light font-bold mt-4">2. Step-by-Step Calculation Steps:</p>
                    {(() => {
                      const engine = result.summary?.sgpaEngine || {
                        sgpa: result.summary?.sgpa,
                        creditTotal: result.subjects?.reduce((sum, s) => sum + (s.credits || 0), 0),
                        weightedPoints: result.subjects?.reduce((sum, s) => sum + ((s.credits || 0) * (s.gradePoint || 0)), 0),
                        subjectBreakdown: result.subjects
                      };
                      const totalCredits = engine.creditTotal;
                      const totalWeighted = engine.weightedPoints;
                      const finalSgpa = engine.sgpa;

                      return (
                        <div className="pl-4 space-y-1">
                          <p>• Sum of Credits (Σ Credit) = {totalCredits}</p>
                          <p>• Sum of Weighted Grade Points (Σ (Credit × GP)) = {totalWeighted}</p>
                          <p>• Division: {totalWeighted} / {totalCredits} = {totalCredits > 0 ? (totalWeighted / totalCredits).toFixed(4) : "0.0000"}</p>
                          <p className="text-white font-bold mt-2">• Resulting SGPA (rounded to 2 decimals) = {finalSgpa}</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Subjects calculations table */}
                  <div className="overflow-x-auto rounded-xl border border-navy-600/40">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-navy-800/80 border-b border-navy-700">
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-450">Paper Code</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-450">Subject Name</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-450 text-center">Credits (C)</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-450 text-center">Total Marks (M)</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-450 text-center">Grade Point (GP)</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-450 text-center">C × GP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-600/30">
                        {(() => {
                          const subjectsList = result.summary?.sgpaEngine?.subjectBreakdown || result.subjects || [];
                          return subjectsList.map((sub, index) => {
                            const code = sub.paperCode || sub.code || "";
                            const name = sub.subjectName || sub.name || "";
                            const credits = sub.credits !== undefined ? sub.credits : 0;
                            const totalMarks = sub.totalMarks !== undefined ? sub.totalMarks : (sub.total !== "-" ? Number(sub.total) : 0);
                            const gp = sub.gradePoint !== undefined ? sub.gradePoint : 0;
                            const product = sub.creditGPProduct !== undefined ? sub.creditGPProduct : (credits * gp);

                            return (
                              <tr key={code} className={`hover:bg-navy-700/20 ${index % 2 === 0 ? "bg-navy-800/10" : ""}`}>
                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-navy-200">{code}</td>
                                <td className="px-4 py-3.5 font-medium text-white max-w-[220px] sm:max-w-none truncate">{name}</td>
                                <td className="px-4 py-3.5 text-center font-bold text-cyan-light">{credits}</td>
                                <td className="px-4 py-3.5 text-center text-navy-200">{totalMarks}</td>
                                <td className="px-4 py-3.5 text-center font-bold text-accent-light">{gp}</td>
                                <td className="px-4 py-3.5 text-center font-bold text-white bg-navy-800/30">{product}</td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              )}

              {/* Standard tables */}
              <MarksTable subjects={result.subjects} />

              {semesterAnalytics && (
                <SemesterAnalytics
                  analytics={semesterAnalytics}
                  insights={semesterInsights}
                />
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Cumulative Overall results (ALL mode) */}
      {isAllMode && hasCachedData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {overallAnalytics ? (
            <OverallAnalytics
              analytics={overallAnalytics}
              insights={semesterInsights}
            />
          ) : (
            <AnalyticsLoadingSkeleton />
          )}
        </motion.div>
      )}

      {/* Overall analytics by default */}
      {showOverallByDefault && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <OverallAnalytics
            analytics={computeOverallAnalytics(semesterCache)}
            insights={getInsights(null, computeOverallAnalytics(semesterCache), true)}
          />
        </motion.div>
      )}
    </div>
  );
}
