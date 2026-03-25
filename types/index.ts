export type ColumnType = "numeric" | "date" | "categorical" | "text";

export interface ColumnSchema {
  name: string;
  type: ColumnType;
  uniqueValues: number;
  nullCount: number;
  sample: unknown[];
}

export interface ParsedData {
  rows: Record<string, unknown>[];
  columns: ColumnSchema[];
  fileName: string;
  rowCount: number;
}

export interface KeyMetric {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "stable";
}

export interface ChartHighlight {
  type: "max" | "min" | "anomaly" | "trend-change";
  index: number;
  label: string;
}

export interface ChartConfig {
  type: "line" | "bar" | "pie" | "area" | "scatter";
  xAxis: string;
  yAxis?: string;
  groupBy?: string;
  data: Record<string, unknown>[];
  highlight?: ChartHighlight;
}

export interface Insight {
  id: string;
  type: "trend" | "comparison" | "distribution" | "anomaly" | "correlation" | "summary";
  title: string;
  narrative: string;
  importance: "high" | "medium" | "low";
  chart: ChartConfig;
}

export interface Story {
  title: string;
  executiveSummary: string;
  keyMetrics: KeyMetric[];
  insights: Insight[];
  conclusion: string;
  suggestedQuestions: string[];
}

export interface StoryState {
  id: string;
  parsedData: ParsedData;
  story: Story;
  createdAt: string;
}
