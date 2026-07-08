import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { exams, questions, questionOptions, examAttempts } from "@/lib/db/schema";
import { eq, ilike, and, sql, count, avg } from "drizzle-orm";
import { getAdminSession, errorResponse, successResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// ─── GET: List all exams (admin view with stats) ────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");

    // Build conditions
    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(exams.status, status as "draft" | "published" | "active" | "completed" | "archived"));
    }
    if (subject && subject !== "all") {
      conditions.push(eq(exams.subject, subject));
    }
    if (search) {
      conditions.push(ilike(exams.title, `%${search}%`));
    }

    const examList = await db
      .select()
      .from(exams)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(exams.createdAt);

    // Enrich each exam with question count and attempt stats
    const enriched = await Promise.all(
      examList.map(async (exam) => {
        const [qCount] = await db
          .select({ value: count() })
          .from(questions)
          .where(eq(questions.examId, exam.id));

        const attempts = await db
          .select({
            total: count(),
            avgScore: avg(examAttempts.percentage),
          })
          .from(examAttempts)
          .where(eq(examAttempts.examId, exam.id));

        const completedAttempts = await db
          .select({ value: count() })
          .from(examAttempts)
          .where(
            and(
              eq(examAttempts.examId, exam.id),
              eq(examAttempts.status, "graded")
            )
          );

        return {
          ...exam,
          questionCount: qCount?.value ?? 0,
          studentsRegistered: attempts[0]?.total ?? 0,
          studentsCompleted: completedAttempts[0]?.value ?? 0,
          avgScore: attempts[0]?.avgScore ? parseFloat(String(attempts[0].avgScore)) : 0,
        };
      })
    );

    return successResponse(enriched);
  } catch (error) {
    console.error("[API] GET /api/admin/exams error:", error);
    return errorResponse("Failed to list exams", 500);
  }
}

// ─── POST: Create a new exam ────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const {
      title,
      description,
      subject,
      category,
      durationMinutes,
      totalMarks,
      passingPercentage,
      instructions,
      shuffleQuestions,
      shuffleOptions,
      proctoringEnabled,
      maxViolations,
      autoTerminateOnViolations,
      showResults,
      showAnswers,
      maxAttempts,
      negativeMarkingPercentage,
      startDate,
      endDate,
      status: examStatus,
    } = body;

    if (!title) {
      return errorResponse("Exam title is required");
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const [newExam] = await db
      .insert(exams)
      .values({
        title,
        description: description || null,
        slug,
        subject: subject || null,
        category: category || null,
        durationMinutes: parseInt(durationMinutes) || 60,
        totalMarks: parseFloat(totalMarks) || 100,
        passingPercentage: parseFloat(passingPercentage) || 40,
        negativeMarkingPercentage: parseFloat(negativeMarkingPercentage) || 0,
        instructions: instructions || null,
        shuffleQuestions: shuffleQuestions ?? false,
        shuffleOptions: shuffleOptions ?? false,
        proctoringEnabled: proctoringEnabled ?? true,
        maxViolations: parseInt(maxViolations) || 5,
        autoTerminateOnViolations: autoTerminateOnViolations ?? true,
        showResults: showResults ?? true,
        showAnswers: showAnswers ?? false,
        maxAttempts: parseInt(maxAttempts) || 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: examStatus || "draft",
        createdBy: session.user.id,
      })
      .returning();

    return successResponse(newExam, 201);
  } catch (error) {
    console.error("[API] POST /api/admin/exams error:", error);
    return errorResponse("Failed to create exam", 500);
  }
}
