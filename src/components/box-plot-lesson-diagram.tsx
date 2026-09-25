"use client";
import type { LessonDrawing } from "@/lib/lessons/schema";
import {
  NativeLessonDiagram,
  NativePlotSvg,
  NativeDiagramMathLabel,
} from "./native-lesson-diagram";
export function BoxPlotLessonDiagram({
  drawing,
  description,
}: {
  drawing: Extract<LessonDrawing, { type: "box-plot" }>;
  description: string;
}) {
  const sx = (value: number) =>
    35 +
    (330 * (value - drawing.range[0])) / (drawing.range[1] - drawing.range[0]);
  const [minimum, q1, median, q3, maximum] = drawing.values.map(sx);
  return (
    <NativeLessonDiagram>
      <NativePlotSvg role="img" aria-label={description}>
        <line
          x1={35}
          x2={365}
          y1={170}
          y2={170}
          stroke="#a1a1aa"
          strokeWidth="1.25"
        />
        {drawing.ticks.map((value) => (
          <g key={value}>
            <line
              x1={sx(value)}
              x2={sx(value)}
              y1={166}
              y2={174}
              stroke="#a1a1aa"
              strokeWidth="1.25"
            />
            <NativeDiagramMathLabel x={sx(value)} y={185} width={30}>
              {String(value)}
            </NativeDiagramMathLabel>
          </g>
        ))}
        <line
          x1={minimum}
          x2={q1}
          y1={120}
          y2={120}
          stroke="#18181b"
          strokeWidth="1.5"
        />
        <line
          x1={q3}
          x2={maximum}
          y1={120}
          y2={120}
          stroke="#18181b"
          strokeWidth="1.5"
        />
        <rect
          x={q1}
          y={100}
          width={q3 - q1}
          height={40}
          fill="none"
          stroke="#18181b"
          strokeWidth="1.5"
        />
        {[minimum, median, maximum].map((x, i) => (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={100}
            y2={140}
            stroke="#18181b"
            strokeWidth="1.5"
          />
        ))}
        {drawing.values.map((value, i) => (
          <NativeDiagramMathLabel key={i} x={sx(value)} y={67} width={36}>
            {drawing.labels[i]}
          </NativeDiagramMathLabel>
        ))}
        {drawing.axisLabel && (
          <NativeDiagramMathLabel x={200} y={220} width={240}>
            {drawing.axisLabel}
          </NativeDiagramMathLabel>
        )}
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}
