import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cvScores = await prisma.cvScore.findMany({
      include: {
        resume: {
          include: {
            candidate: true,
          },
        },
        job: true,
        application: true,
      },
      orderBy: {
        scoredAt: "desc",
      },
    });

    const analyses = cvScores.map((cv) => ({
      id: cv.id,
      score: cv.score || 0,
      summary: (cv.skillsMatch as any)?.summary || "No summary available",
      candidateName: cv.resume.candidate.name,
      candidateEmail: cv.resume.candidate.email,
      jobTitle: cv.job?.title || "N/A",
      aiAnalysis: {
        strengths: (cv.skillsMatch as any)?.aiAnalysis?.strengths || [],
        weaknesses: (cv.skillsMatch as any)?.aiAnalysis?.weaknesses || [],
        key_matches: (cv.skillsMatch as any)?.aiAnalysis?.key_matches || [],
        missing_requirements:
          (cv.skillsMatch as any)?.aiAnalysis?.missing_requirements || [],
      },
      scores: {
        overall: (cv.skillsMatch as any)?.scores?.overall || cv.score || 0,
        skills: (cv.skillsMatch as any)?.scores?.skills || 0,
        experience: (cv.skillsMatch as any)?.scores?.experience || 0,
        education: (cv.skillsMatch as any)?.scores?.education || 0,
        fit: (cv.skillsMatch as any)?.scores?.fit || 0,
      },
      recommendation: (cv.skillsMatch as any)?.recommendation || "REVIEW",
      totalResumeSkills: (cv.skillsMatch as any)?.totalResumeSkills || 0,
      overallSkillScore: (cv.skillsMatch as any)?.overallSkillScore || 0,
      scoredAt: cv.scoredAt,
      explanation: cv.explanation,
    }));

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Error fetching CV analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch CV analyses" },
      { status: 500 }
    );
  }
}
