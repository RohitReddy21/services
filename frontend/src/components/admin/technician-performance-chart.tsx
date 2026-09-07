"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdminTechnician } from "@/lib/api/admin-client";
import { EmptyState } from "@/components/ui/empty-state";

const gbp = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export default function TechnicianPerformanceChart({
  technicians,
}: {
  technicians: AdminTechnician[];
}) {
  if (technicians.length === 0) {
    return <EmptyState message="No engineer accounts yet." />;
  }

  const chartData = technicians
    .map((t) => ({
      name: t.name.split(" ")[0] || t.name,
      completedJobs: t.completedJobs,
      revenue: t.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="jobs"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => gbp(v)}
            width={64}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "revenue"
                ? [gbp(Number(value)), "Revenue"]
                : [Number(value), "Completed jobs"]
            }
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
          />
          <Bar yAxisId="jobs" dataKey="completedJobs" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={14} />
          <Bar yAxisId="revenue" dataKey="revenue" fill="#2b6bf0" radius={[4, 4, 0, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
