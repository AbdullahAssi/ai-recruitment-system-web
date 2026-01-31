import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    const jobId = params.id;

    const quiz = await prisma.quiz.findFirst({
      where: {
        jobId: jobId,
        isActive: true,
      },
      include: {
        questions: {
          select: {
            id: true, // Only select IDs to confirm existence, don't leak answers
            questionType: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ quiz: null });
    }

    // Check if candidate has already attempted
    let attempt = null;
    if (user?.userId) {
      // Find candidate profile
      const candidate = await prisma.candidate.findFirst({
        where: { userId: user.userId },
      });

      if (candidate) {
        attempt = await prisma.quizAttempt.findFirst({
          where: {
            quizId: quiz.id,
            candidateId: candidate.id,
          },
        });
      }
    }

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        duration: quiz.duration,
      },
      hasAttempted: !!attempt,
    });
  } catch (error) {
    console.error("Error fetching job quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz status" },
      { status: 500 },
    );
  }
}
