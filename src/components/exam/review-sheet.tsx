"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Flag, FileText } from "lucide-react";
import { useExamStore, useExamProgress } from "@/stores/exam-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ReviewSheetProps {
  onSubmit: () => void;
}

export function ReviewSheet({ onSubmit }: ReviewSheetProps) {
  const { questions, answers, flaggedQuestions, goToQuestion, cancelReview } =
    useExamStore();
  const progress = useExamProgress();

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Review Your Answers</h2>
          <p className="text-muted-foreground">
            Please review your exam before final submission.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-emerald-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {progress.answered}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  Answered
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-border/50",
              progress.unanswered > 0 ? "bg-rose-500/5" : "bg-muted/30"
            )}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  progress.unanswered > 0
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    progress.unanswered > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-foreground"
                  )}
                >
                  {progress.unanswered}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  Unanswered
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-border/50",
              progress.flagged > 0 ? "bg-amber-500/5" : "bg-muted/30"
            )}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  progress.flagged > 0
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    progress.flagged > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-foreground"
                  )}
                >
                  {progress.flagged}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  Flagged
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question List */}
        <Card className="border-border/50">
          <div className="divide-y divide-border/50 max-h-[50vh] overflow-y-auto">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isFlagged = flaggedQuestions.includes(q.id);

              return (
                <div
                  key={q.id}
                  className="flex items-start sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 sm:mt-0",
                        isAnswered
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-md">
                        {q.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isAnswered
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {isAnswered ? "Answered" : "Not Answered"}
                        </span>
                        {isFlagged && (
                          <>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Flag className="w-3 h-3" /> Flagged
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      cancelReview();
                      goToQuestion(i);
                    }}
                    className="flex-shrink-0"
                  >
                    Go to Question
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4">
          <Button variant="ghost" onClick={cancelReview}>
            Return to Exam
          </Button>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {progress.unanswered > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-rose-500 text-sm">
                <AlertTriangle className="w-4 h-4" />
                You have {progress.unanswered} unanswered questions
              </div>
            )}
            <Button
              className="w-full sm:w-auto gradient-primary text-white border-0 shadow-lg shadow-primary/25"
              onClick={onSubmit}
            >
              Submit Examination
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
