import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spawn } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { resumeId, jobId } = await request.json();

    if (!resumeId || !jobId) {
      return NextResponse.json(
        { error: "Resume ID and Job ID are required" },
        { status: 400 }
      );
    }

    // Get resume and job details
    const [resume, job] = await Promise.all([
      prisma.resume.findUnique({
        where: { id: resumeId },
        include: { candidate: true },
      }),
      prisma.job.findUnique({
        where: { id: jobId },
      }),
    ]);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Prepare job description for scoring
    const jobDescription = `
Job Title: ${job.title}
Location: ${job.location || "Not specified"}
Description: ${job.description}
Requirements: ${job.requirements || "Not specified"}
    `.trim();

    // Run AI scoring using Python script
    const aiModelsPath = path.join(process.cwd(), "ai_models");
    const scriptPath = path.join(aiModelsPath, "ai_service.py");

    const pythonArgs = [
      scriptPath,
      "--file",
      resume.filePath,
      "--resume-id",
      resumeId,
      "--job",
      jobDescription,
    ];

    return new Promise((resolve) => {
      const pythonProcess = spawn("python", pythonArgs, {
        cwd: aiModelsPath,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      pythonProcess.on("close", async (code) => {
        if (code !== 0) {
          console.error("Python script error:", stderr);
          resolve(
            NextResponse.json(
              {
                error: "AI scoring failed",
                details: stderr,
                code,
              },
              { status: 500 }
            )
          );
          return;
        }

        try {
          // Parse the result from Python script
          const lines = stdout.split("\n");
          const resultLine = lines.find((line) =>
            line.includes("FINAL RESULT:")
          );

          let result;
          if (resultLine) {
            const resultIndex = lines.indexOf(resultLine);
            const jsonLines = lines.slice(resultIndex + 1).join("\n");
            result = JSON.parse(jsonLines);
          } else {
            result = JSON.parse(stdout);
          }

          // If scoring was successful, also create an application record
          if (result.success && result.scoring_result?.success) {
            const score = result.scoring_result.result.score;

            // Create or update application
            await prisma.application.upsert({
              where: {
                candidateId_jobId: {
                  candidateId: resume.candidateId,
                  jobId: jobId,
                },
              },
              update: {
                score: score,
                status: score >= 70 ? "REVIEWED" : "PENDING",
              },
              create: {
                candidateId: resume.candidateId,
                jobId: jobId,
                score: score,
                status: score >= 70 ? "REVIEWED" : "PENDING",
              },
            });
          }

          resolve(
            NextResponse.json({
              success: true,
              result,
              job: {
                id: job.id,
                title: job.title,
                location: job.location,
              },
              message: "Resume scoring completed",
            })
          );
        } catch (parseError) {
          console.error("Error parsing Python result:", parseError);

          resolve(
            NextResponse.json(
              {
                error: "Failed to parse AI scoring result",
                details:
                  parseError instanceof Error
                    ? parseError.message
                    : String(parseError),
                stdout: stdout.slice(0, 1000),
              },
              { status: 500 }
            )
          );
        }
      });

      pythonProcess.on("error", (error) => {
        console.error("Failed to start Python process:", error);
        resolve(
          NextResponse.json(
            {
              error: "Failed to start AI scoring",
              details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Get top scored resumes for this job
    const cvScores = await prisma.cvScore.findMany({
      where: {
        resume: {
          candidate: {
            applications: {
              some: {
                jobId: jobId,
              },
            },
          },
        },
      },
      include: {
        resume: {
          include: {
            candidate: true,
          },
        },
      },
      orderBy: {
        score: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      scores: cvScores,
      message: "Resume scores retrieved successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
