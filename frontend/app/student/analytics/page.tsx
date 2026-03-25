"use client";

import { useEffect, useState } from "react";
import { Download, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChartCard, EmptyState, ErrorAlert, StatCard, LoaderSpinner } from "@/components/ui";
import { ApiError, getStudentAnalytics, getStudentResults } from "@/lib/api";
import { ChartPayload } from "@/types";

function payloadToRows(payload?: ChartPayload): Array<{ name: string; value: number }> {
  if (!payload || payload.labels.length === 0 || payload.datasets.length === 0) return [];
  const dataset = payload.datasets[0];

  return payload.labels.map((label, index) => ({
    name: label,
    value: Number(dataset.data[index] ?? 0),
  }));
}

export default function StudentAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overallAverage, setOverallAverage] = useState(0);
  const [improvement, setImprovement] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [barData, setBarData] = useState<Array<{ name: string; score: number }>>([]);
  const [lineData, setLineData] = useState<Array<{ name: string; score: number }>>([]);
  const [pieData, setPieData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const [analytics, results] = await Promise.all([getStudentAnalytics(), getStudentResults()]);
        if (!isMounted) return;

        setOverallAverage(Number(analytics.average || 0));
        setImprovement(Number(analytics.improvement || 0));
        setSuggestions(analytics.suggestions || []);

        const marksRows = results
          .sort((a, b) => a.exam_id - b.exam_id)
          .map((item) => ({ name: `Exam ${item.exam_id}`, score: Number(item.marks) }));

        setBarData(marksRows);
        setLineData(marksRows.length > 0 ? marksRows : payloadToRows(analytics.line_chart).map((row) => ({ name: row.name, score: row.value })));
        setPieData(payloadToRows(analytics.pie_chart));
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load student analytics.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Performance Analytics</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Deep dive into your progress and AI feedback.</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-500">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>

        {loading ? (
           <div className="flex h-[60vh] items-center justify-center">
             <LoaderSpinner />
           </div>
        ) : error ? (
          <ErrorAlert message={error} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <StatCard label="Overall Average" value={`${overallAverage.toFixed(1)}%`} icon={TrendingUp} subtitle={`${improvement >= 0 ? "+" : ""}${improvement.toFixed(1)}% since last period`} />
              <StatCard label="Strongest Subject" value={barData[0]?.name || "N/A"} icon={Target} subtitle="Computed from latest results" />
              <StatCard label="Focus Area" value={barData.at(-1)?.name || "N/A"} icon={AlertTriangle} subtitle="Recommended by AI" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard 
                title="Scores by Topic" 
                subtitle="Your performance across different subjects"
                data={barData}
                type="bar"
                dataKey="score"
              />
              <ChartCard 
                title="Progress Timeline" 
                subtitle="Your overall trajectory"
                data={lineData}
                type="line"
                dataKey="score"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
               <div className="lg:col-span-1">
                 <ChartCard 
                    title="Skill Mastery" 
                    data={pieData}
                    type="pie"
                    dataKey="value"
                  />
               </div>
               <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                 <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">AI Learning Suggestions</h3>
                 {suggestions.length === 0 ? (
                   <EmptyState title="No suggestions yet" description="Complete more evaluations to generate personalized AI guidance." />
                 ) : (
                   <div className="space-y-4">
                     {suggestions.map((suggestion) => (
                       <div key={suggestion} className="rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
                         <h4 className="font-medium text-brand-800 dark:text-brand-400">AI Recommendation</h4>
                         <p className="mt-1 text-sm text-brand-700 dark:text-brand-500">{suggestion}</p>
                       </div>
                     ))}
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
