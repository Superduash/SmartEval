"use client";

import { useEffect, useState } from "react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError, getProfile, updateProfile } from "@/lib/api";
import { ErrorAlert, LoaderSpinner } from "@/components/ui";

export default function StudentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const profile = await getProfile();
        if (!isMounted) return;
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setTimezone(profile.timezone || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || "");
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load profile settings.");
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

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      await updateProfile({ name, phone, timezone, bio, avatar_url: avatarUrl });
      setStatus("Profile settings saved.");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to save profile settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Update your account profile and preferences.</p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center"><LoaderSpinner /></div>
        ) : (
          <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {error && <ErrorAlert message={error} />}
            {status && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{status}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Timezone</label>
              <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Avatar URL</label>
              <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </div>

            <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
