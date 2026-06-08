import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Award } from "lucide-react";

function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const num = parseFloat(target);
    const decimalPlaces = String(target).split(".")[1]?.length || 0;
    const precision = Math.min(Math.max(decimalPlaces, 1), 2);
    
    if (isNaN(num)) {
      setCount(target);
      return;
    }

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;

      setCount(Number.isInteger(num) ? Math.round(current) : current.toFixed(precision));

      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    }

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);

  return count;
}

export default function GradePointCard({ sgpa, cgpa, isCGPAMode = false, delay = 0 }) {
  const displayedValue = isCGPAMode ? cgpa : sgpa;
  const percentage = isCGPAMode ? (parseFloat(cgpa) * 10).toFixed(1) : (parseFloat(sgpa) * 10).toFixed(1);
  const animatedValue = useCountUp(displayedValue, 800);
  const animatedPercentage = useCountUp(percentage, 1000);
  const label = isCGPAMode ? "CGPA" : "SGPA";
  const description = isCGPAMode ? "Cumulative Grade Point Average" : "Semester Grade Point Average";
  const icon = isCGPAMode ? Award : Target;
  const Icon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-4 shadow-card sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-cyan/20">
              <Icon className="h-5 w-5 text-accent-light" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-navy-300 sm:text-sm">
                {label}
              </p>
              <p className="text-[10px] text-navy-400 sm:text-xs">{description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-400">Grade Point</p>
          <p className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            {animatedValue}
          </p>
          <p className="text-xs text-navy-300">Out of 10</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-400">Percentage</p>
          <p className="font-heading text-3xl font-extrabold text-accent-light sm:text-4xl">
            {animatedPercentage}%
          </p>
          <p className="text-xs text-navy-300">IPU Scale</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-navy-600/50 bg-navy-800/30 p-3">
        <p className="text-[10px] text-navy-300 leading-5">
          <span className="font-semibold text-cyan-light">Grade Point</span> ({label}) is calculated as a weighted average of all subject grades. <span className="font-semibold text-accent-light">Percentage</span> is converted using the formula: {label} × 10
        </p>
      </div>
    </motion.div>
  );
}
