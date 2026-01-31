import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    // Check if application exists
    const application = await prisma.application.findFirst({
      where: {
        jobId,
        candidateId,
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
      },
    });

    if (!application) {
      // Return 200 with null instead of 404 - this means "no application found" which is a valid state
      return NextResponse.json({ application: null });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}
