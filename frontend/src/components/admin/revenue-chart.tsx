"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdminRevenuePoint } from "@/types/coupon";
import { EmptyState } from "@/components/ui/empty-state";

const gbp = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

export default function RevenueChart({ data }: { data: AdminRevenuePoint[] }) {
  if (data.length === 0) {
    return (
      <EmptyState message="No priced, completed jobs yet, revenue tracking starts once bookings are priced." />
    );
  }

  const chartData = data.map((p) => ({ ...p, label: formatPeriod(p.period) }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0090f8" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0090f8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => gbp(v)}
            width={64}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "revenue" ? [gbp(Number(value)), "Revenue"] : [Number(value), "Jobs"]
            }
            labelFormatter={(label) => label}
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#0090f8"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
