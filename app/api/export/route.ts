import { NextResponse } from "next/server";

export async function POST() {
  // PDF export is handled client-side with jsPDF + html2canvas
  // This endpoint can be extended for server-side export if needed
  return NextResponse.json({
    message: "Export is handled client-side. Use the export button in the UI.",
  });
}
