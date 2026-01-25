import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const candidateId = params.id;

    // Get candidate with full details
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        resumes: {
          orderBy: {
            uploadDate: "desc",
          },
          select: {
            id: true,
            fileName: true,
            filePath: true,
            uploadDate: true,
            extractedText: true,
            name: true,
            email: true,
            phone: true,
            linkedin: true,
            github: true,
            skills_json: true,
            experience_json: true,
            projects_json: true,
            certifications_json: true,
            education_level: true,
            experience_years: true,
            summary: true,
          },
        },
        applications: {
          orderBy: {
            appliedAt: "desc",
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                description: true,
                location: true,
                requirements: true,
                postedDate: true,
              },
            },
          },
        },
        candidateSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    // Calculate some statistics
    const stats = {
      totalApplications: candidate.applications.length,
      pendingApplications: candidate.applications.filter(
        (app: any) => app.status === "PENDING",
      ).length,
      reviewedApplications: candidate.applications.filter(
        (app: any) => app.status === "REVIEWED",
      ).length,
      shortlistedApplications: candidate.applications.filter(
        (app: any) => app.status === "SHORTLISTED",
      ).length,
      rejectedApplications: candidate.applications.filter(
        (app: any) => app.status === "REJECTED",
      ).length,
      averageScore:
        candidate.applications.length > 0
          ? candidate.applications.reduce(
              (sum: number, app: any) => sum + (app.score || 0),
              0,
            ) / candidate.applications.length
          : 0,
      latestApplication: candidate.applications[0] || null,
    };

    return NextResponse.json({
      success: true,
      candidate,
      stats,
    });
  } catch (error) {
    console.error("Error fetching candidate details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch candidate details",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const candidateId = params.id;
    const body = await request.json();
    const {
      name,
      email,
      phone,
      experience,
      location,
      bio,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
    } = body;

    // Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    // If email is being changed, check for conflicts
    if (email && email !== existingCandidate.email) {
      const emailConflict = await prisma.candidate.findFirst({
        where: {
          email,
          id: {
            not: candidateId,
          },
        },
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: "Email already in use by another candidate" },
          { status: 409 },
        );
      }
    }

    // Update candidate
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(location && { location }),
        ...(bio && { bio }),
        ...(linkedinUrl && { linkedinUrl }),
        ...(githubUrl && { githubUrl }),
        ...(portfolioUrl && { portfolioUrl }),
        ...(experience !== undefined && { experience }),
      },
      include: {
        resumes: {
          orderBy: {
            uploadDate: "desc",
          },
        },
        applications: {
          orderBy: {
            appliedAt: "desc",
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                location: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Error updating candidate:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update candidate",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const candidateId = params.id;

    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    // Delete candidate (cascade will handle related records)
    await prisma.candidate.delete({
      where: { id: candidateId },
    });

    return NextResponse.json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete candidate",
      },
      { status: 500 },
    );
  }
}
