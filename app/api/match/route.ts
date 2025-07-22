import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const jobId = searchParams.get("jobId");

    if (!candidateId || !jobId) {
      return NextResponse.json(
        { error: "Missing candidateId or jobId parameters" },
        { status: 400 }
      );
    }

    // Fetch candidate with resume
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
        { error: "No resume found for candidate" },
        { status: 400 }
      );
    }

    // Fetch job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Return candidate and job data for LLM processing
    return NextResponse.json({
      success: true,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        experience: candidate.experience,
        resume: {
          fileName: candidate.resumes[0].fileName,
          filePath: candidate.resumes[0].filePath,
          uploadDate: candidate.resumes[0].uploadDate,
        },
      },
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        requirements: job.requirements,
        postedDate: job.postedDate,
      },
      message: "Data ready for LLM matching",
    });
  } catch (error) {
    console.error("Error fetching match data:", error);
    return NextResponse.json(
      { error: "Failed to fetch match data" },
      { status: 500 }
    );
  }
}
