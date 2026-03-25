"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartConfig } from "@/types";

interface DistributionChartProps {
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

export function DistributionChart({
  chart,
  height = 300,
}: DistributionChartProps) {
  const { xAxis, yAxis, data } = chart;

  // Determine the correct data keys - use xAxis/yAxis from the AI,
  // falling back to "name"/"value" for backwards compatibility
  const nameKey = xAxis || "name";
  const valueKey = yAxis || "value";

  // Normalize data: ensure each item has the expected keys
  const normalizedData = data.map((item) => {
    const name = item[nameKey] ?? item["name"] ?? Object.values(item)[0];
    const value = item[valueKey] ?? item["value"] ?? Object.values(item)[1];
    return { ...item, [nameKey]: name, [valueKey]: Number(value) || 0 };
  });

  return (
    <div style={{ width: "100%", minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={normalizedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={Math.min(height * 0.35, 110)}
            dataKey={valueKey}
            nameKey={nameKey}
            label={({ name, percent }: { name?: string; percent?: number }) =>
              `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {normalizedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
