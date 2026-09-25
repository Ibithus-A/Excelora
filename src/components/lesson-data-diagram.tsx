"use client";
import { SceneLessonDiagram } from "./scene-lesson-diagram";
import { FunctionCurvesDiagram } from "./function-curves-diagram";
import { ScatterLessonDiagram } from "./scatter-lesson-diagram";
import { BoxPlotLessonDiagram } from "./box-plot-lesson-diagram";
import { VennLessonDiagram } from "./venn-lesson-diagram";
import { ProbabilityTreeDiagram } from "./probability-tree-diagram";
import { MotionLessonDiagram } from "./motion-lesson-diagram";
import { polynomialBezier } from "@/lib/lessons/geometry";
import { useId } from "react";
import {
  NativeLessonDiagram,
  NativePlotSvg,
  NativeDiagramMathLabel,
  NativeDiagramLegend,
  NativeDiagramLegendItem,
} from "./native-lesson-diagram";
import { MathText } from "./notion-lesson-renderer";
import type { LessonDrawing } from "@/lib/lessons/schema";
export function LessonDataDiagram({
  drawing,
  description,
}: {
  drawing: LessonDrawing;
  description: string;
}) {
  const id = useId().replace(/:/g, "");
  if (drawing.type === "scene")
    return <SceneLessonDiagram drawing={drawing} description={description} />;
  if (drawing.type === "function-curves")
    return <FunctionCurvesDiagram drawing={drawing} description={description} />;
  if (drawing.type === "scatter")
    return <ScatterLessonDiagram drawing={drawing} description={description} />;
  if (drawing.type === "box-plot")
    return <BoxPlotLessonDiagram drawing={drawing} description={description} />;
  if (drawing.type === "venn-two")
    return <VennLessonDiagram drawing={drawing} description={description} />;
  if (drawing.type === "probability-tree")
    return (
      <ProbabilityTreeDiagram drawing={drawing} description={description} />
    );
  if (
    drawing.type === "motion-graph" ||
    drawing.type === "suvat" ||
    drawing.type === "vertical-motion"
  )
    return <MotionLessonDiagram drawing={drawing} description={description} />;
  if (drawing.type === "polynomial" || drawing.type === "parametric") {
    const sx = (x: number) =>
      55 +
      (280 * (x - drawing.xRange[0])) / (drawing.xRange[1] - drawing.xRange[0]);
    const sy = (y: number) =>
      205 -
      (160 * (y - drawing.yRange[0])) / (drawing.yRange[1] - drawing.yRange[0]);
    const controls =
      drawing.type === "polynomial"
        ? polynomialBezier(drawing.coefficients, drawing.domain).map(
            ([x, y]) => `${sx(x)},${sy(y)}`,
          )
        : polynomialBezier(drawing.xCoefficients, drawing.domain).map(
            (point, i) =>
              `${sx(point[1])},${sy(polynomialBezier(drawing.yCoefficients, drawing.domain)[i][1])}`,
          );
    const points = `M${controls[0]} C${controls.slice(1).join(" ")}`;
    return (
      <NativeLessonDiagram>
        <NativePlotSvg role="img" aria-label={description}>
          <line
            x1="48"
            y1={sy(0)}
            x2="351"
            y2={sy(0)}
            stroke="#a1a1aa"
            strokeWidth="1.25"
          />
          <line
            x1={sx(0)}
            y1="217"
            x2={sx(0)}
            y2="34"
            stroke="#a1a1aa"
            strokeWidth="1.25"
          />
          <NativeDiagramMathLabel x={378} y={sy(0) - 10} width={28}>
            {drawing.xLabel}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={sx(0)} y={0} width={28}>
            {drawing.yLabel}
          </NativeDiagramMathLabel>
          {drawing.labels
            .filter((label) => label.guide)
            .map((label, i) => (
              <line
                key={i}
                x1={sx(label.x)}
                y1={sy(0)}
                x2={sx(label.x)}
                y2={sy(label.y)}
                stroke="#a1a1aa"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          <path d={points} fill="none" stroke="#18181b" strokeWidth="2" />
          {drawing.type === "parametric" &&
            drawing.labels.map((label, i) => (
              <circle
                key={`point-${i}`}
                cx={sx(label.x)}
                cy={sy(label.y)}
                r="3"
                fill="#18181b"
              />
            ))}
          {drawing.labels.map((label, i) => (
            <NativeDiagramMathLabel
              key={i}
              x={sx(label.x) + label.dx}
              y={sy(label.y) + label.dy}
              width={58}
            >
              {label.text}
            </NativeDiagramMathLabel>
          ))}
        </NativePlotSvg>
      </NativeLessonDiagram>
    );
  }
  if (drawing.type === "kinematics-setup")
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
              <path d="M0 0 L6 3 L0 6 Z" fill="#27272a" />
            </marker>
          </defs>
          <line x1="55" y1="210" x2="350" y2="210" stroke="#a1a1aa" />
          <line x1="55" y1="210" x2="55" y2="36" stroke="#a1a1aa" />
          <NativeDiagramMathLabel x={375} y={200} width={22}>
            {"\\mathbf i"}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={55} y={0} width={22}>
            {"\\mathbf j"}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={32} y={218} width={22}>
            {"O"}
          </NativeDiagramMathLabel>
          <path
            d="M55 210 C140 209 190 174 230 130"
            stroke="#71717a"
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line
            x1="55"
            y1="210"
            x2="230"
            y2="130"
            stroke="#18181b"
            strokeWidth="1.5"
            markerEnd={`url(#${id})`}
          />
          <circle cx="230" cy="130" r="4" fill="#18181b" />
          <line
            x1="230"
            y1="130"
            x2="285"
            y2="70"
            stroke="#18181b"
            strokeWidth="1.5"
            markerEnd={`url(#${id})`}
          />
          <line
            x1="230"
            y1="130"
            x2="285"
            y2="180"
            stroke="#18181b"
            strokeWidth="1.5"
            markerEnd={`url(#${id})`}
          />
          <NativeDiagramMathLabel x={135} y={141} width={55}>
            {"\\mathbf r(t)"}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={210} y={104} width={22}>
            {"P"}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={310} y={49} width={22}>
            {"\\mathbf v"}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={310} y={176} width={22}>
            {"\\mathbf a"}
          </NativeDiagramMathLabel>
        </NativePlotSvg>
      </NativeLessonDiagram>
    );
  if (drawing.type === "circle-tangent") {
    const c = { x: 200, y: 130 },
      r = 60,
      p = { x: 200 + 60 / Math.sqrt(2), y: 130 - 60 / Math.sqrt(2) };
    return (
      <NativeLessonDiagram
        caption={
          <>
            <MathText>{"(a,b)"}</MathText> · <MathText>{"r"}</MathText> ·{" "}
            <MathText>{"P"}</MathText> · tangent
          </>
        }
      >
        <NativePlotSvg role="img" aria-label={description}>
          <line
            x1="50"
            y1="220"
            x2="352"
            y2="220"
            stroke="#a1a1aa"
            strokeWidth="1.25"
          />
          <line
            x1="70"
            y1="220"
            x2="70"
            y2="36"
            stroke="#a1a1aa"
            strokeWidth="1.25"
          />
          <NativeDiagramMathLabel x={374} y={213} width={25}>
            {"x"}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={70} y={0} width={25}>
            {"y"}
          </NativeDiagramMathLabel>
          <circle
            cx={c.x}
            cy={c.y}
            r={r}
            fill="none"
            stroke="#18181b"
            strokeWidth="2"
          />
          <line
            x1={c.x}
            y1={c.y}
            x2={p.x}
            y2={p.y}
            stroke="#71717a"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
          <line
            x1={p.x - 45}
            y1={p.y - 45}
            x2={p.x + 45}
            y2={p.y + 45}
            stroke="#71717a"
            strokeWidth="2"
          />
          <circle cx={c.x} cy={c.y} r="3" fill="#18181b" />
          <circle cx={p.x} cy={p.y} r="3" fill="#18181b" />
          <NativeDiagramMathLabel x={195} y={143} width={65}>
            {"(a,b)"}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={217} y={85} width={22}>
            {"r"}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={267} y={65} width={22}>
            {"P"}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={321} y={133} width={64}>
            {"\\text{tangent}"}
          </NativeDiagramMathLabel>
        </NativePlotSvg>
      </NativeLessonDiagram>
    );
  }
  if (drawing.type === "model")
    return (
      <NativeLessonDiagram
        caption={
          drawing.model === "particle"
            ? "Particle"
            : drawing.model === "rod"
              ? "Uniform rod"
              : "Lamina"
        }
      >
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
              <path d="M0 0 L6 3 L0 6 Z" fill="#27272a" />
            </marker>
          </defs>
          {drawing.model === "rod" ? (
            <>
              <line
                x1="80"
                y1="85"
                x2="320"
                y2="85"
                stroke="#27272a"
                strokeWidth="5"
              />
              <text x="60" y="84" fontSize="12">
                A
              </text>
              <text x="337" y="84" fontSize="12">
                B
              </text>
            </>
          ) : drawing.model === "lamina" ? (
            <path
              d="M110 42 L290 42 L290 128 L110 128 Z"
              fill="#f4f4f5"
              stroke="#71717a"
              strokeWidth="1.5"
            />
          ) : null}
          <circle cx="200" cy="85" r="4" fill="#18181b" />
          <line
            x1="200"
            y1="90"
            x2="200"
            y2="198"
            stroke="#27272a"
            strokeWidth="2"
            markerEnd={`url(#${id})`}
          />
          {drawing.model !== "particle" && (
            <text x="216" y="77" fontSize="12">
              CoM
            </text>
          )}
          <NativeDiagramMathLabel x={260} y={163} width={65}>
            {drawing.weight}
          </NativeDiagramMathLabel>
        </NativePlotSvg>
      </NativeLessonDiagram>
    );
  if (drawing.type === "resolved-force") {
    const radians = (drawing.angle * Math.PI) / 180,
      scale = 8;
    const x = 55 + scale * drawing.magnitude * Math.cos(radians),
      y = 205 - scale * drawing.magnitude * Math.sin(radians);
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
              <path d="M0 0 L6 3 L0 6 Z" fill="#27272a" />
            </marker>
          </defs>
          <path
            d={`M55 205 L${x} 205 L${x} ${y}`}
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
          <line
            x1="55"
            y1="205"
            x2={x}
            y2={y}
            stroke="#27272a"
            strokeWidth="2"
            markerEnd={`url(#${id})`}
          />
          <path
            d={`M85 205 A30 30 0 0 0 ${55 + 30 * Math.cos(radians)} ${205 - 30 * Math.sin(radians)}`}
            fill="none"
            stroke="#71717a"
            strokeWidth="1.25"
          />
          <NativeDiagramMathLabel
            x={108}
            y={166}
            width={40}
          >{`${drawing.angle}^\\circ`}</NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={(55 + x) / 2} y={217} width={50}>
            {drawing.horizontalLabel}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={x + 38} y={(205 + y) / 2 - 9} width={55}>
            {drawing.verticalLabel}
          </NativeDiagramMathLabel>
          <NativeDiagramMathLabel
            x={x + 66}
            y={y - 15}
            width={85}
          >{`${drawing.magnitude}\\,\\mathrm{N}`}</NativeDiagramMathLabel>
        </NativePlotSvg>
      </NativeLessonDiagram>
    );
  }
  const { xRange, yRange } = drawing;
  const scale = Math.min(
    306 / (xRange[1] - xRange[0]),
    166 / (yRange[1] - yRange[0]),
  );
  const sx = (x: number) =>
    46 + (306 - (xRange[1] - xRange[0]) * scale) / 2 + (x - xRange[0]) * scale;
  const sy = (y: number) =>
    208 - (166 - (yRange[1] - yRange[0]) * scale) / 2 - (y - yRange[0]) * scale;
  const ox = sx(0),
    oy = sy(0);
  return (
    <NativeLessonDiagram
      caption={
        <NativeDiagramLegend>
          {drawing.vectors.map((v, i) => (
            <NativeDiagramLegendItem
              key={i}
              dashed={v.dashed}
              secondary={i > 0}
            >
              <MathText>{v.label}</MathText>
            </NativeDiagramLegendItem>
          ))}
        </NativeDiagramLegend>
      }
    >
      <NativePlotSvg role="img" aria-label={description}>
        <defs>
          {drawing.vectors.map((_, i) => (
            <marker
              key={i}
              id={`${id}-${i}`}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0 0 L6 3 L0 6 Z" fill={i ? "#71717a" : "#18181b"} />
            </marker>
          ))}
        </defs>
        <line
          x1="40"
          y1={oy}
          x2="352"
          y2={oy}
          stroke="#a1a1aa"
          strokeWidth="1.25"
        />
        <line
          x1={ox}
          y1="214"
          x2={ox}
          y2="36"
          stroke="#a1a1aa"
          strokeWidth="1.25"
        />
        <NativeDiagramMathLabel x={377} y={oy - 9} width={36}>
          {drawing.xLabel}
        </NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={ox} y={0} width={65}>
          {drawing.yLabel}
        </NativeDiagramMathLabel>
        {drawing.vectors.map((v, i) => (
          <line
            key={i}
            x1={v.from ? sx(v.from[0]) : ox}
            y1={v.from ? sy(v.from[1]) : oy}
            x2={sx(v.x)}
            y2={sy(v.y)}
            stroke={i ? "#71717a" : "#18181b"}
            strokeWidth="2"
            strokeDasharray={v.dashed ? "5 4" : undefined}
            markerEnd={`url(#${id}-${i})`}
          />
        ))}
        {drawing.vectors
          .filter((v) => v.endpointLabel)
          .map((v, i) => (
            <NativeDiagramMathLabel
              key={`label-${i}`}
              x={sx(v.x) + (v.labelDx ?? 0)}
              y={sy(v.y) + (v.labelDy ?? 14)}
              width={130}
            >
              {v.endpointLabel!}
            </NativeDiagramMathLabel>
          ))}
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}
