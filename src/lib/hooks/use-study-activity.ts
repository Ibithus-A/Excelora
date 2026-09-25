"use client";
import { useEffect } from "react";
/** One latest-state record; visible tab only, no background activity log. */
export function useStudyActivity(
  enabled: boolean,
  pageTitle: string,
  mode: "notes" | "video" | "practice" | "assessment" | "dashboard",
) {
  useEffect(() => {
    if (!enabled) return;
    let inFlight = false;
    const report = async () => {
      if (document.visibilityState !== "visible" || inFlight) return;
      inFlight = true;
      try {
        await fetch("/api/student-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageTitle: pageTitle.slice(0, 250), mode }),
        });
      } catch {
        /* Activity is best-effort; saved answers use their own explicit error handling. */
      } finally {
        inFlight = false;
      }
    };
    void report();
    const timer = window.setInterval(() => void report(), 45000);
    const visible = () => void report();
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [enabled, pageTitle, mode]);
}
