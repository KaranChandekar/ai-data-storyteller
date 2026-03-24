---
name: ai-data-storyteller
description: "Build an AI data storyteller that transforms CSV/Excel uploads into interactive narratives with auto-generated charts and insights. Use this skill whenever the user wants to work on the data storyteller project, mentions data narrative, data story, CSV analysis, auto-generated charts, data insights, anomaly detection, or wants to build/extend/debug any part of this application. Also trigger when the user mentions Papaparse, SheetJS, Recharts data visualization, or presentation mode in the context of this project."
---

# AI-Powered Data Storyteller

## What You're Building

A Next.js application where users upload any CSV or Excel file, and the AI automatically analyzes it, identifies patterns and anomalies, and generates an interactive narrative with key insights, comparisons, and auto-generated visualizations. Think of it as a presentation that writes itself from raw data.

## Architecture Overview

```
app/
├── layout.tsx
├── page.tsx                      # Upload landing
├── story/[id]/page.tsx           # Generated story view
├── api/
│   ├── upload/route.ts           # File processing
│   ├── analyze/route.ts          # AI data analysis
│   └── export/route.ts           # PDF export
├── components/
│   ├── file-upload.tsx           # Drag-and-drop CSV/Excel
│   ├── data-preview.tsx          # Show first N rows + schema
│   ├── story-renderer.tsx        # Renders the narrative
│   ├── story-section.tsx         # Individual insight section
│   ├── charts/
│   │   ├── auto-chart.tsx        # AI picks the best chart type
│   │   ├── trend-chart.tsx
│   │   ├── comparison-chart.tsx
│   │   ├── distribution-chart.tsx
│   │   └── anomaly-highlight.tsx
│   ├── presentation-mode.tsx     # Step-through slides
│   └── export-button.tsx         # PDF/image export
├── lib/
│   ├── parser.ts                 # CSV/Excel parsing + type inference
│   ├── schema.ts                 # Zod schemas for story structure
│   ├── stats.ts                  # Basic statistical functions
│   └── chart-recommender.ts      # Map data patterns to chart types
└── types/
    └── index.ts
```

## Tech Stack & Setup

```bash
npx create-next-app@latest data-storyteller --typescript --tailwind --eslint --app
cd data-storyteller

# Core AI
npm install ai @ai-sdk/google zod

# Data parsing
npm install papaparse @types/papaparse xlsx

# Visualization
npm install recharts

# PDF export
npm install jspdf html2canvas

# UI
npm install framer-motion lucide-react
npx shadcn@latest init
npx shadcn@latest add button card tabs badge progress skeleton separator
```

### Environment Variables

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

## Core Implementation Strategy

### 1. Data Parsing & Type Inference

Automatically detect column types (numeric, categorical, date, text) to inform the AI about what kind of analysis is possible.

```typescript
// lib/parser.ts
import Papa from "papaparse";
import * as XLSX from "xlsx";

export function parseFile(file: File): Promise<ParsedData> {
  if (file.name.endsWith(".csv")) return parseCSV(file);
  return parseExcel(file);
}

function inferColumnType(values: string[]): ColumnType {
  const sample = values.filter(Boolean).slice(0, 100);
  if (sample.every(v => !isNaN(Number(v)))) return "numeric";
  if (sample.every(v => !isNaN(Date.parse(v)))) return "date";
  if (new Set(sample).size < sample.length * 0.3) return "categorical";
  return "text";
}

export function analyzeSchema(data: Record<string, unknown>[]) {
  const columns = Object.keys(data[0]);
  return columns.map(col => ({
    name: col,
    type: inferColumnType(data.map(row => String(row[col]))),
    uniqueValues: new Set(data.map(row => row[col])).size,
    nullCount: data.filter(row => row[col] == null || row[col] === "").length,
    sample: data.slice(0, 5).map(row => row[col]),
  }));
}
```

### 2. Story Schema

```typescript
// lib/schema.ts
import { z } from "zod";

const InsightSchema = z.object({
  id: z.string(),
  type: z.enum(["trend", "comparison", "distribution", "anomaly", "correlation", "summary"]),
  title: z.string(),
  narrative: z.string().describe("2-4 sentence insight explanation"),
  importance: z.enum(["high", "medium", "low"]),
  chart: z.object({
    type: z.enum(["line", "bar", "pie", "area", "scatter", "heatmap"]),
    xAxis: z.string(),
    yAxis: z.string().optional(),
    groupBy: z.string().optional(),
    data: z.array(z.record(z.unknown())),
    highlight: z.object({
      type: z.enum(["max", "min", "anomaly", "trend-change"]),
      index: z.number(),
      label: z.string(),
    }).optional(),
  }),
});

export const StorySchema = z.object({
  title: z.string(),
  executiveSummary: z.string().describe("3-5 sentence overview of key findings"),
  keyMetrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
    change: z.string().optional(),
    trend: z.enum(["up", "down", "stable"]).optional(),
  })),
  insights: z.array(InsightSchema),
  conclusion: z.string(),
  suggestedQuestions: z.array(z.string()).describe("Follow-up questions the user might explore"),
});
```

### 3. AI Analysis Endpoint

Send the data schema and a sample to the AI, which generates the complete story structure.

```typescript
// app/api/analyze/route.ts
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { StorySchema } from "@/lib/schema";

export async function POST(req: Request) {
  const { schema, sampleData, rowCount } = await req.json();

  const { object: story } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: StorySchema,
    prompt: `You are a data analyst creating an insightful narrative from a dataset.

Dataset: ${rowCount} rows
Columns: ${JSON.stringify(schema)}
Sample data (first 50 rows): ${JSON.stringify(sampleData)}

Create a compelling data story:
1. Start with an executive summary of the most important findings
2. Identify 4-6 key insights (trends, anomalies, correlations, comparisons)
3. For each insight, choose the most appropriate chart type
4. Generate realistic chart data derived from the patterns in the sample
5. End with a conclusion and suggested follow-up questions

Write narratives that a non-technical stakeholder would understand.
Use specific numbers and percentages, not vague statements.`,
  });

  return Response.json(story);
}
```

### 4. Presentation Mode

A step-through view where each insight becomes a "slide" with the chart and narrative, powered by Framer Motion page transitions.

```typescript
// components/presentation-mode.tsx
"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function PresentationMode({ insights }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="flex flex-col items-center justify-center h-full p-12"
        >
          <h2 className="text-3xl font-bold mb-6">{insights[current].title}</h2>
          <AutoChart chart={insights[current].chart} />
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl text-center">
            {insights[current].narrative}
          </p>
        </motion.div>
      </AnimatePresence>
      {/* Navigation arrows + progress dots */}
    </div>
  );
}
```

## Implementation Phases

### Phase 1: Upload & Analysis (Week 1)
- Drag-and-drop file upload (CSV and Excel)
- Automatic type inference and schema detection
- Data preview table showing first rows + column types
- AI analysis endpoint with story generation
- Basic story rendering with charts

### Phase 2: Rich Narrative (Week 2)
- KPI metric cards with trend arrows
- Anomaly highlighting on charts
- Interactive chart tooltips and zoom
- Presentation mode (step-through slides)
- Keyboard navigation (arrow keys)

### Phase 3: Export & Polish (Week 3)
- PDF export with all charts and narrative
- Share via unique URL (Supabase storage)
- Dark/light theme
- Responsive design
- Multiple file comparison

## Free Resources

| Resource | Purpose | Free Tier |
|----------|---------|-----------|
| Google Gemini API | Data analysis + narrative | ~1M tokens/day |
| Recharts | Chart rendering | Open source |
| Papaparse | CSV parsing | Open source |
| SheetJS | Excel parsing | Open source |
| jsPDF | PDF export | Open source |
| Vercel | Hosting | 100GB bandwidth |

## Resume Talking Points

- **End-to-end data pipeline**: File parsing → type inference → AI analysis → visualization → export. Shows complete engineering capability.
- **Smart chart selection**: The AI picks chart types based on data relationships. Explain how you encoded chart selection heuristics.
- **Non-technical audience design**: Building for stakeholders (not developers) shows product thinking.
- **Anomaly detection**: Highlighting unexpected patterns demonstrates statistical awareness.
