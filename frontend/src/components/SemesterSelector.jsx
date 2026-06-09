import { motion } from "framer-motion";
import { Loader2, Layers } from "lucide-react";

export default function SemesterSelector({ semesters, selectedSemester, onSelect, isLoading, hasCachedData }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-sm font-bold text-white">
            Semester Results
          </h2>
          <p className="text-xs text-navy-400">Select a semester to review grades and analytical breakdown.</p>
        </div>
        {selectedSemester && isLoading && (
          <div className="flex items-center gap-1.5 text-[10px] text-accent-light sm:text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Fetching...
          </div>
        )}
      </div>

      {/* Segmented Control Selector */}
      <div className="relative flex items-center bg-[#09090B] border border-white/5 p-1 rounded-xl overflow-x-auto scrollbar-none gap-1">
        {hasCachedData && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelect("ALL", "All Semesters")}
            className={`relative z-10 shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition duration-200 outline-none select-none ${
              selectedSemester === "ALL" ? "text-white" : "text-navy-400 hover:text-white"
            }`}
          >
            {selectedSemester === "ALL" && (
              <motion.div
                layoutId="activeSemesterTab"
                className="absolute inset-0 bg-[#3B82F6] rounded-lg -z-10 shadow-sm border border-white/5"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Layers className="h-3.5 w-3.5" />
            ALL
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
              className={`relative z-10 shrink-0 px-4 py-2.5 text-xs font-bold rounded-lg transition duration-200 outline-none select-none ${
                isSelected ? "text-white" : "text-navy-400 hover:text-white"
              } ${isLoading && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeSemesterTab"
                  className="absolute inset-0 bg-[#3B82F6] rounded-lg -z-10 shadow-sm border border-white/5"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {sem.label.replace("Semester", "Sem")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
