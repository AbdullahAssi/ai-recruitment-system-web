import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "CANDIDATE" | "HR" | "ADMIN";
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "CANDIDATE" | "HR" | "ADMIN";
  hrProfile?: {
    id: string;
    companyId?: string;
  };
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    // console.log(
    //   "Verifying token with secret:",
    //   JWT_SECRET.substring(0, 10) + "..."
    // );
    // console.log("Token to verify:", token.substring(0, 50) + "...");
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    // console.log("Token verified successfully:", decoded);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Get current user from cookies
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(
  user: TokenPayload | null,
  allowedRoles: ("CANDIDATE" | "HR" | "ADMIN")[],
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Set auth cookie
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Get authenticated user with full details from request
 * Used in API routes for RBAC
 */
export async function auth(
  request: NextRequest,
): Promise<{ user: AuthUser } | null> {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Fetch full user with company info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hrProfile: {
          select: {
            id: true,
            companyId: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hrProfile: user.hrProfile ? {
          id: user.hrProfile.id,
          companyId: user.hrProfile.companyId || undefined,
        } : undefined,
      },
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Clear auth cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}
