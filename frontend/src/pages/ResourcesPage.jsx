import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Download,
  FileText,
  Filter,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap
} from "lucide-react";

export default function ResourcesPage({ onBack }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");

  const branches = [
    { value: "ALL", label: "All Specializations" },
    { value: "CSE", label: "Computer Science (CSE)" },
    { value: "IT", label: "Information Technology (IT)" },
    { value: "ECE", label: "Electronics & Communication (ECE)" },
    { value: "MAE", label: "Mechanical Engineering (MAE)" }
  ];

  const semesters = [
    { value: "ALL", label: "All Semesters" },
    { value: "1", label: "Sem 1" },
    { value: "2", label: "Sem 2" },
    { value: "3", label: "Sem 3" },
    { value: "4", label: "Sem 4" },
    { value: "5", label: "Sem 5" },
    { value: "6", label: "Sem 6" },
    { value: "7", label: "Sem 7" },
    { value: "8", label: "Sem 8" }
  ];

  const resourceData = [
    // Semester 5 IT/CSE
    { title: "Computer Networks Previous Year Paper (2024)", code: "ETIT-304", branch: "IT", sem: "5", type: "Question Paper", size: "1.8 MB" },
    { title: "Web Technology Lab Manual & Notes", code: "ETIT-308", branch: "IT", sem: "5", type: "Lab Manual", size: "3.2 MB" },
    { title: "Official GGSIPU Syllabus (IT Branch)", code: "GGSIPU-IT-SYLLABUS", branch: "IT", sem: "ALL", type: "Syllabus", size: "840 KB" },
    { title: "Software Engineering Study Guide", code: "ETCS-306", branch: "CSE", sem: "5", type: "Study Guide", size: "2.1 MB" },
    { title: "Compiler Design Mid-Term Paper (2023)", code: "ETCS-302", branch: "CSE", sem: "5", type: "Question Paper", size: "1.2 MB" },
    
    // Semester 3
    { title: "Data Structures End-Term Paper (2023)", code: "ETCS-203", branch: "CSE", sem: "3", type: "Question Paper", size: "1.5 MB" },
    { title: "Database Management Systems Notes", code: "ETCS-207", branch: "CSE", sem: "3", type: "Lecture Notes", size: "4.8 MB" },
    { title: "Digital Electronics Reference Book Chapters", code: "ECE-209", branch: "ECE", sem: "3", type: "Study Guide", size: "6.1 MB" },
    
    // Semester 1
    { title: "Applied Mathematics I Previous Year Paper (2023)", code: "ETMA-101", branch: "ALL", sem: "1", type: "Question Paper", size: "1.1 MB" },
    { title: "Applied Physics I Lab Manual PDF", code: "ETPH-103", branch: "ALL", sem: "1", type: "Lab Manual", size: "2.7 MB" },
    
    // Semester 6
    { title: "Mobile Computing Lecture Slides Complete", code: "ETIT-302", branch: "IT", sem: "6", type: "Lecture Notes", size: "5.4 MB" },
    { title: "Artificial Intelligence End-Term Paper (2024)", code: "ETCS-304", branch: "CSE", sem: "6", type: "Question Paper", size: "1.9 MB" }
  ];

  const filteredResources = useMemo(() => {
    return resourceData.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        selectedBranch === "ALL" ||
        item.branch === "ALL" ||
        item.branch === selectedBranch;

      const matchesSemester =
        selectedSemester === "ALL" ||
        item.sem === "ALL" ||
        item.sem === selectedSemester;

      return matchesSearch && matchesBranch && matchesSemester;
    });
  }, [searchQuery, selectedBranch, selectedSemester]);

  return (
    <main className="relative min-h-screen bg-navy-950 text-navy-50 py-24">
      {/* Background Grid Pattern */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-animated opacity-20" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 800,
            height: 400,
            background:
              "radial-gradient(ellipse at center, rgba(168,85,247,0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-600/60 bg-navy-800/40 px-4 py-2 text-xs font-bold text-navy-100 outline-none transition hover:border-navy-500 hover:bg-navy-700/60 focus-visible:ring-4 focus-visible:ring-accent/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Homepage
        </button>

        {/* Page Title Header */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="h-5 w-5 animate-pulse-soft" />
              <span className="text-xs font-bold uppercase tracking-wider">Resources Vault</span>
            </div>
            <h1 className="mt-2 font-heading text-3xl font-extrabold text-white">Academic Resources Library</h1>
            <p className="mt-2 text-sm text-navy-300">
              Browse syllabus details, query previous year papers, lab manuals, and guides.
            </p>
          </div>
          <span className="self-start rounded-full bg-purple-500/15 border border-purple-500/30 px-3.5 py-1.5 text-xs font-bold text-purple-300">
            {filteredResources.length} files available
          </span>
        </div>

        {/* Search & Filters */}
        <section className="mt-10 grid gap-4 rounded-2xl bg-navy-900/40 p-4 border border-navy-800 glass sm:p-5">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Search by topic, subject code, or resource type (e.g. Web Technology, ETCS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-navy-700 bg-navy-850/60 py-3.5 pr-4 pl-12 text-sm text-white outline-none transition placeholder:text-navy-500 focus:border-purple-500 focus:bg-navy-900 focus:ring-4 focus:ring-purple-500/20"
            />
          </div>

          {/* Selector filters */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-300 mb-2">Specialization / Branch</label>
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-navy-700 bg-navy-850/60 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                >
                  {branches.map((b) => (
                    <option key={b.value} value={b.value} className="bg-navy-900">
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-300 mb-2">Academic Semester</label>
              <div className="relative">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-navy-700 bg-navy-850/60 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                >
                  {semesters.map((s) => (
                    <option key={s.value} value={s.value} className="bg-navy-900">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Grid List */}
        <section className="mt-8 space-y-3">
          {filteredResources.length > 0 ? (
            filteredResources.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-navy-800 bg-navy-900/30 p-4 hover:border-purple-500/20 hover:bg-navy-900/60 transition"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-white leading-snug">{item.title}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-navy-400 font-semibold">
                      <span className="font-mono text-purple-300">{item.code}</span>
                      <span>•</span>
                      <span className="uppercase">{item.type}</span>
                      <span>•</span>
                      <span>Branch: {item.branch}</span>
                      <span>•</span>
                      <span>{item.sem === "ALL" ? "All Semesters" : `Semester ${item.sem}`}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 self-end sm:self-center">
                  <span className="text-xs text-navy-400 font-medium">{item.size}</span>
                  <button className="flex items-center gap-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 px-3.5 py-2 text-xs font-bold text-purple-300 transition hover:bg-purple-500 hover:text-white">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700 bg-navy-900/20 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-base font-bold text-white">No documents matched your filter</h3>
              <p className="mt-1 text-xs text-navy-400 max-w-sm">
                Try revising your search query or selecting a different specialization branch or semester.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
