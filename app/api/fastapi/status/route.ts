import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `${FASTAPI_BASE_URL.replace("/api/v1", "")}/health`,
      {
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: "connected",
        fastapi_url: FASTAPI_BASE_URL,
        health: data,
      });
    }

    return NextResponse.json(
      {
        status: "error",
        fastapi_url: FASTAPI_BASE_URL,
        error: `FastAPI returned status ${response.status}`,
      },
      { status: 503 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "disconnected",
        fastapi_url: FASTAPI_BASE_URL,
        error: error.message || "Cannot connect to FastAPI",
        help: [
          "1. Make sure FastAPI is running: cd fastapi_backend && uvicorn main:app --reload",
          "2. Check NEXT_PUBLIC_FASTAPI_URL in .env.local",
          "3. Verify CORS is enabled in FastAPI",
          "4. Restart Next.js dev server after changing .env.local",
        ],
      },
      { status: 503 },
    );
  }
}
