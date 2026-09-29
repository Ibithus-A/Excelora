import { hasChapterAccess, hasPlusAccess } from "@/lib/access";
import { loadExposure } from "@/lib/question-bank/repository.server";
import { getAssessmentConfig } from "@/lib/assessment-config";
import type { BankQuestion } from "@/lib/question-bank/bank-types";
import { markBankResponse } from "@/lib/question-bank/marking.server";
import { calculateSubtopicResults, selectAssessmentQuestions, selectSynopticAssessmentQuestions } from "@/lib/question-bank/selector";
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
  let query = admin.from("student_topic_progress").select("topic_title,chapter_title,status,watched_video")
    .eq("student_id", studentId);
  query = config.scope === "subject"
    ? query.eq("subject_title", config.subjectTitle)
    : query.eq("chapter_title", config.chapterTitle);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const complete = new Set((data ?? []).filter((r) => r.status === "completed" || r.watched_video).map((r) =>
    `${String(r.chapter_title ?? "").trim().toLowerCase()}::${String(r.topic_title).trim().toLowerCase()}`,
  ));
  const count = config.requiredModules.filter((module) => complete.has(
    `${module.chapterTitle.trim().toLowerCase()}::${module.title.trim().toLowerCase()}`,
  )).length;
  return { isComplete: count === config.requiredModules.length, completedCount: count, totalCount: config.requiredModules.length };
}

function hasAssessmentAccess(
  profile: Parameters<typeof hasChapterAccess>[0],
  config: NonNullable<ReturnType<typeof getAssessmentConfig>>,
) {
  if (config.scope === "chapter") return hasChapterAccess(profile, config.chapterTitle);
  return config.requiredModules.every((module) => hasChapterAccess(profile, module.chapterTitle));
}

function selectPaper(
  config: NonNullable<ReturnType<typeof getAssessmentConfig>>,
  questions: BankQuestion[],
  exposure: Awaited<ReturnType<typeof loadExposure>>,
) {
  return config.scope === "subject"
    ? selectSynopticAssessmentQuestions({ questions, courseTopicKeys: config.bankCourseTopicKeys, exposure })
    : selectAssessmentQuestions({ questions, courseTopicKey: config.bankCourseTopicKey, exposure });
}

async function presentAttempt(attemptId: string, reveal: boolean) {
  const admin = createAdminClient();
  const { data: attempt, error } = await admin.from("student_assessment_attempts").select("*").eq("id", attemptId).single();
  if (error) throw new Error(error.message);
  const questionFields = reveal
    ? `${PUBLIC_FIELDS}, answer, worked_solution`
    : PUBLIC_FIELDS;
  const { data: rows, error: rowsError } = await admin.from("student_assessment_attempt_questions")
    .select(`question_order,student_answer,submission_state,marks_awarded,is_correct,review_status,reviewed_at,assessment_question_bank(${questionFields})`)
    .eq("attempt_id", attemptId).order("question_order");
  if (rowsError) throw new Error(rowsError.message);
  const questions = (rows ?? []).map((row) => {
    const raw = Array.isArray(row.assessment_question_bank) ? row.assessment_question_bank[0] : row.assessment_question_bank;
    const safe = { ...(raw as Record<string, unknown>) };
    if (!reveal) { delete safe.answer; delete safe.worked_solution; }
    return { order: row.question_order, response: row.student_answer, state: row.submission_state, ...(reveal ? { marksAwarded: row.marks_awarded, isCorrect: row.is_correct, reviewStatus: row.review_status, reviewedAt: row.reviewed_at } : {}), ...safe };
  });
  const publicAttempt = { id: attempt.id, status: attempt.status, attempt_number: attempt.attempt_number, total_marks: attempt.total_marks, deadline_at: attempt.deadline_at, questions };
  return reveal ? { ...publicAttempt, score: attempt.score, percentage: attempt.percentage, pending_review_marks: attempt.pending_review_marks } : publicAttempt;
}

export async function GET(request: Request) {
  const context = await viewer(); if (!context) return fail("Unauthorized.", 401);
  try {
    const key = new URL(request.url).searchParams.get("assessmentKey") ?? "";
    const config = getAssessmentConfig(key); if (!config) return fail("Unknown assessment.", 400);
    if (context.profile.role === "student" && config.minimumStudentPlan === "plus" && !hasPlusAccess(context.profile.plan)) {
      return Response.json({ assessment: config, requiresPremium: true, isUnlocked: false, attempt: null });
    }
    if (context.profile.role === "student" && !hasAssessmentAccess(context.profile, config)) return fail("Required course content is locked.", 403);
    const studentId = context.profile.role === "tutor" ? new URL(request.url).searchParams.get("studentId") : context.user.id;
    if (!studentId) {
      const admin = createAdminClient();
      const { data, error } = await admin.from("assessment_question_bank").select(`${PUBLIC_FIELDS},answer,worked_solution`).in("course_topic_key", config.bankCourseTopicKeys).eq("exposed_in_notes", false);
      if (error) throw new Error(error.message);
      const selected = selectPaper(config, (data ?? []).map((row) => toQuestion(row)), []);
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
    return Response.json({ assessment: config, prerequisite: requirement, isUnlocked: requirement.isComplete && (!config.requiresTutorUnlock || Boolean(access?.is_unlocked)), attempt: latest ? await presentAttempt(latest.id, latest.status === "submitted" || context.profile.role === "tutor") : null });
  } catch (error) { console.error("[generated assessment GET]", error); return fail("Unable to load assessment.", 500); }
}

export async function POST(request: Request) {
  const context = await viewer(); if (!context) return fail("Unauthorized.", 401);
  try {
    const body = await request.json() as { action?: string; assessmentKey?: string; attemptId?: string; questionId?: string; answers?: Record<string, string> };
    const config = getAssessmentConfig(body.assessmentKey ?? ""); if (!config) return fail("Unknown assessment.", 400);
    if (context.profile.role === "tutor" && body.action === "preview-check") {
      const ids = Object.keys(body.answers ?? {}).slice(0, config.questionCount);
      const { data, error } = await createAdminClient().from("assessment_question_bank").select("id,response_type,answer,worked_solution,marks").in("course_topic_key", config.bankCourseTopicKeys).in("id", ids);
      if (error) throw new Error(error.message);
      return Response.json({ grades: (data ?? []).map(q => ({ id: q.id, ...markBankResponse(q.response_type, body.answers?.[q.id] ?? "", { questionId: q.id, answer: q.answer, workedSolution: q.worked_solution }, q.marks) })) });
    }
    if (context.profile.role !== "student") return fail("Tutor previews do not create student records.", 400);
    if (config.minimumStudentPlan === "plus" && !hasPlusAccess(context.profile.plan)) return fail("This assessment requires Plus or Pro.", 403);
    if (!hasAssessmentAccess(context.profile, config)) return fail("Required course content is locked.", 403);
    const admin = createAdminClient();
    if (body.action === "start" || body.action === "retake") {
      const requirement = await prerequisite(context.user.id, config); if (!requirement.isComplete) return fail("Complete every chapter module first.", 403);
      if (config.requiresTutorUnlock) {
        const { data: access } = await admin.from("student_assessment_access").select("is_unlocked").eq("student_id", context.user.id).eq("assessment_key", config.key).maybeSingle();
        if (!access?.is_unlocked) return fail("This assessment is locked.", 403);
      }
      const { data: active } = await admin.from("student_assessment_attempts").select("id").eq("student_id", context.user.id).eq("assessment_key", config.key).eq("status", "active").maybeSingle();
      if (active) return Response.json({ attempt: await presentAttempt(active.id, false) });
      const [{ data: rawQuestions, error: bankError }, exposure] = await Promise.all([
        admin.from("assessment_question_bank").select(PUBLIC_FIELDS).in("course_topic_key", config.bankCourseTopicKeys).eq("exposed_in_notes", false),
        Promise.all(config.bankCourseTopicKeys.map((topic) => loadExposure(context.user.id, topic))).then((rows) => rows.flat()),
      ]);
      if (bankError) throw new Error(bankError.message);
      const selected = selectPaper(config, (rawQuestions ?? []).map(toQuestion), exposure);
      const rpc = config.scope === "subject" ? "start_synoptic_assessment" : "start_generated_assessment";
      const parameters = config.scope === "subject"
        ? { p_student: context.user.id, p_key: config.key, p_subject: config.subjectTitle, p_duration: config.durationSeconds, p_topics: config.bankCourseTopicKeys, p_ids: selected.map(q => q.id) }
        : { p_student: context.user.id, p_key: config.key, p_topic: config.bankCourseTopicKey, p_duration: config.durationSeconds, p_ids: selected.map(q => q.id) };
      const { data: attemptId, error: startError } = await admin.rpc(rpc, parameters);
      if (startError) throw new Error(startError.message);
      const attempt = { id: String(attemptId) };
      return Response.json({ attempt: await presentAttempt(attempt.id, false) });
    }
    if (!body.attemptId || !body.answers || !["save", "submit", "lock"].includes(body.action ?? "")) return fail("Invalid assessment action.", 400);
    const { data: attempt } = await admin.from("student_assessment_attempts").select("id,status,student_id,total_marks,deadline_at").eq("id", body.attemptId).eq("assessment_key", config.key).eq("student_id", context.user.id).maybeSingle();
    if (!attempt || attempt.status !== "active") return fail("This assessment is no longer active.", 409);
    const expired = new Date(attempt.deadline_at).getTime() <= Date.now();
    if (expired && body.action !== "submit") return fail("The assessment time has expired.", 409);
    const entries = Object.entries(expired ? {} : body.answers).filter(([id, answer]) => id.length < 200 && typeof answer === "string" && answer.length <= 150000);
    if (!expired) {
      const { error } = await admin.rpc("save_generated_answers", { p_student: context.user.id, p_attempt: attempt.id, p_answers: Object.fromEntries(entries) });
      if (error) throw new Error(error.message);
    }
    if (body.action === "save") return Response.json({ attempt: await presentAttempt(attempt.id, false) });
    const { data: paper, error: paperError } = await admin.from("student_assessment_attempt_questions").select("question_id,student_answer,assessment_question_bank(id,subtopic,family,marks,response_type,answer,worked_solution,course_topic_key)").eq("attempt_id", attempt.id);
    if (paperError) throw new Error(paperError.message);
    const awarded: Record<string, number> = {};
    const grades = (paper ?? []).map(row => {
      const q = (Array.isArray(row.assessment_question_bank) ? row.assessment_question_bank[0] : row.assessment_question_bank) as Record<string, unknown>;
      const response = String((row.student_answer as { value?: string })?.value ?? "");
      const marked = markBankResponse(String(q.response_type), response, { questionId: String(q.id), answer: String(q.answer), workedSolution: String(q.worked_solution) }, Number(q.marks));
      awarded[row.question_id] = marked.marks;
      return { id: row.question_id, response, marks: marked.marks, correct: marked.isCorrect, review: marked.requiresReview };
    });
    if (body.action === "lock") {
      const grade = grades.find(q => q.id === body.questionId);
      if (!grade) return fail("Question not in this paper.", 400);
      const { error } = await admin.rpc("lock_generated_answer", { p_student: context.user.id, p_attempt: attempt.id, p_question: grade.id, p_response: grade.response, p_marks: grade.marks, p_correct: grade.correct });
      if (error) throw new Error(error.message);
      return Response.json({ attempt: await presentAttempt(attempt.id, false) });
    }
    const { error: submitError } = await admin.rpc("submit_generated_assessment", { p_student: context.user.id, p_attempt: attempt.id, p_grades: grades });
    if (submitError) throw new Error(submitError.message);
    const pendingIds = new Set(grades.filter(grade => grade.review).map(grade => grade.id));
    const publicQuestions = (paper ?? []).filter(row => !pendingIds.has(row.question_id)).map(row => { const q = (Array.isArray(row.assessment_question_bank) ? row.assessment_question_bank[0] : row.assessment_question_bank) as Record<string, unknown>; return { id: String(q.id), subtopic: String(q.subtopic), marks: Number(q.marks) }; });
    return Response.json({ attempt: await presentAttempt(attempt.id, true), subtopics: calculateSubtopicResults(publicQuestions, awarded) });
  } catch (error) { console.error("[generated assessment POST]", error); return fail("Unable to update assessment.", 500); }
}
