import type { ColumnSchema } from "@/types";

export type RecommendedChart = "line" | "bar" | "pie" | "area" | "scatter";

export function recommendChart(
  xCol: ColumnSchema,
  yCol?: ColumnSchema
): RecommendedChart {
  if (xCol.type === "date" && yCol?.type === "numeric") {
    return "line";
  }

  if (xCol.type === "categorical" && yCol?.type === "numeric") {
    if (xCol.uniqueValues <= 6) return "pie";
    return "bar";
  }

  if (xCol.type === "numeric" && yCol?.type === "numeric") {
    return "scatter";
  }

  if (xCol.type === "date") {
    return "area";
  }

  if (xCol.type === "categorical") {
    return "bar";
  }

  return "bar";
}
