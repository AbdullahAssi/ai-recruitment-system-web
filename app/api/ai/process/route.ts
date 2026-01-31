import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { resumeId, jobDescription } = await request.json();

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 },
      );
    }

    // Get resume details from database
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { candidate: true },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Read file from disk
    const fileContent = await fs.readFile(resume.filePath);
    const fileName = path.basename(resume.filePath);
    const fileType = fileName.endsWith(".pdf")
      ? "application/pdf"
      : "application/octet-stream";

    // Create FormData for FastAPI
    // Note: We need to use 'form-data' library or native fetch with FormData in Node 18+
    // Since this is Next.js App Router (Node env), we can use the global FormData (Node 18+)
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileContent)], { type: fileType });
    formData.append("file", blob, fileName);
    formData.append("resume_id", resume.id);

    console.log(`Sending file to FastAPI: ${fileName} (ID: ${resume.id})`);

    // Call FastAPI Process Endpoint
    const fastApiUrl =
      process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";
    const response = await fetch(`${fastApiUrl}/resumes/process`, {
      method: "POST",
      body: formData,
      // Note: fetch with FormData automatically sets Content-Type to multipart/form-data with boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI Processing Failed:", errorText);
      throw new Error(`FastAPI Error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("FastAPI Processing Success:", result);

    return NextResponse.json({
      success: true,
      result,
      message: "AI processing completed successfully via FastAPI",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId");

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 },
      );
    }

    // Get resume with scores
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        candidate: true,
        cvScores: {
          orderBy: { scoredAt: "desc" },
        },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      resume,
      message: "Resume data retrieved successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
