"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  timeRemaining: number;
  duration: number;
  onTick: () => void;
  onTimeUp: () => void;
}

export function ExamTimer({
  timeRemaining,
  duration,
  onTick,
  onTimeUp,
}: ExamTimerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      onTick();
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTick, onTimeUp]);

  if (!isClient) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const formatTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const isWarning = timeRemaining <= 300; // 5 minutes
  const isCritical = timeRemaining <= 60; // 1 minute

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold transition-colors duration-300",
        isCritical
          ? "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse"
          : isWarning
          ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border/50 bg-muted/50"
      )}
    >
      <Clock className="w-4 h-4" />
      {formatTime}
    </div>
  );
}
