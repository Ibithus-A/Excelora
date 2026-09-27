"use client";

import { BankMath, BankQuestion } from "./bank-question";
import type { UserAccessProfile, UserRole } from "@/types/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

type QuizSummary = {
  id: string;
  student_id: string;
  title: string;
  subtopic: string;
  question_count: number;
  due_at: string;
  status: "assigned" | "completed";
  score: number | null;
  total_marks: number;
  completed_at: string | null;
};
type QuizTopic = { key: string; subjectTitle: string; chapterTitle: string };
type QuizQuestion = {
  id: string;
  order: number;
  prompt: string;
  subtopic: string;
  marks: number;
  response: string;
  answer?: string;
  worked_solution?: string;
  result?: { marks: number; isCorrect: boolean | null; requiresReview: boolean } | null;
};
type QuizDetail = QuizSummary & { questions: QuizQuestion[] };

function dueLabel(value: string) {
  const due = new Date(value);
  const diff = due.getTime() - Date.now();
  if (diff < 0) return `Overdue · ${due.toLocaleDateString()}`;
  if (diff < 24 * 60 * 60 * 1000) return `Due today · ${due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return `Due ${due.toLocaleDateString([], { day: "numeric", month: "short" })}`;
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />;
}

export function QuizPanel({
  role,
  students = [],
  selectedStudentId = "",
  onSelectStudent,
}: {
  role: UserRole;
  students?: UserAccessProfile[];
  selectedStudentId?: string;
  onSelectStudent?: (id: string) => void;
}) {
  const [assignments, setAssignments] = useState<QuizSummary[]>([]);
  const [topics, setTopics] = useState<QuizTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizDetail | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = role === "tutor" && selectedStudentId
        ? `?studentId=${encodeURIComponent(selectedStudentId)}`
        : "";
      const response = await fetch(`/api/quizzes${query}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      setAssignments(data.assignments ?? []);
      setTopics(data.topics ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load quizzes.");
    } finally {
      setLoading(false);
    }
  }, [role, selectedStudentId]);

  useEffect(() => { void load(); }, [load, refreshKey]);

  const openQuiz = async (id: string) => {
    setOpeningId(id);
    setError("");
    try {
      const response = await fetch(`/api/quizzes?assignmentId=${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      setActiveQuiz(data.assignment);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to open quiz.");
    } finally {
      setOpeningId(null);
    }
  };

  const outstanding = assignments.filter((quiz) => quiz.status === "assigned");
  const completed = assignments.filter((quiz) => quiz.status === "completed");

  if (activeQuiz) {
    return (
      <QuizRunner
        quiz={activeQuiz}
        canAnswer={role === "student"}
        onClose={() => {
          setActiveQuiz(null);
          setRefreshKey((value) => value + 1);
        }}
        onUpdate={setActiveQuiz}
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 bg-[linear-gradient(135deg,#f4f4f5,#fff)] p-5 md:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            {role === "tutor" ? "Set work" : "Your work"}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">
            {role === "tutor" ? "Quizzes" : outstanding.length ? `${outstanding.length} quiz${outstanding.length === 1 ? "" : "zes"} to complete` : "You’re all caught up"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {role === "tutor" ? "Assign focused question sets with a clear deadline." : "Homework from your tutor, ordered by deadline."}
          </p>
        </div>
        {role === "tutor" && selectedStudentId ? (
          <button type="button" onClick={() => setIsCreating((value) => !value)} className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800">
            {isCreating ? "Close" : "+ Set a quiz"}
          </button>
        ) : null}
      </div>

      <div className="p-5 md:p-6">
        {role === "tutor" && !selectedStudentId ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
            Select a student to set and review their quizzes.
          </div>
        ) : null}
        {role === "tutor" && selectedStudentId && isCreating ? (
          <QuizComposer
            students={students}
            selectedStudentId={selectedStudentId}
            topics={topics}
            onSelectStudent={onSelectStudent}
            onCreated={() => {
              setIsCreating(false);
              setRefreshKey((value) => value + 1);
            }}
          />
        ) : null}
        {loading ? (
          <div role="status" className="flex items-center gap-3 py-8 text-sm text-zinc-500"><Spinner /> Loading quizzes…</div>
        ) : error ? (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
        ) : assignments.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {[...outstanding, ...completed].map((quiz) => {
              const overdue = quiz.status === "assigned" && new Date(quiz.due_at).getTime() < Date.now();
              return (
                <button
                  type="button"
                  key={quiz.id}
                  onClick={() => void openQuiz(quiz.id)}
                  className="group flex min-h-32 w-full items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className={["h-2 w-2 rounded-full", quiz.status === "completed" ? "bg-emerald-500" : overdue ? "bg-rose-500" : "bg-amber-400"].join(" ")} />
                      <span className="truncate font-semibold text-zinc-900">{quiz.title}</span>
                    </span>
                    <span className="mt-2 block text-xs text-zinc-500">{quiz.subtopic || "Whole chapter"} · {quiz.question_count} questions</span>
                    <span className={["mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold", quiz.status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : overdue ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"].join(" ")}>
                      {quiz.status === "completed" ? `${quiz.score ?? 0}/${quiz.total_marks} marks` : dueLabel(quiz.due_at)}
                    </span>
                  </span>
                  <span className="mt-1 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 group-hover:text-zinc-900">
                    {openingId === quiz.id ? <Spinner /> : null}
                    {openingId === quiz.id ? "Opening" : quiz.status === "completed" ? "Review →" : role === "student" ? "Start →" : "View →"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : selectedStudentId || role === "student" ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
            {role === "student" ? "No quizzes have been assigned yet." : "No quizzes set for this student yet."}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function QuizComposer({ students, selectedStudentId, topics, onSelectStudent, onCreated }: {
  students: UserAccessProfile[];
  selectedStudentId: string;
  topics: QuizTopic[];
  onSelectStudent?: (id: string) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [topicKey, setTopicKey] = useState(topics[0]?.key ?? "");
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [subtopic, setSubtopic] = useState("");
  const [count, setCount] = useState(5);
  const [dueAt, setDueAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!topicKey && topics[0]) setTopicKey(topics[0].key);
  }, [topicKey, topics]);
  useEffect(() => {
    if (!topicKey) return;
    let live = true;
    setSubtopic("");
    fetch(`/api/quizzes?catalogKey=${encodeURIComponent(topicKey)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw Error(data.error);
        if (live) setSubtopics(data.subtopics ?? []);
      })
      .catch((caught) => { if (live) setError(caught instanceof Error ? caught.message : "Unable to load topics."); });
    return () => { live = false; };
  }, [topicKey]);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", studentId: selectedStudentId, assessmentKey: topicKey, subtopic, questionCount: count, dueAt: new Date(dueAt).toISOString(), title }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      onCreated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to set quiz.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-zinc-600">Student
          <select value={selectedStudentId} onChange={(event) => onSelectStudent?.(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900">
            {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-zinc-600">Quiz title
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Chain rule review" className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900" />
        </label>
        <label className="text-xs font-medium text-zinc-600">Chapter
          <select value={topicKey} onChange={(event) => setTopicKey(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900">
            {topics.map((topic) => <option key={topic.key} value={topic.key}>{topic.subjectTitle} · {topic.chapterTitle}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-zinc-600">Topic
          <select value={subtopic} onChange={(event) => setSubtopic(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900">
            <option value="">Whole chapter</option>
            {subtopics.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-zinc-600">Questions
          <select value={count} onChange={(event) => setCount(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900">
            {[5, 10, 15, 20].map((value) => <option key={value} value={value}>{value} questions</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-zinc-600">Deadline
          <input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900" />
        </label>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-5 flex justify-end">
        <button type="button" disabled={busy || !title.trim() || !topicKey || !dueAt} onClick={() => void submit()} className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
          {busy ? <><Spinner />Setting quiz…</> : "Assign quiz"}
        </button>
      </div>
    </div>
  );
}

function QuizRunner({ quiz, canAnswer, onClose, onUpdate }: { quiz: QuizDetail; canAnswer: boolean; onClose: () => void; onUpdate: (quiz: QuizDetail) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => Object.fromEntries(quiz.questions.map((question) => [question.id, question.response ?? ""])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const question = quiz.questions[index];
  const completed = quiz.status === "completed";
  const answered = useMemo(() => Object.values(answers).filter((answer) => answer.trim()).length, [answers]);

  const act = async (action: "save" | "submit") => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/quizzes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, assignmentId: quiz.id, answers }) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      if (data.assignment) onUpdate(data.assignment);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save quiz.");
    } finally { setBusy(false); }
  };

  if (!question) return null;
  const result = question.result;
  const resultState = result?.requiresReview || result?.isCorrect === null ? "review" : result?.isCorrect ? "correct" : "incorrect";
  return (
    <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Quiz · Question {index + 1} of {quiz.questions.length}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">{quiz.title}</h2>
          <p className="mt-1 text-xs text-zinc-500">{dueLabel(quiz.due_at)} · {answered}/{quiz.questions.length} answered</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-600">Close</button>
      </div>
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        {completed && result ? (
          <div className={["mb-3 rounded-2xl border p-4", resultState === "correct" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : resultState === "incorrect" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"].join(" ")}>
            <p className="font-semibold">{resultState === "correct" ? "Correct" : resultState === "incorrect" ? "Incorrect" : "Awaiting tutor review"}</p>
            <p className="mt-1 text-xs">{result.marks}/{question.marks} marks</p>
          </div>
        ) : null}
        <BankQuestion questionNumber={index + 1} question={question} value={answers[question.id] ?? ""} onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} readOnly={!canAnswer || completed} />
        {completed ? (
          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-sm leading-7">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Expected answer</p><BankMath value={question.answer ?? ""} /></div>
            <div className="border-t border-zinc-200 pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Worked solution</p><BankMath value={question.worked_solution ?? ""} /></div>
          </div>
        ) : null}
        {error ? <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p> : null}
        <div className="mt-6 border-t border-zinc-200 pt-5">
          <div className="flex flex-wrap justify-center gap-2">
            {quiz.questions.map((item, itemIndex) => {
              const state = item.result?.requiresReview || item.result?.isCorrect === null ? "review" : item.result?.isCorrect ? "correct" : "incorrect";
              return <button type="button" key={item.id} onClick={() => setIndex(itemIndex)} className={["h-9 w-9 rounded-full border text-xs font-semibold", itemIndex === index ? "ring-2 ring-zinc-900 ring-offset-2" : "", completed ? state === "correct" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : state === "incorrect" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700" : answers[item.id]?.trim() ? "border-zinc-400 bg-zinc-100" : "border-zinc-200"].join(" ")}>{itemIndex + 1}</button>;
            })}
          </div>
          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button type="button" disabled={!index} onClick={() => setIndex((value) => Math.max(0, value - 1))} className="rounded-full border border-zinc-200 px-5 py-2 text-sm disabled:opacity-40">Previous</button>
            <div className="flex gap-2">
              {canAnswer && !completed ? <button type="button" disabled={busy} onClick={() => void act("save")} className="rounded-full border border-zinc-200 px-5 py-2 text-sm">{busy ? "Saving…" : "Save"}</button> : null}
              {index < quiz.questions.length - 1 ? <button type="button" onClick={() => setIndex((value) => Math.min(quiz.questions.length - 1, value + 1))} className="rounded-full bg-zinc-950 px-5 py-2 text-sm text-white">Next</button> : canAnswer && !completed ? <button type="button" disabled={busy || answered === 0} onClick={() => void act("submit")} className="rounded-full bg-zinc-950 px-5 py-2 text-sm text-white disabled:opacity-40">{busy ? "Marking…" : "Submit quiz"}</button> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
