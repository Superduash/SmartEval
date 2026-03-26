"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2, Trash2, UserPlus, Users } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError, getStudentTeachers, joinTeacher, unlinkTeacher } from "@/lib/api";
import { ErrorAlert, LoaderSpinner } from "@/components/ui";
import { TeacherLink } from "@/types";

export default function StudentTeachersPage() {
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [teacherIdInput, setTeacherIdInput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [teachers, setTeachers] = useState<TeacherLink[]>([]);

  const teacherId = useMemo(() => Number(teacherIdInput || 0), [teacherIdInput]);
  const canJoin = teacherId > 0;

  useEffect(() => {
    let isMounted = true;

    async function loadTeachers() {
      setLoading(true);
      setError("");
      try {
        const payload = await getStudentTeachers();
        if (!isMounted) return;
        setTeachers(payload.teachers || []);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load linked teachers.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTeachers();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onJoinTeacher() {
    if (!canJoin) return;
    setJoining(true);
    setError("");
    setStatus("");
    try {
      await joinTeacher(teacherId);
      const payload = await getStudentTeachers();
      setTeachers(payload.teachers || []);
      setStatus("Teacher linked successfully.");
      setTeacherIdInput("");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to link teacher.");
    } finally {
      setJoining(false);
    }
  }

  async function onUnlinkTeacher(id: number) {
    setError("");
    setStatus("");
    try {
      await unlinkTeacher(id);
      setTeachers((prev) => prev.filter((t) => t.teacher_id !== id));
      setStatus("Teacher unlinked.");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to unlink teacher.");
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Teacher Integration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Link your account with teacher workspaces for class-level tracking and reports.</p>
        </div>

        {status && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{status}</div>}
        {error && <ErrorAlert message={error} />}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">Link by Teacher ID</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              min={1}
              value={teacherIdInput}
              onChange={(e) => setTeacherIdInput(e.target.value)}
              placeholder="Enter Teacher ID"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="button"
              onClick={() => void onJoinTeacher()}
              disabled={!canJoin || joining}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" /> {joining ? "Linking..." : "Link Teacher"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800/70">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Linked Teachers</h2>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center"><LoaderSpinner /></div>
          ) : teachers.length === 0 ? (
            <div className="p-6 text-sm text-slate-600 dark:text-slate-300">No linked teachers yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {teachers.map((teacher) => (
                <li key={teacher.teacher_id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{teacher.teacher_name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{teacher.teacher_email}</p>
                    <p className="mt-1 text-xs text-slate-500">Linked: {new Date(teacher.joined_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Link2 className="h-3 w-3" /> {teacher.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => void onUnlinkTeacher(teacher.teacher_id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" /> Unlink
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          Teachers can view linked students via their roster endpoints and reports center. If your teacher shared a class code/ID, use it above.
        </div>
      </div>
    </DashboardLayout>
  );
}
