"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutoChart } from "@/components/charts/auto-chart";
import type { Story } from "@/types";

interface PresentationModeProps {
  story: Story;
  onClose: () => void;
}

export function PresentationMode({ story, onClose }: PresentationModeProps) {
  const totalSlides = story.insights.length + 2;
  const [current, setCurrent] = useState(0);

  const goNext = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  const renderSlide = () => {
    if (current === 0) {
      return (
        <div className="text-center max-w-3xl px-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-violet-500/25">
            <Presentation className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-violet-600 via-blue-600 to-fuchsia-600 bg-clip-text text-transparent">
            {story.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            {story.executiveSummary}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10">
            {story.keyMetrics.map((m, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"
              >
                <p className="text-xs sm:text-sm text-muted-foreground">{m.label}</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{m.value}</p>
                {m.change && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {m.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (current === totalSlides - 1) {
      return (
        <div className="text-center max-w-3xl px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Key Takeaways
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
            {story.conclusion}
          </p>
          <div className="text-left max-w-xl mx-auto">
            <h3 className="text-lg font-bold mb-4">Next Steps</h3>
            <div className="space-y-3">
              {story.suggestedQuestions.map((q, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl bg-muted/40 text-muted-foreground"
                >
                  <span className="text-violet-500 font-bold shrink-0">?</span>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const insight = story.insights[current - 1];
    return (
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center h-8 px-3 rounded-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 text-sm font-mono text-violet-600 dark:text-violet-400 mb-3">
            Insight #{current} of {story.insights.length}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold">{insight.title}</h2>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 mb-8 shadow-sm">
          <AutoChart chart={insight.chart} height={350} />
        </div>
        <p className="text-base sm:text-lg text-muted-foreground text-center leading-relaxed max-w-2xl mx-auto">
          {insight.narrative}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-violet-400/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/50">
        <span className="text-sm text-muted-foreground font-medium">
          {current + 1} / {totalSlides}
        </span>
        <div className="w-full max-w-xs mx-4 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${((current + 1) / totalSlides) * 100}%` }}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="cursor-pointer"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-center justify-center w-full"
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 px-4 sm:px-6 py-4 border-t border-border/50">
        <Button
          variant="outline"
          size="icon"
          onClick={goPrev}
          disabled={current === 0}
          className="cursor-pointer h-10 w-10 rounded-xl"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-6 h-2.5 bg-gradient-to-r from-violet-500 to-blue-500"
                  : "w-2.5 h-2.5 bg-muted-foreground/25 hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={goNext}
          disabled={current === totalSlides - 1}
          className="cursor-pointer h-10 w-10 rounded-xl"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
