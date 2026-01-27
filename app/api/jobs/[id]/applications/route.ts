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

    // Get all applications for this job with candidate details
    const applications = await prisma.application.findMany({
      where: { jobId },
      orderBy: { appliedAt: "desc" },
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

    // Calculate statistics
    const stats = {
      pending: applications.filter((app) => app.status === "PENDING").length,
      reviewed: applications.filter((app) => app.status === "REVIEWED").length,
      shortlisted: applications.filter((app) => app.status === "SHORTLISTED")
        .length,
      rejected: applications.filter((app) => app.status === "REJECTED").length,
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
      totalApplications: applications.length,
      stats,
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
