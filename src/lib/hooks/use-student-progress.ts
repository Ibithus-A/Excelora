"use client";

import { normalizeEmail, type StudentAccount } from "@/lib/auth";
import {
  STUDENT_MILESTONE_STORAGE_KEY,
  STUDENT_UNLOCK_STORAGE_KEY,
} from "@/lib/constants/storage";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import {
  CHAPTER_ONE_TITLE,
  CHAPTER_TITLES,
  buildUnlocksUpToChapter,
  buildStudentStats,
  deserializeStudentMilestones,
  deserializeStudentUnlocks,
  ensureChapterOneUnlocked,
  ensureStudentMilestones,
  toggleChapterUnlock,
} from "@/lib/student-progress";
import type { AuthenticatedAccount } from "@/types/auth";
import { useEffect, useMemo, useState } from "react";

function areUnlockMapsEqual(
  left: Record<string, string[]>,
  right: Record<string, string[]>,
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;

  for (const key of leftKeys) {
    const leftValues = left[key];
    const rightValues = right[key];
    if (!rightValues) return false;
    if (leftValues.length !== rightValues.length) return false;
    for (let index = 0; index < leftValues.length; index += 1) {
      if (leftValues[index] !== rightValues[index]) return false;
    }
  }

  return true;
}

function areMilestoneMapsEqual(
  left: Record<string, string | null>,
  right: Record<string, string | null>,
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;

  for (const key of leftKeys) {
    if (left[key] !== right[key]) return false;
  }

  return true;
}

export function useStudentProgress(
  currentUser: AuthenticatedAccount | null,
  studentAccounts: StudentAccount[],
) {
  const firstStudentEmail = studentAccounts[0]
    ? normalizeEmail(studentAccounts[0].email)
    : "";
  const [selectedStudentEmail, setSelectedStudentEmail] = useState(
    firstStudentEmail,
  );

  const [studentChapterUnlocks, setStudentChapterUnlocks] = usePersistedState<
    Record<string, string[]>
  >({
    key: STUDENT_UNLOCK_STORAGE_KEY,
    defaultValue: ensureChapterOneUnlocked({}, studentAccounts),
    serialize: JSON.stringify,
    deserialize: (raw) => deserializeStudentUnlocks(raw, studentAccounts),
  });
  const [studentMilestones, setStudentMilestones] = usePersistedState<
    Record<string, string | null>
  >({
    key: STUDENT_MILESTONE_STORAGE_KEY,
    defaultValue: ensureStudentMilestones({}, studentAccounts),
    serialize: JSON.stringify,
    deserialize: (raw) => deserializeStudentMilestones(raw, studentAccounts),
  });

  useEffect(() => {
    setStudentChapterUnlocks((prev) => {
      const next = ensureChapterOneUnlocked(prev, studentAccounts);
      return areUnlockMapsEqual(prev, next) ? prev : next;
    });
    setStudentMilestones((prev) => {
      const next = ensureStudentMilestones(prev, studentAccounts);
      return areMilestoneMapsEqual(prev, next) ? prev : next;
    });
  }, [setStudentChapterUnlocks, setStudentMilestones, studentAccounts]);

  const resolvedSelectedStudentEmail = useMemo(() => {
    if (studentAccounts.length === 0) return "";
    const isCurrentSelectionValid = studentAccounts.some(
      (student) => normalizeEmail(student.email) === selectedStudentEmail,
    );
    if (isCurrentSelectionValid) return selectedStudentEmail;
    return normalizeEmail(studentAccounts[0].email);
  }, [selectedStudentEmail, studentAccounts]);

  const selectedStudentUnlocks =
    resolvedSelectedStudentEmail
      ? studentChapterUnlocks[resolvedSelectedStudentEmail] ?? [CHAPTER_ONE_TITLE]
      : [CHAPTER_ONE_TITLE];

  const activeStudentUnlocks =
    currentUser?.role === "student"
      ? studentChapterUnlocks[normalizeEmail(currentUser.email)] ?? [CHAPTER_ONE_TITLE]
      : selectedStudentUnlocks;

  const statsByStudent = useMemo(() => {
    const entries = studentAccounts.map((student, index) => {
      const key = normalizeEmail(student.email);
      const unlocked = studentChapterUnlocks[key] ?? [CHAPTER_ONE_TITLE];
      return [key, buildStudentStats(unlocked.length, index + 1)] as const;
    });
    return Object.fromEntries(entries);
  }, [studentAccounts, studentChapterUnlocks]);

  const selectedStudent = useMemo(
    () =>
      studentAccounts.find(
        (student) => normalizeEmail(student.email) === resolvedSelectedStudentEmail,
      ),
    [resolvedSelectedStudentEmail, studentAccounts],
  );

  const currentStudentStats =
    currentUser?.role === "student"
      ? statsByStudent[normalizeEmail(currentUser.email)]
      : statsByStudent[resolvedSelectedStudentEmail] ?? buildStudentStats(1, 1);

  const selectedStudentMilestone =
    studentMilestones[resolvedSelectedStudentEmail] ?? null;

  const chapterTagsByTitle = useMemo(() => {
    const tags = Object.fromEntries(
      CHAPTER_TITLES.map((title) => [title, [] as Array<{ name: string; email: string }>]),
    );

    for (const student of studentAccounts) {
      const email = normalizeEmail(student.email);
      const milestone = studentMilestones[email];
      if (!milestone) continue;
      if (!tags[milestone]) continue;
      tags[milestone].push({
        name: student.name,
        email: student.email,
      });
    }

    return tags;
  }, [studentAccounts, studentMilestones]);

  const selectStudent = (email: string) => {
    setSelectedStudentEmail(normalizeEmail(email));
  };

  const toggleChapterForSelectedStudent = (chapterTitle: string) => {
    if (!resolvedSelectedStudentEmail) return;
    if (!selectedStudentMilestone) return;
    if (chapterTitle === CHAPTER_ONE_TITLE) return;

    setStudentChapterUnlocks((prev) => {
      const next = { ...prev };
      const current = next[resolvedSelectedStudentEmail] ?? [CHAPTER_ONE_TITLE];
      next[resolvedSelectedStudentEmail] = toggleChapterUnlock(current, chapterTitle);
      return next;
    });
  };

  const setMilestoneForSelectedStudent = (chapterTitle: string) => {
    if (!resolvedSelectedStudentEmail) return;
    if (!CHAPTER_TITLES.includes(chapterTitle)) return;

    const currentMilestone =
      studentMilestones[resolvedSelectedStudentEmail] ?? CHAPTER_ONE_TITLE;
    const nextMilestone =
      currentMilestone === chapterTitle
        ? CHAPTER_ONE_TITLE
        : chapterTitle;

    setStudentMilestones((prev) => ({
      ...prev,
      [resolvedSelectedStudentEmail]: nextMilestone,
    }));

    setStudentChapterUnlocks((prev) => ({
      ...prev,
      [resolvedSelectedStudentEmail]: buildUnlocksUpToChapter(nextMilestone),
    }));
  };

  return {
    selectedStudentEmail: resolvedSelectedStudentEmail,
    selectedStudent,
    activeStudentUnlocks,
    currentStudentStats,
    selectedStudentMilestone,
    chapterTagsByTitle,
    selectStudent,
    toggleChapterForSelectedStudent,
    setMilestoneForSelectedStudent,
    chapterTitles: CHAPTER_TITLES,
    students: studentAccounts,
  };
}
