// ─── Application Constants ──────────────────────────────────

export const APP_NAME = "ExamGuard";
export const APP_DESCRIPTION =
  "AI-Powered Online Examination Platform with intelligent proctoring";

// ─── Role Labels ────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  student: "Student",
};

// ─── Status Labels & Colors ─────────────────────────────────

export const EXAM_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  draft: {
    label: "Draft",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  published: {
    label: "Published",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  active: {
    label: "Active",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
  },
  completed: {
    label: "Completed",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950",
  },
  archived: {
    label: "Archived",
    color: "text-gray-500 dark:text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
};

export const USER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  active: {
    label: "Active",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
  },
  inactive: {
    label: "Inactive",
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  suspended: {
    label: "Suspended",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  pending_verification: {
    label: "Pending",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
  },
};

export const VIOLATION_SEVERITY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  low: {
    label: "Low",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950",
  },
  high: {
    label: "High",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
  critical: {
    label: "Critical",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
};

// ─── Difficulty Labels ──────────────────────────────────────

export const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  easy: {
    label: "Easy",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950",
  },
  hard: {
    label: "Hard",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
};

// ─── Question Type Labels ───────────────────────────────────

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  mcq: "Multiple Choice",
  multi_select: "Multiple Select",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
  descriptive: "Descriptive",
};

// ─── Pagination ─────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ─── Proctoring ─────────────────────────────────────────────

export const PROCTORING_SNAPSHOT_INTERVAL = 30000; // 30 seconds
export const FACE_DETECTION_INTERVAL = 2000; // 2 seconds
export const MAX_WARNINGS_BEFORE_ALERT = 3;

// ─── Violation Type Labels ──────────────────────────────────

export const VIOLATION_TYPE_LABELS: Record<string, string> = {
  no_face: "No Face Detected",
  multiple_faces: "Multiple Faces",
  face_away: "Face Moved Away",
  tab_switch: "Tab Switched",
  window_minimize: "Window Minimized",
  dev_tools: "Developer Tools",
  copy_attempt: "Copy Attempt",
  paste_attempt: "Paste Attempt",
  right_click: "Right Click",
  keyboard_shortcut: "Keyboard Shortcut",
  screen_share: "Screen Share",
  fullscreen_exit: "Fullscreen Exit",
  browser_resize: "Browser Resize",
};
