import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Get quiz attempt details
 * GET /api/quiz/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const quizAttempt = await prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: true,
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
        },
      },
    });

    if (!quizAttempt) {
      return NextResponse.json(
        { error: "Quiz attempt not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      quizAttempt: {
        id: quizAttempt.id,
        quiz: {
          id: quizAttempt.quiz.id,
          title: quizAttempt.quiz.title,
          description: quizAttempt.quiz.description,
          duration: quizAttempt.quiz.duration,
          passingScore: quizAttempt.quiz.passingScore,
        },
        candidate: quizAttempt.candidate,
        application: quizAttempt.application,
        questions: quizAttempt.questions,
        answers: quizAttempt.answers,
        score: quizAttempt.score,
        passed: quizAttempt.passed,
        totalQuestions: quizAttempt.totalQuestions,
        correctAnswers: quizAttempt.correctAnswers,
        startedAt: quizAttempt.startedAt,
        completedAt: quizAttempt.completedAt,
        timeSpent: quizAttempt.timeSpent,
      },
    });
  } catch (error: any) {
    console.error("Error fetching quiz attempt:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch quiz attempt",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * Update quiz attempt (for saving progress)
 * PATCH /api/quiz/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { answers } = body;

    const quizAttempt = await prisma.quizAttempt.findUnique({
      where: { id },
    });

    if (!quizAttempt) {
      return NextResponse.json(
        { error: "Quiz attempt not found" },
        { status: 404 },
      );
    }

    if (quizAttempt.completedAt) {
      return NextResponse.json(
        { error: "Cannot update completed quiz" },
        { status: 400 },
      );
    }

    // Update answers (save progress)
    const updatedQuizAttempt = await prisma.quizAttempt.update({
      where: { id },
      data: { answers },
    });

    return NextResponse.json({
      success: true,
      message: "Progress saved",
      quizAttemptId: updatedQuizAttempt.id,
    });
  } catch (error: any) {
    console.error("Error updating quiz attempt:", error);
    return NextResponse.json(
      {
        error: "Failed to update quiz attempt",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
