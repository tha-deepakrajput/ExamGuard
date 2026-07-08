"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  Target,
  Timer,
  FileText,
  Download,
  Trophy,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Fallback mock data ────────────────────────────────────────
const mockResult = {
  attempt: {
    id: "r1",
    status: "graded",
    startedAt: "2025-06-05T14:00:00Z",
    submittedAt: "2025-06-05T15:45:00Z",
    autoSubmitted: false,
    totalScore: 96,
    totalMarks: 100,
    percentage: 96,
    isPassed: true,
    timeSpentSeconds: 6300,
  },
  exam: {
    id: "1",
    title: "Data Structures & Algorithms",
    subject: "Computer Science",
    totalMarks: 100,
    passingPercentage: 35,
    showAnswers: true,
  },
  questions: [
    { id: "1", text: "What is the time complexity of binary search?", type: "mcq", marks: 2, negativeMarks: 0.5, explanation: null, correctAnswer: null, options: [{ id: "o1", text: "O(n)", isCorrect: false }, { id: "o2", text: "O(log n)", isCorrect: true }, { id: "o3", text: "O(n²)", isCorrect: false }, { id: "o4", text: "O(1)", isCorrect: false }], studentAnswer: { selectedOptionId: "o2", isCorrect: true, marksAwarded: 2 } },
    { id: "2", text: "Which data structure uses LIFO principle?", type: "mcq", marks: 2, negativeMarks: 0.5, explanation: null, correctAnswer: null, options: [{ id: "o1", text: "Queue", isCorrect: false }, { id: "o2", text: "Stack", isCorrect: true }, { id: "o3", text: "Array", isCorrect: false }, { id: "o4", text: "Linked List", isCorrect: false }], studentAnswer: { selectedOptionId: "o2", isCorrect: true, marksAwarded: 2 } },
    { id: "3", text: "What is the worst case of QuickSort?", type: "mcq", marks: 2, negativeMarks: 0.5, explanation: null, correctAnswer: null, options: [{ id: "o1", text: "O(n log n)", isCorrect: false }, { id: "o2", text: "O(n²)", isCorrect: true }, { id: "o3", text: "O(n)", isCorrect: false }, { id: "o4", text: "O(log n)", isCorrect: false }], studentAnswer: { selectedOptionId: "o2", isCorrect: true, marksAwarded: 2 } },
    { id: "4", text: "A binary tree can have at most 2 children.", type: "true_false", marks: 1, negativeMarks: 0.25, explanation: null, correctAnswer: null, options: [{ id: "o1", text: "True", isCorrect: true }, { id: "o2", text: "False", isCorrect: false }], studentAnswer: { selectedOptionId: "o1", isCorrect: true, marksAwarded: 1 } },
    { id: "5", text: "Which is NOT a stable sorting algorithm?", type: "mcq", marks: 2, negativeMarks: 0.5, explanation: null, correctAnswer: null, options: [{ id: "o1", text: "Merge Sort", isCorrect: false }, { id: "o2", text: "Bubble Sort", isCorrect: false }, { id: "o3", text: "Quick Sort", isCorrect: true }, { id: "o4", text: "Insertion Sort", isCorrect: false }], studentAnswer: { selectedOptionId: "o1", isCorrect: false, marksAwarded: -0.5 } },
  ],
  summary: { totalQuestions: 40, answered: 40, correct: 38, wrong: 2, unanswered: 0 },
  proctoring: { totalViolations: 0, violations: [] },
};

// ─── Types ──────────────────────────────────────────────────────

interface ResultData {
  attempt: {
    id: string;
    status: string;
    startedAt: string;
    submittedAt: string | null;
    autoSubmitted: boolean;
    totalScore: number | null;
    totalMarks: number | null;
    percentage: number | null;
    isPassed: boolean | null;
    timeSpentSeconds: number | null;
  };
  exam: {
    id: string;
    title: string;
    subject: string;
    totalMarks: number;
    passingPercentage: number;
    showAnswers: boolean;
  };
  questions?: {
    id: string;
    text: string;
    type: string;
    marks: number;
    negativeMarks: number;
    explanation: string | null;
    correctAnswer: string | null;
    options: { id: string; text: string; isCorrect?: boolean }[];
    studentAnswer: {
      selectedOptionId?: string | null;
      selectedOptionIds?: string[] | null;
      textAnswer?: string | null;
      isCorrect: boolean | null;
      marksAwarded: number | null;
    } | null;
  }[];
  summary: {
    totalQuestions: number;
    answered: number;
    correct: number;
    wrong: number;
    unanswered: number;
  };
  proctoring: {
    totalViolations: number;
    violations: {
      type: string;
      severity: string;
      description: string | null;
      timestamp: string;
    }[];
  };
}

const statusConfig = {
  correct: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Correct" },
  wrong: { icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10", label: "Wrong" },
  partial: { icon: MinusCircle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Partial" },
  unanswered: { icon: MinusCircle, color: "text-zinc-400", bg: "bg-zinc-500/10", label: "Unanswered" },
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/attempts/${id}/results`);
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        } else {
          // Fall back to mock data
          setResult(mockResult as unknown as ResultData);
        }
      } catch {
        setResult(mockResult as unknown as ResultData);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { attempt, exam, summary, proctoring } = result;
  const isPassed = attempt.isPassed ?? false;
  const percentage = attempt.percentage ?? 0;
  const score = attempt.totalScore ?? 0;
  const totalMarks = attempt.totalMarks ?? exam.totalMarks;
  const timeSpent = attempt.timeSpentSeconds ? formatDuration(attempt.timeSpentSeconds) : "N/A";
  const submittedDate = attempt.submittedAt
    ? new Date(attempt.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "N/A";

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.title}
        description={`${exam.subject} • ${submittedDate}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Results", href: "/student/results" },
          { label: exam.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/student/results">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("PDF download coming soon!")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        }
      />

      {/* Score Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(
          "border-border/50 overflow-hidden",
          isPassed ? "border-emerald-500/20" : "border-rose-500/20"
        )}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Big Score Circle */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted/20"
                  />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isPassed ? "oklch(0.72 0.19 155)" : "oklch(0.65 0.22 15)"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 100" }}
                    animate={{ strokeDasharray: `${percentage} 100` }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{Math.round(percentage)}%</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "mt-1 text-xs",
                      isPassed
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {isPassed ? "Passed" : "Failed"}
                  </Badge>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                {[
                  { icon: Target, label: "Score", value: `${score}/${totalMarks}`, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { icon: CheckCircle2, label: "Correct", value: `${summary.correct}/${summary.totalQuestions}`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { icon: Timer, label: "Time Spent", value: timeSpent, color: "text-violet-500", bg: "bg-violet-500/10" },
                  { icon: ShieldAlert, label: "Violations", value: `${proctoring.totalViolations}`, color: proctoring.totalViolations > 0 ? "text-red-500" : "text-emerald-500", bg: proctoring.totalViolations > 0 ? "bg-red-500/10" : "bg-emerald-500/10" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <div className={cn("w-9 h-9 rounded-lg mx-auto mb-1.5 flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-4.5 h-4.5", stat.color)} />
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-bold mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Auto-submit warning */}
      {attempt.autoSubmitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              This exam was auto-submitted due to {proctoring.totalViolations > 0 ? "proctoring violations" : "time expiry"}.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Answer Breakdown */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Answer Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Summary Bar */}
              <div className="flex items-center gap-1 h-4 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-emerald-500 rounded-l-full"
                  style={{ width: `${(summary.correct / summary.totalQuestions) * 100}%` }}
                />
                <div
                  className="h-full bg-rose-500"
                  style={{ width: `${(summary.wrong / summary.totalQuestions) * 100}%` }}
                />
                {summary.unanswered > 0 && (
                  <div
                    className="h-full bg-zinc-300 dark:bg-zinc-600 rounded-r-full"
                    style={{ width: `${(summary.unanswered / summary.totalQuestions) * 100}%` }}
                  />
                )}
              </div>
              <div className="flex items-center gap-6 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span>Correct ({summary.correct})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-rose-500" />
                  <span>Wrong ({summary.wrong})</span>
                </div>
                {summary.unanswered > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-zinc-300 dark:bg-zinc-600" />
                    <span>Unanswered ({summary.unanswered})</span>
                  </div>
                )}
              </div>

              {/* Question List */}
              <div className="space-y-2">
                {(result.questions || []).map((q, idx) => {
                  const qStatus = !q.studentAnswer
                    ? "unanswered"
                    : q.studentAnswer.isCorrect
                    ? "correct"
                    : "wrong";
                  const cfg = statusConfig[qStatus as keyof typeof statusConfig];
                  const awarded = q.studentAnswer?.marksAwarded ?? 0;

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        qStatus === "correct" ? "border-emerald-500/20 bg-emerald-500/5" :
                        qStatus === "wrong" ? "border-rose-500/20 bg-rose-500/5" :
                        "border-border/50 bg-muted/30"
                      )}
                    >
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0", cfg.bg)}>
                        <cfg.icon className={cn("w-4 h-4", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          <span className="text-muted-foreground mr-1">Q{idx + 1}.</span>
                          {q.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{q.type.replace("_", " ")}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold">{awarded}/{q.marks}</p>
                        <p className="text-[10px] text-muted-foreground">marks</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Proctoring Summary */}
          {proctoring.totalViolations > 0 && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  Proctoring Violations ({proctoring.totalViolations})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {proctoring.violations.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10"
                  >
                    <AlertTriangle className={cn(
                      "w-4 h-4 flex-shrink-0",
                      v.severity === "critical" ? "text-red-500" :
                      v.severity === "high" ? "text-orange-500" :
                      "text-amber-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium capitalize">
                        {v.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(v.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[10px] h-5",
                      v.severity === "critical" ? "border-red-500/30 text-red-500" :
                      v.severity === "high" ? "border-orange-500/30 text-orange-500" :
                      "border-amber-500/30 text-amber-500"
                    )}>
                      {v.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Exam Details */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Date", value: submittedDate },
                { label: "Time Taken", value: timeSpent },
                { label: "Passing Score", value: `${exam.passingPercentage}%` },
                { label: "Total Questions", value: `${summary.totalQuestions}` },
                { label: "Answered", value: `${summary.answered}` },
                { label: "Status", value: attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <Link href="/student/exams" className="w-full">
                <Button className="w-full gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  Browse More Exams
                </Button>
              </Link>
              <Link href="/student/dashboard" className="w-full">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
