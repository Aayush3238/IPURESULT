import { useEffect, useRef, useState } from "react";
import { BadgeCheck, BookOpen, Target, Trophy } from "lucide-react";
import { calculateSemesterGrades } from "../utils/grading.js";

function useCountUp(target, duration = 800) {
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

function SummaryCard({ label, icon: Icon, gradient, iconColor, valueColor, value, suffix }) {
  const displayValue = useCountUp(value);

  return (
    <div className="group glass rounded-2xl p-4 shadow-card transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
      <div
        className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} transition-transform duration-300 group-hover:scale-110 sm:mb-3 sm:h-10 sm:w-10`}
      >
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
      </div>
      <p className="text-[11px] font-semibold text-navy-300 sm:text-xs">{label}</p>
      <p className={`mt-0.5 font-heading text-lg font-extrabold sm:text-xl ${valueColor}`}>
        {displayValue}{suffix || ""}
      </p>
    </div>
  );
}

export default function SummaryCards({ subjects, summary }) {
  const semesterGrades = calculateSemesterGrades(subjects);
  const totalMarks = subjects.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const maxPossible = subjects.length * 100;
  const sgpa = summary?.sgpa || semesterGrades.sgpa;
  const passCount = subjects.filter((s) => s.gradePoint > 0).length;

  const cards = [
    {
      key: "totalMarks",
      label: "Total Marks",
      icon: Trophy,
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent-light",
      valueColor: "text-accent-light",
      value: totalMarks,
      suffix: `/${maxPossible}`,
    },
    {
      key: "sgpa",
      label: "SGPA",
      icon: Target,
      gradient: "from-cyan/20 to-cyan/5",
      iconColor: "text-cyan-light",
      valueColor: "text-cyan-light",
      value: Number(sgpa),
      suffix: "",
    },
    {
      key: "credits",
      label: "Total Credits",
      icon: BookOpen,
      gradient: "from-success/20 to-success/5",
      iconColor: "text-success-light",
      valueColor: "text-success-light",
      value: summary?.totalCredits || semesterGrades.totalCredits,
      suffix: "",
    },
    {
      key: "status",
      label: "Result Status",
      icon: BadgeCheck,
      gradient: "from-warning/20 to-warning/5",
      iconColor: "text-warning-light",
      valueColor: "text-warning-light",
      value: passCount === subjects.length ? "Passed" : "Partial",
      suffix: "",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ key, label, icon, gradient, iconColor, valueColor, value, suffix }) => (
        <SummaryCard
          key={key}
          label={label}
          icon={icon}
          gradient={gradient}
          iconColor={iconColor}
          valueColor={valueColor}
          value={value}
          suffix={suffix}
        />
      ))}
    </section>
  );
}
