"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "./EmptyState";

type ChartType = "line" | "bar" | "pie";

type DataPoint = Record<string, string | number>;

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  data?: DataPoint[];
  type?: ChartType;
  dataKey?: string;
  xKey?: string;
}

const PIE_COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function hasData(data?: DataPoint[]) {
  return Boolean(data && data.length > 0);
}

function inferXKey(data?: DataPoint[], fallback = "name") {
  if (!data || data.length === 0) return fallback;
  if (fallback in data[0]) return fallback;
  return (Object.keys(data[0]).find((key) => key !== "value") as string) || fallback;
}

function inferDataKey(data?: DataPoint[], fallback = "value") {
  if (!data || data.length === 0) return fallback;
  if (fallback in data[0]) return fallback;
  return (Object.keys(data[0]).find((key) => typeof data[0][key] === "number") as string) || fallback;
}

export function ChartCard({ title, subtitle, children, data, type, dataKey = "value", xKey = "name" }: ChartCardProps) {
  const resolvedXKey = inferXKey(data, xKey);
  const resolvedDataKey = inferDataKey(data, dataKey);

  const renderChart = () => {
    if (children) {
      return children;
    }

    if (!type || !hasData(data)) {
      return <EmptyState title="No chart data" description="Data will appear here once records are available." />;
    }

    if (type === "bar") {
      return (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey={resolvedXKey} tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey={resolvedDataKey} fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (type === "line") {
      return (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey={resolvedXKey} tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey={resolvedDataKey} stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey={resolvedDataKey} nameKey={resolvedXKey} outerRadius={100} label>
              {(data || []).map((entry, idx) => {
                const fill = typeof entry.color === "string" ? entry.color : PIE_COLORS[idx % PIE_COLORS.length];
                return <Cell key={`${String(entry[resolvedXKey])}-${idx}`} fill={fill} />;
              })}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="widget-panel relative overflow-hidden"
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-6">
        {renderChart()}
      </motion.div>
    </motion.article>
  );
}
