"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ChevronRight, FileText, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError, exportTeacherResults, getTeacherResults } from "@/lib/api";
import { EmptyState, ErrorAlert, LoaderSpinner, Table } from "@/components/ui";

type ExamResult = {
  id: number;
  student_id: number;
  exam_id: number;
  subject: string;
  total_score: number;
  max_score: number;
  status: "completed" | "processing" | "failed";
  date: string;
  feedback: string;
};

export default function TeacherResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      setLoading(true);
      setError("");
      try {
        const rows = await getTeacherResults();
        if (!isMounted) return;

        const mapped = rows.map((item) => ({
          id: item.id,
          student_id: item.student_id,
          exam_id: item.exam_id,
          subject: `Exam ${item.exam_id}`,
          total_score: Number(item.marks),
          max_score: 100,
          status: "completed" as const,
          date: new Date().toISOString(),
          feedback: item.feedback,
        }));

        setResults(mapped);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load results.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadResults();
    return () => {
      isMounted = false;
    };
  }, []);

  const badgeColor = (status: string) => {
    switch(status) {
      case "completed": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      case "processing": return "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
    }
  };

  const filteredResults = results.filter(r => 
    String(r.student_id).includes(search.toLowerCase()) ||
    r.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Exam Results</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Review and publish graded student papers.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void exportTeacherResults()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <FileDown className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students or subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-transparent py-2 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700"
              />
            </div>
          </div>

          {loading ? (
             <div className="flex h-64 items-center justify-center">
               <LoaderSpinner />
             </div>
          ) : error ? (
            <div className="p-6">
              <ErrorAlert message={error} />
            </div>
          ) : filteredResults.length === 0 ? (
            <EmptyState 
              icon={FileText} 
              title="No results found" 
              description="No evaluations match your search criteria or none have been submitted yet." 
            />
          ) : (
            <Table headers={["Student", "Subject / Exam", "Score", "Status", "Date", "Action"]}>
                  {filteredResults.map((result) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={result.id} 
                      className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">Student {result.student_id}</div>
                        <div className="text-xs text-slate-500">ID: {result.student_id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{result.subject}</td>
                      <td className="px-6 py-4">
                        {result.status === "completed" ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">{result.total_score}</span>
                            <span className="text-slate-400">/ {result.max_score}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeColor(result.status)}`}>
                          {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(result.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        {result.status === "completed" ? (
                           <Link 
                           href={`/teacher/reports?examId=${result.exam_id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                           >
                              <ChevronRight className="h-5 w-5" />
                           </Link>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">Wait</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
