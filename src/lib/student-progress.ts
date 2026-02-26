import {
  buildStudentEmail,
  getDefaultStudentName,
  normalizeEmail,
  type StudentAccount,
} from "@/lib/auth";
import { A_LEVEL_MATHS_CHAPTER_TITLES } from "@/lib/seed";
import type { StudentDailyStats } from "@/types/dashboard";

export const CHAPTER_ONE_TITLE = "Chapter 1: Algebra 1";
export const CHAPTER_TITLES = A_LEVEL_MATHS_CHAPTER_TITLES;
const LEGACY_STUDENT_EMAIL_PATTERN = /^student(\d+)@quicklearn\.com$/i;

function normalizeStudentProgressEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const legacyMatch = normalized.match(LEGACY_STUDENT_EMAIL_PATTERN);
  if (!legacyMatch) return normalized;

  const studentNumber = Number(legacyMatch[1]);
  if (!Number.isInteger(studentNumber) || studentNumber <= 0) return normalized;

  return normalizeEmail(buildStudentEmail(getDefaultStudentName(studentNumber - 1)));
}

export function ensureChapterOneUnlocked(
  unlocks: Record<string, string[]>,
  students: StudentAccount[],
): Record<string, string[]> {
  const next: Record<string, string[]> = {};

  for (const student of students) {
    const key = normalizeEmail(student.email);
    const existing = unlocks[key] ?? [];
    const merged = new Set([CHAPTER_ONE_TITLE, ...existing]);
    next[key] = CHAPTER_TITLES.filter((chapterTitle) => merged.has(chapterTitle));
  }

  return next;
}

export function ensureStudentMilestones(
  milestones: Record<string, string | null>,
  students: StudentAccount[],
): Record<string, string | null> {
  const next: Record<string, string | null> = {};

  for (const student of students) {
    const key = normalizeEmail(student.email);
    const milestone = milestones[key];
    if (milestone === null) {
      next[key] = CHAPTER_ONE_TITLE;
      continue;
    }
    next[key] = CHAPTER_TITLES.includes(milestone) ? milestone : CHAPTER_ONE_TITLE;
  }

  return next;
}

export function deserializeStudentUnlocks(
  raw: string,
  students: StudentAccount[],
): Record<string, string[]> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return ensureChapterOneUnlocked({}, students);
    }

    const normalized: Record<string, string[]> = {};
    for (const [email, chapterList] of Object.entries(parsed)) {
      if (!Array.isArray(chapterList)) continue;
      normalized[normalizeStudentProgressEmail(email)] = chapterList
        .filter((chapter): chapter is string => typeof chapter === "string")
        .filter((chapter) => CHAPTER_TITLES.includes(chapter));
    }

    return ensureChapterOneUnlocked(normalized, students);
  } catch {
    return ensureChapterOneUnlocked({}, students);
  }
}

export function deserializeStudentMilestones(
  raw: string,
  students: StudentAccount[],
): Record<string, string | null> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return ensureStudentMilestones({}, students);
    }

    const normalized: Record<string, string | null> = {};
    for (const [email, chapterTitle] of Object.entries(parsed)) {
      if (chapterTitle === null) {
        normalized[normalizeStudentProgressEmail(email)] = null;
        continue;
      }
      if (typeof chapterTitle !== "string") continue;
      normalized[normalizeStudentProgressEmail(email)] = chapterTitle;
    }

    return ensureStudentMilestones(normalized, students);
  } catch {
    return ensureStudentMilestones({}, students);
  }
}

export function buildStudentStats(
  unlockedChapterCount: number,
  seedFactor: number,
): StudentDailyStats {
  const reviewedToday = Math.max(
    6,
    Math.round(unlockedChapterCount * 2.5 + 8 + (seedFactor % 4)),
  );
  const dueToday = Math.max(
    4,
    Math.round(unlockedChapterCount * 1.6 + 5 + (seedFactor % 3)),
  );

  const habitSeries = Array.from({ length: 7 }, (_, index) => {
    const base = 26 + unlockedChapterCount * 2.7;
    const drift = (index - 3) * 3.2;
    const variation = ((seedFactor + index * 5) % 9) - 4;
    return Math.max(18, Math.min(150, Math.round(base + drift + variation)));
  });

  return { reviewedToday, dueToday, habitSeries };
}

export function toggleChapterUnlock(
  currentUnlocks: string[],
  chapterTitle: string,
): string[] {
  if (chapterTitle === CHAPTER_ONE_TITLE) return currentUnlocks;

  const next = new Set(currentUnlocks);
  if (next.has(chapterTitle)) {
    next.delete(chapterTitle);
  } else {
    next.add(chapterTitle);
  }
  next.add(CHAPTER_ONE_TITLE);
  return CHAPTER_TITLES.filter((title) => next.has(title));
}

export function buildUnlocksUpToChapter(chapterTitle: string): string[] {
  const chapterIndex = CHAPTER_TITLES.indexOf(chapterTitle);
  const maxIndex = chapterIndex >= 0 ? chapterIndex : 0;
  return CHAPTER_TITLES.slice(0, maxIndex + 1);
}
