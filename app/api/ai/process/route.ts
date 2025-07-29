import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spawn } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { resumeId, jobDescription } = await request.json();

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
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

    // Run AI processing using Python script
    const aiModelsPath = path.join(process.cwd(), "ai_models");
    const scriptPath = path.join(aiModelsPath, "ai_service.py");

    const pythonArgs = [
      scriptPath,
      "--file",
      resume.filePath,
      "--resume-id",
      resumeId,
    ];

    // Add job description if provided
    if (jobDescription) {
      pythonArgs.push("--job", jobDescription);
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
        console.log(`Python process closed with code: ${code}`);
        console.log(`Python stdout: ${stdout}`);
        console.log(`Python stderr: ${stderr}`);

        if (code !== 0) {
          console.error("Python script error:", stderr);
          resolve(
            NextResponse.json(
              {
                error: "AI processing failed",
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
            // Fallback: try to parse the entire stdout as JSON
            result = JSON.parse(stdout);
          }

          // The Python script already updated the resume with extracted data
          // We don't need to override it here
          console.log(
            "Resume processing completed, data already updated by Python script"
          );

          resolve(
            NextResponse.json({
              success: true,
              result,
              message: "AI processing completed",
            })
          );
        } catch (parseError) {
          console.error("Error parsing Python result:", parseError);
          console.log("Raw stdout:", stdout);

          resolve(
            NextResponse.json(
              {
                error: "Failed to parse AI processing result",
                details:
                  parseError instanceof Error
                    ? parseError.message
                    : String(parseError),
                stdout: stdout.slice(0, 1000), // Limit output for debugging
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
              error: "Failed to start AI processing",
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
    const resumeId = searchParams.get("resumeId");

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }

    // Get resume with scores
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        candidate: true,
        cvScores: {
          orderBy: { scored_at: "desc" },
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
      { status: 500 }
    );
  }
}
