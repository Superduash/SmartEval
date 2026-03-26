"use client";

import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError, getStudentFeedback, getStudentResults } from "@/lib/api";
import { ErrorAlert, LoaderSpinner } from "@/components/ui";
import { ResultItem } from "@/types";

export default function StudentFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<ResultItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const rows = await getStudentResults();
        if (!isMounted) return;
        setResults(rows);
        if (rows.length > 0) {
          const examId = rows[0].exam_id;
          setSelectedExamId(examId);
          const detail = await getStudentFeedback(examId);
          if (isMounted) setFeedback(detail);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load feedback.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onSelectExam(examId: number) {
    setSelectedExamId(examId);
    setError("");
    try {
      const detail = await getStudentFeedback(examId);
      setFeedback(detail);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to load exam feedback.");
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Detailed Feedback</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review AI feedback for each evaluated exam.</p>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center"><LoaderSpinner /></div>
        ) : error ? (
          <ErrorAlert message={error} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Exams</h2>
              <div className="space-y-2">
                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void onSelectExam(item.exam_id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selectedExamId === item.exam_id
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    Exam {item.exam_id}
                  </button>
                ))}
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              {feedback ? (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Exam {feedback.exam_id} Feedback</h3>
                  </div>
                  <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Marks: {feedback.marks}%</p>
                  <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">{feedback.feedback}</pre>
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Select an exam to view feedback.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
