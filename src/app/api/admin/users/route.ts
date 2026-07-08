import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, examAttempts } from "@/lib/db/schema";
import { eq, and, count, sql, desc, ilike, or } from "drizzle-orm";
import { getAdminSession, errorResponse, successResponse } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

// ─── GET: List all users with stats ─────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Build conditions
    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(users.status, status as any));
    }
    if (role && role !== "all") {
      conditions.push(eq(users.role, role as any));
    }
    if (search) {
      conditions.push(
        or(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const userList = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
        phone: users.phone,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt));

    // Enrich with exam attempt counts
    const enriched = await Promise.all(
      userList.map(async (user) => {
        const [attemptCount] = await db
          .select({ value: count() })
          .from(examAttempts)
          .where(
            and(
              eq(examAttempts.studentId, user.id),
              sql`${examAttempts.status} IN ('graded', 'submitted')`
            )
          );
        return {
          ...user,
          examsCompleted: attemptCount?.value ?? 0,
        };
      })
    );

    // Stats summary
    const allUsers = await db.select({ role: users.role, status: users.status }).from(users);
    const stats = {
      total: allUsers.length,
      active: allUsers.filter((u) => u.status === "active").length,
      students: allUsers.filter((u) => u.role === "student").length,
      admins: allUsers.filter((u) => u.role === "admin" || u.role === "super_admin").length,
    };

    return successResponse({ users: enriched, stats });
  } catch (error) {
    console.error("[API] GET /api/admin/users error:", error);
    return errorResponse("Failed to fetch users", 500);
  }
}

// ─── POST: Create a new user ────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { firstName, lastName, email, role, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return errorResponse("First name, last name, email, and password are required");
    }

    // Check if email already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing) {
      return errorResponse("A user with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        role: role || "student",
        status: "active",
        emailVerified: true, // Admin-created users are pre-verified
        passwordHash,
      })
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      });

    return successResponse(newUser, 201);
  } catch (error) {
    console.error("[API] POST /api/admin/users error:", error);
    return errorResponse("Failed to create user", 500);
  }
}
