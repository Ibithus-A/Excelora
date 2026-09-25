import type { LessonBlock } from "./schema.ts";
export function paragraphText(block: LessonBlock): string {
  return block.type === "paragraph"
    ? block.content
        .map((p) => (p.type === "text" ? p.value : `$${p.latex}$`))
        .join("")
    : "";
}
/** Source-defined item boundaries only. No mathematical content is rewritten. */
export function lessonCards(
  blocks: LessonBlock[],
  section: string,
): LessonBlock[][] {
  const result: LessonBlock[][] = [];
  const numbered =
    /^(?:\d+\.|(?:Example|Practice|Question|Solution)\s+\d+(?:\.\d+)*[.:])/i;
  for (const block of blocks) {
    const separate =
      block.type === "example" ||
      block.type === "practice" ||
      block.type === "solution";
    if (separate || numbered.test(paragraphText(block)) || !result.length)
      result.push([block]);
    else result[result.length - 1].push(block);
  }
  return /worked examples?|practi[cs]e|solutions?/i.test(section)
    ? result
    : [blocks];
}
