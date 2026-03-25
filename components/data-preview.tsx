"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColumnSchema } from "@/types";

interface DataPreviewProps {
  fileName: string;
  rowCount: number;
  columns: ColumnSchema[];
  preview: Record<string, unknown>[];
}

const typeColors: Record<string, string> = {
  numeric:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  date: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  categorical:
    "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800",
  text: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800",
};

export function DataPreview({
  fileName,
  rowCount,
  columns,
  preview,
}: DataPreviewProps) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-lg">Data Preview</CardTitle>
          <span className="text-sm text-muted-foreground">
            {fileName} &middot; {rowCount.toLocaleString()} rows &middot;{" "}
            {columns.length} columns
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {columns.map((col) => (
            <Badge
              key={col.name}
              variant="outline"
              className={`text-xs font-medium ${typeColors[col.type]}`}
            >
              {col.name}
              <span className="ml-1 opacity-60">({col.type})</span>
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {columns.map((col) => (
                  <th
                    key={col.name}
                    className="px-4 py-2.5 text-left font-semibold whitespace-nowrap text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.name}
                      className="px-4 py-2.5 whitespace-nowrap max-w-[200px] truncate"
                    >
                      {String(row[col.name] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
