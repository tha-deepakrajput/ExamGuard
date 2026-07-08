import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, examAttempts } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { getAdminSession, errorResponse, successResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// ─── GET: Fetch a single user details and stats ─────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    const [user] = await db
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
      })
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Fetch attempts
    const { exams } = await import("@/lib/db/schema/exams");
    const { proctoringViolations } = await import("@/lib/db/schema/proctoring");
    const { desc, avg, max } = await import("drizzle-orm");

    const history = await db
      .select({
        id: examAttempts.id,
        title: exams.title,
        status: examAttempts.status,
        score: examAttempts.percentage,
        isPassed: examAttempts.isPassed,
        submittedAt: examAttempts.submittedAt,
      })
      .from(examAttempts)
      .leftJoin(exams, eq(examAttempts.examId, exams.id))
      .where(eq(examAttempts.studentId, id))
      .orderBy(desc(examAttempts.startedAt));

    const [stats] = await db
      .select({
        avgScore: avg(examAttempts.percentage),
        bestScore: max(examAttempts.percentage),
        completedCount: count(),
      })
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.studentId, id),
          sql`${examAttempts.status} IN ('graded', 'submitted')`
        )
      );

    const [violations] = await db
      .select({ value: count() })
      .from(proctoringViolations)
      .leftJoin(examAttempts, eq(proctoringViolations.attemptId, examAttempts.id))
      .where(eq(examAttempts.studentId, id));

    return successResponse({
      ...user,
      examHistory: history.map((h) => ({
        id: h.id,
        title: h.title || "Unknown Exam",
        date: h.submittedAt ? new Date(h.submittedAt).toISOString() : null,
        score: h.score || 0,
        status: h.status,
        isPassed: h.isPassed,
      })),
      stats: {
        avgScore: stats?.avgScore ? Math.round(parseFloat(String(stats.avgScore)) * 10) / 10 : 0,
        bestScore: stats?.bestScore ? Math.round(parseFloat(String(stats.bestScore)) * 10) / 10 : 0,
        examsCompleted: stats?.completedCount ?? 0,
        totalViolations: violations?.value ?? 0,
      },
      activityLog: [], // Will populate properly if there's an activity table, keeping empty for now
    });
  } catch (error) {
    console.error("[API] GET /api/admin/users/[id] error:", error);
    return errorResponse("Failed to fetch user details", 500);
  }
}

// ─── PUT: Update a user (status, role) ──────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await request.json();

    // Prevent self-modification of role/status
    if (session.user.id === id && (body.status || body.role)) {
      return errorResponse("You cannot modify your own status or role", 403);
    }

    const allowedFields = ["status", "role", "firstName", "lastName", "phone", "email"];
    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No valid fields to update");
    }

    if (updates.email) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, updates.email.toLowerCase().trim()))
        .limit(1);

      if (existing && existing.id !== id) {
        return errorResponse("A user with this email already exists", 409);
      }
      updates.email = updates.email.toLowerCase().trim();
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
      });

    if (!updated) {
      return errorResponse("User not found", 404);
    }

    return successResponse(updated);
  } catch (error) {
    console.error("[API] PUT /api/admin/users/[id] error:", error);
    return errorResponse("Failed to update user", 500);
  }
}

// ─── DELETE: Remove a user ──────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    // Prevent self-deletion
    if (session.user.id === id) {
      return errorResponse("You cannot delete your own account", 403);
    }

    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) {
      return errorResponse("User not found", 404);
    }

    return successResponse({ message: "User deleted successfully" });
  } catch (error) {
    console.error("[API] DELETE /api/admin/users/[id] error:", error);
    return errorResponse("Failed to delete user", 500);
  }
}
