"use client";

import katex from "katex";
import {
  CHAPTER_ONE_ASSESSMENT_CONFIG,
  CHAPTER_ONE_ASSESSMENT_KEY,
} from "@/lib/assessment-config";
import { formatPlainMath } from "@/lib/math-format";
import { SHARED_MATH_INPUT_GROUPS } from "@/lib/math-input-catalog";
import { buildMathInputInsertion } from "@/lib/math-input-builder";
import { hasAssessmentAnswerContent } from "@/lib/assessment-answer";
import { CHAPTER_ONE_ASSESSMENT_FORM_A } from "@/lib/question-bank/chapter-one";
import type { QuestionBankItem } from "@/lib/question-bank/types";
import {
  RichMathAnswerInput,
  type RichMathAnswerHandle,
} from "@/components/rich-math-answer-input";
import { StructuredGraphSketch } from "@/components/structured-graph-sketch";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

type MathInputKey = {
  id: string;
  latex: string;
  ariaLabel: string;
  wide?: boolean;
  build: (selection: string) => { text: string; caret: number };
};

const wrapMathInput = (prefix: string, suffix: string) => (selection: string) => ({
  text: `${prefix}${selection}${suffix}`,
  caret: prefix.length + selection.length + (selection ? suffix.length : 0),
});

const insertMathSymbol = (text: string) => () => ({ text, caret: text.length });

const VARIABLE_KEYS: MathInputKey[] = Array.from("abcdefghijklmnopqrstuvwxyz", (letter) => ({
  id: `variable-${letter}`,
  latex: letter,
  ariaLabel: `Insert variable ${letter}`,
  build: insertMathSymbol(letter),
}));

const LEGACY_MATH_INPUT_GROUPS: Array<{ id: string; label: string; keys: MathInputKey[] }> = [
  {
    id: "structure",
    label: "Structure",
    keys: [
      { id: "fraction", latex: String.raw`\frac{a}{b}`, ariaLabel: "Insert fraction", build: (selection) => selection ? { text: `${selection}/()`, caret: selection.length + 2 } : { text: "()/()", caret: 1 } },
      { id: "sqrt", latex: String.raw`\sqrt{x}`, ariaLabel: "Insert square root", build: wrapMathInput("√(", ")") },
      { id: "power", latex: String.raw`x^n`, ariaLabel: "Insert power", build: (selection) => selection ? { text: `${selection}^()`, caret: selection.length + 2 } : { text: "^()", caret: 2 } },
      { id: "squared", latex: String.raw`x^2`, ariaLabel: "Insert squared", build: (selection) => ({ text: `${selection}^2`, caret: selection.length + 2 }) },
      { id: "subscript", latex: String.raw`x_n`, ariaLabel: "Insert subscript", build: (selection) => selection ? { text: `${selection}_()`, caret: selection.length + 2 } : { text: "_()", caret: 2 } },
      { id: "brackets", latex: String.raw`\left(\square\right)`, ariaLabel: "Insert brackets", build: wrapMathInput("(", ")") },
      { id: "abs", latex: String.raw`|x|`, ariaLabel: "Insert absolute value", build: wrapMathInput("|", "|") },
    ],
  },
  {
    id: "variables",
    label: "Variables",
    keys: VARIABLE_KEYS,
  },
  {
    id: "functions",
    label: "Functions",
    keys: [
      { id: "sin", latex: String.raw`\sin x`, ariaLabel: "Insert sine", build: wrapMathInput("sin(", ")") },
      { id: "cos", latex: String.raw`\cos x`, ariaLabel: "Insert cosine", build: wrapMathInput("cos(", ")") },
      { id: "tan", latex: String.raw`\tan x`, ariaLabel: "Insert tangent", build: wrapMathInput("tan(", ")") },
      { id: "asin", latex: String.raw`\sin^{-1}x`, ariaLabel: "Insert inverse sine", build: wrapMathInput("asin(", ")") },
      { id: "acos", latex: String.raw`\cos^{-1}x`, ariaLabel: "Insert inverse cosine", build: wrapMathInput("acos(", ")") },
      { id: "atan", latex: String.raw`\tan^{-1}x`, ariaLabel: "Insert inverse tangent", build: wrapMathInput("atan(", ")") },
      { id: "log", latex: String.raw`\log x`, ariaLabel: "Insert logarithm", build: wrapMathInput("log(", ")") },
      { id: "ln", latex: String.raw`\ln x`, ariaLabel: "Insert natural logarithm", build: wrapMathInput("ln(", ")") },
      { id: "exp", latex: String.raw`e^x`, ariaLabel: "Insert exponential", build: (selection) => ({ text: `e^(${selection})`, caret: selection ? selection.length + 4 : 3 }) },
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    keys: [
      { id: "pi", latex: String.raw`\pi`, ariaLabel: "Insert pi", build: insertMathSymbol("π") },
      { id: "theta", latex: String.raw`\theta`, ariaLabel: "Insert theta", build: insertMathSymbol("θ") },
      { id: "alpha", latex: String.raw`\alpha`, ariaLabel: "Insert alpha", build: insertMathSymbol("α") },
      { id: "beta", latex: String.raw`\beta`, ariaLabel: "Insert beta", build: insertMathSymbol("β") },
      { id: "infty", latex: String.raw`\infty`, ariaLabel: "Insert infinity", build: insertMathSymbol("∞") },
      { id: "pm", latex: String.raw`\pm`, ariaLabel: "Insert plus or minus", build: insertMathSymbol(" ± ") },
      { id: "times", latex: String.raw`\times`, ariaLabel: "Insert times", build: insertMathSymbol(" × ") },
      { id: "cdot", latex: String.raw`\cdot`, ariaLabel: "Insert dot product", build: insertMathSymbol(" · ") },
      { id: "leq", latex: String.raw`\leq`, ariaLabel: "Insert less than or equal", build: insertMathSymbol(" ≤ ") },
      { id: "geq", latex: String.raw`\geq`, ariaLabel: "Insert greater than or equal", build: insertMathSymbol(" ≥ ") },
      { id: "neq", latex: String.raw`\neq`, ariaLabel: "Insert not equal", build: insertMathSymbol(" ≠ ") },
      { id: "approx", latex: String.raw`\approx`, ariaLabel: "Insert approximately", build: insertMathSymbol(" ≈ ") },
      { id: "to", latex: String.raw`\to`, ariaLabel: "Insert right arrow", build: insertMathSymbol(" → ") },
    ],
  },
];

const LEGACY_ASSESSMENT_KEYS = new Map(
  LEGACY_MATH_INPUT_GROUPS.flatMap((group) => group.keys).map((key) => [key.id, key]),
);

const ASSESSMENT_CALCULUS_KEYS = new Set([
  "integral",
  "definite-integral",
  "derivative",
  "dy-dx",
  "limit",
  "sum",
]);

const MATH_INPUT_GROUPS: Array<{ id: string; label: string; keys: MathInputKey[] }> =
  SHARED_MATH_INPUT_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    keys: group.items.map((item) => {
      const existing = LEGACY_ASSESSMENT_KEYS.get(item.id);
      if (!existing && !ASSESSMENT_CALCULUS_KEYS.has(item.id)) {
        throw new Error(`Missing assessment maths input implementation for ${item.id}`);
      }
      return {
        id: item.id,
        latex: item.labelLatex,
        ariaLabel: item.ariaLabel,
        wide: item.wide,
        build: (selection: string) => buildMathInputInsertion(item.id, selection),
      };
    }),
  }));

function CalculatorKeyLabel({ latex }: { latex: string }) {
  const html = useMemo(
    () => katex.renderToString(latex, { throwOnError: false, strict: "ignore" }),
    [latex],
  );
  return <span className="math-keypad-label inline-flex max-w-full items-center justify-center overflow-hidden" dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathsInputPalette({ onInsertLatex }: { onInsertLatex: (latex: string) => void }) {
  const [activeGroupId, setActiveGroupId] = useState(MATH_INPUT_GROUPS[0].id);
  const [expression, setExpression] = useState("");
  const expressionRef = useRef<HTMLInputElement>(null);
  const activeGroup =
    MATH_INPUT_GROUPS.find((group) => group.id === activeGroupId) ?? MATH_INPUT_GROUPS[0];
  const previewLatex = useMemo(
    () => (expression.trim() ? formatPlainMath(expression) : ""),
    [expression],
  );
  const previewHtml = useMemo(
    () => previewLatex ? katex.renderToString(previewLatex, { displayMode: true, throwOnError: false, strict: "ignore" }) : "",
    [previewLatex],
  );
  const insertKey = (key: MathInputKey) => {
    const input = expressionRef.current;
    const start = input?.selectionStart ?? expression.length;
    const end = input?.selectionEnd ?? start;
    const insertion = key.build(expression.slice(start, end));
    const nextExpression = `${expression.slice(0, start)}${insertion.text}${expression.slice(end)}`;
    const nextCaret = start + insertion.caret;
    setExpression(nextExpression);
    window.requestAnimationFrame(() => {
      expressionRef.current?.focus();
      expressionRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  return (
    <div className="overflow-hidden rounded-[12px] border border-zinc-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]" aria-label="Maths expression input">
      <div className="space-y-2.5 border-b border-zinc-200/80 p-3">
        <label htmlFor="assessment-maths-expression" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Expression</label>
        <input ref={expressionRef} id="assessment-maths-expression" value={expression} onChange={(event) => setExpression(event.target.value)} className="h-10 w-full rounded-[10px] border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition focus:border-zinc-400" />
        <div className="math-builder-preview min-h-20 overflow-x-auto rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 py-2">
          <p className="mb-1 text-[11px] font-medium text-zinc-400">Preview</p>
          <div className="flex min-h-10 items-center justify-center text-zinc-800" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </div>
      <div role="tablist" aria-label="Maths input categories" className="flex items-center gap-1 border-b border-zinc-200/80 bg-zinc-50/70 px-1.5 py-1.5">
        {MATH_INPUT_GROUPS.map((group) => (
          <button key={group.id} type="button" role="tab" aria-selected={activeGroupId === group.id} onClick={() => setActiveGroupId(group.id)} className={["inline-flex flex-1 items-center justify-center rounded-[8px] px-2 py-1.5 text-[11px] font-medium transition", activeGroupId === group.id ? "bg-white text-zinc-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)]" : "text-zinc-500 hover:text-zinc-800"].join(" ")}>{group.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5 p-2">
        {activeGroup.keys.map((key) => (
          <button key={key.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => insertKey(key)} aria-label={key.ariaLabel} title={key.ariaLabel} className={["inline-flex h-11 min-w-0 items-center justify-center overflow-hidden rounded-[10px] border border-zinc-200/80 bg-white px-1 text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100", key.wide ? "col-span-2" : ""].join(" ")}>
            <CalculatorKeyLabel latex={key.latex} />
          </button>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 border-t border-zinc-200/80 p-3">
        <button type="button" onClick={() => setExpression("")} disabled={!expression} className="inline-flex h-9 items-center justify-center rounded-[9px] border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40">Clear</button>
        <button type="button" onClick={() => { if (!expression.trim()) return; onInsertLatex(previewLatex); setExpression(""); }} disabled={!expression.trim()} className="inline-flex h-9 items-center justify-center rounded-[9px] bg-zinc-900 px-3 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300">Insert expression</button>
      </div>
    </div>
  );
}

function CalculatorDrawer({ isOpen, questionNumber, onClose, onHoverChange, onInsertLatex }: { isOpen: boolean; questionNumber: number; onClose: () => void; onHoverChange: (isHovered: boolean) => void; onInsertLatex: (latex: string) => void }) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const openFromHover = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    onHoverChange(true);
  };

  const closeFromHover = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onHoverChange(false);
      closeTimerRef.current = null;
    }, 90);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-y-0 right-0 z-[70] w-full max-w-[390px]"
      onMouseEnter={openFromHover}
      onMouseLeave={closeFromHover}
    >
      <div className="pointer-events-auto absolute inset-y-0 right-0 hidden w-10 md:block" aria-hidden="true" />
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        className={[
          "fixed inset-0 bg-black/20 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-label="Close maths input"
        aria-hidden={!isOpen}
      />
      <aside
        data-maths-input-drawer
        role="dialog"
        aria-label="Maths input"
        aria-hidden={!isOpen}
        className={[
          "absolute inset-y-0 right-0 flex h-dvh w-full max-w-[390px] flex-col border-l border-zinc-200 bg-[var(--surface-sidebar)] shadow-[-24px_0_60px_rgba(9,9,11,0.12)]",
          "transition-[transform,opacity,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          isOpen ? "pointer-events-auto translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0",
        ].join(" ")}
      >
        <div className="border-b border-zinc-200 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">Maths input</p>
            <p className="mt-1 text-xs text-zinc-500">Question {questionNumber}</p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <MathsInputPalette key={questionNumber} onInsertLatex={onInsertLatex} />
        </div>
      </aside>
    </div>,
    document.body,
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
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out" style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }} /></div>
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
