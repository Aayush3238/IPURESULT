import { useState } from "react";
import { KeyRound, ShieldAlert, FileText, LayoutDashboard, Eye, Activity, CheckSquare, BarChart3, Smartphone, Download, HelpCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass rounded-xl border border-white/5 bg-navy-800/10 transition hover:border-white/10">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left outline-none"
      >
        <span className="text-xs font-bold text-white sm:text-sm">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-navy-300 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="border-t border-white/5 p-4 pt-3 text-xs leading-5 text-navy-200">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginAnalyticsInfo() {
  const timelineSteps = [
    {
      num: 1,
      title: "Enter Details",
      desc: "Enter your enrollment number and university portal password.",
      icon: KeyRound,
      color: "from-blue-500/20 to-cyan-500/20 text-cyan-light",
    },
    {
      num: 2,
      title: "Verify Captcha",
      desc: "Complete the captcha verification.",
      icon: ShieldAlert,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400",
    },
    {
      num: 3,
      title: "Fetch Records",
      desc: "We securely retrieve your academic records from the official university system.",
      icon: FileText,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400",
    },
    {
      num: 4,
      title: "Organize Data",
      desc: "Your marks and academic data are organized into an easy-to-read dashboard.",
      icon: LayoutDashboard,
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-400",
    },
    {
      num: 5,
      title: "View Analytics",
      desc: "View semester-wise performance, subject breakdowns, SGPA, CGPA and academic insights.",
      icon: BarChart3,
      color: "from-rose-500/20 to-pink-500/20 text-rose-450",
    },
  ];

  const features = [
    {
      title: "Clean Result Visualization",
      desc: "No more messy PDF layouts. Review clean, organized tables optimized for desktop and mobile.",
      icon: Eye,
    },
    {
      title: "Semester Analytics",
      desc: "View overall progress trends, check patterns, and look at subject weights visually.",
      icon: Activity,
    },
    {
      title: "Subject-wise Breakdown",
      desc: "Easily check internal assessments, external marks, and total marks across all papers.",
      icon: CheckSquare,
    },
    {
      title: "SGPA & CGPA Insights",
      desc: "Accurate GPA calculations using official GGSIPU mathematical guidelines.",
      icon: BarChart3,
    },
    {
      title: "Mobile-Friendly Dashboard",
      desc: "A fully responsive, touch-friendly UI designed to look beautiful on all screen sizes.",
      icon: Smartphone,
    },
    {
      title: "Exportable Reports",
      desc: "Print your dashboard directly or download optimized clean reports for offline tracking.",
      icon: Download,
    },
  ];

  const faqs = [
    {
      question: "Where can I find my enrollment number?",
      answer: "Your 10-to-12 digit enrollment number is printed on your official GGSIPU admit card, registration slips, or college student ID. Ensure you type it without spaces or hyphens.",
    },
    {
      question: "What if my password is incorrect?",
      answer: "Try common portal password formats (e.g. your father's name in CAPITAL LETTERS exactly as registered). If login continues to fail, log in to the official GGSIPU student portal directly to verify/reset it, or contact your college registrar.",
    },
    {
      question: "Why is a captcha required?",
      answer: "The captcha is a real-time security check requested directly by the GGSIPU server to prevent bot traffic. We communicate directly and securely with GGSIPU to authenticate you, requiring captcha inputs exactly as shown.",
    },
    {
      question: "Why is the university server slow?",
      answer: "During weeks when semester results or assessments are released, the GGSIPU servers experience significant traffic. Since IPUNex Results performs live queries, speed depends on the responsiveness of the university database.",
    },
  ];

  return (
    <div className="space-y-8 mt-6">
      
      {/* SECTION 3: How Result Fetching Works */}
      <section className="glass rounded-2xl p-6 shadow-card">
        <div className="text-center mb-6">
          <h2 className="font-heading text-base font-bold text-white sm:text-lg">
            How Results Are Retrieved
          </h2>
          <p className="text-xs text-navy-300 mt-1">
            We provide a simplified interface for accessing your official academic records.
          </p>
        </div>

        {/* Desktop timeline */}
        <div className="hidden lg:grid grid-cols-5 gap-3 relative">
          {/* Connector line */}
          <div className="absolute top-14 left-8 right-8 h-0.5 bg-navy-600/30 -z-10" />
          
          {timelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="text-center flex flex-col items-center">
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} border border-white/5 shadow-md relative`}>
                  <Icon className="h-6 w-6" />
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy-700 border border-white/10 text-[10px] font-bold text-white">
                    {step.num}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{step.title}</h4>
                <p className="text-[10px] leading-4 text-navy-300 max-w-[150px]">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Mobile timeline */}
        <div className="lg:hidden space-y-5 relative pl-4 border-l border-navy-600/30">
          {timelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative flex items-start gap-4">
                <div className="absolute -left-[29px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 border border-navy-600 text-xs font-bold text-white">
                  {step.num}
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} border border-white/5`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{step.title}</h4>
                  <p className="text-[11px] leading-4 text-navy-300 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Why Use IPUNex Results */}
      <section className="glass rounded-2xl p-6 shadow-card">
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-light">Features</p>
          <h2 className="mt-1 font-heading text-base font-bold text-white sm:text-lg">
            Why Use IPUNex Results
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <article key={i} className="rounded-xl border border-white/5 bg-[#111827]/40 p-4 transition duration-200 hover:border-cyan/25 hover:bg-[#111827]/60">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10 text-cyan-light">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                <p className="mt-1 text-[11px] leading-4 text-navy-300">{feat.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: Help & Support */}
      <section className="glass rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-800 text-cyan-light border border-white/5">
            <HelpCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-white">
              Help & Support
            </h2>
            <p className="text-xs text-navy-300">Frequently Asked Questions</p>
          </div>
        </div>

        <div className="grid gap-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

    </div>
  );
}
