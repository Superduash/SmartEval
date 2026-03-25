"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoaderSpinner, EmptyState, ErrorAlert } from "@/components/ui";
import { ApiError, getStudentResults } from "@/lib/api";

type StudentResult = {
  id: number;
  subject: string;
  title: string;
  score: number | null;
  date: string;
  status: "completed" | "processing";
};

export default function StudentResultsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState<StudentResult[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      setLoading(true);
      setError("");
      try {
        const rows = await getStudentResults();
        if (!isMounted) return;

        setResults(
          rows.map((row) => ({
            id: row.id,
            subject: `Exam ${row.exam_id}`,
            title: `Evaluation #${row.id}`,
            score: Number(row.marks),
            date: new Date().toISOString(),
            status: "completed",
          }))
        );
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load results.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadResults();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">All Results</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View your graded exams and assignments.</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
             <LoaderSpinner />
          </div>
        ) : error ? (
          <ErrorAlert message={error} />
        ) : results.length === 0 ? (
          <EmptyState title="No results yet" description="Your evaluated submissions will appear here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
             {results.map((result, i) => (
                <motion.div 
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {result.subject}
                      </span>
                      {result.status === "completed" ? (
                         <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                         <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {result.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Submitted: {new Date(result.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Score</span>
                      {result.score !== null ? (
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{result.score}%</span>
                      ) : (
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending</span>
                      )}
                    </div>
                    
                    {result.status === "completed" && (
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20">
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
             ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
