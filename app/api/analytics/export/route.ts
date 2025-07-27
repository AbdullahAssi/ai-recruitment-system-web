import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "excel";

    // Get date ranges for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      candidateStats,
      jobStats,
      applicationStats,
      topJobsData,
      recentActivityData,
    ] = await Promise.all([
      // Candidate statistics
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

      // Job statistics
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
        prisma.application.count(),
      ]),

      // Application statistics
      Promise.all([
        prisma.application.count(),
        prisma.application.count({
          where: { status: "PENDING" },
        }),
        prisma.application.count({
          where: { status: "REVIEWED" },
        }),
        prisma.application.count({
          where: { status: "SHORTLISTED" },
        }),
        prisma.application.count({
          where: { status: "REJECTED" },
        }),
        prisma.application.count({
          where: {
            appliedAt: {
              gte: startOfWeek,
            },
          },
        }),
      ]),

      // Top performing jobs
      prisma.job.findMany({
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
          applications: {
            select: {
              score: true,
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

      // Recent activity
      Promise.all([
        prisma.application.findMany({
          select: {
            id: true,
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
          orderBy: {
            appliedAt: "desc",
          },
          take: 5,
        }),
        prisma.candidate.findMany({
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        }),
        prisma.job.findMany({
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 2,
        }),
      ]),
    ]);

    // Process the data
    const [total, thisMonth, withResumes, activeApplications] = candidateStats;
    const [totalJobs, activeJobs, thisMonthJobs, totalApplications] = jobStats;
    const [totalApps, pending, reviewed, shortlisted, rejected, thisWeekApps] =
      applicationStats;

    const analytics = {
      candidates: {
        total,
        thisMonth,
        withResumes,
        activeApplications,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        thisMonth: thisMonthJobs,
        totalApplications,
      },
      applications: {
        total: totalApps,
        pending,
        reviewed,
        shortlisted,
        rejected,
        thisWeek: thisWeekApps,
      },
      topPerformingJobs: topJobsData.map((job) => ({
        id: job.id,
        title: job.title,
        location: job.location,
        applicationCount: job._count.applications,
        averageScore:
          job.applications.length > 0
            ? job.applications.reduce(
                (sum: number, app: any) => sum + (app.score || 0),
                0
              ) / job.applications.length
            : 0,
      })),
      // Mock data for advanced analytics (you can extend this with real data)
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
        applied: totalApps,
        reviewed: reviewed,
        shortlisted: shortlisted,
        interviewed: Math.floor(shortlisted * 0.6),
        hired: Math.floor(shortlisted * 0.3),
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

    if (format === "pdf") {
      // For PDF export, you would typically use a library like jsPDF or Puppeteer
      // For now, we'll return a simple text response
      const reportContent = generatePDFContent(analytics);

      return new NextResponse(reportContent, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition":
            'attachment; filename="hr-analytics-report.txt"',
        },
      });
    } else if (format === "excel") {
      // Generate proper Excel file using xlsx library
      const excelBuffer = generateExcelContent(analytics);

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition":
            'attachment; filename="hr-analytics-report.xlsx"',
        },
      });
    } else {
      // For CSV export
      const csvContent = generateCSVContent(analytics);

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition":
            'attachment; filename="hr-analytics-report.csv"',
        },
      });
    }
  } catch (error) {
    console.error("Error exporting analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function generateExcelContent(analytics: any): Buffer {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Overview Sheet
  const overviewData = [
    ["HR Analytics Report"],
    ["Generated on:", new Date().toLocaleString()],
    [""],
    ["Key Metrics", "Value"],
    ["Total Candidates", analytics.candidates.total],
    ["Candidates This Month", analytics.candidates.thisMonth],
    ["Candidates with Resumes", analytics.candidates.withResumes],
    ["Total Jobs", analytics.jobs.total],
    ["Active Jobs", analytics.jobs.active],
    ["Total Applications", analytics.applications.total],
    ["Pending Applications", analytics.applications.pending],
    ["Reviewed Applications", analytics.applications.reviewed],
    ["Shortlisted Applications", analytics.applications.shortlisted],
    ["Rejected Applications", analytics.applications.rejected],
    ["Average Time to Hire", `${analytics.timeToHire.average} days`],
    ["Median Time to Hire", `${analytics.timeToHire.median} days`],
  ];

  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

  // Department Statistics Sheet
  const deptData = [
    ["Department Statistics"],
    [""],
    [
      "Department",
      "Open Positions",
      "Applications",
      "Hired",
      "Avg Time to Hire",
    ],
    ...analytics.departmentStats.map((dept: any) => [
      dept.department,
      dept.openPositions,
      dept.applications,
      dept.hired,
      dept.averageTimeToHire,
    ]),
  ];

  const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
  XLSX.utils.book_append_sheet(workbook, deptSheet, "Department Stats");

  // Source Tracking Sheet
  const sourceData = [
    ["Source Tracking"],
    [""],
    ["Source", "Count", "Percentage", "Conversion Rate"],
    ...analytics.sourceTracking.map((source: any) => [
      source.source,
      source.count,
      `${source.percentage}%`,
      `${source.conversionRate}%`,
    ]),
  ];

  const sourceSheet = XLSX.utils.aoa_to_sheet(sourceData);
  XLSX.utils.book_append_sheet(workbook, sourceSheet, "Source Tracking");

  // Time to Hire Trend Sheet
  const trendData = [
    ["Time to Hire Trend"],
    [""],
    ["Month", "Days"],
    ...analytics.timeToHire.trend.map((trend: any) => [
      trend.month,
      trend.days,
    ]),
  ];

  const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
  XLSX.utils.book_append_sheet(workbook, trendSheet, "Time to Hire Trend");

  // Conversion Funnel Sheet
  const funnelData = [
    ["Conversion Funnel"],
    [""],
    ["Stage", "Count"],
    ["Applied", analytics.conversionFunnel.applied],
    ["Reviewed", analytics.conversionFunnel.reviewed],
    ["Shortlisted", analytics.conversionFunnel.shortlisted],
    ["Interviewed", analytics.conversionFunnel.interviewed],
    ["Hired", analytics.conversionFunnel.hired],
  ];

  const funnelSheet = XLSX.utils.aoa_to_sheet(funnelData);
  XLSX.utils.book_append_sheet(workbook, funnelSheet, "Conversion Funnel");

  // Top Performing Jobs Sheet
  const jobsData = [
    ["Top Performing Jobs"],
    [""],
    ["Job Title", "Location", "Applications", "Average Score"],
    ...analytics.topPerformingJobs.map((job: any) => [
      job.title,
      job.location || "Remote",
      job.applicationCount,
      job.averageScore.toFixed(2),
    ]),
  ];

  const jobsSheet = XLSX.utils.aoa_to_sheet(jobsData);
  XLSX.utils.book_append_sheet(workbook, jobsSheet, "Top Jobs");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

function generatePDFContent(analytics: any): string {
  // This is a placeholder - in a real app, you'd use a PDF library
  return `HR Analytics Report
===================

Candidates:
- Total: ${analytics.candidates.total}
- This Month: ${analytics.candidates.thisMonth}
- With Resumes: ${analytics.candidates.withResumes}

Jobs:
- Total: ${analytics.jobs.total}
- Active: ${analytics.jobs.active}

Applications:
- Total: ${analytics.applications.total}
- Pending: ${analytics.applications.pending}
- Reviewed: ${analytics.applications.reviewed}
- Shortlisted: ${analytics.applications.shortlisted}
- Rejected: ${analytics.applications.rejected}

Time to Hire:
- Average: ${analytics.timeToHire.average} days
- Median: ${analytics.timeToHire.median} days

Department Statistics:
${analytics.departmentStats
  .map(
    (dept: any) =>
      `- ${dept.department}: ${dept.applications} applications, ${dept.hired} hired, ${dept.averageTimeToHire} avg days`
  )
  .join("\n")}
`;
}

function generateCSVContent(analytics: any): string {
  // Generate CSV content for Excel
  const csvLines = [
    "HR Analytics Report",
    "",
    "Metric,Value",
    `Total Candidates,${analytics.candidates.total}`,
    `Candidates This Month,${analytics.candidates.thisMonth}`,
    `Candidates with Resumes,${analytics.candidates.withResumes}`,
    `Total Jobs,${analytics.jobs.total}`,
    `Active Jobs,${analytics.jobs.active}`,
    `Total Applications,${analytics.applications.total}`,
    `Pending Applications,${analytics.applications.pending}`,
    `Reviewed Applications,${analytics.applications.reviewed}`,
    `Shortlisted Applications,${analytics.applications.shortlisted}`,
    `Rejected Applications,${analytics.applications.rejected}`,
    `Average Time to Hire,${analytics.timeToHire.average} days`,
    `Median Time to Hire,${analytics.timeToHire.median} days`,
    "",
    "Department Statistics",
    "Department,Open Positions,Applications,Hired,Avg Time to Hire",
    ...analytics.departmentStats.map(
      (dept: any) =>
        `${dept.department},${dept.openPositions},${dept.applications},${dept.hired},${dept.averageTimeToHire}`
    ),
    "",
    "Source Tracking",
    "Source,Count,Percentage,Conversion Rate",
    ...analytics.sourceTracking.map(
      (source: any) =>
        `${source.source},${source.count},${source.percentage}%,${source.conversionRate}%`
    ),
  ];

  return csvLines.join("\n");
}
