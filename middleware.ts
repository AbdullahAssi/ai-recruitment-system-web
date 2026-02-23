import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface TokenPayload {
  userId: string;
  email: string;
  role: "CANDIDATE" | "HR" | "ADMIN";
  name: string;
}

// Never throw at module level – that executes during `next build` when the
// env variable isn't present yet. Validate inside the function at request time.
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET environment variable must be set in production.",
      );
    }
    return new TextEncoder().encode(
      "dev-only-insecure-secret-do-not-use-in-production",
    );
  }
  return new TextEncoder().encode(secret);
}

async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    // Validate that payload has required fields
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.role === "string" &&
      typeof payload.name === "string"
    ) {
      return payload as unknown as TokenPayload;
    }

    return null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/register"];

// Routes that require HR role
const hrRoutes = ["/hr"];

// Routes that require CANDIDATE role
const candidateRoutes = ["/candidate"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and auth routes
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Allow all /auth/* routes
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("auth_token")?.value;

  // console.log("Middleware check:", { pathname, hasToken: !!token });

  if (!token) {
    console.log("No token found, redirecting to login");
    // Redirect to login if not authenticated
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Verify token
  const payload = await verifyTokenEdge(token);

  // console.log("Token payload:", payload);

  if (!payload) {
    console.log("Invalid token, redirecting to login");
    // Invalid token, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Check role-based access
  if (hrRoutes.some((route) => pathname.startsWith(route))) {
    if (payload.role !== "HR" && payload.role !== "ADMIN") {
      //   console.log("HR route access denied for role:", payload.role);
      // Unauthorized - redirect to appropriate portal
      const url = request.nextUrl.clone();
      url.pathname = payload.role === "CANDIDATE" ? "/candidate" : "/";
      return NextResponse.redirect(url);
    }
  }

  if (candidateRoutes.some((route) => pathname.startsWith(route))) {
    if (payload.role !== "CANDIDATE" && payload.role !== "ADMIN") {
      //   console.log("Candidate route access denied for role:", payload.role);
      // Unauthorized - redirect to appropriate portal
      const url = request.nextUrl.clone();
      url.pathname = payload.role === "HR" ? "/hr" : "/";
      return NextResponse.redirect(url);
    }
  }

  //   console.log("Access granted, allowing request");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
