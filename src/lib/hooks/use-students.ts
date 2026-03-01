"use client";

import { isValidEmail, normalizeEmail, normalizeStudentName, type StudentAccount } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

function sortStudents(students: StudentAccount[]) {
  return [...students].sort((left, right) => left.name.localeCompare(right.name));
}

function sanitizeStudents(value: unknown): StudentAccount[] {
  if (!Array.isArray(value)) return [];

  const unique = new Map<string, StudentAccount>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Partial<StudentAccount>;
    if (typeof candidate.name !== "string" || typeof candidate.email !== "string") continue;

    const name = normalizeStudentName(candidate.name);
    const email = normalizeEmail(candidate.email);
    if (!name || !email) continue;

    const key = email.toLowerCase();
    if (unique.has(key)) continue;
    unique.set(key, { name, email });
  }

  return sortStudents(Array.from(unique.values()));
}

export type AddStudentResult = {
  student: StudentAccount;
  invitationSent: boolean;
} | null;

export function useStudents(currentUserEmail?: string | null) {
  const [students, setStudents] = useState<StudentAccount[]>([]);

  const hydrateStudents = useCallback(async () => {
    try {
      const response = await fetch("/api/students", { cache: "no-store" });
      if (!response.ok) {
        if (response.status === 401) {
          setStudents([]);
        }
        return;
      }

      const payload = (await response.json()) as { students?: unknown };
      setStudents(sanitizeStudents(payload.students));
    } catch {
      // Keep last known local state on transient failures.
    }
  }, []);

  const addStudent = useCallback(
    async (name: string, email: string): Promise<AddStudentResult> => {
    const normalizedName = normalizeStudentName(name);
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedName) return null;
    if (!isValidEmail(normalizedEmail)) return null;
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
        }),
      });

      if (!response.ok) return null;
      const payload = (await response.json()) as {
        student?: StudentAccount;
        invitationSent?: boolean;
      };

      if (!payload.student) {
        return null;
      }

      const student = {
        name: normalizeStudentName(payload.student.name),
        email: normalizeEmail(payload.student.email),
      };
      if (!student.name || !student.email) return null;

      setStudents((prev) => sortStudents([...prev, student]));

      return {
        student,
        invitationSent: Boolean(payload.invitationSent),
      };
    } catch {
      return null;
    }
  }, []);

  const deleteStudent = useCallback(async (email: string) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return;
    try {
      const response = await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });

      if (!response.ok) return;
      setStudents((prev) =>
        sortStudents(prev.filter((student) => normalizeEmail(student.email) !== normalized)),
      );
    } catch {
      // Ignore network failures and keep current state.
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void hydrateStudents();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydrateStudents, currentUserEmail]);

  const stableStudents = useMemo(() => sortStudents(students), [students]);

  return { students: stableStudents, addStudent, deleteStudent, refreshStudents: hydrateStudents };
}
