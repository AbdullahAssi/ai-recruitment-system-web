import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Get application with quiz attempt
 * GET /api/applications/[id]/quiz
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        quizAttempt: {
          include: {
            quiz: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        quizCompleted: application.quizCompleted,
        appliedAt: application.appliedAt,
        candidate: application.candidate,
        job: application.job,
        quizAttempt: application.quizAttempt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching application quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch application quiz",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
