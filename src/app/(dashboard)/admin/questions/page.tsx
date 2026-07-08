"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Upload,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Tag,
  CheckCircle2,
  X,
  FileSpreadsheet,
  FolderOpen,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categories = [
  { id: "all", name: "All Categories", count: 156 },
  { id: "math", name: "Mathematics", count: 42 },
  { id: "cs", name: "Computer Science", count: 38 },
  { id: "physics", name: "Physics", count: 28 },
  { id: "chemistry", name: "Chemistry", count: 22 },
  { id: "english", name: "English", count: 16 },
  { id: "biology", name: "Biology", count: 10 },
];

const mockQuestions = [
  { id: "1", text: "What is the derivative of sin(x)?", type: "mcq" as const, difficulty: "easy" as const, tags: ["Calculus", "Trigonometry"], category: "Mathematics", usedIn: 3, createdAt: "2025-05-01" },
  { id: "2", text: "Explain the concept of polymorphism in OOP.", type: "descriptive" as const, difficulty: "medium" as const, tags: ["OOP", "Theory"], category: "Computer Science", usedIn: 5, createdAt: "2025-04-15" },
  { id: "3", text: "Which of the following is a noble gas?", type: "mcq" as const, difficulty: "easy" as const, tags: ["Periodic Table", "Elements"], category: "Chemistry", usedIn: 2, createdAt: "2025-05-10" },
  { id: "4", text: "Newton's second law states F = ma.", type: "true_false" as const, difficulty: "easy" as const, tags: ["Mechanics", "Laws"], category: "Physics", usedIn: 7, createdAt: "2025-03-20" },
  { id: "5", text: "The time complexity of merge sort is ____.", type: "fill_blank" as const, difficulty: "medium" as const, tags: ["Sorting", "Algorithms"], category: "Computer Science", usedIn: 4, createdAt: "2025-04-25" },
  { id: "6", text: "What is the integral of 1/x?", type: "mcq" as const, difficulty: "medium" as const, tags: ["Calculus", "Integration"], category: "Mathematics", usedIn: 6, createdAt: "2025-05-05" },
  { id: "7", text: "DNA stands for ____.", type: "fill_blank" as const, difficulty: "easy" as const, tags: ["Genetics", "Basics"], category: "Biology", usedIn: 8, createdAt: "2025-02-10" },
  { id: "8", text: "Which sorting algorithm has the best average case?", type: "multi_select" as const, difficulty: "hard" as const, tags: ["Sorting", "Algorithms"], category: "Computer Science", usedIn: 2, createdAt: "2025-05-18" },
  { id: "9", text: "Discuss the themes of isolation in 'The Great Gatsby'.", type: "descriptive" as const, difficulty: "hard" as const, tags: ["Literature", "Novel"], category: "English", usedIn: 1, createdAt: "2025-04-01" },
  { id: "10", text: "What is the Heisenberg uncertainty principle?", type: "descriptive" as const, difficulty: "hard" as const, tags: ["Quantum", "Theory"], category: "Physics", usedIn: 3, createdAt: "2025-03-15" },
  { id: "11", text: "The eigenvalue of an identity matrix is always 1.", type: "true_false" as const, difficulty: "medium" as const, tags: ["Linear Algebra", "Matrices"], category: "Mathematics", usedIn: 5, createdAt: "2025-05-12" },
  { id: "12", text: "What is the pH of pure water at 25°C?", type: "fill_blank" as const, difficulty: "easy" as const, tags: ["Acids", "Bases"], category: "Chemistry", usedIn: 9, createdAt: "2025-01-20" },
];

type Question = (typeof mockQuestions)[number];

const typeLabels: Record<string, string> = {
  mcq: "MCQ",
  multi_select: "Multi-Select",
  true_false: "True/False",
  fill_blank: "Fill Blank",
  descriptive: "Descriptive",
};

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default function AdminQuestionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const filtered = mockQuestions.filter((q) => {
    if (selectedCategory !== "all" && q.category !== categories.find((c) => c.id === selectedCategory)?.name) return false;
    if (typeFilter !== "all" && q.type !== typeFilter) return false;
    if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  const columns: Column<Question>[] = [
    {
      key: "text",
      header: "Question",
      render: (q) => (
        <div className="max-w-md">
          <p className="text-sm font-medium line-clamp-2">{q.text}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {q.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] py-0 h-5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (q) => (
        <Badge variant="outline" className="text-xs">{typeLabels[q.type]}</Badge>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      sortable: true,
      render: (q) => (
        <Badge variant="secondary" className={cn("text-xs capitalize", difficultyColors[q.difficulty])}>
          {q.difficulty}
        </Badge>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (q) => <span className="text-sm text-muted-foreground">{q.category}</span>,
    },
    {
      key: "usedIn",
      header: "Used In",
      sortable: true,
      className: "text-center",
      render: (q) => <span className="text-sm text-muted-foreground">{q.usedIn} exams</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (q) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="w-8 h-8" />}>
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => toast.info("Edit coming with API")}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Question duplicated")}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirmDialog({
                open: true,
                title: "Delete Question",
                description: "Are you sure you want to delete this question? This action cannot be undone.",
                onConfirm: () => {
                  toast.success("Question deleted");
                  setConfirmDialog((d) => ({ ...d, open: false }));
                },
              })}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank"
        description="Manage your question repository across subjects"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Question Bank" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Export feature coming soon")}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="gradient-primary text-white border-0 shadow-lg shadow-primary/25" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Questions" value={156} icon={BookOpen} gradient="from-blue-500 to-indigo-600" bgGlow="bg-blue-500/10" delay={0} />
        <StatCard title="Categories" value={6} icon={FolderOpen} gradient="from-emerald-500 to-teal-600" bgGlow="bg-emerald-500/10" delay={0.1} />
        <StatCard title="MCQ Questions" value={72} icon={CheckCircle2} gradient="from-violet-500 to-purple-600" bgGlow="bg-violet-500/10" delay={0.2} />
        <StatCard title="Avg. Usage" value="4.2" subtitle="exams per question" icon={Tag} gradient="from-amber-500 to-orange-600" bgGlow="bg-amber-500/10" delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Category Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                      selectedCategory === cat.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs">{cat.count}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mcq">MCQ</SelectItem>
                <SelectItem value="multi_select">Multi-Select</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="fill_blank">Fill Blank</SelectItem>
                <SelectItem value="descriptive">Descriptive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={(v) => v && setDifficultyFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            data={filtered}
            columns={columns}
            searchKey="text"
            searchPlaceholder="Search questions..."
            selectable
            pageSize={8}
            emptyTitle="No questions found"
            emptyDescription="Try adjusting your filters or add new questions."
            emptyIcon={BookOpen}
          />
        </motion.div>
      </div>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Questions</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file with questions. Download the template to see the required format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Drop your file here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Supports CSV and XLSX files</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => toast.info("Template download coming soon")}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-white border-0" onClick={() => { toast.success("Questions imported (demo)"); setImportDialogOpen(false); }}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Question to Bank</DialogTitle>
            <DialogDescription>Create a new question in the question bank.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue="mcq">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="multi_select">Multi-Select</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="fill_blank">Fill Blank</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select defaultValue="cs">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c.id !== "all").map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea placeholder="Enter your question..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input placeholder="e.g. Calculus, Integration" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-white border-0" onClick={() => { toast.success("Question added to bank"); setAddDialogOpen(false); }}>
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
