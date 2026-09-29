import { getStructuredLesson } from "@/lib/lessons/catalogue";
import { hasChapterAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getStudentProfileById,
  getViewerProfile,
} from "@/lib/supabase/profiles";
import { markBankResponse } from "@/lib/question-bank/marking.server";
export const dynamic = "force-dynamic";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function viewer() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  return user ? getViewerProfile(client, user.id) : null;
}

async function repairDeterministicPracticeMarks(sessionIds: string[]) {
  if (!sessionIds.length) return 0;
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("practice_session_questions")
    .select(
      "session_id,question_id,response,review_status,checked_at,assessment_question_bank(answer,worked_solution,response_type,marks)",
    )
    .in("session_id", sessionIds)
    .eq("review_status", "pending")
    .not("checked_at", "is", null);
  if (error) throw error;

  let repaired = 0;
  for (const row of rows ?? []) {
    const bank = Array.isArray(row.assessment_question_bank)
      ? row.assessment_question_bank[0]
      : row.assessment_question_bank;
    if (!bank) continue;
    const grade = markBankResponse(
      String(bank.response_type ?? ""),
      String(row.response ?? ""),
      {
        questionId: row.question_id,
        answer: String(bank.answer ?? ""),
        workedSolution: String(bank.worked_solution ?? ""),
      },
      Number(bank.marks ?? 0),
    );
    if (grade.requiresReview || grade.isCorrect === null) continue;
    const { data: updated, error: updateError } = await admin
      .from("practice_session_questions")
      .update({
        marks_awarded: grade.marks,
        is_correct: grade.isCorrect,
        requires_review: false,
        review_status: "not_required",
        reviewed_at: null,
        reviewed_by: null,
      })
      .eq("session_id", row.session_id)
      .eq("question_id", row.question_id)
      .eq("review_status", "pending")
      .select("question_id")
      .maybeSingle();
    if (updateError) throw updateError;
    if (updated) repaired += 1;
  }
  return repaired;
}

async function removeCompletedEmptyPracticeSessions(studentId: string) {
  const admin = createAdminClient();
  const { data: sessions, error } = await admin
    .from("practice_sessions")
    .select("id,practice_session_questions(checked_at)")
    .eq("student_id", studentId)
    .eq("status", "completed")
    .limit(200);
  if (error) throw error;
  const emptyIds = (sessions ?? [])
    .filter((session) =>
      session.practice_session_questions.every(
        (question) => !question.checked_at,
      ),
    )
    .map((session) => session.id);
  if (!emptyIds.length) return;
  const { error: deleteError } = await admin
    .from("practice_sessions")
    .delete()
    .eq("student_id", studentId)
    .in("id", emptyIds);
  if (deleteError) throw deleteError;
}

export async function GET(request: Request) {
  const profile = await viewer();
  if (!profile)
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  const url = new URL(request.url),
    student = url.searchParams.get("studentId") || profile.id;
  if (!UUID_PATTERN.test(student))
    return Response.json({ error: "Invalid student id." }, { status: 400 });
  if (profile.role !== "tutor" && student !== profile.id)
    return Response.json({ error: "Forbidden." }, { status: 403 });
  if (profile.role === "tutor") {
    const target = await getStudentProfileById(await createClient(), student);
    if (!target)
      return Response.json({ error: "Student not found." }, { status: 404 });
  }
  const admin = createAdminClient();
  try {
    if (url.searchParams.get("view") === "practice-history") {
      await removeCompletedEmptyPracticeSessions(student);
      const requestedOffset = Number(url.searchParams.get("offset") ?? 0);
      const offset = Number.isInteger(requestedOffset)
        ? Math.max(0, Math.min(requestedOffset, 10_000))
        : 0;
      const limit = 20;
      const loadHistoryPage = () => admin
          .from("practice_sessions")
          .select(
            "id,subtopic,course_topic_key,status,created_at,completed_at,practice_session_questions!inner(checked_at,marks_awarded,is_correct,requires_review,assessment_question_bank(marks))",
            { count: "exact" },
          )
          .eq("student_id", student)
          .not("practice_session_questions.checked_at", "is", null)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
      let { data, error, count } = await loadHistoryPage();
      if (error) throw error;
      const repaired = await repairDeterministicPracticeMarks(
        (data ?? []).map((session) => session.id),
      );
      if (repaired > 0) {
        const refreshed = await loadHistoryPage();
        data = refreshed.data;
        error = refreshed.error;
        count = refreshed.count;
        if (error) throw error;
      }
      const total = count ?? data?.length ?? 0;
      return Response.json({
        practice: data ?? [],
        total,
        hasMore: offset + (data?.length ?? 0) < total,
      });
    }
    const attemptId = url.searchParams.get("attemptId");
    if (attemptId) {
      if (!UUID_PATTERN.test(attemptId))
        return Response.json({ error: "Invalid attempt id." }, { status: 400 });
      const { data: attempt, error } = await admin
        .from("student_assessment_attempts")
        .select("id,status,started_at,submitted_at")
        .eq("id", attemptId)
        .eq("student_id", student)
        .maybeSingle();
      if (error) throw error;
      if (!attempt)
        return Response.json(
          { error: "Assessment not found." },
          { status: 404 },
        );
      const { data: rows, error: rowError } = await admin
        .from("student_assessment_attempt_questions")
        .select(
          "question_id,question_order,student_answer,is_correct,marks_awarded,marked_at,review_status,reviewed_at,assessment_question_bank(prompt,subtopic,marks,answer,worked_solution)",
        )
        .eq("attempt_id", attemptId)
        .order("question_order");
      if (rowError) throw rowError;
      const canRevealSolutions =
        profile.role === "tutor" || attempt.status === "submitted";
      return Response.json({
        attemptedAt: attempt.submitted_at ?? attempt.started_at,
        answers: (rows ?? []).map((row) => {
          const bank = Array.isArray(row.assessment_question_bank)
            ? row.assessment_question_bank[0]
            : row.assessment_question_bank;
          return {
            ...row,
            assessment_question_bank: {
              prompt: bank?.prompt ?? "",
              subtopic: bank?.subtopic ?? "",
              marks: bank?.marks ?? 0,
              answer: canRevealSolutions ? bank?.answer : undefined,
              worked_solution: canRevealSolutions
                ? bank?.worked_solution
                : undefined,
            },
            response:
              typeof row.student_answer === "string"
                ? row.student_answer
                : (row.student_answer?.value ?? ""),
            checked_at: attempt.status === "submitted" ? "submitted" : null,
            requires_review: row.is_correct === null,
          };
        }),
      });
    }
    const sessionId = url.searchParams.get("sessionId");
    if (sessionId) {
      if (!UUID_PATTERN.test(sessionId))
        return Response.json({ error: "Invalid session id." }, { status: 400 });
      const { data: session, error } = await admin
        .from("practice_sessions")
        .select("id,created_at,completed_at")
        .eq("id", sessionId)
        .eq("student_id", student)
        .maybeSingle();
      if (error) throw error;
      if (!session)
        return Response.json({ error: "Session not found." }, { status: 404 });
      await repairDeterministicPracticeMarks([sessionId]);
      const { data: answers, error: answerError } = await admin
        .from("practice_session_questions")
        .select(
          "question_id,question_order,response,checked_at,marks_awarded,is_correct,requires_review,review_status,reviewed_at,assessment_question_bank(prompt,subtopic,marks,answer,worked_solution)",
        )
        .eq("session_id", sessionId)
        .not("checked_at", "is", null)
        .order("question_order");
      if (answerError) throw answerError;
      return Response.json({
        attemptedAt: session.completed_at ?? session.created_at,
        answers: (answers ?? []).map((row) => {
          const bank = Array.isArray(row.assessment_question_bank)
            ? row.assessment_question_bank[0]
            : row.assessment_question_bank;
          const canRevealSolution =
            profile.role === "tutor" || Boolean(row.checked_at);
          return {
            ...row,
            assessment_question_bank: {
              prompt: bank?.prompt ?? "",
              subtopic: bank?.subtopic ?? "",
              marks: bank?.marks ?? 0,
              answer: canRevealSolution ? bank?.answer : undefined,
              worked_solution: canRevealSolution
                ? bank?.worked_solution
                : undefined,
            },
          };
        }),
      });
    }
    const results = await Promise.all([
      (profile.role === "tutor"
        ? admin
            .from("student_activity")
            .select("student_id,page_title,mode,last_seen_at")
        : admin
            .from("student_activity")
            .select("student_id,page_title,mode,last_seen_at")
            .eq("student_id", student)
      )
        .order("last_seen_at", { ascending: false })
        .limit(1000),
      admin
        .from("practice_sessions")
        .select(
          "id,subtopic,course_topic_key,status,created_at,completed_at,practice_session_questions!inner(checked_at,requires_review,marks_awarded)",
        )
        .eq("student_id", student)
        .not("practice_session_questions.checked_at", "is", null)
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("student_assessment_attempts")
        .select(
          "id,assessment_key,status,score,total_marks,pending_review_marks,started_at,submitted_at",
        )
        .eq("student_id", student)
        .order("started_at", { ascending: false })
        .limit(20),
    ]);
    for (const r of results) if (r.error) throw r.error;
    return Response.json({
      activity: results[0].data,
      practice: results[1].data,
      assessments: results[2].data,
      asOf: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: "Progress could not be loaded. Please retry." },
      { status: 503 },
    );
  }
}
export async function POST(request: Request) {
  const profile = await viewer();
  if (!profile)
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json();
    if (body.action === "clear-assessment-attempt") {
      if (profile.role !== "tutor")
        return Response.json({ error: "Tutor access required." }, { status: 403 });
      const studentId = String(body.studentId ?? "");
      const attemptId = String(body.attemptId ?? "");
      if (!UUID_PATTERN.test(studentId) || !UUID_PATTERN.test(attemptId))
        return Response.json({ error: "Invalid assessment attempt." }, { status: 400 });
      const admin = createAdminClient();
      const { data: attempt, error: readError } = await admin
        .from("student_assessment_attempts")
        .select("id")
        .eq("id", attemptId)
        .eq("student_id", studentId)
        .maybeSingle();
      if (readError) throw readError;
      if (!attempt)
        return Response.json({ error: "Assessment attempt not found." }, { status: 404 });
      const { error } = await admin
        .from("student_assessment_attempts")
        .delete()
        .eq("id", attemptId)
        .eq("student_id", studentId);
      if (error) throw error;
      return Response.json({ cleared: true });
    }
    if (body.action === "complete-review") {
      if (profile.role !== "tutor")
        return Response.json({ error: "Tutor access required." }, { status: 403 });
      const studentId = String(body.studentId ?? "");
      const questionId = String(body.questionId ?? "");
      const sessionId = String(body.sessionId ?? "");
      const attemptId = String(body.attemptId ?? "");
      if (
        !UUID_PATTERN.test(studentId) ||
        (!UUID_PATTERN.test(sessionId) && !UUID_PATTERN.test(attemptId)) ||
        !questionId ||
        questionId.length > 250
      )
        return Response.json({ error: "Invalid review request." }, { status: 400 });
      const admin = createAdminClient();
      const marks = Number(body.marks);
      const reviewedAt = new Date().toISOString();

      if (UUID_PATTERN.test(sessionId)) {
        const { data: session } = await admin
          .from("practice_sessions")
          .select("id")
          .eq("id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();
        if (!session) return Response.json({ error: "Practice session not found." }, { status: 404 });
        const { data: row, error: rowError } = await admin
          .from("practice_session_questions")
          .select("question_id,assessment_question_bank(marks)")
          .eq("session_id", sessionId)
          .eq("question_id", questionId)
          .maybeSingle();
        if (rowError) throw rowError;
        const bank = Array.isArray(row?.assessment_question_bank)
          ? row.assessment_question_bank[0]
          : row?.assessment_question_bank;
        const maximum = Number(bank?.marks ?? -1);
        if (!row || !Number.isFinite(marks) || marks < 0 || marks > maximum)
          return Response.json({ error: "Invalid mark." }, { status: 400 });
        const { data: reviewed, error } = await admin
          .from("practice_session_questions")
          .update({
            marks_awarded: marks,
            is_correct: marks === maximum,
            requires_review: false,
            review_status: "completed",
            reviewed_at: reviewedAt,
            reviewed_by: profile.id,
          })
          .eq("session_id", sessionId)
          .eq("question_id", questionId)
          .eq("review_status", "pending")
          .select("question_id")
          .maybeSingle();
        if (error) throw error;
        if (!reviewed) return Response.json({ error: "This answer is no longer awaiting review." }, { status: 409 });
        return Response.json({ saved: true, reviewedAt });
      }

      const { data: attempt } = await admin
        .from("student_assessment_attempts")
        .select("id,total_marks")
        .eq("id", attemptId)
        .eq("student_id", studentId)
        .maybeSingle();
      if (!attempt) return Response.json({ error: "Assessment not found." }, { status: 404 });
      const { data: row, error: rowError } = await admin
        .from("student_assessment_attempt_questions")
        .select("question_id,assessment_question_bank(marks)")
        .eq("attempt_id", attemptId)
        .eq("question_id", questionId)
        .maybeSingle();
      if (rowError) throw rowError;
      const bank = Array.isArray(row?.assessment_question_bank)
        ? row.assessment_question_bank[0]
        : row?.assessment_question_bank;
      const maximum = Number(bank?.marks ?? -1);
      if (!row || !Number.isFinite(marks) || marks < 0 || marks > maximum)
        return Response.json({ error: "Invalid mark." }, { status: 400 });
      const { data: reviewed, error: updateError } = await admin
        .from("student_assessment_attempt_questions")
        .update({
          marks_awarded: marks,
          is_correct: marks === maximum,
          review_status: "completed",
          reviewed_at: reviewedAt,
          reviewed_by: profile.id,
        })
        .eq("attempt_id", attemptId)
        .eq("question_id", questionId)
        .eq("review_status", "pending")
        .select("question_id")
        .maybeSingle();
      if (updateError) throw updateError;
      if (!reviewed) return Response.json({ error: "This answer is no longer awaiting review." }, { status: 409 });
      const { data: rows, error: totalsError } = await admin
        .from("student_assessment_attempt_questions")
        .select("marks_awarded,is_correct,assessment_question_bank(marks)")
        .eq("attempt_id", attemptId);
      if (totalsError) throw totalsError;
      let score = 0;
      let pending = 0;
      for (const answer of rows ?? []) {
        score += Number(answer.marks_awarded ?? 0);
        if (answer.is_correct === null) {
          const answerBank = Array.isArray(answer.assessment_question_bank)
            ? answer.assessment_question_bank[0]
            : answer.assessment_question_bank;
          pending += Number(answerBank?.marks ?? 0);
        }
      }
      const { error: attemptError } = await admin
        .from("student_assessment_attempts")
        .update({
          score,
          percentage: attempt.total_marks ? Math.round((score / attempt.total_marks) * 10000) / 100 : 0,
          pending_review_marks: pending,
          automated_total_marks: attempt.total_marks - pending,
          updated_at: reviewedAt,
        })
        .eq("id", attemptId);
      if (attemptError) throw attemptError;
      return Response.json({ saved: true, reviewedAt });
    }
    if (profile.role !== "student")
      return Response.json({ error: "Student activity only." }, { status: 403 });
    if (body.action === "complete-notes") {
      const lesson =
        typeof body.topicTitle === "string"
          ? getStructuredLesson(body.topicTitle)
          : null;
      if (
        !lesson ||
        lesson.subjectTitle !== body.subjectTitle ||
        lesson.chapterTitle !== body.chapterTitle ||
        typeof body.topicId !== "string" ||
        body.topicId.length > 500 ||
        !hasChapterAccess(profile, lesson.chapterTitle)
      )
        return Response.json({ error: "Lesson unavailable." }, { status: 403 });
      const admin = createAdminClient();
      const { data: previous, error: readError } = await admin
        .from("student_topic_progress")
        .select("watched_video,started_at")
        .eq("student_id", profile.id)
        .eq("topic_id", body.topicId)
        .maybeSingle();
      if (readError) throw readError;
      const now = new Date().toISOString();
      const { error } = await admin
        .from("student_topic_progress")
        .upsert(
          {
            student_id: profile.id,
            topic_id: body.topicId,
            topic_title: lesson.sourceTitle,
            chapter_title: lesson.chapterTitle,
            subject_title: lesson.subjectTitle,
            status: "completed",
            watched_video: previous?.watched_video ?? false,
            started_at: previous?.started_at ?? now,
            completed_at: now,
            updated_at: now,
          },
          { onConflict: "student_id,topic_id" },
        );
      if (error) throw error;
      return Response.json({ saved: true });
    }
    if (
      typeof body.pageTitle !== "string" ||
      body.pageTitle.length > 250 ||
      !["notes", "video", "practice", "assessment", "dashboard"].includes(
        body.mode,
      )
    )
      return Response.json({ error: "Invalid activity." }, { status: 400 });
    const { error } = await createAdminClient()
      .from("student_activity")
      .upsert({
        student_id: profile.id,
        page_title: body.pageTitle,
        mode: body.mode,
        last_seen_at: new Date().toISOString(),
      });
    if (error) throw error;
    return Response.json({ saved: true });
  } catch {
    return Response.json(
      { error: "Activity could not be recorded." },
      { status: 503 },
    );
  }
}
