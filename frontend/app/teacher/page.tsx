"use client";

import { useEffect, useState } from "react";
import { Users, FileText, CheckCircle, TrendingUp, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorAlert, StatCard, LoaderSpinner } from "@/components/ui";
import { ApiError, getTeacherAnalytics, getTeacherResults } from "@/lib/api";

type DashboardStat = {
  label: string;
  value: string;
  icon: typeof FileText;
  change: string;
};

export default function TeacherDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStat[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [results, analytics] = await Promise.all([getTeacherResults(), getTeacherAnalytics(1)]);
        if (!isMounted) return;

        const uniqueExams = new Set(results.map((row) => row.exam_id));
        const uniqueStudents = new Set(results.map((row) => row.student_id));

        setStats([
          { label: "Total Exams", value: String(uniqueExams.size), icon: FileText, change: "Based on current records" },
          { label: "Students", value: String(uniqueStudents.size), icon: Users, change: "Students with graded results" },
          { label: "Avg Score", value: `${Number(analytics.average_marks || 0).toFixed(1)}%`, icon: TrendingUp, change: `Pass rate ${Number(analytics.pass_percentage || 0).toFixed(1)}%` },
          { label: "Pending Reviews", value: "0", icon: HelpCircle, change: "Student uploads auto-trigger evaluation" },
        ]);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load teacher dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back! Here's what's happening with your classes today.
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

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
                    <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Evaluate New Exam</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Upload paper and answer sheets</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/teacher/upload')}
                  className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 dark:bg-brand-500 dark:hover:bg-brand-400"
                >
                  Start Evaluation
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/40">
                    <CheckCircle className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">View Results</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review graded papers and insights</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/teacher/results')}
                  className="w-full rounded-xl border-2 border-slate-200 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                >
                  View Library
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
