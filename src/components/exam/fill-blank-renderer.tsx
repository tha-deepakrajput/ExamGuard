"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

interface FillBlankRendererProps {
  value: string;
  onChange: (value: string) => void;
}

export function FillBlankRenderer({
  value,
  onChange,
}: FillBlankRendererProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Type your answer
      </p>
      <div className="max-w-lg">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer here..."
          className="h-14 text-base px-5 border-2 border-border/50 focus:border-primary transition-colors rounded-xl"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{value.length} characters</span>
          {value.length > 0 && (
            <button
              onClick={() => onChange("")}
              className="text-rose-500 hover:text-rose-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
