"use client";

import {
  CHAPTER_TITLES,
  resolveAccessibleChapterTitles,
  resolveTaggedChapterTitle,
  sanitizeTaggedChapterTitle,
  toggleCustomChapterAccess,
} from "@/lib/access";
import type {
  DeleteStudentResult,
  UpdateStudentAccessInput,
  UpdateStudentAccessResult,
} from "@/lib/hooks/use-students";
import type { AuthenticatedAccount, UserAccessProfile, UserPlan } from "@/types/auth";
import { useMemo, useState } from "react";

type UpdateStudentAccess = (
  input: UpdateStudentAccessInput,
) => Promise<UpdateStudentAccessResult>;

type DeleteStudent = (userId: string) => Promise<DeleteStudentResult>;

export function useStudentProgress(
  currentUser: AuthenticatedAccount | null,
  viewerProfile: UserAccessProfile | null,
  studentAccounts: UserAccessProfile[],
  updateStudentAccess: UpdateStudentAccess,
  deleteStudent: DeleteStudent,
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

  const activeStudentAccess =
    currentUser?.role === "student"
      ? viewerProfile
      : selectedStudent;
  const activeStudentUnlocks = resolveAccessibleChapterTitles(activeStudentAccess);
  const activeStudentMilestone = resolveTaggedChapterTitle(activeStudentAccess);

  const selectedStudentMilestone = resolveTaggedChapterTitle(selectedStudent);

  const chapterTagsByTitle = useMemo(() => {
    const tags = Object.fromEntries(
      CHAPTER_TITLES.map((title) => [title, [] as Array<{ id: string; name: string; email: string }>]),
    );

    for (const student of studentAccounts) {
      const taggedChapterTitle = resolveTaggedChapterTitle(student);
      if (!taggedChapterTitle) continue;
      tags[taggedChapterTitle]?.push({
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
    taggedChapterTitle: string | null,
    customUnlockedChapterTitles: string[],
  ) => {
    if (!selectedStudent) return;

    await updateStudentAccess({
      userId: selectedStudent.id,
      plan,
      taggedChapterTitle,
      customUnlockedChapterTitles,
    });
  };

  const toggleChapterForSelectedStudent = async (chapterTitle: string) => {
    await applyStudentAccessUpdate(
      selectedStudent?.plan ?? "basic",
      selectedStudent?.taggedChapterTitle ?? null,
      toggleCustomChapterAccess(
        selectedStudent?.customUnlockedChapterTitles ?? [],
        chapterTitle,
      ),
    );
  };

  const setMilestoneForSelectedStudent = async (chapterTitle: string) => {
    if (!selectedStudent) return;
    if (!CHAPTER_TITLES.includes(chapterTitle)) return;

    const currentMilestone = sanitizeTaggedChapterTitle(selectedStudent.taggedChapterTitle);
    const nextMilestone = currentMilestone === chapterTitle ? null : chapterTitle;
    await applyStudentAccessUpdate(
      selectedStudent.plan,
      nextMilestone,
      selectedStudent.customUnlockedChapterTitles,
    );
  };

  const setPlanForSelectedStudent = async (plan: UserPlan) => {
    if (!selectedStudent) return;

    await applyStudentAccessUpdate(
      plan,
      selectedStudent.taggedChapterTitle,
      selectedStudent.customUnlockedChapterTitles,
    );
  };

  const deleteSelectedStudent = async () => {
    if (!selectedStudent) {
      return { ok: false as const, error: "No student selected." };
    }

    const deletedStudentId = selectedStudent.id;
    const result = await deleteStudent(deletedStudentId);
    if (!result.ok) return result;

    if (deletedStudentId === resolvedSelectedStudentId) {
      const remainingStudents = studentAccounts.filter((student) => student.id !== deletedStudentId);
      setSelectedStudentId(remainingStudents[0]?.id ?? "");
    }

    return result;
  };

  return {
    selectedStudentId: resolvedSelectedStudentId,
    selectedStudent,
    selectedStudentPlan: selectedStudent?.plan ?? "basic",
    activeStudentUnlocks,
    activeStudentMilestone,
    selectedStudentMilestone,
    chapterTagsByTitle,
    selectStudent,
    toggleChapterForSelectedStudent,
    setMilestoneForSelectedStudent,
    setPlanForSelectedStudent,
    deleteSelectedStudent,
    chapterTitles: CHAPTER_TITLES,
  };
}
