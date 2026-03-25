"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceArea,
} from "recharts";
import type { ChartConfig } from "@/types";

interface AnomalyHighlightProps {
  chart: ChartConfig;
  height?: number;
}

export function AnomalyHighlight({
  chart,
  height = 300,
}: AnomalyHighlightProps) {
  const { xAxis, yAxis, data, highlight } = chart;
  const yKey = yAxis || "value";
  const values = data
    .map((d) => Number(d[yKey]))
    .filter((v) => !isNaN(v));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  );

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
          <ReferenceArea
            y1={mean - 2 * std}
            y2={mean + 2 * std}
            fill="hsl(142, 71%, 45%)"
            fillOpacity={0.1}
            label="Normal Range"
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke="hsl(221, 83%, 53%)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          {highlight && data[highlight.index] && (
            <ReferenceDot
              x={data[highlight.index][xAxis] as string}
              y={data[highlight.index][yKey] as number}
              r={8}
              fill="hsl(0, 84%, 60%)"
              stroke="white"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
