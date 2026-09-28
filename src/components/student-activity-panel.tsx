"use client";
import { useEffect, useRef, useState } from "react";
import type { UserAccessProfile } from "@/types/auth";
import { TutorAssessmentAccess } from "./tutor-assessment-access";
import { BankMath, BankQuestion } from "./bank-question";

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function assessmentTitle(value: string) {
  return value
    .split(":")
    .map(titleCase)
    .join(" · ");
}
type Activity = {
  student_id: string;
  page_title: string;
  mode: string;
  last_seen_at: string;
};
type Practice = {
  id: string;
  subtopic: string;
  course_topic_key: string;
  status: string;
  created_at: string;
  completed_at?: string | null;
  practice_session_questions: {
    checked_at: string | null;
    requires_review: boolean;
  }[];
};
type Attempt = {
  id: string;
  assessment_key: string;
  status: string;
  score: number | null;
  total_marks: number;
  pending_review_marks: number;
  started_at: string;
  submitted_at?: string | null;
};
type Answer = {
  question_id: string;
  question_order?: number;
  response: string;
  checked_at: string | null;
  requires_review: boolean;
  marks_awarded?: number | null;
  is_correct?: boolean | null;
  review_status?: "not_required" | "pending" | "completed";
  reviewed_at?: string | null;
  assessment_question_bank: {
    prompt: string;
    subtopic: string;
    marks: number;
    answer?: string;
    worked_solution?: string;
  };
};

function answerState(answer: Answer) {
  if (answer.requires_review) return "review" as const;
  if (!answer.checked_at) return "draft" as const;
  const marks = answer.marks_awarded ?? 0;
  if (answer.is_correct === true || marks >= answer.assessment_question_bank.marks)
    return "correct" as const;
  if (marks > 0) return "partial" as const;
  return "incorrect" as const;
}

function answerStateClass(state: ReturnType<typeof answerState>) {
  if (state === "correct")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (state === "partial" || state === "review")
    return "border-amber-200 bg-amber-50 text-amber-700";
  if (state === "incorrect")
    return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-zinc-200 bg-zinc-100 text-zinc-600";
}
export function StudentActivityPanel({
  students,
  studentId,
  onAssessmentAttemptCleared,
}: {
  students: UserAccessProfile[];
  studentId: string;
  onAssessmentAttemptCleared?: () => void;
}) {
  const [data, setData] = useState<{
      activity: Activity[];
      practice: Practice[];
      assessments: Attempt[];
      asOf: string;
    } | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [answers, setAnswers] = useState<Answer[] | null>(null),
    [answerError, setAnswerError] = useState(""),
    [reviewLoading, setReviewLoading] = useState(false),
    [reviewSaving, setReviewSaving] = useState(false),
    [reviewIndex, setReviewIndex] = useState(0),
    [reviewTitle, setReviewTitle] = useState(""),
    [reviewDate, setReviewDate] = useState<string | null>(null),
    [reviewTarget, setReviewTarget] = useState<{ id: string; kind: "sessionId" | "attemptId" } | null>(null),
    [reviewMarks, setReviewMarks] = useState(0),
    [clearConfirmation, setClearConfirmation] = useState(false),
    [clearingAttempt, setClearingAttempt] = useState(false);
  const reviewVersion = useRef(0);
  useEffect(() => {
    if (!studentId) {
      setData(null);
      setAnswers(null);
      return;
    }
    let disposed = false;
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending || document.visibilityState !== "visible") return;
      pending = true;
      try {
        const r = await fetch(
          `/api/student-progress?studentId=${encodeURIComponent(studentId)}`,
          { signal: controller.signal },
        );
        const result = await r.json();
        if (!r.ok) throw Error(result.error);
        if (!disposed) {
          setData(result);
          setError("");
        }
      } catch (e) {
        if (!disposed)
          setError(e instanceof Error ? e.message : "Unable to load progress.");
      } finally {
        pending = false;
      }
    }
    setData(null);
    setAnswers(null);
    setReviewLoading(false);
    setReviewIndex(0);
    setReviewTitle("");
    setReviewDate(null);
    setReviewTarget(null);
    setClearConfirmation(false);
    setAnswerError("");
    reviewVersion.current += 1;
    void refresh();
    const timer = setInterval(() => void refresh(), 30000);
    const visible = () => void refresh();
    document.addEventListener("visibilitychange", visible);
    return () => {
      disposed = true;
      reviewVersion.current += 1;
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [studentId, retry]);
  const review = async (
    id: string,
    title: string,
    kind: "sessionId" | "attemptId" = "sessionId",
  ) => {
    const version = ++reviewVersion.current;
    setAnswers(null);
    setReviewLoading(true);
    setReviewIndex(0);
    setReviewTitle(title);
    setReviewTarget({ id, kind });
    setReviewDate(null);
    setClearConfirmation(false);
    setAnswerError("");
    try {
      const r = await fetch(
        `/api/student-progress?studentId=${encodeURIComponent(studentId)}&${kind}=${encodeURIComponent(id)}`,
      );
      const d = await r.json();
      if (version !== reviewVersion.current) return;
      if (!r.ok) throw Error(d.error);
      setAnswers(d.answers);
      setReviewDate(d.attemptedAt ?? null);
    } catch (e) {
      if (version !== reviewVersion.current) return;
      setAnswerError(
        e instanceof Error ? e.message : "Unable to load answers.",
      );
    } finally {
      if (version === reviewVersion.current) setReviewLoading(false);
    }
  };
  const selectedActivity = data?.activity.find(
    (activity) => activity.student_id === studentId,
  );
  const reviewedAnswer = answers?.[reviewIndex];
  const reviewedState = reviewedAnswer ? answerState(reviewedAnswer) : null;
  useEffect(() => {
    setReviewMarks(Number(reviewedAnswer?.marks_awarded ?? 0));
  }, [reviewedAnswer?.question_id, reviewedAnswer?.marks_awarded]);
  const completeReview = async () => {
    if (!reviewedAnswer || !reviewTarget) return;
    setReviewSaving(true);
    setAnswerError("");
    try {
      const response = await fetch("/api/student-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete-review",
          studentId,
          questionId: reviewedAnswer.question_id,
          marks: reviewMarks,
          [reviewTarget.kind]: reviewTarget.id,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      setAnswers((current) => current?.map((answer) =>
        answer.question_id === reviewedAnswer.question_id
          ? {
              ...answer,
              marks_awarded: reviewMarks,
              is_correct: reviewMarks === answer.assessment_question_bank.marks,
              requires_review: false,
              review_status: "completed",
              reviewed_at: result.reviewedAt,
            }
          : answer,
      ) ?? null);
      setRetry((value) => value + 1);
    } catch (caught) {
      setAnswerError(caught instanceof Error ? caught.message : "Unable to complete review.");
    } finally {
      setReviewSaving(false);
    }
  };
  const clearAssessmentAttempt = async () => {
    if (!reviewTarget || reviewTarget.kind !== "attemptId") return;
    setClearingAttempt(true);
    setAnswerError("");
    try {
      const response = await fetch("/api/student-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear-assessment-attempt",
          studentId,
          attemptId: reviewTarget.id,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      reviewVersion.current += 1;
      setAnswers(null);
      setReviewTitle("");
      setReviewDate(null);
      setReviewTarget(null);
      setClearConfirmation(false);
      setRetry((value) => value + 1);
      onAssessmentAttemptCleared?.();
    } catch (caught) {
      setAnswerError(caught instanceof Error ? caught.message : "Unable to clear assessment attempt.");
    } finally {
      setClearingAttempt(false);
    }
  };
  return (
    <section className="mb-6 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
      <div className="border-b border-zinc-200/80 bg-[linear-gradient(135deg,rgba(244,244,245,0.96),rgba(255,255,255,1))] p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 shadow-sm" aria-hidden="true">
            SA
          </span>
          <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">Tutor Workspace</p>
          <h2 className="mt-1 text-xl font-medium tracking-[-0.025em] text-zinc-950">
            Student Activity
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Live learning signals and saved work, refreshed every 30 seconds.
          </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRetry((n) => n + 1)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          <span aria-hidden="true">↻</span>
          Refresh
        </button>
      </div>
      </div>
      <div className="p-4 md:p-6">
      {!students.length ? (
        <p className="text-sm text-zinc-500">Your students will appear here after joining.</p>
      ) : !studentId ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-center text-sm text-zinc-500">Select a student at the top of the dashboard.</p>
      ) : null}
      {error && (
        <p role="alert" className="mt-4 text-sm text-rose-700">
          {error} Displayed information may be out of date.
        </p>
      )}
      {data && (
        <>
        <div className="mt-6 grid grid-cols-3 divide-x divide-zinc-200 rounded-2xl border border-zinc-200 bg-zinc-50/70 py-4 text-center">
          <div><p className="text-xl font-medium text-zinc-950">{data.practice.length}</p><p className="mt-1 text-[11px] text-zinc-500">Practice Runs</p></div>
          <div><p className="text-xl font-medium text-zinc-950">{data.assessments.length}</p><p className="mt-1 text-[11px] text-zinc-500">Assessments</p></div>
          <div><p className="truncate px-2 text-sm font-medium text-zinc-950">{selectedActivity ? titleCase(selectedActivity.mode) : "—"}</p><p className="mt-1 text-[11px] text-zinc-500">Latest Mode</p></div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 p-4">
            <h3 className="text-sm font-medium text-zinc-950">Recent Practice</h3>
            {!data.practice.length && (
              <p className="mt-3 text-sm text-zinc-500">
                No practice recorded yet.
              </p>
            )}
            {data.practice.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  void review(
                    p.id,
                    p.subtopic || titleCase(p.course_topic_key),
                  )
                }
                className="group mt-3 block w-full rounded-xl border border-zinc-200 bg-white p-3 text-left text-sm transition hover:border-zinc-300 hover:bg-zinc-50/70"
              >
                <span className="font-medium">
                  {p.subtopic || p.course_topic_key}
                </span>
                <span className="mt-1 block text-xs text-zinc-500">
                  {p.status === "active" ? "In progress" : "Finished"} ·{" "}
                  {
                    p.practice_session_questions.filter((q) => q.checked_at)
                      .length
                  }{" "}
                  checked ·{" "}
                  {
                    p.practice_session_questions.filter(
                      (q) => q.requires_review,
                    ).length
                  }{" "}
                  awaiting review
                </span>
                <span className="mt-1 block text-xs text-zinc-400">
                  {new Date(p.completed_at ?? p.created_at).toLocaleString()}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-700">
                  Review Marked Questions <span className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </button>
            ))}
          </section>
          <section className="rounded-2xl border border-zinc-200 p-4">
            <h3 className="text-sm font-medium text-zinc-950">Recent Assessments</h3>
            {!data.assessments.length && (
              <p className="mt-3 text-sm text-zinc-500">
                No assessments recorded yet.
              </p>
            )}
            {data.assessments.map((a) => (
              <button
                onClick={() =>
                  void review(
                    a.id,
                    assessmentTitle(a.assessment_key),
                    "attemptId",
                  )
                }
                key={a.id}
                className="group mt-3 block w-full rounded-xl border border-zinc-200 bg-white p-3 text-left text-sm transition hover:border-zinc-300 hover:bg-zinc-50/70"
              >
                <p className="font-medium">
                  {assessmentTitle(a.assessment_key)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {a.status === "active"
                    ? "In progress"
                    : `${a.score ?? 0}/${a.total_marks} marks${a.pending_review_marks ? ` · provisional, ${a.pending_review_marks} marks awaiting review` : ""}`}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {new Date(a.started_at).toLocaleString()}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-700">
                  Review Marked Questions <span className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </button>
            ))}
          </section>
        </div>
        </>
      )}
      {answerError && (
        <p role="alert" className="mt-4 text-sm text-rose-700">
          {answerError}
        </p>
      )}
      {reviewLoading && (
        <div
          role="status"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 text-sm text-zinc-600"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" aria-hidden="true" />
          Loading Marked Questions…
        </div>
      )}
      {answers && !reviewedAnswer && (
        <section className="mt-6 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50/70 p-5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">Assessment Attempt</p>
              <h3 className="mt-1 font-medium text-zinc-950">{reviewTitle}</h3>
              {reviewDate ? <p className="mt-1 text-xs text-zinc-500">Started {new Date(reviewDate).toLocaleString()}</p> : null}
            </div>
            <button type="button" onClick={() => { setAnswers(null); setReviewTarget(null); }} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">Close</button>
          </div>
          <div className="p-5 text-center sm:p-8">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500">—</span>
            <h4 className="mt-4 font-medium text-zinc-900">No questions were saved for this attempt</h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">This can happen with an interrupted or older assessment attempt. Clear it to let the student start a clean attempt.</p>
            {reviewTarget?.kind === "attemptId" ? (
              clearConfirmation ? (
                <div className="mx-auto mt-5 max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left">
                  <p className="text-sm font-medium text-rose-800">Permanently clear this attempt?</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" disabled={clearingAttempt} onClick={() => setClearConfirmation(false)} className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700">Cancel</button>
                    <button type="button" disabled={clearingAttempt} onClick={() => void clearAssessmentAttempt()} className="rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-60">{clearingAttempt ? "Clearing…" : "Clear attempt"}</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setClearConfirmation(true)} className="mt-5 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50">Clear attempt</button>
              )
            ) : null}
          </div>
        </section>
      )}
      {answers && reviewedAnswer && (
        <section className="mt-6 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">Marked Review</p>
              <h3 className="mt-1 font-medium text-zinc-950">{reviewTitle}</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Question {reviewIndex + 1} of {answers.length}
              </p>
              {reviewDate ? (
                <p className="mt-1 text-xs font-medium text-zinc-500">
                  Attempted {new Date(reviewDate).toLocaleString()}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              {reviewTarget?.kind === "attemptId" ? (
                <button
                  type="button"
                  className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                  onClick={() => setClearConfirmation(true)}
                >
                  Clear attempt
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                onClick={() => {
                  reviewVersion.current += 1;
                  setAnswers(null);
                  setReviewTitle("");
                  setReviewTarget(null);
                  setClearConfirmation(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
          {clearConfirmation ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:px-5">
              <div>
                <p className="font-medium">Clear this assessment attempt?</p>
                <p className="mt-0.5 text-xs text-rose-700">The saved answers and result for this attempt will be permanently removed. The student can then begin again.</p>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={clearingAttempt} onClick={() => setClearConfirmation(false)} className="rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700">Cancel</button>
                <button type="button" disabled={clearingAttempt} onClick={() => void clearAssessmentAttempt()} className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3.5 py-2 text-xs font-medium text-white disabled:cursor-wait disabled:opacity-60">
                  {clearingAttempt ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
                  {clearingAttempt ? "Clearing…" : "Clear attempt"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-400">
                Question {reviewIndex + 1}
              </p>
              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  reviewedState
                    ? answerStateClass(reviewedState)
                    : "border-zinc-200 bg-zinc-100 text-zinc-600",
                ].join(" ")}
              >
                {reviewedState === "review"
                  ? "Awaiting Tutor Review"
                  : reviewedState === "draft"
                    ? "Draft · Not Checked"
                    : reviewedAnswer.checked_at
                    ? `${reviewedAnswer.marks_awarded ?? 0}/${reviewedAnswer.assessment_question_bank.marks} Marks`
                    : "Not Checked"}
              </span>
            </div>
            <div key={reviewedAnswer.question_id}>
              <div
                className={[
                  "mt-4 flex items-center gap-3 rounded-2xl border p-4",
                  reviewedState === "correct"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : reviewedState === "incorrect"
                      ? "border-rose-200 bg-rose-50 text-rose-800"
                      : reviewedState === "partial" || reviewedState === "review"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700",
                ].join(" ")}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-current bg-white text-lg font-medium" aria-hidden="true">
                  {reviewedState === "correct" ? "✓" : reviewedState === "incorrect" ? "×" : reviewedState === "partial" ? "½" : "…"}
                </span>
                <div>
                  <p className="font-medium">
                    {reviewedState === "correct"
                      ? "Correct answer"
                      : reviewedState === "incorrect"
                        ? "Incorrect answer"
                        : reviewedState === "partial"
                          ? "Partially correct"
                          : reviewedState === "review"
                            ? "Needs tutor review"
                            : "Not checked"}
                  </p>
                  <p className="mt-0.5 text-xs opacity-80">
                    {reviewedAnswer.marks_awarded ?? 0}/{reviewedAnswer.assessment_question_bank.marks} marks awarded
                  </p>
                </div>
              </div>
              {reviewedState === "review" ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">Award marks and complete this review</p>
                      <p className="mt-1 text-xs text-zinc-600">This final mark will be visible to the student and removed from your pending queue.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex rounded-full border border-amber-200 bg-white p-1 shadow-sm" aria-label="Marks awarded">
                        {Array.from({ length: reviewedAnswer.assessment_question_bank.marks + 1 }, (_, mark) => (
                          <button
                            type="button"
                            key={mark}
                            onClick={() => setReviewMarks(mark)}
                            aria-pressed={reviewMarks === mark}
                            className={[
                              "flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-medium transition",
                              reviewMarks === mark ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100",
                            ].join(" ")}
                          >
                            {mark}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={reviewSaving}
                        onClick={() => void completeReview()}
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60"
                      >
                        {reviewSaving ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <span aria-hidden="true">✓</span>}
                        {reviewSaving ? "Saving review…" : "Complete review"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : reviewedAnswer.review_status === "completed" && reviewedAnswer.reviewed_at ? (
                <p className="mt-3 text-xs font-medium text-zinc-500">
                  Tutor review completed {new Date(reviewedAnswer.reviewed_at).toLocaleString()}
                </p>
              ) : null}
              <BankQuestion
                question={{
                  id: reviewedAnswer.question_id,
                  ...reviewedAnswer.assessment_question_bank,
                }}
                questionNumber={reviewIndex + 1}
                value={reviewedAnswer.response}
                readOnly
                onChange={() => {}}
              />
              {(reviewedAnswer.assessment_question_bank.answer ||
                reviewedAnswer.assessment_question_bank.worked_solution) && (
                <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-sm leading-7 text-zinc-700">
                  {reviewedAnswer.assessment_question_bank.answer && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">Expected Answer</p>
                      <BankMath value={reviewedAnswer.assessment_question_bank.answer} />
                    </div>
                  )}
                  {reviewedAnswer.assessment_question_bank.worked_solution && (
                    <div className="border-t border-zinc-200 pt-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">Worked Solution</p>
                      <BankMath value={reviewedAnswer.assessment_question_bank.worked_solution} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-5 border-t border-zinc-200 pt-5">
              <div className="flex flex-wrap justify-center gap-1.5">
                {answers.map((answer, answerIndex) => (
                  <button
                    key={answer.question_id}
                    type="button"
                    aria-label={`Review question ${answerIndex + 1}`}
                    onClick={() => setReviewIndex(answerIndex)}
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition",
                      answerStateClass(answerState(answer)),
                      answerIndex === reviewIndex
                        ? "ring-2 ring-zinc-900 ring-offset-2"
                        : "",
                    ].join(" ")}
                  >
                    {answerIndex + 1}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex justify-between gap-3">
                <button
                  type="button"
                  disabled={reviewIndex === 0}
                  onClick={() => setReviewIndex((index) => Math.max(0, index - 1))}
                  className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={reviewIndex === answers.length - 1}
                  onClick={() =>
                    setReviewIndex((index) =>
                      Math.min(answers.length - 1, index + 1),
                    )
                  }
                  className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-40"
                >
                  Next Question
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
      <TutorAssessmentAccess studentId={studentId} />
      {data && (
        <p className="mt-5 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
          Last refreshed {new Date(data.asOf).toLocaleTimeString()}. An open
          page does not confirm that a student is actively studying.
        </p>
      )}
      </div>
    </section>
  );
}
