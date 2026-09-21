import {
  A_LEVEL_MATHS_SUBJECTS,
  INTERACTIVE_ASSESSMENT_TITLE,
} from "./seed.ts";
import { assessmentKeyFor, COURSE_BANK_MAPPINGS } from "./question-bank/course-mapping.ts";

export const CHAPTER_ONE_ASSESSMENT_KEY =
  "pure-mathematics:chapter-1-algebra-and-functions";

// Every assessment must follow docs/assessment-standards.md. Keep these rules shared
// so future chapters cannot silently diverge from the Chapter 1 reference behaviour.
export const STANDARD_ASSESSMENT_RULES = {
  attemptLimit: null,
  requireAllModules: true,
  lockAnswersBeforeMarking: true,
} as const;

const CHAPTER_ONE_TITLE = "Chapter 1: Algebra and Functions";

export function normalizeAssessmentModuleTitle(title: string) {
  return title.trim().replace(/\s+[—-]\s+notion preview$/i, "").toLowerCase();
}

function moduleTitles(subjectTitle: string, chapterTitle: string) {
  return Array.from(new Set(A_LEVEL_MATHS_SUBJECTS.find((subject) => subject.title === subjectTitle)
    ?.chapters.find((chapter) => chapter.title === chapterTitle)?.subtopics
    .filter((title) => title !== INTERACTIVE_ASSESSMENT_TITLE && title !== "Assessment")
    .map((title) => title.replace(/\s+[—-]\s+notion preview$/i, "")) ?? []));
}

const chapterOneModuleTitles = moduleTitles("Pure Mathematics", CHAPTER_ONE_TITLE);

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

export const GENERATED_ASSESSMENT_CONFIGS = COURSE_BANK_MAPPINGS.map((mapping) => ({
  key: assessmentKeyFor(mapping),
  chapterTitle: mapping.chapterTitle,
  subjectTitle: mapping.subjectTitle,
  bankCourseTopicKey: mapping.courseTopicKey,
  title: `${mapping.chapterTitle.replace(/^Chapter \d+:\s*/, "")} Assessment`,
  durationSeconds: 90 * 60,
  questionCount: 15,
  totalMarks: 75,
  minimumStudentPlan: mapping.courseTopicKey === "pure_1_algebra_and_functions" ? "basic" as const : "premium" as const,
  requiredModuleTitles: moduleTitles(mapping.subjectTitle, mapping.chapterTitle),
  rules: STANDARD_ASSESSMENT_RULES,
}));

const assessmentConfigs = GENERATED_ASSESSMENT_CONFIGS;

export function getAssessmentConfig(key: string) {
  return assessmentConfigs.find((config) => config.key === key) ?? null;
}

export function getAssessmentKeyForChapter(chapterTitle: string) {
  return (
    assessmentConfigs.find((config) => config.chapterTitle === chapterTitle)?.key ?? null
  );
}
