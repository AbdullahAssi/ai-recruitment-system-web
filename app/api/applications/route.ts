import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoringService } from "@/lib/fastapi";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const jobId = searchParams.get("jobId");
    const companyId = searchParams.get("companyId"); // Filter by company for HR users

    let whereClause: any = {};

    if (candidateId) {
      whereClause.candidateId = candidateId;
    }

    if (jobId) {
      whereClause.jobId = jobId;
    }

    // Filter applications for jobs from specific company
    if (companyId) {
      whereClause.job = {
        companyId: companyId,
      };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            experience: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            postedDate: true,
          },
        },
        quizAttempt: {
          select: {
            score: true,
            passed: true,
            completedAt: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, candidateId, resumeId } = body;

    if (!jobId || !candidateId) {
      return NextResponse.json(
        { error: "Job ID and Candidate ID are required" },
        { status: 400 },
      );
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        candidateId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 },
      );
    }

    // Determine which resume to use
    let finalResumeId = resumeId;

    // If no resume provided, try to use primary resume
    if (!finalResumeId) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        select: { primaryResumeId: true },
      });
      finalResumeId = candidate?.primaryResumeId;
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId,
        resumeId: finalResumeId,
        status: "PENDING",
        quizRequired: true, // Set to true by default - can be customized per job later
        appliedAt: new Date(),
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // --- AI SCORING INTEGRATION ---
    try {
      // 1. Get the resume being used for this application
      let resume = null;

      if (finalResumeId) {
        resume = await prisma.resume.findUnique({
          where: { id: finalResumeId },
        });
      }

      // 2. Get Job Description
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (resume && job) {
        console.log(
          `Scoring Application: Job=${job?.title}, Resume=${resume.fileName}`,
        );

        // 3. Call FastAPI Scoring Service
        const scoreResult = await scoringService.scoreById(
          resume.id,
          job.description,
          job.id,
          application.id,
        );

        console.log("Score Result:", scoreResult);

        // 4. Update Application with Score
        await prisma.application.update({
          where: { id: application.id },
          data: {
            score: scoreResult.score,
            status: scoreResult.score >= 70 ? "REVIEWED" : "PENDING",
          },
        });
      }
    } catch (aiError) {
      console.error("AI Scoring Failed:", aiError);
    }

    // Always redirect to quiz since quizRequired is true by default
    return NextResponse.json(
      {
        success: true,
        application,
        message: "Application submitted successfully. Redirecting to quiz...",
        redirectTo: `/candidate/quiz/${application.id}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 },
    );
  }
}
