import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get date ranges for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get candidate statistics
    const totalCandidates = await prisma.candidate.count();
    const candidatesThisMonth = await prisma.candidate.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
    const candidatesWithResumes = await prisma.candidate.count({
      where: {
        resumes: {
          some: {},
        },
      },
    });
    const candidatesWithActiveApplications = await prisma.candidate.count({
      where: {
        applications: {
          some: {
            status: {
              in: ["PENDING", "REVIEWED"],
            },
          },
        },
      },
    });

    // Get job statistics
    const totalJobs = await prisma.job.count();
    const activeJobs = await prisma.job.count({
      where: {
        isActive: true,
      },
    });
    const jobsThisMonth = await prisma.job.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get application statistics
    const totalApplications = await prisma.application.count();
    const applicationsThisWeek = await prisma.application.count({
      where: {
        appliedAt: {
          gte: startOfWeek,
        },
      },
    });
    const pendingApplications = await prisma.application.count({
      where: {
        status: "PENDING",
      },
    });
    const reviewedApplications = await prisma.application.count({
      where: {
        status: "REVIEWED",
      },
    });
    const shortlistedApplications = await prisma.application.count({
      where: {
        status: "SHORTLISTED",
      },
    });
    const rejectedApplications = await prisma.application.count({
      where: {
        status: "REJECTED",
      },
    });

    // Get top performing jobs
    const topJobs = await prisma.job.findMany({
      where: {
        applications: {
          some: {},
        },
      },
      include: {
        applications: {
          select: {
            score: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        applications: {
          _count: "desc",
        },
      },
      take: 5,
    });

    const topPerformingJobs = topJobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      location: job.location || "Remote",
      applicationCount: job._count.applications,
      averageScore:
        job.applications.length > 0
          ? job.applications.reduce(
              (sum: number, app: any) => sum + (app.score || 0),
              0
            ) / job.applications.length
          : 0,
    }));

    // Get recent activity
    const recentApplications = await prisma.application.findMany({
      take: 10,
      orderBy: {
        appliedAt: "desc",
      },
      include: {
        candidate: {
          select: {
            name: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
    });

    const recentCandidates = await prisma.candidate.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        name: true,
        createdAt: true,
      },
    });

    const recentJobs = await prisma.job.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        title: true,
        createdAt: true,
      },
    });

    // Format recent activity
    const recentActivity = [
      ...recentApplications.slice(0, 5).map((app: any) => ({
        type: "application" as const,
        message: `${app.candidate.name} applied to ${app.job.title}`,
        timestamp: formatTimeAgo(app.appliedAt),
      })),
      ...recentCandidates.slice(0, 3).map((candidate: any) => ({
        type: "candidate" as const,
        message: `${candidate.name} registered as a new candidate`,
        timestamp: formatTimeAgo(candidate.createdAt),
      })),
      ...recentJobs.slice(0, 2).map((job: any) => ({
        type: "job" as const,
        message: `New job "${job.title}" was posted`,
        timestamp: formatTimeAgo(job.createdAt),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    const analytics = {
      candidates: {
        total: totalCandidates,
        thisMonth: candidatesThisMonth,
        withResumes: candidatesWithResumes,
        activeApplications: candidatesWithActiveApplications,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        thisMonth: jobsThisMonth,
        totalApplications,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        reviewed: reviewedApplications,
        shortlisted: shortlistedApplications,
        rejected: rejectedApplications,
        thisWeek: applicationsThisWeek,
      },
      topPerformingJobs,
      recentActivity,
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
      },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} months ago`;
}
