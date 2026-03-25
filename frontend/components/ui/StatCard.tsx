"use client";

import { motion } from "framer-motion";
import { ComponentType, ReactNode } from "react";
import { LucideProps } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  subtitle?: string;
  icon?: ReactNode | ComponentType<LucideProps>;
}

export function StatCard({ label, value, trend, subtitle, icon }: StatCardProps) {
  const trendLabel = trend || subtitle;
  const IconComponent = typeof icon === "function" ? icon : null;

  return (
    <motion.article
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      className="rounded-2xl bg-panel p-6 shadow-sm ring-1 ring-slate-200/70 transition-all dark:ring-slate-800 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {IconComponent ? (
          <div className="text-slate-400 dark:text-slate-500">
            <IconComponent className="h-5 w-5" />
          </div>
        ) : icon ? (
          <div className="text-slate-400 dark:text-slate-500">{icon as ReactNode}</div>
        ) : null}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {trendLabel && <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">{trendLabel}</p>}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand-100 to-transparent opacity-20 dark:from-brand-900" />
    </motion.article>
  );
}
