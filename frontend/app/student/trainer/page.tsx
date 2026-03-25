"use client";

import { useEffect, useState } from "react";
import { Brain, Play, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError, getStudentTrainerPlan } from "@/lib/api";
import { EmptyState, ErrorAlert, LoaderSpinner } from "@/components/ui";

type TrainerCard = {
  id: string;
  title: string;
  desc: string;
  duration: string;
};

export default function StudentTrainerPage() {
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState<TrainerCard[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadPlan() {
      setLoading(true);
      setError("");

      try {
        const plan = await getStudentTrainerPlan();
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
            <motion.div 
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border p-6 transition-all ${
                activePlan === plan.id 
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
              
              {activePlan === plan.id ? (
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500">
                  <Play className="h-4 w-4" /> Continue Session
                </button>
              ) : (
                <button 
                  onClick={() => setActivePlan(plan.id)}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Start Plan
                </button>
              )}
            </motion.div>
          ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
