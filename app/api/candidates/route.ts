import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Only HR users and admins may list candidates.
  const session = await auth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { user } = session;
  if (user.role !== "HR" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const experienceMin = searchParams.get("experienceMin");
    const experienceMax = searchParams.get("experienceMax");
    // companyId from query is only honoured for ADMIN; HR always uses their own
    const queryCompanyId = searchParams.get("companyId");

    const skip = (page - 1) * limit;

    // ── RBAC: enforce company scope ──────────────────────────────────────────
    const effectiveCompanyId =
      user.role === "HR"
        ? user.hrProfile?.companyId
        : user.role === "ADMIN"
          ? queryCompanyId
          : null;

    if (user.role === "HR" && !effectiveCompanyId) {
      // HR user has no company yet — return empty list
      return NextResponse.json({
        success: true,
        candidates: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    // Build where clause for filtering
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (experienceMin !== null || experienceMax !== null) {
      whereClause.experience = {};
      if (experienceMin) {
        whereClause.experience.gte = parseInt(experienceMin);
      }
      if (experienceMax) {
        whereClause.experience.lte = parseInt(experienceMax);
      }
    }

    // Filter candidates who applied to jobs from specific company
    if (effectiveCompanyId) {
      whereClause.applications = {
        some: {
          job: {
            companyId: effectiveCompanyId,
          },
        },
      };
    }

    // Get candidates with their resumes and applications
    const candidates = await prisma.candidate.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        resumes: {
          orderBy: {
            uploadDate: "desc",
          },
          select: {
            id: true,
            fileName: true,
            filePath: true,
            uploadDate: true,
            // extractedText is large and only needed on the individual profile
            // page — exclude it from list responses to keep payloads small.
          },
        },
        applications: {
          orderBy: {
            appliedAt: "desc",
          },
          select: {
            id: true,
            score: true,
            status: true,
            appliedAt: true,
            job: {
              select: {
                id: true,
                title: true,
                location: true,
              },
            },
          },
        },
        user: {
          select: {
            avatarUrl: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCandidates = await prisma.candidate.count({
      where: whereClause,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCandidates / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      candidates,
      pagination: {
        page,
        limit,
        total: totalCandidates,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch candidates",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, experience } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    // Check if candidate already exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { email },
    });

    if (existingCandidate) {
      return NextResponse.json(
        { error: "Candidate with this email already exists" },
        { status: 409 },
      );
    }

    // Create new candidate
    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        experience: experience || 0,
      },
      include: {
        resumes: true,
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                location: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create candidate",
      },
      { status: 500 },
    );
  }
}
