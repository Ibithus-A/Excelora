import { getAssessmentConfig, GENERATED_ASSESSMENT_CONFIGS } from "@/lib/assessment-config";
import { markBankResponse } from "@/lib/question-bank/marking.server";
import { PUBLIC_BANK_FIELDS, loadBank } from "@/lib/question-bank/repository.server";
import { selectPracticeQuestions } from "@/lib/question-bank/practice-selector";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getViewerProfile } from "@/lib/supabase/profiles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => Response.json({ error }, { status });

async function viewer() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  return getViewerProfile(client, user.id);
}

async function presentAssignment(id: string, viewerId: string, role: "tutor" | "student") {
  const admin = createAdminClient();
  let query = admin.from("quiz_assignments").select("*").eq("id", id);
  query = role === "tutor"
    ? query.or(`tutor_id.eq.${viewerId},assignment_source.eq.adaptive`)
    : query.eq("student_id", viewerId);
  const { data: assignment, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (!assignment) return null;

  const { data: rows, error: rowError } = await admin
    .from("quiz_assignment_questions")
    .select(`question_order,question_id,assessment_question_bank(${PUBLIC_BANK_FIELDS})`)
    .eq("assignment_id", id)
    .order("question_order");
  if (rowError) throw new Error(rowError.message);

  const completed = assignment.status === "completed";
  const solutions = new Map<string, { answer: string; worked_solution: string }>();
  if (completed && rows?.length) {
    const { data, error: solutionError } = await admin
      .from("assessment_question_bank")
      .select("id,answer,worked_solution")
      .in("id", rows.map((row) => row.question_id));
    if (solutionError) throw new Error(solutionError.message);
    for (const item of data ?? []) solutions.set(item.id, item);
  }

  return {
    ...assignment,
    questions: (rows ?? []).map((row) => ({
      ...(Array.isArray(row.assessment_question_bank)
        ? row.assessment_question_bank[0]
        : row.assessment_question_bank),
      id: row.question_id,
      order: row.question_order,
      response: assignment.answers?.[row.question_id] ?? "",
      result: completed ? assignment.results?.[row.question_id] ?? null : null,
      ...(completed ? solutions.get(row.question_id) : {}),
    })),
  };
}

export async function GET(request: Request) {
  const profile = await viewer();
  if (!profile) return fail("Unauthorized.", 401);
  try {
    const url = new URL(request.url);
    const assignmentId = url.searchParams.get("assignmentId");
    if (assignmentId) {
      const assignment = await presentAssignment(assignmentId, profile.id, profile.role);
      return assignment ? Response.json({ assignment }) : fail("Quiz not found.", 404);
    }

    const catalogKey = url.searchParams.get("catalogKey");
    if (catalogKey) {
      if (profile.role !== "tutor") return fail("Tutor access required.", 403);
      const config = getAssessmentConfig(catalogKey);
      if (!config || config.scope !== "chapter") return fail("Unknown topic.", 400);
      const questions = await loadBank(config.bankCourseTopicKey);
      const subtopics = [...new Set(questions.filter((q) => !q.exposedInNotes).map((q) => q.subtopic))].sort();
      return Response.json({ subtopics, available: questions.filter((q) => !q.exposedInNotes).length });
    }

    const admin = createAdminClient();
    let query = admin.from("quiz_assignments").select("*").order("due_at", { ascending: true }).limit(100);
    if (profile.role === "student") query = query.eq("student_id", profile.id);
    else {
      const studentId = url.searchParams.get("studentId");
      if (studentId) {
        query = query
          .eq("student_id", studentId)
          .or(`tutor_id.eq.${profile.id},assignment_source.eq.adaptive`);
      } else query = query.eq("tutor_id", profile.id);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return Response.json({
      assignments: data ?? [],
      topics: profile.role === "tutor"
        ? GENERATED_ASSESSMENT_CONFIGS.map((config) => ({
            key: config.key,
            subjectTitle: config.subjectTitle,
            chapterTitle: config.chapterTitle,
          }))
        : undefined,
    });
  } catch (error) {
    console.error("[quizzes GET]", error);
    return fail("Unable to load quizzes.", 500);
  }
}

export async function POST(request: Request) {
  const profile = await viewer();
  if (!profile) return fail("Unauthorized.", 401);
  try {
    const body = await request.json();
    const admin = createAdminClient();

    if (body.action === "create") {
      if (profile.role !== "tutor") return fail("Tutor access required.", 403);
      const config = getAssessmentConfig(String(body.assessmentKey ?? ""));
      if (!config || config.scope !== "chapter") return fail("Unknown topic.", 400);
      const count = Number(body.questionCount);
      if (![5, 10, 15, 20].includes(count)) return fail("Choose 5, 10, 15 or 20 questions.", 400);
      const dueAt = new Date(String(body.dueAt ?? ""));
      if (!Number.isFinite(dueAt.getTime()) || dueAt.getTime() <= Date.now())
        return fail("Choose a future deadline.", 400);
      const title = String(body.title ?? "").trim();
      const subtopic = String(body.subtopic ?? "").trim();
      if (!title || title.length > 120 || subtopic.length > 250) return fail("Invalid quiz details.", 400);
      const { data: student } = await admin.from("profiles").select("id").eq("id", body.studentId).eq("role", "student").maybeSingle();
      if (!student) return fail("Student not found.", 404);

      const bank = (await loadBank(config.bankCourseTopicKey)).filter((q) => !q.exposedInNotes);
      let selected;
      try {
        selected = selectPracticeQuestions({
          questions: bank,
          exposure: [],
          courseTopicKey: config.bankCourseTopicKey,
          subtopic,
          count,
          difficulty: "balanced",
        });
      } catch (error) {
        return fail(error instanceof Error ? error.message : "Unable to select questions.", 400);
      }
      const totalMarks = selected.reduce((sum, question) => sum + question.marks, 0);
      const { data: assignment, error } = await admin.from("quiz_assignments").insert({
        tutor_id: profile.id,
        student_id: student.id,
        assessment_key: config.key,
        course_topic_key: config.bankCourseTopicKey,
        title,
        subtopic,
        question_count: selected.length,
        due_at: dueAt.toISOString(),
        total_marks: totalMarks,
        assignment_source: "tutor",
      }).select("*").single();
      if (error) throw new Error(error.message);
      const { error: questionError } = await admin.from("quiz_assignment_questions").insert(
        selected.map((question, index) => ({
          assignment_id: assignment.id,
          question_id: question.id,
          question_order: index + 1,
        })),
      );
      if (questionError) {
        await admin.from("quiz_assignments").delete().eq("id", assignment.id);
        throw new Error(questionError.message);
      }
      return Response.json({ assignment }, { status: 201 });
    }

    if (profile.role !== "student") return fail("Student access required.", 403);
    const assignment = await presentAssignment(String(body.assignmentId ?? ""), profile.id, "student");
    if (!assignment) return fail("Quiz not found.", 404);
    if (assignment.status === "completed") return fail("This quiz has already been submitted.", 409);
    const allowedIds = new Set(assignment.questions.map((question: { id: string }) => question.id));
    const answers = Object.fromEntries(
      Object.entries(body.answers ?? {})
        .filter(([id, value]) => allowedIds.has(id) && typeof value === "string" && value.length <= 150000),
    );

    if (body.action === "save") {
      const { error } = await admin.from("quiz_assignments").update({ answers, updated_at: new Date().toISOString() }).eq("id", assignment.id).eq("student_id", profile.id);
      if (error) throw new Error(error.message);
      return Response.json({ saved: true });
    }
    if (body.action !== "submit") return fail("Invalid quiz action.", 400);

    const { data: bank, error: bankError } = await admin
      .from("assessment_question_bank")
      .select("id,response_type,answer,worked_solution,marks")
      .in("id", [...allowedIds]);
    if (bankError) throw new Error(bankError.message);
    const results: Record<string, { marks: number; isCorrect: boolean | null; requiresReview: boolean }> = {};
    let score = 0;
    for (const question of bank ?? []) {
      const grade = markBankResponse(
        question.response_type,
        String(answers[question.id] ?? ""),
        { questionId: question.id, answer: question.answer, workedSolution: question.worked_solution },
        question.marks,
      );
      results[question.id] = { marks: grade.marks, isCorrect: grade.isCorrect, requiresReview: grade.requiresReview };
      score += grade.marks;
    }
    const completedAt = new Date().toISOString();
    const { error } = await admin.from("quiz_assignments").update({
      answers,
      results,
      score,
      status: "completed",
      completed_at: completedAt,
      updated_at: completedAt,
    }).eq("id", assignment.id).eq("student_id", profile.id).eq("status", "assigned");
    if (error) throw new Error(error.message);
    return Response.json({ assignment: await presentAssignment(assignment.id, profile.id, "student") });
  } catch (error) {
    console.error("[quizzes POST]", error);
    return fail("Unable to update quiz.", 500);
  }
}
