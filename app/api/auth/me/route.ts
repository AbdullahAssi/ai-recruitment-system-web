import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get full user details
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        candidate: {
          select: {
            id: true,
            experience: true,
            location: true,
            bio: true,
            linkedinUrl: true,
            githubUrl: true,
            portfolioUrl: true,
          },
        },
        hrProfile: {
          select: {
            id: true,
            companyId: true,
            department: true,
            position: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Failed to get user details" },
      { status: 500 },
    );
  }
}
