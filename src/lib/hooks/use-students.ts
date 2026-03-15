"use client";

import type { ErrorPayload } from "@/lib/student-profiles";
import {
  sanitizeProfile,
  sanitizeStudents,
  sortProfiles,
  toErrorMessage,
} from "@/lib/student-profiles";
import type { UserAccessProfile, UserPlan } from "@/types/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

type StudentsResponsePayload = {
  viewer?: unknown;
  students?: unknown;
};

type StudentResponsePayload = {
  student?: unknown;
};

type DeleteStudentPayload = {
  deletedUserId?: unknown;
};

export type UpdateStudentAccessInput = {
  userId: string;
  plan: UserPlan;
  taggedChapterTitle: string | null;
  customUnlockedChapterTitles: string[];
};

export type UpdateStudentAccessResult =
  | { ok: true; student: UserAccessProfile }
  | { ok: false; error: string };

export type DeleteStudentResult =
  | { ok: true; deletedUserId: string }
  | { ok: false; error: string };

export function useStudents(currentUserEmail?: string | null) {
  const [viewerProfile, setViewerProfile] = useState<UserAccessProfile | null>(null);
  const [students, setStudents] = useState<UserAccessProfile[]>([]);

  const hydrateStudents = useCallback(async () => {
    try {
      const response = await fetch("/api/students", { cache: "no-store" });
      if (!response.ok) {
        if (response.status === 401) {
          setViewerProfile(null);
          setStudents([]);
        }
        return;
      }

      const payload = (await response.json()) as StudentsResponsePayload;

      setViewerProfile(sanitizeProfile(payload.viewer));
      setStudents(sanitizeStudents(payload.students));
    } catch {
      // Preserve last successful state on transient failures.
    }
  }, []);

  const updateStudentAccess = useCallback(
    async (input: UpdateStudentAccessInput): Promise<UpdateStudentAccessResult> => {
      try {
        const response = await fetch("/api/students", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: input.userId,
            plan: input.plan,
            taggedChapterTitle: input.taggedChapterTitle,
            customUnlockedChapterTitles: input.customUnlockedChapterTitles,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as ErrorPayload;
          return {
            ok: false,
            error: toErrorMessage(payload, "Unable to update access."),
          };
        }

        const payload = (await response.json()) as StudentResponsePayload;
        const student = sanitizeProfile(payload.student);
        if (!student) {
          return {
            ok: false,
            error: "Unable to update access.",
          };
        }

        setStudents((prev) =>
          sortProfiles(prev.map((candidate) => (candidate.id === student.id ? student : candidate))),
        );

        return { ok: true, student };
      } catch {
        return {
          ok: false,
          error: "Network error. Please try again.",
        };
      }
    },
    [],
  );

  const deleteStudent = useCallback(async (userId: string): Promise<DeleteStudentResult> => {
    try {
      const response = await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ErrorPayload;
        return {
          ok: false,
          error: toErrorMessage(payload, "Unable to delete student."),
        };
      }

      const payload = (await response.json()) as DeleteStudentPayload;
      if (typeof payload.deletedUserId !== "string" || !payload.deletedUserId.trim()) {
        return {
          ok: false,
          error: "Unable to delete student.",
        };
      }

      setStudents((prev) => prev.filter((student) => student.id !== payload.deletedUserId));

      return { ok: true, deletedUserId: payload.deletedUserId };
    } catch {
      return {
        ok: false,
        error: "Network error. Please try again.",
      };
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void hydrateStudents();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydrateStudents, currentUserEmail]);

  const stableStudents = useMemo(() => sortProfiles(students), [students]);

  return {
    viewerProfile,
    students: stableStudents,
    updateStudentAccess,
    deleteStudent,
    refreshStudents: hydrateStudents,
  };
}
