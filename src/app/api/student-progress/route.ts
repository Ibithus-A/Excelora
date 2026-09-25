import { getStructuredLesson } from "@/lib/lessons/catalogue";
import { hasChapterAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewerProfile } from "@/lib/supabase/profiles";
export const dynamic = "force-dynamic";
async function viewer() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  return user ? getViewerProfile(client, user.id) : null;
}
export async function GET(request: Request) {
  const profile = await viewer();
  if (!profile)
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  const url = new URL(request.url),
    student = url.searchParams.get("studentId") || profile.id;
  if (profile.role !== "tutor" && student !== profile.id)
    return Response.json({ error: "Forbidden." }, { status: 403 });
  const admin = createAdminClient();
  try {
    const attemptId = url.searchParams.get("attemptId");
    if (attemptId) {
      const { data: attempt, error } = await admin
        .from("student_assessment_attempts")
        .select("id,status")
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
          "question_id,question_order,student_answer,is_correct,marks_awarded,assessment_question_bank(prompt,subtopic,marks)",
        )
        .eq("attempt_id", attemptId)
        .order("question_order");
      if (rowError) throw rowError;
      return Response.json({
        answers: (rows ?? []).map((row) => ({
          ...row,
          response:
            typeof row.student_answer === "string"
              ? row.student_answer
              : (row.student_answer?.value ?? ""),
          checked_at: attempt.status === "submitted" ? "submitted" : null,
          requires_review: row.is_correct === null,
        })),
      });
    }
    const sessionId = url.searchParams.get("sessionId");
    if (sessionId) {
      const { data: session, error } = await admin
        .from("practice_sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("student_id", student)
        .maybeSingle();
      if (error) throw error;
      if (!session)
        return Response.json({ error: "Session not found." }, { status: 404 });
      const { data: answers, error: answerError } = await admin
        .from("practice_session_questions")
        .select(
          "question_id,question_order,response,checked_at,marks_awarded,requires_review,assessment_question_bank(prompt,subtopic,marks)",
        )
        .eq("session_id", sessionId)
        .order("question_order");
      if (answerError) throw answerError;
      return Response.json({ answers });
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
          "id,subtopic,course_topic_key,status,created_at,completed_at,practice_session_questions(checked_at,requires_review,marks_awarded)",
        )
        .eq("student_id", student)
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
  if (profile.role !== "student")
    return Response.json({ error: "Student activity only." }, { status: 403 });
  try {
    const body = await request.json();
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
