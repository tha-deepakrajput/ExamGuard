import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { examAttempts, studentAnswers } from "@/lib/db/schema";
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

    // Validate attempt belongs to user and is in progress
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
      return errorResponse("This attempt has already been submitted", 400);
    }

    const body = await request.json();
    const { questionId, selectedOptionId, selectedOptionIds, textAnswer } = body;

    if (!questionId) {
      return errorResponse("questionId is required", 400);
    }

    // Upsert answer: check if answer already exists
    const [existingAnswer] = await db
      .select()
      .from(studentAnswers)
      .where(
        and(
          eq(studentAnswers.attemptId, attemptId),
          eq(studentAnswers.questionId, questionId)
        )
      )
      .limit(1);

    if (existingAnswer) {
      // Update existing answer
      await db
        .update(studentAnswers)
        .set({
          selectedOptionId: selectedOptionId || null,
          selectedOptionIds: selectedOptionIds || null,
          textAnswer: textAnswer || null,
          answeredAt: new Date(),
        })
        .where(eq(studentAnswers.id, existingAnswer.id));
    } else {
      // Insert new answer
      await db.insert(studentAnswers).values({
        attemptId,
        questionId,
        selectedOptionId: selectedOptionId || null,
        selectedOptionIds: selectedOptionIds || null,
        textAnswer: textAnswer || null,
        answeredAt: new Date(),
      });
    }

    return successResponse({ saved: true });
  } catch (error) {
    console.error("[API] POST /api/attempts/[id]/answer error:", error);
    return errorResponse("Failed to save answer", 500);
  }
}
