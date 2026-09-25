import katex from "katex";
import type { ReactNode, SVGProps } from "react";

// Required design reference for every use:
// docs/notion-preview-diagram-style.md
export function NativeLessonDiagram({
  children,
  caption,
  className = "",
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={`native-lesson-diagram my-8 min-w-0 max-w-full overflow-x-clip ${className}`.trim()}>
      <div className="mx-auto min-w-0 max-w-[500px] overflow-x-clip rounded-2xl border border-zinc-200 bg-white px-3 py-4 sm:px-6 sm:py-6">
        {children}
      </div>
      {caption ? (
        <figcaption className="mx-auto mt-3 min-w-0 max-w-[500px] break-words px-1 text-center text-sm leading-6 text-zinc-600">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function NativePlotSvg({
  children,
  className = "",
  ...props
}: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 250"
      shapeRendering="geometricPrecision"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className={`mx-auto h-auto w-full max-w-[440px] overflow-visible ${className}`.trim()}
      {...props}
    >
      {children}
    </svg>
  );
}

export function NativeDiagramLegend({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-zinc-100 pt-4 text-sm text-zinc-700">
      {children}
    </div>
  );
}

export function NativeDiagramLegendItem({
  children,
  dashed = false,
  secondary = false,
}: {
  children: ReactNode;
  dashed?: boolean;
  secondary?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`block w-7 border-t-2 ${dashed ? "border-dashed" : ""} ${secondary || dashed ? "border-zinc-500" : "border-zinc-900"}`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

export function NativeDiagramMathLabel({
  children,
  x,
  y,
  width = 48,
  align = "center",
}: {
  children: string;
  x: number;
  y: number;
  width?: number;
  align?: "start" | "center" | "end";
}) {
  const left = align === "center" ? x - width / 2 : align === "end" ? x - width : x;

  return (
    <foreignObject x={left} y={y} width={width} height="30" aria-hidden="true">
      <div
        className={[
          "flex h-full items-start text-xs leading-none text-zinc-600",
          align === "center" ? "justify-center" : align === "end" ? "justify-end" : "justify-start",
        ].join(" ")}
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(children, {
            throwOnError: false,
            strict: false,
          }),
        }}
      />
    </foreignObject>
  );
}
