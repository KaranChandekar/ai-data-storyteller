"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ColumnSchema } from "@/types";

interface FileUploadProps {
  onFileUploaded: (data: {
    id: string;
    fileName: string;
    rowCount: number;
    columns: ColumnSchema[];
    preview: Record<string, unknown>[];
    sampleData: Record<string, unknown>[];
  }) => void;
  isLoading: boolean;
}

export function FileUpload({ onFileUploaded, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = [".csv", ".tsv", ".tab", ".json", ".xlsx", ".xls", ".pdf", ".docx", ".doc"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(ext)) {
      setError("Unsupported format. Upload CSV, TSV, JSON, Excel, PDF, or DOCX files.");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return false;
    }
    setError(null);
    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onFileUploaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        uploadFile(e.dataTransfer.files[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 bg-card/80 backdrop-blur-sm ${
        dragActive
          ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 shadow-lg shadow-violet-500/10 scale-[1.01]"
          : "border-border hover:border-violet-400/50 hover:shadow-md"
      }`}
    >
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center p-10 sm:p-14 text-center"
      >
        {uploading || isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-2 border-violet-200 dark:border-violet-800" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-600" />
            </div>
            <p className="text-muted-foreground font-medium">
              {uploading ? "Parsing file..." : "Generating story..."}
            </p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <FileSpreadsheet className="h-7 w-7 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/40 dark:to-blue-900/40 flex items-center justify-center mb-5">
              <Upload className="h-8 w-8 text-violet-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Drop your data file here
            </h3>
            <p className="text-muted-foreground mb-5">
              Supports CSV, TSV, JSON, Excel, PDF, and DOCX up to 10MB
            </p>
            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 px-6 h-10 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition-all hover:shadow-lg hover:shadow-violet-500/30">
                Browse Files
              </span>
              <input
                type="file"
                accept=".csv,.tsv,.tab,.json,.xlsx,.xls,.pdf,.docx,.doc"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </>
        )}

        {error && (
          <p className="text-destructive text-sm mt-4 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
