import { Loader2 } from "lucide-react";

function SkeletonLine({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export default function LoadingState() {
  return (
    <section className="glass rounded-2xl p-4 sm:p-6 shadow-card">
      <div className="mb-6 flex items-center gap-3 text-accent-light">
        <Loader2 className="h-5 w-5 animate-spin-slow" />
        <span className="text-sm font-semibold">Fetching semester result...</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-navy-600 bg-navy-800/40 p-4 sm:p-5"
          >
            <SkeletonLine className="mb-3 h-3 w-16 sm:mb-4 sm:h-4 sm:w-20" />
            <SkeletonLine className="h-6 w-20 sm:h-8 sm:w-28" />
          </div>
        ))}
      </div>

      {/* Mobile: card skeletons */}
      <div className="mt-6 space-y-3 sm:hidden">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-navy-600 bg-navy-800/20 p-4"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <SkeletonLine className="mb-1 h-3 w-16" />
                <SkeletonLine className="h-4 w-40" />
              </div>
              <SkeletonLine className="h-6 w-10 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <SkeletonLine className="h-12 rounded-lg" />
              <SkeletonLine className="h-12 rounded-lg" />
              <SkeletonLine className="h-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table skeleton */}
      <div className="mt-6 hidden overflow-hidden rounded-xl border border-navy-600 sm:block">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="grid grid-cols-6 gap-4 border-b border-navy-600/50 p-4 last:border-b-0"
          >
            <SkeletonLine className="h-4" />
            <SkeletonLine className="col-span-2 h-4" />
            <SkeletonLine className="h-4" />
            <SkeletonLine className="h-4" />
            <SkeletonLine className="h-4" />
            <SkeletonLine className="h-4" />
          </div>
        ))}
      </div>
    </section>
  );
}
