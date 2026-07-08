"use client";

import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

interface DescriptiveRendererProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptiveRenderer({
  value,
  onChange,
}: DescriptiveRendererProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Write your answer
      </p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your detailed answer here..."
        rows={10}
        className="text-sm leading-relaxed border-2 border-border/50 focus:border-primary transition-colors rounded-xl resize-y min-h-[200px] p-4"
        spellCheck
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {wordCount} word{wordCount !== 1 ? "s" : ""} •{" "}
          {value.length} characters
        </span>
        {value.length > 0 && (
          <button
            onClick={() => onChange("")}
            className="text-rose-500 hover:text-rose-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </motion.div>
  );
}
