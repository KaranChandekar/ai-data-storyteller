"use client";

import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StorySection } from "@/components/story-section";
import type { Story } from "@/types";

interface StoryRendererProps {
  story: Story;
}

const trendConfig = {
  up: {
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  down: {
    icon: <TrendingDown className="h-4 w-4" />,
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
  stable: {
    icon: <Minus className="h-4 w-4" />,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export function StoryRenderer({ story }: StoryRendererProps) {
  return (
    <div id="story-content" className="space-y-10">
      {/* Title & Summary */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-violet-700 via-blue-700 to-fuchsia-700 bg-clip-text text-transparent">
          {story.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {story.executiveSummary}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {story.keyMetrics.map((metric, i) => {
          const trend = metric.trend ? trendConfig[metric.trend] : null;
          return (
            <Card
              key={i}
              className="border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-5 pb-4">
                <p className="text-sm text-muted-foreground mb-1.5 font-medium">
                  {metric.label}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {metric.value}
                  </span>
                  {trend && (
                    <span
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-full ${trend.bg} ${trend.color}`}
                    >
                      {trend.icon}
                    </span>
                  )}
                </div>
                {metric.change && (
                  <p
                    className={`text-sm mt-1.5 font-medium ${
                      trend ? trend.color : "text-muted-foreground"
                    }`}
                  >
                    {metric.change}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Insights */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Key Insights</h2>
        {story.insights.map((insight, i) => (
          <StorySection key={insight.id} insight={insight} index={i} />
        ))}
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Conclusion */}
      <Card className="border-0 bg-gradient-to-br from-violet-50 via-blue-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-blue-950/20 dark:to-fuchsia-950/20 shadow-sm">
        <CardContent className="pt-6 pb-6">
          <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-violet-700 to-blue-700 bg-clip-text text-transparent">
            Conclusion
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {story.conclusion}
          </p>
        </CardContent>
      </Card>

      {/* Suggested Questions */}
      <div>
        <h3 className="text-lg font-bold mb-4">Questions to Explore Further</h3>
        <div className="grid gap-3">
          {story.suggestedQuestions.map((q, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
