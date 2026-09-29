"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BankMath, BankQuestion } from "./bank-question";
import { QuestionSessionHeader } from "./question-session-header";
import { resolvePracticeSubtopic } from "@/lib/question-bank/subtopics";
import { responseHasContent } from "@/lib/question-bank/responses";
import {
  assessmentKeyFor,
  getCourseBankMapping,
} from "@/lib/question-bank/course-mapping";
import type { PracticeDifficulty } from "@/lib/question-bank/practice-selector";

const PRACTICE_DIFFICULTIES: PracticeDifficulty[] = [
  "balanced",
  "Foundation",
  "Standard",
  "Stretch",
];
const PRACTICE_LENGTHS = [5, 10, 15, 20] as const;
type TopicOption = {
  title: string;
  counts: Record<PracticeDifficulty, number>;
};
type PracticeQuestion = {
  id: string;
  question_id: string;
  prompt: string;
  subtopic: string;
  marks: number;
  response: string;
  checked_at: string | null;
  requires_review: boolean;
  marks_awarded: number;
  is_correct?: boolean | null;
  review_status?: "not_required" | "pending" | "completed";
  reviewed_at?: string | null;
  answer?: string;
  worked_solution?: string;
};
type PracticeAction =
  | "starting"
  | "saving"
  | "checking"
  | "stopping"
  | "navigating";
type Session = {
  id: string;
  status: string;
  preview?: boolean;
  subtopic: string;
  questions: PracticeQuestion[];
};
export type PracticeArthurContext = {
  sessionId: string;
  questionId: string;
  questionTitle: string;
};
export function PracticeQuestions({
  subjectTitle,
  chapterTitle,
  initialSubtopic = "",
  onMathsSidebarOpenChange,
  canUseArthur = false,
  onArthurContextChange,
  onAskArthur,
}: {
  subjectTitle: string;
  chapterTitle: string;
  initialSubtopic?: string;
  onMathsSidebarOpenChange?: (isOpen: boolean) => void;
  canUseArthur?: boolean;
  onArthurContextChange?: (context: PracticeArthurContext | null) => void;
  onAskArthur?: () => void;
}) {
  const mapping = getCourseBankMapping(subjectTitle, chapterTitle),
    assessmentKey = mapping ? assessmentKeyFor(mapping) : "";
  const [topicOptions, setTopicOptions] = useState<TopicOption[]>([]),
    [subtopic, setSubtopic] = useState(initialSubtopic);
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [lengthIndex, setLengthIndex] = useState(0);
  const [isScopePickerOpen, setIsScopePickerOpen] = useState(false);
  const scopePickerRef = useRef<HTMLDivElement>(null);
  const difficulty = PRACTICE_DIFFICULTIES[difficultyIndex];
  const questionCount = PRACTICE_LENGTHS[lengthIndex];
  const topics = topicOptions.map((topic) => topic.title);
  const [session, setSession] = useState<Session | null>(null),
    [index, setIndex] = useState(0),
    [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [pendingAction, setPendingAction] = useState<PracticeAction | null>(null),
    [error, setError] = useState(""),
    [preview, setPreview] = useState(false),
    [exhausted, setExhausted] = useState(false);
  const pending = useRef(false);
  const apply = useCallback((next: Session, at = 0) => {
    const visibleQuestions = next.status === "active"
      ? next.questions
      : next.questions.filter((question) => Boolean(question.checked_at));
    if (!visibleQuestions.length) {
      setSession(null);
      setIndex(0);
      setResponse("");
      return;
    }
    const safeIndex = Math.max(0, Math.min(at, visibleQuestions.length - 1));
    setSession({ ...next, questions: visibleQuestions });
    setIndex(safeIndex);
    setResponse(visibleQuestions[safeIndex]?.response ?? "");
  }, []);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/practice?assessmentKey=${encodeURIComponent(assessmentKey)}`,
      );
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      const options = data.subtopics as TopicOption[];
      const titles = options.map((t) => t.title);
      setTopicOptions(options);
      setPreview(Boolean(data.preview));
      const scope = resolvePracticeSubtopic(initialSubtopic, titles);
      if (scope === null)
        throw Error("No questions are available for this subtopic yet.");
      setSubtopic((current) => (initialSubtopic ? scope : current));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load practice.");
    } finally {
      setLoading(false);
    }
  }, [assessmentKey, initialSubtopic]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!isScopePickerOpen) return;
    const closeFromOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !scopePickerRef.current?.contains(event.target)
      )
        setIsScopePickerOpen(false);
    };
    const closeFromKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsScopePickerOpen(false);
    };
    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromKeyboard);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromKeyboard);
    };
  }, [isScopePickerOpen]);
  // Warn before a full-page exit if the current response has not been persisted.
  useEffect(() => {
    if (!session || session.status !== "active") return;
    const guard = (e: BeforeUnloadEvent) => {
      if (response !== session.questions[index]?.response) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [session, index, response]);
  const post = async (action: string) => {
    const res = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        assessmentKey,
        subtopic,
        sessionId: session?.id,
        questionId: session?.questions[index]?.id,
        response,
        difficulty,
        count: questionCount,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw Error(data.error ?? "Unable to save practice.");
    return data;
  };
  const run = async (
    action: PracticeAction,
    work: () => Promise<void>,
  ) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setPendingAction(action);
    setError("");
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save practice.");
    } finally {
      pending.current = false;
      setBusy(false);
      setPendingAction(null);
    }
  };
  const start = () =>
    run("starting", async () => {
      const data = await post("start");
      setExhausted(false);
      apply(
        data.session,
        Math.max(
          0,
          data.session.questions.findIndex(
            (q: PracticeQuestion) => !q.checked_at,
          ),
        ),
      );
    });
  const save = async () => {
    if (session?.status === "active" && !session.questions[index]?.checked_at) {
      const data = await post("save");
      if (data.session) return data.session as Session;
      if (data.previewQuestion)
        return {
          ...session,
          questions: session.questions.map((q) =>
            q.id === data.previewQuestion.id
              ? { ...q, ...data.previewQuestion }
              : q,
          ),
        };
    }
    return session;
  };
  // Save after a short typing pause. Updating the persisted snapshot must never
  // replace newer text the student typed while the request was in flight.
  useEffect(() => {
    if (
      !session ||
      session.status !== "active" ||
      session.questions[index]?.checked_at ||
      busy ||
      Boolean(error) ||
      response === session.questions[index]?.response
    )
      return;
    const timer = window.setTimeout(() => {
      void run("saving", async () => {
        const saved = await save();
        if (saved) setSession(saved);
      });
    }, 900);
    return () => window.clearTimeout(timer);
    // The helpers deliberately capture this exact response; the next render queues newer text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, index, response, busy, error]);
  const stop = () =>
    run("stopping", async () => {
      await save();
      const data = await post("stop");
      if (data.session) apply(data.session, index);
      else if (session) apply({ ...session, status: "completed" }, index);
      await load();
    });
  const check = () =>
    run("checking", async () => {
      const data = await post("check");
      if (data.session) apply(data.session, index);
      else if (data.previewQuestion && session)
        apply(
          {
            ...session,
            questions: session.questions.map((q) =>
              q.id === data.previewQuestion.id
                ? { ...q, ...data.previewQuestion }
                : q,
            ),
          },
          index,
        );
    });
  const navigate = (at: number) =>
    run("navigating", async () => {
      const saved = await save();
      if (saved) apply(saved, at);
    });
  const next = () =>
    run("navigating", async () => {
      if (!session) return;
      if (index < session.questions.length - 1) {
        const saved = await save();
        if (saved) apply(saved, index + 1);
        return;
      }
      if (session.preview) {
        const data = await post("start");
        apply(
          {
            ...session,
            questions: [...session.questions, ...data.session.questions],
          },
          index + 1,
        );
        return;
      }
      const data = await post("next");
      setExhausted(Boolean(data.exhausted));
      apply(
        data.session,
        data.exhausted
          ? index
          : Math.min(index + 1, data.session.questions.length - 1),
      );
    });
  const question = session?.questions[index],
    checked = session?.questions.filter((q) => q.checked_at).length ?? 0;
  const active = session?.status === "active";
  const feedbackState = !question?.checked_at
    ? null
    : question.requires_review || question.is_correct === null
      ? "review"
      : question.is_correct === true || question.marks_awarded === question.marks
        ? "correct"
        : "incorrect";
  useEffect(() => {
    if (
      !active ||
      !canUseArthur ||
      !session ||
      !question ||
      feedbackState !== "incorrect"
    ) {
      onArthurContextChange?.(null);
      return;
    }
    onArthurContextChange?.({
      sessionId: session.id,
      questionId: question.question_id,
      questionTitle: question.subtopic || subtopic || chapterTitle,
    });
    return () => onArthurContextChange?.(null);
  }, [
    active,
    canUseArthur,
    chapterTitle,
    feedbackState,
    onArthurContextChange,
    question,
    session,
    subtopic,
  ]);
  const availableQuestions = topicOptions.reduce(
    (total, topic) =>
      total +
      (!subtopic || topic.title === subtopic
        ? Number(topic.counts?.[difficulty] ?? 0)
        : 0),
    0,
  );
  const selectionUnavailable =
    !loading && availableQuestions < questionCount;
  return (
    <div className="mx-auto min-w-0 max-w-3xl">
      {error && (
        <div
          role="alert"
          className="my-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {error}
          {!session && (
            <button className="ml-3 underline" onClick={() => void load()}>
              Try again
            </button>
          )}
        </div>
      )}
      {!session ? (
        loading ? (
          <PracticeInitialLoading />
        ) : (
        <>
          <div className="mx-auto max-w-2xl py-8 text-center sm:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
              {preview ? "Tutor preview" : "Practice"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {initialSubtopic || chapterTitle.replace(/^Chapter \d+: /, "")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              One question at a time. Check your working, keep practising, and
              stop whenever you’re ready.
            </p>
            {!initialSubtopic && topics.length > 1 && (
              <div className="mt-7 rounded-[24px] border border-zinc-200 bg-zinc-50/70 p-4 text-left shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-5">
                <div ref={scopePickerRef} className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    Practice Scope
                  </p>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isScopePickerOpen}
                    onClick={() => setIsScopePickerOpen((open) => !open)}
                    className={[
                      "mt-3 flex w-full items-center justify-between gap-4 rounded-2xl border bg-white px-4 py-3 text-left text-sm font-medium text-zinc-800 shadow-sm outline-none transition duration-200",
                      isScopePickerOpen
                        ? "border-zinc-400 ring-4 ring-zinc-950/5"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/70",
                    ].join(" ")}
                  >
                    <span className="truncate">
                      {subtopic || "Whole Chapter"}
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      className={[
                        "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300",
                        isScopePickerOpen ? "rotate-180" : "rotate-0",
                      ].join(" ")}
                    >
                      <path d="m5.5 7.5 4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div
                    role="listbox"
                    aria-label="Practice scope"
                    aria-hidden={!isScopePickerOpen}
                    inert={!isScopePickerOpen}
                    className={[
                      "absolute inset-x-0 top-full z-30 mt-2 max-h-72 origin-top overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-[0_24px_60px_rgba(15,23,42,0.16)] transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isScopePickerOpen
                        ? "visible translate-y-0 scale-100 opacity-100"
                        : "invisible -translate-y-2 scale-[0.98] opacity-0",
                    ].join(" ")}
                  >
                    {["", ...topics].map((topic) => {
                      const selected = subtopic === topic;
                      return (
                        <button
                          key={topic || "whole-chapter"}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            setSubtopic(topic);
                            setIsScopePickerOpen(false);
                          }}
                          className={[
                            "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                            selected
                              ? "bg-zinc-900 font-medium text-white"
                              : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                          ].join(" ")}
                        >
                          <span>{topic || "Whole Chapter"}</span>
                          {selected ? <span aria-hidden="true">✓</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 border-t border-zinc-200 pt-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="flex items-center justify-between gap-3 text-xs font-medium text-zinc-600">
                      <span>Challenge</span>
                      <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-semibold text-zinc-900">
                        {difficulty === "balanced" ? "Mixed" : difficulty}
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={PRACTICE_DIFFICULTIES.length - 1}
                      step={1}
                      value={difficultyIndex}
                      onChange={(event) =>
                        setDifficultyIndex(Number(event.target.value))
                      }
                      aria-label="Practice challenge"
                      className="practice-range mt-4 w-full"
                    />
                    <span className="mt-2 flex justify-between text-[10px] font-medium text-zinc-400">
                      <span>Mixed</span>
                      <span>Stretch</span>
                    </span>
                  </label>

                  <label className="block">
                    <span className="flex items-center justify-between gap-3 text-xs font-medium text-zinc-600">
                      <span>Starting set</span>
                      <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-semibold text-zinc-900">
                        {questionCount} questions
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={PRACTICE_LENGTHS.length - 1}
                      step={1}
                      value={lengthIndex}
                      onChange={(event) =>
                        setLengthIndex(Number(event.target.value))
                      }
                      aria-label="Starting question count"
                      className="practice-range mt-4 w-full"
                    />
                    <span className="mt-2 flex justify-between text-[10px] font-medium text-zinc-400">
                      <span>5</span>
                      <span>20</span>
                    </span>
                  </label>
                </div>
              </div>
            )}
            {selectionUnavailable && (
              <p role="status" className="mx-auto mt-4 max-w-lg text-xs leading-5 text-amber-700">
                This selection has {availableQuestions} available question{availableQuestions === 1 ? "" : "s"}. {initialSubtopic ? "More questions need to be added before this practice can start." : "Choose a smaller starting set or Mixed challenge."}
              </p>
            )}
            <button
              disabled={
                busy || loading || Boolean(error) || selectionUnavailable
              }
              onClick={() => void start()}
              className="mt-7 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {loading
                ? "Loading practice…"
                : busy
                  ? <span className="inline-flex items-center gap-2"><LoadingSpinner className="h-4 w-4" />Preparing…</span>
                  : "Start practice"}
            </button>
          </div>
        </>
        )
      ) : question ? (
        <>
          <QuestionSessionHeader
            number={index + 1}
            detail={
              <>
                {checked} checked · {active ? "Untimed" : "Finished"}
              </>
            }
            action={
              active ? (
                <button
                  disabled={busy}
                  onClick={() => void stop()}
                  className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  {pendingAction === "stopping" ? (
                    <span className="inline-flex items-center gap-2"><LoadingSpinner className="h-3.5 w-3.5" />Finishing…</span>
                  ) : "Stop practice"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSession(null);
                    void load();
                  }}
                  className="rounded-full border px-3 py-1.5 text-xs"
                >
                  Back to practice
                </button>
              )
            }
          />
          {!active && (
            <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-zinc-900">Reviewing your answers</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">Select any question to revisit your answer and its solution.</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-medium text-zinc-600">
                  {checked}/{session.questions.length} checked
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2" aria-label="Review questions">
                {session.questions.map((item, questionIndex) => {
                  const itemState = item.requires_review || item.is_correct === null
                    ? "review"
                    : item.is_correct === true || item.marks_awarded === item.marks
                      ? "correct"
                      : "incorrect";
                  return (
                    <button
                      type="button"
                      key={item.id}
                      disabled={busy}
                      aria-label={`Review question ${questionIndex + 1}`}
                      aria-current={questionIndex === index ? "step" : undefined}
                      onClick={() => void navigate(questionIndex)}
                      className={[
                        "relative flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-semibold transition hover:-translate-y-0.5 disabled:opacity-50",
                        questionIndex === index ? "ring-2 ring-zinc-900 ring-offset-2" : "",
                        itemState === "correct"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : itemState === "incorrect"
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-amber-200 bg-amber-50 text-amber-700",
                      ].join(" ")}
                    >
                      {questionIndex + 1}
                      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[8px] shadow-sm">
                        {itemState === "correct" ? "✓" : itemState === "incorrect" ? "×" : "•"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
          <BankQuestion
            questionNumber={index + 1}
            key={question.id}
            question={question}
            value={response}
            onChange={setResponse}
            readOnly={!active || Boolean(question.checked_at)}
            onMathsSidebarOpenChange={onMathsSidebarOpenChange}
          />
          {active && !question.checked_at && (
            <div className="pb-6">
              {pendingAction === "checking" && (
                <PracticePendingState
                  title="Checking your answer"
                  body="Comparing your response with the marking criteria…"
                />
              )}
              <div className="flex gap-3">
              <button
                disabled={busy}
                onClick={() =>
                  void run("saving", async () => {
                    const saved = await save();
                    if (saved) apply(saved, index);
                  })
                }
                className="rounded-full border border-zinc-200 px-5 py-2 text-sm"
              >
                {pendingAction === "saving" ? (
                  <span className="inline-flex items-center gap-2"><LoadingSpinner className="h-3.5 w-3.5" />Saving…</span>
                ) : "Save draft"}
              </button>
              <button
                disabled={busy || !responseHasContent(response)}
                onClick={() => void check()}
                className="rounded-full bg-zinc-950 px-5 py-2 text-sm text-white disabled:opacity-40"
              >
                {pendingAction === "checking" ? (
                  <span className="inline-flex items-center gap-2"><LoadingSpinner className="h-3.5 w-3.5" />Marking…</span>
                ) : "Check answer"}
              </button>
              </div>
            </div>
          )}
          {question.checked_at && (
            <section
              key={`${question.id}:${question.checked_at}`}
              className={[
                "practice-feedback mb-6 overflow-hidden rounded-2xl border text-sm leading-7",
                feedbackState === "correct"
                  ? "border-emerald-200 bg-emerald-50/60"
                  : feedbackState === "incorrect"
                    ? "border-rose-200 bg-rose-50/50"
                    : "border-amber-200 bg-amber-50/50",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
                <FeedbackIcon state={feedbackState ?? "review"} />
                <div>
                  <h3 className="font-semibold text-zinc-900">
                    {feedbackState === "correct"
                      ? "Correct — well done"
                      : feedbackState === "incorrect"
                        ? "Not quite — review the solution"
                        : "Answer saved — compare the solution"}
                  </h3>
                  <p className="text-xs leading-5 text-zinc-600">
                    {feedbackState === "review"
                      ? "This response needs tutor oversight; it has not been marked wrong."
                      : `${question.marks_awarded}/${question.marks} marks awarded${question.review_status === "completed" ? " · Tutor reviewed" : ""}`}
                  </p>
                </div>
              </div>
              <div className="space-y-4 bg-white/70 p-5">
              {feedbackState === "incorrect" && active ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-zinc-900">Want help understanding the method?</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Arthur can use this question, your answer and the worked solution to explain where to improve.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!canUseArthur}
                      onClick={onAskArthur}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                    >
                      <span aria-hidden="true">✦</span>
                      {canUseArthur ? "Ask Arthur to explain" : "Arthur requires Plus or Pro"}
                    </button>
                  </div>
                </div>
              ) : null}
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-500">Answer</p>
                <BankMath value={question.answer ?? ""} />
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-500">Worked solution</p>
                <BankMath value={question.worked_solution ?? ""} />
              </div>
              </div>
            </section>
          )}
          {exhausted && (
            <p role="status" className="mb-5 text-sm text-zinc-600">
              You’ve practised every available question in this selection. Stop
              here to save your session; you can start again for revision.
            </p>
          )}
          <div className="flex justify-between border-t border-zinc-200 py-5">
            <button
              disabled={busy || !index}
              onClick={() => void navigate(index - 1)}
              className="rounded-full border border-zinc-200 px-5 py-2 text-sm disabled:opacity-40"
            >
              {pendingAction === "navigating" ? "Loading…" : "Previous"}
            </button>
            <button
              disabled={
                busy ||
                (index === session.questions.length - 1 &&
                  (!active || !question.checked_at || exhausted))
              }
              onClick={() => void next()}
              className="rounded-full bg-zinc-950 px-5 py-2 text-sm text-white disabled:opacity-40"
            >
              {pendingAction === "navigating" ? (
                <span className="inline-flex items-center gap-2"><LoadingSpinner className="h-3.5 w-3.5" />Loading…</span>
              ) : "Next question"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function LoadingSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={["animate-spin", className].join(" ")} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PracticePendingState({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" aria-live="polite" className="practice-pending mb-4 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm">
        <LoadingSpinner className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{body}</p>
      </div>
    </div>
  );
}

function PracticeInitialLoading() {
  return (
    <div role="status" aria-label="Loading practice" className="mx-auto max-w-2xl py-10 sm:py-14">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm">
          <LoadingSpinner className="h-5 w-5" />
        </span>
        <p className="mt-4 text-sm font-semibold text-zinc-900">Preparing your practice</p>
        <p className="mt-1 text-xs text-zinc-500">Loading your topics and recent sessions…</p>
      </div>
      <div className="mt-8 rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
        <div className="loading-skeleton h-3 w-24 rounded-full" />
        <div className="loading-skeleton mt-4 h-12 w-full rounded-2xl" />
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="loading-skeleton h-16 rounded-2xl" />
          <div className="loading-skeleton h-16 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function FeedbackIcon({ state }: { state: "correct" | "incorrect" | "review" }) {
  const isCorrect = state === "correct";
  const isIncorrect = state === "incorrect";
  return (
    <span
      aria-hidden="true"
      className={[
        "practice-feedback-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm",
        isCorrect
          ? "border-emerald-500 text-emerald-600"
          : isIncorrect
            ? "border-rose-500 text-rose-600"
            : "border-amber-500 text-amber-600",
      ].join(" ")}
    >
      {isCorrect ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path className="practice-feedback-stroke" d="m6.5 12.5 3.4 3.4 7.6-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : isIncorrect ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path className="practice-feedback-stroke" d="m8 8 8 8m0-8-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ) : (
        <span className="text-base font-semibold">…</span>
      )}
    </span>
  );
}
