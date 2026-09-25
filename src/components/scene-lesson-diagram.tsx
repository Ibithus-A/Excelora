"use client";
import { useId } from "react";
import type { LessonDrawing } from "@/lib/lessons/schema";
import {
  NativeLessonDiagram,
  NativePlotSvg,
  NativeDiagramMathLabel,
  NativeDiagramLegend,
} from "./native-lesson-diagram";
import { MathText } from "./notion-lesson-renderer";
export function SceneLessonDiagram({
  drawing,
  description,
}: {
  drawing: Extract<LessonDrawing, { type: "scene" }>;
  description: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <NativeLessonDiagram>
      <NativePlotSvg role="img" aria-label={description}>
        <defs>
          <marker
            id={id}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0 0L6 3L0 6Z" fill="#52525b" />
          </marker>
        </defs>
        {drawing.paths?.map((p, i) => (
          <path
            key={`p${i}`}
            d={p.d}
            fill="none"
            stroke="#71717a"
            strokeWidth="1.5"
            strokeDasharray={p.dashed ? "4 4" : undefined}
          />
        ))}
        {drawing.lines.map((l, i) => (
          <line
            key={i}
            x1={l.from[0]}
            y1={l.from[1]}
            x2={l.to[0]}
            y2={l.to[1]}
            stroke={l.arrow ? "#52525b" : "#a1a1aa"}
            strokeWidth={l.arrow ? 1.5 : 1.25}
            strokeDasharray={l.dashed ? "4 4" : undefined}
            markerEnd={l.arrow ? `url(#${id})` : undefined}
          />
        ))}
        {drawing.rects?.map((r, i) => (
          <rect
            key={`r${i}`}
            x={r.x}
            y={r.y}
            width={r.width}
            height={r.height}
            transform={
              r.rotate
                ? `rotate(${r.rotate} ${r.x + r.width / 2} ${r.y + r.height / 2})`
                : undefined
            }
            fill="white"
            stroke="#71717a"
          />
        ))}
        {drawing.circles?.map((c, i) => (
          <circle
            key={`c${i}`}
            cx={c.x}
            cy={c.y}
            r={c.r}
            fill="white"
            stroke="#71717a"
          />
        ))}
        {drawing.labels.map((l, i) => (
          <NativeDiagramMathLabel
            key={`l${i}`}
            x={l.x}
            y={l.y}
            width={l.width ?? 65}
          >
            {l.text}
          </NativeDiagramMathLabel>
        ))}
      </NativePlotSvg>
      {drawing.caption.length > 0 && (
        <NativeDiagramLegend>
          {drawing.caption.map((c, i) => (
            <MathText key={i}>{c}</MathText>
          ))}
        </NativeDiagramLegend>
      )}
    </NativeLessonDiagram>
  );
}
