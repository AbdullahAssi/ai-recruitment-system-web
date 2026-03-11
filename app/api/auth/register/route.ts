import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/emailService";
import { verificationEmailHtml } from "@/lib/emailTemplates";
import { z } from "zod";

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["CANDIDATE", "HR"]),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Rate limit: max 5 registration attempts per IP per hour.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Generate 6-digit verification code (expires in 15 minutes)
    const verificationCode = generateVerificationCode();
    const verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        phone: validatedData.phone,
        verificationToken: verificationCode,
        verificationTokenExpiry,
        isVerified: false,
      },
    });

    // Create related profile based on role
    if (validatedData.role === "CANDIDATE") {
      await prisma.candidate.create({
        data: {
          userId: user.id,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          experience: 0,
        },
      });
    } else if (validatedData.role === "HR") {
      await prisma.hRProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Send verification email
    await sendEmail({
      to: validatedData.email,
      subject: "Verify your email – QMindAI",
      html: verificationEmailHtml({
        name: validatedData.name,
        code: verificationCode,
        role: validatedData.role,
      }),
    });

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: validatedData.email,
      message:
        "Account created. Please check your email for the verification code.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 },
    );
  }
}
