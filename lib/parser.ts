import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ColumnSchema, ColumnType, ParsedData } from "@/types";

function inferColumnType(values: string[]): ColumnType {
  const sample = values.filter(Boolean).slice(0, 100);
  if (sample.length === 0) return "text";

  const numericCount = sample.filter((v) => !isNaN(Number(v))).length;
  if (numericCount >= sample.length * 0.8) return "numeric";

  const dateCount = sample.filter((v) => {
    const d = Date.parse(v);
    return !isNaN(d) && v.length > 4;
  }).length;
  if (dateCount >= sample.length * 0.8) return "date";

  const uniqueRatio = new Set(sample).size / sample.length;
  if (uniqueRatio < 0.3) return "categorical";

  return "text";
}

export function analyzeSchema(
  data: Record<string, unknown>[]
): ColumnSchema[] {
  if (data.length === 0) return [];
  const columns = Object.keys(data[0]);
  return columns.map((col) => ({
    name: col,
    type: inferColumnType(data.map((row) => String(row[col] ?? ""))),
    uniqueValues: new Set(data.map((row) => row[col])).size,
    nullCount: data.filter(
      (row) => row[col] == null || row[col] === ""
    ).length,
    sample: data.slice(0, 5).map((row) => row[col]),
  }));
}

export function parseCSV(text: string): Record<string, unknown>[] {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  return result.data as Record<string, unknown>[];
}

export function parseTSV(text: string): Record<string, unknown>[] {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    delimiter: "\t",
  });
  return result.data as Record<string, unknown>[];
}

export function parseJSON(text: string): Record<string, unknown>[] {
  const parsed = JSON.parse(text);

  // Handle array of objects directly
  if (Array.isArray(parsed)) {
    return parsed.map((item) =>
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : { value: item }
    );
  }

  // Handle object with a single array property (e.g., { data: [...] })
  if (typeof parsed === "object" && parsed !== null) {
    const keys = Object.keys(parsed);
    for (const key of keys) {
      if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
        return parsed[key].map((item: unknown) =>
          typeof item === "object" && item !== null
            ? (item as Record<string, unknown>)
            : { value: item }
        );
      }
    }
    // Single object - wrap in array
    return [parsed as Record<string, unknown>];
  }

  throw new Error("JSON must contain an array of objects");
}

export function parseExcel(buffer: ArrayBuffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

export async function parsePDF(
  buffer: ArrayBuffer
): Promise<Record<string, unknown>[]> {
  // pdf-parse v1 exports a single function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParse = (await import("pdf-parse")) as any;
  const fn = pdfParse.default || pdfParse;
  const pdfData = await fn(Buffer.from(buffer));
  const text: string = pdfData.text;

  // Try to detect tabular data from the text
  const lines = text
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0);

  // Check if the content looks like tabular data (has consistent delimiters)
  const tabulardData = tryParseTabularText(lines);
  if (tabulardData && tabulardData.length > 0) {
    return tabulardData;
  }

  // Fall back to treating each line/paragraph as a text row
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 10);

  if (paragraphs.length > 0) {
    return paragraphs.map((p: string, i: number) => ({
      section: i + 1,
      content: p.slice(0, 500),
    }));
  }

  return lines.slice(0, 200).map((line: string, i: number) => ({
    line: i + 1,
    content: line,
  }));
}

export async function parseDOCX(
  buffer: ArrayBuffer
): Promise<Record<string, unknown>[]> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({
    buffer: Buffer.from(buffer),
  });
  const text = result.value;

  const lines = text
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0);

  // Try to detect tabular data
  const tabularData = tryParseTabularText(lines);
  if (tabularData && tabularData.length > 0) {
    return tabularData;
  }

  // Fall back to paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 10);

  if (paragraphs.length > 0) {
    return paragraphs.map((p: string, i: number) => ({
      section: i + 1,
      content: p.slice(0, 500),
    }));
  }

  return lines.slice(0, 200).map((line: string, i: number) => ({
    line: i + 1,
    content: line,
  }));
}

/**
 * Try to parse lines of text as tabular data.
 * Looks for consistent tab or multi-space delimiters.
 */
function tryParseTabularText(
  lines: string[]
): Record<string, unknown>[] | null {
  if (lines.length < 2) return null;

  // Try tab-delimited first
  const tabSplit = lines[0].split("\t");
  if (tabSplit.length >= 2) {
    const headers = tabSplit.map((h) => h.trim());
    const rows: Record<string, unknown>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split("\t");
      if (cols.length === headers.length) {
        const row: Record<string, unknown> = {};
        headers.forEach((h, j) => {
          const val = cols[j]?.trim();
          row[h] = isNaN(Number(val)) ? val : Number(val);
        });
        rows.push(row);
      }
    }
    if (rows.length >= 2) return rows;
  }

  // Try comma-delimited (CSV embedded in document)
  const csvSplit = lines[0].split(",");
  if (csvSplit.length >= 2) {
    const headers = csvSplit.map((h) => h.trim());
    const rows: Record<string, unknown>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      if (cols.length === headers.length) {
        const row: Record<string, unknown> = {};
        headers.forEach((h, j) => {
          const val = cols[j]?.trim();
          row[h] = isNaN(Number(val)) ? val : Number(val);
        });
        rows.push(row);
      }
    }
    if (rows.length >= 2) return rows;
  }

  return null;
}

export function getFileType(
  fileName: string
): "csv" | "tsv" | "json" | "excel" | "pdf" | "docx" | "unknown" {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "csv":
      return "csv";
    case "tsv":
    case "tab":
      return "tsv";
    case "json":
      return "json";
    case "xlsx":
    case "xls":
      return "excel";
    case "pdf":
      return "pdf";
    case "docx":
    case "doc":
      return "docx";
    default:
      return "unknown";
  }
}

export function parseFileContent(
  content: string | ArrayBuffer,
  fileName: string
): ParsedData {
  const isExcel = /\.(xlsx?|xls)$/i.test(fileName);
  const rows = isExcel
    ? parseExcel(content as ArrayBuffer)
    : parseCSV(content as string);

  return {
    rows,
    columns: analyzeSchema(rows),
    fileName,
    rowCount: rows.length,
  };
}
