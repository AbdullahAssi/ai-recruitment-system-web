import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const useOcrFallback = formData.get("use_ocr_fallback") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward to FastAPI
    const fastapiFormData = new FormData();
    fastapiFormData.append("file", file);
    fastapiFormData.append("use_ocr_fallback", String(useOcrFallback));

    const response = await fetch(`${FASTAPI_BASE_URL}/parsing/extract-pdf`, {
      method: "POST",
      body: fastapiFormData,
      headers: {
        ...(INTERNAL_API_KEY ? { "x-api-key": INTERNAL_API_KEY } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || "PDF extraction failed" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract PDF" },
      { status: 500 },
    );
  }
}
