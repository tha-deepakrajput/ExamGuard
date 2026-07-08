import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { questions, questionOptions, exams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession, errorResponse, successResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

interface QuestionInput {
  type: "mcq" | "multi_select" | "true_false" | "fill_blank" | "descriptive";
  text: string;
  marks: number;
  negativeMarks?: number;
  difficulty?: "easy" | "medium" | "hard";
  explanation?: string;
  correctAnswer?: string; // for fill_blank
  options?: { text: string; isCorrect: boolean }[];
}

// ─── POST: Bulk-insert questions for an exam ────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id: examId } = await params;

    // Verify exam exists
    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (!exam) {
      return errorResponse("Exam not found", 404);
    }

    const body = await request.json();
    const { questions: questionList } = body as { questions: QuestionInput[] };

    if (!questionList || !Array.isArray(questionList) || questionList.length === 0) {
      return errorResponse("At least one question is required");
    }

    // Delete existing questions for this exam (replace mode)
    await db.delete(questions).where(eq(questions.examId, examId));

    const insertedQuestions = [];

    for (let i = 0; i < questionList.length; i++) {
      const q = questionList[i];

      // Insert question
      const [insertedQ] = await db
        .insert(questions)
        .values({
          examId,
          type: q.type,
          text: q.text,
          marks: q.marks || 1,
          negativeMarks: q.negativeMarks || 0,
          difficulty: q.difficulty || "medium",
          explanation: q.explanation || null,
          correctAnswer: q.correctAnswer || null,
          order: i + 1,
          createdBy: session.user.id,
        })
        .returning();

      // Insert options (if MCQ, multi_select, or true_false)
      if (q.options && q.options.length > 0) {
        const optionValues = q.options.map((opt, j) => ({
          questionId: insertedQ.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: j + 1,
        }));

        await db.insert(questionOptions).values(optionValues);
      }

      insertedQuestions.push(insertedQ);
    }

    // Update exam's total marks based on questions
    const totalMarks = questionList.reduce((acc, q) => acc + (q.marks || 1), 0);
    await db
      .update(exams)
      .set({ totalMarks, updatedAt: new Date() })
      .where(eq(exams.id, examId));

    return successResponse(
      {
        examId,
        questionsInserted: insertedQuestions.length,
        totalMarks,
      },
      201
    );
  } catch (error) {
    console.error("[API] POST /api/admin/exams/[id]/questions error:", error);
    return errorResponse("Failed to insert questions", 500);
  }
}
