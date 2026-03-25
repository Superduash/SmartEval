"use client";

import { useEffect, useState } from "react";
import { BookOpen, Star, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard, LoaderSpinner, ChartCard, ErrorAlert } from "@/components/ui";
import { ApiError, getStudentAnalytics, getStudentResults } from "@/lib/api";

type DashboardStat = {
  label: string;
  value: string;
  icon: typeof Star;
  change?: string;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [performanceData, setPerformanceData] = useState<Array<{ name: string; score: number }>>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [analytics, results] = await Promise.all([getStudentAnalytics(), getStudentResults()]);
        if (!isMounted) return;

        const sortedResults = results.sort((a, b) => a.exam_id - b.exam_id);
        const chartRows = sortedResults.map((row) => ({ name: `Exam ${row.exam_id}`, score: Number(row.marks) }));

        setPerformanceData(chartRows);
        setStats([
          { label: "My Average", value: `${Number(analytics.average || 0).toFixed(1)}%`, icon: Star, change: `${Number(analytics.improvement || 0).toFixed(1)}% trend` },
          { label: "Exams Taken", value: String(sortedResults.length), icon: BookOpen },
          { label: "Strengths", value: chartRows[0]?.name || "N/A", icon: TrendingUp },
          { label: "Areas to Improve", value: chartRows.at(-1)?.name || "N/A", icon: Target, change: "Trainer recommendations available" },
        ]);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load student dashboard.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back! Here's how you're doing.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
             <LoaderSpinner />
          </div>
        ) : error ? (
          <ErrorAlert message={error} />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <StatCard 
                  key={i}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  subtitle={stat.change}
                />
              ))}
            </div>

            {/* Layout Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
               <div className="lg:col-span-2">
                 <ChartCard 
                    title="My Performance History" 
                    subtitle="Scores across recent exams"
                    data={performanceData}
                    type="line"
                    dataKey="score"
                  />
               </div>

               <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                 <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Results</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Midterm Math 101</div>
                        <div className="text-xs text-slate-500">Graded: Oct 12</div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">85%</span>
                         <button 
                            onClick={() => router.push('/student/results')}
                            className="rounded-lg bg-slate-200 p-2 text-slate-600 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 hover:dark:bg-slate-600"
                         >
                            View
                         </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Physics Quiz 3</div>
                        <div className="text-xs text-slate-500">Processing...</div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Wait</span>
                      </div>
                    </div>
                 </div>
                 
                 <button
                   onClick={() => router.push('/student/results')}
                   className="mt-6 w-full rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                 >
                   View All Results
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
