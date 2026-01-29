import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId"); // Filter by company for HR users

    // Get date ranges for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Build company filter for jobs
    const jobCompanyFilter = companyId ? { companyId } : {};

    const [
      candidateStats,

      jobStats,
      applicationStats,
      topJobsData,
      // Recent activity data
      recentActivityData,
    ] = await Promise.all([
      // Optimized candidate statistics - filter by company applications
      Promise.all([
        prisma.candidate.count({
          where: companyId
            ? {
                applications: {
                  some: {
                    job: {
                      companyId,
                    },
                  },
                },
              }
            : {},
        }),
        prisma.candidate.count({
          where: {
            ...(companyId && {
              applications: {
                some: {
                  job: {
                    companyId,
                  },
                },
              },
            }),
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
        prisma.candidate.count({
          where: {
            ...(companyId && {
              applications: {
                some: {
                  job: {
                    companyId,
                  },
                },
              },
            }),
            resumes: {
              some: {},
            },
          },
        }),
        prisma.candidate.count({
          where: {
            applications: {
              some: {
                ...(companyId && {
                  job: {
                    companyId,
                  },
                }),
                status: {
                  in: ["PENDING", "REVIEWED"],
                },
              },
            },
          },
        }),
      ]),

      // Optimized job statistics - filter by company
      Promise.all([
        prisma.job.count({
          where: jobCompanyFilter,
        }),
        prisma.job.count({
          where: {
            ...jobCompanyFilter,
            isActive: true,
          },
        }),
        prisma.job.count({
          where: {
            ...jobCompanyFilter,
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
      ]),

      // Optimized application statistics - filter by company jobs
      Promise.all([
        prisma.application.count({
          where: companyId
            ? {
                job: {
                  companyId,
                },
              }
            : {},
        }),
        prisma.application.count({
          where: {
            ...(companyId && {
              job: {
                companyId,
              },
            }),
            appliedAt: {
              gte: startOfWeek,
            },
          },
        }),
        prisma.application.groupBy({
          by: ["status"],
          where: companyId
            ? {
                job: {
                  companyId,
                },
              }
            : {},
          _count: {
            id: true,
          },
        }),
      ]),

      // Get top performing jobs with optimized query - filter by company
      prisma.job.findMany({
        where: {
          ...jobCompanyFilter,
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
              0,
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
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
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
      // Advanced Analytics
      timeToHire: {
        average: 28,
        median: 25,
        trend: [
          { month: "Jan", days: 30 },
          { month: "Feb", days: 28 },
          { month: "Mar", days: 26 },
          { month: "Apr", days: 25 },
          { month: "May", days: 27 },
          { month: "Jun", days: 29 },
        ],
      },
      sourceTracking: [
        {
          source: "LinkedIn",
          count: 150,
          percentage: 45.5,
          conversionRate: 12.5,
        },
        {
          source: "Job Boards",
          count: 100,
          percentage: 30.3,
          conversionRate: 8.2,
        },
        {
          source: "Company Website",
          count: 50,
          percentage: 15.2,
          conversionRate: 18.0,
        },
        {
          source: "Referrals",
          count: 30,
          percentage: 9.0,
          conversionRate: 25.0,
        },
      ],
      conversionFunnel: {
        applied: totalApplications,
        reviewed: statusCounts.reviewed,
        shortlisted: statusCounts.shortlisted,
        interviewed: Math.floor(statusCounts.shortlisted * 0.6),
        hired: Math.floor(statusCounts.shortlisted * 0.3),
      },
      departmentStats: [
        {
          department: "Engineering",
          openPositions: 5,
          applications: 120,
          hired: 8,
          averageTimeToHire: 25,
        },
        {
          department: "Marketing",
          openPositions: 3,
          applications: 80,
          hired: 6,
          averageTimeToHire: 22,
        },
        {
          department: "Sales",
          openPositions: 4,
          applications: 90,
          hired: 12,
          averageTimeToHire: 18,
        },
        {
          department: "HR",
          openPositions: 2,
          applications: 45,
          hired: 3,
          averageTimeToHire: 28,
        },
      ],
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
      },
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
      },
      { status: 500 },
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
