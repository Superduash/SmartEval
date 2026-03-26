"use client";

import { useEffect, useState } from "react";
import { Brain, Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError, completeTrainerSession, createTrainerSession, getStudentTrainerPlan, getTrainerSessions, updateTrainerSession } from "@/lib/api";
import { EmptyState, ErrorAlert, LoaderSpinner } from "@/components/ui";
import { TrainerSession } from "@/types";

type TrainerCard = {
  id: string;
  title: string;
  desc: string;
  duration: string;
};

export default function StudentTrainerPage() {
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState<TrainerCard[]>([]);
  const [sessionsByPlan, setSessionsByPlan] = useState<Record<string, TrainerSession>>({});

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || !activeSessionId) return;
    const syncId = window.setInterval(() => {
      void updateTrainerSession(activeSessionId, { elapsed_seconds: elapsedSeconds, is_running: true }).catch(() => {
        // Local timer remains active; backend sync will retry on next tick or control action.
      });
    }, 5000);
    return () => window.clearInterval(syncId);
  }, [activeSessionId, elapsedSeconds, running]);

  function formatDuration(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadPlan() {
      setLoading(true);
      setError("");

      try {
        const [plan, sessionsPayload] = await Promise.all([getStudentTrainerPlan(), getTrainerSessions()]);
        if (!isMounted) return;

        const weekly = plan.weekly_plan.map((item, index) => ({
          id: `week-${index}`,
          title: `Week ${index + 1}`,
          desc: item,
          duration: "1 week",
        }));

        const techniques = plan.techniques.map((item, index) => ({
          id: `tech-${index}`,
          title: item,
          desc: "Technique recommended by AI based on your recent performance.",
          duration: "Practice set",
        }));

        setPlans([...(weekly.length > 0 ? weekly : []), ...(techniques.length > 0 ? techniques : [])]);

        const nextSessions: Record<string, TrainerSession> = {};
        sessionsPayload.sessions.forEach((session) => {
          const current = nextSessions[session.plan_id];
          if (!current || new Date(session.updated_at).getTime() > new Date(current.updated_at).getTime()) {
            nextSessions[session.plan_id] = session;
          }
        });
        setSessionsByPlan(nextSessions);

        const runningSession = Object.values(nextSessions).find((session) => session.is_running && session.status !== "completed");
        if (runningSession) {
          setActivePlan(runningSession.plan_id);
          setActiveSessionId(runningSession.id);
          setRunning(true);
          setElapsedSeconds(runningSession.elapsed_seconds);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load trainer plan.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlan();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onStartOrResume(plan: TrainerCard) {
    setBusyPlan(plan.id);
    setError("");
    try {
      const created = await createTrainerSession({ plan_id: plan.id, title: plan.title });
      const updated = await updateTrainerSession(created.id, {
        elapsed_seconds: created.elapsed_seconds,
        is_running: true,
      });

      setSessionsByPlan((prev) => ({ ...prev, [plan.id]: updated }));
      setActivePlan(plan.id);
      setActiveSessionId(updated.id);
      setRunning(true);
      setElapsedSeconds(updated.elapsed_seconds);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to start trainer session.");
    } finally {
      setBusyPlan(null);
    }
  }

  async function onPauseOrResume() {
    if (!activeSessionId) return;
    const nextRunning = !running;
    try {
      const updated = await updateTrainerSession(activeSessionId, {
        elapsed_seconds: elapsedSeconds,
        is_running: nextRunning,
      });
      setSessionsByPlan((prev) => ({ ...prev, [updated.plan_id]: updated }));
      setRunning(updated.is_running);
      setElapsedSeconds(updated.elapsed_seconds);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to update trainer session.");
    }
  }

  async function onCompleteSession() {
    if (!activeSessionId || !activePlan) return;
    try {
      const completed = await completeTrainerSession(activeSessionId, elapsedSeconds);
      setSessionsByPlan((prev) => ({ ...prev, [completed.plan_id]: completed }));
      setRunning(false);
      setActivePlan(null);
      setActiveSessionId(null);
      setElapsedSeconds(0);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to complete trainer session.");
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Personal Trainer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Customized learning paths based on your past evaluations.</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoaderSpinner />
          </div>
        ) : error ? (
          <ErrorAlert message={error} />
        ) : plans.length === 0 ? (
          <EmptyState title="No trainer plan yet" description="Complete a few evaluations to generate your personalized plan." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            (() => {
              const planSession = sessionsByPlan[plan.id];
              const planActive = activePlan === plan.id;
              const completed = planSession?.status === "completed";
              return (
            <motion.div 
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border p-6 transition-all ${
                planActive 
                  ? "border-brand-500 bg-brand-50 shadow-md dark:border-brand-500 dark:bg-brand-500/10" 
                  : "border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                  <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-medium text-slate-500">{plan.duration}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{plan.title}</h3>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{plan.desc}</p>
              {planSession && (
                <p className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {completed ? "Completed" : planSession.is_running ? "In progress" : "Paused"} • {formatDuration(planSession.elapsed_seconds)}
                </p>
              )}
              
              {planActive ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => void onPauseOrResume()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500"
                  >
                    {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {running ? "Pause Session" : "Continue Session"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onCompleteSession()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Complete Session ({formatDuration(elapsedSeconds)})
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => void onStartOrResume(plan)}
                  disabled={busyPlan === plan.id || completed}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {completed ? "Completed" : busyPlan === plan.id ? "Preparing..." : planSession ? "Resume Plan" : "Start Plan"}
                </button>
              )}
            </motion.div>
              );
            })()
          ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
