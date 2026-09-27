import {
  A_LEVEL_MATHS_SUBJECTS,
  INTERACTIVE_ASSESSMENT_TITLE,
  SYNOPTIC_ASSESSMENT_TITLE,
} from "./seed.ts";
import { assessmentKeyFor, COURSE_BANK_MAPPINGS } from "./question-bank/course-mapping.ts";

export const CHAPTER_ONE_ASSESSMENT_KEY =
  "pure-mathematics:chapter-1-algebra-and-functions";
export { SYNOPTIC_ASSESSMENT_TITLE };

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
  scope: "chapter" as const,
  key: assessmentKeyFor(mapping),
  chapterTitle: mapping.chapterTitle,
  subjectTitle: mapping.subjectTitle,
  bankCourseTopicKey: mapping.courseTopicKey,
  bankCourseTopicKeys: [mapping.courseTopicKey],
  title: `${mapping.chapterTitle.replace(/^Chapter \d+:\s*/, "")} Assessment`,
  durationSeconds: 90 * 60,
  questionCount: 15,
  totalMarks: 75,
  minimumStudentPlan: mapping.courseTopicKey === "pure_1_algebra_and_functions" ? "basic" as const : "premium" as const,
  requiredModuleTitles: moduleTitles(mapping.subjectTitle, mapping.chapterTitle),
  rules: STANDARD_ASSESSMENT_RULES,
}));

const SYNOPTIC_DIFFICULTY_SPLIT = {
  Foundation: 5,
  Standard: 10,
  Stretch: 5,
} as const;

function synopticKey(subjectTitle: string) {
  return `synoptic:${subjectTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export const SYNOPTIC_ASSESSMENT_CONFIGS = A_LEVEL_MATHS_SUBJECTS.map((subject) => {
  const mappings = COURSE_BANK_MAPPINGS.filter((mapping) => mapping.subjectTitle === subject.title);
  return {
    scope: "subject" as const,
    key: synopticKey(subject.title),
    chapterTitle: null,
    subjectTitle: subject.title,
    bankCourseTopicKey: `synoptic:${subject.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    bankCourseTopicKeys: mappings.map((mapping) => mapping.courseTopicKey),
    title: `${subject.title} Synoptic Assessment`,
    durationSeconds: 90 * 60,
    questionCount: 20,
    totalMarks: null,
    minimumStudentPlan: "premium" as const,
    requiredModuleTitles: subject.chapters.flatMap((chapter) => moduleTitles(subject.title, chapter.title)),
    requiredModules: subject.chapters.flatMap((chapter) =>
      moduleTitles(subject.title, chapter.title).map((title) => ({
        chapterTitle: chapter.title,
        title,
      })),
    ),
    difficultySplit: SYNOPTIC_DIFFICULTY_SPLIT,
    requiresTutorUnlock: false,
    rules: STANDARD_ASSESSMENT_RULES,
  };
});

const assessmentConfigs = [
  ...GENERATED_ASSESSMENT_CONFIGS.map((config) => ({
    ...config,
    requiredModules: config.requiredModuleTitles.map((title) => ({
      chapterTitle: config.chapterTitle,
      title,
    })),
    difficultySplit: { Foundation: 4, Standard: 7, Stretch: 4 } as const,
    requiresTutorUnlock: true,
  })),
  ...SYNOPTIC_ASSESSMENT_CONFIGS,
];

export function getAssessmentConfig(key: string) {
  return assessmentConfigs.find((config) => config.key === key) ?? null;
}

export function getAssessmentKeyForChapter(chapterTitle: string) {
  return (
    assessmentConfigs.find((config) => config.chapterTitle === chapterTitle)?.key ?? null
  );
}

export function getAssessmentKeyForSubject(subjectTitle: string) {
  return SYNOPTIC_ASSESSMENT_CONFIGS.find((config) => config.subjectTitle === subjectTitle)?.key ?? null;
}
