import type { AnalyticCurve } from "./analytic-curves.ts";
export type LessonDrawing =
  | {
      type: "scene";
      lines: {
        from: [number, number];
        to: [number, number];
        arrow?: boolean;
        dashed?: boolean;
      }[];
      rects?: {
        x: number;
        y: number;
        width: number;
        height: number;
        rotate?: number;
      }[];
      circles?: { x: number; y: number; r: number }[];
      paths?: { d: string; dashed?: boolean }[];
      labels: { x: number; y: number; text: string; width?: number }[];
      caption: string[];
    }
  | {
      type: "function-curves";
      xRange: [number, number];
      yRange: [number, number];
      curves: AnalyticCurve[];
      points?: { x: number; y: number; label: string }[];
      ticks?: { x: number; label: string }[];
      shade?: [number, number][];
      xLabel?: string;
      yLabel?: string;
      yAxisAt?: number;
    }
  | {
      type: "teaching-plot";
      xRange: [number, number];
      yRange: [number, number];
      xLabel: string;
      yLabel: string;
      curves: {
        kind: "polynomial" | "sin" | "cos" | "tan" | "sec" | "reciprocal" | "exp";
        coefficients?: number[];
        amplitude?: number;
        frequency?: number;
        phase?: number;
        verticalShift?: number;
        label?: string;
        dashed?: boolean;
      }[];
      xTicks?: { value: number; label: string }[];
      yTicks?: { value: number; label: string }[];
      points?: { x: number; y: number; label: string; dx?: number; dy?: number }[];
      tangents?: { x: number; y: number; slope: number; label: string }[];
      asymptotes?: number[];
      shade?: { from: number; to: number; curve: number; against?: number }[];
      caption?: string[];
    }
  | {
      type: "unit-circle";
      angle: number;
      angleLabel: string;
      mode: "angle" | "sector" | "coordinates" | "solutions";
      pointLabel?: string;
      caption?: string[];
    }
  | {
      type: "scatter";
      points: [number, number][];
      xRange: [number, number];
      yRange: [number, number];
      xLabel: string;
      yLabel: string;
      caption: string;
    }
  | {
      type: "box-plot";
      range: [number, number];
      ticks: number[];
      values: [number, number, number, number, number];
      labels: [string, string, string, string, string];
      axisLabel?: string;
    }
  | {
      type: "venn-two";
      sampleSpace: string;
      sets: [string, string];
      regions: [string, string, string];
      outside?: string;
    }
  | {
      type: "probability-tree";
      start?: string;
      first: [string, string];
      second: [[string, string], [string, string]];
      probabilities: [string, string];
      conditional: [[string, string], [string, string]];
    }
  | {
      type: "motion-graph";
      points: [number, number][];
      xMax: number;
      yMax: number;
      xLabel: string;
      yLabel: string;
      xTicks: { value: number; label: string }[];
      yTicks: { value: number; label: string }[];
      shade?: boolean;
      caption: string[];
    }
  | {
      type: "suvat";
      initial: string;
      final: string;
      displacement: string;
      acceleration?: string;
      accelerationDirection?: "left" | "right";
      initialArrow?: boolean;
      finalArrow?: boolean;
      labels?: boolean;
      time?: string;
    }
  | {
      type: "vertical-motion";
      mode: "up" | "down";
      initial: string;
      initialArrow?: boolean;
      final?: string;
      height: string;
      launchHeight?: string;
      gravity?: string;
    }
  | { type: "kinematics-setup" }
  | {
      type: "parametric";
      xCoefficients: number[];
      yCoefficients: number[];
      domain: [number, number];
      xRange: [number, number];
      yRange: [number, number];
      xLabel: string;
      yLabel: string;
      labels: {
        x: number;
        y: number;
        text: string;
        dx: number;
        dy: number;
        width?: number;
        guide?: boolean;
      }[];
    }
  | {
      type: "polynomial";
      coefficients: number[];
      domain: [number, number];
      xRange: [number, number];
      yRange: [number, number];
      xLabel: string;
      yLabel: string;
      labels: {
        x: number;
        y: number;
        text: string;
        dx: number;
        dy: number;
        width?: number;
        guide?: boolean;
      }[];
    }
  | { type: "circle-tangent" }
  | {
      type: "resolved-force";
      magnitude: number;
      angle: number;
      horizontalLabel: string;
      verticalLabel: string;
    }
  | {
      type: "vectors";
      xRange: [number, number];
      yRange: [number, number];
      xLabel: string;
      yLabel: string;
      vectors: {
        from?: [number, number];
        x: number;
        y: number;
        label: string;
        dashed?: boolean;
        endpointLabel?: string;
        labelDx?: number;
        labelDy?: number;
      }[];
    }
  | { type: "model"; model: "particle" | "rod" | "lamina"; weight: string };
export type LessonInline =
  { type: "text"; value: string } | { type: "math"; latex: string };
export type LessonBlock =
  | { type: "heading"; title: string }
  | { type: "paragraph"; content: LessonInline[] }
  | { type: "math"; latex: string }
  | {
      type: "group" | "example" | "callout" | "practice" | "solution" | "step";
      title?: string;
      number?: number;
      children: LessonBlock[];
    }
  | { type: "table"; headers: LessonInline[][]; rows: LessonInline[][][] }
  | {
      type: "diagram";
      description: string;
      asset?: string;
      drawing?: LessonDrawing;
    };
export type NativeLesson = {
  id: string;
  title: string;
  sourceTitle: string;
  previewTitle: string;
  subjectTitle: string;
  chapterTitle: string;
  subtopic: string;
  sourcePdf?: string;
  status: "draft" | "approved";
  blocks: LessonBlock[];
};

function inlineText(content: LessonInline[]) {
  return content
    .map((s) => (s.type === "math" ? `$${s.latex}$` : s.value))
    .join("");
}
export function lessonContextChunks(lesson: NativeLesson): string[] {
  const chunks = [
    `Lesson: ${lesson.title}\nSubject: ${lesson.subjectTitle}\nChapter: ${lesson.chapterTitle}\nSubtopic: ${lesson.subtopic}`,
  ];
  const visit = (blocks: LessonBlock[]) => {
    for (const block of blocks) {
      switch (block.type) {
        case "heading":
          chunks.push(block.title);
          break;
        case "paragraph":
          chunks.push(inlineText(block.content));
          break;
        case "math":
          chunks.push(`$$${block.latex}$$`);
          break;
        case "diagram":
          chunks.push(`Diagram: ${block.description}`);
          break;
        case "table":
          chunks.push(
            [
              block.headers.map(inlineText).join(" | "),
              ...block.rows.map((row) => row.map(inlineText).join(" | ")),
            ].join("\n"),
          );
          break;
        default:
          if (block.title)
            chunks.push(
              `${block.number ? `${block.number}. ` : ""}${block.title}`,
            );
          visit(block.children);
      }
    }
  };
  visit(lesson.blocks);
  return chunks.filter(Boolean);
}
/** Keep whole content blocks and leave an explicit truncation marker. */
export function serializeLesson(
  lesson: NativeLesson,
  maxChars = 18000,
): string {
  const chunks = lessonContextChunks(lesson),
    kept: string[] = [];
  let length = 0;
  const marker = "\n\n[Further lesson content omitted to fit context.]";
  for (const chunk of chunks) {
    if (length + chunk.length + 2 > maxChars - marker.length) {
      return kept.join("\n\n") + marker;
    }
    kept.push(chunk);
    length += chunk.length + 2;
  }
  return kept.join("\n\n");
}
