import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/emailService";
import { forgotPasswordEmailHtml } from "@/lib/emailTemplates";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";
import crypto from "crypto";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Max 3 requests per IP per 15 minutes
  if (!checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { email } = forgotSchema.parse(body);

    // Always return success to avoid leaking whether an account exists
    const genericResponse = NextResponse.json({
      success: true,
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return genericResponse;

    // Generate a secure random token valid for 1 hour
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your password – QMindAI",
      html: forgotPasswordEmailHtml({ name: user.name, resetLink }),
    });

    return genericResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
