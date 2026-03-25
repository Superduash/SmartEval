"use client";

import { useState } from "react";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UploadDropzone } from "@/components/forms/UploadDropzone";
import { ApiError, createExam, uploadTeacherFile } from "@/lib/api";
import { ErrorAlert, LoaderSpinner } from "@/components/ui";

type Step = "paper" | "answers" | "processing" | "done";

export default function TeacherUploadPage() {
  const [step, setStep] = useState<Step>("paper");
  const [subject, setSubject] = useState("Mathematics");
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [answerSheets, setAnswerSheets] = useState<File[]>([]);
  const [examId, setExamId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const handlePaperUpload = (files: File[]) => {
    if (files.length > 0) {
      setQuestionPaper(files[0]);
    }
  };

  const handleRubricUpload = (files: File[]) => {
    if (files.length > 0) {
      setRubricFile(files[0]);
      setTimeout(() => setStep("answers"), 400);
    }
  };

  const handleAnswersUpload = (files: File[]) => {
    setAnswerSheets((prev) => [...prev, ...files]);
  };

  const removeAnswerSheet = (index: number) => {
    setAnswerSheets((prev) => prev.filter((_, i) => i !== index));
  };

  const startEvaluation = async () => {
    if (!questionPaper || !rubricFile) return;

    setIsProcessing(true);
    setStep("processing");
    setError("");

    try {
      const createdExam = await createExam(subject.trim() || "Untitled Subject");
      setExamId(createdExam.id);

      await uploadTeacherFile({
        examId: createdExam.id,
        type: "question_paper",
        file: questionPaper,
      });

      await uploadTeacherFile({
        examId: createdExam.id,
        type: "rubric",
        file: rubricFile,
      });

      for (const sheet of answerSheets) {
        await uploadTeacherFile({
          examId: createdExam.id,
          type: "answer_script",
          file: sheet,
        });
      }

      setSummary(
        `Exam ${createdExam.id} is configured. Question paper, rubric, and ${answerSheets.length} answer sheet(s) were uploaded.`
      );
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Failed to upload files. Please try again.");
      setStep("answers");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Upload & Evaluate
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload the master question paper followed by student answer sheets.
          </p>
        </div>

        {/* Stepper */}
        <div className="relative">
          <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex justify-between">
            {["Question Paper", "Answer Sheets", "Evaluation"].map((label, idx) => {
              const isActive = (step === "paper" && idx === 0) || 
                               (step === "answers" && idx === 1) || 
                               ((step === "processing" || step === "done") && idx === 2);
              const isPast = (step !== "paper" && idx === 0) || 
                             ((step === "processing" || step === "done") && idx <= 1) || 
                             (step === "done" && idx === 2);
              
              return (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive 
                      ? "border-brand-600 bg-white text-brand-600 dark:bg-slate-900 dark:border-brand-500 dark:text-brand-500" 
                      : isPast 
                      ? "border-brand-600 bg-brand-600 text-white dark:border-brand-500 dark:bg-brand-500"
                      : "border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                  }`}>
                    {isPast ? <CheckCircle className="h-5 w-5" /> : <span>{idx + 1}</span>}
                  </div>
                  <span className={`text-xs font-medium ${isActive || isPast ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} />
            </div>
          )}
          <AnimatePresence mode="wait">
            {step === "paper" && (
              <motion.div
                key="paper"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Exam Setup</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Create an exam and upload both question paper and rubric.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Mathematics - Midterm"
                    className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Question Paper</p>
                  <UploadDropzone onFilesAdded={handlePaperUpload} accept={{ "application/pdf": [".pdf"], "text/plain": [".txt"] }} maxFiles={1} />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Rubric</p>
                  <UploadDropzone onFilesAdded={handleRubricUpload} accept={{ "application/pdf": [".pdf"], "text/plain": [".txt"] }} maxFiles={1} />
                </div>

                <button
                  type="button"
                  onClick={() => setStep("answers")}
                  disabled={!questionPaper || !rubricFile}
                  className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === "answers" && (
              <motion.div
                key="answers"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Student Answer Sheets</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Upload PDFs of completed exams.</p>
                  </div>
                  <button
                    onClick={() => setStep("paper")}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    Back to Paper
                  </button>
                </div>

                <UploadDropzone
                  onFilesAdded={handleAnswersUpload}
                  accept={{ "application/pdf": [".pdf"], "text/plain": [".txt"], "image/*": [".png", ".jpg"] }}
                />

                {answerSheets.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">Ready to evaluate ({answerSheets.length})</h4>
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
                      onClick={startEvaluation}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 dark:bg-brand-500 dark:hover:bg-brand-400"
                    >
                      <Upload className="h-4 w-4" />
                      Begin AI Evaluation
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-4 py-12"
              >
                <LoaderSpinner className="p-0" />
                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Agents are working...</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Preparing exam resources and uploading files.</p>
                </div>
              </motion.div>
            )}

            {step === "done" && (
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Batch Evaluation Started</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    {summary}
                  </p>
                  {examId && (
                    <p className="mb-4 text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Exam ID: {examId}
                    </p>
                  )}
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        setStep("paper");
                        setQuestionPaper(null);
                        setAnswerSheets([]);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      New Batch
                    </button>
                    <button
                      onClick={() => (window.location.href = "/teacher/results")}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
                    >
                      View Results
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
