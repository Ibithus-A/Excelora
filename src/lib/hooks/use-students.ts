"use client";

import {
  buildStudentEmail,
  buildStudentPassword,
  DEFAULT_STUDENT_ACCOUNTS,
  getDefaultStudentName,
  normalizeEmail,
  normalizeStudentName,
  type StudentAccount,
} from "@/lib/auth";
import { STUDENT_ACCOUNTS_STORAGE_KEY } from "@/lib/constants/storage";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { useEffect, useMemo } from "react";

const LEGACY_STUDENT_EMAIL_PATTERN = /^student(\d+)@quicklearn\.com$/i;

function sortStudents(students: StudentAccount[]) {
  return [...students].sort((left, right) => left.name.localeCompare(right.name));
}

function areStudentsEqual(left: StudentAccount[], right: StudentAccount[]) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index].name !== right[index].name) return false;
    if (left[index].email !== right[index].email) return false;
  }
  return true;
}

function sanitizeStudents(value: unknown): StudentAccount[] {
  if (!Array.isArray(value)) return sortStudents(DEFAULT_STUDENT_ACCOUNTS);
  if (value.length === 0) return [];

  const uniqueByName = new Map<string, StudentAccount>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Partial<StudentAccount>;
    if (typeof candidate.name !== "string" || typeof candidate.email !== "string") continue;

    let normalizedName = normalizeStudentName(candidate.name);
    if (!normalizedName) continue;

    const legacyMatch = normalizeEmail(candidate.email).match(LEGACY_STUDENT_EMAIL_PATTERN);
    if (/^student\d+$/i.test(normalizedName) && legacyMatch) {
      const number = Number(legacyMatch[1]);
      normalizedName = getDefaultStudentName(number - 1);
    }

    const key = normalizedName.toLowerCase();
    if (uniqueByName.has(key)) continue;

    uniqueByName.set(key, {
      name: normalizedName,
      email: buildStudentEmail(normalizedName),
    });
  }

  if (uniqueByName.size === 0) return [];
  return sortStudents(Array.from(uniqueByName.values()));
}

export function useStudents() {
  const [students, setStudents] = usePersistedState<StudentAccount[]>({
    key: STUDENT_ACCOUNTS_STORAGE_KEY,
    defaultValue: sortStudents(DEFAULT_STUDENT_ACCOUNTS),
    serialize: JSON.stringify,
    deserialize: (raw) => {
      try {
        return sanitizeStudents(JSON.parse(raw) as unknown);
      } catch {
        return sortStudents(DEFAULT_STUDENT_ACCOUNTS);
      }
    },
  });

  const persistStudentsToFile = (nextStudents: StudentAccount[]) => {
    void fetch("/api/students", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students: nextStudents }),
    });
  };

  const addStudent = (name: string) => {
    const normalizedName = normalizeStudentName(name);
    if (!normalizedName) return null;

    const duplicate = students.some(
      (student) => student.name.toLowerCase() === normalizedName.toLowerCase(),
    );
    if (duplicate) return null;

    const nextStudent: StudentAccount = {
      name: normalizedName,
      email: buildStudentEmail(normalizedName),
    };

    const nextStudents = sortStudents([...students, nextStudent]);
    setStudents(nextStudents);
    persistStudentsToFile(nextStudents);

    return {
      student: nextStudent,
      credentials: {
        email: nextStudent.email,
        password: buildStudentPassword(nextStudent.name),
      },
    };
  };

  const deleteStudent = (email: string) => {
    const normalized = normalizeEmail(email);
    const nextStudents = sortStudents(
      students.filter((student) => normalizeEmail(student.email) !== normalized),
    );
    setStudents(nextStudents);
    persistStudentsToFile(nextStudents);
  };

  const stableStudents = useMemo(() => sortStudents(students), [students]);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromFile = async () => {
      try {
        const response = await fetch("/api/students", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { students?: unknown };
        if (cancelled) return;
        const nextStudents = sanitizeStudents(payload.students);
        setStudents((prev) => (areStudentsEqual(prev, nextStudents) ? prev : nextStudents));
      } catch {
        // Keep local fallback when file sync is unavailable.
      }
    };

    void hydrateFromFile();
    return () => {
      cancelled = true;
    };
  }, [setStudents]);

  return { students: stableStudents, addStudent, deleteStudent };
}
