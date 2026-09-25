"use client";
import {
  NotionLessonRenderer,
  MathText,
  DisplayMath,
  LessonSection,
  Step,
} from "./notion-lesson-renderer";
import { LessonDataDiagram } from "./lesson-data-diagram";
import { lessonCards } from "@/lib/lessons/presentation";
import { NativeLessonDiagram } from "./native-lesson-diagram";
import type {
  LessonInline,
  LessonBlock,
  NativeLesson,
} from "@/lib/lessons/schema";
function Inline({ content }: { content: LessonInline[] }) {
  return (
    <>
      {content.map((part, i) =>
        part.type === "math" ? (
          <MathText key={i}>{part.latex}</MathText>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </>
  );
}
function ExampleCard({ items }: { items: LessonBlock[] }) {
  const content = items.flatMap((item) =>
    ["example", "solution", "practice"].includes(item.type) &&
    "children" in item
      ? item.children
      : [item],
  );
  const [prompt, ...working] = content;
  const steps: LessonBlock[][] = [];
  for (const item of working) {
    if (!steps.length || item.type === "paragraph" || item.type === "step")
      steps.push([item]);
    else steps[steps.length - 1].push(item);
  }
  return (
    <div
      data-lesson-card
      className="min-w-0 rounded-xl border border-zinc-200 p-4 sm:p-6"
    >
      {prompt && (
        <div className="font-semibold text-zinc-950">
          <Blocks blocks={[prompt]} inCard />
        </div>
      )}
      {steps.length > 0 && (
        <div className="mt-6 space-y-5">
          {steps.map((step, i) =>
            step[0].type === "step" ? (
              <Blocks key={i} blocks={step} inCard />
            ) : (
              <Step key={i} number={i + 1} title="">
                <Blocks blocks={step} inCard />
              </Step>
            ),
          )}
        </div>
      )}
    </div>
  );
}
function TheoryBlocks({ blocks }: { blocks: LessonBlock[] }) {
  const groups: LessonBlock[][] = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (block.type === "math" && last?.every((b) => b.type === "math"))
      last.push(block);
    else groups.push([block]);
  }
  return (
    <>
      {groups.map((group, i) =>
        group.length > 1 && group[0].type === "math" ? (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 sm:px-6 sm:py-4"
          >
            <Blocks blocks={group} inCard />
          </div>
        ) : (
          <Blocks key={i} blocks={group} />
        ),
      )}
    </>
  );
}
function Blocks({
  blocks,
  inCard = false,
}: {
  blocks: LessonBlock[];
  inCard?: boolean;
}) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className="mt-10 mb-4 text-2xl font-semibold">
                {block.title}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i} className="my-4">
                <Inline content={block.content} />
              </p>
            );
          case "math":
            return <DisplayMath key={i}>{block.latex}</DisplayMath>;
          case "diagram":
            if (block.drawing)
              return (
                <LessonDataDiagram
                  key={i}
                  drawing={block.drawing}
                  description={block.description}
                />
              );
            return (
              <NativeLessonDiagram key={i} caption={block.description}>
                {block.asset ? (
                  <object
                    aria-label={block.description}
                    type="image/svg+xml"
                    data={block.asset}
                    className="w-full"
                  />
                ) : (
                  <p className="text-sm">{block.description}</p>
                )}
              </NativeLessonDiagram>
            );
          case "table":
            return (
              <div key={i} className="max-w-full overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      {block.headers.map((cell, j) => (
                        <th key={j} className="border p-3">
                          <Inline content={cell} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k} className="border p-3">
                            <Inline content={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "step":
            return (
              <Step
                key={i}
                number={block.number ?? i + 1}
                title={block.title ?? ""}
              >
                <Blocks blocks={block.children} />
              </Step>
            );
          default:
            if (
              block.type === "group" &&
              block.title &&
              /worked examples?|practi[cs]e|solutions?/i.test(block.title)
            ) {
              return (
                <LessonSection key={i} title={block.title}>
                  <div className="space-y-6">
                    {lessonCards(block.children, block.title).map(
                      (items, j) => (
                        <ExampleCard key={j} items={items} />
                      ),
                    )}
                  </div>
                </LessonSection>
              );
            }
            if (["example", "practice", "solution"].includes(block.type)) {
              return (
                <div
                  key={i}
                  data-lesson-card={!inCard || undefined}
                  className={
                    inCard
                      ? "space-y-4"
                      : "my-6 min-w-0 space-y-4 rounded-xl border border-zinc-200 p-4 sm:p-6"
                  }
                >
                  {block.title && (
                    <h3 className="font-semibold text-zinc-950">
                      {block.title}
                    </h3>
                  )}
                  <Blocks blocks={block.children} inCard />
                </div>
              );
            }
            return block.title ? (
              <LessonSection key={i} title={block.title}>
                <TheoryBlocks blocks={block.children} />
              </LessonSection>
            ) : (
              <div
                key={i}
                className={
                  block.type === "callout"
                    ? "rounded-xl border bg-zinc-50 p-4"
                    : "my-4 space-y-4"
                }
              >
                <Blocks blocks={block.children} />
              </div>
            );
        }
      })}
    </>
  );
}
export function StructuredNativeLesson({ lesson }: { lesson: NativeLesson }) {
  const firstSection = lesson.blocks.findIndex(
    (b) => b.type === "heading" || b.type === "group",
  );
  const intro = firstSection > 0 ? lesson.blocks.slice(0, firstSection) : [];
  const body =
    firstSection > 0 ? lesson.blocks.slice(firstSection) : lesson.blocks;
  return (
    <NotionLessonRenderer
      definition={lesson}
      introduction={intro.length ? <Blocks blocks={intro} /> : null}
    >
      <div className="min-w-0">
        <TheoryBlocks blocks={body} />
      </div>
    </NotionLessonRenderer>
  );
}
