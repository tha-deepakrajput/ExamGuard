import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  examAttempts,
  studentAnswers,
  questions,
  questionOptions,
  exams,
  proctoringSessions,
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

    // 1. Validate attempt
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

    const body = await request.json().catch(() => ({}));
    const autoSubmitted = body.autoSubmitted === true;

    // 2. Fetch the exam
    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, attempt.examId))
      .limit(1);

    if (!exam) {
      return errorResponse("Exam not found", 500);
    }

    // 3. Fetch all answers for this attempt
    const answers = await db
      .select()
      .from(studentAnswers)
      .where(eq(studentAnswers.attemptId, attemptId));

    // 4. Fetch all questions with correct answers for grading
    const examQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.examId, attempt.examId));

    // 5. Build a map of correct options per question
    const correctOptionsByQuestion: Record<string, string[]> = {};
    const correctTextByQuestion: Record<string, string> = {};

    for (const q of examQuestions) {
      if (q.type === "fill_blank" && q.correctAnswer) {
        correctTextByQuestion[q.id] = q.correctAnswer.toLowerCase().trim();
      } else {
        const opts = await db
          .select()
          .from(questionOptions)
          .where(
            and(
              eq(questionOptions.questionId, q.id),
              eq(questionOptions.isCorrect, true)
            )
          );
        correctOptionsByQuestion[q.id] = opts.map((o) => o.id);
      }
    }

    // 6. Grade each answer
    let totalScore = 0;
    const gradedAnswers: {
      answerId: string;
      questionId: string;
      isCorrect: boolean;
      marksAwarded: number;
    }[] = [];

    for (const answer of answers) {
      const question = examQuestions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let marksAwarded = 0;

      switch (question.type) {
        case "mcq":
        case "true_false": {
          const correctIds = correctOptionsByQuestion[question.id] || [];
          isCorrect =
            !!answer.selectedOptionId &&
            correctIds.includes(answer.selectedOptionId);
          if (isCorrect) {
            marksAwarded = question.marks;
          } else if (answer.selectedOptionId) {
            // Wrong answer — apply negative marking
            marksAwarded = -(question.negativeMarks || 0);
          }
          break;
        }

        case "multi_select": {
          const correctIds = correctOptionsByQuestion[question.id] || [];
          const selectedIds = answer.selectedOptionIds || [];
          const allCorrect =
            correctIds.length === selectedIds.length &&
            correctIds.every((id) => selectedIds.includes(id));
          isCorrect = allCorrect;
          if (isCorrect) {
            marksAwarded = question.marks;
          } else if (selectedIds.length > 0) {
            marksAwarded = -(question.negativeMarks || 0);
          }
          break;
        }

        case "fill_blank": {
          const correct = correctTextByQuestion[question.id];
          const studentAnswer = (answer.textAnswer || "").toLowerCase().trim();
          isCorrect = correct === studentAnswer;
          marksAwarded = isCorrect ? question.marks : 0;
          break;
        }

        case "descriptive": {
          // Descriptive questions need manual grading — skip auto-grade
          isCorrect = false;
          marksAwarded = 0;
          break;
        }
      }

      totalScore += marksAwarded;
      gradedAnswers.push({
        answerId: answer.id,
        questionId: answer.questionId,
        isCorrect,
        marksAwarded,
      });
    }

    // Ensure score doesn't go below 0
    totalScore = Math.max(0, totalScore);

    const percentage =
      exam.totalMarks > 0 ? (totalScore / exam.totalMarks) * 100 : 0;
    const isPassed = percentage >= exam.passingPercentage;

    // 7. Update each answer with grading result
    for (const graded of gradedAnswers) {
      await db
        .update(studentAnswers)
        .set({
          isCorrect: graded.isCorrect,
          marksAwarded: graded.marksAwarded,
        })
        .where(eq(studentAnswers.id, graded.answerId));
    }

    // 8. Calculate time spent
    const timeSpentSeconds = Math.floor(
      (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
    );

    // 9. Update attempt
    await db
      .update(examAttempts)
      .set({
        status: "graded",
        submittedAt: new Date(),
        autoSubmitted,
        totalScore,
        percentage: Math.round(percentage * 100) / 100,
        isPassed,
        timeSpentSeconds,
      })
      .where(eq(examAttempts.id, attemptId));

    // 10. End proctoring session
    await db
      .update(proctoringSessions)
      .set({
        status: "ended",
        endedAt: new Date(),
      })
      .where(eq(proctoringSessions.attemptId, attemptId));

    return successResponse({
      attemptId,
      totalScore,
      totalMarks: exam.totalMarks,
      percentage: Math.round(percentage * 100) / 100,
      isPassed,
      timeSpentSeconds,
      answeredCount: answers.length,
      totalQuestions: examQuestions.length,
    });
  } catch (error) {
    console.error("[API] POST /api/attempts/[id]/submit error:", error);
    return errorResponse("Failed to submit exam", 500);
  }
}
