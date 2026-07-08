"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  History,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Timer,
  Filter,
  Search,
  X,
  TrendingUp,
  Target,
  FileText,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const examHistory = [
  {
    id: "r1",
    examTitle: "Data Structures & Algorithms",
    subject: "Computer Science",
    date: "2025-06-05T14:00:00Z",
    score: 96,
    totalMarks: 100,
    percentage: 96,
    status: "passed" as const,
    timeSpent: "1h 45m",
    durationMinutes: 90,
    questionCount: 40,
    correctAnswers: 38,
    wrongAnswers: 2,
    unanswered: 0,
  },
  {
    id: "r2",
    examTitle: "Operating Systems - Mid Term",
    subject: "Computer Science",
    date: "2025-06-02T10:00:00Z",
    score: 78,
    totalMarks: 100,
    percentage: 78,
    status: "passed" as const,
    timeSpent: "1h 52m",
    durationMinutes: 120,
    questionCount: 50,
    correctAnswers: 35,
    wrongAnswers: 12,
    unanswered: 3,
  },
  {
    id: "r3",
    examTitle: "Database Management Systems",
    subject: "Computer Science",
    date: "2025-05-28T09:00:00Z",
    score: 85,
    totalMarks: 100,
    percentage: 85,
    status: "passed" as const,
    timeSpent: "1h 38m",
    durationMinutes: 120,
    questionCount: 45,
    correctAnswers: 38,
    wrongAnswers: 5,
    unanswered: 2,
  },
  {
    id: "r4",
    examTitle: "Computer Networks - Quiz 1",
    subject: "Computer Science",
    date: "2025-05-20T14:00:00Z",
    score: 18,
    totalMarks: 25,
    percentage: 72,
    status: "passed" as const,
    timeSpent: "22m",
    durationMinutes: 30,
    questionCount: 15,
    correctAnswers: 10,
    wrongAnswers: 4,
    unanswered: 1,
  },
  {
    id: "r5",
    examTitle: "Software Engineering - Final",
    subject: "Computer Science",
    date: "2025-05-15T10:00:00Z",
    score: 68,
    totalMarks: 100,
    percentage: 68,
    status: "passed" as const,
    timeSpent: "1h 55m",
    durationMinutes: 120,
    questionCount: 50,
    correctAnswers: 30,
    wrongAnswers: 15,
    unanswered: 5,
  },
  {
    id: "r6",
    examTitle: "Advanced Mathematics - Unit Test 2",
    subject: "Mathematics",
    date: "2025-05-10T11:00:00Z",
    score: 22,
    totalMarks: 50,
    percentage: 44,
    status: "passed" as const,
    timeSpent: "48m",
    durationMinutes: 60,
    questionCount: 25,
    correctAnswers: 12,
    wrongAnswers: 10,
    unanswered: 3,
  },
  {
    id: "r7",
    examTitle: "Physics - Unit Test 2",
    subject: "Physics",
    date: "2025-05-05T10:00:00Z",
    score: 15,
    totalMarks: 50,
    percentage: 30,
    status: "failed" as const,
    timeSpent: "55m",
    durationMinutes: 60,
    questionCount: 25,
    correctAnswers: 8,
    wrongAnswers: 14,
    unanswered: 3,
  },
  {
    id: "r8",
    examTitle: "English Literature - Quiz",
    subject: "English",
    date: "2025-04-28T14:00:00Z",
    score: 20,
    totalMarks: 25,
    percentage: 80,
    status: "passed" as const,
    timeSpent: "25m",
    durationMinutes: 30,
    questionCount: 15,
    correctAnswers: 12,
    wrongAnswers: 3,
    unanswered: 0,
  },
  {
    id: "r9",
    examTitle: "Chemistry - Mid Term",
    subject: "Chemistry",
    date: "2025-04-20T09:00:00Z",
    score: 28,
    totalMarks: 75,
    percentage: 37,
    status: "failed" as const,
    timeSpent: "1h 20m",
    durationMinutes: 90,
    questionCount: 30,
    correctAnswers: 12,
    wrongAnswers: 15,
    unanswered: 3,
  },
];

type StatusFilter = "all" | "passed" | "failed";

export default function StudentHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [search, setSearch] = useState("");

  const subjects = [...new Set(examHistory.map((e) => e.subject))];

  const filtered = examHistory.filter((exam) => {
    if (statusFilter !== "all" && exam.status !== statusFilter) return false;
    if (subjectFilter !== "all" && exam.subject !== subjectFilter) return false;
    if (search && !exam.examTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: examHistory.length,
    passed: examHistory.filter((e) => e.status === "passed").length,
    failed: examHistory.filter((e) => e.status === "failed").length,
    avgScore: Math.round(
      examHistory.reduce((a, e) => a + e.percentage, 0) / examHistory.length
    ),
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam History"
        description="View all your past examination attempts"
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "History" },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Attempts" value={stats.total} icon={FileText} gradient="from-blue-500 to-indigo-600" bgGlow="bg-blue-500/10" delay={0} />
        <StatCard title="Passed" value={stats.passed} icon={CheckCircle2} gradient="from-emerald-500 to-teal-600" bgGlow="bg-emerald-500/10" delay={0.1} />
        <StatCard title="Failed" value={stats.failed} icon={XCircle} gradient="from-rose-500 to-pink-600" bgGlow="bg-rose-500/10" delay={0.2} />
        <StatCard title="Avg Score" value={`${stats.avgScore}%`} icon={TrendingUp} gradient="from-violet-500 to-purple-600" bgGlow="bg-violet-500/10" delay={0.3} />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Tabs
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="passed">Passed ({stats.passed})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={subjectFilter} onValueChange={(v) => v && setSubjectFilter(v)}>
          <SelectTrigger className="w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams..."
            className="pl-9 pr-9 h-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* History List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {filtered.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
          >
            <Link href={`/student/results/${exam.id}`}>
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Score Circle */}
                    <div className="flex-shrink-0">
                      <div
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold",
                          exam.status === "passed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {exam.percentage}%
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                            {exam.examTitle}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {exam.subject} • {formatDate(exam.date)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "flex-shrink-0",
                            exam.status === "passed"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {exam.status === "passed" ? "Passed" : "Failed"}
                        </Badge>
                      </div>

                      {/* Meta Row */}
                      <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="w-3.5 h-3.5" />
                          {exam.score}/{exam.totalMarks}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Timer className="w-3.5 h-3.5" />
                          {exam.timeSpent}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="w-3.5 h-3.5" />
                          {exam.questionCount} questions
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {exam.correctAnswers} correct
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-rose-600 dark:text-rose-400">
                            {exam.wrongAnswers} wrong
                          </span>
                          {exam.unanswered > 0 && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {exam.unanswered} skipped
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2.5 flex items-center gap-3">
                        <Progress
                          value={exam.percentage}
                          className={cn(
                            "h-1.5 flex-1",
                          )}
                        />
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No exams found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              No exam attempts match the current filters.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
