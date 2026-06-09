import { useEffect } from "react";
import { GraduationCap, FileText, BookOpen, BookOpenCheck, Cpu, Lock, Star } from "lucide-react";

export default function AboutPage() {
  // SEO Title
  useEffect(() => {
    document.title = "IPUNex Results | Why Use IPUNex Dashboard";
  }, []);

  const advantages = [
    {
      title: "Instant Internal Marks Lookup",
      desc: "Retrieve continuous internal test grades directly. No need to wait for end-term result publications to study your assessment breakdowns.",
      icon: GraduationCap,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400",
    },
    {
      title: "Comprehensive Semester Marksheets",
      desc: "Securely fetch and display formal end-semester results. View marks, grades, and totals in a single unified table.",
      icon: FileText,
      color: "from-blue-500/20 to-cyan-500/10 text-blue-400",
    },
    {
      title: "GGSIPU GPA Calculation Engine",
      desc: "An accurate mathematical calculator implementing GGSIPU credit regulations: GPA = Σ(C × GP) / ΣC. No rough estimates based on percentages.",
      icon: Cpu,
      color: "from-cyan-500/20 to-blue-500/10 text-cyan-400",
    },
    {
      title: "Previous Year Question Papers",
      desc: "Access a community-driven database of question archives sorted by semesters, syllabus, and course codes.",
      icon: BookOpen,
      color: "from-purple-500/20 to-pink-500/10 text-purple-400",
    },
    {
      title: "Study Notes & Resource Guides",
      desc: "Get lecture handouts, reference book lists, and official subject syllabus outlines shared by top-performing students.",
      icon: BookOpenCheck,
      color: "from-orange-500/20 to-amber-500/10 text-orange-400",
    },
    {
      title: "Bank-Grade Credential Privacy",
      desc: "We prioritize absolute confidentiality. Direct client-side calls route requests to university servers without logging passwords.",
      icon: Lock,
      color: "from-red-500/20 to-orange-500/10 text-red-400",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in space-y-8">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-light bg-cyan/10 px-3 py-1 rounded-full">
          <Star className="h-3.5 w-3.5" />
          Academic Advantages
        </span>
        <h1 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
          Designed for GGSIPU Students
        </h1>
        <p className="text-sm text-navy-300 leading-relaxed">
          Skip the outdated and congested layouts of the official portal. IPUNex consolidates your academic progress under a fast, responsive, and gorgeous user interface.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {advantages.map((adv, i) => {
          const Icon = adv.icon;
          return (
            <article key={i} className="rounded-2xl border border-white/5 bg-[#111827]/40 p-6 flex flex-col justify-between transition duration-200 hover:border-cyan/25 hover:bg-[#111827]/60">
              <div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${adv.color} mb-5`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-heading text-sm font-bold text-white mb-2">{adv.title}</h3>
                <p className="text-xs leading-5 text-navy-300">{adv.desc}</p>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}
