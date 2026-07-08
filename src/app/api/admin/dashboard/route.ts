import { db } from "@/lib/db";
import {
  users,
  exams,
  examAttempts,
  proctoringViolations,
  proctoringSessions,
} from "@/lib/db/schema";
import { eq, and, count, avg, sql, gte, desc } from "drizzle-orm";
import { getAdminSession, errorResponse, successResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // ── Stat Cards ──────────────────────────────────────────────

    // Total students
    const [totalStudents] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "student"));

    // Students registered in the last 7 days (for trend)
    const [newStudentsThisWeek] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, "student"), gte(users.createdAt, weekAgo)));

    // Active/published exams
    const [activeExams] = await db
      .select({ value: count() })
      .from(exams)
      .where(
        sql`${exams.status} IN ('published', 'active')`
      );

    // Total exams
    const [totalExams] = await db
      .select({ value: count() })
      .from(exams);

    // Completion rate: completed attempts / total attempts
    const [totalAttempts] = await db
      .select({ value: count() })
      .from(examAttempts);

    const [completedAttempts] = await db
      .select({ value: count() })
      .from(examAttempts)
      .where(
        sql`${examAttempts.status} IN ('graded', 'submitted')`
      );

    const completionRate =
      (totalAttempts?.value ?? 0) > 0
        ? Math.round(((completedAttempts?.value ?? 0) / (totalAttempts?.value ?? 1)) * 1000) / 10
        : 0;

    // Violations today
    const [violationsToday] = await db
      .select({ value: count() })
      .from(proctoringViolations)
      .where(gte(proctoringViolations.timestamp, todayStart));

    // Violations yesterday (for trend)
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const [violationsYesterday] = await db
      .select({ value: count() })
      .from(proctoringViolations)
      .where(
        and(
          gte(proctoringViolations.timestamp, yesterdayStart),
          sql`${proctoringViolations.timestamp} < ${todayStart}`
        )
      );

    const violationDiff =
      (violationsToday?.value ?? 0) - (violationsYesterday?.value ?? 0);

    // ── Recent Exams ────────────────────────────────────────────
    const recentExams = await db
      .select({
        id: exams.id,
        title: exams.title,
        subject: exams.subject,
        status: exams.status,
        createdAt: exams.createdAt,
        updatedAt: exams.updatedAt,
      })
      .from(exams)
      .orderBy(desc(exams.updatedAt))
      .limit(5);

    // Enrich exams with student count + avg score
    const enrichedExams = await Promise.all(
      recentExams.map(async (exam) => {
        const [attemptInfo] = await db
          .select({
            students: count(),
            avgScore: avg(examAttempts.percentage),
          })
          .from(examAttempts)
          .where(eq(examAttempts.examId, exam.id));

        return {
          ...exam,
          students: attemptInfo?.students ?? 0,
          avgScore: attemptInfo?.avgScore
            ? parseFloat(String(attemptInfo.avgScore))
            : 0,
        };
      })
    );

    // ── Performance Overview ────────────────────────────────────
    // Pass rate (all graded attempts)
    const [passStats] = await db
      .select({
        totalGraded: count(),
      })
      .from(examAttempts)
      .where(sql`${examAttempts.status} IN ('graded', 'submitted')`);

    const [passedCount] = await db
      .select({ value: count() })
      .from(examAttempts)
      .where(
        and(
          sql`${examAttempts.status} IN ('graded', 'submitted')`,
          eq(examAttempts.isPassed, true)
        )
      );

    const passRate =
      (passStats?.totalGraded ?? 0) > 0
        ? Math.round(((passedCount?.value ?? 0) / (passStats?.totalGraded ?? 1)) * 1000) / 10
        : 0;

    // Avg score (all scored attempts)
    const [avgScoreResult] = await db
      .select({ value: avg(examAttempts.percentage) })
      .from(examAttempts)
      .where(sql`${examAttempts.percentage} IS NOT NULL`);

    const avgScore = avgScoreResult?.value
      ? Math.round(parseFloat(String(avgScoreResult.value)) * 10) / 10
      : 0;

    // ── Quick Stats ─────────────────────────────────────────────

    // Average exam duration (from time spent)
    const [avgDuration] = await db
      .select({ value: avg(examAttempts.timeSpentSeconds) })
      .from(examAttempts)
      .where(sql`${examAttempts.timeSpentSeconds} > 0`);

    const avgDurationMin = avgDuration?.value
      ? Math.round(parseFloat(String(avgDuration.value)) / 60)
      : 0;

    // Total proctoring sessions
    const [totalProcSessions] = await db
      .select({ value: count() })
      .from(proctoringSessions);

    // ── Weekly Performance (last 7 days) ────────────────────────
    const weeklyPerformance = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [dayAvg] = await db
        .select({ value: avg(examAttempts.percentage) })
        .from(examAttempts)
        .where(
          and(
            gte(examAttempts.startedAt, dayStart),
            sql`${examAttempts.startedAt} < ${dayEnd}`,
            sql`${examAttempts.percentage} IS NOT NULL`
          )
        );

      weeklyPerformance.push({
        day: dayNames[dayStart.getDay()],
        value: dayAvg?.value ? Math.round(parseFloat(String(dayAvg.value))) : 0,
      });
    }

    return successResponse({
      stats: {
        totalStudents: totalStudents?.value ?? 0,
        newStudentsThisWeek: newStudentsThisWeek?.value ?? 0,
        activeExams: activeExams?.value ?? 0,
        totalExams: totalExams?.value ?? 0,
        completionRate,
        violationsToday: violationsToday?.value ?? 0,
        violationDiff,
      },
      recentExams: enrichedExams,
      performance: {
        passRate,
        avgScore,
        completionRate,
      },
      quickStats: {
        avgDurationMin,
        totalProcSessions: totalProcSessions?.value ?? 0,
      },
      weeklyPerformance,
    });
  } catch (error) {
    console.error("[API] GET /api/admin/dashboard error:", error);
    return errorResponse("Failed to fetch dashboard data", 500);
  }
}
