"use client";

import { CloseIcon } from "@/components/icons";
import type { UserRole } from "@/types/auth";
import { useEffect, useMemo, useState } from "react";

export type TutorialSurface =
  | "dashboard"
  | "learning-profile"
  | "course-map"
  | "notes"
  | "ai"
  | "practice"
  | "review"
  | "homework"
  | "assessment"
  | "reports"
  | "tutor-student"
  | "tutor-activity"
  | "tutor-assessment";

type TutorialStep = {
  id: TutorialSurface;
  selector: string;
  eyebrow: string;
  title: string;
  body: string;
  takeaway: string;
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
  role: UserRole;
  onClose: () => void;
  onSurfaceChange: (surface: TutorialSurface) => void;
};

const STUDENT_STEPS: TutorialStep[] = [
  {
    id: "dashboard",
    selector: "[data-tour='dashboard-progress']",
    eyebrow: "Your dashboard",
    title: "Know exactly where to continue",
    body: "Your dashboard keeps completed, current and available topics in one place, so every session starts with a clear next step.",
    takeaway: "Open any available topic directly from your progress overview.",
    placement: "dashboard",
  },
  {
    id: "learning-profile",
    selector: "[data-tour='learning-heatmap']",
    eyebrow: "Learning profile",
    title: "See the pattern behind your progress",
    body: "The heatmap records when you practise, how many questions you complete and the score achieved in each topic. Excelora uses the same evidence to identify your next focus.",
    takeaway: "Select any active day to inspect its topics and results.",
    placement: "dashboard",
  },
  {
    id: "course-map",
    selector: "[data-tour='sidebar-tree']",
    eyebrow: "Course map",
    title: "Move through the course with purpose",
    body: "Subjects, chapters, interactive lessons, practice and assessments live in one course map. Your unlocked path and current position remain visible as you work.",
    takeaway: "Choose a lesson from the sidebar whenever you are ready to study.",
    placement: "right",
  },
  {
    id: "notes",
    selector: "[data-tour='lesson-notes']",
    eyebrow: "Interactive lesson",
    title: "Work through a real interactive lesson",
    body: "Each topic combines structured explanations, mathematical notation, worked examples and responsive diagrams. It is a native page—not a static PDF—so it stays clear on every screen.",
    takeaway: "Complete the lesson in order, then move straight into practice.",
    placement: "left",
  },
  {
    id: "ai",
    selector: "[data-tour='ai-assistant']",
    eyebrow: "Arthur AI",
    title: "Ask without losing your place",
    body: "Arthur opens beside the lesson or practice question you are viewing. It uses that exact context to explain a step, diagnose a mistake or show another route through the method.",
    takeaway: "Ask about the precise step that does not click.",
    placement: "left",
  },
  {
    id: "practice",
    selector: "[data-tour='practice-session']",
    eyebrow: "Practice",
    title: "Apply the method while it is fresh",
    body: "Focused exam-style questions open for the same subtopic. Enter proper mathematical notation, save working and check each answer without leaving the learning flow.",
    takeaway: "Every marked result is retained in your learning profile.",
    placement: "left",
  },
  {
    id: "review",
    selector: "[data-tour='learning-review']",
    eyebrow: "Spaced review",
    title: "Turn every mistake into a future strength",
    body: "A wrong or partially correct answer becomes a review card with the original question, expected answer and worked solution. The card returns at an interval based on your recall.",
    takeaway: "Rate each recall honestly so the next review is timed correctly.",
    placement: "dashboard",
  },
  {
    id: "homework",
    selector: "[data-tour='quiz-panel']",
    eyebrow: "Adaptive homework",
    title: "Let your results shape the next quiz",
    body: "When a reliable gap appears, Excelora automatically builds focused homework from that topic and prioritises questions already due for review. Tutor assignments appear here too.",
    takeaway: "Open Your Work to complete the most relevant questions next.",
    placement: "dashboard",
  },
  {
    id: "assessment",
    selector: "[data-tour='assessment-overview']",
    eyebrow: "Assessments",
    title: "Measure what you can do independently",
    body: "Complete the chapter requirements, receive access from your tutor and take the timed assessment in the workspace. Submitted marks and anything awaiting tutor review remain visible here.",
    takeaway: "Use the result to decide what to consolidate before moving on.",
    placement: "dashboard",
  },
  {
    id: "reports",
    selector: "[data-tour='learning-reports']",
    eyebrow: "Progress reports",
    title: "Finish with a clear view of the week",
    body: "Weekly and monthly reports combine questions completed, active days, score, strongest topics and the clearest next focus into one concise learning record.",
    takeaway: "Your tutor sees the same evidence, so support stays specific.",
    placement: "dashboard",
  },
];

const TUTOR_STEPS: TutorialStep[] = [
  {
    id: "tutor-student",
    selector: "[data-tour='tutor-student-selector']",
    eyebrow: "Student context",
    title: "Choose the learner you want to support",
    body: "The selected student becomes the context for progress, practice, review cards, reports, quizzes and access controls across the dashboard.",
    takeaway: "Change the student once and every monitoring panel follows.",
    placement: "dashboard",
  },
  {
    id: "learning-profile",
    selector: "[data-tour='learning-intelligence']",
    eyebrow: "Learning intelligence",
    title: "See effort and attainment together",
    body: "The heatmap, topic accuracy and recommended focus show how often the student practises, what they attempted and where marks are being lost.",
    takeaway: "Use the evidence to make the next intervention precise.",
    placement: "dashboard",
  },
  {
    id: "review",
    selector: "[data-tour='learning-review']",
    eyebrow: "Spaced-review monitor",
    title: "Monitor every retained learning gap",
    body: "Review cards show the topic, due status, number of misses, review count and mastery state for every question retained from the student’s mistakes.",
    takeaway: "You can see whether difficult ideas are actually being revisited.",
    placement: "dashboard",
  },
  {
    id: "homework",
    selector: "[data-tour='quiz-panel']",
    eyebrow: "Homework",
    title: "Review tutor-set and adaptive quizzes",
    body: "Set your own focused quiz or inspect automatically generated homework. Adaptive assignments explain why they were created and remain fully reviewable after submission.",
    takeaway: "Automation fills gaps without removing tutor oversight.",
    placement: "dashboard",
  },
  {
    id: "tutor-activity",
    selector: "[data-tour='tutor-activity']",
    eyebrow: "Marked work",
    title: "Open the student’s real attempts",
    body: "Review saved practice and assessment attempts question by question, including the response, marks and worked solution. Complete any answers that require human marking here.",
    takeaway: "The final tutor mark feeds back into the learning profile.",
    placement: "dashboard",
  },
  {
    id: "tutor-assessment",
    selector: "[data-tour='tutor-assessment-controls']",
    eyebrow: "Assessment access",
    title: "Release assessments at the right time",
    body: "Excelora checks the chapter prerequisites and plan access. Once the student is ready, you control whether the formal chapter assessment is unlocked.",
    takeaway: "Readiness stays visible before access is granted.",
    placement: "dashboard",
  },
  {
    id: "reports",
    selector: "[data-tour='learning-reports']",
    eyebrow: "Tutor reports",
    title: "Read the week or month in minutes",
    body: "Reports summarise effort, accuracy, active days, strengths and focus topics, giving you a consistent evidence base for lessons and parent updates.",
    takeaway: "Switch between weekly and monthly views without rebuilding reports.",
    placement: "dashboard",
  },
  {
    id: "course-map",
    selector: "[data-tour='sidebar-tree']",
    eyebrow: "Course workspace",
    title: "Preview the environment students use",
    body: "Open the course map to inspect lessons, practice and assessments in the same structured workspace your students experience.",
    takeaway: "Use the workspace when planning what the student should study next.",
    placement: "right",
  },
  {
    id: "notes",
    selector: "[data-tour='lesson-notes']",
    eyebrow: "Interactive lesson",
    title: "Inspect the teaching experience",
    body: "Lessons are native interactive pages with structured explanations, notation, examples and diagrams—not static documents or disconnected tools.",
    takeaway: "The lesson, Arthur, practice and review all share this context.",
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
  const maxWidth = 380;
  const estimatedHeight = 330;
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
  role,
  onClose,
  onSurfaceChange,
}: TutorialShowcaseProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const steps = role === "tutor" ? TUTOR_STEPS : STUDENT_STEPS;
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const activeSpotlightRect = spotlightRect?.stepId === step.id ? spotlightRect : null;
  const popupStyle = useMemo(
    () =>
      typeof window === "undefined"
        ? null
        : activeSpotlightRect
          ? getPopupStyle(step, activeSpotlightRect)
          : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
    [activeSpotlightRect, step],
  );

  useEffect(() => {
    if (!isOpen) return;
    onSurfaceChange(step.id);
  }, [isOpen, onSurfaceChange, step.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setStepIndex((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight") {
        if (stepIndex >= steps.length - 1) onClose();
        else setStepIndex((current) => current + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, stepIndex, steps.length]);

  useEffect(() => {
    if (!isOpen) return;

    const updateSpotlight = () => {
      setSpotlightRect(getSpotlightRect(step.id, step.selector));
    };

    const frame = window.requestAnimationFrame(updateSpotlight);
    const revealTargetTimer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(step.selector);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const isOutsideViewport = rect.top < 24 || rect.bottom > window.innerHeight - 24;
      if (isOutsideViewport) {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center",
        });
      }
      updateSpotlight();
    }, 140);
    const settledFrame = window.setTimeout(updateSpotlight, 760);
    const targetPoll = window.setInterval(updateSpotlight, 120);
    const stopTargetPoll = window.setTimeout(() => window.clearInterval(targetPoll), 1800);
    const targetObserver = new MutationObserver(updateSpotlight);
    targetObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(revealTargetTimer);
      window.clearTimeout(settledFrame);
      window.clearInterval(targetPoll);
      window.clearTimeout(stopTargetPoll);
      targetObserver.disconnect();
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [isOpen, step.id, step.selector, stepIndex]);

  if (!isOpen) return null;

  const isLastStep = stepIndex === steps.length - 1;
  const progressPercent = ((stepIndex + 1) / steps.length) * 100;

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
          className="tutorial-card fixed w-[min(380px,calc(100vw-32px))] rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-5"
          style={popupStyle}
          aria-live="polite"
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

          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">What to do</p>
            <p className="mt-1 text-xs leading-5 text-zinc-700">{step.takeaway}</p>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900 transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-zinc-500">
              {stepIndex + 1} of {steps.length}
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
