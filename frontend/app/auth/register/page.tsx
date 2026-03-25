"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, GraduationCap, Sparkles } from "lucide-react";
import { clsx } from "clsx";

import { ApiError, register } from "@/lib/api";
import { ErrorAlert, LoaderSpinner } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    router.prefetch("/auth/login");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(name, email, password, role);
      router.replace("/auth/login");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Registration failed.";
      if (message.toLowerCase().includes("failed to fetch")) {
        setError("Cannot reach backend API. Start backend on http://127.0.0.1:8000 and try again.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 selection:bg-brand-200 dark:selection:bg-brand-900">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-100 via-app to-app dark:from-cyan-900/20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-panel p-8 shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-800"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-brand-500 shadow-lg ring-4 ring-cyan-50 dark:ring-cyan-900/30">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <Sparkles className="h-5 w-5 text-cyan-500" /> Create an account
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Join Smart Evaluation today</p>
        </div>

        <AnimatePresence>
          {error ? (
            <motion.div
              key="register-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <ErrorAlert message={error} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={clsx(
                "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                role === "student" 
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" 
                  : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              )}
            >
              <User className="h-6 w-6" />
              <span className="text-sm font-semibold">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={clsx(
                "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                role === "teacher" 
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" 
                  : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              )}
            >
              <GraduationCap className="h-6 w-6" />
              <span className="text-sm font-semibold">Teacher</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-transparent py-2.5 pl-10 pr-3 text-sm transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 sm:text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-transparent py-2.5 pl-10 pr-3 text-sm transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-transparent py-2.5 pl-10 pr-10 text-sm transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 sm:text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-slate-900/25 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {loading ? <LoaderSpinner className="p-0 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-white dark:[&_svg]:text-slate-900" /> : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
