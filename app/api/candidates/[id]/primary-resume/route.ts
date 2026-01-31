import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const candidateId = params.id;

    // Update candidate to remove primary resume reference
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        primaryResumeId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Primary resume removed",
    });
  } catch (error) {
    console.error("Error removing primary resume:", error);
    return NextResponse.json(
      { error: "Failed to remove primary resume" },
      { status: 500 },
    );
  }
}
