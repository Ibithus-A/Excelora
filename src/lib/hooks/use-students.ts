"use client";

import {
  sanitizeCustomUnlockedChapterTitles,
  sanitizeTaggedChapterTitle,
} from "@/lib/access";
import { normalizeEmail, resolveDisplayFirstName } from "@/lib/auth";
import type { UserAccessProfile, UserPlan, UserRole } from "@/types/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

type ProfilePayload = {
  id?: unknown;
  name?: unknown;
  email?: unknown;
  role?: unknown;
  plan?: unknown;
  taggedChapterTitle?: unknown;
  customUnlockedChapterTitles?: unknown;
};

function sortProfiles(students: UserAccessProfile[]) {
  return [...students].sort((left, right) => left.name.localeCompare(right.name));
}

function sanitizeRole(value: unknown): UserRole {
  return value === "tutor" ? "tutor" : "student";
}

function sanitizePlan(value: unknown): UserPlan {
  return value === "premium" ? "premium" : "basic";
}

function sanitizeProfile(value: unknown): UserAccessProfile | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as ProfilePayload;
  if (typeof candidate.id !== "string" || typeof candidate.email !== "string") return null;
  if (typeof candidate.name !== "string") return null;

  const role = sanitizeRole(candidate.role);
  const email = normalizeEmail(candidate.email);
  const plan = sanitizePlan(candidate.plan);

  return {
    id: candidate.id,
    name: resolveDisplayFirstName(candidate.name, email, role),
    email,
    role,
    plan,
    taggedChapterTitle: sanitizeTaggedChapterTitle(candidate.taggedChapterTitle),
    customUnlockedChapterTitles: sanitizeCustomUnlockedChapterTitles(
      candidate.customUnlockedChapterTitles,
    ),
  };
}

function sanitizeStudents(value: unknown): UserAccessProfile[] {
  if (!Array.isArray(value)) return [];

  const unique = new Map<string, UserAccessProfile>();
  for (const entry of value) {
    const profile = sanitizeProfile(entry);
    if (!profile || profile.role !== "student") continue;
    unique.set(profile.id, profile);
  }

  return sortProfiles(Array.from(unique.values()));
}

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

      const payload = (await response.json()) as {
        viewer?: unknown;
        students?: unknown;
      };

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
          const payload = (await response.json().catch(() => ({}))) as { error?: unknown };
          return {
            ok: false,
            error:
              typeof payload.error === "string" && payload.error.trim()
                ? payload.error
                : "Unable to update access.",
          };
        }

        const payload = (await response.json()) as { student?: unknown };
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
        const payload = (await response.json().catch(() => ({}))) as { error?: unknown };
        return {
          ok: false,
          error:
            typeof payload.error === "string" && payload.error.trim()
              ? payload.error
              : "Unable to delete student.",
        };
      }

      const payload = (await response.json()) as { deletedUserId?: unknown };
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
