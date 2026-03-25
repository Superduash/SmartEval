"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartPayload } from "@/types";

interface WidgetProps {
  data: ChartPayload;
}

const PIE_COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#eab308", "#ec4899"];

function toChartRows(payload: ChartPayload): Array<{ label: string; value: number }> {
  const first = payload.datasets[0] || { data: [] };
  return payload.labels.map((label, index) => ({
    label,
    value: Number(first.data[index] ?? 0),
  }));
}

export function BarWidget({ data }: WidgetProps) {
  const rows = toChartRows(data);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name={data.datasets[0]?.label || "Value"} fill="#0ea5e9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineWidget({ data }: WidgetProps) {
  const rows = toChartRows(data);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" name={data.datasets[0]?.label || "Value"} stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieWidget({ data }: WidgetProps) {
  const rows = toChartRows(data);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="label" outerRadius={100} label>
            {rows.map((_, idx) => (
              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
