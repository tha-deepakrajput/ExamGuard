"use client";

import { useState, useEffect, use, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Eye,
  Shield,
  Calendar,
  Target,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Copy,
  Send,
  XCircle,
  Archive,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────
interface ExamDetail {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  subject: string | null;
  category: string | null;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  negativeMarkingPercentage: number;
  status: "draft" | "published" | "active" | "completed" | "archived";
  startDate: string | null;
  endDate: string | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  proctoringEnabled: boolean;
  maxViolations: number;
  autoTerminateOnViolations: boolean;
  showResults: boolean;
  showAnswers: boolean;
  maxAttempts: number;
  instructions: string | null;
  createdAt: string;
  updatedAt: string;
  // Enriched fields from API
  questionCount: number;
  questionBreakdown: { type: string; count: number }[];
  studentsRegistered: number;
  studentsCompleted: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  createdByName: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
  published: { label: "Published", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  completed: { label: "Completed", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  archived: { label: "Archived", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
};

const questionTypeLabels: Record<string, string> = {
  mcq: "Multiple Choice",
  multi_select: "Multi Select",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
  descriptive: "Descriptive",
};

export default function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "destructive" | "default";
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const fetchExam = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/exams/${id}`);
      if (!res.ok) throw new Error("Failed to fetch exam");
      const data = await res.json();
      setExam(data);
    } catch (error) {
      toast.error("Failed to load exam details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  const updateStatus = async (newStatus: string, successMessage: string) => {
    if (!exam) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }
      toast.success(successMessage);
      await fetchExam();
    } catch (error: any) {
      toast.error(error.message || "Failed to update exam status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePublish = () => {
    if (!exam) return;
    if (exam.questionCount === 0) {
      toast.error("Cannot publish an exam with no questions. Add questions first.");
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Publish Exam",
      description: `Are you sure you want to publish "${exam.title}"? It will become visible to students.`,
      onConfirm: () => {
        updateStatus("published", "Exam published successfully!");
        setConfirmDialog((d) => ({ ...d, open: false }));
      },
    });
  };

  const handleUnpublish = () => {
    if (!exam) return;
    setConfirmDialog({
      open: true,
      title: "Unpublish Exam",
      description: `Are you sure you want to unpublish "${exam.title}"? It will be moved back to draft and hidden from students.`,
      onConfirm: () => {
        updateStatus("draft", "Exam moved back to draft");
        setConfirmDialog((d) => ({ ...d, open: false }));
      },
    });
  };

  const handleArchive = () => {
    if (!exam) return;
    setConfirmDialog({
      open: true,
      title: "Archive Exam",
      description: `Are you sure you want to archive "${exam.title}"? Students will no longer be able to access it.`,
      variant: "destructive",
      onConfirm: () => {
        updateStatus("archived", "Exam archived");
        setConfirmDialog((d) => ({ ...d, open: false }));
      },
    });
  };

  // ─── Loading State ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading exam details...</p>
        </div>
      </div>
    );
  }

  // ─── Error / Not Found State ────────────────────────────────────
  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-muted-foreground/60" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Exam not found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          The exam you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Link href="/admin/exams">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Button>
        </Link>
      </div>
    );
  }

  const stCfg = statusConfig[exam.status] || statusConfig.draft;
  const completionRate =
    exam.studentsRegistered > 0
      ? Math.round((exam.studentsCompleted / exam.studentsRegistered) * 100)
      : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not scheduled";
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Exams", href: "/admin/exams" },
          { label: exam.title },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/exams">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Exam duplicated")}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Link href="/admin/exams/create">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>

            {/* ── Status Action Buttons ─────────────────────── */}
            {exam.status === "draft" && (
              <Button
                size="sm"
                className="gradient-primary text-white border-0 shadow-lg shadow-primary/25"
                onClick={handlePublish}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Publish
              </Button>
            )}
            {exam.status === "published" && (
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                onClick={handleUnpublish}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Unpublish
              </Button>
            )}
            {(exam.status === "completed" || exam.status === "published") && (
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={handleArchive}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4 mr-2" />
                )}
                Archive
              </Button>
            )}
          </div>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Status", value: <Badge variant="secondary" className={stCfg.className}>{stCfg.label}</Badge>, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Duration", value: `${exam.durationMinutes}m`, icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Questions", value: exam.questionCount, icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Students", value: exam.studentsRegistered, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Avg Score", value: exam.studentsRegistered > 0 ? `${exam.avgScore.toFixed(1)}%` : "—", icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-500/10" },
          { label: "Pass Rate", value: exam.studentsRegistered > 0 ? `${exam.passRate}%` : "—", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="text-lg font-bold mt-0.5">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Exam Info */}
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Exam Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm">{exam.description || "No description provided."}</p>
                </div>
                <Separator />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="text-sm font-medium mt-0.5">{exam.subject || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium mt-0.5">{exam.category || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Marks</p>
                    <p className="text-sm font-medium mt-0.5">{exam.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Passing</p>
                    <p className="text-sm font-medium mt-0.5">{exam.passingPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium mt-0.5">{formatDate(exam.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm font-medium mt-0.5">{formatDate(exam.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="text-sm font-medium mt-0.5">{exam.createdByName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created At</p>
                    <p className="text-sm font-medium mt-0.5">{formatDate(exam.createdAt)}</p>
                  </div>
                </div>
                {exam.instructions && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Instructions</p>
                      <p className="text-sm text-muted-foreground">{exam.instructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Completion */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Completion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-muted/30"
                      />
                      <motion.path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 100" }}
                        animate={{ strokeDasharray: `${completionRate} 100` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                      <defs>
                        <linearGradient id="gradient">
                          <stop offset="0%" stopColor="oklch(0.588 0.22 264)" />
                          <stop offset="100%" stopColor="oklch(0.65 0.20 330)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{completionRate}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {exam.studentsCompleted} of {exam.studentsRegistered} completed
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Highest Score</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {exam.studentsRegistered > 0 ? `${exam.highestScore}%` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lowest Score</span>
                    <span className="font-medium text-rose-600 dark:text-rose-400">
                      {exam.studentsRegistered > 0 ? `${exam.lowestScore}%` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {exam.studentsRegistered > 0 ? `${exam.avgScore.toFixed(1)}%` : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Question Type Breakdown */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Question Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exam.questionBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No questions added yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {exam.questionBreakdown.map((q) => {
                      const pct = exam.questionCount > 0
                        ? Math.round((q.count / exam.questionCount) * 100)
                        : 0;
                      return (
                        <div key={q.type}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{questionTypeLabels[q.type] || q.type} ({q.count})</span>
                            <span className="font-medium">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exam Stats Summary */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exam.studentsRegistered === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No attempts recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: "Total Attempts", value: exam.studentsRegistered.toString() },
                      { label: "Completed", value: exam.studentsCompleted.toString() },
                      { label: "Average Score", value: `${exam.avgScore.toFixed(1)}%` },
                      { label: "Highest Score", value: `${exam.highestScore}%` },
                      { label: "Lowest Score", value: `${exam.lowestScore}%` },
                      { label: "Pass Rate", value: `${exam.passRate}%` },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <span className="text-sm">{item.label}</span>
                        <span className="text-sm font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Exam Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { label: "Proctoring", value: exam.proctoringEnabled ? "Enabled" : "Disabled", icon: Shield, active: exam.proctoringEnabled },
                  { label: "Max Violations", value: exam.maxViolations.toString(), icon: AlertTriangle, active: true },
                  { label: "Shuffle Questions", value: exam.shuffleQuestions ? "Yes" : "No", icon: FileText, active: exam.shuffleQuestions },
                  { label: "Shuffle Options", value: exam.shuffleOptions ? "Yes" : "No", icon: FileText, active: exam.shuffleOptions },
                  { label: "Show Results", value: exam.showResults ? "Yes" : "No", icon: Eye, active: exam.showResults },
                  { label: "Show Answers", value: exam.showAnswers ? "Yes" : "No", icon: Eye, active: exam.showAnswers },
                  { label: "Max Attempts", value: exam.maxAttempts.toString(), icon: Target, active: true },
                  { label: "Negative Marking", value: `${exam.negativeMarkingPercentage}%`, icon: AlertTriangle, active: exam.negativeMarkingPercentage > 0 },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className={cn("w-2 h-2 rounded-full", setting.active ? "bg-emerald-500" : "bg-zinc-400")} />
                    <setting.icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{setting.label}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{setting.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
