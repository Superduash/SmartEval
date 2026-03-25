"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Bell, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError, getParentMessage } from "@/lib/api";
import { ErrorAlert, LoaderSpinner } from "@/components/ui";

export default function StudentParentPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parentSummary, setParentSummary] = useState("No parent update available yet.");

  useEffect(() => {
    let isMounted = true;

    async function loadParentMessage() {
      setLoading(true);
      setError("");
      try {
        const payload = await getParentMessage();
        if (isMounted) {
          setParentSummary(payload.message || "No parent update available yet.");
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load parent summary.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadParentMessage();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Parent Portal Access</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage who can view your academic progress.</p>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <LoaderSpinner />
          </div>
        ) : error ? (
          <ErrorAlert message={error} />
        ) : (
          <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-sm text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
            {parentSummary}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Linked Accounts</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Parents or guardians connected to your profile.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Jane Doe (Mother)</div>
                  <div className="text-sm text-slate-500">jane.doe@example.com</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" /> Active
                  </span>
                  <button className="text-sm font-medium text-red-500 hover:text-red-600">Remove</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Invite a Guardian</h4>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="parent@email.com" 
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                Send Invite
              </button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <Bell className="h-3.5 w-3.5" /> They will receive an email with instructions to connect.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
