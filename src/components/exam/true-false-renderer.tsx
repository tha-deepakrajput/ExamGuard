"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrueFalseRendererProps {
  selectedOptionId?: string;
  trueOptionId: string;
  falseOptionId: string;
  onSelect: (optionId: string) => void;
}

export function TrueFalseRenderer({
  selectedOptionId,
  trueOptionId,
  falseOptionId,
  onSelect,
}: TrueFalseRendererProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-4">
        Select True or False
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {[
          { id: trueOptionId, label: "True", icon: Check, color: "emerald" },
          { id: falseOptionId, label: "False", icon: X, color: "rose" },
        ].map((item, i) => {
          const isSelected = selectedOptionId === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 transition-all duration-200",
                isSelected && item.color === "emerald" &&
                  "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10",
                isSelected && item.color === "rose" &&
                  "border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10",
                !isSelected &&
                  "border-border/50 hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                  isSelected && item.color === "emerald" && "bg-emerald-500 text-white",
                  isSelected && item.color === "rose" && "bg-rose-500 text-white",
                  !isSelected && "bg-muted text-muted-foreground"
                )}
              >
                <item.icon className="w-7 h-7" strokeWidth={2.5} />
              </div>
              <span
                className={cn(
                  "text-lg font-bold transition-colors",
                  isSelected && item.color === "emerald" && "text-emerald-600 dark:text-emerald-400",
                  isSelected && item.color === "rose" && "text-rose-600 dark:text-rose-400",
                  !isSelected && "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
