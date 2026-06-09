import { useEffect } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, FileText, BookOpen, ArrowRight, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ServicesPage() {
  const { isAuthenticated } = useAuth();

  // SEO Title
  useEffect(() => {
    document.title = "IPUNex Results | Services Offered";
  }, []);

  const services = [
    {
      title: "Internal Marks Lookup",
      desc: "Retrieve internal continuous assessment grades in real-time before external exams end.",
      icon: GraduationCap,
      path: isAuthenticated ? "/internal-marks" : "/login",
      color: "border-emerald-500/15 hover:border-emerald-500/30",
      btnColor: "from-emerald-500 to-teal-500",
      badge: "Live",
      btnText: "Launch Assessment",
    },
    {
      title: "Semester Results Check",
      desc: "Connect directly with GGSIPU databases to extract marks, compute SGPA, and view progress graphs.",
      icon: FileText,
      path: isAuthenticated ? "/results" : "/login",
      color: "border-blue-500/15 hover:border-blue-500/30",
      btnColor: "from-[#3B82F6] to-[#06B6D4]",
      badge: "Live Login",
      btnText: "Check Results",
    },
    {
      title: "Academic Resource Library",
      desc: "Explore question papers, syllabus regulations, and lecture notes curated by courses.",
      icon: BookOpen,
      path: "/resources",
      color: "border-purple-500/15 hover:border-purple-500/30",
      btnColor: "from-purple-500 to-pink-500",
      badge: "Free Catalog",
      btnText: "Browse Library",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in space-y-8">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-light bg-cyan/10 px-3 py-1 rounded-full">
          <Settings className="h-3.5 w-3.5" />
          Academic Portal
        </span>
        <h1 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
          Available Services
        </h1>
        <p className="text-sm text-navy-300 leading-relaxed">
          Access your continuous assessment sheets, compile end-term results dashboards, or explore study resources catalog files.
        </p>
      </div>

      {/* Grid of services */}
      <div className="grid gap-6 md:grid-cols-3">
        {services.map((serv, i) => {
          const Icon = serv.icon;
          return (
            <div key={i} className={`glass rounded-2xl p-6 border ${serv.color} flex flex-col justify-between min-h-[300px] transition-all duration-300`}>
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] text-cyan-light border border-white/5 mb-5">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-white">{serv.title}</h3>
                  <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-light">{serv.badge}</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-navy-300">{serv.desc}</p>
              </div>
              
              <Link
                to={serv.path}
                className={`mt-8 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${serv.btnColor} py-3 text-xs font-bold text-white shadow-glow hover:brightness-110 transition`}
              >
                <span>{serv.btnText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

    </div>
  );
}
