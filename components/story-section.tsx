"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoChart } from "@/components/charts/auto-chart";
import type { Insight } from "@/types";

interface StorySectionProps {
  insight: Insight;
  index: number;
}

const importanceConfig: Record<string, { color: string; dot: string }> = {
  high: {
    color:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  medium: {
    color:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  low: {
    color:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  trend: {
    label: "Trend",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  comparison: {
    label: "Comparison",
    color:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800",
  },
  distribution: {
    label: "Distribution",
    color:
      "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/40 dark:text-fuchsia-300 dark:border-fuchsia-800",
  },
  anomaly: {
    label: "Anomaly",
    color:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
  },
  correlation: {
    label: "Correlation",
    color:
      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800",
  },
  summary: {
    label: "Summary",
    color:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800",
  },
};

export function StorySection({ insight, index }: StorySectionProps) {
  const importance = importanceConfig[insight.importance] || importanceConfig.low;
  const type = typeConfig[insight.type] || typeConfig.summary;

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold text-white shadow-sm">
            {index + 1}
          </span>
          <Badge variant="outline" className={`text-xs font-medium ${type.color}`}>
            {type.label}
          </Badge>
          <Badge variant="outline" className={`text-xs font-medium ${importance.color}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${importance.dot}`} />
            {insight.importance} priority
          </Badge>
        </div>
        <CardTitle className="text-xl">{insight.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 p-4 sm:p-5">
          <AutoChart chart={insight.chart} height={280} />
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {insight.narrative}
        </p>
        {insight.chart.highlight && (
          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-700 dark:text-rose-300 font-medium">
              {insight.chart.highlight.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
