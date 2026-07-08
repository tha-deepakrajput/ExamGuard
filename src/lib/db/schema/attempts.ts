import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  real,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { attemptStatusEnum } from "./enums";
import { users } from "./users";
import { exams } from "./exams";
import { questions } from "./exams";

// ─── Exam Attempts ───────────────────────────────────────────
export const examAttempts = pgTable(
  "exam_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    autoSubmitted: boolean("auto_submitted").notNull().default(false),
    status: attemptStatusEnum("status").notNull().default("in_progress"),
    totalScore: real("total_score"),
    totalMarks: real("total_marks"),
    percentage: real("percentage"),
    isPassed: boolean("is_passed"),
    timeSpentSeconds: integer("time_spent_seconds").default(0),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("exam_attempts_exam_id_idx").on(table.examId),
    index("exam_attempts_student_id_idx").on(table.studentId),
    index("exam_attempts_status_idx").on(table.status),
  ]
);

// ─── Student Answers ─────────────────────────────────────────
export const studentAnswers = pgTable(
  "student_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => examAttempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    // For MCQ: single option ID
    selectedOptionId: uuid("selected_option_id"),
    // For multi-select: array of option IDs
    selectedOptionIds: uuid("selected_option_ids").array(),
    // For fill-blank and descriptive
    textAnswer: text("text_answer"),
    isCorrect: boolean("is_correct"),
    marksAwarded: real("marks_awarded"),
    timeSpentSeconds: integer("time_spent_seconds").default(0),
    flagged: boolean("flagged").notNull().default(false),
    answeredAt: timestamp("answered_at", { withTimezone: true }),
  },
  (table) => [
    index("student_answers_attempt_id_idx").on(table.attemptId),
    index("student_answers_question_id_idx").on(table.questionId),
  ]
);

// ─── Relations ───────────────────────────────────────────────
export const examAttemptsRelations = relations(
  examAttempts,
  ({ one, many }) => ({
    exam: one(exams, {
      fields: [examAttempts.examId],
      references: [exams.id],
    }),
    student: one(users, {
      fields: [examAttempts.studentId],
      references: [users.id],
    }),
    answers: many(studentAnswers),
  })
);

export const studentAnswersRelations = relations(
  studentAnswers,
  ({ one }) => ({
    attempt: one(examAttempts, {
      fields: [studentAnswers.attemptId],
      references: [examAttempts.id],
    }),
    question: one(questions, {
      fields: [studentAnswers.questionId],
      references: [questions.id],
    }),
  })
);
