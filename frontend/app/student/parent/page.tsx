"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Mail, Send, ShieldCheck, Trash2, Users } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ApiError,
  getParentContacts,
  getParentMessage,
  inviteParentByEmail,
  removeParentContact,
  sendParentProgressUpdate,
} from "@/lib/api";
import { ErrorAlert, LoaderSpinner } from "@/components/ui";
import { ParentContact } from "@/types";

export default function StudentParentPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [parentSummary, setParentSummary] = useState("No parent update available yet.");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Guardian");
  const [parents, setParents] = useState<ParentContact[]>([]);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && name.trim().length > 0 && relationship.trim().length > 0;
  }, [email, name, relationship]);

  useEffect(() => {
    let isMounted = true;

    async function loadParentData() {
      setLoading(true);
      setError("");
      try {
        const [messagePayload, contactsPayload] = await Promise.all([getParentMessage(), getParentContacts()]);
        if (!isMounted) return;
        setParentSummary(messagePayload.message || "No parent update available yet.");
        setParents(contactsPayload.parents || []);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load parent portal data.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadParentData();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onInviteParent() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      await inviteParentByEmail({ email, name, relationship });
      const latest = await getParentContacts();
      setParents(latest.parents || []);
      setEmail("");
      setName("");
      setRelationship("Guardian");
      setStatus("Invite sent successfully.");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to invite parent.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRemoveParent(parentId: number) {
    setError("");
    setStatus("");
    try {
      await removeParentContact(parentId);
      setParents((prev) => prev.filter((p) => p.id !== parentId));
      setStatus("Parent removed.");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to remove parent.");
    }
  }

  async function onSendUpdate(parentId: number) {
    setError("");
    setStatus("");
    try {
      await sendParentProgressUpdate(parentId);
      setStatus("Progress update email sent.");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to send progress update.");
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Parent Portal Access</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage guardians who receive your academic progress updates.</p>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <LoaderSpinner />
          </div>
        ) : (
          <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-sm text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
            {parentSummary}
          </div>
        )}

        {status && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{status}</div>}
        {error && <ErrorAlert message={error} />}

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

            <div className="space-y-3">
              {parents.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300">
                  No linked guardians yet.
                </div>
              ) : (
                parents.map((parent) => (
                  <div key={parent.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{parent.name} ({parent.relationship})</div>
                        <div className="text-sm text-slate-500">{parent.email}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3" /> {parent.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => void onSendUpdate(parent.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300"
                        >
                          <Send className="h-3 w-3" /> Send update
                        </button>
                        <button
                          type="button"
                          onClick={() => void onRemoveParent(parent.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Invite a Guardian</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative sm:col-span-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Guardian name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div className="relative sm:col-span-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@email.com"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="Relationship"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={() => void onInviteParent()}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {submitting ? "Sending..." : "Send Invite"}
              </button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <Bell className="h-3.5 w-3.5" /> Linked parents can receive progress summaries by email.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
