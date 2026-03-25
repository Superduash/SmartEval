"use client";

import { useState } from "react";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UploadDropzone } from "@/components/forms/UploadDropzone";
import { ApiError, uploadStudentAnswer } from "@/lib/api";
import { ErrorAlert, LoaderSpinner } from "@/components/ui";

export default function StudentUploadPage() {
  const [answerSheets, setAnswerSheets] = useState<File[]>([]);
  const [examId, setExamId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");

  const handleAnswersUpload = (files: File[]) => {
    setAnswerSheets((prev) => [...prev, ...files]);
  };

  const removeAnswerSheet = (index: number) => {
    setAnswerSheets((prev) => prev.filter((_, i) => i !== index));
  };

  const submitAnswers = async () => {
    if (answerSheets.length === 0 || !examId) return;

    setIsProcessing(true);
    setError("");

    try {
      for (const sheet of answerSheets) {
        await uploadStudentAnswer({ examId: Number(examId), file: sheet });
      }
      setIsDone(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Failed to upload files.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Upload Answer Sheets
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Submit your completed assignments or exams for evaluation.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} />
            </div>
          )}
          <AnimatePresence mode="wait">
            {!isProcessing && !isDone && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                    Exam ID
                  </label>
                  <input
                    type="text"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    placeholder="Enter the Exam ID provided by your teacher"
                    className="w-full rounded-xl border border-slate-300 bg-transparent py-2.5 px-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700"
                  />
                </div>

                <UploadDropzone
                  onFilesAdded={handleAnswersUpload}
                  accept={{ "application/pdf": [".pdf"], "text/plain": [".txt"], "image/*": [".png", ".jpg"] }}
                />

                {answerSheets.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">Files ready to submit ({answerSheets.length})</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {answerSheets.map((file, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 pr-4 dark:border-slate-700 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                            <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                              {file.name}
                            </span>
                          </div>
                          <button onClick={() => removeAnswerSheet(i)} className="shrink-0 text-slate-400 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={submitAnswers}
                      disabled={!examId || isProcessing}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500 disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      Submit Answers
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-4 py-12"
              >
                <LoaderSpinner />
                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Uploading...</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Please do not close this page.</p>
                </div>
              </motion.div>
            )}

            {isDone && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-6 py-8"
              >
                <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Successfully Submitted</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Your answers have been uploaded and will be evaluated shortly.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        setIsDone(false);
                        setAnswerSheets([]);
                        setExamId("");
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Upload Another
                    </button>
                    <button
                      onClick={() => window.location.href = "/student"}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
