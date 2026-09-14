import {
  A_LEVEL_MATHS_CHAPTERS,
  INTERACTIVE_ASSESSMENT_TITLE,
} from "./seed.ts";

export const CHAPTER_ONE_ASSESSMENT_KEY =
  "pure-mathematics:chapter-1-algebra-and-functions";

// Every assessment must follow docs/assessment-standards.md. Keep these rules shared
// so future chapters cannot silently diverge from the Chapter 1 reference behaviour.
export const STANDARD_ASSESSMENT_RULES = {
  attemptLimit: 1,
  requireAllModules: true,
  lockAnswersBeforeMarking: true,
} as const;

const CHAPTER_ONE_TITLE = "Chapter 1: Algebra and Functions";

export function normalizeAssessmentModuleTitle(title: string) {
  return title.trim().replace(/\s+[—-]\s+notion preview$/i, "").toLowerCase();
}

const chapterOneModuleTitles =
  Array.from(
    new Set(
      A_LEVEL_MATHS_CHAPTERS.find(
        (chapter) => chapter.title === CHAPTER_ONE_TITLE,
      )?.subtopics
        .filter((title) => title !== INTERACTIVE_ASSESSMENT_TITLE)
        .map((title) => title.replace(/\s+[—-]\s+notion preview$/i, "")) ?? [],
    ),
  );

export const CHAPTER_ONE_ASSESSMENT_CONFIG = {
  key: CHAPTER_ONE_ASSESSMENT_KEY,
  chapterTitle: CHAPTER_ONE_TITLE,
  title: "Chapter 1 Assessment",
  durationSeconds: 90 * 60,
  questionCount: 15,
  totalMarks: 75,
  minimumStudentPlan: "basic" as "basic" | "premium",
  requiredModuleTitles: chapterOneModuleTitles,
  rules: STANDARD_ASSESSMENT_RULES,
} as const;

const assessmentConfigs = [CHAPTER_ONE_ASSESSMENT_CONFIG] as const;

export function getAssessmentConfig(key: string) {
  return assessmentConfigs.find((config) => config.key === key) ?? null;
}

export function getAssessmentKeyForChapter(chapterTitle: string) {
  return (
    assessmentConfigs.find((config) => config.chapterTitle === chapterTitle)?.key ?? null
  );
}
