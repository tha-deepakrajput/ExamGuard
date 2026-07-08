import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { exams, questions, questionOptions, examSections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

    const { id } = await params;

    // Fetch exam
    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    if (!exam) {
      return errorResponse("Exam not found", 404);
    }

    // Fetch sections
    const sections = await db
      .select()
      .from(examSections)
      .where(eq(examSections.examId, id))
      .orderBy(examSections.order);

    // Fetch questions with options (without correct answer info)
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
      .where(eq(questions.examId, id))
      .orderBy(questions.order);

    // Fetch options for all questions (without isCorrect)
    const allOptions = await db
      .select({
        id: questionOptions.id,
        questionId: questionOptions.questionId,
        text: questionOptions.text,
        order: questionOptions.order,
      })
      .from(questionOptions)
      .where(
        eq(
          questionOptions.questionId,
          examQuestions.length > 0 ? examQuestions[0].id : ""
        )
      );

    // For a proper implementation, fetch all options for all questions
    const questionIds = examQuestions.map((q) => q.id);
    let optionsByQuestion: Record<
      string,
      { id: string; text: string; order: number }[]
    > = {};

    if (questionIds.length > 0) {
      // Fetch all options for all questions in the exam
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
    }

    // Combine questions with their options
    const questionsWithOptions = examQuestions.map((q) => ({
      ...q,
      options: optionsByQuestion[q.id] || [],
    }));

    // Shuffle if configured
    let finalQuestions = questionsWithOptions;
    if (exam.shuffleQuestions) {
      finalQuestions = [...questionsWithOptions].sort(
        () => Math.random() - 0.5
      );
    }
    if (exam.shuffleOptions) {
      finalQuestions = finalQuestions.map((q) => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5),
      }));
    }

    return successResponse({
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        subject: exam.subject,
        category: exam.category,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        passingPercentage: exam.passingPercentage,
        startDate: exam.startDate,
        endDate: exam.endDate,
        status: exam.status,
        maxAttempts: exam.maxAttempts,
        proctoringEnabled: exam.proctoringEnabled,
        maxViolations: exam.maxViolations,
        instructions: exam.instructions,
        negativeMarkingPercentage: exam.negativeMarkingPercentage,
        shuffleQuestions: exam.shuffleQuestions,
        showResults: exam.showResults,
        showAnswers: exam.showAnswers,
      },
      sections,
      questions: finalQuestions,
      questionCount: finalQuestions.length,
    });
  } catch (error) {
    console.error("[API] GET /api/exams/[id] error:", error);
    return errorResponse("Failed to fetch exam", 500);
  }
}
