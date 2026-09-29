import { getStructuredLesson } from "@/lib/lessons/catalogue";
import { serializeLesson } from "@/lib/lessons/schema";
import { A_LEVEL_MATHS_SUBJECTS, A_LEVEL_MATHS_TITLE } from "@/lib/seed";
import { readPdfTextForSubtopic } from "@/lib/pdf-text";

export type CanonicalCourseContext = {
  course: string;
  qualification: string;
  subject: string | null;
  chapter: string | null;
  topic: string | null;
  pageTitle: string;
  contextKey: string;
  lessonContent: string;
};

function clean(value: string) { return value.trim().toLowerCase(); }

export async function getCanonicalCourseContext(pageTitle: string, pdfTitle: string): Promise<CanonicalCourseContext> {
  const requested = clean(pageTitle);
  let subject: string | null = null;
  let chapter: string | null = null;
  let topic: string | null = null;
  for (const subjectDef of A_LEVEL_MATHS_SUBJECTS) {
    for (const chapterDef of subjectDef.chapters) {
      const matchedTopic = chapterDef.subtopics.find((item) => clean(item) === requested);
      if (matchedTopic || clean(chapterDef.title) === requested) {
        subject = subjectDef.title;
        chapter = chapterDef.title;
        topic = matchedTopic ?? null;
        break;
      }
    }
    if (chapter) break;
    if (clean(subjectDef.title) === requested) subject = subjectDef.title;
  }
  const canonicalTitle = topic ?? chapter ?? subject ?? (requested === clean(A_LEVEL_MATHS_TITLE) ? A_LEVEL_MATHS_TITLE : "Workspace");
  const lesson = topic ? getStructuredLesson(topic) : null;
  let lessonContent = lesson ? serializeLesson(lesson, 14_000) : "";
  if (!lessonContent && topic && pdfTitle && clean(pdfTitle) === clean(topic)) {
    try { lessonContent = ((await readPdfTextForSubtopic(topic)) ?? "").slice(0, 14_000); } catch { lessonContent = ""; }
  }
  return {
    course: A_LEVEL_MATHS_TITLE,
    qualification: "A Level Mathematics",
    subject,
    chapter,
    topic,
    pageTitle: canonicalTitle,
    contextKey: [subject, chapter, topic ?? canonicalTitle].filter(Boolean).join(" > ").slice(0, 500),
    lessonContent,
  };
}
