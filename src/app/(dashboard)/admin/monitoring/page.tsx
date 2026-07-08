"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Users,
  AlertTriangle,
  Shield,
  Clock,
  Activity,
  Wifi,
  WifiOff,
  MonitorSmartphone,
  Camera,
  Ban,
  MessageSquare,
  ChevronRight,
  Circle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "@/lib/utils";
import { toast } from "sonner";

const activeExams = [
  {
    id: "1",
    title: "Advanced Mathematics - Final Exam",
    subject: "Mathematics",
    totalStudents: 245,
    activeStudents: 198,
    completedStudents: 42,
    violations: 7,
    startedAt: "10:00 AM",
    duration: "120 min",
    timeRemaining: "47 min",
    progress: 61,
  },
  {
    id: "2",
    title: "Computer Networks - Quiz",
    subject: "Computer Science",
    totalStudents: 89,
    activeStudents: 85,
    completedStudents: 4,
    violations: 2,
    startedAt: "10:30 AM",
    duration: "45 min",
    timeRemaining: "22 min",
    progress: 51,
  },
  {
    id: "3",
    title: "Physics - Unit Test 3",
    subject: "Physics",
    totalStudents: 156,
    activeStudents: 148,
    completedStudents: 5,
    violations: 4,
    startedAt: "11:00 AM",
    duration: "60 min",
    timeRemaining: "38 min",
    progress: 37,
  },
];

const studentSessions = [
  { id: "1", name: "Arjun Sharma", exam: "Mathematics", status: "active" as const, progress: 72, violations: 0, webcam: true, lastActivity: "2s ago" },
  { id: "2", name: "Priya Patel", exam: "Mathematics", status: "active" as const, progress: 65, violations: 1, webcam: true, lastActivity: "5s ago" },
  { id: "3", name: "Rahul Kumar", exam: "Mathematics", status: "warning" as const, progress: 48, violations: 3, webcam: true, lastActivity: "12s ago" },
  { id: "4", name: "Sneha Iyer", exam: "Computer Networks", status: "active" as const, progress: 55, violations: 0, webcam: true, lastActivity: "1s ago" },
  { id: "5", name: "Vikram Singh", exam: "Mathematics", status: "critical" as const, progress: 33, violations: 4, webcam: false, lastActivity: "45s ago" },
  { id: "6", name: "Ananya Gupta", exam: "Physics", status: "active" as const, progress: 41, violations: 0, webcam: true, lastActivity: "3s ago" },
  { id: "7", name: "Karthik Nair", exam: "Mathematics", status: "completed" as const, progress: 100, violations: 0, webcam: false, lastActivity: "5m ago" },
  { id: "8", name: "Meera Reddy", exam: "Physics", status: "active" as const, progress: 28, violations: 1, webcam: true, lastActivity: "8s ago" },
  { id: "9", name: "Deepak Rajput", exam: "Computer Networks", status: "active" as const, progress: 62, violations: 0, webcam: true, lastActivity: "2s ago" },
  { id: "10", name: "Neha Joshi", exam: "Physics", status: "warning" as const, progress: 35, violations: 2, webcam: true, lastActivity: "20s ago" },
  { id: "11", name: "Aditya Verma", exam: "Mathematics", status: "active" as const, progress: 58, violations: 0, webcam: true, lastActivity: "4s ago" },
  { id: "12", name: "Ritu Desai", exam: "Computer Networks", status: "active" as const, progress: 44, violations: 0, webcam: true, lastActivity: "6s ago" },
];

const violationFeed = [
  { id: "1", student: "Vikram Singh", type: "No face detected", exam: "Mathematics", time: "Just now", severity: "critical" as const },
  { id: "2", student: "Rahul Kumar", type: "Tab switch detected", exam: "Mathematics", time: "2 min ago", severity: "high" as const },
  { id: "3", student: "Neha Joshi", type: "Browser resized", exam: "Physics", time: "5 min ago", severity: "medium" as const },
  { id: "4", student: "Priya Patel", type: "Copy attempt blocked", exam: "Mathematics", time: "8 min ago", severity: "high" as const },
  { id: "5", student: "Meera Reddy", type: "Fullscreen exit", exam: "Physics", time: "12 min ago", severity: "medium" as const },
  { id: "6", student: "Rahul Kumar", type: "Tab switch detected", exam: "Mathematics", time: "15 min ago", severity: "high" as const },
  { id: "7", student: "Vikram Singh", type: "Multiple faces detected", exam: "Mathematics", time: "20 min ago", severity: "critical" as const },
  { id: "8", student: "Rahul Kumar", type: "Keyboard shortcut blocked", exam: "Mathematics", time: "25 min ago", severity: "low" as const },
];

const severityConfig = {
  low: { className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400", dot: "bg-zinc-400" },
  medium: { className: "bg-amber-500/10 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  high: { className: "bg-orange-500/10 text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
  critical: { className: "bg-rose-500/10 text-rose-600 dark:text-rose-400", dot: "bg-rose-500 animate-pulse" },
};

const statusConfig = {
  active: { color: "bg-emerald-500", label: "Active" },
  warning: { color: "bg-amber-500", label: "Warning" },
  critical: { color: "bg-rose-500 animate-pulse", label: "Critical" },
  completed: { color: "bg-zinc-400", label: "Done" },
};

export default function AdminMonitoringPage() {
  const [selectedExam, setSelectedExam] = useState("all");

  const filteredSessions =
    selectedExam === "all"
      ? studentSessions
      : studentSessions.filter((s) => s.exam === activeExams.find((e) => e.id === selectedExam)?.subject);

  const totalActive = activeExams.reduce((a, e) => a + e.activeStudents, 0);
  const totalViolations = activeExams.reduce((a, e) => a + e.violations, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Monitoring"
        description="Real-time examination monitoring and proctoring dashboard"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Monitoring" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Live
              </span>
            </div>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Exams" value={activeExams.length} icon={Eye} gradient="from-blue-500 to-indigo-600" bgGlow="bg-blue-500/10" delay={0} />
        <StatCard title="Students Online" value={totalActive} icon={Users} gradient="from-emerald-500 to-teal-600" bgGlow="bg-emerald-500/10" delay={0.1} />
        <StatCard title="Active Violations" value={totalViolations} icon={AlertTriangle} gradient="from-amber-500 to-orange-600" bgGlow="bg-amber-500/10" delay={0.2} />
        <StatCard title="AI Monitoring" value="Active" subtitle="Face detection running" icon={Shield} gradient="from-violet-500 to-purple-600" bgGlow="bg-violet-500/10" delay={0.3} />
      </div>

      {/* Active Exams */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-base font-semibold mb-3">Active Examinations</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {activeExams.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card
                className={cn(
                  "border-border/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/5",
                  selectedExam === exam.id && "border-primary/50 ring-1 ring-primary/20"
                )}
                onClick={() => setSelectedExam(selectedExam === exam.id ? "all" : exam.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold line-clamp-1">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">{exam.subject}</p>
                    </div>
                    {exam.violations > 0 && (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {exam.violations}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{exam.progress}%</span>
                    </div>
                    <Progress value={exam.progress} className="h-1.5" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="p-1.5 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{exam.activeStudents}</p>
                    </div>
                    <div className="p-1.5 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Done</p>
                      <p className="text-sm font-bold">{exam.completedStudents}</p>
                    </div>
                    <div className="p-1.5 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Left</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{exam.timeRemaining}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Student Grid */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Student Sessions</CardTitle>
              <Badge variant="outline">{filteredSessions.length} students</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredSessions.map((student) => {
                  const sCfg = statusConfig[student.status];
                  return (
                    <div
                      key={student.id}
                      className={cn(
                        "p-3 rounded-xl border transition-all hover:shadow-md",
                        student.status === "critical"
                          ? "border-rose-500/30 bg-rose-500/5"
                          : student.status === "warning"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-border/50 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={`text-white text-xs ${getAvatarColor(student.name.split(" ")[0])}`}>
                              {getInitials(student.name.split(" ")[0], student.name.split(" ")[1] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card", sCfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{student.exam}</span>
                            <span>•</span>
                            <span>{student.lastActivity}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {student.webcam ? (
                            <Camera className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Camera className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          {student.violations > 0 && (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0">
                              {student.violations}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Violation Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Violation Feed
              </CardTitle>
              <Circle className="w-2 h-2 fill-rose-500 text-rose-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {violationFeed.map((violation) => {
                  const sev = severityConfig[violation.severity];
                  return (
                    <div
                      key={violation.id}
                      className="flex gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", sev.dot)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{violation.student}</span>{" "}
                          <span className="text-muted-foreground">— {violation.type}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{violation.exam}</span>
                          <span className="text-xs text-muted-foreground">{violation.time}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className={cn("text-[10px] h-5 flex-shrink-0", sev.className)}>
                        {violation.severity}
                      </Badge>
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
