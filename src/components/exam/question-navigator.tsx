"use client";

import { Flag } from "lucide-react";
import { useExamStore, useExamProgress } from "@/stores/exam-store";
import { cn } from "@/lib/utils";

export function QuestionNavigator() {
  const {
    questions,
    currentIndex,
    answers,
    flaggedQuestions,
    visitedQuestions,
    goToQuestion,
  } = useExamStore();
  const progress = useExamProgress();

  return (
    <div className="flex flex-col h-full bg-muted/20 border-l border-border/50 w-full sm:w-80 flex-shrink-0">
      {/* Header Stats */}
      <div className="p-4 border-b border-border/50 bg-background/50">
        <h3 className="text-sm font-semibold mb-3">Question Navigator</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-muted-foreground">
              Answered ({progress.answered})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted-foreground/30" />
            <span className="text-muted-foreground">
              Unanswered ({progress.unanswered})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-border" />
            <span className="text-muted-foreground">Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-muted-foreground">
              Flagged ({progress.flagged})
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {questions.map((q, i) => {
            const isCurrent = currentIndex === i;
            const isAnswered = !!answers[q.id];
            const isFlagged = flaggedQuestions.includes(q.id);
            const isVisited = visitedQuestions.includes(q.id);

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(i)}
                className={cn(
                  "relative w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                  isCurrent
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:bg-muted/50",
                  !isVisited && !isCurrent
                    ? "border border-border/50 text-muted-foreground"
                    : isAnswered
                    ? "bg-emerald-500 text-white border-transparent"
                    : "bg-muted-foreground/20 text-foreground border-transparent"
                )}
              >
                {i + 1}
                {isFlagged && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-background flex items-center justify-center">
                    <Flag className="w-2 h-2 text-white fill-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
