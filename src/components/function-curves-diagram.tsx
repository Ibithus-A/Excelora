"use client";
import type { LessonDrawing } from "@/lib/lessons/schema";
import { curveSegments } from "@/lib/lessons/analytic-curves";
import { MathText } from "./notion-lesson-renderer";
import {
  NativeLessonDiagram,
  NativePlotSvg,
  NativeDiagramMathLabel,
  NativeDiagramLegend,
  NativeDiagramLegendItem,
} from "./native-lesson-diagram";
export function FunctionCurvesDiagram({
  drawing,
  description,
}: {
  drawing: Extract<LessonDrawing, { type: "function-curves" }>;
  description: string;
}) {
  const sx = (x: number) =>
    55 +
    (285 * (x - drawing.xRange[0])) / (drawing.xRange[1] - drawing.xRange[0]);
  const sy = (y: number) =>
    200 -
    (150 * (y - drawing.yRange[0])) / (drawing.yRange[1] - drawing.yRange[0]);
  const axisY = sy(0),
    axisX = sx(
      drawing.yAxisAt ??
        Math.max(drawing.xRange[0], Math.min(0, drawing.xRange[1])),
    );
  const path = (
    curve: (typeof drawing.curves)[number],
    domain: [number, number],
  ) =>
    curveSegments(curve, domain)
      .map(
        (points, i) =>
          `${i === 0 ? `M${sx(points[0][0])},${sy(points[0][1])}` : ""}C${points
            .slice(1)
            .map(([x, y]) => `${sx(x)},${sy(y)}`)
            .join(" ")}`,
      )
      .join(" ");
  return (
    <NativeLessonDiagram>
      <NativePlotSvg role="img" aria-label={description}>
        {drawing.shade?.map(([a, b], i) => (
          <path
            key={i}
            d={`${path(drawing.curves[0], [a, b])}L${sx(b)},${axisY}L${sx(a)},${axisY}Z`}
            fill="#e4e4e7"
          />
        ))}
        <line
          x1={48}
          x2={351}
          y1={axisY}
          y2={axisY}
          stroke="#a1a1aa"
          strokeWidth="1.25"
        />
        <line
          x1={axisX}
          x2={axisX}
          y1={214}
          y2={33}
          stroke="#a1a1aa"
          strokeWidth="1.25"
        />
        <NativeDiagramMathLabel x={376} y={axisY - 9} width={30}>
          {drawing.xLabel ?? "x"}
        </NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={axisX} y={0} width={70}>
          {drawing.yLabel ?? "y"}
        </NativeDiagramMathLabel>
        {drawing.ticks?.map((tick, i) => (
          <g key={i}>
            <line
              x1={sx(tick.x)}
              x2={sx(tick.x)}
              y1={axisY - 3}
              y2={axisY + 3}
              stroke="#a1a1aa"
            />
            <NativeDiagramMathLabel x={sx(tick.x)} y={axisY + 13} width={50}>
              {tick.label}
            </NativeDiagramMathLabel>
          </g>
        ))}
        {drawing.curves.map((curve, i) => (
          <path
            key={i}
            d={path(curve, drawing.xRange)}
            fill="none"
            stroke={i ? "#71717a" : "#18181b"}
            strokeDasharray={curve.dashed ? "5 4" : undefined}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {drawing.points?.map((point, i) => (
          <circle
            key={i}
            cx={sx(point.x)}
            cy={sy(point.y)}
            r={3}
            fill="#18181b"
          />
        ))}
      </NativePlotSvg>
      <NativeDiagramLegend>
        {drawing.curves.map((curve, i) => (
          <NativeDiagramLegendItem
            key={i}
            dashed={curve.dashed}
            secondary={i > 0}
          >
            <MathText>{curve.label}</MathText>
          </NativeDiagramLegendItem>
        ))}
        {drawing.points?.map((point, i) => (
          <MathText key={i}>{point.label}</MathText>
        ))}
      </NativeDiagramLegend>
    </NativeLessonDiagram>
  );
}
