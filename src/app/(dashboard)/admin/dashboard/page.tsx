"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  FileText,
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────
interface DashboardData {
  stats: {
    totalStudents: number;
    newStudentsThisWeek: number;
    activeExams: number;
    totalExams: number;
    completionRate: number;
    violationsToday: number;
    violationDiff: number;
  };
  recentExams: {
    id: string;
    title: string;
    subject: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    students: number;
    avgScore: number;
  }[];
  performance: {
    passRate: number;
    avgScore: number;
    completionRate: number;
  };
  quickStats: {
    avgDurationMin: number;
    totalProcSessions: number;
  };
  weeklyPerformance: { day: string; value: number }[];
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  completed: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  published: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  draft: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  archived: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchDashboard(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: data.stats.totalStudents.toLocaleString(),
      change: `+${data.stats.newStudentsThisWeek}`,
      changeLabel: "this week",
      trend: data.stats.newStudentsThisWeek > 0 ? "up" : "neutral",
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bgGlow: "bg-blue-500/10",
    },
    {
      title: "Active Exams",
      value: data.stats.activeExams.toString(),
      change: `${data.stats.totalExams} total`,
      changeLabel: "",
      trend: "up",
      icon: FileText,
      gradient: "from-emerald-500 to-teal-600",
      bgGlow: "bg-emerald-500/10",
    },
    {
      title: "Completion Rate",
      value: `${data.stats.completionRate}%`,
      change: data.stats.completionRate >= 90 ? "Excellent" : data.stats.completionRate >= 70 ? "Good" : "Needs improvement",
      changeLabel: "",
      trend: data.stats.completionRate >= 70 ? "up" : "down",
      icon: GraduationCap,
      gradient: "from-violet-500 to-purple-600",
      bgGlow: "bg-violet-500/10",
    },
    {
      title: "Violations Today",
      value: data.stats.violationsToday.toString(),
      change: `${data.stats.violationDiff >= 0 ? "+" : ""}${data.stats.violationDiff}`,
      changeLabel: "vs yesterday",
      trend: data.stats.violationDiff <= 0 ? "down" : "up",
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-600",
      bgGlow: "bg-amber-500/10",
    },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
    if (diffHours < 48) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your examination platform.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboard(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={fadeInUp} transition={{ duration: 0.4 }}>
            <Card className="relative overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      ) : stat.trend === "down" ? (
                        <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                      ) : null}
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {stat.change}
                      </span>
                      {stat.changeLabel && (
                        <span className="text-xs text-muted-foreground">
                          {stat.changeLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                {/* Background glow */}
                <div
                  className={`absolute -top-8 -right-8 w-24 h-24 ${stat.bgGlow} rounded-full blur-2xl`}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Exams */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Recent Examinations
              </CardTitle>
              <Link href="/admin/exams">
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted/50 transition-colors">
                  View All
                </Badge>
              </Link>
            </CardHeader>
            <CardContent>
              {data.recentExams.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No exams created yet. Create your first exam to see it here.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recentExams.map((exam) => (
                    <Link
                      key={exam.id}
                      href={`/admin/exams/${exam.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">
                            {exam.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {exam.subject || "No subject"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {exam.students} {exam.students === 1 ? "student" : "students"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={statusColors[exam.status] || statusColors.draft}
                        >
                          {exam.status}
                        </Badge>
                        {exam.avgScore > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Avg: {exam.avgScore.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity / Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    icon: Clock,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                    label: "Avg. Exam Duration",
                    value: data.quickStats.avgDurationMin > 0
                      ? `${data.quickStats.avgDurationMin} min`
                      : "No data yet",
                  },
                  {
                    icon: Eye,
                    color: "text-violet-500",
                    bg: "bg-violet-500/10",
                    label: "Proctoring Sessions",
                    value: data.quickStats.totalProcSessions.toLocaleString(),
                  },
                  {
                    icon: GraduationCap,
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                    label: "Pass Rate",
                    value: data.performance.passRate > 0
                      ? `${data.performance.passRate}%`
                      : "No data yet",
                  },
                  {
                    icon: TrendingUp,
                    color: "text-cyan-500",
                    bg: "bg-cyan-500/10",
                    label: "Avg. Score",
                    value: data.performance.avgScore > 0
                      ? `${data.performance.avgScore}%`
                      : "No data yet",
                  },
                  {
                    icon: AlertTriangle,
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                    label: "Violations Today",
                    value: data.stats.violationsToday.toString(),
                  },
                ].map((item, index) => (
                  <div key={item.label} className="flex gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.bg}`}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.label}</p>
                      <p className="text-sm font-bold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Pass Rate
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {data.performance.passRate}%
                  </span>
                </div>
                <Progress value={data.performance.passRate} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Avg. Score
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {data.performance.avgScore}%
                  </span>
                </div>
                <Progress value={data.performance.avgScore} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Completion Rate
                  </span>
                  <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                    {data.performance.completionRate}%
                  </span>
                </div>
                <Progress value={data.performance.completionRate} className="h-2" />
              </div>
            </div>

            {/* Weekly performance bars */}
            <div className="mt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Weekly Exam Performance (Avg. Score)
              </p>
              <div className="flex items-end gap-2 h-40">
                {data.weeklyPerformance.map((bar, i) => (
                  <div key={`${bar.day}-${i}`} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${bar.value || 2}%` }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-primary/80 to-primary/30 rounded-t-md hover:from-primary hover:to-primary/50 transition-colors cursor-pointer relative group min-h-[4px]"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border whitespace-nowrap">
                        {bar.value > 0 ? `${bar.value}%` : "No data"}
                      </div>
                    </motion.div>
                    <span className="text-xs text-muted-foreground">
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Duration</p>
                <p className="text-xl font-bold">
                  {data.quickStats.avgDurationMin > 0
                    ? `${data.quickStats.avgDurationMin} min`
                    : "—"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Average time students spend on exams
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Proctoring Sessions
                </p>
                <p className="text-xl font-bold">
                  {data.quickStats.totalProcSessions.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Total AI-monitored sessions
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-xl font-bold">{data.stats.totalExams}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.stats.activeExams} currently active or published
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
