"use client";

import { useEffect } from "react";
import { ProctoringProvider } from "@/components/exam/proctoring-provider";

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Prevent accidental navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    // Prevent back button
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Lock body scroll
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <ProctoringProvider>
      <div className="fixed inset-0 bg-background overflow-hidden flex flex-col">
        {children}
      </div>
    </ProctoringProvider>
  );
}
