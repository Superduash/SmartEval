"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { Sparkles, ArrowRight, Brain, ShieldCheck, Zap, Activity, CheckCircle, BarChart3, Star, PlayCircle } from "lucide-react";
import Image from "next/image";
import { Footer } from "@/components/layout/Footer";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-brand-200 dark:bg-slate-950 dark:selection:bg-brand-900 flex flex-col">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100/40 via-slate-50 to-slate-50 dark:from-brand-900/10 dark:via-slate-950 dark:to-slate-950" />
      <motion.div style={{ y }} className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-gradient-to-br from-brand-400/20 to-cyan-400/20 blur-3xl rounded-full opacity-60 dark:from-brand-600/10 dark:to-cyan-600/10" />

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-white/60 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/60 transition-all"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 shadow-md shadow-brand-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">SmartEval</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Log in
            </Link>
            <Link 
              href="/auth/register" 
              className="relative overflow-hidden group rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.div variants={fadeUp} className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-brand-200/50 bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
              Now in public beta for Educators
            </motion.div>
            <motion.h1 variants={fadeUp} className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl lg:text-8xl">
              Grading Intelligence for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500 filter drop-shadow-sm">Modern Classroom</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-2xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Stop spending weekends grading. Upload assignments, and our agentic AI evaluates them against your custom rubrics, generating robust student analytics instantly.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link 
                href="/auth/register" 
                className="group flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-cyan-600 px-8 text-lg font-semibold text-white shadow-xl shadow-brand-500/20 transition-all hover:shadow-brand-500/40 hover:scale-105 active:scale-95"
              >
                Start grading for free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="#demo" 
                className="group flex h-14 items-center gap-2 rounded-full bg-white px-8 text-lg font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200/50 backdrop-blur-sm transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 dark:bg-slate-900/50 dark:text-slate-200 dark:ring-slate-800 dark:hover:bg-slate-800/80"
              >
                <PlayCircle className="h-5 w-5 text-brand-500 transition-colors group-hover:text-brand-600" />
                View demo
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="mt-20 mx-auto max-w-6xl relative"
          >
            <div className="absolute inset-x-0 -top-4 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-8">
              <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>
            <div className="rounded-2xl border border-slate-200/50 bg-white/40 p-2 backdrop-blur-xl shadow-2xl dark:border-slate-800/50 dark:bg-slate-900/40">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="App Dashboard Preview" 
                className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white/50 dark:bg-slate-900/20 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center mb-16">
            <h2 className="text-sm font-semibold leading-7 text-brand-600 dark:text-cyan-400">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">All-in-one grading platform</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                icon: Brain, 
                title: "Agentic Evaluation", 
                desc: "Multiple AI agents cross-check logic, formatting, and concepts against your rubric for unparalleled accuracy." 
              },
              { 
                icon: Zap, 
                title: "Instant Turnaround", 
                desc: "Grade a 50-student class in under 5 minutes. Real-time status tracking keeps you in the loop." 
              },
              { 
                icon: ShieldCheck, 
                title: "Unbiased Fairness", 
                desc: "Blind grading logic ensures consistency without subjective fatigue, protecting student integrity." 
              },
              {
                icon: BarChart3,
                title: "Deep Analytics",
                desc: "Understand class-wide misconceptions immediately with dashboard visualisations."
              },
              {
                icon: Activity,
                title: "Feedback Generation",
                desc: "Creates personalized, constructive feedback for every student on how they can improve."
              },
              {
                icon: CheckCircle,
                title: "Rubric Builder",
                desc: "Easily map standard curriculums or create custom grading rubrics in minutes."
              }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-brand-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:ring-brand-800/50 transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <feat.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl sm:text-center mb-16">
             <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Loved by Educators Worldwide</h2>
             <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">See how SmartEval is transforming classrooms and reclaiming weekends.</p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[
              {
                body: "This tool has saved me 15 hours a week. The feedback it provides my students is sometimes more detailed than what I could provide in traditional grading.",
                author: "Sarah Jenkins",
                role: "High School English Teacher",
                imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              },
              {
                body: "Unbelievable accuracy. The agentic workflow perfectly identifies edge cases in code assignments. It scales effortlessly across my 200-student cohort.",
                author: "Dr. Michael Chen",
                role: "CS Professor",
                imageUrl: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              },
              {
                body: "What impressed me most wasn't just the grading speed, but the instant analytics identifying exactly where my class is struggling.",
                author: "Elena Rodriguez",
                role: "Middle School Science",
                imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/50 dark:ring-slate-800"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} className="h-5 w-5 fill-current" />)}
                  </div>
                  <blockquote className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                    "{testimonial.body}"
                  </blockquote>
                </div>
                <div className="mt-8 flex items-center gap-x-4">
                  <img src={testimonial.imageUrl} alt="" className="h-12 w-12 rounded-full bg-slate-50 object-cover" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
