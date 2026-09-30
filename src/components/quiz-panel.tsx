"use client";

import { BankMath, BankQuestion } from "./bank-question";
import type { UserRole } from "@/types/auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  assignment_source?: "tutor" | "adaptive";
  recommendation_reason?: string | null;
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
  selectedStudentId = "",
  selectedStudentName = "",
}: {
  role: UserRole;
  selectedStudentId?: string;
  selectedStudentName?: string;
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
  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener("excelora:quizzes-updated", refresh);
    return () => window.removeEventListener("excelora:quizzes-updated", refresh);
  }, []);

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
    <section data-tour="quiz-panel" className="relative rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-t-[27px] border-b border-zinc-200 bg-[linear-gradient(135deg,#f4f4f5,#fff)] p-5 md:p-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
            {role === "tutor" ? "Set work" : "Your work"}
          </p>
          <h2 className="mt-1 text-xl font-medium tracking-tight text-zinc-950">
            {role === "tutor"
              ? selectedStudentName ? `Quizzes for ${selectedStudentName}` : "Student quizzes"
              : outstanding.length ? `${outstanding.length} quiz${outstanding.length === 1 ? "" : "zes"} to complete` : "You’re all caught up"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {role === "tutor" ? "Set focused work and monitor both tutor-assigned and adaptive quizzes." : "Tutor assignments and adaptive review quizzes, ordered by deadline."}
          </p>
        </div>
        {role === "tutor" && selectedStudentId ? (
          <button type="button" onClick={() => setIsCreating((value) => !value)} className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800">
            {isCreating ? "Close" : "+ Set a quiz"}
          </button>
        ) : null}
      </div>

      <div className="p-5 md:p-6">
        {!loading && !error && (selectedStudentId || role === "student") ? (
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3"><p className="text-xs text-zinc-500">To complete</p><p className="mt-1 text-xl font-medium tabular-nums text-zinc-950">{outstanding.length}</p></div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3"><p className="text-xs text-zinc-500">Completed</p><p className="mt-1 text-xl font-medium tabular-nums text-zinc-950">{completed.length}</p></div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3"><p className="text-xs text-zinc-500">Adaptive review</p><p className="mt-1 text-xl font-medium tabular-nums text-zinc-950">{assignments.filter((quiz) => quiz.assignment_source === "adaptive").length}</p></div>
          </div>
        ) : null}
        {role === "tutor" && !selectedStudentId ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
            Select a student to set and review their quizzes.
          </div>
        ) : null}
        {role === "tutor" && selectedStudentId && isCreating ? (
          <QuizComposer
            selectedStudentId={selectedStudentId}
            topics={topics}
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
                      <span className="truncate font-medium text-zinc-900">{quiz.title}</span>
                    </span>
                    <span className="mt-2 block text-xs text-zinc-500">{quiz.subtopic || "Whole chapter"} · {quiz.question_count} questions{quiz.assignment_source === "adaptive" ? " · Smart review" : ""}</span>
                    {quiz.assignment_source === "adaptive" && quiz.recommendation_reason ? (
                      <span className="mt-2 block line-clamp-2 text-xs leading-5 text-zinc-500">{quiz.recommendation_reason}</span>
                    ) : null}
                    <span className={["mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium", quiz.status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : overdue ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"].join(" ")}>
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

function QuizComposer({ selectedStudentId, topics, onCreated }: {
  selectedStudentId: string;
  topics: QuizTopic[];
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
        <label className="text-xs font-medium text-zinc-600">Quiz title
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Chain rule review" className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-950/5" />
        </label>
        <QuizSelect
          label="Chapter"
          value={topicKey}
          options={topics.map((topic) => ({ value: topic.key, label: `${topic.subjectTitle} · ${topic.chapterTitle}` }))}
          onChange={setTopicKey}
        />
        <QuizSelect
          label="Topic"
          value={subtopic}
          options={[{ value: "", label: "Whole chapter" }, ...subtopics.map((item) => ({ value: item, label: item }))]}
          onChange={setSubtopic}
        />
        <fieldset>
          <legend className="text-xs font-medium text-zinc-600">Questions</legend>
          <div className="mt-2 grid h-12 grid-cols-4 rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
            {[5, 10, 15, 20].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setCount(value)}
                aria-pressed={count === value}
                className={[
                  "rounded-xl text-xs font-medium transition duration-200",
                  count === value ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                ].join(" ")}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
        <QuizDateTimePicker value={dueAt} onChange={setDueAt} />
      </div>
      {error ? <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-5 flex justify-end">
        <button type="button" disabled={busy || !title.trim() || !topicKey || !dueAt} onClick={() => void submit()} className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">
          {busy ? <><Spinner />Setting quiz…</> : "Assign quiz"}
        </button>
      </div>
    </div>
  );
}

function QuizSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div ref={rootRef} className="relative">
      <p className="text-xs font-medium text-zinc-600">{label}</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={[
          "mt-2 flex h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-left text-sm text-zinc-900 shadow-sm outline-none transition duration-200",
          open ? "border-zinc-400 ring-4 ring-zinc-950/5" : "border-zinc-200 hover:border-zinc-300",
        ].join(" ")}
      >
        <span className="truncate">{selected?.label ?? `Choose ${label.toLowerCase()}`}</span>
        <svg viewBox="0 0 20 20" className={["h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200", open ? "rotate-180" : ""].join(" ")} aria-hidden="true">
          <path d="m5.5 7.5 4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value || "all"}
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={[
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                option.value === value ? "bg-zinc-900 font-medium text-white" : "text-zinc-700 hover:bg-zinc-100",
              ].join(" ")}
            >
              <span>{option.label}</span>
              {option.value === value ? <span aria-hidden="true">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const CALENDAR_WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CALENDAR_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function localDateTimeValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function QuizDateTimePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const initial = value ? new Date(value) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1));
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = value ? new Date(value) : null;
  const selectedTime = selected && Number.isFinite(selected.getTime())
    ? `${String(selected.getHours()).padStart(2, "0")}:${String(selected.getMinutes()).padStart(2, "0")}`
    : "17:00";

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const firstDay = visibleMonth.getDay() === 0 ? 6 : visibleMonth.getDay() - 1;
  const gridStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1 - firstDay);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const sameDay = (left: Date | null, right: Date) => Boolean(left) &&
    left!.getFullYear() === right.getFullYear() &&
    left!.getMonth() === right.getMonth() &&
    left!.getDate() === right.getDate();

  const chooseDate = (date: Date) => {
    const next = new Date(date);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    next.setHours(hours, minutes, 0, 0);
    onChange(localDateTimeValue(next));
  };
  const chooseTime = (time: string) => {
    const next = selected && Number.isFinite(selected.getTime()) ? new Date(selected) : new Date();
    const [hours, minutes] = time.split(":").map(Number);
    next.setHours(hours, minutes, 0, 0);
    onChange(localDateTimeValue(next));
    setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };
  const displayValue = selected && Number.isFinite(selected.getTime())
    ? `${selected.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })} · ${selected.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Choose a date and time";

  return (
    <div ref={rootRef} className="relative">
      <p className="text-xs font-medium text-zinc-600">Deadline</p>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          "mt-2 flex h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-left text-sm shadow-sm outline-none transition",
          open ? "border-zinc-400 ring-4 ring-zinc-950/5" : "border-zinc-200 hover:border-zinc-300",
          selected ? "text-zinc-900" : "text-zinc-400",
        ].join(" ")}
      >
        <span className="truncate">{displayValue}</span>
        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-zinc-500" fill="none" aria-hidden="true">
          <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6.5 3v3M13.5 3v3M3 8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {open ? (
        <div role="dialog" aria-label="Choose quiz deadline" className="absolute right-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3.5">
            <button type="button" aria-label="Previous month" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900">←</button>
            <p className="text-sm font-medium text-zinc-900">{CALENDAR_MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</p>
            <button type="button" aria-label="Next month" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900">→</button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center">
              {CALENDAR_WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className="py-1 text-[10px] font-medium text-zinc-400">{day}</span>)}
              {days.map((date) => {
                const isSelected = sameDay(selected, date);
                const isToday = sameDay(today, date);
                const outside = date.getMonth() !== visibleMonth.getMonth();
                const isPast = date.getTime() < todayStart.getTime();
                return (
                  <button
                    type="button"
                    key={date.toISOString()}
                    disabled={isPast}
                    onClick={() => chooseDate(date)}
                    className={[
                      "relative flex aspect-square items-center justify-center rounded-xl text-xs font-medium transition",
                      isSelected ? "bg-zinc-900 text-white shadow-sm" : outside ? "text-zinc-300 hover:bg-zinc-50" : "text-zinc-700 hover:bg-zinc-100",
                      isPast ? "cursor-not-allowed opacity-25" : "",
                    ].join(" ")}
                  >
                    {date.getDate()}
                    {isToday && !isSelected ? <span className="absolute bottom-1 h-1 w-1 rounded-full bg-zinc-900" /> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 border-t border-zinc-100 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">Due time</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">{selectedTime}</p>
                </div>
                <div className="flex gap-1.5">
                  {["09:00", "16:00", "18:00"].map((time) => (
                    <button type="button" key={time} onClick={() => chooseTime(time)} className={["rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition", selectedTime === time ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"].join(" ")}>{time}</button>
                  ))}
                </div>
              </div>
              <label className="mt-3 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                Custom time
                <input type="time" value={selectedTime} onChange={(event) => chooseTime(event.target.value)} className="bg-transparent text-sm font-medium text-zinc-900 outline-none" />
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/70 px-4 py-3">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-xs font-medium text-zinc-500 hover:text-zinc-900">Clear</button>
            <button type="button" disabled={!selected} onClick={() => setOpen(false)} className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-40">Set deadline</button>
          </div>
        </div>
      ) : null}
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
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">Quiz · Question {index + 1} of {quiz.questions.length}</p>
          <h2 className="mt-1 text-lg font-medium text-zinc-950">{quiz.title}</h2>
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
