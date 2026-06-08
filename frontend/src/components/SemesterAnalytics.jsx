import { motion } from "framer-motion";
import {
  LineChart,
  Line,
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

export default function SemesterAnalytics({ analytics, insights }) {
  if (!analytics) return null;

  const {
    percentage,
    avgMarks,
    totalMarks,
    passCount,
    failCount,
    totalSubjects,
    pieData,
    avgInternal,
    avgExternal,
    barData,
    subjectTrend,
    areaData,
    highestSubject,
    weakestSubject,
    sgpa,
  } = analytics;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-cyan/20">
          <BarChart3 className="h-3.5 w-3.5 text-accent-light" />
        </div>
        <h2 className="font-heading text-sm font-bold text-white">Semester Analytics</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <StatCard icon={Target} label="SGPA" value={sgpa || "0.00"} color="from-accent/20 to-accent/5" delay={0.05} />
        <StatCard icon={BarChart3} label="Avg Marks" value={avgMarks} color="from-cyan/20 to-cyan/5" delay={0.1} />
        <StatCard icon={TrendingUp} label="Total Score" value={`${totalMarks}`} color="from-success/20 to-success/5" delay={0.15} />
        <StatCard icon={Shield} label="Pass / Total" value={`${passCount}/${totalSubjects}`} color="from-warning/20 to-warning/5" delay={0.2} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ChartCard title="Subject Score Trend" subtitle="Marks by subject" delay={0.2}>
          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subjectTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.5)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6B7280" }} interval={0} angle={-35} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 9, fill: "#6B7280" }} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: "#3B82F6", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: "#3B82F6", strokeWidth: 2, fill: "#0B1220" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Grade Distribution" subtitle="Subject grades breakdown" delay={0.25}>
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
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ChartCard title="Internal vs External" subtitle="Per subject comparison" delay={0.3}>
          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.5)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6B7280" }} interval={0} angle={-35} textAnchor="end" height={50} />
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

        <ChartCard title="Score Distribution" subtitle="Marks spread across subjects" delay={0.35}>
          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.5)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6B7280" }} interval={0} angle={-35} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 9, fill: "#6B7280" }} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="marks" stroke="#3B82F6" strokeWidth={2} fill="url(#areaGrad)" dot={{ fill: "#3B82F6", r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {highestSubject && (
        <div className="grid gap-3 sm:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-xl border border-success/20 p-3">
            <div className="flex items-center gap-2 text-success-light">
              <Award className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">Highest Scoring Subject</span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-white">{highestSubject.name}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-navy-300 sm:text-xs">
              <span>{highestSubject.code}</span>
              <span className="font-bold text-success-light">{highestSubject.total} marks</span>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-bold text-success-light">{highestSubject.grade}</span>
            </div>
          </motion.div>
          {weakestSubject && weakestSubject.code !== highestSubject?.code && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-xl border border-warning/20 p-3">
              <div className="flex items-center gap-2 text-warning-light">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">Needs Improvement</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-white">{weakestSubject.name}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-navy-300 sm:text-xs">
                <span>{weakestSubject.code}</span>
                <span className="font-bold text-warning-light">{weakestSubject.total} marks</span>
                <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[9px] font-bold text-warning-light">{weakestSubject.grade}</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {insights.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-accent-light" />
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
