import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { exams, questions, questionOptions, examAttempts } from "@/lib/db/schema";
import { eq, and, count, avg, sql, max, min } from "drizzle-orm";
import { getAdminSession, errorResponse, successResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// ─── GET: Fetch a single exam with stats ────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (!exam) {
      return errorResponse("Exam not found", 404);
    }

    // Question count
    const [qCount] = await db
      .select({ value: count() })
      .from(questions)
      .where(eq(questions.examId, id));

    // Question breakdown by type
    const questionBreakdown = await db
      .select({
        type: questions.type,
        count: count(),
      })
      .from(questions)
      .where(eq(questions.examId, id))
      .groupBy(questions.type);

    // Attempt stats
    const [attemptStats] = await db
      .select({
        total: count(),
        avgScore: avg(examAttempts.percentage),
        highestScore: max(examAttempts.percentage),
        lowestScore: min(examAttempts.percentage),
      })
      .from(examAttempts)
      .where(eq(examAttempts.examId, id));

    // Completed attempts (graded + submitted)
    const [completedCount] = await db
      .select({ value: count() })
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.examId, id),
          sql`${examAttempts.status} IN ('graded', 'submitted')`
        )
      );

    // Pass count
    const [passCount] = await db
      .select({ value: count() })
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.examId, id),
          sql`${examAttempts.percentage} >= ${exam.passingPercentage}`
        )
      );

    const studentsRegistered = attemptStats?.total ?? 0;
    const studentsCompleted = completedCount?.value ?? 0;
    const passRate =
      studentsCompleted > 0
        ? Math.round(((passCount?.value ?? 0) / studentsCompleted) * 100 * 10) / 10
        : 0;

    // Creator name
    const { users } = await import("@/lib/db/schema");
    const [creator] = await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, exam.createdBy))
      .limit(1);

    const enriched = {
      ...exam,
      questionCount: qCount?.value ?? 0,
      questionBreakdown: questionBreakdown.map((qb) => ({
        type: qb.type,
        count: Number(qb.count),
      })),
      studentsRegistered,
      studentsCompleted,
      avgScore: attemptStats?.avgScore ? parseFloat(String(attemptStats.avgScore)) : 0,
      highestScore: attemptStats?.highestScore ? parseFloat(String(attemptStats.highestScore)) : 0,
      lowestScore: attemptStats?.lowestScore ? parseFloat(String(attemptStats.lowestScore)) : 0,
      passRate,
      createdByName: creator ? `${creator.firstName} ${creator.lastName}` : "Unknown",
    };

    return successResponse(enriched);
  } catch (error) {
    console.error("[API] GET /api/admin/exams/[id] error:", error);
    return errorResponse("Failed to fetch exam", 500);
  }
}


// ─── PUT: Update an exam ────────────────────────────────────────
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

    // Check exam exists
    const [existing] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (!existing) {
      return errorResponse("Exam not found", 404);
    }

    // Build update object from provided fields
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    const allowedFields = [
      "title", "description", "subject", "category",
      "durationMinutes", "totalMarks", "passingPercentage",
      "instructions", "shuffleQuestions", "shuffleOptions",
      "proctoringEnabled", "maxViolations", "autoTerminateOnViolations",
      "showResults", "showAnswers", "maxAttempts",
      "negativeMarkingPercentage", "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle date fields specially
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    // Handle numeric fields
    if (body.durationMinutes !== undefined) {
      updateData.durationMinutes = parseInt(body.durationMinutes) || existing.durationMinutes;
    }
    if (body.totalMarks !== undefined) {
      updateData.totalMarks = parseFloat(body.totalMarks) || existing.totalMarks;
    }
    if (body.passingPercentage !== undefined) {
      updateData.passingPercentage = parseFloat(body.passingPercentage) || existing.passingPercentage;
    }

    const [updated] = await db
      .update(exams)
      .set(updateData)
      .where(eq(exams.id, id))
      .returning();

    return successResponse(updated);
  } catch (error) {
    console.error("[API] PUT /api/admin/exams/[id] error:", error);
    return errorResponse("Failed to update exam", 500);
  }
}

// ─── DELETE: Archive/delete an exam ─────────────────────────────
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

    const [existing] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (!existing) {
      return errorResponse("Exam not found", 404);
    }

    // Soft delete: set status to archived
    const [archived] = await db
      .update(exams)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(exams.id, id))
      .returning();

    return successResponse({ archived: true, id: archived.id });
  } catch (error) {
    console.error("[API] DELETE /api/admin/exams/[id] error:", error);
    return errorResponse("Failed to delete exam", 500);
  }
}
