import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/parsing/methods`, {
      headers: {
        ...(INTERNAL_API_KEY ? { "x-api-key": INTERNAL_API_KEY } : {}),
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch parsing methods" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch parsing methods error:", error);
    return NextResponse.json(
      { error: "Failed to fetch parsing methods" },
      { status: 500 },
    );
  }
}
