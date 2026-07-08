"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ExamOption } from "@/stores/exam-store";
import { cn } from "@/lib/utils";

interface MultiSelectRendererProps {
  options: ExamOption[];
  selectedOptionIds: string[];
  onToggle: (optionId: string) => void;
}

const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function MultiSelectRenderer({
  options,
  selectedOptionIds,
  onToggle,
}: MultiSelectRendererProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-4">
        Select all that apply{" "}
        <span className="text-primary">
          ({selectedOptionIds.length} selected)
        </span>
      </p>
      {options.map((option, i) => {
        const isSelected = selectedOptionIds.includes(option.id);
        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onToggle(option.id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                isSelected
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                </motion.div>
              )}
            </div>
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {optionLabels[i] || i + 1}
            </div>
            <span className={cn("text-sm flex-1", isSelected && "font-medium")}>
              {option.text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
