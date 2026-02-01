import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { quizService } from "@/lib/fastapi";

export const dynamic = "force-dynamic";

/**
 * Submit quiz answers
 * POST /api/quiz/submit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizAttemptId, answers, timeSpent } = body;

    if (!quizAttemptId || !answers) {
      return NextResponse.json(
        { error: "Quiz attempt ID and answers are required" },
        { status: 400 },
      );
    }

    // Fetch quiz attempt
    const quizAttempt = await prisma.quizAttempt.findUnique({
      where: { id: quizAttemptId },
      include: {
        quiz: true,
        application: true,
      },
    });

    if (!quizAttempt) {
      return NextResponse.json(
        { error: "Quiz attempt not found" },
        { status: 404 },
      );
    }

    if (quizAttempt.completedAt) {
      return NextResponse.json(
        { error: "Quiz already submitted" },
        { status: 400 },
      );
    }

    // Get questions from quiz attempt
    const questions = quizAttempt.questions as any[];

    // Submit to FastAPI for grading
    const submissionResult = await quizService.submit({
      questions,
      answers,
    });

    // Calculate pass/fail
    const passed =
      submissionResult.score_percentage >= quizAttempt.quiz.passingScore;

    // Update quiz attempt with results
    const updatedQuizAttempt = await prisma.quizAttempt.update({
      where: { id: quizAttemptId },
      data: {
        answers,
        score: submissionResult.score_percentage,
        correctAnswers: submissionResult.correct_answers,
        passed,
        completedAt: new Date(),
        timeSpent: timeSpent || 0,
      },
    });

    // Update application status and quiz completion
    if (quizAttempt.applicationId) {
      await prisma.application.update({
        where: { id: quizAttempt.applicationId },
        data: {
          status: "QUIZ_COMPLETED",
          quizCompleted: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      quizAttemptId: updatedQuizAttempt.id,
      results: {
        totalQuestions: submissionResult.total_questions,
        correctAnswers: submissionResult.correct_answers,
        score: submissionResult.score_percentage,
        passed,
        passingScore: quizAttempt.quiz.passingScore,
        feedback: submissionResult.feedback,
        details: submissionResult.results,
      },
    });
  } catch (error: any) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to submit quiz",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
