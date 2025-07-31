import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { candidateId } = body;
    const jobId = params.id;

    if (!candidateId) {
      return NextResponse.json(
        { error: "Missing candidateId" },
        { status: 400 }
      );
    }

    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        resumes: {
          orderBy: { uploadDate: "desc" },
          take: 1,
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    if (!candidate.resumes || candidate.resumes.length === 0) {
      return NextResponse.json(
        { error: "Candidate has no uploaded resume" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Application already submitted for this job" },
        { status: 400 }
      );
    }

    // Create application (matching will be done by LLM later)
    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId,
        status: "PENDING",
        score: 0, // Will be calculated by LLM later
      },
    });

    // Trigger AI scoring asynchronously with the latest resume
    const latestResume = candidate.resumes[0];
    try {
      // Call AI scoring API with application ID for enhanced scoring
      const aiScoreUrl = `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/ai/score`;

      fetch(aiScoreUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: latestResume.id,
          jobId: jobId,
          applicationId: application.id, // Pass application ID for enhanced scoring
        }),
      }).catch((error) => {
        console.error("AI scoring failed:", error);
        // Continue with normal flow even if AI scoring fails
      });

      console.log(
        `🤖 Enhanced AI scoring initiated for application ${application.id}`
      );
    } catch (aiError) {
      console.error("Failed to initiate AI scoring:", aiError);
      // Continue with normal flow
    }

    // Fetch application with details for response
    const applicationWithDetails = await prisma.application.findUnique({
      where: { id: application.id },
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
            description: true,
            location: true,
          },
        },
      },
    });

    if (!applicationWithDetails) {
      return NextResponse.json(
        { error: "Failed to retrieve application details" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        id: applicationWithDetails.id,
        score: applicationWithDetails.score || 0,
        status: applicationWithDetails.status,
        appliedAt: applicationWithDetails.appliedAt.toISOString(),
      },
      matchDetails: {
        overallScore: applicationWithDetails.score || 0,
        textSimilarity: 0, 
        skillMatchPercentage: 0, 
        matchedSkills: [], 
        missingSkills: [], 
      },
      message: "Application submitted successfully! AI scoring in progress...",
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
