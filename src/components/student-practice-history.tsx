"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BankMath, BankQuestion } from "./bank-question";

type SessionSummary = {
  id: string;
  subtopic: string;
  course_topic_key: string;
  status: string;
  created_at: string;
  completed_at?: string | null;
  practice_session_questions: Array<{
    checked_at: string | null;
    marks_awarded: number;
    is_correct: boolean | null;
    requires_review: boolean;
    assessment_question_bank: { marks: number } | Array<{ marks: number }> | null;
  }>;
};

type SavedAnswer = {
  question_id: string;
  question_order?: number;
  response: string;
  checked_at: string | null;
  marks_awarded: number;
  is_correct: boolean | null;
  requires_review: boolean;
  review_status?: "not_required" | "pending" | "completed";
  assessment_question_bank: {
    prompt: string;
    subtopic: string;
    marks: number;
    answer?: string;
    worked_solution?: string;
  };
};

function titleCase(value: string) {
  return value
    .replace(/[-_:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function isCorrect(answer: SavedAnswer) {
  return (
    Boolean(answer.checked_at) &&
    (answer.is_correct === true ||
      Number(answer.marks_awarded) >= Number(answer.assessment_question_bank.marks))
  );
}

function answerState(answer: SavedAnswer) {
  if (!answer.checked_at) return "draft" as const;
  if (answer.requires_review || answer.is_correct === null) return "review" as const;
  return isCorrect(answer) ? "correct" as const : "incorrect" as const;
}

function sessionResult(session: SessionSummary) {
  const checked = session.practice_session_questions.filter((item) => item.checked_at);
  const correct = checked.filter((item) => {
    const bank = Array.isArray(item.assessment_question_bank)
      ? item.assessment_question_bank[0]
      : item.assessment_question_bank;
    return item.is_correct === true || Number(item.marks_awarded) >= Number(bank?.marks ?? 1);
  });
  return { checked: checked.length, correct: correct.length };
}

export function StudentPracticeHistory() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<SavedAnswer[] | null>(null);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewDate, setReviewDate] = useState<string | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const requestVersion = useRef(0);

  const loadPage = useCallback(async (offset: number) => {
    const append = offset > 0;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/student-progress?view=practice-history&offset=${offset}`,
      );
      const payload = await response.json();
      if (!response.ok) throw Error(payload.error ?? "Unable to load practice history.");
      setSessions((current) => append ? [...current, ...(payload.practice ?? [])] : payload.practice ?? []);
      setTotal(Number(payload.total ?? 0));
      setHasMore(Boolean(payload.hasMore));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load practice history.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  const openSession = async (session: SessionSummary) => {
    const version = ++requestVersion.current;
    setReviewLoading(true);
    setAnswers(null);
    setReviewIndex(0);
    setReviewTitle(session.subtopic || titleCase(session.course_topic_key));
    setReviewDate(session.completed_at ?? session.created_at);
    setError("");
    try {
      const response = await fetch(
        `/api/student-progress?sessionId=${encodeURIComponent(session.id)}`,
      );
      const payload = await response.json();
      if (version !== requestVersion.current) return;
      if (!response.ok) throw Error(payload.error ?? "Unable to open this practice session.");
      setAnswers(payload.answers ?? []);
      setReviewDate(payload.attemptedAt ?? session.completed_at ?? session.created_at);
    } catch (caught) {
      if (version !== requestVersion.current) return;
      setError(caught instanceof Error ? caught.message : "Unable to open this practice session.");
    } finally {
      if (version === requestVersion.current) setReviewLoading(false);
    }
  };

  const closeReview = () => {
    requestVersion.current += 1;
    setAnswers(null);
    setReviewLoading(false);
    setReviewTitle("");
    setReviewDate(null);
    setReviewIndex(0);
  };

  const answer = answers?.[reviewIndex] ?? null;
  const reviewedState = answer ? answerState(answer) : null;

  return (
    <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
      <div className="border-b border-zinc-200/80 bg-[linear-gradient(135deg,rgba(244,244,245,0.96),rgba(255,255,255,1))] p-5 md:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">Saved Work</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-zinc-950">Practice History</h2>
            <p className="mt-1 text-sm text-zinc-500">Review every saved session, answer and worked solution from one place.</p>
          </div>
          {!loading ? <span className="text-xs text-zinc-500">{total} session{total === 1 ? "" : "s"}</span> : null}
        </div>
      </div>

      <div className="p-5 md:p-6">
        {error ? <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        {loading ? (
          <div role="status" className="flex items-center gap-3 py-8 text-sm text-zinc-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-800" />
            Loading practice history…
          </div>
        ) : sessions.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {sessions.map((session) => {
              const result = sessionResult(session);
              return (
                <button
                  type="button"
                  key={session.id}
                  onClick={() => void openSession(session)}
                  className="group rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-zinc-900">{session.subtopic || titleCase(session.course_topic_key)}</span>
                      <span className="mt-1 block text-xs text-zinc-500">{new Date(session.completed_at ?? session.created_at).toLocaleString()}</span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-zinc-500 group-hover:text-zinc-900">Review →</span>
                  </span>
                  <span className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1">{result.checked} checked</span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">{result.correct} correct</span>
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">{session.status === "active" ? "In progress" : "Finished"}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500">Your practice sessions will appear here after you begin practising.</div>
        )}

        {hasMore ? (
          <div className="mt-5 flex justify-center">
            <button type="button" disabled={loadingMore} onClick={() => void loadPage(sessions.length)} className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50">
              {loadingMore ? "Loading…" : "Load more sessions"}
            </button>
          </div>
        ) : null}

        {reviewLoading ? (
          <div role="status" className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-800" />
            Opening saved answers…
          </div>
        ) : null}

        {answers && (
          <section className="mt-6 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50/70 p-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">Practice Review</p>
                <h3 className="mt-1 font-medium text-zinc-950">{reviewTitle}</h3>
                <p className="mt-1 text-xs text-zinc-500">{answers.length ? `Question ${reviewIndex + 1} of ${answers.length}` : "No saved questions"}{reviewDate ? ` · ${new Date(reviewDate).toLocaleString()}` : ""}</p>
              </div>
              <button type="button" onClick={closeReview} className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50">Close</button>
            </div>

            {answer ? (
              <div className="p-5">
                <div className={[
                  "flex items-center gap-3 rounded-2xl border p-4",
                  reviewedState === "draft"
                    ? "border-zinc-200 bg-zinc-50 text-zinc-700"
                    : reviewedState === "correct"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : reviewedState === "incorrect"
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : "border-amber-200 bg-amber-50 text-amber-800",
                ].join(" ")}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-current bg-white text-lg" aria-hidden="true">{reviewedState === "draft" ? "—" : reviewedState === "correct" ? "✓" : reviewedState === "incorrect" ? "×" : "•"}</span>
                  <div>
                    <p className="font-medium">{reviewedState === "draft" ? "Draft answer" : reviewedState === "correct" ? "Correct answer" : reviewedState === "incorrect" ? "Incorrect answer" : "Saved for tutor oversight"}</p>
                    <p className="mt-0.5 text-xs opacity-80">{reviewedState === "draft" ? "This answer was not submitted for marking." : reviewedState === "review" ? "This response has not been marked wrong." : `${answer.marks_awarded}/${answer.assessment_question_bank.marks} marks awarded`}</p>
                  </div>
                </div>

                <BankQuestion question={{ id: answer.question_id, ...answer.assessment_question_bank }} questionNumber={reviewIndex + 1} value={answer.response} readOnly onChange={() => {}} />

                {answer.checked_at && (answer.assessment_question_bank.answer || answer.assessment_question_bank.worked_solution) ? (
                  <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-sm leading-7 text-zinc-700">
                    {answer.assessment_question_bank.answer ? <div><p className="mb-1 text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">Expected Answer</p><BankMath value={answer.assessment_question_bank.answer} /></div> : null}
                    {answer.assessment_question_bank.worked_solution ? <div className="border-t border-zinc-200 pt-4"><p className="mb-1 text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">Worked Solution</p><BankMath value={answer.assessment_question_bank.worked_solution} /></div> : null}
                  </div>
                ) : null}

                <div className="mt-5 border-t border-zinc-200 pt-5">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {answers.map((item, itemIndex) => (
                      <button key={`${item.question_id}-${itemIndex}`} type="button" onClick={() => setReviewIndex(itemIndex)} aria-label={`Review question ${itemIndex + 1}`} className={[
                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition",
                        answerState(item) === "draft" ? "border-zinc-200 bg-zinc-100 text-zinc-500" : answerState(item) === "correct" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : answerState(item) === "incorrect" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700",
                        itemIndex === reviewIndex ? "ring-2 ring-zinc-900 ring-offset-2" : "",
                      ].join(" ")}>{itemIndex + 1}</button>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-between gap-3">
                    <button type="button" disabled={reviewIndex === 0} onClick={() => setReviewIndex((current) => Math.max(0, current - 1))} className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40">Previous</button>
                    <button type="button" disabled={reviewIndex >= answers.length - 1} onClick={() => setReviewIndex((current) => Math.min(answers.length - 1, current + 1))} className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white disabled:opacity-40">Next Question</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-zinc-500">No questions were saved in this session.</div>
            )}
          </section>
        )}
      </div>
    </section>
  );
}
