import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFormData, validateFileType } from "@/lib/fileUpload";
import { promises as fs } from "fs";
import path from "path";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { fields, files } = await parseFormData(request);

    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const experience = Array.isArray(fields.experience)
      ? parseInt(fields.experience[0])
      : parseInt(fields.experience);
    const candidateId = Array.isArray(fields.candidateId)
      ? fields.candidateId[0]
      : fields.candidateId;
    const isPrimary = Array.isArray(fields.isPrimary)
      ? fields.isPrimary[0] === "true"
      : fields.isPrimary === "true";
    const isJobSpecific = Array.isArray(fields.isJobSpecific)
      ? fields.isJobSpecific[0] === "true"
      : fields.isJobSpecific === "true";
    const jobId = Array.isArray(fields.jobId) ? fields.jobId[0] : fields.jobId;
    const file = Array.isArray(files.resume)
      ? files.resume[0]
      : (files.resume as File);

    if (!name || !email || !file || isNaN(experience)) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, email, experience, resume file",
        },
        { status: 400 },
      );
    }

    if (!validateFileType(file.name || "")) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.",
        },
        { status: 400 },
      );
    }

    // Save file to uploads directory
    const uploadDir = path.join(process.cwd(), "uploads");

    // Ensure uploads directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Create or find candidate
    let candidate = await prisma.candidate.findUnique({
      where: candidateId ? { id: candidateId } : { email },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          name,
          email,
          experience,
        },
      });
    } else {
      // Update existing candidate info
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          name,
          experience,
        },
      });
    }

    // Create resume record - FastAPI will handle text extraction and parsing during scoring
    const resume = await prisma.resume.create({
      data: {
        candidateId: candidate.id,
        filePath: filePath,
        fileName: file.name || "unknown",
        extractedText: "", // FastAPI will extract when needed
      },
    });

    // If this is marked as primary resume, update candidate
    if (isPrimary) {
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          primaryResumeId: resume.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        experience: candidate.experience,
      },
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        uploadDate: resume.uploadDate,
      },
      message: isPrimary
        ? "Primary resume uploaded successfully"
        : "Resume uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 },
    );
  }
}
