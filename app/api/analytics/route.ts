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

    const [
      candidateStats,

      jobStats,
      applicationStats,
      topJobsData,
      // Recent activity data
      recentActivityData,
    ] = await Promise.all([
      // Optimized candidate statistics
      Promise.all([
        prisma.candidate.count(),
        prisma.candidate.count({
          where: {
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
        prisma.candidate.count({
          where: {
            resumes: {
              some: {},
            },
          },
        }),
        prisma.candidate.count({
          where: {
            applications: {
              some: {
                status: {
                  in: ["PENDING", "REVIEWED"],
                },
              },
            },
          },
        }),
      ]),

      // Optimized job statistics
      Promise.all([
        prisma.job.count(),
        prisma.job.count({
          where: {
            isActive: true,
          },
        }),
        prisma.job.count({
          where: {
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
      ]),

      // Optimized application statistics - use groupBy for better performance
      Promise.all([
        prisma.application.count(),
        prisma.application.count({
          where: {
            appliedAt: {
              gte: startOfWeek,
            },
          },
        }),
        prisma.application.groupBy({
          by: ["status"],
          _count: {
            id: true,
          },
        }),
      ]),

      // Get top performing jobs with optimized query
      prisma.job.findMany({
        where: {
          applications: {
            some: {},
          },
        },
        select: {
          id: true,
          title: true,
          location: true,
          _count: {
            select: {
              applications: true,
            },
          },
          applications: {
            select: {
              score: true,
            },
            where: {
              score: {
                not: null,
              },
            },
          },
        },
        orderBy: {
          applications: {
            _count: "desc",
          },
        },
        take: 5,
      }),

      // Get recent activity data in parallel
      Promise.all([
        prisma.application.findMany({
          take: 5,
          orderBy: {
            appliedAt: "desc",
          },
          select: {
            appliedAt: true,
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
        }),
        prisma.candidate.findMany({
          take: 3,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            name: true,
            createdAt: true,
          },
        }),
        prisma.job.findMany({
          take: 2,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            title: true,
            createdAt: true,
          },
        }),
      ]),
    ]);

    // Process the results
    const [
      totalCandidates,
      candidatesThisMonth,
      candidatesWithResumes,
      candidatesWithActiveApplications,
    ] = candidateStats;
    const [totalJobs, activeJobs, jobsThisMonth] = jobStats;
    const [totalApplications, applicationsThisWeek, applicationStatusGroups] =
      applicationStats;

    // Process application status groups
    const statusCounts = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
    };

    applicationStatusGroups.forEach((group: any) => {
      switch (group.status) {
        case "PENDING":
          statusCounts.pending = group._count.id;
          break;
        case "REVIEWED":
          statusCounts.reviewed = group._count.id;
          break;
        case "SHORTLISTED":
          statusCounts.shortlisted = group._count.id;
          break;
        case "REJECTED":
          statusCounts.rejected = group._count.id;
          break;
      }
    });

    // Process top performing jobs
    const topPerformingJobs = topJobsData.map((job: any) => ({
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

    // Process recent activity
    const [recentApplications, recentCandidates, recentJobs] =
      recentActivityData;

    const recentActivity = [
      ...recentApplications.map((app: any) => ({
        type: "application" as const,
        message: `${app.candidate.name} applied to ${app.job.title}`,
        timestamp: formatTimeAgo(app.appliedAt),
      })),
      ...recentCandidates.map((candidate: any) => ({
        type: "candidate" as const,
        message: `${candidate.name} registered as a new candidate`,
        timestamp: formatTimeAgo(candidate.createdAt),
      })),
      ...recentJobs.map((job: any) => ({
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
        pending: statusCounts.pending,
        reviewed: statusCounts.reviewed,
        shortlisted: statusCounts.shortlisted,
        rejected: statusCounts.rejected,
        thisWeek: applicationsThisWeek,
      },
      topPerformingJobs,
      recentActivity,
    };

    return NextResponse.json(
      {
        success: true,
        analytics,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
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
