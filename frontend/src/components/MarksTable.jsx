const gradeStyles = {
  O: "bg-cyan/15 text-cyan-light ring-cyan/30",
  "A+": "bg-success/15 text-success-light ring-success/30",
  A: "bg-accent/15 text-accent-light ring-accent/30",
  "B+": "bg-warning/15 text-warning-light ring-warning/30",
  B: "bg-warning/10 text-warning-light ring-warning/20",
  C: "bg-navy-600/40 text-navy-100 ring-navy-500/40",
  P: "bg-navy-700/60 text-navy-200 ring-navy-500/40",
  F: "bg-error/15 text-error-light ring-error/30",
};

function MobileCard({ subject }) {
  return (
    <div className="rounded-xl border border-navy-600/50 bg-navy-800/30 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold text-accent-light">
            {subject.code}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-white">
            {subject.name}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 min-w-[44px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
            gradeStyles[subject.grade] || gradeStyles.A
          }`}
        >
          {subject.grade}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-navy-800/50 px-2 py-1.5">
          <p className="text-[10px] font-bold uppercase text-navy-400">Internal</p>
          <p className="text-sm font-semibold text-navy-100">{subject.internal}</p>
        </div>
        <div className="rounded-lg bg-navy-800/50 px-2 py-1.5">
          <p className="text-[10px] font-bold uppercase text-navy-400">External</p>
          <p className="text-sm font-semibold text-navy-100">{subject.external}</p>
        </div>
        <div className="rounded-lg bg-navy-800/50 px-2 py-1.5">
          <p className="text-[10px] font-bold uppercase text-navy-400">Total</p>
          <p className="text-sm font-bold text-white">{subject.total}</p>
        </div>
      </div>
    </div>
  );
}

export default function MarksTable({ subjects }) {
  return (
    <section className="glass rounded-2xl shadow-card overflow-hidden">
      <div className="border-b border-navy-600/50 p-4 sm:p-6">
        <h2 className="font-heading text-lg font-bold text-white">
          Subject Marks
        </h2>
        <p className="mt-1 text-sm text-navy-300">
          Internal, external and total marks by subject.
        </p>
      </div>

      {/* Mobile: card layout */}
      <div className="divide-y divide-navy-600/30 sm:hidden">
        <div className="space-y-3 p-4">
          {subjects.map((subject) => (
            <MobileCard key={subject.code} subject={subject} />
          ))}
        </div>
      </div>

      {/* Desktop: table layout */}
      <div className="hidden max-h-[520px] overflow-auto sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-navy-800/95 text-xs uppercase backdrop-blur-sm">
            <tr>
              <th className="px-5 py-3.5 font-bold text-navy-300">Code</th>
              <th className="px-5 py-3.5 font-bold text-navy-300">Subject</th>
              <th className="px-5 py-3.5 font-bold text-navy-300">Internal</th>
              <th className="px-5 py-3.5 font-bold text-navy-300">External</th>
              <th className="px-5 py-3.5 font-bold text-navy-300">Total</th>
              <th className="px-5 py-3.5 font-bold text-navy-300">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-600/30">
            {subjects.map((subject, index) => (
              <tr
                key={subject.code}
                className={`transition-colors hover:bg-navy-700/30 ${
                  index % 2 === 0 ? "bg-navy-800/20" : ""
                }`}
              >
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-bold text-accent-light">
                  {subject.code}
                </td>
                <td className="px-5 py-4 font-medium text-white">
                  {subject.name}
                </td>
                <td className="px-5 py-4 text-navy-200">{subject.internal}</td>
                <td className="px-5 py-4 text-navy-200">{subject.external}</td>
                <td className="px-5 py-4 font-bold text-white">
                  {subject.total}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex min-w-[44px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                      gradeStyles[subject.grade] || gradeStyles.A
                    }`}
                  >
                    {subject.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
