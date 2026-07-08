import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  exams,
  questions,
  questionOptions,
  examSections,
  examAttempts,
  proctoringSessions,
} from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
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

    const { id: examId } = await params;
    const studentId = session.user.id;

    // 1. Fetch exam
    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (!exam) {
      return errorResponse("Exam not found", 404);
    }

    // 2. Check if exam is active
    if (exam.status !== "active") {
      return errorResponse("This exam is not currently active", 400);
    }

    // 3. Check time window
    const now = new Date();
    if (exam.startDate && now < exam.startDate) {
      return errorResponse("This exam has not started yet", 400);
    }
    if (exam.endDate && now > exam.endDate) {
      return errorResponse("This exam has already ended", 400);
    }

    // 4. Check max attempts
    const [attemptCountResult] = await db
      .select({ value: count() })
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.examId, examId),
          eq(examAttempts.studentId, studentId)
        )
      );

    const attemptCount = attemptCountResult?.value ?? 0;
    if (attemptCount >= exam.maxAttempts) {
      return errorResponse("Maximum attempts reached for this exam", 400);
    }

    // 5. Check for an in-progress attempt (resume)
    const [existingAttempt] = await db
      .select()
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.examId, examId),
          eq(examAttempts.studentId, studentId),
          eq(examAttempts.status, "in_progress")
        )
      )
      .limit(1);

    let attemptId: string;

    if (existingAttempt) {
      // Resume existing attempt
      attemptId = existingAttempt.id;
    } else {
      // 6. Create new attempt
      const [newAttempt] = await db
        .insert(examAttempts)
        .values({
          examId,
          studentId,
          totalMarks: exam.totalMarks,
          status: "in_progress",
        })
        .returning({ id: examAttempts.id });

      attemptId = newAttempt.id;

      // 7. Create proctoring session
      if (exam.proctoringEnabled) {
        await db.insert(proctoringSessions).values({
          attemptId,
          cameraEnabled: false,
          status: "active",
        });
      }
    }

    // 8. Fetch questions (without correct answers)
    const examQuestions = await db
      .select({
        id: questions.id,
        type: questions.type,
        text: questions.text,
        marks: questions.marks,
        negativeMarks: questions.negativeMarks,
        sectionId: questions.sectionId,
        order: questions.order,
      })
      .from(questions)
      .where(eq(questions.examId, examId))
      .orderBy(questions.order);

    // 9. Fetch options (without isCorrect)
    const optionsByQuestion: Record<
      string,
      { id: string; text: string; order: number }[]
    > = {};
    for (const q of examQuestions) {
      const opts = await db
        .select({
          id: questionOptions.id,
          text: questionOptions.text,
          order: questionOptions.order,
        })
        .from(questionOptions)
        .where(eq(questionOptions.questionId, q.id))
        .orderBy(questionOptions.order);
      optionsByQuestion[q.id] = opts;
    }

    let questionsWithOptions = examQuestions.map((q) => ({
      ...q,
      options: optionsByQuestion[q.id] || [],
    }));

    // 10. Shuffle if configured
    if (exam.shuffleQuestions) {
      questionsWithOptions = [...questionsWithOptions].sort(
        () => Math.random() - 0.5
      );
    }
    if (exam.shuffleOptions) {
      questionsWithOptions = questionsWithOptions.map((q) => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5),
      }));
    }

    // 11. Fetch sections
    const sections = await db
      .select()
      .from(examSections)
      .where(eq(examSections.examId, examId))
      .orderBy(examSections.order);

    return successResponse({
      attemptId,
      resumed: !!existingAttempt,
      exam: {
        id: exam.id,
        title: exam.title,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        proctoringEnabled: exam.proctoringEnabled,
        maxViolations: exam.maxViolations,
        autoTerminateOnViolations: exam.autoTerminateOnViolations,
      },
      sections,
      questions: questionsWithOptions,
    });
  } catch (error) {
    console.error("[API] POST /api/exams/[id]/start error:", error);
    return errorResponse("Failed to start exam", 500);
  }
}
