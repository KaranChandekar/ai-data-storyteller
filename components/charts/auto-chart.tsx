"use client";

import type { ChartConfig } from "@/types";
import { TrendChart } from "./trend-chart";
import { ComparisonChart } from "./comparison-chart";
import { DistributionChart } from "./distribution-chart";
import { AnomalyHighlight } from "./anomaly-highlight";

interface AutoChartProps {
  chart: ChartConfig;
  height?: number;
}

export function AutoChart({ chart, height = 300 }: AutoChartProps) {
  if (chart.highlight?.type === "anomaly") {
    return <AnomalyHighlight chart={chart} height={height} />;
  }

  switch (chart.type) {
    case "line":
    case "area":
      return <TrendChart chart={chart} height={height} />;
    case "bar":
      return <ComparisonChart chart={chart} height={height} />;
    case "pie":
      return <DistributionChart chart={chart} height={height} />;
    case "scatter":
      return <TrendChart chart={chart} height={height} />;
    default:
      return <ComparisonChart chart={chart} height={height} />;
  }
}
