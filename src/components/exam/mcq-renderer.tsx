"use client";

import { motion } from "framer-motion";
import type { ExamOption } from "@/stores/exam-store";
import { cn } from "@/lib/utils";

interface MCQRendererProps {
  options: ExamOption[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function MCQRenderer({
  options,
  selectedOptionId,
  onSelect,
}: MCQRendererProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-4">
        Select one option
      </p>
      {options.map((option, i) => {
        const isSelected = selectedOptionId === option.id;
        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(option.id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {optionLabels[i] || i + 1}
            </div>
            <span className={cn("text-sm flex-1", isSelected && "font-medium")}>
              {option.text}
            </span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
