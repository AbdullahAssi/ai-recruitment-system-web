import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, location, requirements } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: title, description" },
        { status: 400 }
      );
    }

    // Create job record
    const job = await prisma.job.create({
      data: {
        title,
        description,
        location: location || "",
        requirements: requirements || "",
      },
    });

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        requirements: job.requirements,
        postedDate: job.postedDate,
      },
      message: "Job description stored successfully",
    });
  } catch (error) {
    console.error("Error storing job description:", error);
    return NextResponse.json(
      { error: "Failed to store job description" },
      { status: 500 }
    );
  }
}
