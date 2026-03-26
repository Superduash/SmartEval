"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Sparkles } from "lucide-react";

import { ApiError, joinPricingWaitlist } from "@/lib/api";

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function onJoinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    setStatus("");

    try {
      await joinPricingWaitlist(email.trim());
      setStatus("You are on the pricing waitlist. Payment rollout is coming soon.");
      setEmail("");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to join waitlist.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" /> Pricing rollout in progress
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Pricing and Payment</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            SmartEval payments are launching soon. Join the waitlist and get notified first when checkout is enabled.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Starter", amount: "$19", note: "Per teacher/month" },
            { name: "School", amount: "$99", note: "Up to 10 teachers" },
            { name: "Enterprise", amount: "Custom", note: "District pricing" },
          ].map((plan) => (
            <article
              key={plan.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h2>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{plan.amount}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.note}</p>
              <button
                type="button"
                disabled
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <CreditCard className="h-4 w-4" /> Payment Coming Soon
              </button>
            </article>
          ))}
        </div>

        <form onSubmit={onJoinWaitlist} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Join the Waitlist</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">We will email you as soon as payment activation is live.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Notify Me"}
            </button>
          </div>
          {status && <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">{status}</p>}
          {error && <p className="mt-3 text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>}
        </form>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="font-semibold text-brand-600 hover:text-brand-500">Return to landing</Link>
        </div>
      </div>
    </main>
  );
}
