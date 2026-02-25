import { STUDENT_ACCOUNTS, normalizeEmail } from "@/lib/auth";
import { A_LEVEL_MATHS_CHAPTER_TITLES } from "@/lib/seed";
import type { StudentDailyStats } from "@/types/dashboard";

export const CHAPTER_ONE_TITLE = "Chapter 1: Algebra 1";
export const CHAPTER_TITLES = A_LEVEL_MATHS_CHAPTER_TITLES;

export function ensureChapterOneUnlocked(
  unlocks: Record<string, string[]>,
): Record<string, string[]> {
  const next: Record<string, string[]> = {};

  for (const student of STUDENT_ACCOUNTS) {
    const key = normalizeEmail(student.email);
    const existing = unlocks[key] ?? [];
    const merged = new Set([CHAPTER_ONE_TITLE, ...existing]);
    next[key] = CHAPTER_TITLES.filter((chapterTitle) => merged.has(chapterTitle));
  }

  return next;
}

export function ensureStudentMilestones(
  milestones: Record<string, string | null>,
): Record<string, string | null> {
  const next: Record<string, string | null> = {};

  for (const student of STUDENT_ACCOUNTS) {
    const key = normalizeEmail(student.email);
    const milestone = milestones[key];
    if (milestone === null) {
      next[key] = null;
      continue;
    }
    next[key] = CHAPTER_TITLES.includes(milestone) ? milestone : CHAPTER_ONE_TITLE;
  }

  return next;
}

export function deserializeStudentUnlocks(raw: string): Record<string, string[]> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return ensureChapterOneUnlocked({});
    }

    const normalized: Record<string, string[]> = {};
    for (const [email, chapterList] of Object.entries(parsed)) {
      if (!Array.isArray(chapterList)) continue;
      normalized[normalizeEmail(email)] = chapterList
        .filter((chapter): chapter is string => typeof chapter === "string")
        .filter((chapter) => CHAPTER_TITLES.includes(chapter));
    }

    return ensureChapterOneUnlocked(normalized);
  } catch {
    return ensureChapterOneUnlocked({});
  }
}

export function deserializeStudentMilestones(raw: string): Record<string, string | null> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return ensureStudentMilestones({});
    }

    const normalized: Record<string, string | null> = {};
    for (const [email, chapterTitle] of Object.entries(parsed)) {
      if (chapterTitle === null) {
        normalized[normalizeEmail(email)] = null;
        continue;
      }
      if (typeof chapterTitle !== "string") continue;
      normalized[normalizeEmail(email)] = chapterTitle;
    }

    return ensureStudentMilestones(normalized);
  } catch {
    return ensureStudentMilestones({});
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
