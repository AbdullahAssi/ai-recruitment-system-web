import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

// GET email history
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user with RBAC
    const authResult = await auth(request);

    if (!authResult?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user } = authResult;

    // Only HR users can access email history
    if (user.role !== "HR") {
      return NextResponse.json(
        { success: false, error: "Forbidden - HR access only" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const candidateId = searchParams.get("candidateId");
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause for filtering with company-based RBAC
    const whereClause: any = {};
    const andConditions: any[] = [];

    // RBAC: Filter by company - only show emails for jobs belonging to HR's company
    // Include emails with no job OR emails where job belongs to HR's company
    if (user.hrProfile?.companyId) {
      andConditions.push({
        OR: [
          { jobId: null }, // Include emails with no job association
          {
            job: {
              companyId: user.hrProfile.companyId,
            },
          },
        ],
      });
    }

    if (candidateId) {
      andConditions.push({ candidateId });
    }

    if (jobId) {
      andConditions.push({ jobId });
    }

    if (status && status !== "all") {
      andConditions.push({ status });
    }

    // Search by recipient email or subject
    if (search) {
      andConditions.push({
        OR: [
          { recipient: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // Combine all conditions with AND
    if (andConditions.length > 0) {
      whereClause.AND = andConditions;
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
            company: true,
            companyInfo: {
              select: {
                id: true,
                name: true,
              },
            },
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

    return NextResponse.json({
      success: true,
      emailHistory,
      pagination: {
        page,
        limit,
        totalCount: totalEmails,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching email history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch email history",
      },
      { status: 500 },
    );
  }
}
