import { GENERATED_ASSESSMENT_CONFIGS } from "@/lib/assessment-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfileById, getViewerProfile } from "@/lib/supabase/profiles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LearningEvent = {
  source_type: "practice" | "assessment" | "quiz";
  question_id: string;
  course_topic_key: string;
  subtopic: string;
  family: string;
  marks_awarded: number | null;
  available_marks: number;
  is_correct: boolean | null;
  attempted_at: string;
};

type TopicSummary = {
  courseTopicKey: string;
  subtopic: string;
  questions: number;
  correct: number;
  marksAwarded: number;
  availableMarks: number;
  scorePercent: number;
  lastPractisedAt: string;
};

const fail = (error: string, status: number) => Response.json({ error }, { status });
const DAY = 86_400_000;

async function viewer() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  return getViewerProfile(client, user.id);
}

function utcDay(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

function startOfWeek(date: Date) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  value.setUTCDate(value.getUTCDate() - ((value.getUTCDay() + 6) % 7));
  return value;
}

function endOfPeriod(start: Date, type: "weekly" | "monthly") {
  const end = new Date(start);
  if (type === "weekly") end.setUTCDate(end.getUTCDate() + 7);
  else end.setUTCMonth(end.getUTCMonth() + 1);
  return end;
}

function summariseTopics(events: LearningEvent[]) {
  const grouped = new Map<string, Omit<TopicSummary, "scorePercent">>();
  for (const event of events) {
    const key = `${event.course_topic_key}\u0000${event.subtopic}`;
    const current = grouped.get(key) ?? {
      courseTopicKey: event.course_topic_key,
      subtopic: event.subtopic,
      questions: 0,
      correct: 0,
      marksAwarded: 0,
      availableMarks: 0,
      lastPractisedAt: event.attempted_at,
    };
    current.questions += 1;
    current.correct += event.is_correct === true ? 1 : 0;
    current.marksAwarded += Number(event.marks_awarded ?? 0);
    current.availableMarks += Number(event.available_marks);
    if (event.attempted_at > current.lastPractisedAt) current.lastPractisedAt = event.attempted_at;
    grouped.set(key, current);
  }
  return [...grouped.values()].map((topic) => ({
    ...topic,
    scorePercent: topic.availableMarks
      ? Math.round((topic.marksAwarded / topic.availableMarks) * 100)
      : 0,
  })).sort((a, b) => a.scorePercent - b.scorePercent || b.questions - a.questions);
}

function buildReport(events: LearningEvent[], type: "weekly" | "monthly", start: Date) {
  const end = endOfPeriod(start, type);
  const periodEvents = events.filter((event) => {
    const time = new Date(event.attempted_at).getTime();
    return time >= start.getTime() && time < end.getTime();
  });
  const topics = summariseTopics(periodEvents);
  const questionsCorrect = periodEvents.filter((event) => event.is_correct === true).length;
  const marksAwarded = periodEvents.reduce((total, event) => total + Number(event.marks_awarded ?? 0), 0);
  const availableMarks = periodEvents.reduce((total, event) => total + Number(event.available_marks), 0);
  const scorePercent = availableMarks ? Math.round((marksAwarded / availableMarks) * 1000) / 10 : null;
  const activeDays = new Set(periodEvents.map((event) => utcDay(event.attempted_at))).size;
  const strongestTopics = topics.filter((topic) => topic.questions >= 2).slice().sort((a, b) => b.scorePercent - a.scorePercent).slice(0, 3);
  const focusTopics = topics.filter((topic) => topic.questions >= 2).slice(0, 3);
  const periodLabel = type === "weekly" ? "This week" : "This month";
  const narrative = periodEvents.length
    ? `${periodLabel}, ${periodEvents.length} questions were completed across ${activeDays} active day${activeDays === 1 ? "" : "s"}, with ${scorePercent ?? 0}% of available marks. ${focusTopics[0] ? `${focusTopics[0].subtopic} is the clearest next focus.` : "Keep practising to build a clearer topic picture."}`
    : `${periodLabel}, no marked questions have been completed yet.`;
  return {
    student_id: "",
    period_type: type,
    period_start: utcDay(start),
    period_end: utcDay(new Date(end.getTime() - DAY)),
    questions_attempted: periodEvents.length,
    questions_correct: questionsCorrect,
    marks_awarded: marksAwarded,
    available_marks: availableMarks,
    score_percent: scorePercent,
    active_days: activeDays,
    strongest_topics: strongestTopics,
    focus_topics: focusTopics,
    narrative,
    generated_at: new Date().toISOString(),
  };
}

async function authorisedStudent(request: Request) {
  const profile = await viewer();
  if (!profile) return { error: fail("Unauthorized.", 401) };
  const requestedId = new URL(request.url).searchParams.get("studentId") ?? "";
  const studentId = profile.role === "student" ? profile.id : requestedId;
  if (!studentId) return { error: fail("Select a student first.", 400) };
  if (profile.role === "tutor") {
    const student = await getStudentProfileById(createAdminClient(), studentId);
    if (!student) return { error: fail("Student not found.", 404) };
  }
  return { profile, studentId };
}

export async function GET(request: Request) {
  const context = await authorisedStudent(request);
  if ("error" in context) return context.error;
  try {
    const admin = createAdminClient();
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 370);
    since.setUTCHours(0, 0, 0, 0);
    const [{ data: rawEvents, error: eventError }, { data: cards, error: cardError }] = await Promise.all([
      admin.from("student_learning_events")
        .select("source_type,question_id,course_topic_key,subtopic,family,marks_awarded,available_marks,is_correct,attempted_at")
        .eq("student_id", context.studentId)
        .gte("attempted_at", since.toISOString())
        .order("attempted_at", { ascending: true })
        .limit(10000),
      admin.from("student_review_cards")
        .select("id,question_id,state,due_at,interval_days,ease_factor,lapse_count,review_count,last_rating,last_reviewed_at,assessment_question_bank(id,prompt,answer,worked_solution,subtopic,family,marks,course_topic_key)")
        .eq("student_id", context.studentId)
        .order("due_at", { ascending: true })
        .limit(100),
    ]);
    if (eventError) throw new Error(eventError.message);
    if (cardError) throw new Error(cardError.message);
    const events = (rawEvents ?? []) as LearningEvent[];
    const topics = summariseTopics(events);
    const days = new Map<string, { date: string; questions: number; correct: number; marksAwarded: number; availableMarks: number; topics: Map<string, { questions: number; marksAwarded: number; availableMarks: number }> }>();
    for (const event of events) {
      const date = utcDay(event.attempted_at);
      const day = days.get(date) ?? { date, questions: 0, correct: 0, marksAwarded: 0, availableMarks: 0, topics: new Map() };
      day.questions += 1;
      day.correct += event.is_correct === true ? 1 : 0;
      day.marksAwarded += Number(event.marks_awarded ?? 0);
      day.availableMarks += Number(event.available_marks);
      const topic = day.topics.get(event.subtopic) ?? { questions: 0, marksAwarded: 0, availableMarks: 0 };
      topic.questions += 1;
      topic.marksAwarded += Number(event.marks_awarded ?? 0);
      topic.availableMarks += Number(event.available_marks);
      day.topics.set(event.subtopic, topic);
      days.set(date, day);
    }
    const heatmap = [...days.values()].map((day) => ({
      date: day.date,
      questions: day.questions,
      correct: day.correct,
      scorePercent: day.availableMarks ? Math.round((day.marksAwarded / day.availableMarks) * 100) : 0,
      topics: [...day.topics.entries()].map(([topic, values]) => ({
        topic,
        questions: values.questions,
        scorePercent: values.availableMarks ? Math.round((values.marksAwarded / values.availableMarks) * 100) : 0,
      })).sort((a, b) => b.questions - a.questions),
    }));

    const today = utcDay(new Date());
    const active = new Set(heatmap.map((day) => day.date));
    let streak = 0;
    let cursor = new Date(`${today}T00:00:00.000Z`);
    if (!active.has(today)) cursor = new Date(cursor.getTime() - DAY);
    while (active.has(utcDay(cursor))) {
      streak += 1;
      cursor = new Date(cursor.getTime() - DAY);
    }

    const now = new Date();
    const reportRows = [];
    const week = startOfWeek(now);
    for (let index = 0; index < 8; index += 1) {
      const start = new Date(week.getTime() - index * 7 * DAY);
      reportRows.push({ ...buildReport(events, "weekly", start), student_id: context.studentId });
    }
    for (let index = 0; index < 6; index += 1) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
      reportRows.push({ ...buildReport(events, "monthly", start), student_id: context.studentId });
    }
    const { error: reportError } = await admin.from("student_learning_reports").upsert(
      reportRows,
      { onConflict: "student_id,period_type,period_start" },
    );
    if (reportError) throw new Error(reportError.message);

    const totalMarks = events.reduce((sum, event) => sum + Number(event.available_marks), 0);
    const earnedMarks = events.reduce((sum, event) => sum + Number(event.marks_awarded ?? 0), 0);
    return Response.json({
      heatmap,
      topics,
      cards: cards ?? [],
      reports: reportRows,
      summary: {
        questions: events.length,
        accuracy: totalMarks ? Math.round((earnedMarks / totalMarks) * 100) : 0,
        activeDays: active.size,
        streak,
        dueCards: (cards ?? []).filter((card) => card.state !== "mastered" && new Date(card.due_at).getTime() <= Date.now()).length,
      },
      recommendation: topics.find((topic) => topic.questions >= 2) ?? null,
    });
  } catch (error) {
    console.error("[learning-intelligence GET]", error);
    return fail("Unable to load learning insights. Apply the latest Supabase migration first.", 500);
  }
}

export async function POST(request: Request) {
  const context = await authorisedStudent(request);
  if ("error" in context) return context.error;
  try {
    const body = await request.json();
    const admin = createAdminClient();
    if (body.action === "review-card") {
      if (context.profile.role !== "student") return fail("Only the student can review their cards.", 403);
      const rating = String(body.rating ?? "");
      if (!["again", "hard", "good", "easy"].includes(rating)) return fail("Invalid review rating.", 400);
      const { data: card, error } = await admin.from("student_review_cards")
        .select("id,interval_days,ease_factor,review_count")
        .eq("id", body.cardId)
        .eq("student_id", context.studentId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!card) return fail("Review card not found.", 404);
      const currentInterval = Number(card.interval_days);
      const currentEase = Number(card.ease_factor);
      const interval = rating === "again" ? 0
        : rating === "hard" ? Math.max(1, Math.round(Math.max(1, currentInterval) * 1.2))
        : rating === "good" ? (currentInterval ? Math.max(2, Math.round(currentInterval * currentEase)) : 2)
        : (currentInterval ? Math.max(4, Math.round(currentInterval * currentEase * 1.3)) : 4);
      const ease = Math.min(3.5, Math.max(1.3, currentEase + (rating === "again" ? -0.2 : rating === "hard" ? -0.05 : rating === "easy" ? 0.15 : 0)));
      const due = new Date(Date.now() + (rating === "again" ? 10 * 60_000 : interval * DAY));
      const state = rating === "easy" && Number(card.review_count) >= 2 ? "mastered" : interval > 0 ? "review" : "learning";
      const { error: updateError } = await admin.from("student_review_cards").update({
        interval_days: interval,
        ease_factor: ease,
        due_at: due.toISOString(),
        state,
        last_rating: rating,
        last_reviewed_at: new Date().toISOString(),
        review_count: Number(card.review_count) + 1,
        updated_at: new Date().toISOString(),
      }).eq("id", card.id).eq("student_id", context.studentId);
      if (updateError) throw new Error(updateError.message);
      return Response.json({
        saved: true,
        dueAt: due.toISOString(),
        state,
        intervalDays: interval,
        reviewCount: Number(card.review_count) + 1,
        lastRating: rating,
      });
    }

    if (body.action === "ensure-adaptive-quiz") {
      const { data: existing, error: existingError } = await admin.from("quiz_assignments")
        .select("id")
        .eq("student_id", context.studentId)
        .eq("assignment_source", "adaptive")
        .gte("created_at", startOfWeek(new Date()).toISOString())
        .limit(1)
        .maybeSingle();
      if (existingError) throw new Error(existingError.message);
      if (existing) return Response.json({ created: false, assignmentId: existing.id });

      const { data: rawEvents, error: eventsError } = await admin.from("student_learning_events")
        .select("source_type,question_id,course_topic_key,subtopic,family,marks_awarded,available_marks,is_correct,attempted_at")
        .eq("student_id", context.studentId)
        .gte("attempted_at", new Date(Date.now() - 120 * DAY).toISOString())
        .order("attempted_at", { ascending: false })
        .limit(2000);
      if (eventsError) throw new Error(eventsError.message);
      const topics = summariseTopics((rawEvents ?? []) as LearningEvent[]);
      const focus = topics.find((topic) => topic.questions >= 3 && topic.scorePercent < 85);
      if (!focus) return Response.json({ created: false, reason: "More marked work is needed before a smart quiz is created." });
      const config = GENERATED_ASSESSMENT_CONFIGS.find((item) => item.bankCourseTopicKey === focus.courseTopicKey);
      if (!config) return Response.json({ created: false, reason: "This topic does not have an adaptive assessment bank yet." });

      const [{ data: dueCards }, { data: bank, error: bankError }] = await Promise.all([
        admin.from("student_review_cards").select("question_id").eq("student_id", context.studentId).lte("due_at", new Date().toISOString()),
        admin.from("assessment_question_bank").select("id,marks").eq("course_topic_key", focus.courseTopicKey).eq("subtopic", focus.subtopic).eq("exposed_in_notes", false).limit(30),
      ]);
      if (bankError) throw new Error(bankError.message);
      const dueIds = new Set((dueCards ?? []).map((card) => card.question_id));
      const selected = (bank ?? []).slice().sort((a, b) => Number(dueIds.has(b.id)) - Number(dueIds.has(a.id))).slice(0, 5);
      if (!selected.length) return Response.json({ created: false, reason: "No suitable questions are available for this focus area." });
      const dueAt = new Date(Date.now() + 7 * DAY).toISOString();
      const reason = `${focus.subtopic} is currently the clearest focus area at ${focus.scorePercent}% across ${focus.questions} recent questions.`;
      const { data: assignment, error: assignmentError } = await admin.from("quiz_assignments").insert({
        tutor_id: null,
        student_id: context.studentId,
        assessment_key: config.key,
        course_topic_key: focus.courseTopicKey,
        title: `Smart review · ${focus.subtopic}`,
        subtopic: focus.subtopic,
        question_count: selected.length,
        due_at: dueAt,
        total_marks: selected.reduce((sum, question) => sum + Number(question.marks), 0),
        assignment_source: "adaptive",
        recommendation_reason: reason,
      }).select("id").single();
      if (assignmentError) throw new Error(assignmentError.message);
      const { error: questionError } = await admin.from("quiz_assignment_questions").insert(selected.map((question, index) => ({
        assignment_id: assignment.id,
        question_id: question.id,
        question_order: index + 1,
      })));
      if (questionError) {
        await admin.from("quiz_assignments").delete().eq("id", assignment.id);
        throw new Error(questionError.message);
      }
      return Response.json({ created: true, assignmentId: assignment.id, reason });
    }
    return fail("Invalid learning action.", 400);
  } catch (error) {
    console.error("[learning-intelligence POST]", error);
    return fail("Unable to update learning insights.", 500);
  }
}
