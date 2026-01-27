import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const jobs = await prisma.job.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { postedDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}

// POST create new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, location, requirements } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: title, description" },
        { status: 400 },
      );
    }

    // Create job record
    const job = await prisma.job.create({
      data: {
        title,
        description,
        location: location || "",
        requirements: requirements || "",
        responsibilities: body.responsibilities || "",
      },
    });

    return NextResponse.json({
      success: true,
      job,
      message: "Job posted successfully",
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 },
    );
  }
}
