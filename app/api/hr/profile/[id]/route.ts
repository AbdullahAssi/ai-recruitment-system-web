import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;

    const hrProfile = await prisma.hRProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        company: {
          include: {
            _count: {
              select: {
                jobs: true,
                hrProfiles: true,
              },
            },
          },
        },
      },
    });

    if (!hrProfile) {
      return NextResponse.json(
        { success: false, error: "HR profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: hrProfile,
    });
  } catch (error: any) {
    console.error("Error fetching HR profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch HR profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;
    const body = await request.json();

    const { companyId, ...otherFields } = body;

    // Verify HR profile exists
    const existingProfile = await prisma.hRProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: "HR profile not found" },
        { status: 404 },
      );
    }

    // If companyId is provided, verify company exists
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return NextResponse.json(
          { success: false, error: "Company not found" },
          { status: 404 },
        );
      }
    }

    // Update HR profile
    const updatedProfile = await prisma.hRProfile.update({
      where: { userId },
      data: {
        ...(companyId !== undefined && { companyId }),
        ...otherFields,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        company: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "HR profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("Error updating HR profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update HR profile" },
      { status: 500 },
    );
  }
}
