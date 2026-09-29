"use client";

import katex from "katex";

export function DemoMath({
  latex,
  className = "",
}: {
  latex: string;
  className?: string;
}) {
  return (
    <span
      className={["inline-flex items-center align-middle", className].join(" ")}
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(latex, {
          throwOnError: false,
          strict: false,
        }),
      }}
    />
  );
}
