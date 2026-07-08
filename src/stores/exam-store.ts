import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

// ─── Types ──────────────────────────────────────────────────────

export type QuestionType =
  | "mcq"
  | "multi_select"
  | "true_false"
  | "fill_blank"
  | "descriptive";

export interface ExamOption {
  id: string;
  text: string;
  order: number;
}

export interface ExamQuestion {
  id: string;
  text: string;
  type: QuestionType;
  marks: number;
  negativeMarks: number;
  options: ExamOption[];
  sectionId?: string;
  order: number;
}

export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface Answer {
  questionId: string;
  /** MCQ: single option ID */
  selectedOptionId?: string;
  /** Multi-select: array of option IDs */
  selectedOptionIds?: string[];
  /** Fill-blank / Descriptive: text */
  textAnswer?: string;
  /** True/False: boolean stored as option selection */
  answeredAt: number;
}

export type ExamStatus =
  | "not_started"
  | "in_progress"
  | "reviewing"
  | "submitted";

interface ExamState {
  // Exam metadata
  examId: string;
  examTitle: string;
  duration: number; // total seconds
  totalQuestions: number;

  // Attempt tracking
  attemptId: string;

  // Proctoring
  proctoringEnabled: boolean;
  maxViolations: number;
  violationCount: number;

  // Questions & sections
  questions: ExamQuestion[];
  sections: ExamSection[];

  // Student progress
  currentIndex: number;
  answers: Record<string, Answer>;
  flaggedQuestions: string[];
  visitedQuestions: string[];

  // Timer
  timeRemaining: number; // seconds
  startedAt: number; // Date.now() timestamp

  // Status
  status: ExamStatus;

  // Actions
  initializeExam: (data: {
    examId: string;
    examTitle: string;
    duration: number;
    questions: ExamQuestion[];
    sections: ExamSection[];
    attemptId?: string;
    proctoringEnabled?: boolean;
    maxViolations?: number;
  }) => void;
  setAnswer: (questionId: string, answer: Omit<Answer, "questionId" | "answeredAt">) => void;
  clearAnswer: (questionId: string) => void;
  toggleFlag: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tick: () => void;
  startReview: () => void;
  cancelReview: () => void;
  submitExam: () => void;
  resetExam: () => void;
  setAttemptId: (id: string) => void;
  addViolation: () => number; // returns new count
}

// ─── Store ──────────────────────────────────────────────────────

const initialState = {
  examId: "",
  examTitle: "",
  duration: 0,
  totalQuestions: 0,
  attemptId: "",
  proctoringEnabled: false,
  maxViolations: 5,
  violationCount: 0,
  questions: [] as ExamQuestion[],
  sections: [] as ExamSection[],
  currentIndex: 0,
  answers: {} as Record<string, Answer>,
  flaggedQuestions: [] as string[],
  visitedQuestions: [] as string[],
  timeRemaining: 0,
  startedAt: 0,
  status: "not_started" as ExamStatus,
};

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeExam: (data) => {
        const existing = get();
        // If resuming the same exam, don't reinitialize
        if (existing.examId === data.examId && existing.status === "in_progress") {
          // But update attemptId if provided
          if (data.attemptId && !existing.attemptId) {
            set({ attemptId: data.attemptId });
          }
          return;
        }
        set({
          examId: data.examId,
          examTitle: data.examTitle,
          duration: data.duration,
          totalQuestions: data.questions.length,
          questions: data.questions,
          sections: data.sections,
          attemptId: data.attemptId || "",
          proctoringEnabled: data.proctoringEnabled ?? false,
          maxViolations: data.maxViolations ?? 5,
          violationCount: 0,
          currentIndex: 0,
          answers: {},
          flaggedQuestions: [],
          visitedQuestions: [data.questions[0]?.id || ""],
          timeRemaining: data.duration,
          startedAt: Date.now(),
          status: "in_progress",
        });
      },

      setAnswer: (questionId, answer) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...answer,
              questionId,
              answeredAt: Date.now(),
            },
          },
        }));
      },

      clearAnswer: (questionId) => {
        set((state) => {
          const next = { ...state.answers };
          delete next[questionId];
          return { answers: next };
        });
      },

      toggleFlag: (questionId) => {
        set((state) => {
          const flagged = state.flaggedQuestions.includes(questionId)
            ? state.flaggedQuestions.filter((id) => id !== questionId)
            : [...state.flaggedQuestions, questionId];
          return { flaggedQuestions: flagged };
        });
      },

      goToQuestion: (index) => {
        const { questions } = get();
        if (index < 0 || index >= questions.length) return;
        const qId = questions[index]?.id;
        set((state) => ({
          currentIndex: index,
          visitedQuestions: qId && !state.visitedQuestions.includes(qId)
            ? [...state.visitedQuestions, qId]
            : state.visitedQuestions,
        }));
      },

      nextQuestion: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
          get().goToQuestion(currentIndex + 1);
        }
      },

      prevQuestion: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          get().goToQuestion(currentIndex - 1);
        }
      },

      tick: () => {
        set((state) => {
          const next = Math.max(0, state.timeRemaining - 1);
          return { timeRemaining: next };
        });
      },

      startReview: () => set({ status: "reviewing" }),

      cancelReview: () => set({ status: "in_progress" }),

      submitExam: () => set({ status: "submitted" }),

      resetExam: () => set(initialState),

      setAttemptId: (id) => set({ attemptId: id }),

      addViolation: () => {
        const current = get().violationCount;
        const newCount = current + 1;
        set({ violationCount: newCount });
        return newCount;
      },
    }),
    {
      name: "examguard-exam-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        examId: state.examId,
        examTitle: state.examTitle,
        duration: state.duration,
        totalQuestions: state.totalQuestions,
        attemptId: state.attemptId,
        proctoringEnabled: state.proctoringEnabled,
        maxViolations: state.maxViolations,
        violationCount: state.violationCount,
        questions: state.questions,
        sections: state.sections,
        currentIndex: state.currentIndex,
        answers: state.answers,
        flaggedQuestions: state.flaggedQuestions,
        visitedQuestions: state.visitedQuestions,
        timeRemaining: state.timeRemaining,
        startedAt: state.startedAt,
        status: state.status,
      }),
    }
  )
);

// ─── Selectors ──────────────────────────────────────────────────

export const useCurrentQuestion = () =>
  useExamStore((s) => s.questions[s.currentIndex]);

export const useCurrentAnswer = () =>
  useExamStore((s) => {
    const q = s.questions[s.currentIndex];
    return q ? s.answers[q.id] : undefined;
  });

export const useExamProgress = () =>
  useExamStore(useShallow((s) => ({
    answered: Object.keys(s.answers).length,
    flagged: s.flaggedQuestions.length,
    total: s.totalQuestions,
    unanswered: s.totalQuestions - Object.keys(s.answers).length,
  })));
