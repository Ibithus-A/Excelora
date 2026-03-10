import { A_LEVEL_MATHS_CHAPTER_TITLES, A_LEVEL_MATHS_TITLE } from "@/lib/seed";
import type { StudentDailyStats } from "@/types/dashboard";
import type { FlowState } from "@/types/flowstate";
import type { UserAccessProfile, UserPlan } from "@/types/auth";

export const CHAPTER_TITLES = A_LEVEL_MATHS_CHAPTER_TITLES;
export const CHAPTER_ONE_TITLE = "Chapter 1: Algebra 1";

export function normalizeUserPlan(value: unknown): UserPlan | null {
  if (value === "basic" || value === "premium") return value;
  return null;
}

export function sanitizeUnlockedChapterTitles(
  unlockedChapterTitles: unknown,
  plan: UserPlan,
): string[] {
  if (plan === "basic") return [CHAPTER_ONE_TITLE];
  if (!Array.isArray(unlockedChapterTitles)) return [CHAPTER_ONE_TITLE];

  const allowed = new Set(CHAPTER_TITLES);
  const unique = new Set<string>([CHAPTER_ONE_TITLE]);

  for (const title of unlockedChapterTitles) {
    if (typeof title !== "string") continue;
    if (!allowed.has(title)) continue;
    unique.add(title);
  }

  return CHAPTER_TITLES.filter((title) => unique.has(title));
}

export function hasChapterAccess(
  unlockedChapterTitles: string[],
  chapterTitle: string | null | undefined,
): boolean {
  if (!chapterTitle) return true;
  return unlockedChapterTitles.includes(chapterTitle);
}

export function buildUnlocksUpToChapter(chapterTitle: string): string[] {
  const chapterIndex = CHAPTER_TITLES.indexOf(chapterTitle);
  const maxIndex = chapterIndex >= 0 ? chapterIndex : 0;
  return CHAPTER_TITLES.slice(0, maxIndex + 1);
}

export function togglePremiumChapterAccess(
  currentUnlocks: string[],
  chapterTitle: string,
): string[] {
  if (chapterTitle === CHAPTER_ONE_TITLE) return sanitizeUnlockedChapterTitles(currentUnlocks, "premium");

  const next = new Set(currentUnlocks);
  if (next.has(chapterTitle)) {
    next.delete(chapterTitle);
  } else {
    next.add(chapterTitle);
  }
  next.add(CHAPTER_ONE_TITLE);

  return CHAPTER_TITLES.filter((title) => next.has(title));
}

export function getHighestUnlockedChapter(unlockedChapterTitles: string[]): string {
  const unlocked = new Set(unlockedChapterTitles);
  const highest = [...CHAPTER_TITLES].reverse().find((title) => unlocked.has(title));
  return highest ?? CHAPTER_ONE_TITLE;
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

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}

function getMathRootId(state: FlowState): string | null {
  return (
    state.rootIds.find((id) => {
      const title = state.nodes[id]?.title;
      return title ? normalizeTitle(title) === normalizeTitle(A_LEVEL_MATHS_TITLE) : false;
    }) ?? null
  );
}

export function getChapterTitleForNode(state: FlowState, nodeId: string): string | null {
  const mathRootId = getMathRootId(state);
  if (!mathRootId) return null;

  let cursor = state.nodes[nodeId];
  while (cursor) {
    if (cursor.parentId === mathRootId && CHAPTER_TITLES.includes(cursor.title)) {
      return cursor.title;
    }

    if (!cursor.parentId) break;
    cursor = state.nodes[cursor.parentId];
  }

  return null;
}

export function canAccessNode(
  state: FlowState,
  nodeId: string,
  unlockedChapterTitles: string[],
): boolean {
  const chapterTitle = getChapterTitleForNode(state, nodeId);
  return hasChapterAccess(unlockedChapterTitles, chapterTitle);
}

export function getLockedChapterMessage(profile: UserAccessProfile | null): string {
  if (!profile) {
    return "This chapter is locked. Sign in to view your available chapters.";
  }

  if (profile.plan === "basic") {
    return "This chapter is locked on the Basic Plan. Ask a tutor to upgrade your account to Premium.";
  }

  return "This chapter is locked. Ask your tutor to unlock it on your Premium plan.";
}
