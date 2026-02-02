import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const jobId = params.id;
    const { searchParams } = new URL(request.url);

    // Get pagination parameters from query string
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const searchTerm = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "newest";

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        requirements: true,
        postedDate: true,
        isActive: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 },
      );
    }

    // Build where clause for filtering
    const whereClause: any = { jobId };

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      whereClause.status = statusFilter.toUpperCase();
    }

    // Apply search filter (search in candidate name and email)
    if (searchTerm) {
      whereClause.candidate = {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      };
    }

    // Build order by clause
    let orderBy: any = { appliedAt: "desc" }; // Default: newest first

    switch (sortBy) {
      case "oldest":
        orderBy = { appliedAt: "asc" };
        break;
      case "score-high":
        orderBy = { score: "desc" };
        break;
      case "score-low":
        orderBy = { score: "asc" };
        break;
      case "name":
        orderBy = { candidate: { name: "asc" } };
        break;
      default:
        orderBy = { appliedAt: "desc" };
    }

    // Get total count for pagination
    const totalCount = await prisma.application.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / validatedLimit);

    // Calculate offset
    const skip = (validatedPage - 1) * validatedLimit;

    // Get paginated applications for this job with candidate details
    const applications = await prisma.application.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: validatedLimit,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            experience: true,
            resumes: {
              orderBy: { uploadDate: "desc" },
              select: {
                id: true,
                fileName: true,
                uploadDate: true,
              },
            },
            quizAttempts: {
              where: { quiz: { jobId } },
              orderBy: { score: "desc" },
              take: 1,
              select: {
                score: true,
                passed: true,
                completedAt: true,
              },
            },
          },
        },
      },
    });

    // Get overall statistics (not filtered)
    const allApplications = await prisma.application.findMany({
      where: { jobId },
      select: { status: true },
    });

    // Calculate statistics
    const stats = {
      pending: allApplications.filter((app) => app.status === "PENDING").length,
      reviewed: allApplications.filter((app) => app.status === "REVIEWED")
        .length,
      shortlisted: allApplications.filter((app) => app.status === "SHORTLISTED")
        .length,
      rejected: allApplications.filter((app) => app.status === "REJECTED")
        .length,
    };

    const data = {
      job: {
        ...job,
        postedDate: job.postedDate.toISOString(),
      },
      applications: applications.map((app) => ({
        id: app.id,
        score: app.score || 0,
        status: app.status,
        appliedAt: app.appliedAt.toISOString(),
        candidate: {
          id: app.candidate.id,
          name: app.candidate.name,
          email: app.candidate.email,
          experience: app.candidate.experience,
          resumes: app.candidate.resumes.map((resume) => ({
            id: resume.id,
            fileName: resume.fileName,
            uploadDate: resume.uploadDate.toISOString(),
          })),
          quizScore: app.candidate.quizAttempts[0]?.score || null,
          quizPassed: app.candidate.quizAttempts[0]?.passed || null,
        },
      })),
      totalApplications: allApplications.length, // Total applications for this job
      filteredCount: totalCount, // Applications matching current filters
      stats,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total: totalCount,
        totalPages,
      },
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch job applications",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const jobId = params.id;
    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Application ID and status are required",
        },
        { status: 400 },
      );
    }

    // Validate status
    const validStatuses = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status value",
        },
        { status: 400 },
      );
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
        jobId: jobId,
      },
      data: { status },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `Application status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update application status",
      },
      { status: 500 },
    );
  }
}
