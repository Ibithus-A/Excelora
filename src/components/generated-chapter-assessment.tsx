"use client";

import katex from "katex";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCourseBankMapping, assessmentKeyFor } from "@/lib/question-bank/course-mapping";
import { RichMathAnswerInput } from "@/components/rich-math-answer-input";

type Question = { id: string; order: number; prompt: string; marks: number; difficulty: string; subtopic: string; answer?: string; worked_solution?: string; marksAwarded?: number | null; isCorrect?: boolean | null };
type Attempt = { id: string; status: "active" | "submitted"; attempt_number: number; total_marks: number; deadline_at?: string; score?: number; percentage?: number; pending_review_marks?: number; questions: Question[] };

function MathPrompt({ value }: { value: string }) {
  const parts = value.split("$");
  return <>{parts.map((part, index) => index % 2 ? <span key={index} className="inline-block max-w-full overflow-x-auto align-middle" dangerouslySetInnerHTML={{ __html: katex.renderToString(part.replace(/\\\\/g, "\\"), { throwOnError: false, strict: "ignore" }) }} /> : <span key={index}>{part}</span>)}</>;
}

export function GeneratedChapterAssessment({ subjectTitle, chapterTitle, role, onCompleted }: { subjectTitle: string; chapterTitle: string; role: "tutor" | "student"; onCompleted?: () => void }) {
  const mapping = getCourseBankMapping(subjectTitle, chapterTitle);
  const assessmentKey = mapping ? assessmentKeyFor(mapping) : "";
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0); const [loading, setLoading] = useState(true);
  const [isUnlocked, setUnlocked] = useState(role === "tutor"); const [error, setError] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [, setRemainingSeconds] = useState(90 * 60);
  const autoSubmitted = useRef(false);

  const load = useCallback(async () => {
    if (!assessmentKey) { setError("No question-bank mapping exists for this chapter."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/generated-assessments?assessmentKey=${encodeURIComponent(assessmentKey)}`, { cache: "no-store" });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Unable to load assessment.");
      setAttempt(payload.attempt ?? null); setUnlocked(role === "tutor" || Boolean(payload.isUnlocked));
      if (payload.attempt?.questions) setAnswers(Object.fromEntries(payload.attempt.questions.map((q: Question & { response?: { value?: string } }) => [q.id, q.response?.value ?? ""])));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load assessment."); }
    finally { setLoading(false); }
  }, [assessmentKey, role]);
  useEffect(() => { void load(); }, [load]);

  const act = async (action: "start" | "retake" | "save" | "submit") => {
    if (role === "tutor") {
      if (action === "submit" && attempt) {
        const graded = attempt.questions.map((question) => {
          const clean = (value: string) => value.toLowerCase().trim().replace(/\s+/g, " ").replace(/\.$/, "");
          const correct = clean(answers[question.id] ?? "") === clean(question.answer ?? "");
          return { ...question, isCorrect: correct, marksAwarded: correct ? question.marks : 0 };
        });
        const score = graded.reduce((sum, question) => sum + (question.marksAwarded ?? 0), 0);
        setAttempt({ ...attempt, status: "submitted", score, percentage: Math.round((score / attempt.total_marks) * 100), questions: graded });
        setConfirmSubmit(false);
        return;
      }
      await load(); setIndex(0); return;
    }
    const response = await fetch("/api/generated-assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, assessmentKey, attemptId: attempt?.id, answers }) });
    const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Unable to update assessment.");
    setAttempt(payload.attempt); if (action === "submit") { setConfirmSubmit(false); onCompleted?.(); }
  };
  useEffect(() => {
    if (role !== "student" || attempt?.status !== "active") return;
    const timer = window.setTimeout(() => { void act("save").catch(() => setError("Your latest answer could not be saved.")); }, 700);
    return () => window.clearTimeout(timer);
    // `act` intentionally follows the latest local answer state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, attempt?.id, attempt?.status, role]);
  useEffect(() => {
    if (role !== "student" || attempt?.status !== "active" || !attempt.deadline_at) return;
    const tick = () => {
      const deadline = new Date(attempt.deadline_at ?? 0).getTime();
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0 && !autoSubmitted.current) {
        autoSubmitted.current = true;
        void act("submit").catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to submit assessment."));
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
    // Submit the latest local answer state when the server deadline is reached.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.deadline_at, attempt?.id, attempt?.status, role]);

  const question = attempt?.questions[index];
  const answered = useMemo(() => Object.values(answers).filter((answer) => answer.trim()).length, [answers]);
  const diagnosis = useMemo(() => {
    const rows = new Map<string, { marks: number; available: number }>();
    for (const item of attempt?.questions ?? []) {
      const row = rows.get(item.subtopic) ?? { marks: 0, available: 0 };
      row.marks += item.marksAwarded ?? 0; row.available += item.marks; rows.set(item.subtopic, row);
    }
    return [...rows].map(([subtopic, row]) => ({ subtopic, ...row, percentage: row.available ? Math.round((row.marks / row.available) * 100) : 0 })).sort((a, b) => a.percentage - b.percentage);
  }, [attempt]);
  if (loading) return <div className="py-20 text-center text-sm text-zinc-500">Loading assessment…</div>;
  if (error && !attempt) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>;
  if (!isUnlocked && role === "student") return <div className="py-16 text-center"><h2 className="text-2xl font-semibold">Assessment locked</h2><p className="mt-3 text-sm text-zinc-600">Complete every module in this chapter, then ask your tutor to unlock the assessment.</p></div>;
  if (!attempt) return <div className="mx-auto max-w-xl py-12 text-center"><h2 className="text-3xl font-semibold">Chapter assessment</h2><p className="mt-3 text-sm leading-7 text-zinc-600">15 questions · 4 Foundation · 7 Standard · 4 Stretch. Your exact paper is saved when you start.</p><button onClick={() => void act("start").catch((e) => setError(e.message))} className="mt-7 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white">Start assessment</button></div>;
  if (attempt.status === "submitted") {
    const review = attempt.pending_review_marks ?? 0;
    return <div className="py-8"><div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Attempt {attempt.attempt_number}</p><h2 className="mt-2 text-3xl font-semibold">{attempt.score ?? 0} / {attempt.total_marks}</h2><p className="mt-2 text-sm text-zinc-600">{attempt.percentage ?? Math.round(((attempt.score ?? 0) / attempt.total_marks) * 100)}%{review ? ` · ${review} marks require review` : ""}</p><button onClick={() => void act(role === "tutor" ? "start" : "retake").catch((e) => setError(e.message))} className="mt-5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white">{role === "tutor" ? "New preview" : "Retake assessment"}</button></div><section className="mt-8 rounded-2xl border border-zinc-200 p-5"><h3 className="font-semibold">Performance by subtopic</h3><div className="mt-4 space-y-3">{diagnosis.map((row) => <div key={row.subtopic} className="flex items-center justify-between gap-4 text-sm"><span>{row.subtopic}</span><span className="tabular-nums text-zinc-500">{row.marks}/{row.available} · {row.percentage}%</span></div>)}</div>{diagnosis[0] ? <p className="mt-5 border-t border-zinc-200 pt-4 text-sm text-zinc-600">Recommended next step: practise <span className="font-semibold text-zinc-900">{diagnosis[0].subtopic}</span>.</p> : null}</section><div className="mt-9 space-y-4">{attempt.questions.map((q) => <article key={q.id} className="rounded-2xl border border-zinc-200 p-5"><div className="flex justify-between gap-4"><p className="text-sm font-semibold">Question {q.order} · {q.subtopic}</p><span className="text-xs text-zinc-500">{q.marksAwarded ?? 0}/{q.marks}</span></div><p className="mt-3 text-sm leading-7 text-zinc-700"><MathPrompt value={q.prompt} /></p><p className="mt-3 text-sm"><span className="font-semibold">Answer:</span> {q.answer}</p><p className="mt-2 text-sm leading-6 text-zinc-600">{q.worked_solution}</p></article>)}</div></div>;
  }
  if (!question) return <div className="py-16 text-center text-sm text-rose-700">This paper is incomplete and cannot be displayed.</div>;
  return <div className="mx-auto max-w-3xl"><div className="sticky top-0 z-10 -mx-4 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur"><div className="flex justify-between gap-4 text-xs"><span className="font-semibold">Question {index + 1} of 15</span><span className="text-zinc-500">{answered} answered</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div data-assessment-progress-fill className="h-full rounded-full bg-[var(--excelora-green)] transition-[width] duration-300" style={{ width: `${((index + 1) / 15) * 100}%` }} /></div></div><section className="py-8"><div className="flex justify-between"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">{question.subtopic}</p><span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs">{question.marks} marks</span></div><p className="mt-6 text-base leading-8 text-zinc-800"><MathPrompt value={question.prompt} /></p><label className="mt-8 block text-base text-zinc-800">Answer:</label><RichMathAnswerInput id={`bank-answer-${question.id}`} value={answers[question.id] ?? ""} onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} /></section><div className="border-t border-zinc-200 py-5"><div className="flex flex-wrap justify-center gap-1.5">{attempt.questions.map((q, i) => <button key={q.id} onClick={() => setIndex(i)} className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${i === index ? "border-zinc-900 bg-zinc-900 text-white" : answers[q.id]?.trim() ? "border-zinc-400 bg-zinc-100" : "border-zinc-200"}`}>{i + 1}</button>)}</div><div className="mt-5 flex justify-between"><button disabled={!index} onClick={() => setIndex((v) => Math.max(0, v - 1))} className="rounded-full border border-zinc-200 px-5 py-2 text-sm disabled:opacity-40">Previous</button>{index < 14 ? <button onClick={() => setIndex((v) => Math.min(14, v + 1))} className="rounded-full bg-zinc-950 px-5 py-2 text-sm text-white">Next question</button> : <button onClick={() => setConfirmSubmit(true)} className="rounded-full bg-zinc-950 px-5 py-2 text-sm text-white">Submit assessment</button>}</div></div>{confirmSubmit ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><h3 className="text-xl font-semibold">Submit this assessment?</h3><p className="mt-3 text-sm leading-6 text-zinc-600">You answered {answered} of 15 questions. Submission locks this attempt.</p><div className="mt-6 flex gap-2"><button onClick={() => setConfirmSubmit(false)} className="flex-1 rounded-full border px-4 py-2 text-sm">Keep working</button><button onClick={() => void act("submit").catch((e) => setError(e.message))} className="flex-1 rounded-full bg-zinc-950 px-4 py-2 text-sm text-white">Submit</button></div></div></div> : null}{error ? <p className="mb-4 text-sm text-rose-700">{error}</p> : null}</div>;
}
