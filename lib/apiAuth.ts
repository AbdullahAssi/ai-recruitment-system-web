import { NextResponse } from "next/server";
import { getCurrentUser, TokenPayload } from "./auth";

type Role = "CANDIDATE" | "HR" | "ADMIN";

interface AuthSuccess {
  user: TokenPayload;
  error: null;
}

interface AuthFailure {
  user: null;
  error: NextResponse;
}

/**
 * Verifies the request is authenticated and optionally checks roles.
 * Usage in an API route:
 *
 *   const { user, error } = await requireAuth(["HR", "ADMIN"]);
 *   if (error) return error;
 *   // user is guaranteed to be defined here
 */
export async function requireAuth(
  allowedRoles?: Role[],
): Promise<AuthSuccess | AuthFailure> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, error: null };
}
