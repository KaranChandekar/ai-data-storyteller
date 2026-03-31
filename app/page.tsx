"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  Zap,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { DataPreview } from "@/components/data-preview";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ColumnSchema } from "@/types";

interface UploadResult {
  id: string;
  fileName: string;
  rowCount: number;
  columns: ColumnSchema[];
  preview: Record<string, unknown>[];
  sampleData: Record<string, unknown>[];
}

export default function HomePage() {
  const router = useRouter();
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileUploaded = (data: UploadResult) => {
    setUploadResult(data);
  };

  const handleAnalyze = async () => {
    if (!uploadResult) return;
    setAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: uploadResult.columns,
          sampleData: uploadResult.sampleData,
          rowCount: uploadResult.rowCount,
          fileName: uploadResult.fileName,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const story = await response.json();

      sessionStorage.setItem(
        `story-${uploadResult.id}`,
        JSON.stringify({
          id: uploadResult.id,
          parsedData: {
            rows: uploadResult.sampleData,
            columns: uploadResult.columns,
            fileName: uploadResult.fileName,
            rowCount: uploadResult.rowCount,
          },
          story,
          createdAt: new Date().toISOString(),
        })
      );

      router.push(`/story/${uploadResult.id}`);
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalyzing(false);
    }
  };

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm sm:text-base">AI Data Storyteller</span>
        </div>
        <ThemeSwitcher />
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-400/20 via-blue-400/15 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-fuchsia-400/15 via-pink-400/10 to-transparent blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 blur-3xl" />
        </div>

        <div className="px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-fuchsia-500/10 border border-violet-500/20 text-primary rounded-full px-5 py-2 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                AI-Powered Analysis
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Turn Your Data Into{" "}
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-fuchsia-600 bg-clip-text text-transparent">
                Compelling Stories
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Upload CSV, Excel, JSON, PDF, or DOCX files. Our AI analyzes your
              data, identifies patterns and anomalies, and generates an
              interactive narrative with charts and insights.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <FileUpload
              onFileUploaded={handleFileUploaded}
              isLoading={analyzing}
            />

            {uploadResult && (
              <>
                <DataPreview
                  fileName={uploadResult.fileName}
                  rowCount={uploadResult.rowCount}
                  columns={uploadResult.columns}
                  preview={uploadResult.preview}
                />

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/25 px-8 h-12 text-base cursor-pointer"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                        Generating Story...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Data Story
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 border-t bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Three simple steps to transform raw data into actionable insights
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="relative p-6 sm:p-8 border-0 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/20">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Upload Any Data</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Drop CSV, Excel, JSON, TSV, PDF, or DOCX files. We auto-detect
                column types, dates, categories, and numeric fields.
              </p>
            </Card>

            <Card className="relative p-6 sm:p-8 border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gemini AI identifies trends, correlations, anomalies, and patterns
                automatically.
              </p>
            </Card>

            <Card className="relative p-6 sm:p-8 border-0 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center mb-5 shadow-lg shadow-fuchsia-500/20">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Interactive Story</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get a presentation-ready narrative with charts, KPIs, and
                step-through slides.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats ribbon */}
      <section className="py-12 px-4 border-t">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                6+
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Chart Types</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <PieChart className="h-5 w-5 text-violet-500" />
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Auto
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Smart Detection</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                6+
              </span>
            </div>
            <p className="text-sm text-muted-foreground">File Formats Supported</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="h-5 w-5 text-fuchsia-500" />
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                PDF
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Export Ready</p>
          </div>
        </div>
      </section>
    </main>
  );
}
