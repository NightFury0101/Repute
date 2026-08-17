"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";

export function SalesChart({ data }: { data: { date: string; total: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: format(parseISO(d.date), "MMM d") }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B98A72" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#B98A72" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5DCCD" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#7C7266" }}
          axisLine={{ stroke: "#E5DCCD" }}
          tickLine={false}
          interval={4}
        />
        <YAxis tick={{ fontSize: 11, fill: "#7C7266" }} axisLine={false} tickLine={false} width={50} />
        <Tooltip
          contentStyle={{
            background: "#FFFDFB",
            border: "1px solid #E5DCCD",
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Sales"]}
        />
        <Area type="monotone" dataKey="total" stroke="#9C6F58" strokeWidth={2} fill="url(#salesGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
