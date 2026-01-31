import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const targetUrl = `${FASTAPI_BASE_URL}/match/jobs`;

    console.log(`[Matching] ======== DEBUG INFO ========`);
    console.log(`[Matching] FASTAPI_BASE_URL: ${FASTAPI_BASE_URL}`);
    console.log(`[Matching] Target URL: ${targetUrl}`);
    console.log(
      `[Matching] env.NEXT_PUBLIC_FASTAPI_URL: ${process.env.NEXT_PUBLIC_FASTAPI_URL}`,
    );
    console.log(`[Matching] Request body:`, {
      job_description_length: body.job_description?.length,
      candidates_count: body.candidates?.length,
      top_k: body.top_k,
      min_score: body.min_score,
    });
    console.log(`[Matching] ===========================`);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { detail: errorText };
      }

      console.error("[Matching] FastAPI error response:", {
        status: response.status,
        error,
      });

      return NextResponse.json(
        {
          error: error.detail || "Candidate matching failed",
          details: error,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log(
      `[Matching] Success - matched ${data.matches?.length || 0} candidates`,
    );
    console.log("[Matching] Response structure:", {
      has_matches: !!data.matches,
      matches_count: data.matches?.length,
      first_match_keys: data.matches?.[0] ? Object.keys(data.matches[0]) : [],
      sample_match: data.matches?.[0],
    });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Matching] Exception:", error);

    // Check if it's a network error (FastAPI not running)
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error:
            "Cannot connect to AI backend. Please ensure FastAPI is running on port 8000.",
          details: "Connection refused - is the FastAPI server running?",
        },
        { status: 503 },
      );
    }

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout - AI backend took too long to respond" },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to match candidates",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
