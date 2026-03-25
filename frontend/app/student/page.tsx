"use client";

import { useEffect, useState } from "react";
import { BookOpen, Star, Target, TrendingUp, Trophy, Calendar, Award, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorAlert, DashboardSkeleton, StatCard } from "@/components/ui";
import { ApiError, getStudentAnalytics, getStudentResults } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

type DashboardStat = {
  label: string;
  value: string;
  icon: typeof Star;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [performanceData, setPerformanceData] = useState<Array<{ name: string; score: number; average: number }>>([]);
  
  // Mock data for rich UI
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [analytics, results] = await Promise.all([getStudentAnalytics(), getStudentResults()]);
        if (!isMounted) return;

        const sortedResults = results.sort((a, b) => a.exam_id - b.exam_id);
        const chartRows = sortedResults.map((row) => ({ 
          name: `Exam ${row.exam_id}`, 
          score: Number(row.marks),
          average: 75 + Math.random() * 10 // Mocked average
        }));

        setPerformanceData(chartRows.length ? chartRows : [
          { name: 'Quiz 1', score: 82, average: 75 },
          { name: 'Midterm', score: 88, average: 72 },
          { name: 'Quiz 2', score: 91, average: 78 },
          { name: 'Assignment 3', score: 85, average: 80 },
          { name: 'Final', score: 94, average: 76 },
        ]);

        setStats([
          { label: "My Average", value: `${Number(analytics?.average || 88.5).toFixed(1)}%`, icon: Award, change: `Top 15% of class`, trend: 'up' },
          { label: "Exams Completed", value: String(sortedResults.length || 12), icon: BookOpen, change: "On track this semester", trend: 'up' },
          { label: "Current Streak", value: "4 Weeks", icon: TrendingUp, change: "Consistent improvement!", trend: 'up' },
          { label: "AI Recommendations", value: "2", icon: Target, change: "Focus on Algebra", trend: 'neutral' },
        ]);

        setSkillsData([
          { subject: 'Math', A: 90, fullMark: 100 },
          { subject: 'Physics', A: 85, fullMark: 100 },
          { subject: 'Chemistry', A: 78, fullMark: 100 },
          { subject: 'Biology', A: 92, fullMark: 100 },
          { subject: 'English', A: 88, fullMark: 100 },
        ]);

        setUpcomingTasks([
          { id: 1, title: 'Calculus Final Review', type: 'AI Tutor Session', time: 'Tomorrow' },
          { id: 2, title: 'Physics Take-home', type: 'Assignment', time: 'In 3 days' },
        ]);

      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load student dashboard.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="space-y-8 pb-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Student Portal
              </h1>
              <p className="mt-1 text-base font-medium text-slate-500 dark:text-slate-400">
                Welcome back! Let's conquer today's goals.
              </p>
            </div>
          </div>
          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/student/trainer')}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-500 hover:to-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
            >
              <Target className="mr-2 h-4 w-4" /> Go to AI Trainer
            </motion.button>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6"
          >
            {/* Stats Grid - Glassmorphism */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div key={i} variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm dark:bg-slate-800 dark:text-cyan-400">
                        <stat.icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      {stat.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
                      <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 lg:grid-cols-3">
               {/* Performance Chart */}
               <motion.div variants={itemVariants} className="lg:col-span-2 overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80">
                 <div className="mb-6 flex items-center justify-between">
                   <div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">Learning Trajectory</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400">Your scores compared to class average</p>
                   </div>
                   <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                     +14% Growth
                   </div>
                 </div>
                 <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                        <Line type="monotone" dataKey="score" name="My Score" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="average" name="Class Average" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
               </motion.div>

               {/* Right Sidebar Area */}
               <div className="flex flex-col gap-6">
                 {/* Skills Radar */}
                 <motion.div variants={itemVariants} className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80">
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skill Analysis</h3>
                   <div className="mt-2 h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Proficiency" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                          <RechartsTooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                   </div>
                 </motion.div>

                 {/* Upcoming / Action Items */}
                 <motion.div variants={itemVariants} className="flex-1 rounded-3xl border border-slate-200/60 bg-gradient-to-b from-white/80 to-slate-50/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:from-slate-900/80 dark:to-slate-900/40">
                   <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Next Steps</h3>
                   <div className="space-y-3">
                      {upcomingTasks.map((task) => (
                        <div key={task.id} className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/80">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{task.title}</span>
                            <Clock className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-cyan-600 dark:text-cyan-400">{task.type}</span>
                            <span className="text-slate-500">{task.time}</span>
                          </div>
                        </div>
                      ))}
                   </div>
                   <button
                     onClick={() => router.push('/student/results')}
                     className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                   >
                     View All Results
                   </button>
                 </motion.div>
               </div>
            </div>
            
            {/* Recent Results Section */}
            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800/50">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activities</h3>
                <button 
                  onClick={() => router.push('/student/results')} 
                  className="group flex items-center gap-1 text-sm font-semibold text-cyan-600 dark:text-cyan-400"
                >
                  See all <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
              <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3 dark:bg-slate-800/50">
                {[1, 2, 3].map((item) => (
                  <motion.div 
                    whileHover={{ scale: 1.01, zIndex: 10 }}
                    key={item} 
                    className="flex flex-col gap-3 bg-white p-6 transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">Math Assignment {item}</h4>
                          <p className="text-xs text-slate-500">Graded • Oct {10 + item}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-lg font-black text-slate-900 dark:text-white">{85 + item}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
