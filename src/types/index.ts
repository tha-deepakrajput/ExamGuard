// ─── User Types ──────────────────────────────────────────────

export type UserRole = "super_admin" | "admin" | "student";
export type UserStatus = "active" | "inactive" | "suspended" | "pending_verification";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  avatarUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Exam Types ──────────────────────────────────────────────

export type ExamStatus = "draft" | "published" | "active" | "completed" | "archived";
export type QuestionType = "mcq" | "multi_select" | "true_false" | "fill_blank" | "descriptive";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Exam {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  subject?: string | null;
  category?: string | null;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  negativeMarkingPercentage: number;
  startDate?: Date | null;
  endDate?: Date | null;
  status: ExamStatus;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number;
  instructions?: string | null;
  proctoringEnabled: boolean;
  maxViolations: number;
  autoTerminateOnViolations: boolean;
  showResults: boolean;
  showAnswers: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  sections?: ExamSection[];
  questions?: Question[];
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface ExamSection {
  id: string;
  examId: string;
  title: string;
  description?: string | null;
  order: number;
  marksPerQuestion?: number | null;
  negativeMarks?: number | null;
  timeLimitMinutes?: number | null;
  isMandatory: boolean;
}

export interface Question {
  id: string;
  examId?: string | null;
  sectionId?: string | null;
  type: QuestionType;
  text: string;
  explanation?: string | null;
  marks: number;
  negativeMarks: number;
  difficulty: DifficultyLevel;
  tags: string[];
  order: number;
  isActive: boolean;
  correctAnswer?: string | null;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

// ─── Attempt Types ───────────────────────────────────────────

export type AttemptStatus = "in_progress" | "submitted" | "graded" | "terminated" | "expired";

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startedAt: Date;
  submittedAt?: Date | null;
  autoSubmitted: boolean;
  status: AttemptStatus;
  totalScore?: number | null;
  totalMarks?: number | null;
  percentage?: number | null;
  isPassed?: boolean | null;
  timeSpentSeconds: number;
  exam?: Exam;
  student?: User;
  answers?: StudentAnswer[];
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string | null;
  selectedOptionIds?: string[] | null;
  textAnswer?: string | null;
  isCorrect?: boolean | null;
  marksAwarded?: number | null;
  timeSpentSeconds: number;
  flagged: boolean;
  answeredAt?: Date | null;
  question?: Question;
}

// ─── Proctoring Types ────────────────────────────────────────

export type ViolationType =
  | "no_face"
  | "multiple_faces"
  | "face_away"
  | "tab_switch"
  | "window_minimize"
  | "dev_tools"
  | "copy_attempt"
  | "paste_attempt"
  | "right_click"
  | "keyboard_shortcut"
  | "screen_share"
  | "fullscreen_exit"
  | "browser_resize";

export type ViolationSeverity = "low" | "medium" | "high" | "critical";
export type ProctoringStatus = "active" | "paused" | "ended" | "terminated";

export interface ProctoringSession {
  id: string;
  attemptId: string;
  startedAt: Date;
  endedAt?: Date | null;
  cameraEnabled: boolean;
  totalViolations: number;
  status: ProctoringStatus;
  violations?: ProctoringViolation[];
}

export interface ProctoringViolation {
  id: string;
  sessionId: string;
  attemptId: string;
  type: ViolationType;
  severity: ViolationSeverity;
  description?: string | null;
  screenshotUrl?: string | null;
  timestamp: Date;
}

// ─── Notification Types ──────────────────────────────────────

export type NotificationType =
  | "exam_reminder"
  | "exam_result"
  | "violation_alert"
  | "account_update"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
}

// ─── API Response Types ──────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Dashboard Stats ────────────────────────────────────────

export interface AdminDashboardStats {
  totalStudents: number;
  totalExams: number;
  activeExams: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  totalViolations: number;
  recentActivity: ActivityItem[];
}

export interface StudentDashboardStats {
  upcomingExams: number;
  completedExams: number;
  averageScore: number;
  totalAttempts: number;
  bestScore: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

// ─── Navigation Types ────────────────────────────────────────

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  children?: NavItem[];
}
