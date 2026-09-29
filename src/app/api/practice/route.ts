import { hasChapterAccess } from "@/lib/access";
import { getAssessmentConfig } from "@/lib/assessment-config";
import { markBankResponse } from "@/lib/question-bank/marking.server";
import {
  PRACTICE_COUNTS,
  selectPracticeQuestions,
  type PracticeDifficulty,
} from "@/lib/question-bank/practice-selector";
import {
  loadBank,
  loadExposure,
  PUBLIC_BANK_FIELDS,
} from "@/lib/question-bank/repository.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getViewerProfile } from "@/lib/supabase/profiles";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const fail = (error: string, status: number) =>
  Response.json({ error }, { status });
async function viewer() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  return getViewerProfile(client, user.id);
}
async function present(sessionId: string, studentId: string) {
  const admin = createAdminClient();
  const { data: session, error } = await admin
    .from("practice_sessions")
    .select(
      "id,course_topic_key,subtopic,difficulty,question_count,status,created_at,continuous",
    )
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!session) return null;
  const { data: rows, error: rowError } = await admin
    .from("practice_session_questions")
    .select(
      `question_id,question_order,response,marks_awarded,is_correct,requires_review,review_status,reviewed_at,checked_at,assessment_question_bank(${PUBLIC_BANK_FIELDS})`,
    )
    .eq("session_id", session.id)
    .order("question_order");
  if (rowError) throw new Error(rowError.message);
  const checked = (rows ?? [])
    .filter((r) => r.checked_at)
    .map((r) => r.question_id);
  const solutions = new Map<
    string,
    { answer: string; worked_solution: string }
  >();
  if (checked.length) {
    const { data, error } = await admin
      .from("assessment_question_bank")
      .select("id,answer,worked_solution")
      .in("id", checked);
    if (error) throw new Error(error.message);
    for (const q of data ?? []) solutions.set(q.id, q);
  }
  return {
    ...session,
    questions: (rows ?? []).map((r) => ({
      ...r,
      ...(Array.isArray(r.assessment_question_bank)
        ? r.assessment_question_bank[0]
        : r.assessment_question_bank),
      assessment_question_bank: undefined,
      ...(r.checked_at ? solutions.get(r.question_id) : {}),
    })),
  };
}
export async function GET(request: Request) {
  const profile = await viewer();
  if (!profile) return fail("Unauthorized.", 401);
  try {
    const url = new URL(request.url);
    const config = getAssessmentConfig(
      url.searchParams.get("assessmentKey") ?? "",
    );
    if (!config) return fail("Unknown chapter.", 400);
    if (
      profile.role === "student" &&
      !hasChapterAccess(profile, config.chapterTitle)
    )
      return fail("Chapter locked.", 403);
    if (profile.role === "student") {
      const { data, error } = await createAdminClient()
        .from("student_assessment_attempts")
        .select("id")
        .eq("student_id", profile.id)
        .eq("status", "active")
        .limit(1);
      if (error) throw new Error(error.message);
      if (data?.length)
        return fail(
          "Finish your active formal assessment before practising.",
          403,
        );
    }
    const sessionId = url.searchParams.get("sessionId");
    if (sessionId) {
      const session = await present(sessionId, profile.id);
      return session && session.course_topic_key === config.bankCourseTopicKey
        ? Response.json({ session })
        : fail("Session not found.", 404);
    }
    const questions = await loadBank(config.bankCourseTopicKey);
    const subtopics = [...new Set(questions.map((q) => q.subtopic))]
      .sort()
      .map((title) => ({
        title,
        counts: Object.fromEntries(
          ["balanced", "Foundation", "Standard", "Stretch"].map((d) => [
            d,
            questions.filter(
              (q) =>
                q.subtopic === title &&
                !q.exposedInNotes &&
                (d === "balanced" || q.difficulty === d),
            ).length,
          ]),
        ),
      }));
    if (profile.role === "tutor")
      return Response.json({
        subtopics,
        preview: true,
      });
    return Response.json({ subtopics, preview: false });
  } catch (error) {
    console.error("[practice GET]", error);
    return fail("Unable to load practice.", 500);
  }
}
export async function POST(request: Request) {
  const profile = await viewer();
  if (!profile) return fail("Unauthorized.", 401);
  try {
    const body = await request.json();
    const config = getAssessmentConfig(body.assessmentKey ?? "");
    if (!config) return fail("Unknown chapter.", 400);
    if (
      profile.role === "student" &&
      !hasChapterAccess(profile, config.chapterTitle)
    )
      return fail("Chapter locked.", 403);
    const admin = createAdminClient();
    if (profile.role === "student") {
      const { data, error } = await admin
        .from("student_assessment_attempts")
        .select("id")
        .eq("student_id", profile.id)
        .eq("status", "active")
        .limit(1);
      if (error) throw new Error(error.message);
      if (data?.length)
        return fail(
          "Finish your active formal assessment before practising.",
          403,
        );
    }
    if (body.action === "start") {
      const count = Number(body.count ?? 5);
      const difficulty = (body.difficulty ?? "balanced") as PracticeDifficulty;
      if (
        !(PRACTICE_COUNTS as readonly number[]).includes(count) ||
        count < 5 ||
        !["balanced", "Foundation", "Standard", "Stretch"].includes(
          difficulty,
        ) ||
        typeof body.subtopic !== "string" ||
        body.subtopic.length > 250
      )
        return fail("Invalid practice selection.", 400);
      const [questions, exposure] = await Promise.all([
        loadBank(config.bankCourseTopicKey),
        profile.role === "tutor"
          ? Promise.resolve([])
          : loadExposure(profile.id, config.bankCourseTopicKey),
      ]);
      let selected;
      try {
        selected = selectPracticeQuestions({
          questions,
          exposure,
          courseTopicKey: config.bankCourseTopicKey,
          subtopic: body.subtopic,
          count,
          difficulty,
        });
      } catch (error) {
        return fail(
          error instanceof Error ? error.message : "Invalid selection.",
          400,
        );
      }
      if (profile.role === "tutor")
        return Response.json({
          session: {
            id: "preview",
            status: "active",
            preview: true,
            subtopic: body.subtopic,
            questions: selected.map((q) => ({
              ...q,
              question_id: q.id,
              response: "",
              checked_at: null,
            })),
          },
        });
      const { data, error } = await admin.rpc("start_practice_run", {
        p_student: profile.id,
        p_topic: config.bankCourseTopicKey,
        p_subtopic: body.subtopic,
        p_difficulty: difficulty,
        p_ids: selected.map((q) => q.id),
      });
      if (error) throw new Error(error.message);
      return Response.json({
        session: await present(String(data), profile.id),
      });
    }
    if (body.action === "stop" || body.action === "next") {
      if (body.sessionId === "preview") {
        if (profile.role !== "tutor")
          return fail("Preview is for tutors.", 403);
        return Response.json({ stopped: body.action === "stop" });
      }
      const current = await present(body.sessionId, profile.id);
      if (!current || current.course_topic_key !== config.bankCourseTopicKey)
        return fail("Session not found.", 404);
      if (body.action === "stop") {
        const hasAttempt = current.questions.some((question) =>
          Boolean(question.checked_at),
        );
        if (!hasAttempt) {
          const { error } = await admin
            .from("practice_sessions")
            .delete()
            .eq("id", current.id)
            .eq("student_id", profile.id)
            .eq("status", "active");
          if (error) throw error;
          return Response.json({ session: null, discarded: true });
        }
        const { error } = await admin.rpc("stop_practice_run", {
          p_student: profile.id,
          p_session: current.id,
        });
        if (error) throw error;
      } else {
        const bank = (await loadBank(config.bankCourseTopicKey)).filter(
          (q) => !current.questions.some((old) => old.question_id === q.id),
        );
        const eligible = bank.filter(
          (q) =>
            (!current.subtopic || q.subtopic === current.subtopic) &&
            (current.difficulty === "balanced" ||
              q.difficulty === current.difficulty),
        );
        if (!eligible.length)
          return Response.json({ session: current, exhausted: true });
        const selected = selectPracticeQuestions({
          questions: bank,
          exposure: await loadExposure(profile.id, config.bankCourseTopicKey),
          courseTopicKey: config.bankCourseTopicKey,
          subtopic: current.subtopic,
          count: Math.min(5, eligible.length),
          difficulty: current.difficulty as PracticeDifficulty,
        });
        const { error } = await admin.rpc("extend_practice_run", {
          p_student: profile.id,
          p_session: current.id,
          p_ids: selected.map((q) => q.id),
        });
        if (error) throw error;
      }
      return Response.json({ session: await present(current.id, profile.id) });
    }
    if (
      !["check", "save"].includes(body.action) ||
      typeof body.response !== "string" ||
      body.response.length > 150000
    )
      return fail("Invalid practice action.", 400);
    if (body.sessionId === "preview") {
      if (profile.role !== "tutor") return fail("Preview is for tutors.", 403);
      const { data: q, error } = await admin
        .from("assessment_question_bank")
        .select(
          "id,answer,worked_solution,response_type,marks,course_topic_key",
        )
        .eq("id", body.questionId)
        .eq("course_topic_key", config.bankCourseTopicKey)
        .single();
      if (error || !q) return fail("Question not found.", 404);
      if (body.action === "save")
        return Response.json({
          previewQuestion: { id: q.id, response: body.response },
        });
      const grade = markBankResponse(
        q.response_type,
        body.response,
        {
          questionId: q.id,
          answer: q.answer,
          workedSolution: q.worked_solution,
        },
        q.marks,
      );
      return Response.json({
        previewQuestion: {
          id: q.id,
          response: body.response,
          checked_at: new Date().toISOString(),
          answer: q.answer,
          worked_solution: q.worked_solution,
          marks_awarded: grade.marks,
          is_correct: grade.isCorrect,
          requires_review: grade.requiresReview,
        },
      });
    }
    const session = await present(body.sessionId, profile.id);
    if (!session || session.course_topic_key !== config.bankCourseTopicKey)
      return fail("Session not found.", 404);
    const question = session.questions.find(
      (q) => q.question_id === body.questionId,
    );
    if (!question) return fail("Question not in session.", 400);
    if (body.action === "save") {
      const { error } = await admin.rpc("save_practice_draft", {
        p_student: profile.id,
        p_session: session.id,
        p_question: question.question_id,
        p_response: body.response,
      });
      if (error) throw new Error(error.message);
      return Response.json({ session: await present(session.id, profile.id) });
    }
    if (!question.checked_at) {
      const { data: q, error } = await admin
        .from("assessment_question_bank")
        .select("id,answer,worked_solution,response_type,marks")
        .eq("id", question.question_id)
        .single();
      if (error) throw new Error(error.message);
      const grade = markBankResponse(
        q.response_type,
        body.response,
        {
          questionId: q.id,
          answer: q.answer,
          workedSolution: q.worked_solution,
        },
        q.marks,
      );
      const { error: checkError } = await admin.rpc("check_practice", {
        p_student: profile.id,
        p_session: session.id,
        p_question: q.id,
        p_response: body.response,
        p_marks: grade.marks,
        p_correct: grade.isCorrect,
        p_review: grade.requiresReview,
      });
      if (checkError) throw new Error(checkError.message);
    }
    return Response.json({ session: await present(session.id, profile.id) });
  } catch (error) {
    console.error("[practice POST]", error);
    return fail("Unable to save practice.", 500);
  }
}
