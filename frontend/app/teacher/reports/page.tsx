"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, Users } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError, downloadReport, exportTeacherAnalytics, exportTeacherResults, getTeacherStudents } from "@/lib/api";
import { StudentLink } from "@/types";

export default function TeacherReportsPage() {
  const [examId, setExamId] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [students, setStudents] = useState<StudentLink[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      try {
        const payload = await getTeacherStudents();
        if (!isMounted) return;
        setStudents(payload.students || []);
      } catch {
        if (isMounted) {
          setStudents([]);
        }
      }
    }

    loadStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onDownloadPdf() {
    setStatus("");
    setError("");
    try {
      await downloadReport(examId);
      setStatus("PDF report downloaded.");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to download report PDF.");
    }
  }

  async function onExportAnalytics() {
    setStatus("");
    setError("");
    try {
      await exportTeacherAnalytics(examId);
      setStatus("Analytics CSV downloaded.");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to export analytics CSV.");
    }
  }

  async function onExportResults() {
    setStatus("");
    setError("");
    try {
      await exportTeacherResults();
      setStatus("Results CSV downloaded.");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to export results CSV.");
    }
  }

  return (
    <DashboardLayout role="teacher">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Report Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Download PDF and CSV reports for sharing and audits.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Exam ID</label>
          <input
            type="number"
            min={1}
            value={examId}
            onChange={(e) => setExamId(Number(e.target.value || 1))}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950"
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => void onDownloadPdf()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500">
              <Download className="h-4 w-4" /> PDF Report
            </button>
            <button type="button" onClick={() => void onExportAnalytics()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              <FileSpreadsheet className="h-4 w-4" /> Analytics CSV
            </button>
            <button type="button" onClick={() => void onExportResults()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              <FileSpreadsheet className="h-4 w-4" /> Results CSV
            </button>
          </div>

          {status && <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{status}</p>}
          {error && <p className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 p-5 dark:border-slate-800/70">
            <Users className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Linked Student Roster</h2>
          </div>

          {students.length === 0 ? (
            <p className="p-5 text-sm text-slate-600 dark:text-slate-300">No linked students yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {students.map((student) => (
                <li key={student.student_id} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{student.student_name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{student.student_email}</p>
                  </div>
                  <span className="text-xs text-slate-500">Joined: {new Date(student.joined_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
