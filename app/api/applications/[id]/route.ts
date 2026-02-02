import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: {
          include: {
            resumes: {
              include: {
                cvScores: {
                  orderBy: { scoredAt: "desc" },
                  take: 1,
                },
              },
              orderBy: { uploadDate: "desc" },
              take: 1,
            },
          },
        },
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Get the latest CV score if available
    const latestResume = application.candidate.resumes[0];
    const latestScore = latestResume?.cvScores[0];

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        score: application.score,
        appliedAt: application.appliedAt,
        candidate: {
          id: application.candidate.id,
          name: application.candidate.name,
          email: application.candidate.email,
          experience: application.candidate.experience,
        },
        job: {
          id: application.job.id,
          title: application.job.title,
          description: application.job.description,
          location: application.job.location,
        },
        aiScore: latestScore
          ? {
              score: latestScore.score,
              explanation: latestScore.explanation,
              scoredAt: latestScore.scoredAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application details" },
      { status: 500 }
    );
  }
}
