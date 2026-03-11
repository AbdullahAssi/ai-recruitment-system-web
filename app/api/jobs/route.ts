import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Identify the caller without requiring auth (candidates and public can browse)
    const session = await auth(request);
    const callerRole = session?.user?.role;
    const callerCompanyId = session?.user?.hrProfile?.companyId;

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    // companyId from query is ONLY used for non-HR callers (e.g. ADMIN).
    // For HR users the company is always derived from their auth token.
    const queryCompanyId = searchParams.get("companyId");

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const status = searchParams.get("status") || "all"; // all, active, inactive
    const sortBy = searchParams.get("sortBy") || "date"; // date, title, applications
    const sortOrder = searchParams.get("sortOrder") || "desc"; // asc, desc

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);

    // Build where clause
    const whereClause: any = {};

    // ── RBAC: HR users ALWAYS see only their own company's jobs ──────────────
    if (callerRole === "HR") {
      if (!callerCompanyId) {
        // HR user has no company yet — return empty list
        return NextResponse.json({
          success: true,
          jobs: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
      }
      whereClause.companyId = callerCompanyId;
    } else if (callerRole === "ADMIN" && queryCompanyId) {
      whereClause.companyId = queryCompanyId;
    }
    // Unauthenticated / CANDIDATE: no company filter (public job board)

    // Status filter
    if (status === "active") {
      whereClause.isActive = true;
    } else if (status === "inactive") {
      // Only HR/ADMIN can request inactive jobs
      if (callerRole === "HR" || callerRole === "ADMIN") {
        whereClause.isActive = false;
      } else {
        whereClause.isActive = true;
      }
    } else if (
      !includeInactive ||
      (callerRole !== "HR" && callerRole !== "ADMIN")
    ) {
      whereClause.isActive = true;
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // Location filter
    if (location) {
      whereClause.location = { contains: location, mode: "insensitive" };
    }

    // Build order by clause
    let orderBy: any = { postedDate: "desc" };
    switch (sortBy) {
      case "title":
        orderBy = { title: sortOrder };
        break;
      case "applications":
        orderBy = { applications: { _count: sortOrder } };
        break;
      case "date":
      default:
        orderBy = { postedDate: sortOrder };
        break;
    }

    // Get total count for pagination
    const totalCount = await prisma.job.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / validatedLimit);
    const skip = (validatedPage - 1) * validatedLimit;

    const jobs = await prisma.job.findMany({
      where: whereClause,
      skip,
      take: validatedLimit,
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
      orderBy,
    });

    const response = NextResponse.json({
      success: true,
      jobs,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total: totalCount,
        totalPages,
      },
    });

    // Cache only public (candidate-browsing) requests. HR/ADMIN requests are never cached.
    if (!callerRole && !includeInactive) {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=60",
      );
    } else {
      response.headers.set("Cache-Control", "no-store");
    }

    return response;
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
    // Require HR or ADMIN to create a job
    const session = await auth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "HR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Derive companyId from auth token — never trust client-provided value
    let finalCompanyId = session.user.hrProfile?.companyId;
    if (!finalCompanyId && session.user.role === "HR") {
      return NextResponse.json(
        { error: "Complete your company setup before posting jobs" },
        { status: 400 },
      );
    }

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
