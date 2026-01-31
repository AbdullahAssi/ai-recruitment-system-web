import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "HR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch basic stats in parallel
    const [
      totalJobs,
      activeJobs,
      totalCandidates,
      totalApplications,
      pendingApplications,
      recentApplications,
      applicationsByStatus,
      previousWeekApplications,
      recentApplicationsList,
      candidateSkills,
    ] = await Promise.all([
      // Total jobs
      prisma.job.count(),

      // Active jobs (using isActive boolean)
      prisma.job.count({
        where: { isActive: true },
      }),

      // Total candidates
      prisma.candidate.count(),

      // Total applications
      prisma.application.count(),

      // Pending applications
      prisma.application.count({
        where: { status: "PENDING" },
      }),

      // Recent applications (last 7 days)
      prisma.application.count({
        where: {
          appliedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Applications by status
      prisma.application.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),

      // Previous week applications (for growth calculation)
      prisma.application.count({
        where: {
          appliedAt: {
            gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Recent applications for trend (last 30 days)
      prisma.application.findMany({
        where: {
          appliedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          appliedAt: true,
        },
        orderBy: {
          appliedAt: "asc",
        },
      }),

      // Get candidate skills through the CandidateSkill relation
      prisma.candidateSkill.findMany({
        select: {
          skill: {
            select: {
              skillName: true,
            },
          },
        },
      }),
    ]);

    // Process applications trend (group by date in JavaScript)
    const trendMap = new Map<string, number>();
    recentApplicationsList.forEach((app) => {
      const dateStr = app.appliedAt.toISOString().split("T")[0];
      trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + 1);
    });

    const applicationsTrend = Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process top skills from candidateSkills relation
    const skillsMap = new Map<string, number>();
    candidateSkills.forEach((cs) => {
      const skillName = cs.skill.skillName;
      if (skillName) {
        skillsMap.set(skillName, (skillsMap.get(skillName) || 0) + 1);
      }
    });

    const topSkills = Array.from(skillsMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate growth percentage
    const applicationsGrowth =
      previousWeekApplications > 0
        ? ((recentApplications - previousWeekApplications) /
            previousWeekApplications) *
          100
        : recentApplications > 0
          ? 100
          : 0;

    return NextResponse.json({
      stats: {
        totalJobs,
        activeJobs,
        totalCandidates,
        totalApplications,
        pendingApplications,
        recentApplications,
        applicationsGrowth: Math.round(applicationsGrowth),
      },
      applicationsByStatus: applicationsByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      applicationsTrend,
      topSkills,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: String(error) },
      { status: 500 },
    );
  }
}
