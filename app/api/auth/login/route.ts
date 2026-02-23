import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  // Rate limit: max 10 login attempts per IP per 15 minutes.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Please contact support." },
        { status: 403 },
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(
      validatedData.password,
      user.password,
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });

    // Set auth cookie — secure flag is enabled automatically in production.
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
