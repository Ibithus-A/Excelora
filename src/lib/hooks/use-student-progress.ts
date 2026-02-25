"use client";

import { STUDENT_ACCOUNTS, normalizeEmail } from "@/lib/auth";
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
import { useMemo, useState } from "react";

export function useStudentProgress(currentUser: AuthenticatedAccount | null) {
  const [selectedStudentEmail, setSelectedStudentEmail] = useState(
    normalizeEmail(STUDENT_ACCOUNTS[0].email),
  );

  const [studentChapterUnlocks, setStudentChapterUnlocks] = usePersistedState<
    Record<string, string[]>
  >({
    key: STUDENT_UNLOCK_STORAGE_KEY,
    defaultValue: ensureChapterOneUnlocked({}),
    serialize: JSON.stringify,
    deserialize: deserializeStudentUnlocks,
  });
  const [studentMilestones, setStudentMilestones] = usePersistedState<
    Record<string, string | null>
  >({
    key: STUDENT_MILESTONE_STORAGE_KEY,
    defaultValue: ensureStudentMilestones({}),
    serialize: JSON.stringify,
    deserialize: deserializeStudentMilestones,
  });

  const selectedStudentUnlocks =
    studentChapterUnlocks[selectedStudentEmail] ?? [CHAPTER_ONE_TITLE];

  const activeStudentUnlocks =
    currentUser?.role === "student"
      ? studentChapterUnlocks[normalizeEmail(currentUser.email)] ?? [CHAPTER_ONE_TITLE]
      : selectedStudentUnlocks;

  const statsByStudent = useMemo(() => {
    const entries = STUDENT_ACCOUNTS.map((student, index) => {
      const key = normalizeEmail(student.email);
      const unlocked = studentChapterUnlocks[key] ?? [CHAPTER_ONE_TITLE];
      return [key, buildStudentStats(unlocked.length, index + 1)] as const;
    });
    return Object.fromEntries(entries);
  }, [studentChapterUnlocks]);

  const selectedStudent = useMemo(
    () =>
      STUDENT_ACCOUNTS.find(
        (student) => normalizeEmail(student.email) === selectedStudentEmail,
      ),
    [selectedStudentEmail],
  );

  const currentStudentStats =
    currentUser?.role === "student"
      ? statsByStudent[normalizeEmail(currentUser.email)]
      : statsByStudent[selectedStudentEmail];

  const selectedStudentMilestone =
    studentMilestones[selectedStudentEmail] ?? null;

  const chapterTagsByTitle = useMemo(() => {
    const tags = Object.fromEntries(
      CHAPTER_TITLES.map((title) => [title, [] as Array<{ name: string; email: string }>]),
    );

    for (const student of STUDENT_ACCOUNTS) {
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
  }, [studentMilestones]);

  const selectStudent = (email: string) => {
    setSelectedStudentEmail(normalizeEmail(email));
  };

  const toggleChapterForSelectedStudent = (chapterTitle: string) => {
    if (!selectedStudentMilestone) return;
    if (chapterTitle === CHAPTER_ONE_TITLE) return;

    setStudentChapterUnlocks((prev) => {
      const next = { ...prev };
      const current = next[selectedStudentEmail] ?? [CHAPTER_ONE_TITLE];
      next[selectedStudentEmail] = toggleChapterUnlock(current, chapterTitle);
      return next;
    });
  };

  const setMilestoneForSelectedStudent = (chapterTitle: string) => {
    if (!CHAPTER_TITLES.includes(chapterTitle)) return;

    const isRemovingCurrentMilestone =
      (studentMilestones[selectedStudentEmail] ?? null) === chapterTitle;

    setStudentMilestones((prev) => ({
      ...prev,
      [selectedStudentEmail]: isRemovingCurrentMilestone ? null : chapterTitle,
    }));

    setStudentChapterUnlocks((prev) => ({
      ...prev,
      [selectedStudentEmail]: isRemovingCurrentMilestone
        ? buildUnlocksUpToChapter(CHAPTER_ONE_TITLE)
        : buildUnlocksUpToChapter(chapterTitle),
    }));
  };

  return {
    selectedStudentEmail,
    selectedStudent,
    activeStudentUnlocks,
    currentStudentStats,
    selectedStudentMilestone,
    chapterTagsByTitle,
    selectStudent,
    toggleChapterForSelectedStudent,
    setMilestoneForSelectedStudent,
    chapterTitles: CHAPTER_TITLES,
    students: STUDENT_ACCOUNTS,
  };
}
