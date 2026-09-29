"use client";

import { AssistantIcon } from "@/components/icons";
import { DemoMath } from "@/components/demo-math";
import { useCallback, useEffect, useRef, useState } from "react";

const DEMO_STAGES = [
  { id: "lesson", label: "Lesson" },
  { id: "arthur", label: "Arthur" },
  { id: "practice", label: "Practice" },
  { id: "review", label: "Review" },
  { id: "progress", label: "Progress" },
] as const;

type DemoStageId = (typeof DEMO_STAGES)[number]["id"];

export function WorkspaceLearningDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isStageVisible, setIsStageVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const activeStage = DEMO_STAGES[activeIndex];

  const moveToStage = useCallback((nextIndex: number) => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }

    setIsStageVisible(false);
    transitionTimerRef.current = window.setTimeout(() => {
      setActiveIndex(nextIndex);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setIsStageVisible(true));
      });
    }, 220);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.28 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    const timer = window.setTimeout(() => {
      moveToStage((activeIndex + 1) % DEMO_STAGES.length);
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, moveToStage]);

  useEffect(() => () => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
  }, []);

  return (
    <div ref={containerRef} className="landing-showcase overflow-hidden rounded-[24px] border border-zinc-200 bg-white text-zinc-950 shadow-[0_36px_90px_rgba(0,0,0,0.28)] sm:rounded-[28px]">
      <div className="flex flex-col gap-4 border-b border-zinc-200 bg-white px-5 py-4 sm:px-7 sm:py-[18px] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-zinc-200" /><span className="h-2.5 w-2.5 rounded-full bg-zinc-200" /><span className="h-2.5 w-2.5 rounded-full bg-zinc-200" /></div>
          <span className="text-[13px] font-semibold uppercase tracking-[0.17em] text-zinc-500">Excelora · Student workspace</span>
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-zinc-100 p-1" role="tablist" aria-label="Workspace workflow">
          {DEMO_STAGES.map((stage, index) => (
            <button key={stage.id} type="button" role="tab" aria-selected={index === activeIndex} onClick={() => index !== activeIndex && moveToStage(index)} className={["shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300", index === activeIndex ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:bg-white hover:text-zinc-900"].join(" ")}>{stage.label}</button>
          ))}
        </div>
      </div>

      <div
        className={[
          "min-h-[640px] overflow-hidden transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:h-[640px]",
          isStageVisible ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
        ].join(" ")}
      >
        <WorkspaceStage stage={activeStage.id} />
      </div>
    </div>
  );
}

function WorkspaceStage({ stage }: { stage: DemoStageId }) {
  if (stage === "practice") return <PracticeWorkspace />;
  if (stage === "review") return <ReviewWorkspace />;
  if (stage === "progress") return <ProgressWorkspace />;
  return <LessonWorkspace arthurActive={stage === "arthur"} />;
}

function LessonWorkspace({ arthurActive }: { arthurActive: boolean }) {
  return (
    <div className="grid min-h-[640px] bg-white lg:grid-cols-[minmax(0,1fr)_360px]">
      <main className="min-w-0 px-5 py-8 sm:px-9 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-4"><h3 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl">1.1 Laws of Indices</h3><span className="mt-1 text-lg text-zinc-400" aria-label="Practice this topic">⌑</span></div>
          <span className="mt-8 inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm">←&nbsp; Back to Chapter 1: Algebra and Functions</span>
          <section className="mt-4 overflow-hidden rounded-[18px] border border-zinc-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.055)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/70 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Interactive lesson</p><p className="mt-1 text-sm text-zinc-600">Work through the page below, or watch the full walkthrough</p></div><span className="rounded-full bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white">▶&nbsp; Video preview</span></div>
            <div className="px-6 py-7 sm:px-10 sm:py-9">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Pure Mathematics · Algebra and Functions</p>
              <h4 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">Laws of Indices</h4>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-600">The laws of indices provide the algebraic rules for working with powers. These rules apply for all rational exponents.</p>
              <div className="mt-7 border-t border-zinc-200 pt-6"><h5 className="text-lg font-semibold tracking-tight text-zinc-950">Laws of Indices</h5><div className="mt-4 grid gap-x-8 gap-y-4 rounded-xl border border-zinc-200 bg-zinc-50/60 px-6 py-5 text-[15px] text-zinc-700 sm:grid-cols-2"><DemoMath latex={String.raw`a^m \times a^n = a^{m+n}`} /><DemoMath latex={String.raw`a^m \div a^n = a^{m-n}`} /><DemoMath latex={String.raw`(a^m)^n = a^{mn}`} /><DemoMath latex={String.raw`a^0 = 1`} /></div></div>
            </div>
          </section>
        </div>
      </main>
      <ArthurPanel active={arthurActive} />
    </div>
  );
}

function ArthurPanel({ active }: { active: boolean }) {
  return (
    <aside className="flex min-h-[640px] flex-col border-t border-zinc-200 bg-[#fcfcfb] lg:border-l lg:border-t-0">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Arthur AI Assistant</p><p className="mt-1 text-[13px] text-zinc-500">1.1 Laws of Indices</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">Live</span></div>
      <div className="flex-1 p-5">
        {active ? <div className="space-y-3"><div className="workspace-demo-message ml-auto max-w-[92%] rounded-[14px] rounded-br-md bg-zinc-950 px-4 py-3.5 text-[13px] leading-5 text-white">Why do powers add when I multiply the same base?</div><div className="workspace-demo-message rounded-[14px] rounded-tl-md border border-zinc-200 bg-white px-4 py-3.5 text-[13px] leading-5 text-zinc-700 shadow-[0_6px_18px_rgba(15,23,42,0.06)]" style={{ animationDelay: "180ms" }}>Because multiplication combines all repeated factors. aᵐ contributes m copies of a and aⁿ contributes n more, giving m + n copies altogether.</div></div> : <div className="flex h-full items-start justify-center pt-4"><div className="w-full rounded-[16px] border border-zinc-200 bg-white px-5 py-9 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-zinc-200"><AssistantIcon className="h-4 w-4" /></span><p className="mt-4 text-sm font-semibold text-zinc-800">Arthur is ready</p><p className="mx-auto mt-2 max-w-[210px] text-[13px] leading-5 text-zinc-500">Ask anything about the lesson currently open.</p></div></div>}
      </div>
      <div className="border-t border-zinc-200 p-3"><div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-400"><span className="flex-1">Ask Arthur anything.</span><span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-100 text-zinc-400">↑</span></div></div>
    </aside>
  );
}

function PracticeWorkspace() {
  return (
    <div className="grid min-h-[640px] bg-white lg:grid-cols-[minmax(0,1fr)_360px]">
      <main className="px-5 py-8 sm:px-9 lg:px-12 lg:py-10"><div className="mx-auto max-w-4xl">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl">1.1 Laws of Indices</h3><span className="mt-8 inline-flex rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 shadow-sm">←&nbsp; Back to lesson</span>
        <div className="mt-6 flex items-center justify-between border-b border-zinc-200 pb-4"><p className="text-[13px] font-semibold text-zinc-900">Question 1</p><div className="flex items-center gap-4 text-xs text-zinc-500"><span>0 checked · Untimed</span><span className="rounded-full border border-zinc-200 px-3 py-1.5 text-zinc-700">Stop practice</span></div></div>
        <div className="py-6"><div className="flex justify-between text-[13px] text-zinc-500"><span>Laws of Indices</span><span>3 marks</span></div><p className="mt-7 text-base font-normal leading-7 text-zinc-800">Given that <DemoMath latex={String.raw`2^{x+2}=(2^2)^{3x+1}`} className="mx-1 text-[17px]" />, find the exact value of <DemoMath latex="x" className="mx-0.5" />.</p><p className="mt-8 text-sm text-zinc-700">Answer:</p><div className="mt-3 h-20 rounded-xl border border-zinc-200 bg-white" /><div className="mt-5 flex gap-2"><span className="rounded-full border border-zinc-200 px-4 py-2 text-[13px] text-zinc-700">Save draft</span><span className="rounded-full bg-zinc-300 px-4 py-2 text-[13px] text-white">Check answer</span></div></div>
        <div className="flex justify-between border-t border-zinc-200 pt-5"><span className="rounded-full border border-zinc-100 px-4 py-2 text-[13px] text-zinc-300">Previous</span><span className="rounded-full bg-zinc-950 px-4 py-2 text-[13px] text-white">Next question</span></div>
      </div></main>
      <MathsInputPanel />
    </div>
  );
}

function MathsInputPanel() {
  return (
    <aside className="border-t border-zinc-200 bg-[#fcfcfb] lg:border-l lg:border-t-0">
      <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Calculator · Maths Input</p><p className="mt-1 text-[13px] text-zinc-500">Question 1</p></div><span className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700">Close</span></div>
      <div className="p-4"><div className="rounded-[14px] border border-zinc-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Expression</p><div className="mt-3 h-11 rounded-lg border border-zinc-200 bg-white" /><div className="mt-2 h-16 rounded-lg border border-zinc-200 bg-zinc-50/70 p-2 text-xs text-zinc-400">Preview</div><div className="mt-4 grid grid-cols-3 gap-1 border-t border-zinc-100 pt-3 text-center text-xs text-zinc-500"><span>Structure</span><span>Variables</span><span>Calculus</span></div><div className="mt-3 grid grid-cols-4 gap-2"><span className="math-keypad-label grid min-h-11 place-items-center rounded-lg border border-zinc-200 bg-white text-[15px]"><DemoMath latex={String.raw`\frac{a}{b}`} /></span><span className="math-keypad-label grid min-h-11 place-items-center rounded-lg border border-zinc-200 bg-white text-[15px]"><DemoMath latex={String.raw`\sqrt{x}`} /></span><span className="math-keypad-label grid min-h-11 place-items-center rounded-lg border border-zinc-200 bg-white text-[15px]"><DemoMath latex={String.raw`x^n`} /></span><span className="math-keypad-label grid min-h-11 place-items-center rounded-lg border border-zinc-200 bg-white text-[15px]"><DemoMath latex={String.raw`x^2`} /></span></div></div></div>
    </aside>
  );
}

function ReviewWorkspace() {
  return (
    <div className="min-h-[640px] bg-[#fafafa] px-4 py-8 sm:px-8"><section className="mx-auto max-w-5xl overflow-hidden rounded-[18px] border border-zinc-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">Marked review</p><h3 className="mt-1 text-base font-semibold text-zinc-900">Surds and Rationalising Denominators</h3><p className="mt-1 text-xs text-zinc-500">Question 1 of 3</p></div><span className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600">Close</span></div>
      <div className="p-5"><div className="flex justify-between"><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">Question 1</p><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">4/4 Marks</span></div><div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-emerald-600 text-emerald-700">✓</span><div><p className="text-sm font-semibold text-emerald-800">Correct answer</p><p className="text-xs text-emerald-700">4/4 marks awarded</p></div></div>
        <div className="mt-5 flex justify-between text-[13px] text-zinc-500"><span>Surds and Rationalising Denominators</span><span>4 marks</span></div><p className="mt-5 text-[15px] text-zinc-700">Rationalise the denominator and simplify <DemoMath latex={String.raw`\frac{5(2+\sqrt6)}{4-\sqrt6}`} className="mx-1 text-base" />.</p><p className="mt-5 text-[13px] text-zinc-600">Answer:</p><div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-[15px]"><DemoMath latex={String.raw`7+3\sqrt6`} /></div>
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Expected answer</p><p className="mt-2 text-[15px]"><DemoMath latex={String.raw`7+3\sqrt6`} /></p><div className="my-3 h-px bg-zinc-200" /><p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Worked solution</p><p className="mt-2 text-[13px] leading-5 text-zinc-600">Multiply the numerator and denominator by the conjugate <DemoMath latex={String.raw`4+\sqrt6`} />, then expand and simplify.</p></div><div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4"><span className="text-xs text-zinc-300">Previous</span><div className="flex gap-2"><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-zinc-900 text-xs">1</span><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-xs text-emerald-700">2</span><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-xs text-emerald-700">3</span></div><span className="rounded-full bg-zinc-950 px-4 py-2 text-xs text-white">Next Question</span></div>
      </div>
    </section></div>
  );
}

function ProgressWorkspace() {
  return (
    <div className="min-h-[640px] bg-[#f7f7f5] px-4 py-8 sm:px-8"><div className="mx-auto max-w-6xl space-y-4">
      <section className="overflow-hidden rounded-[18px] border border-zinc-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]"><div className="border-b border-zinc-200 px-6 py-5"><p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Saved work</p><div className="mt-1.5 flex items-end justify-between"><div><h3 className="text-xl font-semibold text-zinc-900">Practice History</h3><p className="mt-1 text-sm text-zinc-500">Review every saved session, answer and worked solution.</p></div><span className="text-[13px] text-zinc-500">2 sessions</span></div></div><div className="grid gap-3 p-4 sm:grid-cols-2"><HistoryItem title="Surds and Rationalising Denominators" checked="3 checked" correct="3 correct" /><HistoryItem title="Laws of Indices" checked="2 checked" correct="2 correct" /></div></section>
      <section className="rounded-[18px] border border-zinc-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"><p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Course progress</p><h3 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-950">A Level Maths</h3><p className="mt-1 text-sm text-zinc-500">Your current course position and available topics.</p><div className="mt-5 grid gap-3 md:grid-cols-3"><ProgressColumn title="Topics Complete" count="12" tone="emerald" items={["1.1 Laws of Indices", "1.2 Surds and Rationalising Denominators", "1.3 Quadratic Functions"]} /><ProgressColumn title="Topics Ongoing" count="0" tone="amber" items={["No current topic is tagged yet."]} /><ProgressColumn title="Topics To Do" count="0" tone="zinc" items={["No unlocked topics are waiting."]} /></div></section>
    </div></div>
  );
}

function HistoryItem({ title, checked, correct }: { title: string; checked: string; correct: string }) {
  return <div className="rounded-xl border border-zinc-200 p-5"><div className="flex justify-between gap-3"><p className="text-[15px] font-semibold text-zinc-900">{title}</p><span className="text-[13px] font-medium text-zinc-500">Review →</span></div><p className="mt-2 text-[13px] text-zinc-400">28/09/2026, 17:08</p><div className="mt-3 flex gap-2"><span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500">{checked}</span><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">{correct}</span></div></div>;
}

function ProgressColumn({ title, count, tone, items }: { title: string; count: string; tone: "emerald" | "amber" | "zinc"; items: string[] }) {
  const dot = tone === "emerald" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-zinc-400";
  return <div className="rounded-xl border border-zinc-200 p-4"><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-semibold text-zinc-800"><span className={`h-2 w-2 rounded-full ${dot}`} />{title}</p><span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500">{count}</span></div><div className="mt-3 space-y-2">{items.map((item) => <div key={item} className="rounded-lg bg-zinc-50 px-3 py-2.5 text-[13px] leading-5 text-zinc-600">{item}</div>)}</div></div>;
}
