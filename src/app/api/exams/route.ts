import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { eq, or, ilike, and, sql } from "drizzle-orm";
import { getAuthSession, errorResponse, successResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const subject = searchParams.get("subject");
    const status = searchParams.get("status");

    const conditions = [
      or(eq(exams.status, "active"), eq(exams.status, "published")),
    ];

    if (subject) {
      conditions.push(eq(exams.subject, subject));
    }
    if (status === "active" || status === "published") {
      // Override the default active/published filter
      conditions.pop();
      conditions.push(eq(exams.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(exams.title, `%${search}%`),
          ilike(exams.subject, `%${search}%`)
        )!
      );
    }

    const result = await db
      .select({
        id: exams.id,
        title: exams.title,
        description: exams.description,
        slug: exams.slug,
        subject: exams.subject,
        category: exams.category,
        durationMinutes: exams.durationMinutes,
        totalMarks: exams.totalMarks,
        passingPercentage: exams.passingPercentage,
        startDate: exams.startDate,
        endDate: exams.endDate,
        status: exams.status,
        maxAttempts: exams.maxAttempts,
        proctoringEnabled: exams.proctoringEnabled,
        shuffleQuestions: exams.shuffleQuestions,
        createdAt: exams.createdAt,
      })
      .from(exams)
      .where(and(...conditions))
      .orderBy(exams.startDate);

    return successResponse({ exams: result });
  } catch (error) {
    console.error("[API] GET /api/exams error:", error);
    return errorResponse("Failed to fetch exams", 500);
  }
}
