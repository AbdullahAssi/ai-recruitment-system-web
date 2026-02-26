import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  saveAvatar,
  MAX_UPLOAD_BYTES,
  ALLOWED_MIME,
  AVATAR_SIZE,
} from "@/lib/imageUpload";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Auth guard
  const session = await auth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 },
      );
    }

    // Validate size (before processing)
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await saveAvatar(buffer, session.user.id);

    // Persist the URL in the users table
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: result.publicUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: result.publicUrl,
      // Inform the client of the canonical display dimensions
      dimensions: {
        stored: `${AVATAR_SIZE}×${AVATAR_SIZE}px`,
        recommended_display: "96×96px (or 128×128px for HD screens)",
        format: "WebP",
        sizeBytes: result.sizeBytes,
      },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { deleteImage } = await import("@/lib/imageUpload");
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true },
    });

    if (user?.avatarUrl) {
      await deleteImage(user.avatarUrl);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 },
    );
  }
}
