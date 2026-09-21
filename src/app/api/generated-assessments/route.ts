import { getAssessmentConfig } from "@/lib/assessment-config";
import type { BankQuestion, QuestionExposure } from "@/lib/question-bank/bank-types";
import { markBankResponse } from "@/lib/question-bank/marking.server";
import { calculateSubtopicResults, selectAssessmentQuestions } from "@/lib/question-bank/selector";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewerProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const PUBLIC_FIELDS = "id, qualification, domain, course_stage, course_topic_key, chapter, subtopic, spec_refs, family, variant, difficulty, marks, response_type, prompt, tags, fingerprint, exposed_in_notes";

const fail = (error: string, status: number) => Response.json({ error }, { status });
async function viewer() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const profile = await getViewerProfile(client, user.id);
  return profile ? { user, profile } : null;
}
function toQuestion(row: Record<string, unknown>): BankQuestion {
  return {
    id: String(row.id), qualification: String(row.qualification), domain: String(row.domain),
    courseStage: row.course_stage ? String(row.course_stage) : null,
    courseTopicKey: String(row.course_topic_key), chapter: String(row.chapter),
    subtopic: String(row.subtopic), specRefs: (row.spec_refs as string[]) ?? [], family: String(row.family),
    variant: Number(row.variant), difficulty: row.difficulty as BankQuestion["difficulty"],
    marks: Number(row.marks), responseType: String(row.response_type), prompt: String(row.prompt),
    tags: (row.tags as string[]) ?? [], fingerprint: String(row.fingerprint), exposedInNotes: Boolean(row.exposed_in_notes),
  };
}

async function prerequisite(studentId: string, config: NonNullable<ReturnType<typeof getAssessmentConfig>>) {
  const admin = createAdminClient();
  const { data, error } = await admin.from("student_topic_progress").select("topic_title,status,watched_video")
    .eq("student_id", studentId).eq("chapter_title", config.chapterTitle);
  if (error) throw new Error(error.message);
  const complete = new Set((data ?? []).filter((r) => r.status === "completed" || r.watched_video).map((r) => String(r.topic_title).trim().toLowerCase()));
  const count = config.requiredModuleTitles.filter((title) => complete.has(title.trim().toLowerCase())).length;
  return { isComplete: count === config.requiredModuleTitles.length, completedCount: count, totalCount: config.requiredModuleTitles.length };
}

async function presentAttempt(attemptId: string, reveal: boolean) {
  const admin = createAdminClient();
  const { data: attempt, error } = await admin.from("student_assessment_attempts").select("*").eq("id", attemptId).single();
  if (error) throw new Error(error.message);
  const questionFields = reveal
    ? `${PUBLIC_FIELDS}, answer, worked_solution`
    : PUBLIC_FIELDS;
  const { data: rows, error: rowsError } = await admin.from("student_assessment_attempt_questions")
    .select(`question_order,student_answer,submission_state,marks_awarded,is_correct,assessment_question_bank(${questionFields})`)
    .eq("attempt_id", attemptId).order("question_order");
  if (rowsError) throw new Error(rowsError.message);
  const questions = (rows ?? []).map((row) => {
    const raw = Array.isArray(row.assessment_question_bank) ? row.assessment_question_bank[0] : row.assessment_question_bank;
    const safe = { ...(raw as Record<string, unknown>) };
    if (!reveal) { delete safe.answer; delete safe.worked_solution; }
    return { order: row.question_order, response: row.student_answer, state: row.submission_state, marksAwarded: row.marks_awarded, isCorrect: row.is_correct, ...safe };
  });
  return { ...attempt, questions };
}

export async function GET(request: Request) {
  const context = await viewer(); if (!context) return fail("Unauthorized.", 401);
  try {
    const key = new URL(request.url).searchParams.get("assessmentKey") ?? "";
    const config = getAssessmentConfig(key); if (!config) return fail("Unknown assessment.", 400);
    if (context.profile.role === "student" && config.minimumStudentPlan === "premium" && context.profile.plan !== "premium") {
      return Response.json({ assessment: config, requiresPremium: true, isUnlocked: false, attempt: null });
    }
    const studentId = context.profile.role === "tutor" ? new URL(request.url).searchParams.get("studentId") : context.user.id;
    if (!studentId) {
      const admin = createAdminClient();
      const { data, error } = await admin.from("assessment_question_bank").select(`${PUBLIC_FIELDS},answer,worked_solution`).eq("course_topic_key", config.bankCourseTopicKey).eq("exposed_in_notes", false);
      if (error) throw new Error(error.message);
      const selected = selectAssessmentQuestions({ questions: (data ?? []).map((row) => toQuestion(row)), courseTopicKey: config.bankCourseTopicKey, exposure: [] });
      const secrets = new Map((data ?? []).map((row) => [row.id, row]));
      return Response.json({ assessment: config, tutorPreview: true, attempt: {
        id: "tutor-preview", status: "active", attempt_number: 0,
        total_marks: selected.reduce((sum, question) => sum + question.marks, 0),
        questions: selected.map((question, index) => ({ order: index + 1, ...question, answer: secrets.get(question.id)?.answer, worked_solution: secrets.get(question.id)?.worked_solution })),
      } });
    }
    const admin = createAdminClient();
    const [{ data: access, error: accessError }, requirement, { data: latest, error: attemptError }] = await Promise.all([
      admin.from("student_assessment_access").select("is_unlocked").eq("student_id", studentId).eq("assessment_key", key).maybeSingle(),
      prerequisite(studentId, config),
      admin.from("student_assessment_attempts").select("id,status").eq("student_id", studentId).eq("assessment_key", key).eq("is_legacy", false).order("attempt_number", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (accessError || attemptError) throw new Error(accessError?.message ?? attemptError?.message);
    return Response.json({ assessment: config, prerequisite: requirement, isUnlocked: requirement.isComplete && Boolean(access?.is_unlocked), attempt: latest ? await presentAttempt(latest.id, latest.status === "submitted" || context.profile.role === "tutor") : null });
  } catch (error) { console.error("[generated assessment GET]", error); return fail("Unable to load assessment.", 500); }
}

export async function POST(request: Request) {
  const context = await viewer(); if (!context) return fail("Unauthorized.", 401);
  try {
    const body = await request.json() as { action?: string; assessmentKey?: string; attemptId?: string; answers?: Record<string, string> };
    const config = getAssessmentConfig(body.assessmentKey ?? ""); if (!config) return fail("Unknown assessment.", 400);
    if (context.profile.role !== "student") return fail("Tutor previews do not create student records.", 400);
    if (config.minimumStudentPlan === "premium" && context.profile.plan !== "premium") return fail("This assessment requires Premium.", 403);
    const admin = createAdminClient();
    if (body.action === "start" || body.action === "retake") {
      const requirement = await prerequisite(context.user.id, config); if (!requirement.isComplete) return fail("Complete every chapter module first.", 403);
      const { data: access } = await admin.from("student_assessment_access").select("is_unlocked").eq("student_id", context.user.id).eq("assessment_key", config.key).maybeSingle();
      if (!access?.is_unlocked) return fail("This assessment is locked.", 403);
      const { data: active } = await admin.from("student_assessment_attempts").select("id").eq("student_id", context.user.id).eq("assessment_key", config.key).eq("status", "active").maybeSingle();
      if (active) return Response.json({ attempt: await presentAttempt(active.id, false) });
      const [{ data: rawQuestions, error: bankError }, { data: rawExposure, error: exposureError }, { data: previous }] = await Promise.all([
        admin.from("assessment_question_bank").select(PUBLIC_FIELDS).eq("course_topic_key", config.bankCourseTopicKey).eq("exposed_in_notes", false),
        admin.from("student_question_exposure").select("question_id,family,times_seen,last_seen_at").eq("student_id", context.user.id).eq("course_topic_key", config.bankCourseTopicKey),
        admin.from("student_assessment_attempts").select("attempt_number").eq("student_id", context.user.id).eq("assessment_key", config.key).order("attempt_number", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (bankError || exposureError) throw new Error(bankError?.message ?? exposureError?.message);
      const questions = (rawQuestions ?? []).map((row) => toQuestion(row));
      const exposure: QuestionExposure[] = (rawExposure ?? []).map((r) => ({ questionId: r.question_id, family: r.family, timesSeen: r.times_seen, lastSeenAt: r.last_seen_at }));
      const selected = selectAssessmentQuestions({ questions, courseTopicKey: config.bankCourseTopicKey, exposure });
      const now = new Date(); const totalMarks = selected.reduce((sum, q) => sum + q.marks, 0);
      const { data: attempt, error: insertError } = await admin.from("student_assessment_attempts").insert({
        student_id: context.user.id, assessment_key: config.key, bank_course_topic_key: config.bankCourseTopicKey,
        attempt_number: Number(previous?.attempt_number ?? 0) + 1, question_count: 15, total_marks: totalMarks,
        duration_seconds: config.durationSeconds, answers: {}, locked_questions: [], status: "active", is_legacy: false,
        started_at: now.toISOString(), deadline_at: new Date(now.getTime() + config.durationSeconds * 1000).toISOString(), updated_at: now.toISOString(),
      }).select("id").single();
      if (insertError) throw new Error(insertError.message);
      const { error: paperError } = await admin.from("student_assessment_attempt_questions").insert(selected.map((q, index) => ({ attempt_id: attempt.id, question_id: q.id, question_order: index + 1 })));
      if (paperError) throw new Error(paperError.message);
      for (const q of selected) {
        const old = exposure.find((e) => e.questionId === q.id);
        const { error } = await admin.from("student_question_exposure").upsert({ student_id: context.user.id, question_id: q.id, family: q.family, course_topic_key: q.courseTopicKey, subtopic: q.subtopic, first_seen_at: old ? undefined : now.toISOString(), last_seen_at: now.toISOString(), times_seen: (old?.timesSeen ?? 0) + 1, last_attempt_id: attempt.id }, { onConflict: "student_id,question_id" });
        if (error) throw new Error(error.message);
      }
      return Response.json({ attempt: await presentAttempt(attempt.id, false) });
    }
    if (!body.attemptId || !body.answers || !["save", "submit"].includes(body.action ?? "")) return fail("Invalid assessment action.", 400);
    const { data: attempt } = await admin.from("student_assessment_attempts").select("id,status,student_id,total_marks,deadline_at").eq("id", body.attemptId).eq("student_id", context.user.id).maybeSingle();
    if (!attempt || attempt.status !== "active") return fail("This assessment is no longer active.", 409);
    const expired = new Date(attempt.deadline_at).getTime() <= Date.now();
    if (expired && body.action === "save") return fail("The assessment time has expired.", 409);
    const entries = Object.entries(expired ? {} : body.answers).filter(([id, answer]) => id.length < 200 && typeof answer === "string" && answer.length <= 150000);
    for (const [questionId, answer] of entries) {
      const { error } = await admin.from("student_assessment_attempt_questions").update({ student_answer: { value: answer }, submission_state: answer.trim() ? "draft" : "unanswered", updated_at: new Date().toISOString() }).eq("attempt_id", attempt.id).eq("question_id", questionId);
      if (error) throw new Error(error.message);
    }
    if (body.action === "save") return Response.json({ attempt: await presentAttempt(attempt.id, false) });
    const { data: paper, error: paperError } = await admin.from("student_assessment_attempt_questions").select("question_id,student_answer,assessment_question_bank(id,subtopic,family,marks,response_type,answer,worked_solution,course_topic_key)").eq("attempt_id", attempt.id);
    if (paperError) throw new Error(paperError.message);
    let score = 0; let reviewMarks = 0; const awarded: Record<string, number> = {}; const now = new Date().toISOString();
    for (const row of paper ?? []) {
      const q = (Array.isArray(row.assessment_question_bank) ? row.assessment_question_bank[0] : row.assessment_question_bank) as Record<string, unknown>;
      const answer = String((row.student_answer as { value?: string })?.value ?? "");
      const marked = markBankResponse(String(q.response_type), answer, { questionId: String(q.id), answer: String(q.answer), workedSolution: String(q.worked_solution) }, Number(q.marks));
      score += marked.marks; if (marked.requiresReview) reviewMarks += Number(q.marks); awarded[String(q.id)] = marked.marks;
      await admin.from("student_assessment_attempt_questions").update({ submission_state: "marked", marks_awarded: marked.marks, is_correct: marked.isCorrect, marked_at: now, updated_at: now }).eq("attempt_id", attempt.id).eq("question_id", row.question_id);
      await admin.from("student_question_attempt_history").upsert({ student_id: context.user.id, attempt_id: attempt.id, question_id: row.question_id, family: q.family, course_topic_key: q.course_topic_key, subtopic: q.subtopic, marks_awarded: marked.marks, available_marks: q.marks, is_correct: marked.isCorrect, attempted_at: now }, { onConflict: "attempt_id,question_id" });
      const { data: exposureRow } = await admin.from("student_question_exposure").select("times_attempted,total_marks_awarded").eq("student_id", context.user.id).eq("question_id", row.question_id).single();
      await admin.from("student_question_exposure").update({ times_attempted: Number(exposureRow?.times_attempted ?? 0) + 1, total_marks_awarded: Number(exposureRow?.total_marks_awarded ?? 0) + marked.marks, last_correct: marked.isCorrect, last_attempt_id: attempt.id, last_seen_at: now }).eq("student_id", context.user.id).eq("question_id", row.question_id);
    }
    const publicQuestions = (paper ?? []).map((row) => { const q = (Array.isArray(row.assessment_question_bank) ? row.assessment_question_bank[0] : row.assessment_question_bank) as Record<string, unknown>; return { id: String(q.id), subtopic: String(q.subtopic), marks: Number(q.marks) }; });
    const percentage = attempt.total_marks ? Math.round((score / attempt.total_marks) * 10000) / 100 : 0;
    const { error: submitError } = await admin.from("student_assessment_attempts").update({ status: "submitted", submitted_at: now, updated_at: now, score, automated_total_marks: attempt.total_marks - reviewMarks, pending_review_marks: reviewMarks, percentage, question_scores: awarded, marking_version: "bank-v1-safe-marker", last_marked_at: now }).eq("id", attempt.id).eq("status", "active");
    if (submitError) throw new Error(submitError.message);
    return Response.json({ attempt: await presentAttempt(attempt.id, true), subtopics: calculateSubtopicResults(publicQuestions, awarded) });
  } catch (error) { console.error("[generated assessment POST]", error); return fail("Unable to update assessment.", 500); }
}
