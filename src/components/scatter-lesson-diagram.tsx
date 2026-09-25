"use client";
import type { LessonDrawing } from "@/lib/lessons/schema";
import {
  NativeLessonDiagram,
  NativePlotSvg,
  NativeDiagramMathLabel,
} from "./native-lesson-diagram";
export function ScatterLessonDiagram({
  drawing,
  description,
}: {
  drawing: Extract<LessonDrawing, { type: "scatter" }>;
  description: string;
}) {
  const sx = (x: number) =>
    50 +
    (290 * (x - drawing.xRange[0])) / (drawing.xRange[1] - drawing.xRange[0]);
  const sy = (y: number) =>
    205 -
    (170 * (y - drawing.yRange[0])) / (drawing.yRange[1] - drawing.yRange[0]);
  return (
    <NativeLessonDiagram caption={drawing.caption}>
      <NativePlotSvg role="img" aria-label={description}>
        <path
          d="M50 30V205H350 M46 36L50 30L54 36 M344 201L350 205L344 209"
          fill="none"
          stroke="#a1a1aa"
          strokeWidth="1.25"
        />
        <NativeDiagramMathLabel x={50} y={0} width={30}>
          {drawing.yLabel}
        </NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={375} y={196} width={30}>
          {drawing.xLabel}
        </NativeDiagramMathLabel>
        {drawing.points.map(([x, y], i) => (
          <circle key={i} cx={sx(x)} cy={sy(y)} r={3} fill="#18181b" />
        ))}
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}
