import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck, Loader2, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import SemesterSelector from "../components/SemesterSelector.jsx";
import StudentInfoCard from "../components/StudentInfoCard.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { estimateCredits, normalizeResult } from "../utils/grading.js";

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
        Assessment records fetched successfully from GGSIPU portal.
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
      <GraduationCap className="mt-0.5 h-4 w-4 flex-none" />
      <div>
        <p className="text-xs font-bold sm:text-sm">Semester {semester} Assessment Status</p>
        <p className="mt-0.5 text-xs text-navy-200">
          The university has released internal marks only. External marks will be shown at the time of external.
        </p>
      </div>
    </motion.div>
  );
}

export default function InternalMarksDashboardPage() {
  const { portalSessionId, semesters, logout, enrollment } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [status, setStatus] = useState("idle");
  const [alert, setAlert] = useState("");
  const [result, setResult] = useState(null);

  // SEO Title
  useEffect(() => {
    document.title = "IPUNex Results | Internal Assessment Marks";
  }, []);

  async function handleSemesterSelect(semesterValue, semesterLabel) {
    setAlert("");
    setSelectedSemester(semesterValue);

    if (semesterValue === "ALL") {
      setResult(null);
      setStatus("idle");
      return;
    }

    setResult(null);
    setStatus("loading");

    try {
      const params = new URLSearchParams({ portalSessionId, internalsOnly: "true" });
      const response = await fetch(
        `${API_BASE}/api/result/semester/${encodeURIComponent(semesterValue)}?${params}`
      );
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 440) {
          logout();
          return;
        }
        throw new Error(payload?.error?.message || "Unable to fetch live internal marks.");
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
    } catch (error) {
      setStatus("error");
      setAlert(error.message || "Failed to load internals data.");
    }
  }

  return (
    <div className="space-y-4 py-2">
      {alert && (
        <ErrorAlert message={alert} onDismiss={() => setAlert("")} />
      )}

      {/* Semester selector */}
      <SemesterSelector
        semesters={semesters}
        selectedSemester={selectedSemester}
        onSelect={handleSemesterSelect}
        isLoading={status === "loading"}
        hasCachedData={false} // Disable "ALL" tab for internal marks
      />

      {/* Loading */}
      {status === "loading" && <LoadingState />}

      {/* Empty state */}
      {!selectedSemester && status !== "loading" && (
        <section className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-navy-600 bg-navy-800/30 p-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="font-heading text-base font-bold text-white sm:text-lg">
            Fetch Internal Assessment
          </h2>
          <p className="mt-2 max-w-md text-xs leading-5 text-navy-300 sm:text-sm">
            Select a semester from the controller above to view your internal assessment grades.
          </p>
        </section>
      )}

      {/* Internals Results Display */}
      {result && selectedSemester !== "ALL" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <SuccessBanner />
          
          <StudentInfoCard student={result.student} />
          
          {result.summary?.status === "Internal Only" && (
            <InternalOnlyNoticeBanner semester={result.student.semester} />
          )}

          {/* Internal Marks Table */}
          <section className="glass rounded-2xl shadow-card overflow-hidden">
            <div className="border-b border-navy-600/50 p-4 sm:p-6">
              <h2 className="font-heading text-lg font-bold text-white">
                Internal Assessment Marks
              </h2>
              <p className="mt-1 text-sm text-navy-300">
                Continuous evaluation marks fetched directly from GGSIPU student portal.
              </p>
            </div>

            <div className="max-h-[520px] overflow-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-navy-850/95 text-xs uppercase backdrop-blur-sm">
                  <tr>
                    <th className="px-5 py-3.5 font-bold text-navy-300">Code</th>
                    <th className="px-5 py-3.5 font-bold text-navy-300">Subject</th>
                    <th className="px-5 py-3.5 font-bold text-navy-300 text-center">Max Marks</th>
                    <th className="px-5 py-3.5 font-bold text-navy-300 text-center">Internal Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-600/30">
                  {result.subjects.map((subject, index) => (
                    <tr
                      key={subject.code}
                      className={`transition-colors hover:bg-navy-700/30 ${
                        index % 2 === 0 ? "bg-navy-800/20" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-bold text-accent-light">
                        {subject.code}
                      </td>
                      <td className="px-5 py-4 font-medium text-white">
                        {subject.name}
                      </td>
                      <td className="px-5 py-4 text-navy-200 text-center font-semibold">
                        {subject.maxMarks || 40}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-emerald-400 text-base">
                        {subject.internal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </motion.div>
      )}
    </div>
  );
}
