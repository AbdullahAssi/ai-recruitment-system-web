import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const jobId = searchParams.get("jobId");
    const resumeId = searchParams.get("resumeId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};
    if (applicationId) where.applicationId = applicationId;
    if (jobId) where.jobId = jobId;
    if (resumeId) where.resumeId = resumeId;

    // Fetch scores using raw query for better compatibility
    const scoresQuery = `
      SELECT 
        cs.*,
        r.name as candidate_name,
        r.filename,
        r.email as candidate_email,
        r.phone,
        r.skills_json,
        r.experience_json,
        j.title as job_title,
        j.description as job_description,
        j.requirements as job_requirements,
        j.location as job_location,
        j.company,
        a.id as app_id,
        a."appliedAt"
      FROM cv_scores cs
      LEFT JOIN resumes r ON cs."resumeId" = r.id
      LEFT JOIN jobs j ON cs."jobId" = j.id
      LEFT JOIN applications a ON cs."applicationId" = a.id
      WHERE 1=1
      ${applicationId ? `AND cs."applicationId" = '${applicationId}'` : ""}
      ${jobId ? `AND cs."jobId" = '${jobId}'` : ""}
      ${resumeId ? `AND cs."resumeId" = '${resumeId}'` : ""}
      ORDER BY cs."scoredAt" DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const scores = await prisma.$queryRawUnsafe(scoresQuery);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM cv_scores cs
      WHERE 1=1
      ${applicationId ? `AND cs."applicationId" = '${applicationId}'` : ""}
      ${jobId ? `AND cs."jobId" = '${jobId}'` : ""}
      ${resumeId ? `AND cs."resumeId" = '${resumeId}'` : ""}
    `;

    const countResult = (await prisma.$queryRawUnsafe(countQuery)) as any[];
    const totalCount = parseInt(countResult[0].total);

    // Format the response and remove duplicates
    const scoreMap = new Map();
    (scores as any[]).forEach((score) => {
      const key = `${score.resumeId}-${score.jobId}-${
        score.applicationId || "no-app"
      }`;

      // Keep the most recent score if duplicates exist
      if (
        !scoreMap.has(key) ||
        new Date(score.scoredAt) > new Date(scoreMap.get(key).scoredAt)
      ) {
        scoreMap.set(key, score);
      }
    });

    const uniqueScores = Array.from(scoreMap.values());

    const formattedScores = uniqueScores.map((score) => {
      let explanation = {};
      let skillsMatch = {};
      let requirements = {};

      try {
        explanation =
          typeof score.explanation === "string"
            ? JSON.parse(score.explanation)
            : score.explanation || {};
      } catch (e) {
        explanation = { error: "Failed to parse explanation" };
      }

      try {
        skillsMatch = score.skillsMatch || {};
      } catch (e) {
        skillsMatch = {};
      }

      try {
        requirements = score.requirements || {};
      } catch (e) {
        requirements = {};
      }

      return {
        id: score.id,
        score: score.score,
        scoredAt: score.scoredAt,
        explanation,
        skillsMatch,
        requirements,
        candidate: score.candidate_name
          ? {
              name: score.candidate_name,
              filename: score.filename,
              email: score.candidate_email,
              phone: score.phone,
              skills: score.skills_json ? JSON.parse(score.skills_json) : [],
              experience: score.experience_json
                ? JSON.parse(score.experience_json)
                : [],
            }
          : null,
        job: score.job_title
          ? {
              title: score.job_title,
              description: score.job_description,
              requirements: score.job_requirements,
              location: score.job_location,
              company: score.company,
            }
          : null,
        application: score.app_id
          ? {
              id: score.app_id,
              appliedAt: score.appliedAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedScores,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching CV scores:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch CV scores",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
