import { createAIProvider } from "@/lib/ai/deepseek";
import type { AIUsage } from "@/lib/ai/provider";
import { getCanonicalCourseContext } from "@/lib/arthur/course-context";
import { appendMessage, createConversation, getLatestConversation, getOwnedConversation, listConversationMessages, logArthurRequest } from "@/lib/arthur/conversations.server";
import { getLearningEvidence, summarizeLearningEvidence } from "@/lib/arthur/learning-context.server";
import { buildArthurSystemPrompt, shouldUseMathMode } from "@/lib/arthur/prompt";
import { parseArthurRequest, type ArthurRequest } from "@/lib/arthur/schema";
import { executeRelevantArthurTools } from "@/lib/arthur/tools.server";
import { hasPlusAccess } from "@/lib/access";
import { COURSE_BANK_MAPPINGS } from "@/lib/question-bank/course-mapping";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewerProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const enforceArthurRateLimit = createRateLimiter({ maxRequests: 60, windowMs: 10 * 60 * 1000 });
function jsonError(error: string, status: number, headers?: HeadersInit) { return NextResponse.json({ error }, { status, headers }); }

async function authenticatedContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: jsonError("Unauthorized.", 401) } as const;
  const viewer = await getViewerProfile(supabase, user.id);
  if (!viewer) return { error: jsonError("Profile not found.", 404) } as const;
  if (viewer.role === "student" && !hasPlusAccess(viewer.plan)) return { error: jsonError("Arthur AI is available on Plus and Premium.", 403) } as const;
  return { user, viewer, admin: createAdminClient() } as const;
}

async function hasActiveAssessment(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data, error } = await admin.from("student_assessment_attempts").select("id").eq("student_id", userId).eq("status", "active").limit(1);
  if (error) throw error;
  return Boolean(data?.length);
}

class ArthurRouteError extends Error { constructor(message: string, readonly status: number) { super(message); } }
type VerifiedActivity = { text: string; contextKey: string | null; subject?: string; chapter?: string; topic?: string };

async function getVerifiedActivity(admin: ReturnType<typeof createAdminClient>, userId: string, viewerRole: string, body: ArthurRequest): Promise<VerifiedActivity> {
  if (body.practiceContext) {
    if (viewerRole !== "student") throw new ArthurRouteError("Invalid practice explanation request.", 403);
    const { data: session, error: sessionError } = await admin.from("practice_sessions").select("id,status,course_topic_key").eq("id", body.practiceContext.sessionId).eq("student_id", userId).maybeSingle();
    if (sessionError) throw sessionError;
    if (!session) throw new ArthurRouteError("Practice session not found.", 403);
    const { data: row, error } = await admin.from("practice_session_questions").select("response,marks_awarded,is_correct,requires_review,checked_at,assessment_question_bank(prompt,subtopic,marks,answer,worked_solution)").eq("session_id", session.id).eq("question_id", body.practiceContext.questionId).maybeSingle();
    if (error) throw error;
    const question = Array.isArray(row?.assessment_question_bank) ? row.assessment_question_bank[0] : row?.assessment_question_bank;
    if (!row?.checked_at || !question || row.is_correct === true || Number(row.marks_awarded ?? 0) >= Number(question.marks ?? 0)) throw new ArthurRouteError("Arthur is available here only after an incorrect answer has been marked.", 403);
    const mapping = COURSE_BANK_MAPPINGS.find((item) => item.courseTopicKey === session.course_topic_key);
    return {
      text: [`Practice question: ${question.prompt}`, `Subtopic: ${question.subtopic}`, `Student response: ${String(row.response || "(blank)")}`, `Deterministic mark: ${row.marks_awarded ?? 0}/${question.marks}`, `Expected answer: ${question.answer}`, `Worked solution: ${question.worked_solution}`, row.requires_review ? "Tutor tracking status: awaiting tutor review. This does not delay student feedback." : ""].filter(Boolean).join("\n"),
      contextKey: `practice:${session.id}:${body.practiceContext.questionId}`,
      subject: mapping?.subjectTitle,
      chapter: mapping?.chapterTitle,
      topic: question.subtopic,
    };
  }
  if (body.reviewAttemptId) {
    const { data: attempt, error } = await admin.from("student_assessment_attempts").select("id,score,total_marks,pending_review_marks,submitted_at").eq("id", body.reviewAttemptId).eq("student_id", userId).eq("status", "submitted").maybeSingle();
    if (error || !attempt) throw new ArthurRouteError("Submitted assessment not found.", 403);
    const { data: rows, error: questionError } = await admin.from("student_assessment_attempt_questions").select("question_order,student_answer,marks_awarded,is_correct,assessment_question_bank(prompt,subtopic,marks,answer,worked_solution)").eq("attempt_id", attempt.id).order("question_order").limit(30);
    if (questionError) throw questionError;
    return { text: [`Submitted assessment: ${attempt.score}/${attempt.total_marks}; ${attempt.pending_review_marks} marks pending tutor review; submitted ${attempt.submitted_at}.`, ...(rows ?? []).map((row) => {
      const question = Array.isArray(row.assessment_question_bank) ? row.assessment_question_bank[0] : row.assessment_question_bank;
      if (!question) return "";
      const answer = row.student_answer && typeof row.student_answer === "object" && "value" in row.student_answer ? String(row.student_answer.value ?? "") : "";
      return `Question ${row.question_order}: ${question.prompt}\nStudent answer: ${answer || "(blank)"}\nResult: ${row.is_correct == null ? "pending tutor review" : `${row.marks_awarded ?? 0}/${question.marks}`}\nExpected answer: ${question.answer}\nWorked solution: ${question.worked_solution}`;
    })].filter(Boolean).join("\n\n").slice(0, 18_000), contextKey: `assessment-review:${attempt.id}` };
  }
  return { text: "", contextKey: null };
}

export async function GET(request: Request) {
  try {
    const auth = await authenticatedContext();
    if ("error" in auth) return auth.error;
    const url = new URL(request.url);
    const course = await getCanonicalCourseContext(url.searchParams.get("pageTitle") ?? "Workspace", url.searchParams.get("pdfTitle") ?? "");
    const practiceSessionId = url.searchParams.get("practiceSessionId");
    const practiceQuestionId = url.searchParams.get("practiceQuestionId");
    const reviewAttemptId = url.searchParams.get("reviewAttemptId");
    if (practiceSessionId || practiceQuestionId || reviewAttemptId) {
      const parsed = parseArthurRequest({
        pageTitle: url.searchParams.get("pageTitle") ?? "Workspace",
        reviewAttemptId,
        practiceContext: practiceSessionId && practiceQuestionId ? { sessionId: practiceSessionId, questionId: practiceQuestionId } : undefined,
        messages: [{ role: "user", content: "load conversation" }],
      });
      if (!parsed) return jsonError("Invalid conversation context.", 400);
      const activity = await getVerifiedActivity(auth.admin, auth.user.id, auth.viewer.role, parsed);
      if (activity.contextKey) course.contextKey = activity.contextKey;
    }
    const requestedId = url.searchParams.get("conversationId");
    const conversation = requestedId ? await getOwnedConversation(auth.admin, auth.user.id, requestedId) : await getLatestConversation(auth.admin, auth.user.id, course.contextKey);
    if (!conversation || conversation.context_key !== course.contextKey) return NextResponse.json({ conversationId: null, messages: [] });
    const result = await listConversationMessages(auth.admin, auth.user.id, conversation.id, 24);
    return NextResponse.json({ conversationId: conversation.id, messages: result?.messages.map(({ role, content }) => ({ role, content })) ?? [] });
  } catch (error) {
    if (error instanceof ArthurRouteError) return jsonError(error.message, error.status);
    console.error("[arthur.GET]", error);
    return jsonError("Unable to load this Arthur conversation.", 500);
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = randomUUID();
  try {
    const auth = await authenticatedContext();
    if ("error" in auth) return auth.error;
    if (auth.viewer.role !== "tutor") {
      const limiter = enforceArthurRateLimit(`${auth.user.id}:/api/arthur`);
      if (!limiter.allowed) return jsonError("Too many requests. Please slow down.", 429, { "Retry-After": String(limiter.retryAfterSeconds) });
    }
    let raw: unknown;
    try { raw = await request.json(); } catch { return jsonError("Invalid request body.", 400); }
    const body = parseArthurRequest(raw);
    if (!body) return jsonError("A valid user message and page context are required.", 400);
    if (auth.viewer.role === "student" && await hasActiveAssessment(auth.admin, auth.user.id)) return jsonError("Finish your active formal assessment before using Arthur.", 403);
    const activity = await getVerifiedActivity(auth.admin, auth.user.id, auth.viewer.role, body);
    if (/practi[cs]e/i.test(body.pageTitle) && !activity.text) return jsonError("Arthur becomes available after an incorrect practice answer is marked.", 403);
    if (!activity.text && /assessment/i.test(body.pageTitle)) return jsonError("Arthur is disabled on active assessment pages.", 403);

    const course = await getCanonicalCourseContext(body.pageTitle, body.pdfTitle);
    if (activity.contextKey) course.contextKey = activity.contextKey;
    if (activity.subject) course.subject = activity.subject;
    if (activity.chapter) course.chapter = activity.chapter;
    if (activity.topic) course.topic = activity.topic;
    const evidence = await getLearningEvidence(auth.admin, auth.user.id);
    const latestUserMessage = body.messages.at(-1)?.content ?? "";
    const tools = executeRelevantArthurTools(latestUserMessage, { admin: auth.admin, userId: auth.user.id, course, evidence });
    let conversation = body.conversationId ? await getOwnedConversation(auth.admin, auth.user.id, body.conversationId) : null;
    if (body.conversationId && !conversation) return jsonError("Conversation not found.", 404);
    if (conversation?.context_key !== course.contextKey) conversation = null;
    const provider = createAIProvider();
    const systemPrompt = buildArthurSystemPrompt({ studentName: auth.viewer.name, qualification: course.qualification, subject: course.subject, chapter: course.chapter, topic: course.topic, pageTitle: course.pageTitle, lessonContent: course.lessonContent, verifiedActivityContext: activity.text, learningData: summarizeLearningEvidence(evidence), toolData: tools.output, mathMode: shouldUseMathMode(latestUserMessage) });
    const { data: allowance, error: allowanceError } = await auth.admin.rpc("reserve_arthur_request", { p_user_id: auth.user.id });
    if (allowanceError || allowance !== "allowed") return jsonError(allowance === "daily_limit" ? "You have reached today's Arthur allowance." : allowance === "monthly_limit" ? "Arthur has reached this month's allowance." : "Arthur is temporarily unavailable. Ask your tutor to enable an allowance.", allowanceError || allowance === "disabled" ? 503 : 429);
    conversation ??= await createConversation(auth.admin, { userId: auth.user.id, contextKey: course.contextKey, pageTitle: course.pageTitle, subject: course.subject, chapter: course.chapter, topic: course.topic });
    await appendMessage(auth.admin, conversation.id, { role: "user", content: latestUserMessage });
    const stored = await listConversationMessages(auth.admin, auth.user.id, conversation.id, 12);

    const encoder = new TextEncoder();
    const aborter = new AbortController();
    request.signal.addEventListener("abort", () => aborter.abort(), { once: true });
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let fullText = "";
        let usage: AIUsage | null = null;
        const send = (value: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
        send({ type: "meta", conversationId: conversation.id, requestId });
        try {
          for await (const event of provider.stream({ messages: [{ role: "system", content: systemPrompt }, ...((stored?.messages ?? []).map(({ role, content }) => ({ role, content })))], temperature: shouldUseMathMode(latestUserMessage) ? 0.1 : 0.2 }, aborter.signal)) {
            if (event.type === "text") { fullText += event.text; send({ type: "text", delta: event.text }); }
            else usage = event.usage;
          }
          if (!fullText.trim()) throw new Error("Arthur returned an empty response.");
          await appendMessage(auth.admin, conversation.id, { role: "assistant", content: fullText.trim() });
          await logArthurRequest(auth.admin, { requestId, userId: auth.user.id, conversationId: conversation.id, provider: provider.name, model: provider.model, status: "completed", latencyMs: Date.now() - startedAt, inputTokens: usage?.inputTokens, outputTokens: usage?.outputTokens, totalTokens: usage?.totalTokens, tools: tools.names });
          send({ type: "done" });
        } catch (error) {
          const interrupted = aborter.signal.aborted;
          if (fullText.trim()) await appendMessage(auth.admin, conversation.id, { role: "assistant", content: fullText.trim() }, interrupted ? "interrupted" : "complete");
          await logArthurRequest(auth.admin, { requestId, userId: auth.user.id, conversationId: conversation.id, provider: provider.name, model: provider.model, status: interrupted ? "interrupted" : "failed", latencyMs: Date.now() - startedAt, tools: tools.names, errorCode: interrupted ? "client_abort" : "provider_error" });
          if (!interrupted) send({ type: "error", message: error instanceof Error ? error.message : "Arthur could not respond right now." });
        } finally { controller.close(); }
      },
      cancel() { aborter.abort(); },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    if (error instanceof ArthurRouteError) return jsonError(error.message, error.status);
    console.error("[arthur.POST]", { requestId, error });
    return jsonError("Arthur could not process that request.", 500);
  }
}
