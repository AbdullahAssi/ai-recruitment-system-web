import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const targetUrl = `${FASTAPI_BASE_URL}/quiz/generate`;

    console.log(`[Quiz] ======== DEBUG INFO ========`);
    console.log(`[Quiz] FASTAPI_BASE_URL: ${FASTAPI_BASE_URL}`);
    console.log(`[Quiz] Target URL: ${targetUrl}`);
    console.log(
      `[Quiz] env.NEXT_PUBLIC_FASTAPI_URL: ${process.env.NEXT_PUBLIC_FASTAPI_URL}`,
    );
    console.log(`[Quiz] Request body:`, {
      job_description_length: body.job_description?.length,
      num_questions: body.num_questions,
      difficulty: body.difficulty,
      question_types: body.question_types,
    });
    console.log(`[Quiz] ===========================`);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Quiz] FastAPI error response:", {
        status: response.status,
        error,
      });
      return NextResponse.json(
        { error: error.detail || "Quiz generation failed" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 },
    );
  }
}
