"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy,
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  BarChart3,
  ChevronRight,
  Award,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const results = [
  { id: "r1", title: "Data Structures & Algorithms", subject: "Computer Science", date: "Jun 5, 2025", score: 96, total: 100, status: "passed" as const },
  { id: "r2", title: "Operating Systems - Mid Term", subject: "Computer Science", date: "Jun 2, 2025", score: 78, total: 100, status: "passed" as const },
  { id: "r3", title: "Database Management Systems", subject: "Computer Science", date: "May 28, 2025", score: 85, total: 100, status: "passed" as const },
  { id: "r4", title: "Computer Networks - Quiz 1", subject: "Computer Science", date: "May 20, 2025", score: 18, total: 25, status: "passed" as const },
  { id: "r5", title: "Software Engineering - Final", subject: "Computer Science", date: "May 15, 2025", score: 68, total: 100, status: "passed" as const },
  { id: "r6", title: "Advanced Mathematics - Unit Test 2", subject: "Mathematics", date: "May 10, 2025", score: 22, total: 50, status: "passed" as const },
  { id: "r7", title: "Physics - Unit Test 2", subject: "Physics", date: "May 5, 2025", score: 15, total: 50, status: "failed" as const },
  { id: "r8", title: "English Literature - Quiz", subject: "English", date: "Apr 28, 2025", score: 20, total: 25, status: "passed" as const },
  { id: "r9", title: "Chemistry - Mid Term", subject: "Chemistry", date: "Apr 20, 2025", score: 28, total: 75, status: "failed" as const },
];

const subjectPerformance = [
  { subject: "Computer Science", exams: 5, avgScore: 84, best: 96 },
  { subject: "Mathematics", exams: 1, avgScore: 44, best: 44 },
  { subject: "English", exams: 1, avgScore: 80, best: 80 },
  { subject: "Physics", exams: 1, avgScore: 30, best: 30 },
  { subject: "Chemistry", exams: 1, avgScore: 37, best: 37 },
];

export default function StudentResultsPage() {
  const passRate = Math.round(
    (results.filter((r) => r.status === "passed").length / results.length) * 100
  );
  const avgScore = Math.round(
    results.reduce((a, r) => a + (r.score / r.total) * 100, 0) / results.length
  );
  const bestScore = Math.max(...results.map((r) => (r.score / r.total) * 100));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Results"
        description="Track your exam performance and progress"
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Results" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("PDF export will be available in Phase 10")}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Exams" value={results.length} icon={FileText} gradient="from-blue-500 to-indigo-600" bgGlow="bg-blue-500/10" delay={0} />
        <StatCard title="Pass Rate" value={`${passRate}%`} icon={CheckCircle2} gradient="from-emerald-500 to-teal-600" bgGlow="bg-emerald-500/10" delay={0.1} />
        <StatCard title="Avg Score" value={`${avgScore}%`} icon={TrendingUp} gradient="from-violet-500 to-purple-600" bgGlow="bg-violet-500/10" delay={0.2} />
        <StatCard title="Best Score" value={`${Math.round(bestScore)}%`} icon={Trophy} gradient="from-amber-500 to-orange-600" bgGlow="bg-amber-500/10" delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Result Cards */}
        <motion.div
          className="lg:col-span-2 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-base font-semibold">Recent Results</h2>
          {results.map((result, i) => {
            const percentage = Math.round((result.score / result.total) * 100);
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
              >
                <Link href={`/student/results/${result.id}`}>
                  <Card className="border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* Score */}
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="text-muted/30"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={result.status === "passed" ? "oklch(0.72 0.19 155)" : "oklch(0.65 0.22 15)"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={`${percentage} 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">{percentage}%</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {result.subject} • {result.date}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted-foreground">
                            {result.score}/{result.total} marks
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] h-5",
                              result.status === "passed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {result.status === "passed" ? "Passed" : "Failed"}
                          </Badge>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Subject Performance Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectPerformance.map((subject) => (
                <div key={subject.subject}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium truncate">{subject.subject}</span>
                    <span className="text-muted-foreground ml-2">{subject.avgScore}%</span>
                  </div>
                  <Progress
                    value={subject.avgScore}
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{subject.exams} exam{subject.exams > 1 ? "s" : ""}</span>
                    <span>Best: {subject.best}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-28">
                {[
                  { range: "0-40", count: 2 },
                  { range: "41-60", count: 1 },
                  { range: "61-80", count: 3 },
                  { range: "81-100", count: 3 },
                ].map((bucket, i) => {
                  const maxCount = 3;
                  const height = (bucket.count / maxCount) * 100;
                  return (
                    <div key={bucket.range} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                        className={cn(
                          "w-full rounded-t cursor-pointer relative group transition-colors",
                          i === 0 ? "bg-gradient-to-t from-rose-500/60 to-rose-400/30" :
                          i === 1 ? "bg-gradient-to-t from-amber-500/60 to-amber-400/30" :
                          i === 2 ? "bg-gradient-to-t from-blue-500/60 to-blue-400/30" :
                          "bg-gradient-to-t from-emerald-500/60 to-emerald-400/30"
                        )}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border whitespace-nowrap z-10">
                          {bucket.count}
                        </div>
                      </motion.div>
                      <span className="text-[9px] text-muted-foreground">{bucket.range}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
