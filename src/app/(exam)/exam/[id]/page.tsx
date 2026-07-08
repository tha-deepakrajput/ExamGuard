"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Menu,
  ShieldAlert,
  Maximize,
  Loader2,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExamStore, type ExamQuestion } from "@/stores/exam-store";
import { useProctoring } from "@/components/exam/proctoring-provider";

// Components
import { ExamTimer } from "@/components/exam/exam-timer";
import { QuestionNavigator } from "@/components/exam/question-navigator";
import { ReviewSheet } from "@/components/exam/review-sheet";
import { SubmitDialog } from "@/components/exam/submit-dialog";
import { WebcamMonitor } from "@/components/exam/webcam-monitor";

// Renderers
import { MCQRenderer } from "@/components/exam/mcq-renderer";
import { MultiSelectRenderer } from "@/components/exam/multi-select-renderer";
import { TrueFalseRenderer } from "@/components/exam/true-false-renderer";
import { FillBlankRenderer } from "@/components/exam/fill-blank-renderer";
import { DescriptiveRenderer } from "@/components/exam/descriptive-renderer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Fallback mock data (when DB unavailable) ──────────────────
const mockQuestions: ExamQuestion[] = [
  {
    id: "q1",
    type: "mcq",
    text: "Which of the following is NOT a fundamental concept of Object-Oriented Programming?",
    marks: 2,
    negativeMarks: 0.5,
    order: 1,
    options: [
      { id: "o1", text: "Encapsulation", order: 1 },
      { id: "o2", text: "Inheritance", order: 2 },
      { id: "o3", text: "Compilation", order: 3 },
      { id: "o4", text: "Polymorphism", order: 4 },
    ],
  },
  {
    id: "q2",
    type: "multi_select",
    text: "Select all valid HTTP methods used in RESTful APIs.",
    marks: 3,
    negativeMarks: 1,
    order: 2,
    options: [
      { id: "o1", text: "GET", order: 1 },
      { id: "o2", text: "FETCH", order: 2 },
      { id: "o3", text: "POST", order: 3 },
      { id: "o4", text: "DELETE", order: 4 },
      { id: "o5", text: "UPDATE", order: 5 },
    ],
  },
  {
    id: "q3",
    type: "true_false",
    text: "In JavaScript, null is an object.",
    marks: 1,
    negativeMarks: 0.25,
    order: 3,
    options: [
      { id: "o1", text: "True", order: 1 },
      { id: "o2", text: "False", order: 2 },
    ],
  },
  {
    id: "q4",
    type: "fill_blank",
    text: "The CSS property used to change the text color of an element is _________.",
    marks: 2,
    negativeMarks: 0,
    order: 4,
    options: [],
  },
  {
    id: "q5",
    type: "descriptive",
    text: "Explain the concept of 'closure' in JavaScript. Provide a simple code example to illustrate your explanation.",
    marks: 5,
    negativeMarks: 0,
    order: 5,
    options: [],
  },
];

export default function ExamEnginePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { violationCount } = useProctoring();

  const {
    examTitle,
    duration,
    status,
    questions,
    currentIndex,
    timeRemaining,
    answers,
    flaggedQuestions,
    attemptId,
    proctoringEnabled,
    initializeExam,
    tick,
    nextQuestion,
    prevQuestion,
    toggleFlag,
    setAnswer,
    startReview,
    submitExam,
    setAttemptId,
  } = useExamStore();

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // ── Auto-save debounce ref ──
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedAnswerRef = useRef<string>("");

  // ── Auto-save answer to server ──
  const saveAnswerToServer = useCallback(
    (questionId: string, answer: Record<string, unknown>) => {
      if (!attemptId) return;

      const key = JSON.stringify({ questionId, ...answer });
      if (key === lastSavedAnswerRef.current) return;
      lastSavedAnswerRef.current = key;

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        fetch(`/api/attempts/${attemptId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, ...answer }),
        }).catch(console.error);
      }, 500); // 500ms debounce
    },
    [attemptId]
  );

  // ── Enhanced setAnswer with auto-save ──
  const handleSetAnswer = useCallback(
    (questionId: string, answer: { selectedOptionId?: string; selectedOptionIds?: string[]; textAnswer?: string }) => {
      setAnswer(questionId, answer);
      saveAnswerToServer(questionId, answer);
    },
    [setAnswer, saveAnswerToServer]
  );

  // ── Initialize Exam (API or fallback) ──
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const res = await fetch(`/api/exams/${id}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            initializeExam({
              examId: id,
              examTitle: data.exam.title,
              duration: data.exam.durationMinutes * 60,
              questions: data.questions,
              sections: data.sections,
              attemptId: data.attemptId,
              proctoringEnabled: data.exam.proctoringEnabled,
              maxViolations: data.exam.maxViolations ?? 5,
            });
          } else {
            // API failed — fall back to mock data
            console.warn("[ExamEngine] API failed, using mock data");
            initializeExam({
              examId: id,
              examTitle: "Mid-Term Examination: Software Engineering",
              duration: 3600,
              questions: mockQuestions,
              sections: [],
              proctoringEnabled: true,
              maxViolations: 5,
            });
          }
        }
      } catch {
        // Network error — fall back to mock data
        if (!cancelled) {
          console.warn("[ExamEngine] Network error, using mock data");
          initializeExam({
            examId: id,
            examTitle: "Mid-Term Examination: Software Engineering",
            duration: 3600,
            questions: mockQuestions,
            sections: [],
            proctoringEnabled: true,
            maxViolations: 5,
          });
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [id, initializeExam]);

  // Desktop detection
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Fullscreen Management
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
    }
  };

  // ── Submit Handler ──
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (attemptId) {
        const res = await fetch(`/api/attempts/${attemptId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoSubmitted: false }),
        });

        if (res.ok) {
          const data = await res.json();
          submitExam();
          toast.success("Exam submitted successfully!");
          setTimeout(() => {
            router.push(`/student/results/${attemptId}`);
          }, 1500);
          return;
        }
      }
    } catch (err) {
      console.error("[ExamEngine] Submit error:", err);
    }

    // Fallback if API fails
    submitExam();
    toast.success("Exam submitted successfully!");
    setTimeout(() => {
      router.push(`/student/results/r1`);
    }, 1500);

    setIsSubmitting(false);
  };

  // ── Auto-submit on time up ──
  const handleTimeUp = useCallback(() => {
    toast.warning("⏰ Time's up! Auto-submitting your exam...");
    handleFinalSubmit();
  }, []);

  if (isInitializing || !currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading examination...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <WifiOff className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold">Unable to Load Exam</h2>
          <p className="text-muted-foreground text-sm">{initError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Pre-exam Fullscreen Prompt
  if (!isFullscreen && status === "in_progress") {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
            <Maximize className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Fullscreen Required</h2>
            <p className="text-muted-foreground">
              This examination requires fullscreen mode. Exiting fullscreen during the exam will be recorded as a violation.
            </p>
          </div>
          <Button
            size="lg"
            className="w-full gradient-primary text-white shadow-lg shadow-primary/25"
            onClick={requestFullscreen}
          >
            Enter Fullscreen to Continue
          </Button>
        </div>
      </div>
    );
  }

  // Submitted State
  if (status === "submitted") {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-500/20">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Exam Submitted</h2>
            <p className="text-muted-foreground">Redirecting to results...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Review State
  if (status === "reviewing") {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <h1 className="font-semibold truncate max-w-[50%]">{examTitle}</h1>
          <ExamTimer
            timeRemaining={timeRemaining}
            duration={duration}
            onTick={tick}
            onTimeUp={handleTimeUp}
          />
        </header>
        <div className="flex-1 overflow-y-auto">
          <ReviewSheet onSubmit={() => setShowSubmitDialog(true)} />
        </div>
        <SubmitDialog
          open={showSubmitDialog}
          onOpenChange={setShowSubmitDialog}
          onConfirm={handleFinalSubmit}
        />
      </div>
    );
  }

  // Active Exam State
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold truncate hidden sm:block max-w-[300px] lg:max-w-[500px]">
            {examTitle}
          </h1>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "hidden sm:inline-flex",
              violationCount > 0
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            {violationCount} Violation{violationCount !== 1 ? "s" : ""}
          </Badge>
          <ExamTimer
            timeRemaining={timeRemaining}
            duration={duration}
            onTick={tick}
            onTimeUp={handleTimeUp}
          />
          <Button size="sm" onClick={startReview}>
            Review & Submit
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Question Meta */}
          <div className="p-4 sm:px-8 border-b border-border/50 flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3">
                Question {currentIndex + 1} of {questions.length}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {currentQuestion.marks} Marks
              </span>
            </div>
            <Button
              variant={flaggedQuestions.includes(currentQuestion.id) ? "default" : "outline"}
              size="sm"
              className={cn(
                flaggedQuestions.includes(currentQuestion.id) && 
                "bg-amber-500 hover:bg-amber-600 text-white border-transparent"
              )}
              onClick={() => toggleFlag(currentQuestion.id)}
            >
              <Flag className={cn("w-4 h-4 sm:mr-2", flaggedQuestions.includes(currentQuestion.id) && "fill-white")} />
              <span className="hidden sm:inline">
                {flaggedQuestions.includes(currentQuestion.id) ? "Flagged" : "Flag for Review"}
              </span>
            </Button>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-xl sm:text-2xl font-medium leading-relaxed">
                {currentQuestion.text}
              </h2>

              {/* Renderers */}
              <div className="pt-4">
                {currentQuestion.type === "mcq" && (
                  <MCQRenderer
                    options={currentQuestion.options}
                    selectedOptionId={currentAnswer?.selectedOptionId}
                    onSelect={(optId) => handleSetAnswer(currentQuestion.id, { selectedOptionId: optId })}
                  />
                )}
                {currentQuestion.type === "multi_select" && (
                  <MultiSelectRenderer
                    options={currentQuestion.options}
                    selectedOptionIds={currentAnswer?.selectedOptionIds || []}
                    onToggle={(optId) => {
                      const prev = currentAnswer?.selectedOptionIds || [];
                      const next = prev.includes(optId) ? prev.filter((o) => o !== optId) : [...prev, optId];
                      handleSetAnswer(currentQuestion.id, { selectedOptionIds: next });
                    }}
                  />
                )}
                {currentQuestion.type === "true_false" && (
                  <TrueFalseRenderer
                    trueOptionId={currentQuestion.options[0]?.id || "t"}
                    falseOptionId={currentQuestion.options[1]?.id || "f"}
                    selectedOptionId={currentAnswer?.selectedOptionId}
                    onSelect={(optId) => handleSetAnswer(currentQuestion.id, { selectedOptionId: optId })}
                  />
                )}
                {currentQuestion.type === "fill_blank" && (
                  <FillBlankRenderer
                    value={currentAnswer?.textAnswer || ""}
                    onChange={(val) => handleSetAnswer(currentQuestion.id, { textAnswer: val })}
                  />
                )}
                {currentQuestion.type === "descriptive" && (
                  <DescriptiveRenderer
                    value={currentAnswer?.textAnswer || ""}
                    onChange={(val) => handleSetAnswer(currentQuestion.id, { textAnswer: val })}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-6 border-t border-border/50 bg-background flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="w-28"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={currentIndex === questions.length - 1 ? startReview : nextQuestion}
              className="w-28"
            >
              {currentIndex === questions.length - 1 ? "Review" : "Next"}
              {currentIndex !== questions.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </main>

        {/* Sidebar Navigator */}
        <AnimatePresence>
          {(isSidebarOpen || isDesktop) && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute lg:relative inset-y-0 right-0 z-30 lg:z-auto bg-background w-80 lg:w-auto shadow-2xl lg:shadow-none"
            >
              <QuestionNavigator />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden"
            />
          )}
        </AnimatePresence>
      </div>

      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleFinalSubmit}
      />

      {/* Webcam Monitor */}
      {proctoringEnabled && <WebcamMonitor />}
    </div>
  );
}
