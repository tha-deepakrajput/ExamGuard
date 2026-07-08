"use client";

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useExamProgress } from "@/stores/exam-store";

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SubmitDialog({
  open,
  onOpenChange,
  onConfirm,
}: SubmitDialogProps) {
  const progress = useExamProgress();
  const hasWarnings = progress.unanswered > 0 || progress.flagged > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Examination?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to submit your exam? You cannot change your
            answers after submission.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasWarnings && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 my-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="text-sm text-amber-700 dark:text-amber-400">
              <p className="font-semibold mb-1">Warning</p>
              <ul className="list-disc pl-4 space-y-1">
                {progress.unanswered > 0 && (
                  <li>You have {progress.unanswered} unanswered questions</li>
                )}
                {progress.flagged > 0 && (
                  <li>You have {progress.flagged} flagged questions</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Review Again</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-primary">
            Yes, Submit Exam
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
