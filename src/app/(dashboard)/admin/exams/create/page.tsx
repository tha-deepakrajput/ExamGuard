"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Clock,
  FileText,
  Settings,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  AlertTriangle,
  Upload,
  BookOpen,
  Shield,
  Shuffle,
  Edit,
  AlertCircle,
  CalendarDays,
  Percent,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Question {
  id: string;
  type: "mcq" | "multi_select" | "true_false" | "fill_blank" | "descriptive";
  text: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  correctAnswer?: string;
}

const STEPS = [
  { id: "basic", label: "Basic Info", icon: Info },
  { id: "questions", label: "Questions", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "review", label: "Review", icon: Eye },
];

const difficultyColors = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const questionTypeLabels = {
  mcq: "Multiple Choice",
  multi_select: "Multi Select",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
  descriptive: "Descriptive",
};

export default function CreateExamPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Basic info state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("60");
  const [totalMarks, setTotalMarks] = useState("100");
  const [passingPercentage, setPassingPercentage] = useState("40");
  const [instructions, setInstructions] = useState("");

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      type: "mcq",
      text: "What is the time complexity of binary search?",
      marks: 2,
      difficulty: "easy",
      options: [
        { id: "o1", text: "O(n)", isCorrect: false },
        { id: "o2", text: "O(log n)", isCorrect: true },
        { id: "o3", text: "O(n²)", isCorrect: false },
        { id: "o4", text: "O(1)", isCorrect: false },
      ],
    },
    {
      id: "q2",
      type: "mcq",
      text: "Which data structure uses LIFO principle?",
      marks: 2,
      difficulty: "easy",
      options: [
        { id: "o5", text: "Queue", isCorrect: false },
        { id: "o6", text: "Stack", isCorrect: true },
        { id: "o7", text: "Array", isCorrect: false },
        { id: "o8", text: "Linked List", isCorrect: false },
      ],
    },
    {
      id: "q3",
      type: "true_false",
      text: "A binary tree can have at most 2 children per node.",
      marks: 1,
      difficulty: "easy",
      options: [
        { id: "o9", text: "True", isCorrect: true },
        { id: "o10", text: "False", isCorrect: false },
      ],
    },
    {
      id: "q4",
      type: "fill_blank",
      text: "The worst-case time complexity of QuickSort is ____.",
      marks: 2,
      difficulty: "medium",
      options: [],
      correctAnswer: "O(n²)",
    },
  ]);

  // New question form state
  const [newQType, setNewQType] = useState<Question["type"]>("mcq");
  const [newQText, setNewQText] = useState("");
  const [newQMarks, setNewQMarks] = useState("2");
  const [newQDifficulty, setNewQDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [newQOptions, setNewQOptions] = useState([
    { id: "n1", text: "", isCorrect: false },
    { id: "n2", text: "", isCorrect: false },
    { id: "n3", text: "", isCorrect: false },
    { id: "n4", text: "", isCorrect: false },
  ]);
  const [newQAnswer, setNewQAnswer] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Settings state
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [maxViolations, setMaxViolations] = useState("5");
  const [autoTerminate, setAutoTerminate] = useState(true);
  const [showResults, setShowResults] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [negativeMarking, setNegativeMarking] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const addQuestion = () => {
    if (!newQText.trim()) {
      toast.error("Question text is required");
      return;
    }
    const q: Question = {
      id: editingQuestionId || `q${Date.now()}`,
      type: newQType,
      text: newQText,
      marks: parseInt(newQMarks) || 2,
      difficulty: newQDifficulty,
      options:
        newQType === "true_false"
          ? [
              { id: `tf1-${Date.now()}`, text: "True", isCorrect: true },
              { id: `tf2-${Date.now()}`, text: "False", isCorrect: false },
            ]
          : newQType === "fill_blank" || newQType === "descriptive"
          ? []
          : newQOptions.filter((o) => o.text.trim()),
      correctAnswer:
        newQType === "fill_blank" ? newQAnswer : undefined,
    };
    
    if (editingQuestionId) {
      setQuestions(questions.map((existingQ) => (existingQ.id === editingQuestionId ? q : existingQ)));
      toast.success("Question updated");
    } else {
      setQuestions([...questions, q]);
      toast.success("Question added");
    }
    
    // Reset
    setNewQText("");
    setNewQOptions([
      { id: "n1", text: "", isCorrect: false },
      { id: "n2", text: "", isCorrect: false },
      { id: "n3", text: "", isCorrect: false },
      { id: "n4", text: "", isCorrect: false },
    ]);
    setNewQAnswer("");
    setEditingQuestionId(null);
    setAddQuestionOpen(false);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.success("Question removed");
  };

  const saveExam = async (status: "draft" | "published") => {
    if (!title) {
      toast.error("Exam title is required");
      return;
    }
    
    setIsSaving(true);
    const loadingToastId = toast.loading(`Saving exam as ${status}...`);
    
    try {
      // 1. Create the exam
      const examRes = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          subject,
          category,
          durationMinutes: duration,
          totalMarks,
          passingPercentage,
          negativeMarkingPercentage: negativeMarking,
          instructions,
          shuffleQuestions,
          shuffleOptions,
          proctoringEnabled,
          maxViolations,
          autoTerminateOnViolations: autoTerminate,
          showResults,
          showAnswers,
          maxAttempts,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status,
        }),
      });
      
      if (!examRes.ok) {
        const err = await examRes.json();
        throw new Error(err.error || "Failed to create exam");
      }
      
      const newExam = await examRes.json();
      
      // 2. Insert questions if there are any
      if (questions.length > 0) {
        const qRes = await fetch(`/api/admin/exams/${newExam.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions }),
        });
        
        if (!qRes.ok) {
          const err = await qRes.json();
          throw new Error(err.error || "Failed to save questions");
        }
      }
      
      toast.success(`Exam successfully saved as ${status}!`, { id: loadingToastId });
      router.push("/admin/exams");
    } catch (error: any) {
      toast.error(error.message || "An error occurred", { id: loadingToastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => saveExam("published");
  const handleSaveDraft = () => saveExam("draft");

  const totalQuestionMarks = questions.reduce((acc, q) => acc + q.marks, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Exam"
        description="Set up your examination with a step-by-step wizard"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Exams", href: "/admin/exams" },
          { label: "Create" },
        ]}
        actions={
          <Link href="/admin/exams">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        {STEPS.map((step, i) => (
          <div
            key={step.id}
            className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}
          >
            <button
              onClick={() => setCurrentStep(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                i === currentStep
                  ? "bg-primary/10 text-primary"
                  : i < currentStep
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  i === currentStep
                    ? "gradient-primary text-white shadow-lg shadow-primary/25"
                    : i < currentStep
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-3 rounded-full transition-all",
                  i < currentStep ? "bg-emerald-500" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="exam-title">Exam Title *</Label>
                    <Input
                      id="exam-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Advanced Mathematics - Final Exam"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="exam-desc">Description</Label>
                    <Textarea
                      id="exam-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this examination..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-subject">Subject</Label>
                    <Select value={subject} onValueChange={(v) => v && setSubject(v)}>
                      <SelectTrigger id="exam-subject" className="h-11">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-category">Category</Label>
                    <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                      <SelectTrigger id="exam-category" className="h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-duration">Duration (minutes)</Label>
                    <Input
                      id="exam-duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-marks">Total Marks</Label>
                    <Input
                      id="exam-marks"
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-passing">Passing Percentage (%)</Label>
                    <Input
                      id="exam-passing"
                      type="number"
                      value={passingPercentage}
                      onChange={(e) => setPassingPercentage(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exam-instructions">Instructions for Students</Label>
                  <Textarea
                    id="exam-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Enter exam instructions that students will see before starting..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Questions */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    {questions.length} Questions
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    {totalQuestionMarks} Total Marks
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Import feature coming soon")}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV/XLSX
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Question bank import coming soon")}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    From Bank
                  </Button>
                  <Button
                    size="sm"
                    className="gradient-primary text-white border-0"
                    onClick={() => {
                      setEditingQuestionId(null);
                      setNewQType("mcq");
                      setNewQText("");
                      setNewQMarks("2");
                      setNewQDifficulty("medium");
                      setNewQOptions([
                        { id: "n1", text: "", isCorrect: false },
                        { id: "n2", text: "", isCorrect: false },
                        { id: "n3", text: "", isCorrect: false },
                        { id: "n4", text: "", isCorrect: false },
                      ]);
                      setNewQAnswer("");
                      setAddQuestionOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {questions.map((q, i) => (
                  <Card key={q.id} className="border-border/50 group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
                          <span className="text-sm font-bold text-muted-foreground w-6">
                            {i + 1}.
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{q.text}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {questionTypeLabels[q.type]}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={cn("text-xs", difficultyColors[q.difficulty])}
                            >
                              {q.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {q.marks} marks
                            </span>
                          </div>
                          {q.options.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {q.options.map((opt) => (
                                <div
                                  key={opt.id}
                                  className={cn(
                                    "text-xs px-3 py-1.5 rounded-md border",
                                    opt.isCorrect
                                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                                      : "border-border/50 text-muted-foreground"
                                  )}
                                >
                                  {opt.isCorrect && (
                                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                  )}
                                  {opt.text}
                                </div>
                              ))}
                            </div>
                          )}
                          {q.correctAnswer && (
                            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3 inline mr-1" />
                              Answer: {q.correctAnswer}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                            onClick={() => {
                              setEditingQuestionId(q.id);
                              setNewQType(q.type);
                              setNewQText(q.text);
                              setNewQMarks(q.marks.toString());
                              setNewQDifficulty(q.difficulty);
                              if (q.options && q.options.length > 0 && q.type !== "true_false") {
                                const paddedOptions = [...q.options];
                                while (paddedOptions.length < 4) {
                                  paddedOptions.push({ id: `n${paddedOptions.length + 1}`, text: "", isCorrect: false });
                                }
                                setNewQOptions(paddedOptions);
                              } else {
                                setNewQOptions([
                                  { id: "n1", text: "", isCorrect: false },
                                  { id: "n2", text: "", isCorrect: false },
                                  { id: "n3", text: "", isCorrect: false },
                                  { id: "n4", text: "", isCorrect: false },
                                ]);
                              }
                              setNewQAnswer(q.correctAnswer || "");
                              setAddQuestionOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            onClick={() => removeQuestion(q.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 2 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date & Time</Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date & Time</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Max Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Proctoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Proctoring</Label>
                      <p className="text-xs text-muted-foreground">AI-powered exam monitoring</p>
                    </div>
                    <Switch checked={proctoringEnabled} onCheckedChange={setProctoringEnabled} />
                  </div>
                  {proctoringEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="max-violations">Max Violations</Label>
                        <Input
                          id="max-violations"
                          type="number"
                          value={maxViolations}
                          onChange={(e) => setMaxViolations(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-terminate</Label>
                          <p className="text-xs text-muted-foreground">End exam on max violations</p>
                        </div>
                        <Switch checked={autoTerminate} onCheckedChange={setAutoTerminate} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shuffle className="w-4 h-4 text-primary" />
                    Randomization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Shuffle Questions</Label>
                      <p className="text-xs text-muted-foreground">Randomize question order</p>
                    </div>
                    <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Shuffle Options</Label>
                      <p className="text-xs text-muted-foreground">Randomize option order</p>
                    </div>
                    <Switch checked={shuffleOptions} onCheckedChange={setShuffleOptions} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neg-marking">Negative Marking (%)</Label>
                    <Input
                      id="neg-marking"
                      type="number"
                      value={negativeMarking}
                      onChange={(e) => setNegativeMarking(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Results</Label>
                      <p className="text-xs text-muted-foreground">Students can see results after submission</p>
                    </div>
                    <Switch checked={showResults} onCheckedChange={setShowResults} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Correct Answers</Label>
                      <p className="text-xs text-muted-foreground">Display answers after completion</p>
                    </div>
                    <Switch checked={showAnswers} onCheckedChange={setShowAnswers} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Exam Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Title</p>
                        <p className="font-medium">{title || "Untitled Exam"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                        <p className="font-medium">{subject || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                        <p className="font-medium">{category || "Not set"}</p>
                      </div>
                      {description && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                          <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-lg font-bold mt-0.5">{duration} min</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-xs text-muted-foreground">Total Marks</p>
                          <p className="text-lg font-bold mt-0.5">{totalMarks}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-xs text-muted-foreground">Questions</p>
                          <p className="text-lg font-bold mt-0.5">{questions.length}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-xs text-muted-foreground">Passing</p>
                          <p className="text-lg font-bold mt-0.5">{passingPercentage}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Settings Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={cn("w-2 h-2 rounded-full", proctoringEnabled ? "bg-emerald-500" : "bg-zinc-400")} />
                      Proctoring {proctoringEnabled ? "Enabled" : "Disabled"}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={cn("w-2 h-2 rounded-full", shuffleQuestions ? "bg-emerald-500" : "bg-zinc-400")} />
                      Shuffle Questions {shuffleQuestions ? "On" : "Off"}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={cn("w-2 h-2 rounded-full", showResults ? "bg-emerald-500" : "bg-zinc-400")} />
                      Show Results {showResults ? "On" : "Off"}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={cn("w-2 h-2 rounded-full", autoTerminate ? "bg-emerald-500" : "bg-zinc-400")} />
                      Auto-terminate {autoTerminate ? "On" : "Off"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warnings */}
              {(!title || questions.length === 0) && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Incomplete Exam
                        </p>
                        {!title && (
                          <p className="text-xs text-muted-foreground">• Exam title is required</p>
                        )}
                        {questions.length === 0 && (
                          <p className="text-xs text-muted-foreground">• Add at least one question</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save as Draft"}
          </Button>
          {currentStep === STEPS.length - 1 ? (
            <Button
              className="gradient-primary text-white border-0 shadow-lg shadow-primary/25"
              onClick={handlePublish}
              disabled={isSaving}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isSaving ? "Publishing..." : "Publish Exam"}
            </Button>
          ) : (
            <Button
              className="gradient-primary text-white border-0 shadow-lg shadow-primary/25"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestionId ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>{editingQuestionId ? "Update the details for this question." : "Create a new question for this exam."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newQType} onValueChange={(v) => v && setNewQType(v as Question["type"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="multi_select">Multi Select</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={newQMarks}
                  onChange={(e) => setNewQMarks(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={newQDifficulty} onValueChange={(v) => v && setNewQDifficulty(v as "easy" | "medium" | "hard")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="Enter your question here..."
                rows={3}
              />
            </div>
            {(newQType === "mcq" || newQType === "multi_select") && (
              <div className="space-y-3">
                <Label>Options (mark correct answer)</Label>
                <RadioGroup
                  value={newQOptions.findIndex((o) => o.isCorrect).toString()}
                  onValueChange={(v) => {
                    setNewQOptions(
                      newQOptions.map((o, idx) => ({
                        ...o,
                        isCorrect: idx === parseInt(v),
                      }))
                    );
                  }}
                  className="space-y-3"
                >
                  {newQOptions.map((opt, i) => (
                    <div key={opt.id} className="flex items-start gap-3">
                      <div className="pt-2">
                        <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
                      </div>
                      <Textarea
                        value={opt.text}
                        onChange={(e) => {
                          const next = [...newQOptions];
                          next[i] = { ...next[i], text: e.target.value };
                          setNewQOptions(next);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 min-h-[80px]"
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
            {newQType === "fill_blank" && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input
                  value={newQAnswer}
                  onChange={(e) => setNewQAnswer(e.target.value)}
                  placeholder="Enter the correct answer"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddQuestionOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary text-white border-0"
              onClick={addQuestion}
            >
              {editingQuestionId ? "Save Changes" : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
