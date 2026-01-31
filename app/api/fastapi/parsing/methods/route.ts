import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/parsing/methods`);

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
