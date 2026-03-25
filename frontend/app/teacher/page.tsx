"use client";

import { useEffect, useState } from "react";
import { Users, FileText, CheckCircle, TrendingUp, HelpCircle, Activity, BookOpen, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorAlert, DashboardSkeleton, StatCard } from "@/components/ui";
import { ApiError, getTeacherAnalytics, getTeacherResults } from "@/lib/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

type DashboardStat = {
  label: string;
  value: string;
  icon: typeof FileText;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function TeacherDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStat[]>([]);

  // Mocked rich data for demonstration
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [results, analytics] = await Promise.all([getTeacherResults(), getTeacherAnalytics(1)]);
        if (!isMounted) return;

        const uniqueExams = new Set(results.map((row) => row.exam_id));
        const uniqueStudents = new Set(results.map((row) => row.student_id));

        setStats([
          { label: "Total Exams Evaluated", value: String(uniqueExams.size) || "24", icon: FileText, change: "+12% from last month", trend: 'up' },
          { label: "Active Students", value: String(uniqueStudents.size) || "156", icon: Users, change: "+4 new enrollees", trend: 'up' },
          { label: "Class Average", value: `${Number(analytics?.average_marks || 78.4).toFixed(1)}%`, icon: TrendingUp, change: `Pass rate ${Number(analytics?.pass_percentage || 92).toFixed(1)}%`, trend: 'up' },
          { label: "Pending Reviews", value: "3", icon: Clock, change: "Requires your attention", trend: 'neutral' },
        ]);

        // Realistic mocked payload for charts
        setPerformanceData([
          { name: 'Week 1', avgScore: 65, highest: 90, lowest: 40 },
          { name: 'Week 2', avgScore: 70, highest: 92, lowest: 45 },
          { name: 'Week 3', avgScore: 68, highest: 88, lowest: 50 },
          { name: 'Week 4', avgScore: 75, highest: 95, lowest: 55 },
          { name: 'Week 5', avgScore: 82, highest: 98, lowest: 60 },
          { name: 'Week 6', avgScore: 78, highest: 96, lowest: 58 },
        ]);

        setSubjectData([
          { name: 'Mathematics', value: 85 },
          { name: 'Physics', value: 72 },
          { name: 'Chemistry', value: 68 },
          { name: 'Biology', value: 90 },
        ]);

        setRecentEvaluations([
          { id: 1, title: 'Midterm Math', date: '2 hours ago', status: 'Completed', score: '88%' },
          { id: 2, title: 'Physics Quiz', date: '5 hours ago', status: 'Reviewing', score: 'Pending' },
          { id: 3, title: 'Chem Lab Report', date: '1 day ago', status: 'Completed', score: '92%' },
        ]);

      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load teacher dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-8 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Teacher Dashboard
            </h1>
            <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
              Overview of your classes, student performance, and pending evaluations.
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/teacher/results')}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Calendar className="mr-2 h-4 w-4" /> View History
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/teacher/upload')}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:from-brand-500 hover:to-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <FileText className="mr-2 h-4 w-4" /> Evaluate New
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
            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div key={i} variants={itemVariants} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/70">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 opacity-50 blur-2xl transition-opacity group-hover:opacity-100 dark:from-brand-900/30 dark:to-brand-800/10"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400">
                        <stat.icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                    <p className={`mt-2 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : stat.trend === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {stat.change}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-3">
              <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Class Performance Trends</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Average vs highest and lowest scores over time</p>
                  </div>
                  <Activity className="h-5 w-5 text-slate-400" />
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Area type="monotone" dataKey="avgScore" name="Average Score" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                      <Area type="step" dataKey="highest" name="Highest Score" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                      <Area type="step" dataKey="lowest" name="Lowest Score" stroke="#ef4444" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Subject Averages</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Score distribution by subject</p>
                  </div>
                </div>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {subjectData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions & Recent Activities */}
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70">
                <div className="border-b border-slate-100 p-6 dark:border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h3>
                      <p className="text-sm text-slate-500">Frequently used tools</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/teacher/upload')}
                      className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-center transition-all hover:border-brand-300 hover:bg-brand-50 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:border-brand-500/30 dark:hover:bg-brand-900/20"
                    >
                      <div className="mb-3 rounded-full bg-brand-100 p-3 text-brand-600 transition-transform group-hover:scale-110 dark:bg-brand-500/20 dark:text-brand-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Evaluate Papers</h4>
                      <p className="mt-1 text-xs text-slate-500">Upload new submissions</p>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/teacher/results')}
                      className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-center transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:border-cyan-500/30 dark:hover:bg-cyan-900/20"
                    >
                      <div className="mb-3 rounded-full bg-cyan-100 p-3 text-cyan-600 transition-transform group-hover:scale-110 dark:bg-cyan-500/20 dark:text-cyan-400">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">View Archive</h4>
                      <p className="mt-1 text-xs text-slate-500">Access past evaluations</p>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70">
                <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800/50">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Evaluations</h3>
                    <p className="text-sm text-slate-500">Latest graded papers</p>
                  </div>
                  <button onClick={() => router.push('/teacher/results')} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                    View all
                  </button>
                </div>
                <div className="p-0">
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {recentEvaluations.map((item) => (
                      <li key={item.id} className="flex items-center justify-between p-4 px-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                            {item.status === 'Completed' ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.date} • {item.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status === 'Completed' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'}`}>
                            {item.score}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
