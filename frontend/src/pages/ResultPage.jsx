import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  Printer,
  ShieldCheck,
  Share2,
  LogOut,
  Layers,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingState from "../components/LoadingState.jsx";
import MarksTable from "../components/MarksTable.jsx";
import ResultForm from "../components/ResultForm.jsx";
import StudentInfoCard from "../components/StudentInfoCard.jsx";
import SummaryCards from "../components/SummaryCards.jsx";
import SemesterAnalytics from "../components/SemesterAnalytics.jsx";
import OverallAnalytics from "../components/OverallAnalytics.jsx";
import AnalyticsLoadingSkeleton from "../components/AnalyticsLoadingSkeleton.jsx";
import GradePointCard from "../components/GradePointCard.jsx";
import { errorMessages } from "../data/mockResult.js";
import { computeSemesterAnalytics, computeOverallAnalytics, getInsights } from "../utils/analytics.js";
import { estimateCredits, normalizeResult } from "../utils/grading.js";
import LandingPage from "./LandingPage.jsx";
import ResourcesPage from "./ResourcesPage.jsx";


const initialFormValues = {
  enrollmentNumber: "",
  password: "",
  captcha: "",
};

/* ────────── Background Effects ────────── */

function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-grid-animated opacity-40" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: 800,
          height: 400,
          background:
            "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

/* ────────── Compact Hero ────────── */

function HeroSection({ currentStep, enrollmentNumber, onLogout }) {
  return (
    <section className="relative overflow-hidden border-b border-navy-600/50">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(6,182,212,0.03) 50%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan text-white shadow-glow sm:h-9 sm:w-9">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-200 sm:text-xs">
                GGSIPU
              </span>
              <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-light sm:ml-2 sm:text-xs">
                Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentStep === "semester" && (
              <>
                <span className="hidden text-xs text-navy-400 sm:inline">{enrollmentNumber}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 rounded-lg border border-navy-600 bg-navy-800/60 px-2.5 py-1.5 text-[10px] font-semibold text-navy-300 outline-none transition hover:border-navy-500 hover:bg-navy-700/60 hover:text-white sm:text-xs"
                >
                  <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Logout
                </button>
              </>
            )}
            {currentStep === "login" && (
              <span className="rounded-full border border-navy-600 bg-navy-800/60 px-3 py-1 text-[10px] font-semibold text-navy-200 sm:text-[11px]">
                Secure Access
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-xl font-extrabold text-white sm:text-2xl"
          >
            IPUNex{" "}
            <span className="bg-gradient-to-r from-accent-light to-cyan-light bg-clip-text text-transparent">
              Results
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden text-xs text-navy-400 sm:inline"
          >
            Academic Performance Dashboard
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ────────── Empty State ────────── */

function EmptyState({ message }) {
  return (
    <section className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-navy-600 bg-navy-800/30 p-6 text-center sm:min-h-[300px]">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-cyan/20 sm:mb-4 sm:h-16 sm:w-16">
        <BookOpen className="h-7 w-7 text-accent-light sm:h-8 sm:w-8" aria-hidden="true" />
      </div>
      <h2 className="font-heading text-base font-bold text-white sm:text-lg">
        Your Results Await
      </h2>
      <p className="mt-2 max-w-md text-xs leading-5 text-navy-300 sm:text-sm sm:leading-6">
        {message || "Enter your credentials and select a semester to view your academic performance."}
      </p>
    </section>
  );
}

function InternalMarksLookup({ defaultEnrollment }) {
  const [enrollment, setEnrollment] = useState(defaultEnrollment || "");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (defaultEnrollment && !enrollment) {
      setEnrollment(defaultEnrollment);
    }
  }, [defaultEnrollment, enrollment]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = enrollment.trim();
    setMessage("");
    setStudent(null);

    if (!/^\d{10,12}$/.test(trimmed)) {
      setMessage("Enter a valid 10-12 digit enrollment number.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    setMessage("Internal marks are fetched only through the live GGSIPU portal login.");
    setStatus("error");
  }

  const subjects = student?.subjects || [];
  const total = subjects.reduce((sum, subject) => sum + (Number(subject.internal) || 0), 0);

  return (
    <section className="glass rounded-2xl p-4 shadow-card sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success-light">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-base font-bold text-white">Internal Marks</h2>
          <p className="text-xs text-navy-300">Fetch internal assessment by enrollment number.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3">
        <label className="block">
          <span className="text-sm font-semibold text-navy-200">Enrollment Number</span>
          <input
            className="mt-2 w-full rounded-xl border border-navy-600 bg-navy-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-navy-400 focus:border-accent focus:bg-navy-800 focus:ring-4 focus:ring-accent/20"
            inputMode="numeric"
            placeholder="00110802124"
            value={enrollment}
            onChange={(event) => {
              setEnrollment(event.target.value);
              setMessage("");
            }}
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-success to-cyan px-4 py-3 text-sm font-bold text-white shadow-glow outline-none transition hover:to-cyan-hover focus-visible:ring-4 focus-visible:ring-success/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin-slow" />
              Fetching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Fetch Internals
            </>
          )}
        </button>
      </form>

      {message ? (
        <p className="mt-3 rounded-xl border border-error/20 bg-error/10 px-3 py-2 text-xs font-semibold text-error-light">
          {message}
        </p>
      ) : null}

      {student ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-navy-600/50">
          <div className="flex items-center justify-between gap-3 bg-navy-800/50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{student.name}</p>
              <p className="text-xs text-navy-300">{student.enrollment}</p>
            </div>
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success-light">
              {total} marks
            </span>
          </div>
          <div className="divide-y divide-navy-600/40">
            {subjects.map((subject) => (
              <div key={subject.subject} className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2 text-sm">
                <span className="font-mono font-bold text-accent-light">{subject.subject}</span>
                <span className="font-bold text-white">{subject.internal}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PortalOptionCard({
  title,
  description,
  icon: Icon,
  buttonLabel,
  status,
  onClick,
  disabled,
  tone = "accent",
}) {
  const toneClasses =
    tone === "success"
      ? "from-success/20 to-cyan/10 text-success-light"
      : "from-accent/20 to-cyan/10 text-accent-light";

  return (
    <article className="glass flex min-h-[220px] flex-col justify-between rounded-2xl p-5 shadow-card sm:p-6">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClasses}`}>
            <Icon className="h-6 w-6" />
          </div>
          {status ? (
            <span className="rounded-full border border-navy-600/50 bg-navy-800/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-200">
              {status}
            </span>
          ) : null}
        </div>
        <h2 className="font-heading text-xl font-extrabold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-navy-200">{description}</p>
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold outline-none transition focus-visible:ring-4 ${
          disabled
            ? "cursor-not-allowed border border-navy-600/60 bg-navy-800/40 text-navy-300"
            : "bg-gradient-to-r from-accent to-cyan text-white shadow-glow hover:from-accent-hover hover:to-cyan-hover focus-visible:ring-accent/25"
        }`}
      >
        {buttonLabel}
      </button>
    </article>
  );
}

function PortalChoice({ onOpenInternals }) {
  return (
    <section className="mx-auto grid w-full max-w-2xl gap-4">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-light">
          Choose Service
        </p>
        <h2 className="mt-2 font-heading text-2xl font-extrabold text-white sm:text-3xl">
          Student Result Services
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-navy-200">
          Internal marks lookup is ready now. The full semester result portal is being prepared and will be enabled soon.
        </p>
      </div>

      <div className="grid gap-4">
        <PortalOptionCard
          title="Internal Marks"
          description="Login to the GGSIPU portal and fetch internal assessment marks directly."
          icon={GraduationCap}
          buttonLabel="Open Internal Marks"
          status="Live"
          tone="success"
          onClick={onOpenInternals}
        />
        <PortalOptionCard
          title="Semester Result"
          description="The result login and semester marksheet experience is under final setup. This option will be available very soon."
          icon={FileText}
          buttonLabel="Will be live very soon"
          status="Coming Soon"
          disabled
        />
      </div>
    </section>
  );
}

function InternalMarksPage({ defaultEnrollment, onBack }) {
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-600/60 bg-navy-800/40 px-3 py-2 text-xs font-bold text-navy-100 outline-none transition hover:border-navy-500 hover:bg-navy-700/60 focus-visible:ring-4 focus-visible:ring-accent/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <InternalMarksLookup defaultEnrollment={defaultEnrollment} />
      </div>

      <aside className="glass rounded-2xl p-4 shadow-card sm:p-5">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 text-cyan-light">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="font-heading text-base font-bold text-white">Ready for Internals</h2>
        <p className="mt-2 text-sm leading-6 text-navy-200">
          Internal marks are fetched directly from the GGSIPU student portal after login.
        </p>
        <div className="mt-4 rounded-xl border border-navy-600/50 bg-navy-800/30 p-3 text-xs leading-5 text-navy-200">
          Result portal login is temporarily hidden until the live result flow is ready.
        </div>
      </aside>
    </section>
  );
}

/* ────────── Result Steps ────────── */

function ResultSteps() {
  return (
    <article className="glass rounded-2xl p-5 shadow-card">
      <h3 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-cyan-light" />
        How to Check Results
      </h3>
      <ol className="space-y-3 text-xs text-navy-200">
        <li className="flex gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-bold text-cyan-light">
            1
          </span>
          <span>Enter your 10-12 digit GGSIPU Enrollment Number.</span>
        </li>
        <li className="flex gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-bold text-cyan-light">
            2
          </span>
          <span>Enter your GGSIPU portal login password.</span>
        </li>
        <li className="flex gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-bold text-cyan-light">
            3
          </span>
          <span>Input the correct captcha code. Click refresh if it expires.</span>
        </li>
        <li className="flex gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-bold text-cyan-light">
            4
          </span>
          <span>Submit and select the semester to fetch grades.</span>
        </li>
      </ol>
    </article>
  );
}

/* ────────── Success Banner ────────── */

function SuccessBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 p-3 text-success-light"
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" />
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

/* ────────── Horizontal Semester Selector ────────── */

function SemesterSelector({ semesters, selectedSemester, onSelect, isLoading, hasCachedData }) {
  return (
    <div className="glass rounded-xl p-3 shadow-card sm:p-4">
      <div className="mb-2 flex items-center justify-between sm:mb-3">
        <h2 className="font-heading text-xs font-bold text-white sm:text-sm">
          Select Semester
        </h2>
        {selectedSemester && isLoading && (
          <div className="flex items-center gap-1.5 text-[10px] text-accent-light sm:text-xs">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Fetching...
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {hasCachedData && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelect("ALL", "All Semesters")}
            className={`semester-all-btn group shrink-0 rounded-lg border px-3 py-2 text-left transition-all duration-200 sm:px-4 sm:py-2.5 ${
              selectedSemester === "ALL"
                ? "border-cyan bg-cyan/10 ring-2 ring-cyan/30"
                : "border-navy-600 bg-navy-800/40 hover:border-navy-500 hover:bg-navy-800/60"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Layers className={`h-3.5 w-3.5 ${selectedSemester === "ALL" ? "text-cyan-light" : "text-navy-400"}`} />
              <span className={`text-xs font-bold sm:text-sm ${selectedSemester === "ALL" ? "text-cyan-light" : "text-white"}`}>
                ALL
              </span>
            </div>
          </button>
        )}
        {semesters.map((sem) => {
          const isSelected = selectedSemester === sem.value;
          return (
            <button
              key={sem.value}
              type="button"
              disabled={isLoading}
              onClick={() => onSelect(sem.value, sem.label)}
              className={`group shrink-0 rounded-lg border px-3 py-2 text-left transition-all duration-200 sm:px-4 sm:py-2.5 ${
                isSelected
                  ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                  : "border-navy-600 bg-navy-800/40 hover:border-navy-500 hover:bg-navy-800/60"
              } ${isLoading && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-wider sm:text-xs ${
                isSelected ? "text-accent-light" : "text-navy-400"
              }`}>
                {sem.label.includes("Semester") || sem.label.includes("sem") ? "" : "Sem"}
              </p>
              <p className={`font-heading text-sm font-extrabold sm:text-base ${
                isSelected ? "text-accent-light" : "text-white"
              }`}>
                {sem.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────── Main Page ────────── */

const API_BASE = import.meta.env.VITE_API_BASE || "";
const STORAGE_KEY = "ipunex_portal_session";

function loadSavedSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.portalSessionId && data.semesters?.length && data.enrollment) {
      // Filter out any special/invalid semester codes like 100
      const filtered = data.semesters.filter(s => {
        const val = parseInt(s.value, 10);
        return !isNaN(val) && val >= 1 && val <= 8;
      });
      // Ensure the next unreleased semester is present if not already added
      if (filtered.length > 0) {
        const maxSem = Math.max(...filtered.map(s => parseInt(s.value, 10) || 0));
        const nextSem = maxSem + 1;
        if (nextSem <= 8 && !filtered.some(s => parseInt(s.value, 10) === nextSem)) {
          filtered.push({
            value: String(nextSem),
            label: `Semester ${nextSem}`,
          });
        }
      }
      data.semesters = filtered;
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

function saveSession({ portalSessionId, semesters, enrollment }) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ portalSessionId, semesters, enrollment })
  );
}

function clearSavedSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function ResultPage() {
  const saved = useRef(loadSavedSession());
  const [activeService, setActiveService] = useState(saved.current ? "result" : "home");
  const [values, setValues] = useState({
    ...initialFormValues,
    enrollmentNumber: saved.current?.enrollment || "",
  });
  const [errors, setErrors] = useState({});
  const [sessionId, setSessionId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(
    saved.current ? "semester" : "login"
  );
  const [portalSessionId, setPortalSessionId] = useState(
    saved.current?.portalSessionId || ""
  );
  const [semesters, setSemesters] = useState(saved.current?.semesters || []);
  const [selectedSemester, setSelectedSemester] = useState("");

  const [status, setStatus] = useState("idle");
  const [alert, setAlert] = useState("");
  const [result, setResult] = useState(null);
  const [semesterCache, setSemesterCache] = useState({});

  async function refreshCaptcha() {
    setIsCaptchaLoading(true);
    setCaptchaImage("");
    setSessionId("");
    setValues((current) => ({ ...current, captcha: "" }));
    setErrors((current) => ({ ...current, captcha: "" }));
    setAlert("");

    try {
      const response = await fetch(`${API_BASE}/api/result/captcha`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || errorMessages.server);
      }

      setSessionId(payload.sessionId);
      setCaptchaImage(payload.captchaImage);
    } catch (error) {
      setAlert(error.message || errorMessages.server);
    } finally {
      setIsCaptchaLoading(false);
    }
  }

  useEffect(() => {
    if ((activeService === "result" || activeService === "internals") && currentStep === "login") {
      refreshCaptcha();
    }
  }, [activeService, currentStep]);

  useEffect(() => {
    if (activeService === "internals" && portalSessionId) {
      setSemesters(
        Array.from({ length: 8 }, (_, i) => ({
          value: String(i + 1),
          label: `Semester ${i + 1}`,
        }))
      );
    }
  }, [activeService, portalSessionId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setAlert("");
  }

  function validateLoginForm() {
    const nextErrors = {};

    if (!/^\d{10,12}$/.test(values.enrollmentNumber.trim())) {
      nextErrors.enrollmentNumber =
        "Enter a valid 10-12 digit enrollment number.";
    }

    if (values.password.trim().length < 4) {
      nextErrors.password = "Password must be at least 4 characters.";
    }

    if (!values.captcha.trim()) {
      nextErrors.captcha = "Enter the captcha shown above.";
    }

    if (!sessionId) {
      nextErrors.captcha = "Refresh captcha and try again.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAlert("");
    setResult(null);

    if (!validateLoginForm()) {
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(`${API_BASE}/api/result/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          enrollment: values.enrollmentNumber.trim(),
          password: values.password,
          captcha: values.captcha.trim(),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || errorMessages.generic);
      }

      setPortalSessionId(payload.portalSessionId);
      let semesters = payload.semesters?.length
        ? payload.semesters.filter(s => {
            const val = parseInt(s.value, 10);
            return !isNaN(val) && val >= 1 && val <= 8;
          })
        : Array.from({ length: 8 }, (_, i) => ({
            value: String(i + 1),
            label: `Semester ${i + 1}`,
          }));
      
      // Dynamically append the next unreleased semester (maxSem + 1) if not already present
      if (semesters.length > 0) {
        const maxSem = Math.max(...semesters.map(s => parseInt(s.value, 10) || 0));
        const nextSem = maxSem + 1;
        if (nextSem <= 8 && !semesters.some(s => parseInt(s.value, 10) === nextSem)) {
          semesters.push({
            value: String(nextSem),
            label: `Semester ${nextSem}`,
          });
        }
      }
      setSemesters(semesters);
      setSelectedSemester("");
      setCurrentStep("semester");
      setStatus("idle");
      setAlert("");

      saveSession({
        portalSessionId: payload.portalSessionId,
        semesters,
        enrollment: values.enrollmentNumber.trim(),
      });

      setValues((current) => ({ ...current, enrollmentNumber: current.enrollmentNumber }));
    } catch (error) {
      setStatus("error");
      setAlert(error.message || errorMessages.generic);
      refreshCaptcha();
    }
  }

  async function handleSemesterSelect(semesterValue, semesterLabel) {
    setAlert("");
    setSelectedSemester(semesterValue);

    if (semesterValue === "ALL") {
      setResult(null);
      setStatus("idle");
      return;
    }

    if (activeService !== "internals" && semesterCache[semesterValue]) {
      setResult(semesterCache[semesterValue]);
      setStatus("success");
      return;
    }

    setResult(null);
    setStatus("loading");

    try {
      if (activeService === "internals") {
        const params = new URLSearchParams({ portalSessionId, internalsOnly: "true" });
        const response = await fetch(
          `${API_BASE}/api/result/semester/${encodeURIComponent(semesterValue)}?${params}`
        );
        const payload = await response.json();

        if (!response.ok) {
          if (response.status === 440) {
            clearSavedSession();
            setAlert("Session expired. Please login again.");
            setCurrentStep("login");
            setPortalSessionId("");
            setSemesters([]);
            setSemesterCache({});
            refreshCaptcha();
            setStatus("idle");
            return;
          }
          throw new Error(payload?.error?.message || "Unable to fetch live internal marks.");
        }

        const fetchedResult = normalizeResult({
          ...payload,
          student: {
            ...payload.student,
            enrollmentNumber:
              payload.student?.enrollmentNumber || values.enrollmentNumber.trim(),
            semester: payload.student?.semester || semesterLabel || semesterValue,
          },
          subjects: payload.subjects || [],
        });

        setStatus("success");
        setResult(fetchedResult);
      } else {
        const params = new URLSearchParams({ portalSessionId });
        const response = await fetch(
          `${API_BASE}/api/result/semester/${encodeURIComponent(semesterValue)}?${params}`
        );
        const payload = await response.json();

        if (!response.ok) {
          if (response.status === 440) {
            clearSavedSession();
            setAlert("Session expired. Please login again.");
            setCurrentStep("login");
            setPortalSessionId("");
            setSemesters([]);
            setSemesterCache({});
            refreshCaptcha();
            setStatus("idle");
            return;
          }
          throw new Error(payload?.error?.message || errorMessages.generic);
        }

        const fetchedResult = normalizeResult({
          ...payload,
          student: {
            ...payload.student,
            enrollmentNumber:
              payload.student?.enrollmentNumber || values.enrollmentNumber.trim(),
            semester: payload.student?.semester || semesterLabel || semesterValue,
          },
          subjects: payload.subjects || [],
        });

        setStatus("success");
        setResult(fetchedResult);
        setSemesterCache((prev) => ({ ...prev, [semesterValue]: fetchedResult }));
      }
    } catch (error) {
      setStatus("error");
      setAlert(error.message || errorMessages.generic);
    }
  }

  function handleLogout() {
    clearSavedSession();
    setCurrentStep("login");
    setPortalSessionId("");
    setSemesters([]);
    setSelectedSemester("");
    setResult(null);
    setAlert("");
    setStatus("idle");
    setSemesterCache({});
    refreshCaptcha();
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

  const showOverallByDefault = currentStep === "semester" && !selectedSemester && hasCachedData && !result && status !== "loading";

  const showSaaSHome = activeService === "home";
  const showSaaSResources = activeService === "resources";
  const isDashboardMode = !showSaaSHome && !showSaaSResources;

  return (
    <main className="relative min-h-screen bg-navy-950 text-navy-50">
      {isDashboardMode && <BackgroundEffects />}

      <div className="relative z-10">
        {isDashboardMode && (
          <HeroSection
            currentStep={currentStep}
            enrollmentNumber={values.enrollmentNumber}
            onLogout={handleLogout}
          />
        )}

        {showSaaSHome && (
          <LandingPage
            onOpenInternals={() => {
              setActiveService("internals");
              setCurrentStep(saved.current ? "semester" : "login");
            }}
            onOpenResults={() => {
              setActiveService("result");
              setCurrentStep(saved.current ? "semester" : "login");
            }}
            onOpenResources={() => setActiveService("resources")}
          />
        )}

        {showSaaSResources && (
          <ResourcesPage onBack={() => setActiveService("home")} />
        )}

        {isDashboardMode && (
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6 lg:px-8">
            {/* Login Form */}
            {(activeService === "result" || activeService === "internals") && currentStep === "login" && (
              <div className="space-y-4 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setActiveService("home")}
                  className="inline-flex items-center gap-2 rounded-xl border border-navy-600/60 bg-navy-800/40 px-3.5 py-2 text-xs font-bold text-navy-100 outline-none transition hover:border-navy-500 hover:bg-navy-700/60 focus-visible:ring-4 focus-visible:ring-accent/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Homepage
                </button>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                  <div className="mx-auto w-full max-w-md lg:mx-0">
                    <ResultForm
                      values={values}
                      errors={errors}
                      captchaImage={captchaImage}
                      isCaptchaLoading={isCaptchaLoading}
                      isLoading={status === "loading" || isCaptchaLoading}
                      onChange={handleChange}
                      onSubmit={handleLogin}
                      onRefreshCaptcha={refreshCaptcha}
                    />
                  </div>
                  <div className="grid gap-4">
                    <ResultSteps />
                  </div>
                </div>
              </div>
            )}

            {/* Semester Selector */}
            {(activeService === "result" || activeService === "internals") && currentStep === "semester" && (
              <div className="grid gap-4">
                <SemesterSelector
                  semesters={semesters}
                  selectedSemester={selectedSemester}
                  onSelect={handleSemesterSelect}
                  isLoading={status === "loading"}
                  hasCachedData={hasCachedData}
                />
              </div>
            )}

            {/* Error */}
            <AnimatePresence mode="wait">
              {(activeService === "result" || activeService === "internals") && alert ? (
                <ErrorAlert
                  key="alert"
                  message={alert}
                  onDismiss={() => setAlert("")}
                />
              ) : null}
            </AnimatePresence>

            {/* Loading */}
            {(activeService === "result" || activeService === "internals") && status === "loading" && currentStep === "semester" ? <LoadingState /> : null}

            {/* Empty state: login page */}
            {(activeService === "result" || activeService === "internals") && currentStep === "login" && !result ? <EmptyState /> : null}

            {/* Empty state: no semester selected and no cached data */}
            {(activeService === "result" || activeService === "internals") && currentStep === "semester" && !selectedSemester && !hasCachedData && status !== "loading" ? (
              <EmptyState message="Select a semester above to view your result." />
            ) : null}

            {/* Single semester result */}
            {activeService === "result" && result && !isAllMode ? (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-4"
              >
                {result.summary?.status === "Internal Only" ? (
                  <div className="space-y-6">
                    {/* Dedicated Internal Marks Card */}
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
                                  <td className="px-4 py-3.5 font-medium text-white max-w-[300px] sm:max-w-none truncate sm:whitespace-normal">
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

                    {/* Final Result Yet to be Released Card */}
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

                    <div className="no-print flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
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

                    <StudentInfoCard student={result.student} />
                    <SummaryCards subjects={result.subjects} summary={result.summary} />
                    <GradePointCard 
                      sgpa={result.summary?.sgpa || "0.00"} 
                      cgpa={result.summary?.cgpa || "0.00"}
                      isCGPAMode={false}
                      delay={0.2}
                    />
                    <MarksTable subjects={result.subjects} />

                    {semesterAnalytics && (
                      <SemesterAnalytics
                        analytics={semesterAnalytics}
                        insights={semesterInsights}
                      />
                    )}
                  </>
                )}
              </motion.section>
            ) : null}

            {/* Single semester internals */}
            {activeService === "internals" && result && !isAllMode ? (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-4"
              >
                <SuccessBanner />
                <StudentInfoCard student={result.student} />
                {result.summary?.status === "Internal Only" && (
                  <InternalOnlyNoticeBanner semester={result.student.semester} />
                )}
                
                {/* Dedicated Internal Marks Table */}
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
                      <thead className="sticky top-0 z-10 bg-navy-800/95 text-xs uppercase backdrop-blur-sm">
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
              </motion.section>
            ) : null}

            {/* Overall analytics (ALL mode) */}
            {activeService === "result" && isAllMode && hasCachedData && status !== "loading" ? (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
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
              </motion.section>
            ) : null}

            {/* Overall analytics by default (show when logged in, no selection, but data exists) */}
            {activeService === "result" && showOverallByDefault ? (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-4"
              >
                <OverallAnalytics
                  analytics={computeOverallAnalytics(semesterCache)}
                  insights={getInsights(null, computeOverallAnalytics(semesterCache), true)}
                />
              </motion.section>
            ) : null}

            {/* ALL selected but no data */}
            {activeService === "result" && isAllMode && !hasCachedData ? (
              <EmptyState message="Fetch at least one semester result to view overall analytics." />
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
