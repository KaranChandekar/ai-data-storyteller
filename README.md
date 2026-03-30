# AI Data Storyteller

A Next.js application that transforms raw CSV, Excel, PDF, and other data files into interactive narratives with auto-generated charts, key metrics, and AI-written insights — think of it as a presentation that writes itself from your data.

---

## What It Does

Upload any data file and the app will:

1. Parse and preview the data with automatic column-type detection
2. Send a schema + sample to Google Gemini for deep analysis
3. Generate a structured story: executive summary, KPI cards, 4-6 insight sections (each with a recommended chart), a conclusion, and suggested follow-up questions
4. Render the story as a scrollable narrative **or** a full-screen slide presentation
5. Export the entire story to PDF with one click

---

## Full App Flow

```
User uploads file (drag-and-drop)
        │
        ▼
POST /api/upload
  ├─ Detect file format (CSV / TSV / JSON / XLSX / XLS / PDF / DOCX)
  ├─ Parse rows with format-specific parser
  ├─ Infer column types  (numeric / date / categorical / text)
  └─ Return: id, fileName, rowCount, columns, preview (10 rows), sampleData (50 rows)
        │
        ▼
DataPreview component
  └─ Shows column badges (type-colored) + scrollable first-10-rows table
        │
        ▼
User clicks "Generate Data Story"
        │
        ▼
POST /api/analyze
  ├─ Sends schema + 50-row sample to Gemini 2.5 Flash via Vercel AI SDK
  ├─ Uses generateObject() with StorySchema (Zod-validated)
  └─ Returns structured Story object
        │
        ▼
Story stored in sessionStorage (keyed by UUID)
Navigate to /story/[id]
        │
        ▼
StoryRenderer
  ├─ Title + Executive Summary
  ├─ Key Metrics grid  (value, trend arrow, optional change %)
  ├─ Insight sections (each: title, chart, narrative, highlight annotation)
  ├─ Conclusion
  └─ Suggested Questions
        │
        ├─── "Present" button ──▶ PresentationMode
        │                          Full-screen slides with Framer Motion transitions
        │                          Keyboard: ← → Space Esc | clickable progress dots
        │
        └─── "Export PDF" button ──▶ html2canvas + jsPDF
                                       Captures #story-content div → downloads PDF
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), React 19, TypeScript |
| AI | Google Gemini 2.5 Flash via `@ai-sdk/google` + `ai` (Vercel AI SDK) |
| Schema validation | Zod |
| CSV / TSV | Papaparse |
| Excel | SheetJS (xlsx) |
| PDF | pdf-parse |
| DOCX | Mammoth |
| Charts | Recharts |
| Animations | Framer Motion |
| PDF Export | jsPDF + html2canvas |
| UI components | shadcn/ui (Button, Card, Tabs, Badge, Progress, Skeleton, Separator) |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |

---

## Project Structure

```
app/
├── layout.tsx                  # Root layout — Geist fonts, metadata
├── page.tsx                    # Landing page: hero, file upload, data preview, generate button
├── globals.css
├── api/
│   ├── upload/route.ts         # File parsing + schema inference
│   ├── analyze/route.ts        # AI story generation (Gemini)
│   └── export/route.ts         # Stub (export is handled client-side)
└── story/
    └── [id]/page.tsx           # Dynamic story view

components/
├── file-upload.tsx             # Drag-and-drop; validates type + 10 MB limit
├── data-preview.tsx            # Column badges + first-10-rows table
├── story-renderer.tsx          # Full story layout (metrics, insights, conclusion)
├── story-section.tsx           # Single insight card (chart + narrative + highlight)
├── presentation-mode.tsx       # Full-screen slide mode with keyboard nav
├── export-button.tsx           # html2canvas → jsPDF download
└── charts/
    ├── auto-chart.tsx          # Routes to correct chart component by type
    ├── trend-chart.tsx         # Line / area / scatter (Recharts)
    ├── comparison-chart.tsx    # Bar chart
    ├── distribution-chart.tsx  # Pie chart
    └── anomaly-highlight.tsx   # Line chart with ±2σ reference band

lib/
├── parser.ts                   # All file parsers + analyzeSchema + inferColumnType
├── schema.ts                   # Zod StorySchema (InsightSchema, ChartConfig, etc.)
├── stats.ts                    # mean, median, stdDev, percentile, detectOutliers
├── chart-recommender.ts        # Maps column types → best chart type
└── utils.ts                    # cn() utility

types/
├── index.ts                    # ColumnSchema, Insight, Story, StoryState, ChartConfig
└── pdf-parse.d.ts
```

---

## Key Implementation Details

### Column type inference (`lib/parser.ts`)

```
80 %+ numeric values  →  "numeric"
80 %+ parseable dates →  "date"
unique ratio < 30 %   →  "categorical"
otherwise             →  "text"
```

### Chart selection (`lib/chart-recommender.ts`)

```
date   + numeric          →  line
categorical + numeric (≤6 unique)  →  pie
categorical + numeric (>6 unique)  →  bar
numeric + numeric         →  scatter
date only                 →  area
default                   →  bar
```

### Story schema (`lib/schema.ts`)

The AI must return an object that satisfies this shape:

```typescript
{
  title: string
  executiveSummary: string          // 3-5 sentences
  keyMetrics: {
    label: string
    value: string
    change?: string
    trend?: "up" | "down" | "stable"
  }[]
  insights: {
    id: string
    type: "trend" | "comparison" | "distribution" | "anomaly" | "correlation" | "summary"
    title: string
    narrative: string               // 2-4 sentences
    importance: "high" | "medium" | "low"
    chart: {
      type: "line" | "bar" | "pie" | "area" | "scatter"
      xAxis: string
      yAxis?: string
      groupBy?: string
      data: Record<string, unknown>[]
      highlight?: { type: "max" | "min" | "anomaly" | "trend-change"; index: number; label: string }
    }
  }[]
  conclusion: string
  suggestedQuestions: string[]
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com) API key (free tier: ~1 M tokens/day)

### Installation

```bash
git clone https://github.com/your-username/ai-data-storyteller.git
cd ai-data-storyteller
npm install
```

### Environment variables

Create `.env.local` in the project root:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supported File Formats

| Format | Parser |
|---|---|
| `.csv` | Papaparse |
| `.tsv` | Papaparse (tab delimiter) |
| `.json` | Native JSON.parse |
| `.xlsx` / `.xls` | SheetJS |
| `.pdf` | pdf-parse (table detection + fallback) |
| `.docx` | Mammoth |

Maximum file size: **10 MB**

---

## License

MIT
