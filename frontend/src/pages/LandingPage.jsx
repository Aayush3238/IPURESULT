import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  FileText,
  BookOpen,
  Shield,
  Smartphone,
  Zap,
  ArrowRight,
  BookOpenCheck,
  Lock,
  Cpu,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  // Set document title and SEO description
  useEffect(() => {
    document.title = "IPUNex Results | GGSIPU Academic Performance Dashboard";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Track your GGSIPU internal marks, continuous assessment grades, semester results, and calculate SGPA/CGPA with our premium academic dashboard."
      );
    }
  }, []);

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#09090B] text-[#F8FAFC] selection:bg-cyan selection:text-white">
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
              <Link
                to="/results"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-cyan px-6 text-sm font-bold text-white shadow-glow transition hover:from-accent-hover hover:to-cyan-hover"
              >
                Check Results
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <button
                type="button"
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
                  Login through the GGSIPU portal to fetch internal assessment marks directly from the university system.
                </p>
              </div>
              <Link
                to="/internal-marks"
                className="mt-8 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 transition"
              >
                Launch Assessment
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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
              <Link
                to="/results"
                className="mt-8 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-cyan py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 transition"
              >
                Check Results
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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
              <Link
                to="/resources"
                className="mt-8 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 transition"
              >
                Browse Library
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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
    </div>
  );
}

