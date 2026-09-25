import type {
  LessonBlock,
  LessonInline,
  NativeLesson,
} from "../../lib/lessons/schema.ts";
export function inline(value: string): LessonInline[] {
  return value
    .split(/(\$[^$]+\$)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("$")
        ? { type: "math", latex: part.slice(1, -1) }
        : { type: "text", value: part },
    );
}
export const p = (value: string): LessonBlock => ({
  type: "paragraph",
  content: inline(value),
});
export const m = (latex: string): LessonBlock => ({ type: "math", latex });
export const h = (title: string): LessonBlock => ({ type: "heading", title });
export const group = (title: string, children: LessonBlock[]): LessonBlock => ({
  type: "group",
  title,
  children,
});
export const example = (children: LessonBlock[]): LessonBlock => ({
  type: "example",
  children,
});
export const step = (
  number: number,
  title: string,
  children: LessonBlock[],
): LessonBlock => ({ type: "step", number, title, children });
export const table = (headers: string[], rows: string[][]): LessonBlock => ({
  type: "table",
  headers: headers.map(inline),
  rows: rows.map((row) => row.map(inline)),
});
export function nativeLesson(
  subjectTitle: string,
  chapterTitle: string,
  sourceTitle: string,
  blocks: LessonBlock[],
): NativeLesson {
  const title = sourceTitle.replace(/^\d+\.\d+\s+/, "");
  return {
    id: `${subjectTitle}-${sourceTitle}-native`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-"),
    subjectTitle,
    chapterTitle,
    sourceTitle,
    title,
    subtopic: title,
    previewTitle: `${sourceTitle} — Native review`,
    status: "draft",
    sourcePdf: `archives/course-pdfs/${subjectTitle}/${sourceTitle}.pdf`,
    blocks,
  };
}

/** Author long source transcriptions as paragraphs, ## sections and $$ display maths. */
export function transcript(
  source: string,
  diagrams: Record<string, LessonBlock> = {},
): LessonBlock[] {
  const blocks: LessonBlock[] = [];
  let section: LessonBlock[] = blocks;
  let destination = section;
  for (const entry of source.trim().split(/\n\s*\n/)) {
    const value = entry.trim();
    if (value.startsWith("## ")) {
      section = [];
      blocks.push(group(value.slice(3), section));
      destination = section;
    } else if (value === "@card") {
      destination = [];
      section.push(example(destination));
    } else if (value.startsWith("@diagram ")) {
      const diagram = diagrams[value.slice(9)];
      if (!diagram) throw new Error(`Unknown diagram: ${value}`);
      destination.push(diagram);
    } else if (value.startsWith("$$") && value.endsWith("$$")) {
      destination.push(m(value.slice(2, -2).trim()));
    } else {
      destination.push(p(value.replace(/\n/g, " ")));
    }
  }
  return blocks;
}
