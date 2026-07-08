import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  examAttempts,
  proctoringSessions,
  proctoringViolations,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthSession, errorResponse, successResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id: attemptId } = await params;

    // Validate attempt
    const [attempt] = await db
      .select()
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.id, attemptId),
          eq(examAttempts.studentId, session.user.id)
        )
      )
      .limit(1);

    if (!attempt) {
      return errorResponse("Attempt not found", 404);
    }

    if (attempt.status !== "in_progress") {
      return errorResponse("Attempt is no longer active", 400);
    }

    const body = await request.json();
    const { type, severity, description } = body;

    if (!type) {
      return errorResponse("Violation type is required", 400);
    }

    // Find active proctoring session
    const [procSession] = await db
      .select()
      .from(proctoringSessions)
      .where(
        and(
          eq(proctoringSessions.attemptId, attemptId),
          eq(proctoringSessions.status, "active")
        )
      )
      .limit(1);

    if (!procSession) {
      return errorResponse("No active proctoring session", 400);
    }

    // Insert violation
    await db.insert(proctoringViolations).values({
      sessionId: procSession.id,
      attemptId,
      type,
      severity: severity || "medium",
      description: description || null,
    });

    // Increment total violations on the proctoring session
    const newTotal = procSession.totalViolations + 1;
    await db
      .update(proctoringSessions)
      .set({ totalViolations: newTotal })
      .where(eq(proctoringSessions.id, procSession.id));

    return successResponse({
      violationCount: newTotal,
      type,
      severity: severity || "medium",
    });
  } catch (error) {
    console.error("[API] POST /api/attempts/[id]/violations error:", error);
    return errorResponse("Failed to log violation", 500);
  }
}
