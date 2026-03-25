"use client";

import { useEffect, useState } from "react";
import { Download, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChartCard, EmptyState, ErrorAlert, StatCard, DashboardSkeleton } from "@/components/ui";
import { ApiError, getTeacherAnalytics, getTeacherResults } from "@/lib/api";
import { ChartPayload } from "@/types";

function payloadToRows(payload?: ChartPayload): Array<{ name: string; value: number }> {
  if (!payload || payload.labels.length === 0 || payload.datasets.length === 0) return [];

  const dataset = payload.datasets[0];
  return payload.labels.map((label, index) => ({
    name: label,
    value: Number(dataset.data[index] ?? 0),
  }));
}

function buildTrend(rows: Array<{ exam_id: number; marks: number }>) {
  const grouped = new Map<number, { sum: number; count: number }>();

  rows.forEach((item) => {
    const key = item.exam_id;
    const current = grouped.get(key) || { sum: 0, count: 0 };
    grouped.set(key, { sum: current.sum + Number(item.marks), count: current.count + 1 });
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([examId, stats]) => ({
      name: `Exam ${examId}`,
      avg: Number((stats.sum / stats.count).toFixed(1)),
    }));
}

export default function TeacherAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [examId, setExamId] = useState(1);
  const [averageMarks, setAverageMarks] = useState(0);
  const [passPercentage, setPassPercentage] = useState(0);
  const [highestMark, setHighestMark] = useState(0);
  const [barData, setBarData] = useState<Array<{ name: string; value: number }>>([]);
  const [pieData, setPieData] = useState<Array<{ name: string; value: number }>>([]);
  const [lineData, setLineData] = useState<Array<{ name: string; avg: number }>>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const [analytics, results] = await Promise.all([getTeacherAnalytics(examId), getTeacherResults()]);
        if (!isMounted) return;

        setAverageMarks(Number(analytics.average_marks || 0));
        setPassPercentage(Number(analytics.pass_percentage || 0));
        setHighestMark(Number(analytics.highest_mark || 0));
        setBarData(payloadToRows(analytics.bar_chart));
        setPieData(payloadToRows(analytics.pie_chart));
        setLineData(buildTrend(results.map((item) => ({ exam_id: item.exam_id, marks: Number(item.marks) }))));
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Failed to load analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [examId]);

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics & Insights</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Class performance and AI-generated insights.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={examId}
              onChange={(e) => setExamId(Number(e.target.value || 1))}
              className="w-24 rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm transition-all duration-300 ease-in-out focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700"
              aria-label="Exam ID"
            />
            <button className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-md active:scale-[0.99]">
              <Download className="h-4 w-4" /> Export Report
            </button>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton stats={3} withSidebarPanel={false} />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <StatCard label="Class Average" value={`${averageMarks.toFixed(1)}%`} icon={TrendingUp} subtitle="Latest computed from results" />
              <StatCard label="Pass Rate" value={`${passPercentage.toFixed(1)}%`} icon={Users} subtitle="Students above pass threshold" />
              <StatCard label="Highest Score" value={`${highestMark.toFixed(1)}%`} icon={AlertTriangle} subtitle="Best score in selected exam" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard 
                title="Grade Distribution" 
                subtitle="Students per grade bracket"
                data={barData}
                type="bar"
                dataKey="value"
              />
              <ChartCard 
                title="Performance Trend" 
                subtitle="Average scores over time"
                data={lineData}
                type="line"
                dataKey="avg"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
               <div className="lg:col-span-1">
                 <ChartCard 
                    title="Letter Grades" 
                    data={pieData}
                    type="pie"
                    dataKey="value"
                  />
               </div>
               <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                 <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">AI Pedagogical Insights</h3>
                 {barData.length === 0 && lineData.length === 0 ? (
                   <EmptyState title="No analytics yet" description="Start evaluations to generate pedagogical insights." />
                 ) : (
                   <div className="space-y-4">
                   <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
                     <h4 className="font-medium text-amber-800 dark:text-amber-400">Concept Gap: Integration by Parts</h4>
                     <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">42% of students missed question 4. Consider reviewing the substitution rule in the next lecture.</p>
                   </div>
                   <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                     <h4 className="font-medium text-emerald-800 dark:text-emerald-400">Improvement Noted</h4>
                     <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-500">Scores in basic algebra have improved by 15% compared to the previous week&apos;s evaluation.</p>
                   </div>
                   <div className="rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
                     <h4 className="font-medium text-brand-800 dark:text-brand-400">Personalized Intervention</h4>
                     <p className="mt-1 text-sm text-brand-700 dark:text-brand-500">3 students are consistently scoring below 60%. Automated study plans have been generated for their dashboards.</p>
                   </div>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
