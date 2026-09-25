import type { FlowState } from "../types/flowstate.ts";
import type { TopicProgressRow } from "../types/topic-progress.ts";
export function lessonIdentity(
  subject: string | null,
  chapter: string | null,
  title: string,
) {
  return [
    subject ?? "",
    chapter ?? "",
    title.replace(
      /\s+[—-]\s+(?:Native review|Original PDF|Notion Preview)$/i,
      "",
    ),
  ]
    .map((s) => s.trim().toLowerCase())
    .join("::");
}
/** Course nodes may have different IDs in older browsers. Match saved learning by course identity. */
export function mapLessonProgress(state: FlowState, rows: TopicProgressRow[]) {
  const byIdentity = new Map<string, TopicProgressRow>();
  for (const row of [...rows].sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  )) {
    const key = lessonIdentity(
      row.subject_title,
      row.chapter_title,
      row.topic_title,
    );
    if (!byIdentity.has(key)) byIdentity.set(key, row);
  }
  const lessonProgress: Record<string, boolean> = {},
    recordsByNode: Record<string, TopicProgressRow> = {};
  let currentSubtopicId: string | null = null;
  for (const node of Object.values(state.nodes)) {
    if (node.kind !== "page" || !node.parentId) continue;
    const chapter = state.nodes[node.parentId],
      subject = chapter?.parentId ? state.nodes[chapter.parentId] : null;
    const row = byIdentity.get(
      lessonIdentity(
        subject?.title ?? null,
        chapter?.title ?? null,
        node.title,
      ),
    );
    if (!row) continue;
    recordsByNode[node.id] = row;
    lessonProgress[node.id] = row.status === "completed" || row.watched_video;
    if (row.status === "current") currentSubtopicId = node.id;
  }
  return { lessonProgress, currentSubtopicId, recordsByNode };
}
