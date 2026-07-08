"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Timer,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalExamsTaken: number;
    completedExams: number;
    averageScore: number;
    inProgressExams: number;
  };
  recentResults: any[];
  upcomingExams: any[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/student/dashboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Upcoming Exams",
      value: data.upcomingExams.length.toString(),
      subtitle: data.upcomingExams.length > 0 ? "Exams available" : "No exams scheduled",
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
      bgGlow: "bg-blue-500/10",
    },
    {
      title: "Completed",
      value: data.stats.completedExams.toString(),
      subtitle: "Total exams finished",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      bgGlow: "bg-emerald-500/10",
    },
    {
      title: "Average Score",
      value: `${data.stats.averageScore}%`,
      subtitle: "Across all exams",
      icon: TrendingUp,
      gradient: "from-violet-500 to-purple-600",
      bgGlow: "bg-violet-500/10",
    },
    {
      title: "In Progress",
      value: data.stats.inProgressExams.toString(),
      subtitle: "Unsubmitted exams",
      icon: Timer,
      gradient: "from-amber-500 to-orange-600",
      bgGlow: "bg-amber-500/10",
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Track your examinations and performance
          </p>
        </div>
        <Link href="/student/exams">
          <Button className="gradient-primary text-white border-0 shadow-lg shadow-primary/25">
            <BookOpen className="w-4 h-4 mr-2" />
            Browse Exams
          </Button>
        </Link>
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
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
        {/* Upcoming Exams */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Upcoming Examinations
              </CardTitle>
              <Link href="/student/exams">
                <Button variant="ghost" size="sm" className="text-primary gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.upcomingExams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No upcoming exams available.</p>
                ) : (
                  data.upcomingExams.map((exam, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {exam.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {exam.startDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(exam.startDate)}
                              </span>
                            )}
                            {exam.startDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(exam.startDate)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {exam.durationMinutes} min
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        >
                          Available
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {exam.totalMarks} marks
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Recent Results
              </CardTitle>
              <Link href="/student/history">
                <Button variant="ghost" size="sm" className="text-primary gap-1">
                  All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No recent results found.</p>
                ) : (
                  data.recentResults.map((result, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate pr-4">{result.examTitle}</span>
                        <span className="font-bold whitespace-nowrap">
                          {result.totalScore} / {result.totalMarks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-5",
                              result.isPassed
                                ? "border-emerald-500/30 text-emerald-600"
                                : "border-rose-500/30 text-rose-600"
                            )}
                          >
                            {result.isPassed ? "PASSED" : "FAILED"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(result.submittedAt)}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {result.percentage}%
                        </span>
                      </div>
                      <Progress
                        value={result.percentage}
                        className="h-1.5"
                        indicatorClassName={result.isPassed ? "bg-emerald-500" : "bg-rose-500"}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-44">
              {[
                { label: "Exam 1", score: 72 },
                { label: "Exam 2", score: 68 },
                { label: "Exam 3", score: 75 },
                { label: "Exam 4", score: 82 },
                { label: "Exam 5", score: 79 },
                { label: "Exam 6", score: 85 },
                { label: "Exam 7", score: 88 },
                { label: "Exam 8", score: 78 },
                { label: "Exam 9", score: 91 },
                { label: "Exam 10", score: 85 },
                { label: "Exam 11", score: 96 },
                { label: "Exam 12", score: 82 },
              ].map((exam, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${exam.score}%` }}
                    transition={{ delay: 0.6 + i * 0.06, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-primary/80 to-primary/30 rounded-t hover:from-primary hover:to-primary/50 transition-colors cursor-pointer relative group min-h-[4px]"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border whitespace-nowrap z-10">
                      {exam.score}%
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>First Exam</span>
              <span>Latest Exam</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
