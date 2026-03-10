"use client";

import {
  CHAPTER_ONE_TITLE,
  CHAPTER_TITLES,
  buildStudentStats,
  buildUnlocksUpToChapter,
  getHighestUnlockedChapter,
  togglePremiumChapterAccess,
} from "@/lib/access";
import type {
  UpdateStudentAccessInput,
  UpdateStudentAccessResult,
} from "@/lib/hooks/use-students";
import type { AuthenticatedAccount, UserAccessProfile, UserPlan } from "@/types/auth";
import { useMemo, useState } from "react";

type UpdateStudentAccess = (
  input: UpdateStudentAccessInput,
) => Promise<UpdateStudentAccessResult>;

export function useStudentProgress(
  currentUser: AuthenticatedAccount | null,
  viewerProfile: UserAccessProfile | null,
  studentAccounts: UserAccessProfile[],
  updateStudentAccess: UpdateStudentAccess,
) {
  const [selectedStudentId, setSelectedStudentId] = useState(studentAccounts[0]?.id ?? "");

  const resolvedSelectedStudentId = useMemo(() => {
    if (studentAccounts.length === 0) return "";
    const exists = studentAccounts.some((student) => student.id === selectedStudentId);
    return exists ? selectedStudentId : (studentAccounts[0]?.id ?? "");
  }, [selectedStudentId, studentAccounts]);

  const selectedStudent = useMemo(
    () => studentAccounts.find((student) => student.id === resolvedSelectedStudentId) ?? null,
    [resolvedSelectedStudentId, studentAccounts],
  );

  const activeStudentUnlocks =
    currentUser?.role === "student"
      ? viewerProfile?.unlockedChapterTitles ?? [CHAPTER_ONE_TITLE]
      : selectedStudent?.unlockedChapterTitles ?? [CHAPTER_ONE_TITLE];

  const statsByStudent = useMemo(() => {
    const entries = studentAccounts.map((student, index) => [
      student.id,
      buildStudentStats(student.unlockedChapterTitles.length, index + 1),
    ]);

    return Object.fromEntries(entries);
  }, [studentAccounts]);

  const currentStudentStats =
    currentUser?.role === "student"
      ? buildStudentStats(viewerProfile?.unlockedChapterTitles.length ?? 1, 1)
      : statsByStudent[resolvedSelectedStudentId] ?? buildStudentStats(1, 1);

  const selectedStudentMilestone = selectedStudent
    ? getHighestUnlockedChapter(selectedStudent.unlockedChapterTitles)
    : null;

  const chapterTagsByTitle = useMemo(() => {
    const tags = Object.fromEntries(
      CHAPTER_TITLES.map((title) => [title, [] as Array<{ id: string; name: string; email: string }>]),
    );

    for (const student of studentAccounts) {
      const highestChapter = getHighestUnlockedChapter(student.unlockedChapterTitles);
      tags[highestChapter]?.push({
        id: student.id,
        name: student.name,
        email: student.email,
      });
    }

    return tags;
  }, [studentAccounts]);

  const selectStudent = (id: string) => {
    setSelectedStudentId(id);
  };

  const applyStudentAccessUpdate = async (
    plan: UserPlan,
    unlockedChapterTitles: string[],
  ) => {
    if (!selectedStudent) return;

    await updateStudentAccess({
      userId: selectedStudent.id,
      plan,
      unlockedChapterTitles,
    });
  };

  const toggleChapterForSelectedStudent = async (chapterTitle: string) => {
    if (!selectedStudent || selectedStudent.plan !== "premium") return;
    if (chapterTitle === CHAPTER_ONE_TITLE) return;

    await applyStudentAccessUpdate(
      "premium",
      togglePremiumChapterAccess(selectedStudent.unlockedChapterTitles, chapterTitle),
    );
  };

  const setMilestoneForSelectedStudent = async (chapterTitle: string) => {
    if (!selectedStudent || selectedStudent.plan !== "premium") return;
    if (!CHAPTER_TITLES.includes(chapterTitle)) return;

    const currentMilestone = getHighestUnlockedChapter(selectedStudent.unlockedChapterTitles);
    const nextMilestone = currentMilestone === chapterTitle ? CHAPTER_ONE_TITLE : chapterTitle;
    await applyStudentAccessUpdate("premium", buildUnlocksUpToChapter(nextMilestone));
  };

  const setPlanForSelectedStudent = async (plan: UserPlan) => {
    if (!selectedStudent) return;

    await applyStudentAccessUpdate(
      plan,
      plan === "basic"
        ? [CHAPTER_ONE_TITLE]
        : selectedStudent.unlockedChapterTitles,
    );
  };

  return {
    selectedStudentId: resolvedSelectedStudentId,
    selectedStudent,
    selectedStudentPlan: selectedStudent?.plan ?? "basic",
    activeStudentUnlocks,
    currentStudentStats,
    selectedStudentMilestone,
    chapterTagsByTitle,
    selectStudent,
    toggleChapterForSelectedStudent,
    setMilestoneForSelectedStudent,
    setPlanForSelectedStudent,
    chapterTitles: CHAPTER_TITLES,
    students: studentAccounts,
  };
}
