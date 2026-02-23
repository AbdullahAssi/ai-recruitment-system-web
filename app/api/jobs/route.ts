import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const companyId = searchParams.get("companyId"); // For HR users to filter by their company

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

    // Status filter
    if (status === "active") {
      whereClause.isActive = true;
    } else if (status === "inactive") {
      whereClause.isActive = false;
    } else if (!includeInactive) {
      whereClause.isActive = true;
    }

    // Company filter
    if (companyId) {
      whereClause.companyId = companyId;
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

    // Cache public active-jobs responses (candidate browsing) for a short
    // window so repeated requests hit the CDN / browser cache instead of the
    // DB. HR-specific requests (companyId or includeInactive) are never cached.
    if (!companyId && !includeInactive) {
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
