import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { saveCompanyLogo, MAX_UPLOAD_BYTES, ALLOWED_MIME, COMPANY_LOGO_SIZE } from "@/lib/imageUpload";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth(request);
  if (!session || session.user.role !== "HR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;
    const companyId = formData.get("companyId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Validate MIME
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 },
      );
    }

    // Validate size
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 },
      );
    }

    // Verify HR belongs to this company
    const hrProfile = await prisma.hRProfile.findUnique({
      where: { userId: session.user.id },
      select: { companyId: true },
    });

    if (hrProfile?.companyId !== companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const buffer = await file.arrayBuffer();
    const result = await saveCompanyLogo(buffer, companyId);

    // Persist URL in companies table
    await prisma.company.update({
      where: { id: companyId },
      data: { logo: result.publicUrl },
    });

    return NextResponse.json({
      success: true,
      logoUrl: result.publicUrl,
      dimensions: {
        stored: `${COMPANY_LOGO_SIZE}×${COMPANY_LOGO_SIZE}px`,
        recommended_display: "64×64px (card) / 128×128px (profile page)",
        format: "WebP",
        sizeBytes: result.sizeBytes,
      },
    });
  } catch (error) {
    console.error("Company logo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload company logo" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth(request);
  if (!session || session.user.role !== "HR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { companyId } = await request.json();

    const hrProfile = await prisma.hRProfile.findUnique({
      where: { userId: session.user.id },
      select: { companyId: true },
    });

    if (hrProfile?.companyId !== companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { deleteImage } = await import("@/lib/imageUpload");
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { logo: true },
    });

    if (company?.logo) {
      await deleteImage(company.logo);
      await prisma.company.update({
        where: { id: companyId },
        data: { logo: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Company logo delete error:", error);
    return NextResponse.json({ error: "Failed to delete logo" }, { status: 500 });
  }
}
