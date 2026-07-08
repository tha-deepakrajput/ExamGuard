import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  violationTypeEnum,
  violationSeverityEnum,
  proctoringStatusEnum,
  mediaCaptureTypeEnum,
} from "./enums";
import { examAttempts } from "./attempts";

// ─── Proctoring Sessions ─────────────────────────────────────
export const proctoringSessions = pgTable(
  "proctoring_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => examAttempts.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    cameraEnabled: boolean("camera_enabled").notNull().default(false),
    totalViolations: integer("total_violations").notNull().default(0),
    status: proctoringStatusEnum("status").notNull().default("active"),
  },
  (table) => [
    index("proctoring_sessions_attempt_id_idx").on(table.attemptId),
    index("proctoring_sessions_status_idx").on(table.status),
  ]
);

// ─── Proctoring Violations ──────────────────────────────────
export const proctoringViolations = pgTable(
  "proctoring_violations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => proctoringSessions.id, { onDelete: "cascade" }),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => examAttempts.id, { onDelete: "cascade" }),
    type: violationTypeEnum("type").notNull(),
    severity: violationSeverityEnum("severity").notNull().default("medium"),
    description: text("description"),
    screenshotUrl: text("screenshot_url"),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("proctoring_violations_session_id_idx").on(table.sessionId),
    index("proctoring_violations_attempt_id_idx").on(table.attemptId),
    index("proctoring_violations_type_idx").on(table.type),
    index("proctoring_violations_severity_idx").on(table.severity),
  ]
);

// ─── Media Captures ─────────────────────────────────────────
export const mediaCaptures = pgTable(
  "media_captures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => proctoringSessions.id, { onDelete: "cascade" }),
    type: mediaCaptureTypeEnum("type").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("media_captures_session_id_idx").on(table.sessionId),
    index("media_captures_type_idx").on(table.type),
  ]
);

// ─── Relations ───────────────────────────────────────────────
export const proctoringSessionsRelations = relations(
  proctoringSessions,
  ({ one, many }) => ({
    attempt: one(examAttempts, {
      fields: [proctoringSessions.attemptId],
      references: [examAttempts.id],
    }),
    violations: many(proctoringViolations),
    mediaCaptures: many(mediaCaptures),
  })
);

export const proctoringViolationsRelations = relations(
  proctoringViolations,
  ({ one }) => ({
    session: one(proctoringSessions, {
      fields: [proctoringViolations.sessionId],
      references: [proctoringSessions.id],
    }),
    attempt: one(examAttempts, {
      fields: [proctoringViolations.attemptId],
      references: [examAttempts.id],
    }),
  })
);

export const mediaCapturesRelations = relations(
  mediaCaptures,
  ({ one }) => ({
    session: one(proctoringSessions, {
      fields: [mediaCaptures.sessionId],
      references: [proctoringSessions.id],
    }),
  })
);
