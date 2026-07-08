"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Download,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const monthlyData = [
  { month: "Jan", exams: 12, students: 480, avgScore: 72 },
  { month: "Feb", exams: 15, students: 620, avgScore: 75 },
  { month: "Mar", exams: 18, students: 780, avgScore: 74 },
  { month: "Apr", exams: 22, students: 950, avgScore: 78 },
  { month: "May", exams: 20, students: 870, avgScore: 76 },
  { month: "Jun", exams: 16, students: 720, avgScore: 80 },
];

const subjectPerformance = [
  { subject: "Computer Science", exams: 28, avgScore: 82, passRate: 91, students: 450 },
  { subject: "Mathematics", exams: 22, avgScore: 74, passRate: 85, students: 380 },
  { subject: "Physics", exams: 18, avgScore: 71, passRate: 82, students: 310 },
  { subject: "Chemistry", exams: 14, avgScore: 68, passRate: 78, students: 240 },
  { subject: "English", exams: 12, avgScore: 76, passRate: 88, students: 280 },
  { subject: "Biology", exams: 8, avgScore: 73, passRate: 84, students: 180 },
];

const topExams = [
  { title: "Data Structures - Final", subject: "CS", avgScore: 88, passRate: 95, participants: 189 },
  { title: "Advanced Calculus", subject: "Math", avgScore: 82, passRate: 89, participants: 245 },
  { title: "Organic Chemistry", subject: "Chem", avgScore: 78, passRate: 82, participants: 210 },
  { title: "Classical Mechanics", subject: "Physics", avgScore: 75, passRate: 80, participants: 156 },
  { title: "English Literature", subject: "Eng", avgScore: 84, passRate: 92, participants: 312 },
];

const violationTrends = [
  { type: "Tab Switch", count: 145, trend: "down", change: "-12%" },
  { type: "No Face", count: 89, trend: "up", change: "+5%" },
  { type: "Fullscreen Exit", count: 67, trend: "down", change: "-8%" },
  { type: "Copy Attempt", count: 34, trend: "down", change: "-22%" },
  { type: "Multiple Faces", count: 23, trend: "up", change: "+15%" },
  { type: "Dev Tools", count: 12, trend: "down", change: "-30%" },
];

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("this_month");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive insights into examination performance"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Reports" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(v) => v && setDateRange(v)}>
              <SelectTrigger className="w-44">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_semester">This Semester</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Export feature coming soon")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Exams" value="103" change="+12%" trend="up" icon={FileText} gradient="from-blue-500 to-indigo-600" bgGlow="bg-blue-500/10" delay={0} />
        <StatCard title="Students Assessed" value="2,847" change="+18%" trend="up" icon={Users} gradient="from-emerald-500 to-teal-600" bgGlow="bg-emerald-500/10" delay={0.1} />
        <StatCard title="Avg Pass Rate" value="85.2%" change="+3.1%" trend="up" icon={Target} gradient="from-violet-500 to-purple-600" bgGlow="bg-violet-500/10" delay={0.2} />
        <StatCard title="Avg Score" value="76.4%" change="+2.8%" trend="up" icon={TrendingUp} gradient="from-amber-500 to-orange-600" bgGlow="bg-amber-500/10" delay={0.3} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exams">Exam Reports</TabsTrigger>
          <TabsTrigger value="students">Student Reports</TabsTrigger>
          <TabsTrigger value="proctoring">Proctoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Monthly Trend Chart */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Monthly Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 h-48">
                {monthlyData.map((data, i) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end h-40">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.exams / 25) * 100}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-blue-500/60 to-blue-400/30 rounded-t hover:from-blue-500 hover:to-blue-400/50 transition-colors cursor-pointer relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border whitespace-nowrap z-10">
                          {data.exams} exams
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${data.avgScore}%` }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-primary/60 to-primary/30 rounded-t hover:from-primary hover:to-primary/50 transition-colors cursor-pointer relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border whitespace-nowrap z-10">
                          {data.avgScore}% avg
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-blue-500/60" />
                  Exams Conducted
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary/60" />
                  Avg Score
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-4 h-4 text-primary" />
                Subject-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="flex items-center gap-4">
                    <div className="w-36 text-sm font-medium truncate">{subject.subject}</div>
                    <div className="flex-1">
                      <Progress value={subject.avgScore} className="h-2" />
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                      <span className="w-14 text-right font-medium">{subject.avgScore}%</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "w-16 justify-center",
                          subject.passRate >= 85
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : subject.passRate >= 75
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {subject.passRate}%
                      </Badge>
                      <span className="text-muted-foreground w-12 text-right">{subject.students}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground border-t border-border pt-3">
                <span>Bar = Average Score</span>
                <span>Badge = Pass Rate</span>
                <span>Number = Students</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exam Reports Tab */}
        <TabsContent value="exams" className="mt-4 space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Top Performing Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/30">
                {topExams.map((exam, i) => (
                  <div key={i} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold",
                        i === 0 ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
                      )}>
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{exam.title}</p>
                        <p className="text-xs text-muted-foreground">{exam.subject} • {exam.participants} participants</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold">{exam.avgScore}%</p>
                        <p className="text-[10px] text-muted-foreground">Avg Score</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{exam.passRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Pass Rate</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Overall Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-44">
                {[
                  { range: "0-10", count: 8 },
                  { range: "11-20", count: 15 },
                  { range: "21-30", count: 28 },
                  { range: "31-40", count: 52 },
                  { range: "41-50", count: 95 },
                  { range: "51-60", count: 180 },
                  { range: "61-70", count: 310 },
                  { range: "71-80", count: 520 },
                  { range: "81-90", count: 420 },
                  { range: "91-100", count: 219 },
                ].map((bucket, i) => {
                  const maxVal = 520;
                  const height = (bucket.count / maxVal) * 100;
                  return (
                    <div key={bucket.range} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                        className={cn(
                          "w-full rounded-t cursor-pointer relative group transition-colors",
                          i < 4 ? "bg-gradient-to-t from-rose-500/60 to-rose-400/30 hover:from-rose-500 hover:to-rose-400/50" :
                          i < 7 ? "bg-gradient-to-t from-amber-500/60 to-amber-400/30 hover:from-amber-500 hover:to-amber-400/50" :
                          "bg-gradient-to-t from-emerald-500/60 to-emerald-400/30 hover:from-emerald-500 hover:to-emerald-400/50"
                        )}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border whitespace-nowrap z-10">
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
        </TabsContent>

        {/* Student Reports Tab */}
        <TabsContent value="students" className="mt-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { grade: "A+ (90-100%)", count: 312, percentage: 11, color: "bg-emerald-500" },
                    { grade: "A (80-89%)", count: 545, percentage: 19, color: "bg-blue-500" },
                    { grade: "B+ (70-79%)", count: 620, percentage: 22, color: "bg-violet-500" },
                    { grade: "B (60-69%)", count: 480, percentage: 17, color: "bg-amber-500" },
                    { grade: "C (50-59%)", count: 410, percentage: 14, color: "bg-orange-500" },
                    { grade: "D (40-49%)", count: 280, percentage: 10, color: "bg-rose-400" },
                    { grade: "F (Below 40%)", count: 200, percentage: 7, color: "bg-rose-600" },
                  ].map((item) => (
                    <div key={item.grade} className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-sm flex-shrink-0", item.color)} />
                      <span className="text-sm w-32">{item.grade}</span>
                      <div className="flex-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage * 4}%` }}
                          transition={{ duration: 0.5 }}
                          className={cn("h-5 rounded-sm", item.color, "opacity-30")}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-14 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "Avg. Time per Exam", value: "47 min", subtitle: "out of 60 min avg duration", progress: 78 },
                  { label: "Question Attempt Rate", value: "94.2%", subtitle: "questions attempted vs total", progress: 94 },
                  { label: "Review Before Submit", value: "67%", subtitle: "students review before submitting", progress: 67 },
                  { label: "Early Submission Rate", value: "23%", subtitle: "submit before time ends", progress: 23 },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium">{metric.label}</p>
                        <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                      </div>
                      <span className="text-lg font-bold">{metric.value}</span>
                    </div>
                    <Progress value={metric.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Proctoring Tab */}
        <TabsContent value="proctoring" className="mt-4 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-border/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-xl font-bold">1,847</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">AI-monitored sessions this period</p>
            </Card>
            <Card className="border-border/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Violations</p>
                  <p className="text-xl font-bold">370</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Across all proctored exams</p>
            </Card>
            <Card className="border-border/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clean Rate</p>
                  <p className="text-xl font-bold">82.3%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Sessions with zero violations</p>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Violation Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {violationTrends.map((v) => (
                  <div key={v.type} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{v.type}</p>
                    </div>
                    <div className="w-32">
                      <Progress value={(v.count / 150) * 100} className="h-2" />
                    </div>
                    <span className="text-sm font-bold w-10 text-right">{v.count}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "w-16 justify-center",
                        v.trend === "down"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {v.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
