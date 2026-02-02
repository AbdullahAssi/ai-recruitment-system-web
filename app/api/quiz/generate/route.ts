import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { quizService } from "@/lib/fastapi";

export const dynamic = "force-dynamic";

/**
 * Generate quiz for an application
 * POST /api/quiz/generate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, numQuestions = 5, difficulty = "medium" } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    // Fetch application with job and candidate details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        candidate: true,
        resume: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Check if quiz already exists for this application
    const existingQuizAttempt = await prisma.quizAttempt.findUnique({
      where: { applicationId },
    });

    if (existingQuizAttempt) {
      return NextResponse.json(
        { error: "Quiz already generated for this application" },
        { status: 400 },
      );
    }

    // Get or create quiz for the job
    let quiz = await prisma.quiz.findFirst({
      where: { jobId: application.jobId, isActive: true },
    });

    if (!quiz) {
      // Create a new quiz for the job
      quiz = await prisma.quiz.create({
        data: {
          jobId: application.jobId,
          title: `Assessment for ${application.job.title}`,
          description: `Skills and knowledge assessment`,
          duration: 30, // 30 minutes default
          passingScore: 70.0,
          isActive: true,
        },
      });
    }

    // Check if quiz attempt already exists for this application
    const existingAttempt = await prisma.quizAttempt.findUnique({
      where: { applicationId: application.id },
      include: {
        quiz: true,
      },
    });

    if (existingAttempt) {
      // Parse questions from JSON
      const questions = existingAttempt.questions as any;
      const questionsArray = Array.isArray(questions) ? questions : [];

      // Check if quiz has valid questions
      if (questionsArray.length === 0) {
        // Quiz attempt exists but has no questions - delete it and regenerate
        await prisma.quizAttempt.delete({
          where: { id: existingAttempt.id },
        });
        console.log("Deleted empty quiz attempt, will regenerate");
        // Continue to generate new quiz below
      } else {
        // Return existing quiz attempt with all required fields
        return NextResponse.json({
          success: true,
          quizAttemptId: existingAttempt.id,
          quiz: {
            id: existingAttempt.quiz.id,
            title: existingAttempt.quiz.title,
            description: existingAttempt.quiz.description,
            duration: existingAttempt.quiz.duration,
            passingScore: existingAttempt.quiz.passingScore,
          },
          questions: questionsArray,
          totalQuestions: existingAttempt.totalQuestions,
          // Include existing attempt data if already started
          existingAnswers: existingAttempt.answers || {},
          isCompleted: !!existingAttempt.completedAt,
          message: "Quiz already generated for this application",
        });
      }
    }

    // Prepare resume data for quiz generation
    const resumeData = application.resume
      ? {
          name: application.resume.name || application.candidate.name,
          skills: application.resume.skills_json
            ? JSON.parse(application.resume.skills_json)
            : [],
          experience_years: application.resume.experience_years || 0,
          education_level: application.resume.education_level || "",
          summary: application.resume.summary || "",
        }
      : undefined;

    // Generate quiz using FastAPI
    const quizResponse = await quizService.generate({
      job_description: application.job.description,
      resume_data: resumeData,
      num_questions: numQuestions,
      difficulty,
      question_types: ["technical", "behavioral"],
    });

    // Create quiz attempt record - handle race condition if duplicate request
    let quizAttempt;
    try {
      quizAttempt = await prisma.quizAttempt.create({
        data: {
          quizId: quiz.id,
          candidateId: application.candidateId,
          applicationId: application.id,
          questions: quizResponse.questions as any,
          answers: {},
          totalQuestions: quizResponse.total_questions,
          correctAnswers: 0,
          score: 0,
          passed: false,
        },
      });
    } catch (error: any) {
      // If unique constraint error, fetch the existing attempt instead
      if (error.code === "P2002") {
        console.log(
          "Quiz attempt already created by concurrent request, fetching existing",
        );
        quizAttempt = await prisma.quizAttempt.findUnique({
          where: { applicationId: application.id },
        });

        if (!quizAttempt) {
          throw new Error("Failed to create or fetch quiz attempt");
        }
      } else {
        throw error;
      }
    }

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "QUIZ_PENDING" },
    });

    return NextResponse.json({
      success: true,
      quizAttemptId: quizAttempt.id,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        passingScore: quiz.passingScore,
      },
      questions: quizResponse.questions,
      totalQuestions: quizResponse.total_questions,
      difficulty: quizResponse.difficulty,
    });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to generate quiz",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
