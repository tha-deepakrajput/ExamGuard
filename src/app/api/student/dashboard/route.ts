import { db } from "@/lib/db";
import { exams, examAttempts } from "@/lib/db/schema";
import { eq, and, count, avg, desc, ne } from "drizzle-orm";
import { getAuthSession, errorResponse, successResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const studentId = session.user.id;

    // 1. Total exams taken
    const [totalAttempts] = await db
      .select({ value: count() })
      .from(examAttempts)
      .where(eq(examAttempts.studentId, studentId));

    // 2. Completed exams (graded)
    const [completedExams] = await db
      .select({ value: count() })
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.studentId, studentId),
          eq(examAttempts.status, "graded")
        )
      );

    // 3. Average score
    const [avgResult] = await db
      .select({ value: avg(examAttempts.percentage) })
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.studentId, studentId),
          eq(examAttempts.status, "graded")
        )
      );

    // 4. In-progress exams
    const [inProgress] = await db
      .select({ value: count() })
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.studentId, studentId),
          eq(examAttempts.status, "in_progress")
        )
      );

    // 5. Recent results (last 5)
    const recentAttempts = await db
      .select({
        attemptId: examAttempts.id,
        examId: examAttempts.examId,
        status: examAttempts.status,
        totalScore: examAttempts.totalScore,
        totalMarks: examAttempts.totalMarks,
        percentage: examAttempts.percentage,
        isPassed: examAttempts.isPassed,
        submittedAt: examAttempts.submittedAt,
        examTitle: exams.title,
        examSubject: exams.subject,
      })
      .from(examAttempts)
      .innerJoin(exams, eq(examAttempts.examId, exams.id))
      .where(
        and(
          eq(examAttempts.studentId, studentId),
          eq(examAttempts.status, "graded")
        )
      )
      .orderBy(desc(examAttempts.submittedAt))
      .limit(5);

    // 6. Available exams (published or active, not yet attempted)
    const allExams = await db
      .select()
      .from(exams)
      .where(
        eq(exams.status, "published")
      );

    const activeExams = await db
      .select()
      .from(exams)
      .where(
        eq(exams.status, "active")
      );

    const upcomingExams = [...allExams, ...activeExams].slice(0, 5);

    return successResponse({
      stats: {
        totalExamsTaken: totalAttempts?.value ?? 0,
        completedExams: completedExams?.value ?? 0,
        averageScore: avgResult?.value ? Math.round(parseFloat(String(avgResult.value)) * 10) / 10 : 0,
        inProgressExams: inProgress?.value ?? 0,
      },
      recentResults: recentAttempts,
      upcomingExams: upcomingExams.map((e) => ({
        id: e.id,
        title: e.title,
        subject: e.subject,
        durationMinutes: e.durationMinutes,
        totalMarks: e.totalMarks,
        startDate: e.startDate,
        endDate: e.endDate,
        status: e.status,
        proctoringEnabled: e.proctoringEnabled,
      })),
    });
  } catch (error) {
    console.error("[API] GET /api/student/dashboard error:", error);
    return errorResponse("Failed to fetch dashboard data", 500);
  }
}
