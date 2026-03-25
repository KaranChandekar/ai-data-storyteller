import { z } from "zod";

const ChartHighlightSchema = z.object({
  type: z.enum(["max", "min", "anomaly", "trend-change"]),
  index: z.number(),
  label: z.string(),
});

const ChartConfigSchema = z.object({
  type: z.enum(["line", "bar", "pie", "area", "scatter"]),
  xAxis: z.string(),
  yAxis: z.string().optional(),
  groupBy: z.string().optional(),
  data: z.array(z.record(z.string(), z.unknown())),
  highlight: ChartHighlightSchema.optional(),
});

const InsightSchema = z.object({
  id: z.string(),
  type: z.enum([
    "trend",
    "comparison",
    "distribution",
    "anomaly",
    "correlation",
    "summary",
  ]),
  title: z.string(),
  narrative: z.string().describe("2-4 sentence insight explanation"),
  importance: z.enum(["high", "medium", "low"]),
  chart: ChartConfigSchema,
});

export const StorySchema = z.object({
  title: z.string(),
  executiveSummary: z
    .string()
    .describe("3-5 sentence overview of key findings"),
  keyMetrics: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      change: z.string().optional(),
      trend: z.enum(["up", "down", "stable"]).optional(),
    })
  ),
  insights: z.array(InsightSchema),
  conclusion: z.string(),
  suggestedQuestions: z
    .array(z.string())
    .describe("Follow-up questions the user might explore"),
});
