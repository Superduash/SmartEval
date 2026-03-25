"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Brain, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-brand-200 dark:bg-slate-950 dark:selection:bg-brand-900">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100/50 via-slate-50 to-slate-50 dark:from-brand-900/10 dark:via-slate-950 dark:to-slate-950" />
      
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-white/60 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-md shadow-brand-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white">SmartEval</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 lg:pt-48">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
              <Sparkles className="h-4 w-4" /> Waitlist closed. Now in public beta.
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl">
              Grading Intelligence for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500">Modern Classroom</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Stop spending weekends grading. Upload assignments, and our agentic AI evaluates them against your custom rubrics, generating robust student analytics instantly.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link 
                href="/auth/register" 
                className="group flex h-12 items-center gap-2 rounded-full bg-brand-600 px-8 font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-500 hover:shadow-brand-500/40"
              >
                Start grading for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="#features" 
                className="flex h-12 items-center rounded-full bg-white px-8 font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800 dark:hover:bg-slate-800"
              >
                View demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 sm:grid-cols-3">
            {[
              { 
                icon: Brain, 
                title: "Agentic Evaluation", 
                desc: "Multiple AI agents cross-check logic, formatting, and concepts against your rubric." 
              },
              { 
                icon: Zap, 
                title: "Instant Turnaround", 
                desc: "Grade a 50-student class in under 5 minutes. Real-time status tracking." 
              },
              { 
                icon: ShieldCheck, 
                title: "Unbiased Fairness", 
                desc: "Blind grading logic ensures consistency without subjective fatigue." 
              }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
