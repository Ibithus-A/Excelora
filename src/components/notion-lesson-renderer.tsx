"use client";

import katex from "katex";
import type { ReactNode } from "react";

export type NotionLessonDefinition = {
  id: string;
  previewTitle: string;
  sourceTitle: string;
  subjectTitle: string;
  chapterTitle: string;
  title: string;
};

export function NotionLessonRenderer({
  definition,
  introduction,
  children,
}: {
  definition: NotionLessonDefinition;
  introduction: ReactNode;
  children: ReactNode;
}) {
  return (
    <article
      className="notion-lesson mx-auto max-w-[680px] px-1 py-5 sm:px-5 sm:py-8"
      data-lesson-id={definition.id}
      data-source-title={definition.sourceTitle}
    >
      <header className="mb-12 border-b border-zinc-200 pb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {definition.subjectTitle} · {definition.chapterTitle}
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-zinc-950 sm:text-4xl">
          {definition.title}
        </h1>
        <div className="mt-5 text-[16px] leading-8 text-zinc-600">{introduction}</div>
      </header>
      {children}
    </article>
  );
}

export function MathText({ children }: { children: string }) {
  return (
    <span
      className="lesson-math-inline px-0.5"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, {
          throwOnError: false,
          strict: false,
        }),
      }}
    />
  );
}

export function DisplayMath({ children }: { children: string }) {
  return (
    <div
      className="lesson-math-display my-4 max-w-full py-2 text-center text-[clamp(0.72rem,2.5vw,1.04rem)]"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        }),
      }}
    />
  );
}

export function LessonSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="mb-5 text-2xl font-semibold tracking-[-0.025em] text-zinc-950">
        {title}
      </h2>
      <div className="space-y-4 text-[15px] leading-7 text-zinc-700 sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}

export function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
      <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-xs font-semibold text-zinc-600">
        {number}
      </span>
      <div>
        {title && <p className="font-medium tracking-[-0.01em] text-zinc-800">{title}</p>}
        {children ? <div className="mt-1">{children}</div> : null}
      </div>
    </div>
  );
}

export function Question({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <li className="grid grid-cols-[24px_minmax(0,1fr)] gap-2">
      <span className="font-medium text-zinc-400">{number}.</span>
      <div>{children}</div>
    </li>
  );
}
