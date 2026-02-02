import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spawn } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { resumeId, jobId, applicationId } = await request.json();

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
        include: { jobSkills: true },
      }),
    ]);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Run enhanced AI scoring using Python script
    const aiModelsPath = path.join(process.cwd(), "ai_models");
    const scriptPath = path.join(aiModelsPath, "enhanced_scorer.py");

    const pythonArgs = [scriptPath, "--resume-id", resumeId, "--job-id", jobId];

    // If we have an application ID, use application-based scoring
    if (applicationId) {
      pythonArgs.splice(1, 0, "--application-id", applicationId);
      pythonArgs.splice(3, 4); // Remove resume-id and job-id args
    }

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

          // If scoring was successful, update application record
          if (result.success && result.score !== undefined) {
            const score = result.score;

            // Find or create application if not provided
            let finalApplicationId = applicationId;
            if (!applicationId) {
              const application = await prisma.application.findUnique({
                where: {
                  candidateId_jobId: {
                    candidateId: resume.candidateId,
                    jobId: jobId,
                  },
                },
              });
              finalApplicationId = application?.id;
            }

            // Update application score if we have one
            if (finalApplicationId) {
              await prisma.application.update({
                where: { id: finalApplicationId },
                data: {
                  score: score,
                  status: score >= 70 ? "REVIEWED" : "PENDING",
                },
              });
            }
          }

          resolve(
            NextResponse.json({
              success: true,
              result,
              job: {
                id: job.id,
                title: job.title,
                location: job.location,
                company: job.company,
              },
              message: "Enhanced resume scoring completed",
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
    const applicationId = searchParams.get("applicationId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!jobId && !applicationId) {
      return NextResponse.json(
        { error: "Job ID or Application ID is required" },
        { status: 400 }
      );
    }

    // Get scores with enhanced data
    const whereClause: any = {};
    if (jobId) whereClause.jobId = jobId;
    if (applicationId) whereClause.applicationId = applicationId;

    const cvScores = await prisma.cvScore.findMany({
      where: whereClause,
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
      message: "Enhanced resume scores retrieved successfully",
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
