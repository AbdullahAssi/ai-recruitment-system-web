import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

// GET email history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const candidateId = searchParams.get("candidateId");
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};

    if (candidateId) {
      whereClause.candidateId = candidateId;
    }

    if (jobId) {
      whereClause.jobId = jobId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get email history with related data
    const emailHistory = await prisma.emailHistory.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalEmails = await prisma.emailHistory.count({
      where: whereClause,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalEmails / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      emailHistory,
      pagination: {
        page,
        limit,
        totalEmails,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching email history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch email history",
      },
      { status: 500 }
    );
  }
}
