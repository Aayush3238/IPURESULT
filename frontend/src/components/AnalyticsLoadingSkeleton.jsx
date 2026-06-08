import { Loader2 } from "lucide-react";

function SkeletonLine({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export default function AnalyticsLoadingSkeleton() {
  return (
    <section className="glass rounded-2xl p-4 sm:p-6 shadow-card">
      <div className="mb-6 flex items-center gap-3 text-accent-light">
        <Loader2 className="h-5 w-5 animate-spin-slow" />
        <span className="text-sm font-semibold">Computing analytics...</span>
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-navy-600 bg-navy-800/40 p-4"
          >
            <SkeletonLine className="mb-3 h-10 w-10 rounded-xl" />
            <SkeletonLine className="mb-2 h-3 w-16" />
            <SkeletonLine className="h-6 w-20" />
          </div>
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-navy-600 bg-navy-800/20 p-4 sm:p-6"
          >
            <SkeletonLine className="mb-2 h-4 w-32" />
            <SkeletonLine className="mb-4 h-3 w-48" />
            <SkeletonLine className="h-[200px] w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-navy-600 bg-navy-800/20 p-4 sm:p-6"
          >
            <SkeletonLine className="mb-2 h-4 w-32" />
            <SkeletonLine className="mb-4 h-3 w-48" />
            <SkeletonLine className="h-[200px] w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Insight cards skeleton */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-navy-600 bg-navy-800/20 p-4"
          >
            <div className="flex items-start gap-3">
              <SkeletonLine className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="flex-1">
                <SkeletonLine className="mb-2 h-2 w-20" />
                <SkeletonLine className="mb-1 h-4 w-28" />
                <SkeletonLine className="h-3 w-36" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
