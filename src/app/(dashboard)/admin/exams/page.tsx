"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Exam {
  id: string;
  title: string;
  slug: string;
  subject: string;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  questionCount: number;
  status: "draft" | "published" | "active" | "completed" | "archived";
  startDate: string | null;
  endDate: string | null;
  studentsRegistered: number;
  studentsCompleted: number;
  avgScore: number;
  proctoringEnabled: boolean;
  createdBy: string;
  createdAt: string;
}

type ExamStatus = "all" | "draft" | "published" | "active" | "completed" | "archived";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  draft: { label: "Draft", className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400", icon: Edit },
  published: { label: "Published", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: CheckCircle2 },
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: AlertCircle },
  completed: { label: "Completed", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400", icon: CheckCircle2 },
  archived: { label: "Archived", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Archive },
};

export default function AdminExamsPage() {
  const [statusFilter, setStatusFilter] = useState<ExamStatus>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/exams");
      if (!res.ok) throw new Error("Failed to fetch exams");
      const data = await res.json();
      setExams(data);
    } catch (error) {
      toast.error("Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  };

  const updateExamStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Exam status updated to ${newStatus}`);
      fetchExams();
    } catch (error) {
      toast.error("Failed to update exam status");
    }
  };

  const deleteExam = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete exam");
      toast.success("Exam deleted");
      fetchExams();
    } catch (error) {
      toast.error("Failed to delete exam");
    }
  };

  const subjects = [...new Set(exams.map((e) => e.subject).filter(Boolean))];

  const filtered = exams.filter((exam) => {
    if (statusFilter !== "all" && exam.status !== statusFilter) return false;
    if (subjectFilter !== "all" && exam.subject !== subjectFilter) return false;
    if (search && !exam.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const stats = {
    total: exams.length,
    active: exams.filter((e) => e.status === "active").length,
    draft: exams.filter((e) => e.status === "draft").length,
    completed: exams.filter((e) => e.status === "completed").length,
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not scheduled";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Management"
        description="Create, manage, and monitor examinations"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Exams" },
        ]}
        actions={
          <Link href="/admin/exams/create">
            <Button
              size="sm"
              className="gradient-primary text-white border-0 shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Exams"
          value={stats.total}
          icon={FileText}
          gradient="from-blue-500 to-indigo-600"
          bgGlow="bg-blue-500/10"
          delay={0}
        />
        <StatCard
          title="Active Now"
          value={stats.active}
          icon={Target}
          gradient="from-emerald-500 to-teal-600"
          bgGlow="bg-emerald-500/10"
          delay={0.1}
        />
        <StatCard
          title="Drafts"
          value={stats.draft}
          icon={Edit}
          gradient="from-amber-500 to-orange-600"
          bgGlow="bg-amber-500/10"
          delay={0.2}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={TrendingUp}
          gradient="from-violet-500 to-purple-600"
          bgGlow="bg-violet-500/10"
          delay={0.3}
        />
      </div>

      {/* Filters & View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ExamStatus)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select
            value={subjectFilter}
            onValueChange={(v) => v && setSubjectFilter(v)}
          >
            <SelectTrigger className="w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams..."
            className="w-48 h-9"
          />
          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className={cn("w-9 h-9 rounded-r-none", viewMode === "grid" && "bg-muted")}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("w-9 h-9 rounded-l-none", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Exam Cards / List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={
          viewMode === "grid"
            ? "grid md:grid-cols-2 xl:grid-cols-3 gap-4"
            : "space-y-3"
        }
      >
        {filtered.map((exam, i) => {
          const stCfg = statusConfig[exam.status];
          const completionRate =
            exam.studentsRegistered > 0
              ? Math.round(
                  (exam.studentsCompleted / exam.studentsRegistered) * 100
                )
              : 0;

          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                <CardContent className={cn("p-5", viewMode === "list" && "flex items-center gap-6")}>
                  <div className={cn("flex-1", viewMode === "list" && "flex items-center gap-6")}>
                    {/* Header */}
                    <div className={cn("flex-1", viewMode === "list" && "min-w-0")}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/exams/${exam.id}`}
                            className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1"
                          >
                            {exam.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className={stCfg.className}>
                              {stCfg.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {exam.subject}
                            </span>
                            {exam.proctoringEnabled && (
                              <Badge variant="outline" className="text-xs py-0 h-5">
                                <Eye className="w-3 h-3 mr-1" />
                                Proctored
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              />
                            }
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem render={<Link href={`/admin/exams/${exam.id}`} />}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<Link href={`/admin/exams/create`} />}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Exam duplicated")}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {exam.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() => updateExamStatus(exam.id, "published")}
                                className="text-blue-600 dark:text-blue-400"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  title: "Delete Exam",
                                  description: `Are you sure you want to delete "${exam.title}"? This action will archive it.`,
                                  onConfirm: () => {
                                    deleteExam(exam.id);
                                    setConfirmDialog((d) => ({ ...d, open: false }));
                                  },
                                })
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Meta */}
                    {viewMode === "grid" && (
                      <>
                        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-sm font-semibold mt-0.5">
                              {exam.durationMinutes} min
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Questions</p>
                            <p className="text-sm font-semibold mt-0.5">
                              {exam.questionCount}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Marks</p>
                            <p className="text-sm font-semibold mt-0.5">
                              {exam.totalMarks}
                            </p>
                          </div>
                        </div>

                        {exam.studentsRegistered > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-muted-foreground">
                                {exam.studentsCompleted}/{exam.studentsRegistered} completed
                              </span>
                              <span className="font-medium">{completionRate}%</span>
                            </div>
                            <Progress value={completionRate} className="h-1.5" />
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(exam.startDate)}
                          </div>
                          {exam.avgScore > 0 && (
                            <span>Avg: {exam.avgScore}%</span>
                          )}
                        </div>
                      </>
                    )}

                    {/* List mode extra info */}
                    {viewMode === "list" && (
                      <div className="flex items-center gap-6 text-sm text-muted-foreground flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {exam.durationMinutes}m
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {exam.questionCount} Q
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {exam.studentsRegistered}
                        </div>
                        <span>{formatDate(exam.startDate)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">Loading exams...</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No exams found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              No exams match the current filters. Try adjusting your search or filters.
            </p>
            <Link href="/admin/exams/create">
              <Button className="gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" />
                Create New Exam
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

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
