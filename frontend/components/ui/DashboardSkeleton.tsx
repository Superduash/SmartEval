"use client";

interface DashboardSkeletonProps {
  stats?: number;
  withSidebarPanel?: boolean;
}

export function DashboardSkeleton({ stats = 4, withSidebarPanel = true }: DashboardSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: stats }).map((_, idx) => (
          <div
            key={`stat-${idx}`}
            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/70"
          />
        ))}
      </div>

      <div className={`grid gap-6 ${withSidebarPanel ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        <div
          className={`h-80 animate-pulse rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/70 ${withSidebarPanel ? "lg:col-span-2" : ""}`}
        />
        {withSidebarPanel ? (
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/70" />
        ) : null}
      </div>
    </div>
  );
}
