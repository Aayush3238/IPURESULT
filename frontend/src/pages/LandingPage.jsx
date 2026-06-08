import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  FileText,
  BookOpen,
  Shield,
  Smartphone,
  Zap,
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Activity,
  Award,
  BookOpenCheck,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  Download,
  Share2
} from "lucide-react";

// Custom Counter Component with on-view animation
function Counter({ targetValue, suffix = "+", duration = 1500 }) {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef(null);

  useEffect(() => {
    let observer;
    const numericTarget = parseFloat(String(targetValue).replace(/[^0-9.]/g, ""));
    const isFloat = String(targetValue).includes(".");

    if (ref.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            let startTime = null;

            const animate = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const currentVal = progress * numericTarget;

              setDisplayValue(isFloat ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString());

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setDisplayValue(String(targetValue));
              }
            };

            requestAnimationFrame(animate);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(ref.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [targetValue, duration]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

export default function LandingPage({ onOpenInternals, onOpenResults, onOpenResources }) {
  const [activePreviewTab, setActivePreviewTab] = useState("internals");

  const scrollToServices = () => {
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const featureCards = [
    {
      title: "Internal Marks",
      description: "Instantly query and fetch internal assessment marks compiled from university data.",
      icon: GraduationCap,
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-400"
    },
    {
      title: "Semester Results",
      description: "Securely retrieve official GGSIPU end-semester marksheets and results in real time.",
      icon: FileText,
      color: "from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-400"
    },
    {
      title: "Previous Year Papers",
      description: "Access a curated archives of previous years' university exams sorted by course and subject.",
      icon: BookOpen,
      color: "from-purple-500/20 to-pink-500/10",
      iconColor: "text-purple-400"
    },
    {
      title: "Notes & Resources",
      description: "Gain access to lecture notes, subject syllabus details, and recommended study reference guides.",
      icon: BookOpenCheck,
      color: "from-orange-500/20 to-amber-500/10",
      iconColor: "text-orange-400"
    },
    {
      title: "Academic Tools",
      description: "Leverage advanced GPA calculators, cumulative analytics, and cohort comparison tools.",
      icon: Cpu,
      color: "from-cyan-500/20 to-blue-500/10",
      iconColor: "text-cyan-400"
    },
    {
      title: "Secure Access",
      description: "Direct end-to-end proxy authentication with university portals ensuring absolute credential privacy.",
      icon: Lock,
      color: "from-red-500/20 to-orange-500/10",
      iconColor: "text-red-400"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-navy-950 text-navy-50 selection:bg-cyan selection:text-white">
      {/* ─── Transparent Glass Header ─── */}
      <header className="glass-navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan text-white shadow-glow">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="font-heading text-sm font-black uppercase tracking-[0.2em] text-white">
                IPUNex
              </span>
              <span className="ml-1.5 rounded bg-cyan/15 px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-cyan-light">
                v1.0
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-navy-300 md:flex">
            <a href="#why-ipunex" className="transition hover:text-white">Why IPUNex</a>
            <a href="#preview" className="transition hover:text-white">Platform Preview</a>
            <a href="#statistics" className="transition hover:text-white">Statistics</a>
            <a href="#services-section" className="transition hover:text-white">Services</a>
            <a href="#security" className="transition hover:text-white">Security</a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenResults}
              className="relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-accent to-cyan px-4 py-2 text-xs font-bold text-white shadow-glow transition hover:from-accent-hover hover:to-cyan-hover"
            >
              Check Results
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section (100vh) ─── */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        {/* Background Video and Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover brightness-130 contrast-115 saturate-125"
          >
            <source src="/vid/bg%20video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-navy-950/50 video-overlay" />
          <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
        </div>

        {/* Large Ambient Glow behind text */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-accent/20 to-cyan/35 blur-[120px] mix-blend-screen opacity-75" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Small Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-cyan-light uppercase">
              <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
              Trusted by GGSIPU Students
            </span>

            {/* Main Heading */}
            <h1 className="flex flex-col gap-2 font-heading leading-[1.05] tracking-tight text-center select-none">
              <span className="font-heavy-italic text-4xl sm:text-6xl md:text-7xl text-white">
                Track Your
              </span>
              <span className="font-heavy-italic text-4xl sm:text-6xl md:text-7xl text-white">
                <span className="yellow-orange-gradient">Results</span> With
              </span>
              <span className="font-handwritten-marker purple-glow-text text-5xl sm:text-7xl md:text-8xl mt-2 tracking-wider block">
                Nexera
              </span>
            </h1>

            {/* Subheading */}
            <p className="max-w-2xl text-sm leading-relaxed text-navy-200 sm:text-lg">
              Access Internal Marks, Semester Results, Resources, and Academic Tools from one unified platform.
            </p>

            {/* CTAs */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={onOpenResults}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-cyan px-6 text-sm font-bold text-white shadow-glow transition hover:from-accent-hover hover:to-cyan-hover"
              >
                Check Results
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button
                onClick={scrollToServices}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-navy-600 bg-navy-800/40 px-6 text-sm font-bold text-white transition hover:border-navy-500 hover:bg-navy-700/60"
              >
                Explore Services
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer" onClick={scrollToServices}>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-navy-500/50 p-1">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-light scroll-indicator-dot" />
          </div>
        </div>
      </section>

      {/* ─── Section 2 — Why IPUNex ─── */}
      <section id="why-ipunex" className="relative border-t border-navy-900 bg-navy-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-light">Advantages</h2>
            <p className="mt-3 font-heading text-3xl font-extrabold text-white sm:text-4xl">Everything a Student Needs</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-navy-300">
              Skip the messy university portal designs. IPUNex consolidates all your academic records under a unified, premium user interface.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glow-border group flex flex-col justify-between rounded-2xl border border-navy-800 bg-navy-900/40 p-6 transition-all duration-300 hover:border-navy-600 hover:bg-navy-900/80"
                >
                  <div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} ${feat.iconColor} mb-6`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white group-hover:text-cyan-light transition">{feat.title}</h3>
                    <p className="mt-3 text-xs leading-relaxed text-navy-300">{feat.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Section 3 — Platform Preview ─── */}
      <section id="preview" className="relative border-t border-navy-900 bg-navy-900/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-light">Interface Showcase</h2>
            <p className="mt-3 font-heading text-3xl font-extrabold text-white sm:text-4xl">Designed for Clarity</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-navy-300">
              Interactive preview showcasing how IPUNex parses intricate academic marksheets into clean, readable dashboard elements.
            </p>
          </div>

          {/* Switch Tab controls */}
          <div className="mt-12 flex justify-center gap-3">
            {[
              { id: "internals", label: "Internal Marks Lookup", icon: GraduationCap },
              { id: "portal", label: "Semester Analytics", icon: Activity },
              { id: "resources", label: "Resource Library", icon: BookOpen }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${activePreviewTab === tab.id
                      ? "bg-gradient-to-r from-accent to-cyan text-white shadow-glow"
                      : "border border-navy-700/60 bg-navy-800/20 text-navy-300 hover:text-white"
                    }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Mockup Panels */}
          <div className="mt-10 flex justify-center">
            <div className="w-full max-w-4xl rounded-2xl border border-navy-700/50 bg-navy-900/50 p-3 sm:p-6 glass">
              <AnimatePresence mode="wait">
                {activePreviewTab === "internals" && (
                  <motion.div
                    key="internals"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Header mockup */}
                    <div className="flex flex-col gap-2 border-b border-navy-700/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs font-bold text-accent-light uppercase tracking-wider">Student Profile</div>
                        <h4 className="font-heading text-lg font-bold text-white">Rahul Sharma</h4>
                        <p className="text-xs text-navy-400">Enrollment: 01496402722 | IT Branch</p>
                      </div>
                      <span className="self-start rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 sm:self-center">
                        Total Internals: 142/150
                      </span>
                    </div>
                    {/* Subject cards mockup */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { code: "ETCS-302", name: "Compiler Design", marks: 24, max: 25 },
                        { code: "ETIT-304", name: "Computer Networks", marks: 23, max: 25 },
                        { code: "ETCS-306", name: "Software Engineering", marks: 25, max: 25 },
                        { code: "ETIT-308", name: "Web Technology", marks: 23, max: 25 },
                        { code: "ETCS-310", name: "Artificial Intelligence", marks: 24, max: 25 },
                        { code: "ETHS-312", name: "Values & Ethics", marks: 23, max: 25 }
                      ].map((sub, index) => (
                        <div key={index} className="flex items-center justify-between rounded-xl bg-navy-800/40 p-3.5 border border-navy-700/30">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-cyan-light">{sub.code}</span>
                            <p className="text-xs font-bold text-white">{sub.name}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-white">{sub.marks}</span>
                            <span className="text-[10px] text-navy-400">/{sub.max}</span>
                            <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-navy-700">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                style={{ width: `${(sub.marks / sub.max) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activePreviewTab === "portal" && (
                  <motion.div
                    key="portal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Stat items */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { title: "CGPA Score", val: "9.18", icon: Award, tint: "text-cyan-light bg-cyan/10" },
                        { title: "Total Credits", val: "104 / 104", icon: BookOpen, tint: "text-blue-400 bg-blue-500/10" },
                        { title: "Passing Rate", val: "100%", icon: CheckCircle2, tint: "text-emerald-400 bg-emerald-500/10" },
                        { title: "Rank Cohort", val: "Top 3%", icon: Sparkles, tint: "text-purple-400 bg-purple-500/10" }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="rounded-xl border border-navy-700/30 bg-navy-800/30 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-navy-400 uppercase">{item.title}</span>
                              <div className={`p-1 rounded-lg ${item.tint}`}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                            </div>
                            <p className="mt-2 text-lg font-black text-white">{item.val}</p>
                          </div>
                        );
                      })}
                    </div>
                    {/* SVG Chart mockup */}
                    <div className="rounded-xl border border-navy-700/30 bg-navy-800/20 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-white">SGPA Trend Over Semesters</span>
                        <span className="text-[10px] text-navy-400">Regular Semester Checks</span>
                      </div>
                      <div className="relative h-40 w-full flex items-end">
                        {/* Mock axis lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {[10, 8, 6, 4].map((gridline) => (
                            <div key={gridline} className="w-full border-t border-navy-800/40 text-[9px] text-navy-500 pt-1">
                              {gridline}.0
                            </div>
                          ))}
                        </div>
                        {/* Line chart drawn in SVG */}
                        <svg className="h-full w-full z-10" viewBox="0 0 400 120" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Filled path */}
                          <path
                            d="M 20 90 L 100 80 L 180 60 L 260 40 L 340 30 L 380 20 L 380 120 L 20 120 Z"
                            fill="url(#chart-glow)"
                          />
                          {/* Line path */}
                          <path
                            d="M 20 90 L 100 80 L 180 60 L 260 40 L 340 30 L 380 20"
                            fill="none"
                            stroke="var(--color-cyan)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          {/* Circle indicators */}
                          {[
                            { x: 20, y: 90, label: "8.1" },
                            { x: 100, y: 80, label: "8.3" },
                            { x: 180, y: 60, label: "8.8" },
                            { x: 260, y: 40, label: "9.2" },
                            { x: 340, y: 30, label: "9.4" },
                            { x: 380, y: 20, label: "9.6" }
                          ].map((pt, index) => (
                            <g key={index}>
                              <circle cx={pt.x} cy={pt.y} r="4" fill="var(--color-cyan-light)" />
                              <circle cx={pt.x} cy={pt.y} r="8" fill="var(--color-cyan)" fillOpacity="0.2" />
                              <text x={pt.x - 6} y={pt.y - 12} fill="white" fontSize="7" fontWeight="bold">
                                {pt.label}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                      <div className="mt-2 flex justify-between px-3 text-[9px] font-bold text-navy-400 uppercase">
                        <span>Sem 1</span>
                        <span>Sem 2</span>
                        <span>Sem 3</span>
                        <span>Sem 4</span>
                        <span>Sem 5</span>
                        <span>Sem 6</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activePreviewTab === "resources" && (
                  <motion.div
                    key="resources"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-navy-700/50 pb-4">
                      <div>
                        <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Resources Archives</div>
                        <h4 className="font-heading text-base font-bold text-white">B.Tech Information Technology</h4>
                      </div>
                      <div className="text-xs text-navy-400">Semester 5</div>
                    </div>
                    {/* List of files mockup */}
                    <div className="divide-y divide-navy-700/40">
                      {[
                        { title: "Computer Networks Previous Year Paper (2024)", type: "PDF Document", size: "1.8 MB" },
                        { title: "Web Technology Lab Manual & Notes", type: "PDF Document", size: "3.2 MB" },
                        { title: "Official GGSIPU Syllabus (IT Branch)", type: "PDF Document", size: "840 KB" },
                        { title: "Software Engineering Study Guide", type: "PDF Document", size: "2.1 MB" }
                      ].map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                              <FileText className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{file.title}</p>
                              <span className="text-[10px] text-navy-400">{file.type} • {file.size}</span>
                            </div>
                          </div>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-navy-300 transition hover:bg-navy-700 hover:text-white">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4 — Statistics ─── */}
      <section id="statistics" className="relative border-t border-navy-900 bg-navy-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white sm:text-5xl">
                <Counter targetValue="50000" suffix="+" />
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-navy-400">Students Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white sm:text-5xl">
                <Counter targetValue="200000" suffix="+" />
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-navy-400">Results Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white sm:text-5xl">
                <Counter targetValue="100" suffix="+" />
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-navy-400">Affiliated Colleges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white sm:text-5xl">
                <Counter targetValue="99.9" suffix="%" />
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-navy-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 5 — Services ─── */}
      <section id="services-section" className="relative border-t border-navy-900 bg-navy-900/10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-light">Academic Portal</h2>
            <p className="mt-3 font-heading text-3xl font-extrabold text-white sm:text-4xl">Available Services</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-navy-300">
              Query internal test scores, view cumulative semester SGPA summaries, or search the document database.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Service 1: Internal Marks */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-2xl p-6 border border-emerald-500/15 flex flex-col justify-between min-h-[300px] hover:border-emerald-500/30 transition-all duration-300"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-xl font-bold text-white">Internal Marks</h3>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-navy-300">
                  Search internal assessment marks. Enter your roll number to fetch the marks stored from the parsed university database.
                </p>
              </div>
              <button
                onClick={onOpenInternals}
                className="mt-8 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 transition"
              >
                Launch Assessment
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>

            {/* Service 2: Semester Results */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-accent/15 flex flex-col justify-between min-h-[300px] hover:border-accent/30 transition-all duration-300"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent-light mb-6">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-xl font-bold text-white">Semester Results</h3>
                  <span className="rounded-full bg-cyan/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-light">Live Login</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-navy-300">
                  Secure login utility which interfaces directly with the GGSIPU student portal database to extract marks.
                </p>
              </div>
              <button
                onClick={onOpenResults}
                className="mt-8 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-cyan py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 transition"
              >
                Check Results
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>

            {/* Service 3: Resources */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-purple-500/15 flex flex-col justify-between min-h-[300px] hover:border-purple-500/30 transition-all duration-300"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-6">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-xl font-bold text-white">Academic Resources</h3>
                  <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400">Library</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-navy-300">
                  Free library containing previous year question papers, lab manuals, syllabuses, and lecture notes for all colleges.
                </p>
              </div>
              <button
                onClick={onOpenResources}
                className="mt-8 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 transition"
              >
                Browse Library
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Section 6 — Trust & Security ─── */}
      <section id="security" className="relative border-t border-navy-900 bg-navy-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            <div className="lg:col-span-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-light">Reliability & Privacy</h2>
              <p className="mt-3 font-heading text-3xl font-extrabold text-white sm:text-4xl">Built for Students. Designed for Reliability.</p>
              <p className="mt-4 text-xs leading-relaxed text-navy-300">
                IPUNex acts as a client-side layout layer. Your login credentials are sent directly to the official university servers. We do not store, view, or log any passwords or records.
              </p>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-7 grid gap-6 sm:grid-cols-2">
              {[
                { title: "Secure Access", desc: "No cookies or session parameters are shared outside official university proxy connections.", icon: Shield },
                { title: "Fast Performance", desc: "Parsed outputs are optimized using locally cached data to load your grades under 1 second.", icon: Zap },
                { title: "Mobile Friendly", desc: "Responsive layout enables quick grade checks on tablets, phones, and computers.", icon: Smartphone },
                { title: "Privacy First", desc: "We adhere strictly to client-side encryption. Academic statistics remain visible only to you.", icon: Lock }
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={idx} className="flex gap-4 rounded-xl border border-navy-800 bg-navy-900/30 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan/15 text-cyan-light">
                      <ItemIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-white">{item.title}</h4>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-navy-300">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 7 — Footer ─── */}
      <footer className="relative border-t border-navy-900 bg-navy-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 pb-12">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan text-white shadow-glow">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-heading text-sm font-black uppercase tracking-wider text-white">IPUNex</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-navy-400">
                A premium, modern dashboard environment interface built to render student assessments and academic reports elegantly.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</h4>
              <ul className="mt-4 space-y-2 text-xs text-navy-400">
                <li><a href="#why-ipunex" className="hover:text-cyan-light transition">Why IPUNex</a></li>
                <li><a href="#preview" className="hover:text-cyan-light transition">Platform Showcase</a></li>
                <li><a href="#services-section" className="hover:text-cyan-light transition">Portal Services</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Services</h4>
              <ul className="mt-4 space-y-2 text-xs text-navy-400">
                <li><button onClick={onOpenInternals} className="hover:text-cyan-light transition text-left">Internal Marks Check</button></li>
                <li><button onClick={onOpenResults} className="hover:text-cyan-light transition text-left">Semester Result Login</button></li>
                <li><button onClick={onOpenResources} className="hover:text-cyan-light transition text-left">Resource Catalog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Academic System</h4>
              <ul className="mt-4 space-y-2 text-xs text-navy-400">
                <li>Guru Gobind Singh Indraprastha University</li>
                <li>Dwarka, New Delhi</li>
                <li>Student Search Portal Integration</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-navy-900 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-navy-500">
            <p>&copy; {new Date().getFullYear()} IPUNex. Built independently for the GGSIPU academic community.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-cyan-light transition">Privacy Policy</span>
              <span className="cursor-pointer hover:text-cyan-light transition">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
