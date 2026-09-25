"use client";
import type { LessonDrawing } from "@/lib/lessons/schema";
import {
  NativeLessonDiagram,
  NativePlotSvg,
  NativeDiagramMathLabel,
} from "./native-lesson-diagram";
export function VennLessonDiagram({
  drawing,
  description,
}: {
  drawing: Extract<LessonDrawing, { type: "venn-two" }>;
  description: string;
}) {
  return (
    <NativeLessonDiagram>
      <NativePlotSvg role="img" aria-label={description}>
        <rect
          x="25"
          y="25"
          width="350"
          height="200"
          fill="none"
          stroke="#a1a1aa"
          strokeWidth="1.25"
        />
        <circle
          cx="155"
          cy="130"
          r="75"
          fill="none"
          stroke="#18181b"
          strokeWidth="1.5"
        />
        <circle
          cx="245"
          cy="130"
          r="75"
          fill="none"
          stroke="#71717a"
          strokeWidth="1.5"
        />
        <NativeDiagramMathLabel x={350} y={36} width={28}>
          {drawing.sampleSpace}
        </NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={140} y={31} width={28}>
          {drawing.sets[0]}
        </NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={260} y={31} width={28}>
          {drawing.sets[1]}
        </NativeDiagramMathLabel>
        {[120, 200, 280].map((x, i) => (
          <NativeDiagramMathLabel key={i} x={x} y={121} width={65}>
            {drawing.regions[i]}
          </NativeDiagramMathLabel>
        ))}
        {drawing.outside && (
          <NativeDiagramMathLabel x={345} y={192} width={40}>
            {drawing.outside}
          </NativeDiagramMathLabel>
        )}
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}
