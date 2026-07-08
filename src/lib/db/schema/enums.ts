import { pgEnum } from "drizzle-orm/pg-core";

// ─── User Enums ───────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "student",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
  "pending_verification",
]);

// ─── Exam Enums ───────────────────────────────────────────────
export const examStatusEnum = pgEnum("exam_status", [
  "draft",
  "published",
  "active",
  "completed",
  "archived",
]);

// ─── Question Enums ──────────────────────────────────────────
export const questionTypeEnum = pgEnum("question_type", [
  "mcq",
  "multi_select",
  "true_false",
  "fill_blank",
  "descriptive",
]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "easy",
  "medium",
  "hard",
]);

// ─── Attempt Enums ───────────────────────────────────────────
export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "submitted",
  "graded",
  "terminated",
  "expired",
]);

// ─── Proctoring Enums ────────────────────────────────────────
export const violationTypeEnum = pgEnum("violation_type", [
  "no_face",
  "multiple_faces",
  "face_away",
  "tab_switch",
  "window_minimize",
  "dev_tools",
  "copy_attempt",
  "paste_attempt",
  "right_click",
  "keyboard_shortcut",
  "screen_share",
  "fullscreen_exit",
  "browser_resize",
]);

export const violationSeverityEnum = pgEnum("violation_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const proctoringStatusEnum = pgEnum("proctoring_status", [
  "active",
  "paused",
  "ended",
  "terminated",
]);

// ─── Media Enums ─────────────────────────────────────────────
export const mediaCaptureTypeEnum = pgEnum("media_capture_type", [
  "webcam_snapshot",
  "screenshot",
  "video_clip",
]);

// ─── Notification Enums ──────────────────────────────────────
export const notificationTypeEnum = pgEnum("notification_type", [
  "exam_reminder",
  "exam_result",
  "violation_alert",
  "account_update",
  "system",
]);

// ─── Verification Token Type ─────────────────────────────────
export const tokenTypeEnum = pgEnum("token_type", [
  "email_verification",
  "password_reset",
]);
