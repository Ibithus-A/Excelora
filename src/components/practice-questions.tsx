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
  answer?: string;
  worked_solution?: string;
};
type Session = {
  id: string;
  status: string;
  preview?: boolean;
  subtopic: string;
  questions: PracticeQuestion[];
};
type History = {
  id: string;
  subtopic: string;
  status: string;
  created_at: string;
  practice_session_questions: {
    checked_at: string | null;
    requires_review: boolean;
  }[];
};
export function PracticeQuestions({
  subjectTitle,
  chapterTitle,
  initialSubtopic = "",
  onMathsSidebarOpenChange,
}: {
  subjectTitle: string;
  chapterTitle: string;
  initialSubtopic?: string;
  onMathsSidebarOpenChange?: (isOpen: boolean) => void;
}) {
  const mapping = getCourseBankMapping(subjectTitle, chapterTitle),
    assessmentKey = mapping ? assessmentKeyFor(mapping) : "";
  const [topicOptions, setTopicOptions] = useState<TopicOption[]>([]),
    [history, setHistory] = useState<History[]>([]),
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
    [error, setError] = useState(""),
    [preview, setPreview] = useState(false),
    [exhausted, setExhausted] = useState(false);
  const pending = useRef(false);
  const apply = useCallback((next: Session, at = 0) => {
    setSession(next);
    setIndex(at);
    setResponse(next.questions[at]?.response ?? "");
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
      setHistory(data.history);
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
  const run = async (work: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save practice.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  const start = () =>
    run(async () => {
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
      void run(async () => {
        const saved = await save();
        if (saved) setSession(saved);
      });
    }, 900);
    return () => window.clearTimeout(timer);
    // The helpers deliberately capture this exact response; the next render queues newer text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, index, response, busy, error]);
  const stop = () =>
    run(async () => {
      await save();
      const data = await post("stop");
      if (data.session) apply(data.session, index);
      else if (session) apply({ ...session, status: "completed" }, index);
      await load();
    });
  const check = () =>
    run(async () => {
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
    run(async () => {
      const saved = await save();
      if (saved) apply(saved, at);
    });
  const next = () =>
    run(async () => {
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
  const resume = (id: string) =>
    run(async () => {
      const res = await fetch(
        `/api/practice?assessmentKey=${encodeURIComponent(assessmentKey)}&sessionId=${encodeURIComponent(id)}`,
      );
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      apply(
        data.session,
        Math.max(
          0,
          data.session.questions.findIndex(
            (q: PracticeQuestion) => !q.checked_at,
          ),
        ),
      );
      setSubtopic(data.session.subtopic);
    });
  const question = session?.questions[index],
    checked = session?.questions.filter((q) => q.checked_at).length ?? 0;
  const active = session?.status === "active";
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
                  ? "Preparing…"
                  : "Start practice"}
            </button>
          </div>
          {!preview && history.length > 0 && (
            <section className="border-t border-zinc-200 py-7">
              <h3 className="text-sm font-semibold">Recent practice</h3>
              <div className="mt-4 divide-y divide-zinc-100">
                {history.map((h) => (
                  <button
                    key={h.id}
                    disabled={busy}
                    onClick={() => void resume(h.id)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm"
                  >
                    <span>
                      {h.subtopic || "Whole chapter"}
                      <span className="mt-1 block text-xs text-zinc-400">
                        {new Date(h.created_at).toLocaleDateString()} ·{" "}
                        {
                          h.practice_session_questions.filter(
                            (q) => q.checked_at,
                          ).length
                        }{" "}
                        checked
                      </span>
                    </span>
                    <span className="text-xs text-zinc-500">
                      {h.status === "active" ? "Resume" : "Review"} →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
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
                  Stop practice
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
            <div className="flex gap-3 pb-6">
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const saved = await save();
                    if (saved) apply(saved, index);
                  })
                }
                className="rounded-full border border-zinc-200 px-5 py-2 text-sm"
              >
                Save draft
              </button>
              <button
                disabled={busy || !responseHasContent(response)}
                onClick={() => void check()}
                className="rounded-full bg-zinc-950 px-5 py-2 text-sm text-white disabled:opacity-40"
              >
                Check answer
              </button>
            </div>
          )}
          {question.checked_at && (
            <section className="mb-6 space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 text-sm leading-7">
              <h3 className="font-semibold">
                {question.requires_review
                  ? "Saved for tutor review"
                  : `${question.marks_awarded}/${question.marks} marks`}
              </h3>
              {question.requires_review && (
                <p>
                  Your work is saved. Compare it with the solution while it
                  awaits review.
                </p>
              )}
              <div>
                <BankMath value={question.answer ?? ""} />
              </div>
              <div>
                <BankMath value={question.worked_solution ?? ""} />
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
              Previous
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
              Next question
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
