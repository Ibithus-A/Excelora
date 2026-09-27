"use client";

import { useId } from "react";
import type { LessonDrawing } from "@/lib/lessons/schema";
import {
  NativeDiagramLegend,
  NativeDiagramLegendItem,
  NativeDiagramMathLabel,
  NativeLessonDiagram,
  NativePlotSvg,
} from "./native-lesson-diagram";
import { MathText } from "./notion-lesson-renderer";

type Plot = Extract<LessonDrawing, { type: "teaching-plot" }>;
type Circle = Extract<LessonDrawing, { type: "unit-circle" }>;

const LEFT = 48;
const RIGHT = 354;
const TOP = 22;
const BOTTOM = 206;

function value(curve: Plot["curves"][number], x: number) {
  const a = curve.amplitude ?? 1;
  const b = curve.frequency ?? 1;
  const p = curve.phase ?? 0;
  const d = curve.verticalShift ?? 0;
  if (curve.kind === "sin") return a * Math.sin(b * x + p) + d;
  if (curve.kind === "cos") return a * Math.cos(b * x + p) + d;
  if (curve.kind === "tan") return a * Math.tan(b * x + p) + d;
  if (curve.kind === "sec") return a / Math.cos(b * x + p) + d;
  if (curve.kind === "reciprocal") return a / (b * x + p) + d;
  if (curve.kind === "exp") return a * Math.exp(b * x + p) + d;
  return (curve.coefficients ?? [0]).reduce(
    (sum, coefficient, power) => sum + coefficient * x ** power,
    0,
  );
}

function sampledPaths(
  curve: Plot["curves"][number],
  xRange: [number, number],
  yRange: [number, number],
  sx: (x: number) => number,
  sy: (y: number) => number,
) {
  const paths: string[] = [];
  let current: string[] = [];
  const finish = () => {
    if (current.length > 1) paths.push(current.join(" "));
    current = [];
  };
  for (let i = 0; i <= 320; i++) {
    const x = xRange[0] + ((xRange[1] - xRange[0]) * i) / 320;
    const y = value(curve, x);
    const clipped = !Number.isFinite(y) || y < yRange[0] || y > yRange[1];
    if (clipped) {
      finish();
      continue;
    }
    const command = current.length ? "L" : "M";
    current.push(`${command}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`);
  }
  finish();
  return paths;
}

export function TeachingPlotDiagram({
  drawing,
  description,
}: {
  drawing: Plot;
  description: string;
}) {
  const sx = (x: number) =>
    LEFT + ((RIGHT - LEFT) * (x - drawing.xRange[0])) / (drawing.xRange[1] - drawing.xRange[0]);
  const sy = (y: number) =>
    BOTTOM - ((BOTTOM - TOP) * (y - drawing.yRange[0])) / (drawing.yRange[1] - drawing.yRange[0]);
  const xAxis = Math.max(TOP, Math.min(BOTTOM, sy(0)));
  const yAxis = Math.max(LEFT, Math.min(RIGHT, sx(0)));
  const hasLegend = drawing.curves.some((curve) => curve.label) ||
    Boolean(drawing.points?.length) || Boolean(drawing.tangents?.length);
  return (
    <NativeLessonDiagram
      caption={drawing.caption?.length ? drawing.caption.map((item, index) => (
        <span key={item}>{index ? " · " : ""}<MathText>{item}</MathText></span>
      )) : undefined}
    >
      <NativePlotSvg role="img" aria-label={description}>
        <line x1={LEFT} y1={xAxis} x2={RIGHT} y2={xAxis} stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1={yAxis} y1={BOTTOM} x2={yAxis} y2="36" stroke="#a1a1aa" strokeWidth="1.25" />
        <NativeDiagramMathLabel x={388} y={xAxis - 10} width={24}>{drawing.xLabel}</NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={yAxis} y={0} width={24}>{drawing.yLabel}</NativeDiagramMathLabel>
        {drawing.xTicks?.map((tick) => <g key={`x-${tick.value}`}>
          <line x1={sx(tick.value)} y1={xAxis - 3} x2={sx(tick.value)} y2={xAxis + 3} stroke="#71717a" />
          <NativeDiagramMathLabel x={sx(tick.value)} y={xAxis + 7} width={44}>{tick.label}</NativeDiagramMathLabel>
        </g>)}
        {drawing.yTicks?.map((tick) => <g key={`y-${tick.value}`}>
          <line x1={yAxis - 3} y1={sy(tick.value)} x2={yAxis + 3} y2={sy(tick.value)} stroke="#71717a" />
          <NativeDiagramMathLabel x={yAxis - 7} y={sy(tick.value) - 8} width={38} align="end">{tick.label}</NativeDiagramMathLabel>
        </g>)}
        {drawing.shade?.map((area, index) => {
          const top: string[] = [];
          const bottom: string[] = [];
          for (let i = 0; i <= 80; i++) {
            const x = area.from + ((area.to - area.from) * i) / 80;
            top.push(`${sx(x)},${sy(value(drawing.curves[area.curve], x))}`);
            bottom.unshift(`${sx(x)},${sy(area.against === undefined ? 0 : value(drawing.curves[area.against], x))}`);
          }
          return <polygon key={index} points={[...top, ...bottom].join(" ")} fill="#e4e4e7" opacity="0.72" />;
        })}
        {drawing.asymptotes?.map((x) => <line key={x} x1={sx(x)} y1={TOP} x2={sx(x)} y2={BOTTOM} stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4 4" />)}
        {drawing.curves.map((curve, curveIndex) => sampledPaths(curve, drawing.xRange, drawing.yRange, sx, sy).map((path, pathIndex) => (
          <path key={`${curveIndex}-${pathIndex}`} d={path} fill="none" stroke={curveIndex ? "#71717a" : "#18181b"} strokeWidth={curveIndex ? 1.75 : 2.25} strokeDasharray={curve.dashed ? "5 4" : undefined} />
        )))}
        {drawing.tangents?.map((tangent, tangentIndex) => {
          const span = (drawing.xRange[1] - drawing.xRange[0]) * 0.18;
          const x1 = tangent.x - span;
          const x2 = tangent.x + span;
          return <g key={`${tangent.label}-${tangentIndex}`}>
            <line x1={sx(x1)} y1={sy(tangent.y + tangent.slope * (x1 - tangent.x))} x2={sx(x2)} y2={sy(tangent.y + tangent.slope * (x2 - tangent.x))} stroke="#52525b" strokeWidth="1.5" strokeDasharray="5 4" />
          </g>;
        })}
        {drawing.points?.map((point, index) => <g key={`${point.x}-${point.y}-${point.label}`}>
          <circle cx={sx(point.x)} cy={sy(point.y)} r="3.5" fill="#18181b" />
          <text x={sx(point.x) + 7} y={sy(point.y) - 7} fill="#52525b" fontSize="11" fontWeight="600">{index + 1}</text>
        </g>)}
      </NativePlotSvg>
      {hasLegend ? (
        <NativeDiagramLegend>
          {drawing.curves.map((curve, index) => curve.label ? <NativeDiagramLegendItem key={curve.label} secondary={index > 0} dashed={curve.dashed}><MathText>{curve.label}</MathText></NativeDiagramLegendItem> : null)}
          {drawing.tangents?.filter((tangent, index, tangents) => tangents.findIndex((item) => item.label === tangent.label) === index).map((tangent) => <NativeDiagramLegendItem key={tangent.label} dashed secondary><MathText>{tangent.label}</MathText></NativeDiagramLegendItem>)}
          {drawing.points?.map((point, index) => (
            <span key={`${point.label}-${index}`} className="inline-flex items-center gap-2.5">
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-semibold text-white">{index + 1}</span>
              <MathText>{point.label}</MathText>
            </span>
          ))}
        </NativeDiagramLegend>
      ) : null}
    </NativeLessonDiagram>
  );
}

export function UnitCircleDiagram({ drawing, description }: { drawing: Circle; description: string }) {
  const marker = useId().replace(/:/g, "");
  const cx = 145;
  const cy = 132;
  const radius = 72;
  const radians = (drawing.angle * Math.PI) / 180;
  const round = (number: number) => Number(number.toFixed(3));
  const px = round(cx + radius * Math.cos(radians));
  const py = round(cy - radius * Math.sin(radians));
  const relatedX = round(cx - radius * Math.cos(radians));
  const arcX = round(cx + 27 * Math.cos(radians));
  const arcY = round(cy - 27 * Math.sin(radians));
  const showTriangle = drawing.mode !== "angle" && drawing.mode !== "sector";
  const isSolution = drawing.mode === "solutions";
  return (
    <NativeLessonDiagram caption={drawing.caption?.map((item, index) => <span key={item}>{index ? " · " : ""}<MathText>{item}</MathText></span>)}>
      <NativePlotSvg role="img" aria-label={description}>
        <defs><marker id={marker} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#27272a" /></marker></defs>
        {drawing.mode === "sector" ? <path d={`M${cx},${cy} L${cx + radius},${cy} A${radius},${radius} 0 0 0 ${px},${py} Z`} fill="#e4e4e7" stroke="none" /> : null}
        <line x1="40" y1={cy} x2="244" y2={cy} stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1={cx} y1="32" x2={cx} y2="230" stroke="#a1a1aa" strokeWidth="1.25" />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#18181b" strokeWidth="2" />
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#18181b" strokeWidth="2" markerEnd={`url(#${marker})`} />
        {showTriangle ? <>
          <line x1={px} y1={py} x2={px} y2={cy} stroke="#71717a" strokeWidth="1.25" strokeDasharray="4 4" />
          <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#71717a" strokeWidth="1.25" />
        </> : null}
        <path d={`M${cx + 27},${cy} A27,27 0 0 0 ${arcX},${arcY}`} fill="none" stroke="#71717a" strokeWidth="1.25" />
        <NativeDiagramMathLabel x={190} y={101} width={52} align="start">{drawing.angleLabel}</NativeDiagramMathLabel>
        <circle cx={px} cy={py} r="3.5" fill="#18181b" />
        {isSolution ? <>
          <line x1={relatedX} y1={py} x2={relatedX} y2={cy} stroke="#71717a" strokeWidth="1.25" strokeDasharray="4 4" />
          <circle cx={relatedX} cy={py} r="3.5" fill="#18181b" />
        </> : null}
        <line x1={px + 4} y1={py - 3} x2="270" y2="48" stroke="#a1a1aa" strokeWidth="1" />
        <NativeDiagramMathLabel x={280} y={35} width={108} align="start">{drawing.pointLabel ?? "(\\cos\\theta,\\sin\\theta)"}</NativeDiagramMathLabel>
        <line x1="260" y1="72" x2="260" y2="211" stroke="#e4e4e7" strokeWidth="1" />
        {showTriangle ? <>
          <NativeDiagramMathLabel x={278} y={91} width={110} align="start">{"x_P=\\cos\\theta"}</NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={278} y={126} width={110} align="start">{"y_P=\\sin\\theta"}</NativeDiagramMathLabel>
          <NativeDiagramMathLabel x={278} y={161} width={110} align="start">{"OP=1"}</NativeDiagramMathLabel>
        </> : <NativeDiagramMathLabel x={278} y={105} width={100} align="start">{"OP=r"}</NativeDiagramMathLabel>}
        {isSolution ? <NativeDiagramMathLabel x={278} y={190} width={110} align="start">{"\\theta=\\alpha,\\;\\pi-\\alpha"}</NativeDiagramMathLabel> : null}
        <NativeDiagramMathLabel x={250} y={96} width={18}>{"x"}</NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={cx} y={0} width={22}>{"y"}</NativeDiagramMathLabel>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}
