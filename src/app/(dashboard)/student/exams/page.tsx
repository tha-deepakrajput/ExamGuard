"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

interface Exam {
  id: string;
  title: string;
  subject: string;
  category: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  questionCount?: number;
  status: "draft" | "published" | "active" | "completed" | "archived";
  startDate: string | null;
  endDate: string | null;
  proctoringEnabled: boolean;
  maxAttempts: number;
}

import {
  BookOpen,
  Clock,
  FileText,
  Eye,
  Search,
  Filter,
  Calendar,
  Target,
  Shield,
  ChevronRight,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function StudentExamsPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/exams");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setExams(data.exams || []);
      } catch (err) {
        toast.error("Failed to load exams");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  const subjects = [...new Set(exams.map((e) => e.subject).filter(Boolean))];

  const filtered = exams.filter((exam) => {
    if (subjectFilter !== "all" && exam.subject !== subjectFilter) return false;
    if (search && !exam.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = exams.filter((e) => e.status === "active").length;
  const upcomingCount = exams.filter((e) => e.status === "published").length;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Examinations"
        description="Browse and start your upcoming exams"
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Examinations" },
        ]}
      />

      {/* Quick Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {activeCount} Active Now
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {upcomingCount} Upcoming
          </span>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Select value={subjectFilter} onValueChange={(v) => v && setSubjectFilter(v)}>
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
      </motion.div>

      {/* Exam Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((exam, i) => {
          const isActive = exam.status === "active";
          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Card
                className={cn(
                  "border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group h-full",
                  isActive && "border-emerald-500/30 ring-1 ring-emerald-500/10"
                )}
              >
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/student/exams/${exam.id}`}
                        className="text-sm font-semibold hover:text-primary transition-colors line-clamp-2 leading-snug"
                      >
                        {exam.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exam.subject} • {exam.category}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "flex-shrink-0",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {isActive ? "Active" : "Upcoming"}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {exam.description}
                  </p>

                  {/* Meta Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-0.5" />
                      <p className="text-xs font-semibold">{exam.durationMinutes}m</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-0.5" />
                      <p className="text-xs font-semibold">{exam.questionCount} Q</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <Target className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-0.5" />
                      <p className="text-xs font-semibold">{exam.totalMarks} marks</p>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {exam.proctoringEnabled && (
                      <Badge variant="outline" className="text-xs py-0 h-5">
                        <Shield className="w-3 h-3 mr-1" />
                        Proctored
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs py-0 h-5">
                      Pass: {exam.passingPercentage}%
                    </Badge>
                    {exam.maxAttempts > 1 && (
                      <Badge variant="outline" className="text-xs py-0 h-5">
                        {exam.attemptsUsed}/{exam.maxAttempts} attempts
                      </Badge>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-border/30 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      {formatDate(exam.startDate)}
                    </div>
                    <Link href={`/student/exams/${exam.id}`}>
                      <Button
                        size="sm"
                        className={cn(
                          "h-8 text-xs",
                          isActive
                            ? "gradient-primary text-white border-0 shadow-md shadow-primary/25"
                            : ""
                        )}
                        variant={isActive ? "default" : "outline"}
                      >
                        {isActive ? "Start Exam" : "View Details"}
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

        {isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">Loading available exams...</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No exams found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            No exams match your search. Try adjusting filters.
          </p>
        </div>
      )}
    </div>
  );
}
