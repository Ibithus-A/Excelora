import legacy from "../../content/notion-lessons/legacy-structured.json";
import { NOTION_LESSON_DEFINITIONS } from "../../content/notion-lessons/definitions";
import { NATIVE_DUPLICATES } from "../../content/notion-lessons/native-duplicates";
import type { NativeLesson, LessonBlock } from "./schema";
export const STRUCTURED_LESSONS: NativeLesson[] = [
  ...legacy.map((item) => {
    const definition =
      NOTION_LESSON_DEFINITIONS[
        item.key as keyof typeof NOTION_LESSON_DEFINITIONS
      ];
    return {
      ...definition,
      chapterTitle: `Chapter 1: ${definition.chapterTitle}`,
      subtopic: definition.title,
      status: "approved" as const,
      blocks: item.blocks as LessonBlock[],
    };
  }),
  ...NATIVE_DUPLICATES,
];
export function getStructuredLesson(title: string) {
  return STRUCTURED_LESSONS.find((l) => l.previewTitle === title || l.sourceTitle === title) ?? null;
}
