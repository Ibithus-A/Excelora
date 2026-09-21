"use client";

import { CHAPTER_ONE_ASSESSMENT_KEY } from "@/lib/assessment-config";
import { useCallback, useEffect, useState } from "react";

export type AssessmentAttemptSummary = {
  status: "active" | "submitted";
  score?: number;
  total_marks: number;
  automated_total_marks?: number;
  pending_review_marks?: number;
  locked_questions: string[];
  started_at: string;
  deadline_at: string;
  submitted_at: string | null;
};

export type AssessmentPrerequisiteSummary = {
  isComplete: boolean;
  completedCount: number;
  totalCount: number;
};

const EMPTY_PREREQUISITE: AssessmentPrerequisiteSummary = {
  isComplete: false,
  completedCount: 0,
  totalCount: 0,
};

export function useAssessmentAccess(
  studentId: string | null,
  progressVersion = "",
) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [requiresPremium, setRequiresPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<AssessmentAttemptSummary | null>(null);
  const [prerequisite, setPrerequisite] = useState<AssessmentPrerequisiteSummary>(EMPTY_PREREQUISITE);

  const refresh = useCallback(async () => {
    if (!studentId) {
      setIsUnlocked(false);
      setRequiresPremium(false);
      setIsLoading(false);
      setAttempt(null);
      setPrerequisite(EMPTY_PREREQUISITE);
      setError("");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        assessmentKey: CHAPTER_ONE_ASSESSMENT_KEY,
        studentId,
        progressVersion,
      });
      const response = await fetch(`/api/generated-assessments?${params}`, { cache: "no-store" });
      const payload = (await response.json()) as { isUnlocked?: boolean; requiresPremium?: boolean; prerequisite?: AssessmentPrerequisiteSummary; attempt?: AssessmentAttemptSummary | null; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to load assessment access.");
      setIsUnlocked(Boolean(payload.isUnlocked));
      setRequiresPremium(Boolean(payload.requiresPremium));
      setAttempt(payload.attempt ?? null);
      setPrerequisite(payload.prerequisite ?? EMPTY_PREREQUISITE);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load assessment access.");
    } finally {
      setIsLoading(false);
    }
  }, [progressVersion, studentId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const toggle = useCallback(async () => {
    if (!studentId) return;
    const next = !isUnlocked;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/assessments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          assessmentKey: CHAPTER_ONE_ASSESSMENT_KEY,
          isUnlocked: next,
        }),
      });
      const payload = (await response.json()) as { isUnlocked?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to update assessment access.");
      setIsUnlocked(Boolean(payload.isUnlocked));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update assessment access.");
    } finally {
      setIsLoading(false);
    }
  }, [isUnlocked, studentId]);

  return { isUnlocked, requiresPremium, prerequisite, isLoading, error, attempt, toggle, refresh };
}
