"use client";

import { AssistantIcon } from "@/components/icons";
import { DemoMath } from "@/components/demo-math";
import { useCallback, useEffect, useRef, useState } from "react";

const LOOP_STAGES = [
  {
    id: "lesson",
    label: "Lesson",
    title: "Work through the interactive lesson",
    description: "Read the explanation and follow each worked step in order.",
  },
  {
    id: "arthur",
    label: "Ask Arthur",
    title: "Ask about the step that does not click",
    description: "Arthur opens beside the lesson with the same topic in context.",
  },
  {
    id: "practice",
    label: "Practice",
    title: "Apply the method to a real question",
    description: "Move into focused practice for the exact same subtopic.",
  },
  {
    id: "review",
    label: "Review",
    title: "Review the mark and worked solution",
    description: "See what was correct, find the gap and revisit any answer.",
  },
] as const;

type LoopStageId = (typeof LOOP_STAGES)[number]["id"];

export function LearningLoopDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">("idle");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const swapTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const activeStage = LOOP_STAGES[activeIndex];

  const moveToStage = useCallback((nextIndex: number) => {
    if (swapTimerRef.current !== null) window.clearTimeout(swapTimerRef.current);
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);

    setTransitionPhase("out");
    swapTimerRef.current = window.setTimeout(() => {
      setActiveIndex(nextIndex);
      window.requestAnimationFrame(() => {
        setTransitionPhase("in");
        settleTimerRef.current = window.setTimeout(() => setTransitionPhase("idle"), 220);
      });
    }, 150);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    const timer = window.setTimeout(() => {
      moveToStage((activeIndex + 1) % LOOP_STAGES.length);
    }, 3600);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, moveToStage]);

  useEffect(() => () => {
    if (swapTimerRef.current !== null) window.clearTimeout(swapTimerRef.current);
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-[26px] border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.09)] sm:rounded-[30px]"
    >
      <div className="border-b border-zinc-200 bg-white px-5 py-4 sm:px-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Focus session
          </p>
          <p className="mt-1.5 text-[15px] font-semibold text-zinc-900">Chapter 7 · The chain rule</p>
        </div>
      </div>

      <div className="grid lg:h-[466px] lg:grid-cols-[330px_minmax(0,1fr)]">
        <div className="border-b border-zinc-200 bg-white p-4 sm:p-6 lg:overflow-hidden lg:border-b-0 lg:border-r">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1" role="tablist" aria-label="Optimised learning steps">
            {LOOP_STAGES.map((stage, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;
              return (
                <button
                  key={stage.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => index !== activeIndex && moveToStage(index)}
                  className={[
                    "group flex min-w-0 items-start gap-3 rounded-[14px] border p-3 text-left transition-all duration-300 sm:p-4",
                    isActive
                      ? "border-zinc-900 bg-zinc-950 text-white shadow-[0_12px_25px_rgba(24,24,27,0.14)]"
                      : "border-transparent bg-transparent text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                      isActive
                        ? "border-white/20 bg-white/10 text-white"
                        : isPast
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-zinc-200 bg-white text-zinc-500",
                    ].join(" ")}
                  >
                    {isPast ? "✓" : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold sm:text-[15px]">{stage.label}</span>
                    <span className={[
                      "mt-1.5 hidden text-xs leading-5 sm:block",
                      isActive ? "text-white/70" : "text-zinc-500",
                    ].join(" ")}>{stage.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[430px] bg-zinc-50/30 p-5 sm:p-8 lg:h-full lg:overflow-hidden lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Step {activeIndex + 1} of {LOOP_STAGES.length}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-zinc-950 sm:text-3xl">
                {activeStage.title}
              </h3>
            </div>
            <span className="hidden rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-600 sm:inline-flex">
              {activeStage.label}
            </span>
          </div>
          <div
            className={[
              "mt-7",
              transitionPhase === "idle" ? "opacity-100" : "transition-opacity ease-out",
              transitionPhase === "out" ? "opacity-0 duration-150" : "opacity-100 duration-200",
            ].join(" ")}
          >
            <LoopStage stage={activeStage.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoopStage({ stage }: { stage: LoopStageId }) {
  if (stage === "arthur") return <ArthurWorkflowStage />;
  if (stage === "practice") return <PracticeWorkflowStage />;
  if (stage === "review") return <ReviewWorkflowStage />;
  return <LessonWorkflowStage />;
}

function LessonWorkflowStage() {
  return (
    <div className="grid gap-8 md:grid-cols-[1.08fr_0.92fr] md:items-center">
      <div>
        <p className="text-[13px] font-medium text-zinc-500">Interactive lesson · Worked example</p>
        <h4 className="mt-4 text-xl font-semibold tracking-[-0.025em] text-zinc-950">Differentiate a composite function</h4>
        <p className="mt-3 max-w-md text-[15px] leading-7 text-zinc-600">Differentiate the outer function first, keep the inner expression unchanged, then multiply by the inner derivative.</p>
        <div className="mt-6 border-y border-zinc-200 py-4 text-center text-[17px] text-zinc-900"><DemoMath latex={String.raw`\sin(3x^2+1)\rightarrow6x\cos(3x^2+1)`} /></div>
      </div>
      <div className="border-t border-zinc-200 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
        <p className="text-[13px] font-semibold text-zinc-900">Follow the two layers</p>
        <div className="relative mt-5 space-y-5 pl-4 text-[15px] before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-zinc-300">
          <div className="relative"><span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-zinc-950 ring-1 ring-zinc-300" /><p className="font-medium text-zinc-900">Outer function</p><p className="mt-1 text-zinc-600"><DemoMath latex={String.raw`\sin(u)\rightarrow\cos(u)`} /></p></div>
          <div className="relative"><span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 ring-1 ring-emerald-300" /><p className="font-medium text-zinc-900">Inner function</p><p className="mt-1 text-zinc-600"><DemoMath latex={String.raw`u=3x^2+1\rightarrow6x`} /></p></div>
        </div>
      </div>
    </div>
  );
}

function PracticeWorkflowStage() {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4"><div><p className="text-[15px] font-semibold text-zinc-900">Question 1</p><p className="mt-1 text-[13px] text-zinc-500">0 checked · Untimed</p></div><span className="text-[13px] font-medium text-zinc-500">Stop practice</span></div>
      <div className="py-7">
        <p className="text-[13px] font-medium text-zinc-500">Chain rule · 2 marks</p>
        <p className="mt-3 text-[15px] font-normal leading-7 text-zinc-800">Differentiate <DemoMath latex={String.raw`y=\cos(5x^3)`} className="mx-1 text-[17px]" />.</p>
      </div>
      <div className="border-b-2 border-zinc-300 pb-3 text-base text-zinc-900"><DemoMath latex={String.raw`-15x^2\sin(5x^3)`} /></div>
      <div className="mt-6 flex items-center justify-between"><span className="text-[13px] text-zinc-500">Answer saved automatically</span><div className="flex gap-2"><span className="rounded-full border border-zinc-300 px-4 py-2 text-[13px] text-zinc-700">Save draft</span><span className="rounded-full bg-zinc-950 px-4 py-2 text-[13px] font-medium text-white">Check answer</span></div></div>
    </div>
  );
}

function ArthurWorkflowStage() {
  return (
    <div className="grid min-h-[245px] gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div className="self-center">
        <p className="text-[13px] font-medium text-zinc-600">Current lesson</p>
        <h4 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">The chain rule</h4>
        <p className="mt-3 text-[15px] leading-7 text-zinc-600">Differentiate the outside, then multiply by the derivative of the expression inside.</p>
        <div className="mt-5 border-l-2 border-emerald-400 pl-4 text-[15px] leading-7 text-zinc-700">Why does the inner derivative get multiplied at the end?</div>
      </div>
      <div className="border-t border-zinc-200 pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white"><AssistantIcon className="h-4 w-4" /></span><div><p className="text-base font-semibold text-zinc-950">Arthur</p><p className="text-[13px] text-zinc-600">The chain rule · lesson context</p></div><span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" /></div>
        <div className="mt-5 space-y-3">
          <div className="ml-auto max-w-[88%] rounded-[14px] rounded-br-md bg-zinc-950 px-4 py-3 text-sm font-medium leading-6 text-white">Why do I multiply by the inner derivative?</div>
          <div className="max-w-[96%] rounded-[14px] rounded-tl-md bg-white px-4 py-3 text-sm leading-6 text-zinc-800 shadow-sm ring-1 ring-zinc-200">Because the outer function changes as its input changes. Multiplying by the inner derivative accounts for how quickly that input is changing.</div>
        </div>
      </div>
    </div>
  );
}

function ReviewWorkflowStage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div><p className="text-base font-semibold text-zinc-950">Reviewing your answers</p><p className="mt-1 text-sm text-zinc-600">Select any question to revisit its answer and solution.</p></div>
        <div className="flex items-center gap-2">{[1, 2, 3, 4].map((number) => <span key={number} className={["grid h-9 w-9 place-items-center rounded-lg border text-[13px] font-semibold", number === 3 ? "border-rose-300 bg-rose-50 text-rose-700 ring-2 ring-zinc-900 ring-offset-2" : "border-emerald-200 bg-emerald-50 text-emerald-700"].join(" ")}>{number}</span>)}</div>
      </div>
      <div className="grid gap-7 py-6 md:grid-cols-[0.7fr_1.3fr]">
        <div><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border-2 border-rose-500 bg-white text-rose-600">×</span><div><p className="text-base font-semibold text-zinc-950">Not quite</p><p className="text-sm text-zinc-600">1/2 marks awarded</p></div></div><p className="mt-4 text-sm leading-6 text-zinc-700">The outer derivative is correct, but the derivative of <DemoMath latex={String.raw`5x^3`} /> is missing.</p></div>
        <div className="border-t border-zinc-200 pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0"><p className="text-sm font-semibold text-zinc-950">Worked solution</p><div className="mt-3 space-y-3 text-base leading-7 text-zinc-800"><p><DemoMath latex={String.raw`\frac{d}{dx}\cos(5x^3)=-\sin(5x^3)\times\frac{d}{dx}(5x^3)`} /></p><p><DemoMath latex={String.raw`=-15x^2\sin(5x^3)`} /></p></div></div>
      </div>
    </div>
  );
}
