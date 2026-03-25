import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { StorySchema } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { schema, sampleData, rowCount, fileName } = await req.json();

    const { object: story } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: StorySchema,
      prompt: `You are a data analyst creating an insightful narrative from a dataset.

Dataset: "${fileName}" with ${rowCount} rows
Columns: ${JSON.stringify(schema)}
Sample data (first 50 rows): ${JSON.stringify(sampleData)}

Create a compelling data story with these requirements:
1. Write a catchy title that captures the main finding
2. Start with an executive summary (3-5 sentences) of the most important findings
3. Provide 3-5 key metrics with their values and trends
4. Identify 4-6 key insights including:
   - Trends over time (if date columns exist)
   - Comparisons between categories
   - Distribution patterns
   - Anomalies or outliers
   - Correlations between variables
5. For each insight, choose the most appropriate chart type and generate chart data
   - Chart data must use the actual column names from the dataset
   - Generate 5-15 data points per chart derived from patterns in the sample
   - For pie charts, limit to 5-6 slices
6. End with a conclusion and 3-4 suggested follow-up questions

IMPORTANT:
- Write narratives that a non-technical stakeholder would understand
- Use specific numbers and percentages, not vague statements
- Each insight should have a unique id (use slugified titles)
- Chart data arrays must contain objects with keys matching xAxis and yAxis field names
- For pie charts, use "name" and "value" as keys in data objects`,
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze data" },
      { status: 500 }
    );
  }
}
