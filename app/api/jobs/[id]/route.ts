import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

/** Helper: verify the caller is HR/ADMIN and owns this job. */
async function authorizeJobMutation(
  request: NextRequest,
  jobId: string,
): Promise<
  { authorized: true; job: any } | { authorized: false; response: NextResponse }
> {
  const session = await auth(request);
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (session.user.role !== "HR" && session.user.role !== "ADMIN") {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Job not found" }, { status: 404 }),
    };
  }

  // HR users can only modify jobs belonging to their own company
  if (
    session.user.role === "HR" &&
    job.companyId !== session.user.hrProfile?.companyId
  ) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { authorized: true, job };
}

// GET specific job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const jobId = params.id;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        companyInfo: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
            location: true,
            size: true,
            website: true,
            description: true,
            foundedYear: true,
            isVerified: true,
          },
        },
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                experience: true,
              },
            },
          },
          orderBy: { appliedAt: "desc" },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

// PUT update job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const jobId = params.id;

    const authResult = await authorizeJobMutation(request, jobId);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const { title, description, location, requirements } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: title, description" },
        { status: 400 },
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        description,
        location: location || "",
        requirements: requirements || "",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: "Job updated successfully",
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 },
    );
  }
}

// PATCH update job status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const jobId = params.id;

    const authResult = await authorizeJobMutation(request, jobId);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean value" },
        { status: 400 },
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { isActive, updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: `Job ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { error: "Failed to update job status" },
      { status: 500 },
    );
  }
}

// DELETE job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const jobId = params.id;

    const authResult = await authorizeJobMutation(request, jobId);
    if (!authResult.authorized) return authResult.response;

    await prisma.job.delete({ where: { id: jobId } });

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 },
    );
  }
}
