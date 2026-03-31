"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Presentation, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryRenderer } from "@/components/story-renderer";
import { PresentationMode } from "@/components/presentation-mode";
import { ExportButton } from "@/components/export-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { StoryState } from "@/types";

export default function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [storyState, setStoryState] = useState<StoryState | null>(null);
  const [presenting, setPresenting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`story-${id}`);
    if (stored) {
      setStoryState(JSON.parse(stored));
    }
  }, [id]);

  if (!storyState) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-5">
            <FileQuestion className="h-8 w-8 text-violet-500" />
          </div>
          <p className="text-muted-foreground mb-5 text-lg">Story not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Upload New File
          </Button>
        </div>
      </div>
    );
  }

  if (presenting) {
    return (
      <PresentationMode
        story={storyState.story}
        onClose={() => setPresenting(false)}
      />
    );
  }

  return (
    <main className="flex-1">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-violet-400/5 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-[300px] w-[300px] rounded-full bg-blue-400/5 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </Button>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button
              variant="outline"
              onClick={() => setPresenting(true)}
              className="gap-2 cursor-pointer"
            >
              <Presentation className="h-4 w-4" />
              Present
            </Button>
            <ExportButton />
          </div>
        </div>

        <StoryRenderer story={storyState.story} />
      </div>
    </main>
  );
}
