"use client";

import { CloseIcon } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";

export type TutorialSurface = "dashboard" | "course-map" | "notes" | "practice" | "ai";

type TutorialStep = {
  id: TutorialSurface;
  selector: string;
  eyebrow: string;
  title: string;
  body: string;
  placement?: "right" | "left" | "bottom" | "top" | "dashboard";
};

type SpotlightRect = {
  stepId: TutorialSurface;
  top: number;
  left: number;
  width: number;
  height: number;
};

type TutorialShowcaseProps = {
  isOpen: boolean;
  onClose: () => void;
  onSurfaceChange: (surface: TutorialSurface) => void;
};

const STEPS: TutorialStep[] = [
  {
    id: "dashboard",
    selector: "[data-tour='dashboard-progress']",
    eyebrow: "Dashboard",
    title: "Start from your course overview",
    body: "This is the first page after sign-in. It shows completed topics, the current topic, and what is still waiting.",
    placement: "dashboard",
  },
  {
    id: "course-map",
    selector: "[data-tour='sidebar-tree']",
    eyebrow: "Course map",
    title: "Move around the course",
    body: "The sidebar is where subjects, chapters, interactive lessons, and assessments live. Open a chapter, search, then jump straight into a topic.",
    placement: "right",
  },
  {
    id: "notes",
    selector: "[data-tour='lesson-notes']",
    eyebrow: "Interactive lesson",
    title: "Learn by interacting with the page",
    body: "Each topic combines clear explanations, worked examples and responsive diagrams. The lesson is a real web page, so it adapts to your screen and keeps every tool close by.",
    placement: "left",
  },
  {
    id: "practice",
    selector: "[data-tour='practice-session']",
    eyebrow: "Practice",
    title: "Check the idea straight away",
    body: "Move from the lesson into focused questions for the same subtopic. Answers, feedback and working stay connected to what you have just learned.",
    placement: "left",
  },
  {
    id: "ai",
    selector: "[data-tour='ai-assistant']",
    eyebrow: "Arthur AI",
    title: "Ask without losing the lesson",
    body: "Arthur opens beside the current lesson or practice question and uses that exact context to explain the step, diagnose a mistake or offer another example.",
    placement: "left",
  },
];

function getSpotlightRect(stepId: TutorialSurface, selector: string): SpotlightRect | null {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));

  const rect = elements
    .map((element) => element.getBoundingClientRect())
    .find((candidate) => candidate.width > 0 && candidate.height > 0);
  if (!rect) return null;

  return {
    stepId,
    top: Math.max(12, rect.top - 8),
    left: Math.max(12, rect.left - 8),
    width: rect.width + 16,
    height: rect.height + 16,
  };
}

function getPopupStyle(step: TutorialStep, rect: SpotlightRect) {
  const gap = 16;
  const maxWidth = 360;
  const estimatedHeight = 250;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const clampLeft = (value: number) =>
    Math.min(Math.max(16, value), Math.max(16, viewportWidth - maxWidth - 16));
  const clampTop = (value: number) =>
    Math.min(Math.max(16, value), Math.max(16, viewportHeight - estimatedHeight - 16));

  if (step.placement === "dashboard") {
    const rightAligned = rect.left + rect.width - maxWidth;
    const aboveTarget = rect.top - estimatedHeight - gap;
    const belowHeader = 176;

    return {
      left: clampLeft(rightAligned),
      top: clampTop(aboveTarget >= 16 ? aboveTarget : belowHeader),
      transform: "none",
    };
  }

  if (step.placement === "left") {
    return {
      left: clampLeft(rect.left - maxWidth - gap),
      top: clampTop(rect.top + Math.min(24, rect.height * 0.12)),
      transform: "none",
    };
  }

  if (step.placement === "top") {
    return {
      left: clampLeft(rect.left + Math.min(32, rect.width * 0.08)),
      top: clampTop(rect.top - estimatedHeight - gap),
      transform: "none",
    };
  }

  if (step.placement === "bottom") {
    return {
      left: clampLeft(rect.left + Math.min(32, rect.width * 0.08)),
      top: clampTop(rect.top + rect.height + gap),
      transform: "none",
    };
  }

  return {
    left: clampLeft(rect.left + rect.width + gap),
    top: clampTop(rect.top + Math.min(24, rect.height * 0.12)),
    transform: "none",
  };
}

export function TutorialShowcase({
  isOpen,
  onClose,
  onSurfaceChange,
}: TutorialShowcaseProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const step = STEPS[stepIndex];
  const activeSpotlightRect = spotlightRect?.stepId === step.id ? spotlightRect : null;
  const popupStyle = useMemo(
    () =>
      typeof window === "undefined" || !activeSpotlightRect
        ? null
        : getPopupStyle(step, activeSpotlightRect),
    [activeSpotlightRect, step],
  );

  useEffect(() => {
    if (!isOpen) return;
    onSurfaceChange(step.id);
  }, [isOpen, onSurfaceChange, step.id]);

  useEffect(() => {
    if (!isOpen) return;

    const updateSpotlight = () => {
      setSpotlightRect(getSpotlightRect(step.id, step.selector));
    };

    const frame = window.requestAnimationFrame(updateSpotlight);
    const settledFrame = window.setTimeout(updateSpotlight, 640);
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settledFrame);
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [isOpen, step.id, step.selector, stepIndex]);

  if (!isOpen) return null;

  const isLastStep = stepIndex === STEPS.length - 1;
  const progressPercent = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div
      className="fixed inset-0 z-90"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-showcase-title"
    >
      <div className="absolute inset-0 bg-zinc-950/28" />
      {activeSpotlightRect ? (
        <div
          aria-hidden="true"
          className="tutorial-spotlight pointer-events-none fixed rounded-2xl border border-white/80 bg-white/5 shadow-[0_0_0_9999px_rgba(9,9,11,0.42)]"
          style={{
            top: activeSpotlightRect.top,
            left: activeSpotlightRect.left,
            width: activeSpotlightRect.width,
            height: activeSpotlightRect.height,
          }}
        />
      ) : null}

      {popupStyle ? (
        <article
          key={step.id}
          className="tutorial-card fixed w-[min(360px,calc(100vw-32px))] rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-5"
          style={popupStyle}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {step.eyebrow}
              </p>
              <h2
                id="tutorial-showcase-title"
                className="mt-2 text-lg font-semibold tracking-tight text-zinc-950"
              >
                {step.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
              aria-label="Close tutorial"
              title="Close tutorial"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-3 text-sm leading-6 text-zinc-600">{step.body}</p>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900 transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-zinc-500">
              {stepIndex + 1} of {STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                disabled={stepIndex === 0}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLastStep) {
                    onClose();
                    return;
                  }
                  setStepIndex((current) => current + 1);
                }}
                className="inline-flex items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
              >
                {isLastStep ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}
