"use client";
import { useId } from "react";
import {
  NativeLessonDiagram,
  NativePlotSvg,
  NativeDiagramMathLabel,
} from "./native-lesson-diagram";
import { MathText } from "./notion-lesson-renderer";
import type { LessonDrawing } from "@/lib/lessons/schema";
type MotionDrawing = Extract<
  LessonDrawing,
  { type: "motion-graph" | "suvat" | "vertical-motion" }
>;
export function MotionLessonDiagram({
  drawing,
  description,
}: {
  drawing: MotionDrawing;
  description: string;
}) {
  const id = useId().replace(/:/g, "");
  const arrow = (
    <defs>
      <marker
        id={id}
        markerWidth="6"
        markerHeight="6"
        refX="5"
        refY="3"
        orient="auto-start-reverse"
      >
        <path d="M0 0 L6 3 L0 6 Z" fill="#71717a" />
      </marker>
    </defs>
  );
  if (drawing.type === "motion-graph") {
    const sx = (x: number) => 60 + (280 * x) / drawing.xMax,
      sy = (y: number) => 200 - (145 * y) / drawing.yMax;
    const path = drawing.points
      .map(([x, y], i) => `${i ? "L" : "M"}${sx(x)},${sy(y)}`)
      .join(" ");
    return (
      <NativeLessonDiagram
        caption={
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {drawing.caption.map((c, i) => (
              <MathText key={i}>{c}</MathText>
            ))}
          </div>
        }
      >
        <NativePlotSvg role="img" aria-label={description}>
          {drawing.shade && (
            <path
              d={`${path} L${sx(drawing.points.at(-1)![0])},200 L${sx(drawing.points[0][0])},200 Z`}
              fill="#f4f4f5"
            />
          )}
          <line
            x1="60"
            y1="200"
            x2="346"
            y2="200"
            stroke="#a1a1aa"
            strokeWidth="1.25"
          />
          <line
            x1="60"
            y1="200"
            x2="60"
            y2="36"
            stroke="#a1a1aa"
            strokeWidth="1.25"
          />
          <NativeDiagramMathLabel x={365} y={216} width={66}>
            {drawing.xLabel}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={68} y={0} width={132}>
            {drawing.yLabel}
          </NativeDiagramMathLabel>
          {drawing.points
            .filter(([x, y]) => x > 0 && y > 0)
            .map(([x, y], i) => (
              <line
                key={i}
                x1={sx(x)}
                y1="200"
                x2={sx(x)}
                y2={sy(y)}
                stroke="#a1a1aa"
                strokeDasharray="4 4"
              />
            ))}
          {drawing.xTicks.map((t) => (
            <g key={t.value}>
              <line
                x1={sx(t.value)}
                y1="197"
                x2={sx(t.value)}
                y2="203"
                stroke="#a1a1aa"
              />
              <NativeDiagramMathLabel x={sx(t.value)} y={216} width={35}>
                {t.label}
              </NativeDiagramMathLabel>
            </g>
          ))}
          {drawing.yTicks.map((t) => (
            <g key={t.value}>
              <line
                x1="57"
                y1={sy(t.value)}
                x2="63"
                y2={sy(t.value)}
                stroke="#a1a1aa"
              />
              <NativeDiagramMathLabel x={30} y={sy(t.value) - 9} width={48}>
                {t.label}
              </NativeDiagramMathLabel>
            </g>
          ))}
          <path
            d={path}
            fill="none"
            stroke="#18181b"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </NativePlotSvg>
      </NativeLessonDiagram>
    );
  }
  if (drawing.type === "suvat")
    return (
      <NativeLessonDiagram
        caption={drawing.time ? <MathText>{drawing.time}</MathText> : undefined}
      >
        <NativePlotSvg role="img" aria-label={description}>
          {arrow}
          <circle cx="78" cy="117" r="5" fill="#18181b" />
          <circle cx="296" cy="117" r="5" fill="#18181b" />
          {drawing.initialArrow !== false && (
            <line
              x1="83"
              y1="99"
              x2="130"
              y2="99"
              stroke="#71717a"
              strokeWidth="1.5"
              markerEnd={`url(#${id})`}
            />
          )}
          {drawing.finalArrow !== false && (
            <line
              x1="301"
              y1="99"
              x2="348"
              y2="99"
              stroke="#71717a"
              strokeWidth="1.5"
              markerEnd={`url(#${id})`}
            />
          )}
          <NativeDiagramMathLabel x={105} y={65} width={100}>
            {drawing.initial}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={322} y={65} width={100}>
            {drawing.final}
          </NativeDiagramMathLabel>
          {drawing.labels && (
            <>
              <NativeDiagramMathLabel x={78} y={133} width={65}>
                {"\\text{Start}"}
              </NativeDiagramMathLabel>
              <NativeDiagramMathLabel x={296} y={133} width={65}>
                {"\\text{End}"}
              </NativeDiagramMathLabel>
            </>
          )}
          <line
            x1="78"
            y1="177"
            x2="296"
            y2="177"
            stroke="#a1a1aa"
            strokeWidth="1.25"
            markerStart={`url(#${id})`}
            markerEnd={`url(#${id})`}
          />
          <NativeDiagramMathLabel x={188} y={192} width={150}>
            {drawing.displacement}
          </NativeDiagramMathLabel>
          {drawing.acceleration && (
            <>
              <line
                x1={drawing.accelerationDirection === "left" ? 222 : 170}
                y1="51"
                x2={drawing.accelerationDirection === "left" ? 170 : 222}
                y2="51"
                stroke="#71717a"
                strokeWidth="1.5"
                markerEnd={`url(#${id})`}
              />
              <NativeDiagramMathLabel x={196} y={17} width={100}>
                {drawing.acceleration}
              </NativeDiagramMathLabel>
            </>
          )}
        </NativePlotSvg>
      </NativeLessonDiagram>
    );
  const launchY =
    drawing.mode === "up" ? (drawing.launchHeight ? 167 : 208) : 57;
  const endY = drawing.mode === "up" ? 52 : 208;
  return (
    <NativeLessonDiagram>
      <NativePlotSvg role="img" aria-label={description}>
        {arrow}
        <line
          x1="75"
          y1="214"
          x2="318"
          y2="214"
          stroke="#71717a"
          strokeWidth="3"
        />
        <circle cx="150" cy={launchY} r="4" fill="#18181b" />
        <circle cx="150" cy={endY} r="4" fill="#18181b" />
        {drawing.initialArrow !== false && (
          <line
            x1="150"
            y1={drawing.mode === "up" ? launchY - 8 : launchY + 8}
            x2="150"
            y2={drawing.mode === "up" ? launchY - 55 : launchY + 49}
            stroke="#71717a"
            strokeWidth="1.5"
            markerEnd={`url(#${id})`}
          />
        )}
        <NativeDiagramMathLabel
          x={101}
          y={drawing.mode === "up" ? launchY - 45 : launchY + 18}
          width={90}
        >
          {drawing.initial}
        </NativeDiagramMathLabel>
        {drawing.final && (
          <NativeDiagramMathLabel
            x={150}
            y={drawing.mode === "up" ? 15 : 225}
            width={160}
          >
            {drawing.final}
          </NativeDiagramMathLabel>
        )}
        <line
          x1="225"
          y1={endY}
          x2="225"
          y2={drawing.mode === "up" ? 214 : launchY}
          stroke="#a1a1aa"
          strokeWidth="1.25"
          markerStart={`url(#${id})`}
          markerEnd={`url(#${id})`}
        />
        <NativeDiagramMathLabel x={258} y={123} width={52}>
          {drawing.height}
        </NativeDiagramMathLabel>
        {drawing.launchHeight && (
          <>
            <line x1="81" y1={launchY} x2="81" y2="210" stroke="#a1a1aa" />
            <NativeDiagramMathLabel x={45} y={launchY + 12} width={55}>
              {drawing.launchHeight}
            </NativeDiagramMathLabel>
          </>
        )}
        {drawing.gravity && (
          <>
            <line
              x1="318"
              y1="74"
              x2="318"
              y2="122"
              stroke="#71717a"
              strokeWidth="1.5"
              markerEnd={`url(#${id})`}
            />
            <NativeDiagramMathLabel x={345} y={82} width={36}>
              {drawing.gravity}
            </NativeDiagramMathLabel>
          </>
        )}
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}
