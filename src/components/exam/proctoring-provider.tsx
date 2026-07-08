"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useExamStore } from "@/stores/exam-store";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────

type ViolationType =
  | "tab_switch"
  | "fullscreen_exit"
  | "copy_attempt"
  | "paste_attempt"
  | "right_click"
  | "keyboard_shortcut"
  | "browser_resize"
  | "dev_tools"
  | "no_face"
  | "multiple_faces";

interface ProctoringContextValue {
  logViolation: (type: ViolationType, description?: string) => void;
  violationCount: number;
  maxViolations: number;
}

const ProctoringContext = createContext<ProctoringContextValue>({
  logViolation: () => {},
  violationCount: 0,
  maxViolations: 5,
});

export const useProctoring = () => useContext(ProctoringContext);

// ─── Violation Labels ───────────────────────────────────────────

const violationLabels: Record<ViolationType, string> = {
  tab_switch: "Tab switch detected",
  fullscreen_exit: "Fullscreen exit detected",
  copy_attempt: "Copy attempt blocked",
  paste_attempt: "Paste attempt blocked",
  right_click: "Right-click blocked",
  keyboard_shortcut: "Keyboard shortcut blocked",
  browser_resize: "Browser resize detected",
  dev_tools: "Developer tools detected",
  no_face: "No face detected",
  multiple_faces: "Multiple faces detected",
};

// ─── Provider ───────────────────────────────────────────────────

export function ProctoringProvider({ children }: { children: ReactNode }) {
  const attemptId = useExamStore((s) => s.attemptId);
  const violationCount = useExamStore((s) => s.violationCount);
  const maxViolations = useExamStore((s) => s.maxViolations);
  const proctoringEnabled = useExamStore((s) => s.proctoringEnabled);
  const status = useExamStore((s) => s.status);
  const addViolation = useExamStore((s) => s.addViolation);
  const submitExam = useExamStore((s) => s.submitExam);

  const lastViolationRef = useRef<{ type: string; time: number }>({
    type: "",
    time: 0,
  });

  // ── Log violation to server and store ──
  const logViolation = useCallback(
    (type: ViolationType, description?: string) => {
      if (status !== "in_progress" || !proctoringEnabled) return;

      // Debounce same violation type within 3 seconds
      const now = Date.now();
      if (
        lastViolationRef.current.type === type &&
        now - lastViolationRef.current.time < 3000
      ) {
        return;
      }
      lastViolationRef.current = { type, time: now };

      const newCount = addViolation();

      // Show warning toast
      const label = violationLabels[type] || type;
      const remaining = maxViolations - newCount;

      if (remaining > 0) {
        toast.warning(`⚠️ ${label}`, {
          description: `Warning ${newCount}/${maxViolations}. ${remaining} warning${remaining > 1 ? "s" : ""} remaining before auto-submit.`,
          duration: 4000,
        });
      } else {
        toast.error("🚫 Maximum violations reached!", {
          description: "Your exam is being auto-submitted.",
          duration: 5000,
        });
      }

      // Send to server (fire-and-forget)
      if (attemptId) {
        fetch(`/api/attempts/${attemptId}/violations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            severity: remaining <= 1 ? "critical" : remaining <= 2 ? "high" : "medium",
            description: description || label,
          }),
        }).catch(console.error);
      }

      // Auto-submit if violations exceed max
      if (newCount >= maxViolations) {
        setTimeout(() => {
          // Submit via API
          if (attemptId) {
            fetch(`/api/attempts/${attemptId}/submit`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ autoSubmitted: true }),
            }).catch(console.error);
          }
          submitExam();
        }, 1500);
      }
    },
    [attemptId, status, proctoringEnabled, maxViolations, addViolation, submitExam]
  );

  // ── Tab visibility change ──
  useEffect(() => {
    if (!proctoringEnabled || status !== "in_progress") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("tab_switch", "Student switched to another tab/window");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [proctoringEnabled, status, logViolation]);

  // ── Fullscreen exit ──
  useEffect(() => {
    if (!proctoringEnabled || status !== "in_progress") return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation("fullscreen_exit", "Student exited fullscreen mode");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [proctoringEnabled, status, logViolation]);

  // ── Copy / Paste / Right-click prevention ──
  useEffect(() => {
    if (!proctoringEnabled || status !== "in_progress") return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation("copy_attempt", "Student attempted to copy content");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation("paste_attempt", "Student attempted to paste content");
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logViolation("right_click", "Student attempted to right-click");
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [proctoringEnabled, status, logViolation]);

  // ── Keyboard shortcut blocking ──
  useEffect(() => {
    if (!proctoringEnabled || status !== "in_progress") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Block: Ctrl/Cmd + C, V, P, S, U, A, Shift+I
      if (ctrlOrCmd && ["c", "v", "p", "s", "u", "a"].includes(e.key.toLowerCase())) {
        // Allow Ctrl+A in textareas/inputs for text selection
        const target = e.target as HTMLElement;
        if (e.key.toLowerCase() === "a" && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
          return;
        }
        e.preventDefault();
        logViolation("keyboard_shortcut", `Blocked: ${isMac ? "Cmd" : "Ctrl"}+${e.key.toUpperCase()}`);
      }

      // Block Ctrl+Shift+I (DevTools)
      if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        logViolation("dev_tools", "Attempted to open DevTools");
      }

      // Block F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        logViolation("dev_tools", "Attempted to open DevTools via F12");
      }

      // Block Alt+Tab (we can't truly block it but we detect the blur)
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        logViolation("keyboard_shortcut", "Alt+Tab detected");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [proctoringEnabled, status, logViolation]);

  // ── Browser resize / DevTools detection ──
  useEffect(() => {
    if (!proctoringEnabled || status !== "in_progress") return;

    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    const handleResize = () => {
      const widthDiff = Math.abs(window.innerWidth - lastWidth);
      const heightDiff = Math.abs(window.innerHeight - lastHeight);

      // Only flag significant resizes (likely DevTools or window manipulation)
      if (widthDiff > 200 || heightDiff > 200) {
        logViolation("browser_resize", `Window resized by ${widthDiff}x${heightDiff}px`);
      }

      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [proctoringEnabled, status, logViolation]);

  // ── Disable text selection via CSS ──
  useEffect(() => {
    if (!proctoringEnabled || status !== "in_progress") return;

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    return () => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [proctoringEnabled, status]);

  return (
    <ProctoringContext.Provider
      value={{ logViolation, violationCount, maxViolations }}
    >
      {children}
    </ProctoringContext.Provider>
  );
}
