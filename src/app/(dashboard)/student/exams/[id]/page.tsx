"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  FileText,
  Target,
  Shield,
  Calendar,
  Eye,
  Camera,
  MonitorSmartphone,
  AlertTriangle,
  CheckCircle2,
  Info,
  PlayCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Demo exam data
const examData: Record<string, {
  id: string;
  title: string;
  subject: string;
  category: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  questionCount: number;
  status: string;
  startDate: string;
  endDate: string;
  proctoringEnabled: boolean;
  maxAttempts: number;
  attemptsUsed: number;
  negativeMarking: number;
  shuffleQuestions: boolean;
  instructions: string;
  createdBy: string;
}> = {
  "1": {
    id: "1",
    title: "Advanced Mathematics - Final Exam",
    subject: "Mathematics",
    category: "Engineering",
    description: "Comprehensive final examination covering calculus, linear algebra, and differential equations. This exam tests your understanding of core mathematical concepts studied throughout the semester.",
    durationMinutes: 120,
    totalMarks: 100,
    passingPercentage: 40,
    questionCount: 50,
    status: "active",
    startDate: "2025-06-14T10:00:00Z",
    endDate: "2025-06-14T12:00:00Z",
    proctoringEnabled: true,
    maxAttempts: 1,
    attemptsUsed: 0,
    negativeMarking: 25,
    shuffleQuestions: true,
    instructions: "1. Read all questions carefully before answering.\n2. Each question carries marks as indicated.\n3. Negative marking of 25% applies for wrong MCQ answers.\n4. Use of calculator is NOT permitted.\n5. Ensure your webcam is working before starting.\n6. Do not switch tabs or windows during the exam.\n7. The exam will auto-submit when time runs out.\n8. You can flag questions for review and come back to them later.",
    createdBy: "Sneha Reddy",
  },
};

const defaultExam = examData["1"]!;

export default function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const exam = examData[id] || defaultExam;
  const isActive = exam.status === "active";
  const canAttempt = exam.attemptsUsed < exam.maxAttempts;

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Examinations", href: "/student/exams" },
          { label: exam.title },
        ]}
        actions={
          <Link href="/student/exams">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exams
            </Button>
          </Link>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Exam Info */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  About This Exam
                </CardTitle>
                <Badge
                  variant="secondary"
                  className={cn(
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {isActive ? "Active Now" : "Upcoming"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exam.description}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="text-sm font-medium mt-0.5">{exam.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium mt-0.5">{exam.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <p className="text-sm font-medium mt-0.5">{exam.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Attempts</p>
                  <p className="text-sm font-medium mt-0.5">
                    {exam.attemptsUsed} / {exam.maxAttempts} used
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exam.instructions.split("\n").map((line, i) => (
                  <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Proctoring Requirements */}
          {exam.proctoringEnabled && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Shield className="w-4 h-4" />
                  Proctoring Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Camera, label: "Webcam Required", desc: "Your webcam must be enabled throughout the exam" },
                    { icon: MonitorSmartphone, label: "Fullscreen Mode", desc: "The exam will run in fullscreen mode" },
                    { icon: Eye, label: "Face Detection", desc: "AI will monitor your face during the exam" },
                    { icon: AlertTriangle, label: "Tab Switching", desc: "Switching tabs will trigger a violation" },
                  ].map((req) => (
                    <div key={req.label} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <req.icon className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{req.label}</p>
                        <p className="text-xs text-muted-foreground">{req.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Exam Details Card */}
          <Card className="border-border/50 sticky top-24">
            <CardContent className="p-5 space-y-5">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Clock, label: "Duration", value: `${exam.durationMinutes} min`, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { icon: FileText, label: "Questions", value: String(exam.questionCount), color: "text-violet-500", bg: "bg-violet-500/10" },
                  { icon: Target, label: "Total Marks", value: String(exam.totalMarks), color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { icon: CheckCircle2, label: "Passing", value: `${exam.passingPercentage}%`, color: "text-amber-500", bg: "bg-amber-500/10" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <div className={cn("w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-bold mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Schedule */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-medium">Schedule</span>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Start:</span>{" "}
                    {formatDateTime(exam.startDate)}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">End:</span>{" "}
                    {formatDateTime(exam.endDate)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Extra Info */}
              <div className="space-y-2 text-sm">
                {exam.negativeMarking > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Negative Marking</span>
                    <span className="font-medium">{exam.negativeMarking}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shuffle Questions</span>
                  <span className="font-medium">{exam.shuffleQuestions ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Proctoring</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs h-5",
                      exam.proctoringEnabled
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "border-border"
                    )}
                  >
                    {exam.proctoringEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* CTA */}
              {isActive && canAttempt ? (
                <Button
                  className="w-full gradient-primary text-white border-0 shadow-lg shadow-primary/25 h-11"
                  onClick={() => router.push(`/exam/${exam.id}`)}
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Examination
                </Button>
              ) : !canAttempt ? (
                <Button disabled className="w-full h-11">
                  Maximum Attempts Reached
                </Button>
              ) : (
                <div className="text-center text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                  This exam hasn&apos;t started yet.
                  <br />
                  <span className="font-medium text-foreground">
                    Starts {formatDateTime(exam.startDate)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
