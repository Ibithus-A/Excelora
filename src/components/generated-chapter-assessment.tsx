"use client";
import {QuestionSessionHeader} from "./question-session-header";

import { BankMath as MathPrompt, BankQuestion } from "./bank-question";
import { responseHasContent } from "@/lib/question-bank/responses";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCourseBankMapping,
  assessmentKeyFor,
} from "@/lib/question-bank/course-mapping";

type Question = {
  id: string;
  order: number;
  prompt: string;
  marks: number;
  difficulty: string;
  subtopic: string;
  state?: string;
  response?: { value?: string };
  answer?: string;
  worked_solution?: string;
  marksAwarded?: number | null;
  isCorrect?: boolean | null;
};
type Attempt = {
  id: string;
  status: "active" | "submitted";
  attempt_number: number;
  total_marks: number;
  deadline_at?: string;
  score?: number;
  percentage?: number;
  pending_review_marks?: number;
  questions: Question[];
};

export function GeneratedChapterAssessment({
  subjectTitle,
  chapterTitle,
  role,
  onCompleted,
  onPractice,
  onReview,
}: {
  subjectTitle: string;
  chapterTitle: string;
  role: "tutor" | "student";
  onCompleted?: () => void;
  onPractice?: (subtopic: string) => void;
  onReview?: (attemptId?: string) => void;
}) {
  const mapping = getCourseBankMapping(subjectTitle, chapterTitle);
  const assessmentKey = mapping ? assessmentKeyFor(mapping) : "";
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setUnlocked] = useState(role === "tutor");
  const [error, setError] = useState("");
  const [navigation, setNavigation] = useState<number | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(90 * 60);
  const autoSubmitted = useRef(false);
  const [busy, setBusy] = useState(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const requestQueue = useRef(Promise.resolve());

  const load = useCallback(async () => {
    if (!assessmentKey) {
      setError("No question-bank mapping exists for this chapter.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/generated-assessments?assessmentKey=${encodeURIComponent(assessmentKey)}`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "Unable to load assessment.");
      setAttempt(payload.attempt ?? null);
      setUnlocked(role === "tutor" || Boolean(payload.isUnlocked));
      if (payload.attempt?.questions)
        setAnswers(
          Object.fromEntries(
            payload.attempt.questions.map(
              (q: Question & { response?: { value?: string } }) => [
                q.id,
                q.response?.value ?? "",
              ],
            ),
          ),
        );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to load assessment.",
      );
    } finally {
      setLoading(false);
    }
  }, [assessmentKey, role]);
  useEffect(() => {
    void load();
  }, [load]);

  const act = async (
    action: "start" | "retake" | "save" | "submit" | "lock",
  ) => {
    if (role === "tutor") {
      if (action === "submit" && attempt) {
        const response = await fetch("/api/generated-assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "preview-check",
            assessmentKey,
            answers: Object.fromEntries(
              attempt.questions.map((q) => [q.id, answers[q.id] ?? ""]),
            ),
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error);
        const graded = attempt.questions.map((question) => {
          const grade = payload.grades.find(
            (g: { id: string }) => g.id === question.id,
          );
          return {
            ...question,
            isCorrect: grade?.isCorrect,
            marksAwarded: grade?.marks ?? 0,
          };
        });
        const score = graded.reduce(
          (sum, question) => sum + (question.marksAwarded ?? 0),
          0,
        );
        setAttempt({
          ...attempt,
          status: "submitted",
          pending_review_marks: graded
            .filter((q) => q.isCorrect === null)
            .reduce((sum, q) => sum + q.marks, 0),
          score,
          percentage: Math.round((score / attempt.total_marks) * 100),
          questions: graded,
        });
        setConfirmSubmit(false);
        return;
      }
      await load();
      setIndex(0);
      return;
    }
    const run = async () => {
      setBusy(true);
      try {
        const response = await fetch("/api/generated-assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            assessmentKey,
            attemptId: attempt?.id,
            questionId: attempt?.questions[index]?.id,
            answers: answersRef.current,
          }),
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error ?? "Unable to update assessment.");
        setAttempt(payload.attempt);
        if (action === "start" || action === "retake") {
          onReview?.();
          setAnswers({});
          setIndex(0);
          autoSubmitted.current = false;
        }
        if (action === "submit") {
          setConfirmSubmit(false);
          onCompleted?.();
        }
      } finally {
        setBusy(false);
      }
    };
    const pending = requestQueue.current.then(run);
    requestQueue.current = pending.catch(() => {});
    await pending;
  };
  useEffect(() => {
    if (role !== "student" || attempt?.status !== "active") return;
    const timer = window.setTimeout(() => {
      void act("save").catch(() =>
        setError("Your latest answer could not be saved."),
      );
    }, 700);
    return () => window.clearTimeout(timer);
    // `act` intentionally follows the latest local answer state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, attempt?.id, attempt?.status, role]);
  useEffect(() => {
    if (
      role !== "student" ||
      attempt?.status !== "active" ||
      !attempt.deadline_at
    )
      return;
    const tick = () => {
      const deadline = new Date(attempt.deadline_at ?? 0).getTime();
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0 && !autoSubmitted.current) {
        autoSubmitted.current = true;
        void act("submit").catch((caught) => {
          autoSubmitted.current = false;
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to submit assessment.",
          );
        });
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
    // Submit the latest local answer state when the server deadline is reached.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.deadline_at, attempt?.id, attempt?.status, role]);

  const question = attempt?.questions[index];
  const navigate = (next: number) => {
    if (
      role === "student" &&
      question?.state !== "locked" &&
      responseHasContent(answers[question?.id ?? ""])
    )
      setNavigation(next);
    else setIndex(next);
  };
  const answered = useMemo(
    () => Object.values(answers).filter(responseHasContent).length,
    [answers],
  );
  const diagnosis = useMemo(() => {
    const rows = new Map<
      string,
      { marks: number; available: number; pending: number }
    >();
    for (const item of attempt?.questions ?? []) {
      const row = rows.get(item.subtopic) ?? {
        marks: 0,
        available: 0,
        pending: 0,
      };
      if (item.isCorrect === null) row.pending += item.marks;
      row.marks += item.marksAwarded ?? 0;
      row.available += item.marks;
      rows.set(item.subtopic, row);
    }
    return [...rows]
      .map(([subtopic, row]) => ({
        subtopic,
        ...row,
        percentage:
          row.available > row.pending
            ? Math.round((row.marks / (row.available - row.pending)) * 100)
            : null,
      }))
      .sort((a, b) => (a.percentage ?? 101) - (b.percentage ?? 101));
  }, [attempt]);
  if (loading)
    return (
      <div className="py-20 text-center text-sm text-zinc-500">
        Loading assessment…
      </div>
    );
  if (error && !attempt)
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        {error}
      </div>
    );
  if (!isUnlocked && role === "student" && !attempt)
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-semibold">Assessment locked</h2>
        <p className="mt-3 text-sm text-zinc-600">
          Complete every module in this chapter, then ask your tutor to unlock
          the assessment.
        </p>
      </div>
    );
  if (!attempt)
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h2 className="text-3xl font-semibold">Chapter assessment</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          15 questions · 4 Foundation · 7 Standard · 4 Stretch. Your exact paper
          is saved when you start.
        </p>
        <button
          onClick={() => void act("start").catch((e) => setError(e.message))}
          className="mt-7 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white"
        >
          Start assessment
        </button>
      </div>
    );
  if (attempt.status === "submitted") {
    const review = attempt.pending_review_marks ?? 0;
    return (
      <div className="py-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
            Attempt {attempt.attempt_number}
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            {attempt.score ?? 0} / {attempt.total_marks}
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            {review
              ? "Provisional result"
              : `${attempt.percentage ?? Math.round(((attempt.score ?? 0) / attempt.total_marks) * 100)}%`}
            {review ? ` · ${review} marks require review` : ""}
          </p>
          <button
            onClick={() =>
              void act(role === "tutor" ? "start" : "retake").catch((e) =>
                setError(e.message),
              )
            }
            className="mt-5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {role === "tutor" ? "New preview" : "Retake assessment"}
          </button>
          {role === "student" && onReview && (
            <button
              className="ml-3 mt-5 rounded-full border px-5 py-2.5 text-sm"
              onClick={() => onReview(attempt.id)}
            >
              Review with Arthur
            </button>
          )}
        </div>
        <section className="mt-8 rounded-2xl border border-zinc-200 p-5">
          <h3 className="font-semibold">Performance by subtopic</h3>
          <div className="mt-4 space-y-3">
            {diagnosis.map((row) => (
              <div
                key={row.subtopic}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span>{row.subtopic}</span>
                <span className="tabular-nums text-zinc-500">
                  {row.percentage === null
                    ? "Awaiting review"
                    : `${row.marks}/${row.available - row.pending} reviewed marks · ${row.percentage}%`}
                  {row.pending > 0 && ` · ${row.pending} marks pending`}
                </span>
              </div>
            ))}
          </div>
          {diagnosis[0] ? (
            <p className="mt-5 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
              {diagnosis[0].percentage === null
                ? "While your work is reviewed, continue practising "
                : "Recommended next step: practise "}
              <span className="font-semibold text-zinc-900">
                {diagnosis[0].subtopic}
              </span>
              .{" "}
              {onPractice && (
                <button
                  className="underline"
                  onClick={() => onPractice(diagnosis[0].subtopic)}
                >
                  Start targeted practice
                </button>
              )}
            </p>
          ) : null}
        </section>
        <div className="mt-9 space-y-4">
          {attempt.questions.map((q) => (
            <article
              key={q.id}
              className="rounded-2xl border border-zinc-200 p-5"
            >
              <div className="flex justify-between gap-4">
                <p className="text-sm font-semibold">
                  Question {q.order} · {q.subtopic}
                </p>
                <span className="text-xs text-zinc-500">
                  {q.isCorrect === null
                    ? "Pending review"
                    : `${q.marksAwarded ?? 0}/${q.marks}`}
                </span>
              </div>
              <BankQuestion
                question={q}
                value={q.response?.value ?? answers[q.id] ?? ""}
                readOnly
                onChange={() => {}}
              />
              <p className="mt-3 text-sm">
                <span className="font-semibold">Expected answer:</span>{" "}
                <MathPrompt value={q.answer ?? ""} />
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                <MathPrompt value={q.worked_solution ?? ""} />
              </p>
            </article>
          ))}
        </div>
      </div>
    );
  }
  if (!question)
    return (
      <div className="py-16 text-center text-sm text-rose-700">
        This paper is incomplete and cannot be displayed.
      </div>
    );
  return (
    <div className="mx-auto min-w-0 max-w-3xl">
      <QuestionSessionHeader number={index+1} total={15} detail={<>{answered} answered · {role === "tutor" ? "Untimed preview" : `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")} remaining`}</>} />
      <BankQuestion
        key={question.id}
        questionNumber={index+1}
        readOnly={question.state === "locked"}
        question={question}
        value={answers[question.id] ?? ""}
        onChange={(value) =>
          setAnswers((current) => ({ ...current, [question.id]: value }))
        }
      />
      <div className="border-t border-zinc-200 py-5">
        <div className="flex flex-wrap justify-center gap-1.5">
          {attempt.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => navigate(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${i === index ? "border-zinc-900 bg-zinc-900 text-white" : responseHasContent(answers[q.id]) ? "border-zinc-400 bg-zinc-100" : "border-zinc-200"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-between">
          <button
            disabled={!index}
            onClick={() => navigate(Math.max(0, index - 1))}
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          {index < 14 ? (
            <button
              onClick={() => navigate(Math.min(14, index + 1))}
              className="rounded-full bg-zinc-950 px-5 py-2 text-sm text-white"
            >
              Next question
            </button>
          ) : (
            <button
              onClick={() => setConfirmSubmit(true)}
              className="rounded-full bg-zinc-950 px-5 py-2 text-sm text-white"
            >
              Submit assessment
            </button>
          )}
        </div>
      </div>
      {navigation !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm answer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
        >
          <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6">
            <h3 className="text-xl font-semibold">Confirm this answer?</h3>
            <p className="mt-3 text-sm">
              Once confirmed, this answer is saved and cannot be edited.
            </p>
            <BankQuestion
              question={question}
              value={answers[question.id] ?? ""}
              readOnly
              onChange={() => {}}
            />
            <div className="flex gap-3">
              <button
                className="rounded-full border px-4 py-2 text-sm"
                onClick={() => setNavigation(null)}
              >
                Keep editing
              </button>
              <button
                disabled={busy}
                className="rounded-full bg-zinc-950 px-4 py-2 text-sm text-white disabled:opacity-40"
                onClick={() =>
                  void act("lock")
                    .then(() => {
                      setIndex(navigation);
                      setNavigation(null);
                    })
                    .catch((e) => setError(e.message))
                }
              >
                Confirm answer
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
        </div>
      ) : null}
      {confirmSubmit ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-xl font-semibold">Submit this assessment?</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              You answered {answered} of 15 questions. Submission locks this
              attempt.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setConfirmSubmit(false)}
                className="flex-1 rounded-full border px-4 py-2 text-sm"
              >
                Keep working
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  void act("submit").catch((e) => setError(e.message))
                }
                className="flex-1 rounded-full bg-zinc-950 px-4 py-2 text-sm text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {error ? <p className="mb-4 text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
