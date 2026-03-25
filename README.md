# AI Data Storyteller

A Next.js 15 application that transforms raw data files into interactive, AI-generated narratives with auto-generated visualizations, key insights, and a step-through presentation mode.

Upload any CSV, Excel, JSON, TSV, PDF, or DOCX file and the AI automatically analyzes the data, identifies patterns and anomalies, and produces a compelling story complete with charts and actionable takeaways.

## How It Works

### 1. Upload Your Data

Drag and drop (or click to browse) any supported file. The app parses the file server-side and runs automatic type inference on every column — detecting numeric, date, categorical, and text fields.

**Supported formats:** CSV, TSV, JSON, Excel (.xlsx/.xls), PDF, DOCX

### 2. Preview & Confirm

A data preview table shows the first 10 rows alongside detected column types, unique value counts, and null counts, so you can verify the data was parsed correctly before analysis.

### 3. AI Analysis

When you click **Generate Data Story**, the column schema and a 50-row sample are sent to Google Gemini (gemini-2.5-flash) via the Vercel AI SDK's `generateObject` API. The AI returns a structured story following a strict Zod schema:

- **Executive Summary** — 3-5 sentence overview of the most important findings
- **Key Metrics** — headline KPIs with trend indicators (up/down/stable)
- **4-6 Insights** — each with a narrative explanation, importance level, and an auto-selected chart (line, bar, pie, area, or scatter)
- **Conclusion** — wrap-up of the analysis
- **Suggested Questions** — follow-up queries to explore next

### 4. Interactive Story View

The generated story renders as a scrollable narrative with:

- KPI metric cards with color-coded trend arrows
- Recharts-powered visualizations for each insight
- Insight type badges (trend, comparison, distribution, anomaly, correlation, summary)
- Importance indicators (high, medium, low)

### 5. Presentation Mode

Toggle into a full-screen, slide-by-slide view powered by Framer Motion. Navigate with arrow keys or on-screen controls. Each insight becomes its own slide with the chart and narrative front and center.

### 6. PDF Export

Export the entire story — charts, metrics, and narrative — as a PDF document using jsPDF and html2canvas.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript strict mode) |
| AI | Vercel AI SDK + Google Gemini (gemini-2.5-flash) |
| Schema Validation | Zod (structured AI output) |
| Charts | Recharts |
| CSV Parsing | Papaparse |
| Excel Parsing | SheetJS (xlsx) |
| PDF Parsing | pdf-parse |
| DOCX Parsing | Mammoth |
| PDF Export | jsPDF + html2canvas |
| Animations | Framer Motion |
| UI Components | shadcn/ui + Tailwind CSS |
| Icons | Lucide React |

## Project Structure

```
app/
  layout.tsx                 — Root layout with gradient background
  page.tsx                   — File upload landing page
  story/[id]/page.tsx        — Generated story view
  api/
    upload/route.ts          — File parsing + type inference endpoint
    analyze/route.ts         — AI analysis via generateObject
    export/route.ts          — PDF export endpoint

components/
  file-upload.tsx            — Drag-and-drop with file type validation
  data-preview.tsx           — First 10 rows + detected column types
  story-renderer.tsx         — Full narrative layout with all sections
  story-section.tsx          — Individual insight card with chart
  presentation-mode.tsx      — Full-screen slide-through view
  export-button.tsx          — PDF download trigger
  charts/
    auto-chart.tsx           — Routes to the correct chart component
    trend-chart.tsx          — Line/area charts for time-series data
    comparison-chart.tsx     — Bar charts for category comparisons
    distribution-chart.tsx   — Pie charts for proportional data
    anomaly-highlight.tsx    — Scatter plots with anomaly markers

lib/
  parser.ts                  — CSV/TSV/JSON/Excel/PDF/DOCX parsing + type inference
  schema.ts                  — Zod schemas for structured story output
  stats.ts                   — Basic statistical functions
  chart-recommender.ts       — Maps data patterns to chart types

types/
  index.ts                   — TypeScript interfaces for the full data pipeline
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
git clone https://github.com/KaranChandekar/ai-data-storyteller.git
cd ai-data-storyteller
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Data Flow

```
File Upload (drag & drop)
    |
    v
POST /api/upload
    |-- Parse file (Papaparse / SheetJS / pdf-parse / Mammoth)
    |-- Infer column types (numeric, date, categorical, text)
    |-- Return schema + preview + sample data
    |
    v
Client previews data (first 10 rows + column types)
    |
    v
POST /api/analyze
    |-- Send schema + 50-row sample to Gemini
    |-- generateObject with Zod StorySchema
    |-- Return structured story (title, summary, metrics, insights, charts)
    |
    v
Client renders story
    |-- KPI metric cards
    |-- Recharts visualizations (auto-selected chart types)
    |-- Narrative text for each insight
    |-- Presentation mode (Framer Motion slide transitions)
    |-- PDF export (jsPDF + html2canvas)
```

## License

MIT
