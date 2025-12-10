"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface AlertChartProps {
  data: Array<{ date: string; value: number }>
}

export default function AlertChart({ data }: AlertChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" />
        <YAxis tick={{ fontSize: 10 }} stroke="#64748b" domain={["dataMin - 5", "dataMax + 5"]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
