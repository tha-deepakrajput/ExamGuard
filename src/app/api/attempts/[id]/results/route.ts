import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  examAttempts,
  studentAnswers,
  questions,
  questionOptions,
  exams,
  proctoringSessions,
  proctoringViolations,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthSession, errorResponse, successResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id: attemptId } = await params;

    // 1. Fetch attempt
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

    if (attempt.status === "in_progress") {
      return errorResponse("Exam has not been submitted yet", 400);
    }

    // 2. Fetch exam
    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, attempt.examId))
      .limit(1);

    if (!exam) {
      return errorResponse("Exam not found", 500);
    }

    // 3. Fetch answers
    const answers = await db
      .select()
      .from(studentAnswers)
      .where(eq(studentAnswers.attemptId, attemptId));

    // 4. Fetch questions with correct answers (since showAnswers = true)
    const examQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.examId, attempt.examId))
      .orderBy(questions.order);

    // 5. Build question details with options and correct answers
    const questionDetails = [];
    for (const q of examQuestions) {
      const opts = await db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, q.id))
        .orderBy(questionOptions.order);

      const studentAnswer = answers.find((a) => a.questionId === q.id);

      questionDetails.push({
        id: q.id,
        text: q.text,
        type: q.type,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        explanation: q.explanation,
        correctAnswer: q.correctAnswer, // for fill_blank
        options: opts.map((o) => ({
          id: o.id,
          text: o.text,
          order: o.order,
          isCorrect: exam.showAnswers ? o.isCorrect : undefined,
        })),
        studentAnswer: studentAnswer
          ? {
              selectedOptionId: studentAnswer.selectedOptionId,
              selectedOptionIds: studentAnswer.selectedOptionIds,
              textAnswer: studentAnswer.textAnswer,
              isCorrect: studentAnswer.isCorrect,
              marksAwarded: studentAnswer.marksAwarded,
            }
          : null,
      });
    }

    // 6. Fetch proctoring violations
    const [procSession] = await db
      .select()
      .from(proctoringSessions)
      .where(eq(proctoringSessions.attemptId, attemptId))
      .limit(1);

    let violations: {
      type: string;
      severity: string;
      description: string | null;
      timestamp: Date;
    }[] = [];

    if (procSession) {
      violations = await db
        .select({
          type: proctoringViolations.type,
          severity: proctoringViolations.severity,
          description: proctoringViolations.description,
          timestamp: proctoringViolations.timestamp,
        })
        .from(proctoringViolations)
        .where(eq(proctoringViolations.sessionId, procSession.id))
        .orderBy(proctoringViolations.timestamp);
    }

    return successResponse({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        autoSubmitted: attempt.autoSubmitted,
        totalScore: attempt.totalScore,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        timeSpentSeconds: attempt.timeSpentSeconds,
      },
      exam: {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        totalMarks: exam.totalMarks,
        passingPercentage: exam.passingPercentage,
        showAnswers: exam.showAnswers,
      },
      questions: exam.showAnswers ? questionDetails : undefined,
      summary: {
        totalQuestions: examQuestions.length,
        answered: answers.length,
        correct: answers.filter((a) => a.isCorrect).length,
        wrong: answers.filter(
          (a) => a.isCorrect === false && a.selectedOptionId !== null
        ).length,
        unanswered: examQuestions.length - answers.length,
      },
      proctoring: {
        totalViolations: procSession?.totalViolations ?? 0,
        violations,
      },
    });
  } catch (error) {
    console.error("[API] GET /api/attempts/[id]/results error:", error);
    return errorResponse("Failed to fetch results", 500);
  }
}
