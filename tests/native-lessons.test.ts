import { polynomialBezier } from "../src/lib/lessons/geometry.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import katex from "katex";
import { NATIVE_DUPLICATES } from "../src/content/notion-lessons/native-duplicates.ts";
import { createSeedState, insertALevelMathsTree } from "../src/lib/seed.ts";
import {
  serializeLesson,
  type LessonBlock,
  type LessonInline,
} from "../src/lib/lessons/schema.ts";
function checkInline(content: LessonInline[]) {
  for (const part of content) {
    if (part.type === "math")
      katex.renderToString(part.latex, { throwOnError: true, strict: "error" });
    else
      assert.ok(!part.value.includes("$"), `Unpaired delimiter: ${part.value}`);
  }
}
function check(blocks: LessonBlock[]) {
  for (const block of blocks) {
    if (block.type === "paragraph") checkInline(block.content);
    else if (block.type === "math")
      katex.renderToString(block.latex, {
        throwOnError: true,
        strict: "error",
      });
    else if (block.type === "table") {
      block.headers.forEach(checkInline);
      block.rows.forEach((row) => {
        assert.equal(row.length, block.headers.length);
        row.forEach(checkInline);
      });
    } else if (block.type === "diagram") {
      assert.ok(block.description.length > 20);
      if (block.drawing?.type === "vectors") {
        const d = block.drawing;
        assert.ok(d.xLabel && d.yLabel);
        for (const v of d.vectors) {
          assert.ok(v.x > d.xRange[0] && v.x < d.xRange[1]);
          assert.ok(v.y > d.yRange[0] && v.y < d.yRange[1]);
          katex.renderToString(v.label, { throwOnError: true });
        }
      }
    } else if ("children" in block) check(block.children);
  }
}
for (const lesson of NATIVE_DUPLICATES)
  test(`native lesson: ${lesson.subjectTitle} ${lesson.sourceTitle}`, () => {
    assert.ok(existsSync(lesson.sourcePdf!));
    check(lesson.blocks);
    const context = serializeLesson(lesson, 100000);
    assert.ok(context.length > 500);
    assert.ok(context.includes(lesson.title));
    assert.ok(!context.includes("<div"));
  });
test("canonical native pages preserve IDs and remove PDF/review siblings during reconciliation", () => {
  const initial = createSeedState();
  const next = insertALevelMathsTree(initial);
  for (const lesson of NATIVE_DUPLICATES) {
    const chapter = Object.values(next.nodes).find(
      (n) =>
        n.title === lesson.chapterTitle &&
        next.nodes[n.parentId ?? ""]?.title === lesson.subjectTitle,
    )!;
    assert.ok(chapter);
    const children = chapter.childrenIds.map((id) => next.nodes[id]);
    const source = children.find((n) => n.title === lesson.sourceTitle);
    const native = children.find((n) => n.title === lesson.previewTitle);
    assert.ok(source);
    assert.equal(native, undefined);
    assert.ok(children.some((n) => n.title === "Practice Questions"));
    assert.equal(initial.nodes[source.id].title, source.title);
  }
  assert.equal(
    new Set(NATIVE_DUPLICATES.map((l) => l.id)).size,
    NATIVE_DUPLICATES.length,
  );
});

test("polynomial diagram curves reproduce values throughout the plotted domain", () => {
  for (const [coefficients, domain] of [
    [
      [9, -12, 3],
      [0, 4],
    ],
    [
      [0, 24, -9, 1],
      [0, 5],
    ],
  ] as const) {
    const controls = polynomialBezier(coefficients, domain);
    for (let i = 0; i <= 20; i++) {
      const t = i / 20,
        u = 1 - t;
      const weights = [u ** 3, 3 * u * u * t, 3 * u * t * t, t ** 3];
      const x = controls.reduce((sum, p, j) => sum + p[0] * weights[j], 0);
      const y = controls.reduce((sum, p, j) => sum + p[1] * weights[j], 0);
      const expected = coefficients.reduceRight(
        (sum, c) => sum * x + c,
        0 as number,
      );
      assert.ok(Math.abs(y - expected) < 1e-9);
    }
  }
  assert.throws(() => polynomialBezier([1, 2, 3, 4, 5], [0, 1]));
});

test("motion graphs preserve the distances and velocities stated in the worked examples", () => {
  const lesson = NATIVE_DUPLICATES.find(
    (l) =>
      l.subjectTitle === "Mechanics" &&
      l.sourceTitle === "2.1 Velocity-Time Graphs",
  )!;
  const graphs: Extract<
    import("../src/lib/lessons/schema.ts").LessonDrawing,
    { type: "motion-graph" }
  >[] = [];
  const walk = (blocks: LessonBlock[]) => {
    for (const b of blocks) {
      if (b.type === "diagram" && b.drawing?.type === "motion-graph")
        graphs.push(b.drawing);
      else if ("children" in b) walk(b.children);
    }
  };
  walk(lesson.blocks);
  const area = (points: [number, number][]) =>
    points
      .slice(1)
      .reduce(
        (total, [t, v], i) =>
          total + ((t - points[i][0]) * (v + points[i][1])) / 2,
        0,
      );
  assert.equal(graphs.length, 5);
  assert.equal(area(graphs[1].points), 450);
  assert.equal(area(graphs[2].points), 200);
  assert.equal(area(graphs[3].points), 1925);
  assert.equal(
    (graphs[4].points[1][1] - graphs[4].points[0][1]) /
      (graphs[4].points[1][0] - graphs[4].points[0][0]),
    5,
  );
  for (const graph of graphs)
    for (const [i, [x, y]] of graph.points.entries()) {
      assert.ok(
        Number.isFinite(x) &&
          Number.isFinite(y) &&
          x >= 0 &&
          x < graph.xMax &&
          y >= 0 &&
          y < graph.yMax,
      );
      if (i) assert.ok(x > graph.points[i - 1][0]);
    }
});

function lessonDiagrams(lesson: (typeof NATIVE_DUPLICATES)[number]) {
  const drawings: NonNullable<Extract<LessonBlock, { type: "diagram" }>["drawing"]>[] = [];
  const walk = (blocks: LessonBlock[]) => {
    for (const block of blocks) {
      if (block.type === "diagram" && block.drawing) drawings.push(block.drawing);
      else if ("children" in block) walk(block.children);
    }
  };
  walk(lesson.blocks);
  return drawings;
}

test("visual-heavy maths chapters give every native lesson a learning diagram", () => {
  const visualLessons = NATIVE_DUPLICATES.filter(
    (lesson) =>
      lesson.subjectTitle === "Mechanics" ||
      /Chapter (5: Trigonometry|7: Differentiation|8: Integration)/.test(
        lesson.chapterTitle,
      ) ||
      /Modelling/.test(lesson.sourceTitle),
  );
  assert.ok(visualLessons.length >= 40, "unexpectedly small visual lesson set");
  for (const lesson of visualLessons)
    assert.ok(
      lessonDiagrams(lesson).length > 0,
      `${lesson.sourceTitle} has no explanatory diagram`,
    );
});

test("teaching plots use finite ordered ranges and valid annotations", () => {
  const plots = NATIVE_DUPLICATES.flatMap(lessonDiagrams).filter(
    (drawing) => drawing.type === "teaching-plot",
  );
  assert.ok(plots.length >= 10);
  for (const plot of plots) {
    assert.ok(plot.xRange.every(Number.isFinite));
    assert.ok(plot.yRange.every(Number.isFinite));
    assert.ok(plot.xRange[0] < plot.xRange[1]);
    assert.ok(plot.yRange[0] < plot.yRange[1]);
    assert.ok(plot.curves.length > 0);
    for (const area of plot.shade ?? []) {
      assert.ok(area.from >= plot.xRange[0] && area.to <= plot.xRange[1]);
      assert.ok(area.from < area.to);
      assert.ok(area.curve >= 0 && area.curve < plot.curves.length);
      if (area.against !== undefined)
        assert.ok(area.against >= 0 && area.against < plot.curves.length);
    }
    for (const point of plot.points ?? []) {
      assert.ok(point.x >= plot.xRange[0] && point.x <= plot.xRange[1]);
      assert.ok(point.y >= plot.yRange[0] && point.y <= plot.yRange[1]);
    }
  }
});

test("teaching diagram labels stay out of the plotted data field", () => {
  const source = readFileSync(
    new URL("../src/components/teaching-plot-diagram.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /NativeDiagramLegend/);
  assert.match(source, /drawing\.points\?\.map\(\(point, index\)/);
  assert.doesNotMatch(
    source,
    /NativeDiagramMathLabel[^>]*>[^{]*\{point\.label\}/,
    "point labels must remain in the protected legend rather than over a curve",
  );
  assert.match(source, /const round = \(number: number\)/);
});
