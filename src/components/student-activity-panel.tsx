"use client";
import { useEffect, useRef, useState } from "react";
import type { UserAccessProfile } from "@/types/auth";
import { TutorAssessmentAccess } from "./tutor-assessment-access";
import { BankQuestion } from "./bank-question";
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
  response: string;
  checked_at: string | null;
  requires_review: boolean;
  assessment_question_bank: { prompt: string; subtopic: string; marks: number };
};
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
    [answerError, setAnswerError] = useState("");
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
  const review = async (id: string, kind = "sessionId") => {
    const version = ++reviewVersion.current;
    setAnswers(null);
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
    }
  };
  return (
    <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Student activity
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Recent workspace activity and saved work. Updates every 30 seconds
            while this dashboard is open.
          </p>
        </div>
        <button
          onClick={() => setRetry((n) => n + 1)}
          className="rounded-full border px-3 py-1.5 text-xs"
        >
          Refresh
        </button>
      </div>
      {!students.length ? (
        <p className="mt-5 text-sm text-zinc-500">
          Your students will appear here after joining.
        </p>
      ) : (
        <div className="mt-5 max-h-64 divide-y divide-zinc-100 overflow-y-auto">
          {students.map((student) => {
            const activity = data?.activity.find(
              (a) => a.student_id === student.id,
            );
            return (
              <button
                key={student.id}
                onClick={() => onSelectStudent?.(student.id)}
                aria-pressed={studentId === student.id}
                className={`flex w-full items-center justify-between gap-4 rounded-lg p-3 text-left text-sm ${studentId === student.id ? "bg-zinc-50" : ""}`}
              >
                <span className="font-medium">{student.name}</span>
                <span className="text-right text-xs text-zinc-500">
                  {activity ? (
                    <>
                      {activity.mode === "video" ? "Video page" : activity.mode}{" "}
                      · {activity.page_title}
                      <span className="mt-1 block">
                        Last seen{" "}
                        {new Date(activity.last_seen_at).toLocaleString()}
                      </span>
                    </>
                  ) : data ? (
                    "No activity recorded yet"
                  ) : (
                    "Loading…"
                  )}
                </span>
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
        <div className="mt-6 grid gap-6 border-t border-zinc-200 pt-6 lg:grid-cols-2">
          <section>
            <h3 className="text-sm font-semibold">
              Recent practice · {students.find((s) => s.id === studentId)?.name}
            </h3>
            {!data.practice.length && (
              <p className="mt-3 text-sm text-zinc-500">
                No practice recorded yet.
              </p>
            )}
            {data.practice.map((p) => (
              <button
                key={p.id}
                onClick={() => void review(p.id)}
                className="mt-3 block w-full rounded-xl border border-zinc-200 p-3 text-left text-sm"
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
                <span className="mt-2 block text-xs underline">
                  View saved responses
                </span>
              </button>
            ))}
          </section>
          <section>
            <h3 className="text-sm font-semibold">Recent assessments</h3>
            {!data.assessments.length && (
              <p className="mt-3 text-sm text-zinc-500">
                No assessments recorded yet.
              </p>
            )}
            {data.assessments.map((a) => (
              <button
                onClick={() => void review(a.id, "attemptId")}
                key={a.id}
                className="mt-3 block w-full rounded-xl border border-zinc-200 p-3 text-left text-sm"
              >
                <p className="font-medium">
                  {a.assessment_key.replace(/[-_]/g, " ")}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {a.status === "active"
                    ? "In progress"
                    : `${a.score ?? 0}/${a.total_marks} marks${a.pending_review_marks ? ` · provisional, ${a.pending_review_marks} marks awaiting review` : ""}`}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {new Date(a.started_at).toLocaleString()}
                </p>
                <span className="mt-2 block text-xs underline">
                  View saved responses
                </span>
              </button>
            ))}
          </section>
        </div>
      )}
      {answerError && (
        <p role="alert" className="mt-4 text-sm text-rose-700">
          {answerError}
        </p>
      )}
      {answers && (
        <section className="mt-6 border-t pt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Saved responses</h3>
            <button
              className="text-sm underline"
              onClick={() => {
                reviewVersion.current += 1;
                setAnswers(null);
              }}
            >
              Close
            </button>
          </div>
          {answers.map((q) => (
            <div key={q.question_id}>
              <BankQuestion
                question={{ id: q.question_id, ...q.assessment_question_bank }}
                value={q.response}
                readOnly
                onChange={() => {}}
              />
              <p className="mb-5 text-xs text-zinc-500">
                {q.checked_at
                  ? q.requires_review
                    ? "Awaiting tutor review"
                    : "Checked"
                  : "Draft · not checked"}
              </p>
            </div>
          ))}
        </section>
      )}
      <TutorAssessmentAccess studentId={studentId} />
      {data && (
        <p className="mt-5 text-xs text-zinc-400">
          Last refreshed {new Date(data.asOf).toLocaleTimeString()}. An open
          page does not confirm that a student is actively studying.
        </p>
      )}
    </section>
  );
}
