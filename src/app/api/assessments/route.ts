import {
  getAssessmentConfig,
  normalizeAssessmentModuleTitle,
} from "@/lib/assessment-config";
import { markAssessmentAnswers } from "@/lib/assessment-solutions.server";
import { hasAssessmentAnswerContent } from "@/lib/assessment-answer";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewerProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AttemptRow = {
  id: string;
  student_id: string;
  assessment_key: string;
  question_count: number;
  total_marks: number;
  duration_seconds: number;
  answers: Record<string, string> | null;
  locked_questions: string[];
  question_scores: Record<string, { marks: number; maxMarks: number; automatedMaxMarks: number; pendingReviewMarks: number }> | null;
  score: number;
  automated_total_marks: number;
  pending_review_marks: number;
  marking_version: string | null;
  last_marked_at: string | null;
  status: "active" | "submitted";
  started_at: string;
  deadline_at: string;
  submitted_at: string | null;
  updated_at: string;
};

const ATTEMPT_SELECT =
  "id, student_id, assessment_key, question_count, total_marks, duration_seconds, answers, locked_questions, question_scores, score, automated_total_marks, pending_review_marks, marking_version, last_marked_at, status, started_at, deadline_at, submitted_at, updated_at";

const enforceAssessmentMutationLimit = createRateLimiter({
  maxRequests: 180,
  windowMs: 10 * 60 * 1000,
});

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errorResponse: jsonError("Unauthorized.", 401) } as const;

  const viewer = await getViewerProfile(supabase, user.id);
  if (!viewer) return { errorResponse: jsonError("Profile not found.", 404) } as const;

  return { user, viewer } as const;
}

function sanitizeAnswers(value: unknown, questionCount: number): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 32) return null;

  const answers: Record<string, string> = {};
  let totalLength = 0;
  for (const [key, answer] of entries) {
    const match = /^q([1-9]\d*)(?:_[a-z0-9]+)*$/.exec(key);
    if (!match || Number(match[1]) > questionCount || typeof answer !== "string") {
      return null;
    }
    totalLength += answer.length;
    if (answer.length > 150_000 || totalLength > 500_000) return null;
    answers[key] = answer;
  }
  return answers;
}

function hasQuestionAnswer(
  answers: Record<string, string>,
  questionKey: string,
) {
  return Object.entries(answers).some(
    ([key, value]) =>
      (key === questionKey || key.startsWith(`${questionKey}_`)) &&
      hasAssessmentAnswerContent(value),
  );
}

function questionKeyFor(value: unknown, questionCount: number) {
  if (typeof value !== "string") return null;
  const match = /^q([1-9]\d*)$/.exec(value);
  return match && Number(match[1]) <= questionCount ? value : null;
}

function answeredQuestionKeys(answers: Record<string, string>, questionCount: number) {
  return Array.from({ length: questionCount }, (_, index) => `q${index + 1}`).filter((key) =>
    hasQuestionAnswer(answers, key),
  );
}

function changesLockedAnswer(
  previousAnswers: Record<string, string>,
  nextAnswers: Record<string, string>,
  lockedQuestions: string[],
) {
  const allAnswerKeys = new Set([...Object.keys(previousAnswers), ...Object.keys(nextAnswers)]);
  return lockedQuestions.some((questionKey) =>
    Array.from(allAnswerKeys)
      .filter((key) => key === questionKey || key.startsWith(`${questionKey}_`))
      .some((key) => nextAnswers[key] !== previousAnswers[key]),
  );
}

function presentAttempt(attempt: AttemptRow | null, revealScore: boolean) {
  if (!attempt || revealScore) return attempt;
  const safeAttempt: Partial<AttemptRow> = { ...attempt };
  delete safeAttempt.question_scores;
  delete safeAttempt.score;
  delete safeAttempt.automated_total_marks;
  delete safeAttempt.pending_review_marks;
  delete safeAttempt.marking_version;
  delete safeAttempt.last_marked_at;
  return safeAttempt;
}

async function getAccess(studentId: string, assessmentKey: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("student_assessment_access")
    .select("is_unlocked, updated_at")
    .eq("student_id", studentId)
    .eq("assessment_key", assessmentKey)
    .maybeSingle<{ is_unlocked: boolean; updated_at: string }>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

async function getAttempt(studentId: string, assessmentKey: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("student_assessment_attempts")
    .select(ATTEMPT_SELECT)
    .eq("student_id", studentId)
    .eq("assessment_key", assessmentKey)
    .eq("is_legacy", true)
    .maybeSingle<AttemptRow>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

async function getStudentPlan(studentId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", studentId)
    .eq("role", "student")
    .maybeSingle<{ plan: string | null }>();
  if (error) throw new Error(error.message);
  return data?.plan ?? null;
}

async function getModulePrerequisite(
  studentId: string,
  config: NonNullable<ReturnType<typeof getAssessmentConfig>>,
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("student_topic_progress")
    .select("topic_title, status, watched_video")
    .eq("student_id", studentId)
    .eq("chapter_title", config.chapterTitle)
    .returns<Array<{ topic_title: string; status: string; watched_video: boolean }>>();
  if (error) throw new Error(error.message);

  const completedTitles = new Set(
    (data ?? [])
      .filter((row) => row.status === "completed" || row.watched_video)
      .map((row) => normalizeAssessmentModuleTitle(row.topic_title)),
  );
  const completedCount = config.requiredModuleTitles.filter((title) =>
    completedTitles.has(normalizeAssessmentModuleTitle(title)),
  ).length;
  const totalCount = config.requiredModuleTitles.length;

  return {
    isComplete: totalCount > 0 && completedCount === totalCount,
    completedCount,
    totalCount,
  };
}

async function closeExpiredAttempt(attempt: AttemptRow | null) {
  if (!attempt || attempt.status !== "active") return attempt;
  if (new Date(attempt.deadline_at).getTime() > Date.now()) return attempt;

  const now = new Date().toISOString();
  const config = getAssessmentConfig(attempt.assessment_key);
  if (!config) throw new Error("Assessment configuration not found.");
  const answers = attempt.answers ?? {};
  const lockedQuestions = Array.from(
    new Set([...(attempt.locked_questions ?? []), ...answeredQuestionKeys(answers, config.questionCount)]),
  );
  const marking = markAssessmentAnswers(config.key, answers, lockedQuestions);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("student_assessment_attempts")
    .update({
      locked_questions: lockedQuestions,
      question_scores: marking.questionScores,
      score: marking.score,
      automated_total_marks: marking.automatedTotalMarks,
      pending_review_marks: marking.pendingReviewMarks,
      marking_version: marking.markingVersion,
      last_marked_at: now,
      status: "submitted",
      submitted_at: now,
      updated_at: now,
    })
    .eq("id", attempt.id)
    .eq("status", "active")
    .select(ATTEMPT_SELECT)
    .maybeSingle<AttemptRow>();
  if (error) throw new Error(error.message);
  return data ?? await getAttempt(attempt.student_id, attempt.assessment_key);
}

export async function GET(request: Request) {
  const viewerContext = await requireViewer();
  if ("errorResponse" in viewerContext) return viewerContext.errorResponse;

  try {
    const url = new URL(request.url);
    const assessmentKey = url.searchParams.get("assessmentKey") ?? "";
    const config = getAssessmentConfig(assessmentKey);
    if (!config) return jsonError("Unknown assessment.", 400);

    const requestedStudentId = url.searchParams.get("studentId")?.trim() ?? "";
    const studentId =
      viewerContext.viewer.role === "tutor" ? requestedStudentId : viewerContext.user.id;
    if (!studentId) return jsonError("Student id is required.", 400);

    const studentPlan =
      viewerContext.viewer.role === "student"
        ? viewerContext.viewer.plan
        : await getStudentPlan(studentId);
    if (!studentPlan) return jsonError("Student profile not found.", 404);
    const requiresPremium =
      config.minimumStudentPlan === "premium" && studentPlan !== "premium";

    const prerequisite = requiresPremium
      ? { isComplete: false, completedCount: 0, totalCount: config.requiredModuleTitles.length }
      : await getModulePrerequisite(studentId, config);

    const [access, rawAttempt] = await Promise.all([
      requiresPremium ? Promise.resolve(null) : getAccess(studentId, assessmentKey),
      requiresPremium ? Promise.resolve(null) : getAttempt(studentId, assessmentKey),
    ]);
    const attempt = await closeExpiredAttempt(rawAttempt);

    return Response.json({
      assessment: config,
      isUnlocked:
        !requiresPremium && prerequisite.isComplete && Boolean(access?.is_unlocked),
      requiresPremium,
      prerequisite,
      attempt: presentAttempt(
        attempt,
        viewerContext.viewer.role === "tutor" || attempt?.status === "submitted",
      ),
      serverNow: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[GET /api/assessments]", error);
    return jsonError("Unable to load assessment access.", 500);
  }
}

export async function PATCH(request: Request) {
  const viewerContext = await requireViewer();
  if ("errorResponse" in viewerContext) return viewerContext.errorResponse;
  if (viewerContext.viewer.role !== "tutor") return jsonError("Forbidden.", 403);

  const limit = enforceAssessmentMutationLimit(
    `${viewerContext.user.id}:PATCH:/api/assessments`,
  );
  if (!limit.allowed) return jsonError("Too many requests. Please retry shortly.", 429);

  try {
    const body = (await request.json()) as {
      studentId?: unknown;
      assessmentKey?: unknown;
      isUnlocked?: unknown;
    };
    if (typeof body.studentId !== "string" || !body.studentId.trim()) {
      return jsonError("Student id is required.", 400);
    }
    if (typeof body.assessmentKey !== "string") {
      return jsonError("Unknown assessment.", 400);
    }
    const config = getAssessmentConfig(body.assessmentKey);
    if (!config) return jsonError("Unknown assessment.", 400);
    if (typeof body.isUnlocked !== "boolean") {
      return jsonError("Unlock state is required.", 400);
    }

    const now = new Date().toISOString();
    const admin = createAdminClient();
    const { data: student, error: studentError } = await admin
      .from("profiles")
      .select("id, plan")
      .eq("id", body.studentId)
      .eq("role", "student")
      .maybeSingle<{ id: string; plan: string | null }>();
    if (studentError) throw new Error(studentError.message);
    if (!student) return jsonError("Student profile not found.", 404);
    if (config.minimumStudentPlan === "premium" && student.plan !== "premium") {
      return jsonError("Assessments require the Premium Plan.", 403);
    }
    if (body.isUnlocked) {
      const prerequisite = await getModulePrerequisite(body.studentId, config);
      if (!prerequisite.isComplete) {
        return Response.json(
          {
            error: `Complete all chapter modules before unlocking this assessment (${prerequisite.completedCount}/${prerequisite.totalCount} complete).`,
            prerequisite,
          },
          { status: 409 },
        );
      }
    }

    const { error } = await admin.from("student_assessment_access").upsert(
      {
        student_id: body.studentId,
        assessment_key: body.assessmentKey,
        is_unlocked: body.isUnlocked,
        unlocked_by: viewerContext.user.id,
        updated_at: now,
      },
      { onConflict: "student_id,assessment_key" },
    );
    if (error) throw new Error(error.message);

    console.info(
      JSON.stringify({
        event: "assessment_access_update",
        actor_user_id: viewerContext.user.id,
        student_id: body.studentId,
        assessment_key: body.assessmentKey,
        is_unlocked: body.isUnlocked,
        timestamp: now,
      }),
    );

    return Response.json({ isUnlocked: body.isUnlocked, updatedAt: now });
  } catch (error) {
    console.error("[PATCH /api/assessments]", error);
    return jsonError("Unable to update assessment access.", 500);
  }
}

export async function POST(request: Request) {
  const viewerContext = await requireViewer();
  if ("errorResponse" in viewerContext) return viewerContext.errorResponse;

  const limit = enforceAssessmentMutationLimit(
    `${viewerContext.user.id}:POST:/api/assessments`,
  );
  if (!limit.allowed) return jsonError("Too many requests. Please retry shortly.", 429);

  try {
    const body = (await request.json()) as {
      action?: unknown;
      assessmentKey?: unknown;
      answers?: unknown;
      questionKey?: unknown;
    };
    if (typeof body.assessmentKey !== "string") return jsonError("Unknown assessment.", 400);
    const config = getAssessmentConfig(body.assessmentKey);
    if (!config) return jsonError("Unknown assessment.", 400);

    if (viewerContext.viewer.role === "tutor") {
      if (body.action !== "preview_mark" && body.action !== "preview_submit") {
        return jsonError("Unknown tutor preview action.", 400);
      }
      const answers = sanitizeAnswers(body.answers, config.questionCount);
      if (!answers) return jsonError("Invalid answer data.", 400);
      const lockedQuestions =
        body.action === "preview_submit"
          ? answeredQuestionKeys(answers, config.questionCount)
          : [questionKeyFor(body.questionKey, config.questionCount)].filter(
              (key): key is string => Boolean(key),
            );
      if (body.action === "preview_mark" && lockedQuestions.length !== 1) {
        return jsonError("A valid question is required.", 400);
      }
      if (
        body.action === "preview_mark" &&
        !hasQuestionAnswer(answers, lockedQuestions[0])
      ) {
        return jsonError("Enter an answer before checking it.", 400);
      }
      return Response.json({
        marking: markAssessmentAnswers(config.key, answers, lockedQuestions),
      });
    }

    if (
      config.minimumStudentPlan === "premium" &&
      viewerContext.viewer.plan !== "premium"
    ) {
      return jsonError("Assessments require the Premium Plan.", 403);
    }
    if (body.action !== "start" && body.action !== "save" && body.action !== "lock_answer" && body.action !== "submit") {
      return jsonError("Unknown assessment action.", 400);
    }

    if (body.action === "start") {
      const prerequisite = await getModulePrerequisite(viewerContext.user.id, config);
      if (!prerequisite.isComplete) {
        return jsonError(
          `Complete all chapter modules before starting this assessment (${prerequisite.completedCount}/${prerequisite.totalCount} complete).`,
          403,
        );
      }
    }

    const access = await getAccess(viewerContext.user.id, config.key);
    if (!access?.is_unlocked) return jsonError("This assessment is locked.", 403);

    const admin = createAdminClient();
    const attempt = await closeExpiredAttempt(
      await getAttempt(viewerContext.user.id, config.key),
    );

    if (body.action === "start") {
      if (attempt?.status === "submitted") {
        return jsonError("This assessment has already been attempted and cannot be retaken.", 409);
      }
      if (!attempt) {
        return jsonError("Start a new paper from the generated chapter assessment.", 409);
      }
      return Response.json({
        attempt: presentAttempt(attempt, false),
        serverNow: new Date().toISOString(),
      });
    }

    if (!attempt) return jsonError("Start the assessment first.", 409);
    if (attempt.status !== "active") return jsonError("This assessment has been submitted.", 409);

    const answers = sanitizeAnswers(body.answers, config.questionCount);
    if (!answers) return jsonError("Invalid answer data.", 400);
    const previousAnswers = attempt.answers ?? {};
    const previousLockedQuestions = attempt.locked_questions ?? [];
    if (changesLockedAnswer(previousAnswers, answers, previousLockedQuestions)) {
      return jsonError("A confirmed answer cannot be changed.", 409);
    }

    const lockedQuestion =
      body.action === "lock_answer"
        ? questionKeyFor(body.questionKey, config.questionCount)
        : null;
    if (body.action === "lock_answer" && !lockedQuestion) {
      return jsonError("A valid question is required.", 400);
    }
    if (lockedQuestion && !hasQuestionAnswer(answers, lockedQuestion)) {
      return jsonError("Enter an answer before confirming it.", 400);
    }

    const lockedQuestions =
      body.action === "submit"
        ? Array.from(
            new Set([
              ...previousLockedQuestions,
              ...answeredQuestionKeys(answers, config.questionCount),
            ]),
          )
        : lockedQuestion
          ? Array.from(new Set([...previousLockedQuestions, lockedQuestion]))
          : previousLockedQuestions;
    const now = new Date().toISOString();
    const marking = markAssessmentAnswers(config.key, answers, lockedQuestions);
    const update =
      body.action === "submit"
        ? {
            answers,
            locked_questions: lockedQuestions,
            question_scores: marking.questionScores,
            score: marking.score,
            automated_total_marks: marking.automatedTotalMarks,
            pending_review_marks: marking.pendingReviewMarks,
            marking_version: marking.markingVersion,
            last_marked_at: now,
            status: "submitted",
            submitted_at: now,
            updated_at: now,
          }
        : {
            answers,
            locked_questions: lockedQuestions,
            ...(body.action === "lock_answer"
              ? {
                  question_scores: marking.questionScores,
                  score: marking.score,
                  automated_total_marks: marking.automatedTotalMarks,
                  pending_review_marks: marking.pendingReviewMarks,
                  marking_version: marking.markingVersion,
                  last_marked_at: now,
                }
              : {}),
            updated_at: now,
          };
    const { data, error } = await admin
      .from("student_assessment_attempts")
      .update(update)
      .eq("id", attempt.id)
      .eq("status", "active")
      .select(ATTEMPT_SELECT)
      .maybeSingle<AttemptRow>();
    if (error) throw new Error(error.message);
    if (!data) return jsonError("This assessment is no longer active.", 409);

    return Response.json({
      attempt: presentAttempt(data, data.status === "submitted"),
      serverNow: now,
    });
  } catch (error) {
    console.error("[POST /api/assessments]", error);
    return jsonError("Unable to update the assessment attempt.", 500);
  }
}
