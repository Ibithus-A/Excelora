import {
  A_LEVEL_MATHS_CHAPTERS,
  A_LEVEL_MATHS_CHAPTER_TITLES,
  A_LEVEL_MATHS_TITLE,
  END_OF_TOPIC_ASSESSMENT_TITLE,
} from "@/lib/seed";
import type { StudentDailyStats } from "@/types/dashboard";
import type { FlowState } from "@/types/flowstate";
import type { UserAccessProfile, UserPlan } from "@/types/auth";

export const CHAPTER_TITLES = A_LEVEL_MATHS_CHAPTER_TITLES;
export const CHAPTER_ONE_TITLE = "Chapter 1: Algebra 1";
const NORMALIZED_CHAPTER_ONE_TITLE = CHAPTER_ONE_TITLE.trim().toLowerCase();

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}

export function normalizeUserPlan(value: unknown): UserPlan | null {
  if (value === "basic" || value === "premium") return value;
  return null;
}

const CANONICAL_CHAPTER_TITLE_MAP = new Map(
  CHAPTER_TITLES.map((title) => [normalizeTitle(title), title]),
);

function findCanonicalChapterTitle(chapterTitle: string) {
  return CANONICAL_CHAPTER_TITLE_MAP.get(normalizeTitle(chapterTitle)) ?? null;
}

export function sanitizeChapterTitle(chapterTitle: unknown): string | null {
  if (typeof chapterTitle !== "string") return null;
  return findCanonicalChapterTitle(chapterTitle);
}

export function sanitizeTaggedChapterTitle(taggedChapterTitle: unknown): string | null {
  return sanitizeChapterTitle(taggedChapterTitle);
}

export function sanitizeCustomUnlockedChapterTitles(unlockedChapterTitles: unknown): string[] {
  if (!Array.isArray(unlockedChapterTitles)) return [];

  const unique = new Set<string>();

  for (const title of unlockedChapterTitles) {
    if (typeof title !== "string") continue;
    const canonicalTitle = findCanonicalChapterTitle(title);
    if (!canonicalTitle) continue;
    if (normalizeTitle(canonicalTitle) === NORMALIZED_CHAPTER_ONE_TITLE) continue;
    unique.add(canonicalTitle);
  }

  return CHAPTER_TITLES.filter((title) => unique.has(title));
}

export function buildUnlocksUpToChapter(chapterTitle: string): string[] {
  const chapterIndex = CHAPTER_TITLES.findIndex(
    (title) => normalizeTitle(title) === normalizeTitle(chapterTitle),
  );
  const maxIndex = chapterIndex >= 0 ? chapterIndex : 0;
  return CHAPTER_TITLES.slice(0, maxIndex + 1);
}

export function toggleCustomChapterAccess(
  currentCustomUnlocks: string[],
  chapterTitle: string,
): string[] {
  const canonicalTitle = findCanonicalChapterTitle(chapterTitle) ?? chapterTitle;

  if (normalizeTitle(canonicalTitle) === NORMALIZED_CHAPTER_ONE_TITLE) {
    return sanitizeCustomUnlockedChapterTitles(currentCustomUnlocks);
  }

  const next = new Set(currentCustomUnlocks);
  if (next.has(canonicalTitle)) {
    next.delete(canonicalTitle);
  } else {
    next.add(canonicalTitle);
  }

  return CHAPTER_TITLES.filter((title) => next.has(title));
}

type StudentAccessShape = Pick<
  UserAccessProfile,
  "plan" | "taggedChapterTitle" | "customUnlockedChapterTitles"
>;

export function resolveTaggedChapterTitle(
  access: StudentAccessShape | null | undefined,
): string | null {
  if (!access) return CHAPTER_ONE_TITLE;
  if (access.plan === "basic") return CHAPTER_ONE_TITLE;
  return sanitizeTaggedChapterTitle(access.taggedChapterTitle);
}

export function resolveAccessibleChapterTitles(access: StudentAccessShape | null | undefined): string[] {
  if (!access) return [CHAPTER_ONE_TITLE];
  if (access.plan === "basic") return [CHAPTER_ONE_TITLE];

  const taggedChapterTitle = resolveTaggedChapterTitle(access);
  const taggedUnlocks = taggedChapterTitle ? buildUnlocksUpToChapter(taggedChapterTitle) : [CHAPTER_ONE_TITLE];
  const customUnlocks = sanitizeCustomUnlockedChapterTitles(access.customUnlockedChapterTitles);
  const accessible = new Set<string>([...taggedUnlocks, ...customUnlocks, CHAPTER_ONE_TITLE]);

  return CHAPTER_TITLES.filter((title) => accessible.has(title));
}

export function hasChapterAccess(
  access: StudentAccessShape | null | undefined,
  chapterTitle: string | null | undefined,
): boolean {
  if (!chapterTitle) return false;
  const accessible = new Set(resolveAccessibleChapterTitles(access).map(normalizeTitle));
  return accessible.has(normalizeTitle(chapterTitle));
}

export function getHighestAccessibleChapter(access: StudentAccessShape | null | undefined): string {
  const accessible = new Set(resolveAccessibleChapterTitles(access).map(normalizeTitle));
  const highest = [...CHAPTER_TITLES].reverse().find((title) => accessible.has(normalizeTitle(title)));
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

function getMathRootId(state: FlowState): string | null {
  return (
    state.rootIds.find((id) => {
      const title = state.nodes[id]?.title;
      return title ? normalizeTitle(title) === normalizeTitle(A_LEVEL_MATHS_TITLE) : false;
    }) ?? null
  );
}

function getChapterNodeForNode(
  state: FlowState,
  nodeId: string,
): { chapterId: string; chapterTitle: string } | null {
  const mathRootId = getMathRootId(state);
  if (!mathRootId) return null;

  let cursor = state.nodes[nodeId];
  while (cursor) {
    if (
      cursor.parentId === mathRootId &&
      CHAPTER_TITLES.some((title) => normalizeTitle(title) === normalizeTitle(cursor.title))
    ) {
      return { chapterId: cursor.id, chapterTitle: cursor.title };
    }

    if (!cursor.parentId) break;
    cursor = state.nodes[cursor.parentId];
  }

  return null;
}

export function getChapterTitleForNode(state: FlowState, nodeId: string): string | null {
  return getChapterNodeForNode(state, nodeId)?.chapterTitle ?? null;
}

const STUDENT_PAGE_TITLES_BY_CHAPTER = new Map(
  A_LEVEL_MATHS_CHAPTERS.map((chapter) => [
    normalizeTitle(chapter.title),
    new Set(
      [...chapter.subtopics, END_OF_TOPIC_ASSESSMENT_TITLE].map((title) =>
        normalizeTitle(title),
      ),
    ),
  ]),
);

export function canAccessNode(
  state: FlowState,
  nodeId: string,
  access: StudentAccessShape | null | undefined,
): boolean {
  const node = state.nodes[nodeId];
  if (!node) return false;

  const mathRootId = getMathRootId(state);
  if (!mathRootId) return false;
  if (node.id === mathRootId) return true;

  const chapter = getChapterNodeForNode(state, nodeId);
  if (!chapter) return false;
  if (!hasChapterAccess(access, chapter.chapterTitle)) return false;

  if (node.id === chapter.chapterId) return true;
  if (node.kind !== "page") return false;
  if (node.parentId !== chapter.chapterId) return false;

  const allowedPageTitles = STUDENT_PAGE_TITLES_BY_CHAPTER.get(
    normalizeTitle(chapter.chapterTitle),
  );
  if (!allowedPageTitles) return false;

  return allowedPageTitles.has(normalizeTitle(node.title));
}

export function getLockedChapterMessage(
  profile: UserAccessProfile | null,
  state?: FlowState,
  nodeId?: string | null,
): string {
  if (!profile) {
    return "This chapter is locked. Sign in to view your available chapters.";
  }

  if (state && nodeId) {
    const node = state.nodes[nodeId];
    const chapter = getChapterNodeForNode(state, nodeId);
    if (node && chapter && hasChapterAccess(profile, chapter.chapterTitle)) {
      return "Students can only open subtopic pages and Assessment pages inside chapters they can access.";
    }
  }

  if (profile.plan === "basic") {
    return "This chapter is locked on the Basic Plan. Ask a tutor to upgrade your account to Premium.";
  }

  return "This chapter is locked. Ask your tutor to tag the chapter or custom unlock it on your Premium plan.";
}
