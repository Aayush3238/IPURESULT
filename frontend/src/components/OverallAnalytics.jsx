import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Target,
  Zap,
  Award,
  AlertTriangle,
  BarChart3,
  Shield,
  Activity,
  GraduationCap,
  Layers,
} from "lucide-react";

const CHART_COLORS = ["#3B82F6", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#EC4899", "#14B8A6"];

const INSIGHT_COLORS = {
  success: { bg: "bg-success/10", border: "border-success/20", text: "text-success-light", icon: "text-success" },
  warning: { bg: "bg-warning/10", border: "border-warning/20", text: "text-warning-light", icon: "text-warning" },
  accent: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent-light", icon: "text-accent" },
  cyan: { bg: "bg-cyan/10", border: "border-cyan/20", text: "text-cyan-light", icon: "text-cyan" },
};

const ICON_MAP = { strongest: Award, weakest: AlertTriangle, trend: TrendingUp, performance: BarChart3, highlight: Zap };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl border border-navy-600 px-3 py-2 shadow-card">
      {label && <p className="mb-1 text-[10px] font-bold uppercase text-navy-400">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl border border-navy-600 px-3 py-2 shadow-card">
      <p className="text-xs font-semibold" style={{ color: payload[0].payload.fill }}>
        Grade {payload[0].name}: {payload[0].value} subjects
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-xl p-3 shadow-card transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5 sm:p-4"
    >
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${color} transition-transform duration-300 hover:scale-110 sm:mb-3 sm:h-9 sm:w-9`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-semibold text-navy-300 sm:text-xs">{label}</p>
      <p className="mt-0.5 font-heading text-base font-extrabold text-white sm:text-lg">{value}</p>
    </motion.div>
  );
}

function InsightCard({ insight, index }) {
  const colors = INSIGHT_COLORS[insight.color] || INSIGHT_COLORS.accent;
  const Icon = ICON_MAP[insight.type] || Zap;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.35 }}
      className={`glass rounded-xl p-3 ${colors.border} border transition-all duration-300 hover:shadow-glow sm:p-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
          <Icon className={`h-4 w-4 ${colors.icon}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400">{insight.label}</p>
          <p className={`mt-0.5 text-sm font-bold ${colors.text}`}>{insight.value}</p>
          <p className="mt-0.5 text-xs text-navy-300">{insight.detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({ title, subtitle, children, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="glass rounded-2xl p-3 shadow-card sm:p-5"
    >
      <div className="mb-3">
        <h3 className="font-heading text-xs font-bold text-white sm:text-sm">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[10px] text-navy-400 sm:text-xs">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export default function OverallAnalytics({ analytics, insights }) {
  if (!analytics) return null;

  const {
    semestersLoaded,
    overallPercentage,
    overallAvgMarks,
    overallPassCount,
    totalSubjects,
    pieData,
    avgInternalAll,
    avgExternalAll,
    internalVsExternal,
    growthData,
    growthPercent,
    strongestSemester,
    weakestSemester,
    highestSubjectAll,
    weakestSubjectAll,
  } = analytics;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/20 to-accent/20">
          <Layers className="h-3.5 w-3.5 text-cyan-light" />
        </div>
        <div>
          <h2 className="font-heading text-sm font-bold text-white">Overall Analytics</h2>
          <p className="text-[10px] text-navy-400">{semestersLoaded} semester{semestersLoaded !== 1 ? "s" : ""} loaded</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <StatCard icon={GraduationCap} label="Overall %" value={`${overallPercentage}%`} color="from-accent/20 to-accent/5" delay={0.05} />
        <StatCard icon={BarChart3} label="Avg Marks" value={overallAvgMarks} color="from-cyan/20 to-cyan/5" delay={0.1} />
        <StatCard icon={Activity} label="Growth" value={`${growthPercent > 0 ? "+" : ""}${growthPercent}%`} color={growthPercent >= 0 ? "from-success/20 to-success/5" : "from-error/20 to-error/5"} delay={0.15} />
        <StatCard icon={Shield} label="Pass / Total" value={`${overallPassCount}/${totalSubjects}`} color="from-success/20 to-success/5" delay={0.2} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ChartCard title="Overall Grade Distribution" subtitle="All subjects across semesters" delay={0.2}>
          <div className="flex h-[200px] items-center justify-center sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            {pieData.map((entry, i) => (
              <span key={entry.name} className="inline-flex items-center gap-1 text-[9px] font-semibold text-navy-300 sm:text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Internal vs External by Semester" subtitle="Average score comparison" delay={0.25}>
          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={internalVsExternal} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.5)" />
                <XAxis dataKey="semester" tick={{ fontSize: 9, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 9, fill: "#6B7280" }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="internal" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Internal" />
                <Bar dataKey="external" fill="#06B6D4" radius={[3, 3, 0, 0]} name="External" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex justify-center gap-4">
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-navy-300 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Internal
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-navy-300 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> External
            </span>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ChartCard title="Marks Growth Trend" subtitle="Percentage improvement across semesters" delay={0.3}>
          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.5)" />
                <XAxis dataKey="semester" tick={{ fontSize: 9, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 9, fill: "#6B7280" }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="growth" stroke="#22C55E" strokeWidth={2} fill="url(#growthGrad)" dot={{ fill: "#22C55E", r: 3, strokeWidth: 0 }} name="Growth %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Score Overview" subtitle="Internal vs external average across all semesters" delay={0.35}>
          <div className="flex h-[200px] items-center justify-center sm:h-[240px]">
            <div className="grid grid-cols-2 gap-4 px-4">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 sm:h-20 sm:w-20">
                  <p className="font-heading text-2xl font-extrabold text-accent-light sm:text-3xl">{avgInternalAll}</p>
                </div>
                <p className="text-[10px] font-bold uppercase text-navy-400 sm:text-xs">Avg Internal</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan/10 sm:h-20 sm:w-20">
                  <p className="font-heading text-2xl font-extrabold text-cyan-light sm:text-3xl">{avgExternalAll}</p>
                </div>
                <p className="text-[10px] font-bold uppercase text-navy-400 sm:text-xs">Avg External</p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {strongestSemester && strongestSemester.semester !== "-" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-xl border border-success/20 p-3">
            <div className="flex items-center gap-2 text-success-light">
              <Award className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">Strongest Semester</span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-white">Semester {strongestSemester.semester}</p>
            <p className="mt-0.5 text-[10px] text-navy-300">
              Percentage: <span className="font-bold text-success-light">{strongestSemester.percentage}%</span>
            </p>
          </motion.div>
        )}
        {weakestSemester && weakestSemester.semester !== "-" && weakestSemester.semester !== strongestSemester?.semester && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-xl border border-warning/20 p-3">
            <div className="flex items-center gap-2 text-warning-light">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">Needs Attention</span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-white">Semester {weakestSemester.semester}</p>
            <p className="mt-0.5 text-[10px] text-navy-300">
              Percentage: <span className="font-bold text-warning-light">{weakestSemester.percentage}%</span>
            </p>
          </motion.div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {highestSubjectAll && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-xl border border-success/20 p-3">
            <div className="flex items-center gap-2 text-success-light">
              <Award className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">Best Subject Overall</span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-white">{highestSubjectAll.name}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-navy-300 sm:text-xs">
              <span>{highestSubjectAll.code}</span>
              <span className="font-bold text-success-light">{highestSubjectAll.total} marks</span>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-bold text-success-light">{highestSubjectAll.grade}</span>
            </div>
          </motion.div>
        )}
        {weakestSubjectAll && weakestSubjectAll.code !== highestSubjectAll?.code && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass rounded-xl border border-warning/20 p-3">
            <div className="flex items-center gap-2 text-warning-light">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">Weakest Subject Overall</span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-white">{weakestSubjectAll.name}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-navy-300 sm:text-xs">
              <span>{weakestSubjectAll.code}</span>
              <span className="font-bold text-warning-light">{weakestSubjectAll.total} marks</span>
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[9px] font-bold text-warning-light">{weakestSubjectAll.grade}</span>
            </div>
          </motion.div>
        )}
      </div>

      {insights.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-cyan-light" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-navy-300 sm:text-xs">Performance Insights</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
