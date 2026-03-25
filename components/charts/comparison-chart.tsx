"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ChartConfig } from "@/types";

interface ComparisonChartProps {
  chart: ChartConfig;
  height?: number;
}

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(262, 83%, 58%)",
  "hsl(24, 95%, 53%)",
  "hsl(340, 75%, 55%)",
  "hsl(180, 65%, 45%)",
];

export function ComparisonChart({ chart, height = 300 }: ComparisonChartProps) {
  const { xAxis, yAxis, data, highlight } = chart;
  const yKey = yAxis || "value";

  return (
    <div style={{ width: "100%", minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey={xAxis} fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  highlight && highlight.index === index
                    ? "hsl(0, 84%, 60%)"
                    : COLORS[index % COLORS.length]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
