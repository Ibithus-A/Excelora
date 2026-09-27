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
};
type Answer = {
  question_id: string;
  question_order?: number;
  response: string;
  checked_at: string | null;
  requires_review: boolean;
  marks_awarded?: number | null;
  is_correct?: boolean | null;
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
  onSelectStudent,
}: {
  students: UserAccessProfile[];
  studentId: string;
  onSelectStudent?: (id: string) => void;
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
    [reviewIndex, setReviewIndex] = useState(0),
    [reviewTitle, setReviewTitle] = useState("");
  const reviewVersion = useRef(0);
  useEffect(() => {
    if (!studentId) return;
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
    kind = "sessionId",
  ) => {
    const version = ++reviewVersion.current;
    setAnswers(null);
    setReviewLoading(true);
    setReviewIndex(0);
    setReviewTitle(title);
    setAnswerError("");
    try {
      const r = await fetch(
        `/api/student-progress?studentId=${encodeURIComponent(studentId)}&${kind}=${encodeURIComponent(id)}`,
      );
      const d = await r.json();
      if (version !== reviewVersion.current) return;
      if (!r.ok) throw Error(d.error);
      setAnswers(d.answers);
    } catch (e) {
      if (version !== reviewVersion.current) return;
      setAnswerError(
        e instanceof Error ? e.message : "Unable to load answers.",
      );
    } finally {
      if (version === reviewVersion.current) setReviewLoading(false);
    }
  };
  const selectedStudent = students.find((student) => student.id === studentId);
  const selectedActivity = data?.activity.find(
    (activity) => activity.student_id === studentId,
  );
  const reviewedAnswer = answers?.[reviewIndex];
  const reviewedState = reviewedAnswer ? answerState(reviewedAnswer) : null;
  return (
    <section className="mb-6 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
      <div className="border-b border-zinc-200/80 bg-[linear-gradient(135deg,rgba(244,244,245,0.96),rgba(255,255,255,1))] p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 shadow-sm" aria-hidden="true">
            SA
          </span>
          <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Tutor Workspace</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-zinc-950">
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
        <p className="mt-5 text-sm text-zinc-500">
          Your students will appear here after joining.
        </p>
      ) : (
        <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
          {students.map((student) => {
            const activity = data?.activity.find(
              (a) => a.student_id === student.id,
            );
            return (
              <button
                key={student.id}
                onClick={() => onSelectStudent?.(student.id)}
                aria-pressed={studentId === student.id}
                className={[
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-sm transition",
                  studentId === student.id
                    ? "border-zinc-300 bg-zinc-50 shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/70",
                ].join(" ")}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold uppercase text-white">
                  {student.name.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-zinc-900">{student.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">
                  {activity ? (
                    <>
                      {activity.mode === "video" ? "Video Page" : titleCase(activity.mode)}{" "}
                      · {activity.page_title}
                    </>
                  ) : data ? (
                    "No activity recorded yet"
                  ) : (
                    "Loading…"
                  )}
                  </span>
                </span>
                <span className={[
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  activity ? "bg-emerald-500" : "bg-zinc-200",
                ].join(" ")} aria-label={activity ? "Activity recorded" : "No activity recorded"} />
              </button>
            );
          })}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-rose-700">
          {error} Displayed information may be out of date.
        </p>
      )}
      {data && (
        <>
        <div className="mt-6 grid grid-cols-3 divide-x divide-zinc-200 rounded-2xl border border-zinc-200 bg-zinc-50/70 py-4 text-center">
          <div><p className="text-xl font-semibold text-zinc-950">{data.practice.length}</p><p className="mt-1 text-[11px] text-zinc-500">Practice Runs</p></div>
          <div><p className="text-xl font-semibold text-zinc-950">{data.assessments.length}</p><p className="mt-1 text-[11px] text-zinc-500">Assessments</p></div>
          <div><p className="truncate px-2 text-sm font-semibold text-zinc-950">{selectedActivity ? titleCase(selectedActivity.mode) : "—"}</p><p className="mt-1 text-[11px] text-zinc-500">Latest Mode</p></div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 p-4">
            <h3 className="text-sm font-semibold text-zinc-950">
              Recent Practice · {selectedStudent?.name}
            </h3>
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
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-700">
                  Review Marked Questions <span className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </button>
            ))}
          </section>
          <section className="rounded-2xl border border-zinc-200 p-4">
            <h3 className="text-sm font-semibold text-zinc-950">Recent Assessments</h3>
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
      {answers && reviewedAnswer && (
        <section className="mt-6 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Marked Review</p>
              <h3 className="mt-1 font-semibold text-zinc-950">{reviewTitle}</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Question {reviewIndex + 1} of {answers.length} · {selectedStudent?.name}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
              onClick={() => {
                reviewVersion.current += 1;
                setAnswers(null);
                setReviewTitle("");
              }}
            >
              Close
            </button>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-zinc-400">
                Question {reviewIndex + 1}
              </p>
              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-semibold",
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
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-current bg-white text-lg font-semibold" aria-hidden="true">
                  {reviewedState === "correct" ? "✓" : reviewedState === "incorrect" ? "×" : reviewedState === "partial" ? "½" : "…"}
                </span>
                <div>
                  <p className="font-semibold">
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
