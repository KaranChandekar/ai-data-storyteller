"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import type { ChartConfig } from "@/types";

interface TrendChartProps {
  chart: ChartConfig;
  height?: number;
}

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(262, 83%, 58%)",
  "hsl(24, 95%, 53%)",
];

export function TrendChart({ chart, height = 300 }: TrendChartProps) {
  const { type, xAxis, yAxis, data, highlight } = chart;
  const yKey = yAxis || "value";

  if (type === "scatter") {
    return (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey={xAxis} name={xAxis} fontSize={12} />
            <YAxis dataKey={yKey} name={yKey} fontSize={12} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={data} fill={COLORS[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "area") {
    return (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey={xAxis} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={COLORS[0]}
              fill={COLORS[0]}
              fillOpacity={0.2}
            />
            {highlight && data[highlight.index] && (
              <ReferenceDot
                x={data[highlight.index][xAxis] as string}
                y={data[highlight.index][yKey] as number}
                r={6}
                fill="hsl(0, 84%, 60%)"
                stroke="none"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey={xAxis} fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={COLORS[0]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          {highlight && data[highlight.index] && (
            <ReferenceDot
              x={data[highlight.index][xAxis] as string}
              y={data[highlight.index][yKey] as number}
              r={6}
              fill="hsl(0, 84%, 60%)"
              stroke="none"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
