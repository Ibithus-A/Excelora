"use client";

import katex from "katex";
import {
  CHAPTER_ONE_ASSESSMENT_CONFIG,
  CHAPTER_ONE_ASSESSMENT_KEY,
} from "@/lib/assessment-config";
import { hasAssessmentAnswerContent } from "@/lib/assessment-answer";
import { CHAPTER_ONE_ASSESSMENT_FORM_A } from "@/lib/question-bank/chapter-one";
import type { QuestionBankItem } from "@/lib/question-bank/types";
import {
  RichMathAnswerInput,
  type RichMathAnswerHandle,
} from "@/components/rich-math-answer-input";
import { StructuredGraphSketch } from "@/components/structured-graph-sketch";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalculatorDrawer } from "./assessment-calculator";

type AssessmentAttempt = {
  id: string;
  answers: Record<string, string> | null;
  total_marks: number;
  score?: number;
  automated_total_marks?: number;
  pending_review_marks?: number;
  locked_questions: string[];
  question_scores?: Record<string, { marks: number; maxMarks: number; automatedMaxMarks: number; pendingReviewMarks: number }>;
  status: "active" | "submitted";
  started_at: string;
  deadline_at: string;
  submitted_at: string | null;
};

type PreviewQuestionScore = {
  marks: number;
  maxMarks: number;
  automatedMaxMarks: number;
  pendingReviewMarks: number;
};

type TutorPreviewMarking = {
  score: number;
  totalMarks: number;
  automatedTotalMarks: number;
  pendingReviewMarks: number;
  questionScores: Record<string, PreviewQuestionScore>;
};

type AssessmentQuestion = QuestionBankItem;

function answerPartsFor(question: AssessmentQuestion) {
  return question.answerParts ?? [{ key: `q${question.number}`, label: "Answer" }];
}

function formatAnswerLabel(label: string) {
  return label === "Answer" ? "Answer:" : `Answer ${label}:`;
}

function questionHasAnswer(question: AssessmentQuestion, answers: Record<string, string>) {
  return answerPartsFor(question).some((part) => hasAssessmentAnswerContent(answers[part.key])) ||
    (question.hasSketch && Boolean(answers[`q${question.number}_sketch`]));
}

function tutorScoreState(score: PreviewQuestionScore | undefined) {
  if (!score || score.marks === 0) return "incorrect" as const;
  if (score.marks < score.automatedMaxMarks) return "partial" as const;
  return "correct" as const;
}

function MathText({ children }: { children: string }) {
  return (
    <span
      className="inline-block px-0.5"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, { throwOnError: false, strict: false }),
      }}
    />
  );
}

const QUESTIONS: AssessmentQuestion[] = CHAPTER_ONE_ASSESSMENT_FORM_A;

function QuestionBody({ question }: { question: AssessmentQuestion }) {
  return (
    <div className="space-y-3">
      {question.paragraphs.map((paragraph, paragraphIndex) => (
        <p key={`${question.id}-paragraph-${paragraphIndex}`}>
          {paragraph.map((segment, segmentIndex) =>
            segment.type === "math" ? (
              <MathText key={`${question.id}-segment-${paragraphIndex}-${segmentIndex}`}>
                {segment.value}
              </MathText>
            ) : (
              <span key={`${question.id}-segment-${paragraphIndex}-${segmentIndex}`}>
                {segment.value}
              </span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function ChapterOneInteractiveAssessment({
  role,
  onCompleted,
  onMathsSidebarOpenChange,
}: {
  role: "tutor" | "student";
  onCompleted?: () => void;
  onMathsSidebarOpenChange?: (isOpen: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(role === "student");
  const [isUnlocked, setIsUnlocked] = useState(role === "tutor");
  const [requiresPremium, setRequiresPremium] = useState(false);
  const [prerequisite, setPrerequisite] = useState({
    isComplete: role === "tutor",
    completedCount: 0,
    totalCount: CHAPTER_ONE_ASSESSMENT_CONFIG.requiredModuleTitles.length,
  });
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(CHAPTER_ONE_ASSESSMENT_CONFIG.durationSeconds);
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [isTutorPreview, setIsTutorPreview] = useState(false);
  const [tutorLockedQuestions, setTutorLockedQuestions] = useState<string[]>([]);
  const [tutorQuestionScores, setTutorQuestionScores] = useState<Record<string, PreviewQuestionScore>>({});
  const [tutorPreviewResult, setTutorPreviewResult] = useState<TutorPreviewMarking | null>(null);
  const [isCalculatorPinnedOpen, setIsCalculatorPinnedOpen] = useState(false);
  const [isCalculatorHoverOpen, setIsCalculatorHoverOpen] = useState(false);
  const [answerConfirmQuestion, setAnswerConfirmQuestion] = useState<string | null>(null);
  const [pendingNavigationIndex, setPendingNavigationIndex] = useState<number | null>(null);
  const [isLockingAnswer, setIsLockingAnswer] = useState(false);
  const [isSubmitConfirming, setIsSubmitConfirming] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [error, setError] = useState("");
  const [activeAnswerKey, setActiveAnswerKey] = useState<string | null>(null);
  const hasAutoSubmittedRef = useRef(false);
  const answerInputRefs = useRef<Record<string, RichMathAnswerHandle | null>>({});
  const lastCalculatorOpenRequestRef = useRef(0);

  const closeCalculator = useCallback(() => {
    setIsCalculatorPinnedOpen(false);
    setIsCalculatorHoverOpen(false);
  }, []);

  const openCalculator = useCallback(() => {
    lastCalculatorOpenRequestRef.current = Date.now();
    setIsCalculatorPinnedOpen(true);
  }, []);

  const loadAssessment = useCallback(async () => {
    if (role !== "student") return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/assessments?assessmentKey=${encodeURIComponent(CHAPTER_ONE_ASSESSMENT_KEY)}`, { cache: "no-store" });
      const payload = (await response.json()) as { isUnlocked?: boolean; requiresPremium?: boolean; prerequisite?: { isComplete: boolean; completedCount: number; totalCount: number }; attempt?: AssessmentAttempt | null; serverNow?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to load assessment.");
      setIsUnlocked(Boolean(payload.isUnlocked));
      setRequiresPremium(Boolean(payload.requiresPremium));
      if (payload.prerequisite) setPrerequisite(payload.prerequisite);
      setAttempt(payload.attempt ?? null);
      setAnswers(payload.attempt?.answers ?? {});
      if (payload.serverNow) setServerOffsetMs(new Date(payload.serverNow).getTime() - Date.now());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load assessment.");
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => { void loadAssessment(); }, [loadAssessment]);

  const postAction = useCallback(async (action: "start" | "save" | "lock_answer" | "submit", nextAnswers: Record<string, string>, questionKey?: string) => {
    const response = await fetch("/api/assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, assessmentKey: CHAPTER_ONE_ASSESSMENT_KEY, answers: nextAnswers, questionKey }) });
    const payload = (await response.json()) as { attempt?: AssessmentAttempt; serverNow?: string; error?: string };
    if (!response.ok || !payload.attempt) throw new Error(payload.error || "Unable to update assessment.");
    if (payload.serverNow) setServerOffsetMs(new Date(payload.serverNow).getTime() - Date.now());
    setAttempt(payload.attempt);
    return payload.attempt;
  }, []);

  const markTutorPreview = useCallback(async (action: "preview_mark" | "preview_submit", nextAnswers: Record<string, string>, questionKey?: string) => {
    const response = await fetch("/api/assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, assessmentKey: CHAPTER_ONE_ASSESSMENT_KEY, answers: nextAnswers, questionKey }) });
    const payload = (await response.json()) as { marking?: TutorPreviewMarking; error?: string };
    if (!response.ok || !payload.marking) throw new Error(payload.error || "Unable to mark the tutor preview.");
    return payload.marking;
  }, []);

  const startAssessment = async () => {
    if (role === "tutor") {
      setAnswers({});
      setTutorLockedQuestions([]);
      setTutorQuestionScores({});
      setTutorPreviewResult(null);
      setCurrentIndex(0);
      setActiveAnswerKey(null);
      closeCalculator();
      setError("");
      setIsTutorPreview(true);
      return;
    }
    setError("");
    try { await postAction("start", {}); setAnswers({}); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to start assessment."); }
  };

  const submitAssessment = useCallback(async () => {
    if (role === "tutor") {
      try {
        const marking = await markTutorPreview("preview_submit", answers);
        setTutorQuestionScores(marking.questionScores);
        setTutorPreviewResult(marking);
        setTutorLockedQuestions(QUESTIONS.filter((item) => questionHasAnswer(item, answers)).map((item) => `q${item.number}`));
        setIsTutorPreview(false);
        setIsSubmitConfirming(false);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to mark the tutor preview.");
      }
      return;
    }
    try {
      const submitted = await postAction("submit", answers);
      setIsSubmitConfirming(false);
      if (submitted.status === "submitted") onCompleted?.();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to submit assessment."); }
  }, [answers, markTutorPreview, onCompleted, postAction, role]);

  const isActive = role === "tutor" ? isTutorPreview : attempt?.status === "active";
  const isSubmitted = role === "student" && attempt?.status === "submitted";

  useEffect(() => {
    if (!isActive || role !== "student" || !attempt) return;
    const update = () => {
      const remaining = Math.ceil((new Date(attempt.deadline_at).getTime() - (Date.now() + serverOffsetMs)) / 1000);
      setRemainingSeconds(Math.max(0, remaining));
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [attempt, isActive, role, serverOffsetMs]);

  useEffect(() => {
    if (role !== "student" || !isActive || remainingSeconds > 0 || hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
    void submitAssessment();
  }, [isActive, remainingSeconds, role, submitAssessment]);

  const activeAttemptId = attempt?.id ?? null;

  useEffect(() => {
    if (role !== "student" || !isActive || !activeAttemptId) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void postAction("save", answers).then(() => setSaveState("saved")).catch(() => setSaveState("error"));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [activeAttemptId, answers, isActive, postAction, role]);

  const answeredCount = useMemo(() => QUESTIONS.filter((item) => questionHasAnswer(item, answers)).length, [answers]);
  const question = QUESTIONS[currentIndex];
  const currentQuestionKey = `q${question.number}`;
  const currentAnswerParts = answerPartsFor(question);
  const isCurrentAnswerLocked = role === "student"
    ? Boolean(attempt?.locked_questions?.includes(currentQuestionKey))
    : tutorLockedQuestions.includes(currentQuestionKey);
  const lockedCount = role === "student" ? attempt?.locked_questions?.length ?? 0 : tutorLockedQuestions.length;
  const currentTutorScore = role === "tutor" ? tutorQuestionScores[currentQuestionKey] : undefined;
  const currentTutorScoreState = tutorScoreState(currentTutorScore);
  const isCalculatorOpen = isCalculatorPinnedOpen || isCalculatorHoverOpen;

  useEffect(() => {
    onMathsSidebarOpenChange?.(isCalculatorOpen);
  }, [isCalculatorOpen, onMathsSidebarOpenChange]);

  useEffect(() => () => {
    onMathsSidebarOpenChange?.(false);
  }, [onMathsSidebarOpenChange]);

  useEffect(() => {
    if (!isCalculatorOpen) return;

    const isCalculatorInteraction = (target: EventTarget | null) =>
      target instanceof Element
      && Boolean(target.closest("[data-maths-input-drawer], [data-maths-input-trigger], [data-maths-answer]"));

    const closeFromOutside = (event: PointerEvent) => {
      if (!isCalculatorInteraction(event.target)) closeCalculator();
    };
    const closeFromFocusChange = (event: FocusEvent) => {
      if (!isCalculatorInteraction(event.target)) closeCalculator();
    };
    const closeFromKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCalculator();
    };
    const closeFromWindowChange = () => closeCalculator();
    const closeWhenHidden = () => {
      if (document.visibilityState === "hidden") closeCalculator();
    };

    document.addEventListener("pointerdown", closeFromOutside, true);
    document.addEventListener("focusin", closeFromFocusChange);
    document.addEventListener("keydown", closeFromKeyboard);
    document.addEventListener("visibilitychange", closeWhenHidden);
    window.addEventListener("blur", closeFromWindowChange);
    window.addEventListener("pagehide", closeFromWindowChange);
    window.addEventListener("pointercancel", closeFromWindowChange);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside, true);
      document.removeEventListener("focusin", closeFromFocusChange);
      document.removeEventListener("keydown", closeFromKeyboard);
      document.removeEventListener("visibilitychange", closeWhenHidden);
      window.removeEventListener("blur", closeFromWindowChange);
      window.removeEventListener("pagehide", closeFromWindowChange);
      window.removeEventListener("pointercancel", closeFromWindowChange);
    };
  }, [closeCalculator, isCalculatorOpen]);

  useEffect(() => {
    closeCalculator();
  }, [closeCalculator, currentIndex, answerConfirmQuestion, isSubmitConfirming, isActive]);

  const confirmationQuestion = answerConfirmQuestion
    ? QUESTIONS.find((item) => `q${item.number}` === answerConfirmQuestion) ?? null
    : null;

  const requestNavigation = (nextIndex: number) => {
    if (!isCurrentAnswerLocked && questionHasAnswer(question, answers)) {
      setAnswerConfirmQuestion(currentQuestionKey);
      setPendingNavigationIndex(nextIndex);
      return;
    }
    setCurrentIndex(nextIndex);
  };

  const lockAnswer = async () => {
    if (!answerConfirmQuestion || isLockingAnswer) return;
    setError("");
    setIsLockingAnswer(true);
    try {
      if (role === "tutor") {
        const marking = await markTutorPreview("preview_mark", answers, answerConfirmQuestion);
        setTutorLockedQuestions((current) => Array.from(new Set([...current, answerConfirmQuestion])));
        setTutorQuestionScores((current) => ({ ...current, [answerConfirmQuestion]: marking.questionScores[answerConfirmQuestion] }));
      } else {
        await postAction("lock_answer", answers, answerConfirmQuestion);
      }
      setAnswerConfirmQuestion(null);
      if (pendingNavigationIndex !== null) setCurrentIndex(pendingNavigationIndex);
      setPendingNavigationIndex(null);
      closeCalculator();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to confirm this answer.");
    } finally {
      setIsLockingAnswer(false);
    }
  };

  const editTutorAnswer = () => {
    if (role !== "tutor") return;
    setTutorLockedQuestions((current) => current.filter((key) => key !== currentQuestionKey));
    setTutorQuestionScores((current) => {
      const next = { ...current };
      delete next[currentQuestionKey];
      return next;
    });
  };

  if (isLoading) return <div className="flex min-h-[360px] items-center justify-center text-sm text-zinc-500">Checking assessment access…</div>;
  if (error && !isActive && !isSubmitted) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>;
  if (requiresPremium && role === "student") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-xl">⌑</div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">Premium assessment</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-600">This assessment requires the Premium Plan. Ask your tutor to upgrade your account; they must then unlock the assessment after you complete its chapter.</p>
      </div>
    );
  }
  if (!isUnlocked && role === "student") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-xl">⌁</div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">Assessment locked</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          {prerequisite.isComplete
            ? "Your tutor must unlock this assessment for you manually. Once you start, the 90-minute timer cannot be paused."
            : `Complete all ${prerequisite.totalCount} modules in this chapter before the assessment can be unlocked. You have completed ${prerequisite.completedCount} of ${prerequisite.totalCount}.`}
        </p>
      </div>
    );
  }
  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-xl py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Submitted</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">Assessment complete</h2>
        {typeof attempt?.score === "number" ? (
          <div className="mx-auto mt-6 w-fit rounded-2xl border border-zinc-200 bg-zinc-50 px-8 py-5">
            <p className="text-4xl font-semibold tabular-nums tracking-tight text-zinc-950">
              {attempt.score}<span className="text-xl font-medium text-zinc-400"> / {attempt.automated_total_marks ?? attempt.total_marks}</span>
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Automatically marked</p>
          </div>
        ) : null}
        {(attempt?.pending_review_marks ?? 0) > 0 ? <p className="mt-3 text-xs text-zinc-500">{attempt?.pending_review_marks} sketch marks are reserved for future AI review.</p> : null}
        <p className="mt-4 text-sm leading-7 text-zinc-600">Your answers and submission time have been recorded. Solutions are not shown on this page.</p>
        {attempt?.submitted_at ? <p className="mt-3 text-xs text-zinc-400">Submitted {new Date(attempt.submitted_at).toLocaleString()}</p> : null}
      </div>
    );
  }
  if (role === "tutor" && tutorPreviewResult) {
    return (
      <div className="mx-auto max-w-xl py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Tutor preview complete</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">Preview marked</h2>
        <div className="mx-auto mt-6 w-fit rounded-2xl border border-zinc-200 bg-zinc-50 px-8 py-5">
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-zinc-950">
            {tutorPreviewResult.score}<span className="text-xl font-medium text-zinc-400"> / {tutorPreviewResult.automatedTotalMarks}</span>
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Automatically marked</p>
        </div>
        {tutorPreviewResult.pendingReviewMarks > 0 ? <p className="mt-3 text-xs text-zinc-500">{tutorPreviewResult.pendingReviewMarks} sketch marks excluded from automatic marking.</p> : null}
        <button type="button" onClick={() => void startAssessment()} className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">Start another preview</button>
      </div>
    );
  }
  if (!isActive) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Chapter 1 · Algebra and Functions</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">End of Topic Assessment</h2>
        <p className="mt-4 text-sm leading-7 text-zinc-600">Answer every question and show full working. Questions appear one at a time. Arthur AI is disabled throughout the assessment.</p>
        <div className="mt-7 grid grid-cols-3 divide-x divide-zinc-200 rounded-2xl border border-zinc-200 bg-zinc-50/70 py-5 text-center">
          <div><p className="text-2xl font-semibold text-zinc-900">15</p><p className="mt-1 text-xs text-zinc-500">Questions</p></div>
          <div><p className="text-2xl font-semibold text-zinc-900">75</p><p className="mt-1 text-xs text-zinc-500">Marks</p></div>
          <div><p className="text-2xl font-semibold text-zinc-900">90</p><p className="mt-1 text-xs text-zinc-500">Minutes</p></div>
        </div>
        <div className="mt-7 space-y-3 text-sm leading-6 text-zinc-600">
          {role === "tutor" ? <><p>• Tutor previews are unlimited and do not use the student timer.</p><p>• Check individual answers immediately against the mark scheme.</p><p>• Edit and retry any checked answer, or reset the complete preview.</p></> : <><p>• This assessment can only be attempted once.</p><p>• The timer starts only when you press the button below.</p><p>• Confirming an answer permanently locks and marks it.</p><p>• Draft answers save automatically, and submission locks any remaining answers.</p></>}
        </div>
        {role === "tutor" ? <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Tutor preview only. You can attempt and reset this assessment without limits. Preview attempts never affect a student record.</p> : null}
        <button type="button" onClick={() => void startAssessment()} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">{role === "tutor" ? "Open tutor preview" : "Start assessment"}</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-0 z-10 -mx-4 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:-mx-5 md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-semibold text-zinc-900">Question {question.number} of 15</p><p className="mt-0.5 text-[11px] text-zinc-500">{answeredCount} answered · {lockedCount} {role === "tutor" ? "checked" : "locked"} · {role === "tutor" ? "Unlimited preview" : saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : "Saved"}</p></div>
          <div className="flex items-center gap-2"><span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold tabular-nums text-zinc-800">{role === "tutor" ? "Preview" : formatTime(remainingSeconds)}</span>{role === "tutor" ? <button type="button" onClick={() => void startAssessment()} className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50">Reset preview</button> : null}<button data-maths-input-trigger type="button" onClick={() => { if (isCalculatorOpen) closeCalculator(); else openCalculator(); }} aria-expanded={isCalculatorOpen} className={["rounded-full border px-3 py-1 text-xs font-medium transition", isCalculatorOpen ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"].join(" ")}>Calculator</button></div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div data-assessment-progress-fill className="h-full rounded-full bg-[var(--excelora-green)] transition-[width] duration-300 ease-out" style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }} /></div>
      </div>

      <CalculatorDrawer
        isOpen={isCalculatorOpen}
        questionNumber={question.number}
        onClose={closeCalculator}
        onHoverChange={(isHovered) => {
          setIsCalculatorHoverOpen(isHovered);
          if (!isHovered && Date.now() - lastCalculatorOpenRequestRef.current > 220) {
            setIsCalculatorPinnedOpen(false);
          }
        }}
        onInsertLatex={(latex) => {
          const targetKey = activeAnswerKey && currentAnswerParts.some((part) => part.key === activeAnswerKey)
            ? activeAnswerKey
            : currentAnswerParts[0]?.key;
          if (targetKey) answerInputRefs.current[targetKey]?.insertMath(latex);
        }}
      />

      <section className="py-8">
        <div className="flex items-start justify-between gap-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Question {question.number}</p><span className="shrink-0 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">{question.marks} marks</span></div>
        <div className="mt-5 text-[15px] leading-8 text-zinc-800 sm:text-base"><QuestionBody question={question} /></div>
        {isCurrentAnswerLocked ? <div className="mt-8 flex justify-end"><span className={["rounded-full border px-2.5 py-1 text-[11px] font-semibold", role !== "tutor" || currentTutorScoreState === "correct" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : currentTutorScoreState === "partial" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-rose-200 bg-rose-50 text-rose-700"].join(" ")}>{role === "tutor" && currentTutorScore ? currentTutorScoreState === "correct" ? `Correct · ${currentTutorScore.marks}/${currentTutorScore.automatedMaxMarks}` : currentTutorScoreState === "partial" ? `Partially correct · ${currentTutorScore.marks}/${currentTutorScore.automatedMaxMarks}` : `Incorrect · ${currentTutorScore.marks}/${currentTutorScore.automatedMaxMarks}` : "Locked and marked"}</span></div> : null}
        {question.hasSketch ? <div className={isCurrentAnswerLocked ? "pointer-events-none opacity-70" : ""}><p className="mt-8 text-[15px] font-normal leading-8 text-zinc-800 sm:text-base">Answer (a) — Sketch:</p><StructuredGraphSketch value={answers.q9_sketch ?? ""} onChange={(value) => setAnswers((current) => ({ ...current, q9_sketch: value }))} /></div> : null}
        <div className="mt-8 space-y-5">
          {currentAnswerParts.map((part) => <div key={part.key}><label htmlFor={`answer-${part.key}`} className="block text-[15px] font-normal leading-8 text-zinc-800 sm:text-base">{formatAnswerLabel(part.label)}</label><RichMathAnswerInput ref={(handle) => { answerInputRefs.current[part.key] = handle; }} id={`answer-${part.key}`} value={answers[part.key] ?? ""} readOnly={isCurrentAnswerLocked} onFocus={isCurrentAnswerLocked ? undefined : () => { setActiveAnswerKey(part.key); openCalculator(); }} onChange={(value) => setAnswers((current) => ({ ...current, [part.key]: value }))} /></div>)}
        </div>
        {!isCurrentAnswerLocked && questionHasAnswer(question, answers) ? <button type="button" onClick={() => { setAnswerConfirmQuestion(currentQuestionKey); setPendingNavigationIndex(null); }} className="mt-4 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800">{role === "tutor" ? "Check answer" : "Confirm and lock answer"}</button> : null}
        {role === "tutor" && isCurrentAnswerLocked ? <button type="button" onClick={editTutorAnswer} className="mt-4 inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50">Edit and try again</button> : null}
      </section>

      <div className="border-t border-zinc-200 py-5">
        <div className="flex flex-wrap justify-center gap-1.5">{QUESTIONS.map((item, index) => { const key = `q${item.number}`; const locked = role === "student" ? Boolean(attempt?.locked_questions?.includes(key)) : tutorLockedQuestions.includes(key); const scoreState = role === "tutor" ? tutorScoreState(tutorQuestionScores[key]) : null; const lockedClass = role !== "tutor" || scoreState === "correct" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : scoreState === "partial" ? "border-amber-300 bg-amber-50 text-amber-700" : "border-rose-300 bg-rose-50 text-rose-700"; return <button key={item.number} type="button" onClick={() => requestNavigation(index)} aria-label={`Go to question ${item.number}`} className={["flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition", index === currentIndex ? "border-zinc-900 bg-zinc-900 text-white" : locked ? lockedClass : questionHasAnswer(item, answers) ? "border-zinc-400 bg-zinc-100 text-zinc-800" : "border-zinc-200 bg-white text-zinc-500"].join(" ")}>{item.number}</button>; })}</div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between"><button type="button" onClick={() => requestNavigation(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40">Previous</button>{currentIndex < QUESTIONS.length - 1 ? <button type="button" onClick={() => requestNavigation(Math.min(QUESTIONS.length - 1, currentIndex + 1))} className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white">Next question</button> : <button type="button" onClick={() => setIsSubmitConfirming(true)} className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white">{role === "tutor" ? "Finish preview" : "Submit assessment"}</button>}</div>
      </div>

      {answerConfirmQuestion && confirmationQuestion ? <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/30 p-4"><div className="my-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"><h3 className="text-xl font-semibold text-zinc-950">{role === "tutor" ? "Check this answer?" : "Lock this answer?"}</h3><p className="mt-3 text-sm leading-6 text-zinc-600">{role === "tutor" ? `Your answers to Question ${answerConfirmQuestion.slice(1)} will be checked against the mark scheme. You can edit and retry afterward.` : `Once confirmed, your answers to Question ${answerConfirmQuestion.slice(1)} cannot be edited. They will be marked immediately.`}</p><div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto pr-1">{answerPartsFor(confirmationQuestion).map((part) => <div key={part.key}><p className="text-[15px] font-normal leading-8 text-zinc-800 sm:text-base">{formatAnswerLabel(part.label)}</p><RichMathAnswerInput id={`answer-confirmation-${part.key}`} value={answers[part.key] ?? ""} readOnly onChange={() => undefined} /></div>)}</div><div className="mt-6 flex gap-2"><button type="button" disabled={isLockingAnswer} onClick={() => { setAnswerConfirmQuestion(null); setPendingNavigationIndex(null); }} className="flex-1 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50">Keep editing</button><button type="button" disabled={isLockingAnswer} onClick={() => void lockAnswer()} className="flex-1 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400">{isLockingAnswer ? "Checking…" : role === "tutor" ? "Check answers" : "Confirm and lock"}</button></div></div></div> : null}
      {isSubmitConfirming ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"><div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"><h3 className="text-xl font-semibold text-zinc-950">{role === "tutor" ? "Finish this preview?" : "Submit assessment?"}</h3><p className="mt-3 text-sm leading-6 text-zinc-600">{role === "tutor" ? `You answered ${answeredCount} of 15 questions. All entered answers will be marked, and you can immediately start another preview.` : `You answered ${answeredCount} of 15 questions. Submission permanently locks all remaining answers and ends your only attempt.`}</p><div className="mt-6 flex gap-2"><button type="button" onClick={() => setIsSubmitConfirming(false)} className="flex-1 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700">Keep working</button><button type="button" onClick={() => void submitAssessment()} className="flex-1 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">{role === "tutor" ? "Mark preview" : "Lock and submit"}</button></div></div></div> : null}
      {error ? <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
