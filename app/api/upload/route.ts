import { NextResponse } from "next/server";
import {
  parseCSV,
  parseTSV,
  parseJSON,
  parseExcel,
  parsePDF,
  parseDOCX,
  analyzeSchema,
  getFileType,
} from "@/lib/parser";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = getFileType(fileName);

    if (fileType === "unknown") {
      return NextResponse.json(
        {
          error:
            "Unsupported file format. Please upload CSV, TSV, JSON, Excel, PDF, or DOCX files.",
        },
        { status: 400 }
      );
    }

    let rows: Record<string, unknown>[];

    switch (fileType) {
      case "excel": {
        const buffer = await file.arrayBuffer();
        rows = parseExcel(buffer);
        break;
      }
      case "pdf": {
        const buffer = await file.arrayBuffer();
        rows = await parsePDF(buffer);
        break;
      }
      case "docx": {
        const buffer = await file.arrayBuffer();
        rows = await parseDOCX(buffer);
        break;
      }
      case "tsv": {
        const text = await file.text();
        rows = parseTSV(text);
        break;
      }
      case "json": {
        const text = await file.text();
        rows = parseJSON(text);
        break;
      }
      case "csv":
      default: {
        const text = await file.text();
        rows = parseCSV(text);
        break;
      }
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "File contains no data" },
        { status: 400 }
      );
    }

    const columns = analyzeSchema(rows);
    const id = crypto.randomUUID();

    return NextResponse.json({
      id,
      fileName,
      rowCount: rows.length,
      columns,
      preview: rows.slice(0, 10),
      sampleData: rows.slice(0, 50),
      allData: rows,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 500 }
    );
  }
}
