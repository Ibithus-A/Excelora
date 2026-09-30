"use client";

import type { UserRole } from "@/types/auth";
import type { TutorialSurface } from "./tutorial-showcase";
import { BankMath } from "./bank-question";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type HeatmapDay = {
  date: string;
  questions: number;
  correct: number;
  scorePercent: number;
  topics: Array<{ topic: string; questions: number; scorePercent: number }>;
};

type TopicSummary = {
  courseTopicKey: string;
  subtopic: string;
  questions: number;
  correct: number;
  scorePercent: number;
  lastPractisedAt: string;
};

type ReviewCard = {
  id: string;
  question_id: string;
  state: "learning" | "review" | "mastered";
  due_at: string;
  interval_days: number;
  lapse_count: number;
  review_count: number;
  assessment_question_bank: {
    id: string;
    prompt: string;
    answer: string;
    worked_solution: string;
    subtopic: string;
    family: string;
    marks: number;
    course_topic_key: string;
  } | Array<{
    id: string;
    prompt: string;
    answer: string;
    worked_solution: string;
    subtopic: string;
    family: string;
    marks: number;
    course_topic_key: string;
  }>;
};

type Report = {
  period_type: "weekly" | "monthly";
  period_start: string;
  period_end: string;
  questions_attempted: number;
  questions_correct: number;
  score_percent: number | null;
  active_days: number;
  strongest_topics: TopicSummary[];
  focus_topics: TopicSummary[];
  narrative: string;
};

type Intelligence = {
  heatmap: HeatmapDay[];
  topics: TopicSummary[];
  cards: ReviewCard[];
  reports: Report[];
  summary: { questions: number; accuracy: number; activeDays: number; streak: number; dueCards: number };
  recommendation: TopicSummary | null;
};

const DAY = 86_400_000;

function dateLabel(value: string, includeYear = false) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}

function intensity(day?: HeatmapDay) {
  if (!day?.questions) return "bg-zinc-100";
  if (day.questions >= 10) return "bg-emerald-700";
  if (day.questions >= 6) return "bg-emerald-500";
  if (day.questions >= 3) return "bg-emerald-300";
  return "bg-emerald-100";
}

function cardQuestion(card: ReviewCard) {
  return Array.isArray(card.assessment_question_bank)
    ? card.assessment_question_bank[0]
    : card.assessment_question_bank;
}

export function LearningIntelligencePanel({
  role,
  selectedStudentId = "",
  selectedStudentName = "",
  tutorialSurface = null,
}: {
  role: UserRole;
  selectedStudentId?: string;
  selectedStudentName?: string;
  tutorialSurface?: TutorialSurface | null;
}) {
  const [data, setData] = useState<Intelligence | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"activity" | "review" | "reports">("activity");
  const [selectedDate, setSelectedDate] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");
  const [adaptiveMessage, setAdaptiveMessage] = useState("");
  const adaptiveAttempt = useRef("");

  const load = useCallback(async () => {
    if (role === "tutor" && !selectedStudentId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const query = role === "tutor" ? `?studentId=${encodeURIComponent(selectedStudentId)}` : "";
      const response = await fetch(`/api/learning-intelligence${query}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw Error(payload.error ?? "Unable to load learning insights.");
      setData(payload);
      setSelectedDate((current) => current || payload.heatmap.at(-1)?.date || "");
      setCardIndex(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load learning insights.");
    } finally {
      setLoading(false);
    }
  }, [role, selectedStudentId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (tutorialSurface === "learning-profile") setActiveView("activity");
    if (tutorialSurface === "review") setActiveView("review");
    if (tutorialSurface === "reports") setActiveView("reports");
  }, [tutorialSurface]);

  useEffect(() => {
    if (!data?.recommendation || data.summary.questions < 3 || (role === "tutor" && !selectedStudentId)) return;
    const key = `${role}:${selectedStudentId}:${data.recommendation.courseTopicKey}:${data.recommendation.subtopic}`;
    if (adaptiveAttempt.current === key) return;
    adaptiveAttempt.current = key;
    const query = role === "tutor" ? `?studentId=${encodeURIComponent(selectedStudentId)}` : "";
    void fetch(`/api/learning-intelligence${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ensure-adaptive-quiz" }),
    }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw Error(payload.error);
      if (payload.created) {
        setAdaptiveMessage(role === "tutor" ? "A smart review quiz has been assigned to this student." : "A smart review quiz has been added to Your Work.");
        window.dispatchEvent(new Event("excelora:quizzes-updated"));
      } else if (payload.reason) setAdaptiveMessage(payload.reason);
    }).catch(() => {
      setAdaptiveMessage("Your focus recommendation is ready; the smart quiz will retry later.");
    });
  }, [data, role, selectedStudentId]);

  const calendarDays = useMemo(() => {
    const map = new Map((data?.heatmap ?? []).map((day) => [day.date, day]));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const end = new Date(today.getTime() + (6 - today.getUTCDay()) * DAY);
    const start = new Date(end.getTime() - 52 * 7 * DAY + DAY);
    return Array.from({ length: 52 * 7 }, (_, index) => {
      const date = new Date(start.getTime() + index * DAY).toISOString().slice(0, 10);
      return { date, day: map.get(date) };
    });
  }, [data?.heatmap]);

  const selectedDay = data?.heatmap.find((day) => day.date === selectedDate) ?? null;
  const activeCards = (data?.cards ?? []).filter((card) => card.state !== "mastered");
  const masteredCards = (data?.cards ?? []).filter((card) => card.state === "mastered");
  const dueCards = activeCards.filter((card) => new Date(card.due_at).getTime() <= Date.now());
  const activeCard = dueCards[cardIndex] ?? dueCards[0] ?? null;
  const question = activeCard ? cardQuestion(activeCard) : null;
  const reports = (data?.reports ?? []).filter((report) => report.period_type === reportType);

  const rateCard = async (rating: "again" | "hard" | "good" | "easy") => {
    if (!activeCard) return;
    setReviewBusy(true);
    setError("");
    try {
      const response = await fetch("/api/learning-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review-card", cardId: activeCard.id, rating }),
      });
      const payload = await response.json();
      if (!response.ok) throw Error(payload.error);
      setData((current) => current ? {
        ...current,
        cards: current.cards.map((card) => card.id === activeCard.id ? {
          ...card,
          due_at: payload.dueAt,
          state: payload.state,
          interval_days: payload.intervalDays,
          review_count: payload.reviewCount,
        } : card),
        summary: { ...current.summary, dueCards: Math.max(0, current.summary.dueCards - 1) },
      } : current);
      setAnswerVisible(false);
      setCardIndex(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this review.");
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <section data-tour="learning-intelligence" className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
      <header className="border-b border-zinc-200 bg-[linear-gradient(135deg,#f4f4f5,#fff)] p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              {role === "tutor" && selectedStudentName ? `${selectedStudentName} · learning intelligence` : "Learning intelligence"}
            </p>
            <h2 className="mt-1 text-xl font-medium tracking-tight text-zinc-950 md:text-2xl">
              {role === "tutor" ? "Student learning profile" : "Your learning profile"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
              {role === "tutor"
                ? "Monitor practice consistency, retained mistakes, adaptive homework and reporting from one evidence-based view."
                : "See your practice pattern, revisit missed questions and understand exactly where to focus next."}
            </p>
          </div>
          <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Learning insights">
            {(["activity", "review", "reports"] as const).map((view) => (
              <button key={view} type="button" role="tab" aria-selected={activeView === view} onClick={() => setActiveView(view)} className={["rounded-full px-3.5 py-2 text-xs font-medium capitalize transition", activeView === view ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900"].join(" ")}>
                {view === "activity" ? "Overview" : view === "review" ? "Review cards" : "Reports"}
                {view === "review" && data?.summary.dueCards ? ` · ${data.summary.dueCards}` : ""}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-5 md:p-6">
        {role === "tutor" && !selectedStudentId ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500">Select a student to view their learning pattern and reports.</div>
        ) : loading ? (
          <div role="status" className="flex items-center gap-3 py-10 text-sm text-zinc-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" /> Building the learning picture…</div>
        ) : error && !data ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : data ? (
          <>
            {error ? <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
            {activeView === "activity" ? (
              <div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {[
                    ["Questions", data.summary.questions, "marked in the last year"],
                    ["Accuracy", `${data.summary.accuracy}%`, "of available marks"],
                    ["Active days", data.summary.activeDays, "days with marked work"],
                    ["Current streak", `${data.summary.streak} day${data.summary.streak === 1 ? "" : "s"}`, "consistent practice"],
                    ["Due review", data.summary.dueCards, data.summary.dueCards === 1 ? "question ready now" : "questions ready now"],
                  ].map(([label, value, caption]) => {
                    const content = <>
                      <p className="text-xs font-medium text-zinc-500">{label}</p>
                      <p className="mt-2 text-2xl font-medium tabular-nums tracking-tight text-zinc-950">{value}</p>
                      <p className="mt-1 text-xs text-zinc-500">{caption}</p>
                    </>;
                    return label === "Due review" ? (
                      <button key={String(label)} type="button" onClick={() => setActiveView("review")} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-sm">
                        {content}
                      </button>
                    ) : (
                      <div key={String(label)} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                        {content}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,.7fr)]">
                  <div data-tour="learning-heatmap" className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 md:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-medium text-zinc-950">Review heatmap</h3>
                          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">Past 12 months</span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                          {role === "tutor"
                            ? "Daily question activity for the selected student, with topic and score detail."
                            : "Every marked question builds your activity record. Select a day to review its topics and score."}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500"><span>Less</span>{["bg-zinc-100", "bg-emerald-100", "bg-emerald-300", "bg-emerald-500", "bg-emerald-700"].map((className) => <span key={className} className={`h-3.5 w-3.5 rounded-[4px] ${className}`} />)}<span>More</span></div>
                    </div>
                    <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 md:p-4">
                      <div className="flex min-w-0 gap-3">
                        <div aria-hidden="true" className="grid shrink-0 grid-rows-7 gap-1 text-[10px] leading-[14px] text-zinc-400">
                          <span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span />
                        </div>
                        <div className="min-w-0 flex-1 overflow-x-auto pb-2">
                          <div className="grid w-max grid-flow-col grid-rows-7 auto-cols-[14px] gap-1" aria-label="Question review heatmap">
                            {calendarDays.map(({ date, day }) => (
                              <button key={date} type="button" onClick={() => setSelectedDate(date)} aria-label={`${date}: ${day?.questions ?? 0} questions`} title={`${date} · ${day?.questions ?? 0} questions${day ? ` · ${day.scorePercent}%` : ""}`} className={["h-3.5 w-3.5 rounded-[4px] ring-offset-2 transition duration-150 hover:scale-125 hover:ring-1 hover:ring-zinc-400", intensity(day), selectedDate === date ? "ring-2 ring-zinc-900" : ""].join(" ")} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 min-h-28 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      {selectedDay ? (
                        <>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-medium text-zinc-900">{dateLabel(selectedDay.date, true)}</p>
                            <p className="text-sm tabular-nums text-zinc-600">{selectedDay.questions} questions · {selectedDay.scorePercent}%</p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">{selectedDay.topics.map((topic) => <span key={topic.topic} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600">{topic.topic} · {topic.scorePercent}%</span>)}</div>
                        </>
                      ) : <p className="text-sm leading-6 text-zinc-500">Choose an active day to see the topics practised and score achieved.</p>}
                    </div>
                  </div>

                  <aside className="rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-white">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-300">Recommended next</p>
                    {data.recommendation ? (
                      <>
                        <h3 className="mt-3 text-xl font-medium tracking-tight">{data.recommendation.subtopic}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">Based on {data.recommendation.questions} recent questions at {data.recommendation.scorePercent}%.</p>
                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${data.recommendation.scorePercent}%` }} /></div>
                        <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-zinc-400">{adaptiveMessage || (role === "student" ? "Excelora is preparing the next focused quiz from this learning pattern." : "Use this focus area when setting the student’s next quiz.")}</p>
                      </>
                    ) : <p className="mt-3 text-sm leading-6 text-zinc-300">Complete a few marked questions and Excelora will identify the clearest next focus.</p>}
                  </aside>
                </div>

                {data.topics.length ? (
                  <div className="mt-5 rounded-2xl border border-zinc-200 p-4 md:p-5">
                    <h3 className="text-base font-medium text-zinc-950">Topic profile</h3>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">{data.topics.slice(0, 8).map((topic) => <div key={`${topic.courseTopicKey}-${topic.subtopic}`} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-zinc-900">{topic.subtopic}</p><span className="text-sm font-medium tabular-nums text-zinc-700">{topic.scorePercent}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200"><div className={topic.scorePercent < 60 ? "h-full rounded-full bg-amber-400" : "h-full rounded-full bg-emerald-500"} style={{ width: `${topic.scorePercent}%` }} /></div><p className="mt-2 text-xs text-zinc-500">{topic.questions} questions · last practised {new Date(topic.lastPractisedAt).toLocaleDateString()}</p></div>)}</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeView === "review" ? (
              <div data-tour="learning-review">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div><h3 className="text-lg font-medium tracking-tight text-zinc-950">Mistake review bank</h3><p className="mt-1 text-sm text-zinc-500">Every missed question becomes a spaced-review card linked to its worked solution.</p></div>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">{dueCards.length} due now · {activeCards.length} active · {masteredCards.length} mastered</span>
                </div>
                {activeCard && question ? (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-4"><div><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">{question.subtopic}</p><p className="mt-1 text-sm text-zinc-600">Card {cardIndex + 1} of {dueCards.length} · missed {activeCard.lapse_count} time{activeCard.lapse_count === 1 ? "" : "s"}</p></div><span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Due for review</span></div>
                    <div className="p-5 md:p-7">
                      <div className="text-base font-normal leading-8 text-zinc-900"><BankMath value={question.prompt} /></div>
                      {!answerVisible ? <button type="button" onClick={() => setAnswerVisible(true)} className="mt-7 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800">Reveal answer</button> : (
                        <div className="mt-7 space-y-4">
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4"><p className="text-xs font-medium uppercase tracking-[0.1em] text-emerald-700">Expected answer</p><div className="mt-2 text-base leading-7 text-zinc-900"><BankMath value={question.answer} /></div></div>
                          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">Worked solution</p><div className="mt-2 text-sm leading-7 text-zinc-700"><BankMath value={question.worked_solution} /></div></div>
                          {role === "student" ? <div><p className="text-sm font-medium text-zinc-900">How well did you recall it?</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{(["again", "hard", "good", "easy"] as const).map((rating) => <button key={rating} type="button" disabled={reviewBusy} onClick={() => void rateCard(rating)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium capitalize text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50">{rating}</button>)}</div></div> : null}
                        </div>
                      )}
                    </div>
                  </div>
                ) : <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center"><p className="font-medium text-zinc-900">No cards are due right now</p><p className="mt-2 text-sm text-zinc-500">Missed questions are added automatically and return at the right interval.</p></div>}
                {role === "tutor" && data.cards.length ? (
                  <div className="mt-5 rounded-2xl border border-zinc-200 p-4 md:p-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div><h4 className="text-base font-medium text-zinc-950">Spaced-review monitor</h4><p className="mt-1 text-sm text-zinc-500">Every retained gap, its review cadence and the student’s recall history.</p></div>
                      <span className="text-xs text-zinc-500">{data.cards.length} total cards</span>
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {data.cards.map((card) => {
                        const item = cardQuestion(card);
                        const isDue = card.state !== "mastered" && new Date(card.due_at).getTime() <= Date.now();
                        return item ? (
                          <div key={card.id} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-900">{item.subtopic}</p><p className="mt-1 truncate text-xs text-zinc-500">{item.family}</p></div>
                              <span className={["shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize", card.state === "mastered" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : isDue ? "border-amber-200 bg-amber-50 text-amber-700" : "border-zinc-200 bg-white text-zinc-600"].join(" ")}>{card.state === "mastered" ? "Mastered" : isDue ? "Due now" : card.state}</span>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-3 text-xs"><div><p className="text-zinc-400">Reviews</p><p className="mt-1 font-medium tabular-nums text-zinc-800">{card.review_count}</p></div><div><p className="text-zinc-400">Misses</p><p className="mt-1 font-medium tabular-nums text-zinc-800">{card.lapse_count}</p></div><div><p className="text-zinc-400">Next due</p><p className="mt-1 font-medium text-zinc-800">{card.state === "mastered" ? "Complete" : new Date(card.due_at).toLocaleDateString([], { day: "numeric", month: "short" })}</p></div></div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeView === "reports" ? (
              <div data-tour="learning-reports">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><h3 className="text-lg font-medium tracking-tight text-zinc-950">Progress reports</h3><p className="mt-1 text-sm text-zinc-500">A consistent summary of effort, attainment, strengths and next focus.</p></div><div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-1">{(["weekly", "monthly"] as const).map((type) => <button key={type} type="button" onClick={() => setReportType(type)} className={["rounded-full px-4 py-2 text-xs font-medium capitalize transition", reportType === type ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500"].join(" ")}>{type}</button>)}</div></div>
                <div className="mt-5 space-y-3">{reports.map((report, index) => <article key={`${report.period_type}-${report.period_start}`} className={["rounded-2xl border p-5", index === 0 ? "border-zinc-300 bg-white shadow-sm" : "border-zinc-200 bg-zinc-50/50"].join(" ")}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">{dateLabel(report.period_start, true)} — {dateLabel(report.period_end, true)}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-700">{report.narrative}</p></div><div className="flex gap-5 text-right"><div><p className="text-2xl font-medium tabular-nums text-zinc-950">{report.questions_attempted}</p><p className="text-xs text-zinc-500">questions</p></div><div><p className="text-2xl font-medium tabular-nums text-zinc-950">{report.score_percent === null ? "—" : `${report.score_percent}%`}</p><p className="text-xs text-zinc-500">score</p></div><div><p className="text-2xl font-medium tabular-nums text-zinc-950">{report.active_days}</p><p className="text-xs text-zinc-500">active days</p></div></div></div>{report.focus_topics.length ? <div className="mt-4 flex flex-wrap gap-2">{report.focus_topics.map((topic) => <span key={`${report.period_start}-${topic.subtopic}`} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">Focus: {topic.subtopic} · {topic.scorePercent}%</span>)}</div> : null}</article>)}</div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
