"use client";
import type { LessonDrawing } from "@/lib/lessons/schema";
import {
  NativeLessonDiagram,
  NativePlotSvg,
  NativeDiagramMathLabel,
} from "./native-lesson-diagram";
export function ProbabilityTreeDiagram({
  drawing,
  description,
}: {
  drawing: Extract<LessonDrawing, { type: "probability-tree" }>;
  description: string;
}) {
  return (
    <NativeLessonDiagram>
      <NativePlotSvg role="img" aria-label={description}>
        {drawing.start && (
          <NativeDiagramMathLabel x={22} y={111} width={42}>
            {drawing.start}
          </NativeDiagramMathLabel>
        )}
        {[55, 195].map((y, i) => (
          <g key={i}>
            <line
              x1="42"
              y1="125"
              x2="151"
              y2={y}
              stroke="#71717a"
              strokeWidth="1.5"
            />
            <NativeDiagramMathLabel x={95} y={i ? 187 : 46} width={75}>
              {drawing.probabilities[i].replace(/\\frac/g, "\\dfrac")}
            </NativeDiagramMathLabel>
            <NativeDiagramMathLabel x={170} y={y - 10} width={35}>
              {drawing.first[i]}
            </NativeDiagramMathLabel>
            {[y - 30, y + 30].map((leaf, j) => (
              <g key={j}>
                <line
                  x1="193"
                  y1={y}
                  x2="324"
                  y2={leaf}
                  stroke="#71717a"
                  strokeWidth="1.5"
                />
                <NativeDiagramMathLabel x={353} y={leaf - 10} width={55}>
                  {drawing.second[i][j]}
                </NativeDiagramMathLabel>
                <NativeDiagramMathLabel
                  x={253}
                  y={i ? (j ? 221 : 134) : j ? 95 : 0}
                  width={112}
                >
                  {drawing.conditional[i][j].replace(/\\frac/g, "\\dfrac")}
                </NativeDiagramMathLabel>
              </g>
            ))}
          </g>
        ))}
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}
