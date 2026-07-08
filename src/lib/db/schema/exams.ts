import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  real,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  examStatusEnum,
  questionTypeEnum,
  difficultyLevelEnum,
} from "./enums";
import { users } from "./users";

// ─── Exams Table ──────────────────────────────────────────────
export const exams = pgTable(
  "exams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    subject: varchar("subject", { length: 100 }),
    category: varchar("category", { length: 100 }),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    totalMarks: real("total_marks").notNull().default(100),
    passingPercentage: real("passing_percentage").notNull().default(40),
    negativeMarkingPercentage: real("negative_marking_percentage")
      .notNull()
      .default(0),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    status: examStatusEnum("status").notNull().default("draft"),
    shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
    shuffleOptions: boolean("shuffle_options").notNull().default(false),
    maxAttempts: integer("max_attempts").notNull().default(1),
    instructions: text("instructions"),
    proctoringEnabled: boolean("proctoring_enabled").notNull().default(true),
    maxViolations: integer("max_violations").notNull().default(5),
    autoTerminateOnViolations: boolean("auto_terminate_on_violations")
      .notNull()
      .default(true),
    showResults: boolean("show_results").notNull().default(true),
    showAnswers: boolean("show_answers").notNull().default(false),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("exams_slug_idx").on(table.slug),
    index("exams_status_idx").on(table.status),
    index("exams_subject_idx").on(table.subject),
    index("exams_created_by_idx").on(table.createdBy),
    index("exams_start_date_idx").on(table.startDate),
  ]
);

// ─── Exam Sections ───────────────────────────────────────────
export const examSections = pgTable(
  "exam_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    order: integer("order").notNull().default(0),
    marksPerQuestion: real("marks_per_question"),
    negativeMarks: real("negative_marks").default(0),
    timeLimitMinutes: integer("time_limit_minutes"),
    isMandatory: boolean("is_mandatory").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("exam_sections_exam_id_idx").on(table.examId)]
);

// ─── Questions Table ─────────────────────────────────────────
export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id").references(() => exams.id, {
      onDelete: "cascade",
    }),
    sectionId: uuid("section_id").references(() => examSections.id, {
      onDelete: "set null",
    }),
    type: questionTypeEnum("type").notNull().default("mcq"),
    text: text("text").notNull(),
    explanation: text("explanation"),
    marks: real("marks").notNull().default(1),
    negativeMarks: real("negative_marks").notNull().default(0),
    difficulty: difficultyLevelEnum("difficulty").notNull().default("medium"),
    tags: text("tags")
      .array()
      .notNull()
      .default([]),
    order: integer("order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    // For fill in the blank
    correctAnswer: text("correct_answer"),
    // For question bank (questions without examId)
    isQuestionBank: boolean("is_question_bank").notNull().default(false),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("questions_exam_id_idx").on(table.examId),
    index("questions_section_id_idx").on(table.sectionId),
    index("questions_type_idx").on(table.type),
    index("questions_difficulty_idx").on(table.difficulty),
    index("questions_is_question_bank_idx").on(table.isQuestionBank),
  ]
);

// ─── Question Options ────────────────────────────────────────
export const questionOptions = pgTable(
  "question_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    order: integer("order").notNull().default(0),
  },
  (table) => [
    index("question_options_question_id_idx").on(table.questionId),
  ]
);

// ─── Question Bank Categories ────────────────────────────────
export const questionBankCategories = pgTable(
  "question_bank_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("qb_categories_parent_id_idx").on(table.parentId),
  ]
);

// ─── Question Bank Items (junction) ─────────────────────────
export const questionBankItems = pgTable(
  "question_bank_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => questionBankCategories.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("qb_items_category_id_idx").on(table.categoryId),
    index("qb_items_question_id_idx").on(table.questionId),
  ]
);

// ─── Relations ───────────────────────────────────────────────
export const examsRelations = relations(exams, ({ one, many }) => ({
  creator: one(users, {
    fields: [exams.createdBy],
    references: [users.id],
  }),
  sections: many(examSections),
  questions: many(questions),
}));

export const examSectionsRelations = relations(
  examSections,
  ({ one, many }) => ({
    exam: one(exams, {
      fields: [examSections.examId],
      references: [exams.id],
    }),
    questions: many(questions),
  })
);

export const questionsRelations = relations(questions, ({ one, many }) => ({
  exam: one(exams, {
    fields: [questions.examId],
    references: [exams.id],
  }),
  section: one(examSections, {
    fields: [questions.sectionId],
    references: [examSections.id],
  }),
  options: many(questionOptions),
  creator: one(users, {
    fields: [questions.createdBy],
    references: [users.id],
  }),
  bankItems: many(questionBankItems),
}));

export const questionOptionsRelations = relations(
  questionOptions,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionOptions.questionId],
      references: [questions.id],
    }),
  })
);

export const questionBankCategoriesRelations = relations(
  questionBankCategories,
  ({ many }) => ({
    items: many(questionBankItems),
  })
);

export const questionBankItemsRelations = relations(
  questionBankItems,
  ({ one }) => ({
    category: one(questionBankCategories, {
      fields: [questionBankItems.categoryId],
      references: [questionBankCategories.id],
    }),
    question: one(questions, {
      fields: [questionBankItems.questionId],
      references: [questions.id],
    }),
  })
);
