import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/emailService";
import { verificationEmailHtml } from "@/lib/emailTemplates";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const resendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Allow max 3 resend attempts per IP per 15 minutes
  if (!checkRateLimit(`resend-verification:${ip}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many resend attempts. Please wait before trying again." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { email } = resendSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({
        success: true,
        message: "If this email is registered, a new code has been sent.",
      });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "This email is already verified. Please login." },
        { status: 400 },
      );
    }

    const verificationCode = generateVerificationCode();
    const verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: verificationCode, verificationTokenExpiry },
    });

    await sendEmail({
      to: email,
      subject: "New Verification Code – QMindAI",
      html: verificationEmailHtml({
        name: user.name,
        code: verificationCode,
        role: user.role as "HR" | "CANDIDATE",
      }),
    });

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 },
    );
  }
}
