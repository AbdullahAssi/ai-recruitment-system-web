import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const companyId = searchParams.get("companyId"); // For HR users to filter by their company

    // Build where clause
    const whereClause: any = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        companyInfo: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
            location: true,
            size: true,
            website: true,
            isVerified: true,
          },
        },
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
    const { title, description, location, requirements, companyId, userId } =
      body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: title, description" },
        { status: 400 },
      );
    }

    // If userId provided, get their company from HR profile
    let finalCompanyId = companyId;
    if (userId && !finalCompanyId) {
      const hrProfile = await prisma.hRProfile.findUnique({
        where: { userId },
        select: { companyId: true },
      });
      finalCompanyId = hrProfile?.companyId;
    }

    // Create job record
    const job = await prisma.job.create({
      data: {
        title,
        description,
        location: location || "",
        requirements: requirements || "",
        responsibilities: body.responsibilities || "",
        ...(finalCompanyId && { companyId: finalCompanyId }),
      },
      include: {
        companyInfo: true,
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
