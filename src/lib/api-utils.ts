import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/rbac";

/**
 * Get the authenticated session or return null.
 */
export async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

/**
 * Get authenticated admin session. Returns null if not admin/super_admin.
 */
export async function getAdminSession() {
  const session = await getAuthSession();
  if (!session || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}

/**
 * Return a JSON error response.
 */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Return a JSON success response.
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

