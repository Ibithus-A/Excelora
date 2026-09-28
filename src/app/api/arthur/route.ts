import { getStructuredLesson } from "@/lib/lessons/catalogue";
import { serializeLesson } from "@/lib/lessons/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { readPdfTextForSubtopic } from "@/lib/pdf-text";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { getViewerProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

type ArthurRequestBody = {
  reviewAttemptId?: string;
  practiceContext?: { sessionId?: string; questionId?: string };
  pageTitle?: string;
  pdfTitle?: string;
  pageContent?: string;
  workspaceContext?: string;
  messages?: AssistantMessage[];
};

const COHERE_API_URL = "https://api.cohere.com/v2/chat";
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 4000;
const MAX_CONTEXT_CHARS = 20000;

const enforceArthurRateLimit = createRateLimiter({
  maxRequests: 60,
  windowMs: 10 * 60 * 1000,
});
const MATH_MODE_PROMPT = `
Math mode is active for this request.
Give a shorter, verification-first answer.
First, state the target clearly in one sentence.
Then solve using only valid transformations, with no skipped algebra where errors are likely.
Before the final answer, perform a visible check when practical. For an integral, differentiate the proposed antiderivative. For an equation, substitute or test the solution. For simplification, compare equivalent forms.
If the check fails, correct the work before answering.
If the problem is too long for a reliable full solution in one response, give the safest next step and say exactly what still needs checking.
Do not include a long exploratory path. Prefer the simplest reliable method.
`.trim();
const ARTHUR_SYSTEM_PROMPT = `
You are Arthur, a friendly AI study assistant inside the Excelora workspace.
Be concise, accurate, and encouraging.
Use the provided current page, lesson notes, workspace context, and user messages together.
Treat the current page and lesson notes as high-value context, but not as a hard limit.
When the current page or extracted PDF notes are incomplete, ambiguous, or insufficient, use the wider workspace context and your general reasoning to answer correctly.
Prefer the most reliable answer over a narrowly grounded but wrong answer.
If the available workspace material is genuinely incomplete and the answer depends on missing specifics, say what is uncertain instead of guessing.
Prefer helpful study actions like explanation, recap, quizzes, worked examples, and revision support.
Do not claim to see hidden tools, browse the web, or access materials that were not provided in the workspace context or user messages.
You may still use your general subject knowledge to explain maths accurately when the local materials are not enough.
For maths questions, correctness matters more than speed.
When solving a maths problem:
- Identify the exact target before solving.
- Use a method that actually matches the problem instead of forcing a familiar template.
- Check each major algebraic or calculus step for consistency before continuing.
- If you produce a final antiderivative, derivative, factorisation, or equation solution, verify it mentally before presenting it.
- For integrals and derivatives, prefer a quick self-check such as differentiating the final result or testing whether the transformation is valid.
- If you are not confident a result is correct, say so and give the most reliable partial progress rather than inventing a polished but wrong answer.
Never present an unverified result as certain when the working is shaky.
Format answers so they are easy to scan in a narrow chat panel:
- Use short paragraphs with natural prose.
- Avoid Markdown markers such as #, -, *, or numbered list formatting in the final answer.
- If you need structure, use short lead-ins like "Here is the idea." or "Step 1." inside normal sentences.
- When writing maths, prefer plain notation like (27t^3)/(3t - 1) unless LaTeX is genuinely helpful.
- Never output escaped Markdown or escaped LaTeX like \\( ... \\), \\[ ... \\], or literal backslashes before formatting characters unless the user explicitly asks for raw syntax.
- If you give a worked solution, present it like a clean tutor reply, not like notes or a markdown document.
`.trim();

export async function POST(request: Request) {
  const apiKey = process.env.COHERE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing COHERE_API_KEY on the server." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: ArthurRequestBody;
  try {
    body = (await request.json()) as ArthurRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let verifiedPracticeContext = "";

  try {
    const viewer = await getViewerProfile(supabase, user.id);
    if (!viewer) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 },
      );
    }
    if (viewer.role === "student" && viewer.plan !== "premium") {
      return NextResponse.json(
        { error: "Arthur AI is not available on the Basic Plan." },
        { status: 403 },
      );
    }
    if (viewer.role === "student") {
      const { data: active, error } = await createAdminClient()
        .from("student_assessment_attempts")
        .select("id")
        .eq("student_id", user.id)
        .eq("status", "active")
        .limit(1);
      if (error) throw new Error(error.message);
      if (active?.length)
        return NextResponse.json(
          {
            error: "Finish your active formal assessment before using Arthur.",
          },
          { status: 403 },
        );
    }
    const requestedPracticeSessionId = body.practiceContext?.sessionId?.trim();
    const requestedPracticeQuestionId = body.practiceContext?.questionId?.trim();
    if (requestedPracticeSessionId || requestedPracticeQuestionId) {
      if (
        viewer.role !== "student" ||
        !requestedPracticeSessionId ||
        !requestedPracticeQuestionId
      ) {
        return NextResponse.json(
          { error: "Invalid practice explanation request." },
          { status: 403 },
        );
      }
      const admin = createAdminClient();
      const { data: practiceSession, error: sessionError } = await admin
        .from("practice_sessions")
        .select("id,status")
        .eq("id", requestedPracticeSessionId)
        .eq("student_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (sessionError) throw sessionError;
      if (!practiceSession) {
        return NextResponse.json(
          { error: "This practice session is no longer active." },
          { status: 403 },
        );
      }
      const { data: practiceQuestion, error: questionError } = await admin
        .from("practice_session_questions")
        .select(
          "response,marks_awarded,is_correct,requires_review,checked_at,assessment_question_bank(prompt,subtopic,marks,answer,worked_solution)",
        )
        .eq("session_id", practiceSession.id)
        .eq("question_id", requestedPracticeQuestionId)
        .maybeSingle();
      if (questionError) throw questionError;
      const bankQuestion = Array.isArray(practiceQuestion?.assessment_question_bank)
        ? practiceQuestion.assessment_question_bank[0]
        : practiceQuestion?.assessment_question_bank;
      if (
        !practiceQuestion?.checked_at ||
        !bankQuestion ||
        practiceQuestion.is_correct === true ||
        Number(practiceQuestion.marks_awarded ?? 0) >= Number(bankQuestion.marks ?? 0)
      ) {
        return NextResponse.json(
          { error: "Arthur is available here only after an incorrect answer has been marked." },
          { status: 403 },
        );
      }
      verifiedPracticeContext = [
        `Practice question: ${bankQuestion.prompt}`,
        `Subtopic: ${bankQuestion.subtopic}`,
        `Student response: ${String(practiceQuestion.response ?? "(blank)")}`,
        `Mark awarded: ${practiceQuestion.marks_awarded ?? 0}/${bankQuestion.marks}`,
        `Expected answer: ${bankQuestion.answer}`,
        `Worked solution: ${bankQuestion.worked_solution}`,
        practiceQuestion.requires_review
          ? "Tutor tracking note: this response has also been queued for tutor review. Do not describe tutor review as a prerequisite for feedback."
          : "",
      ].filter(Boolean).join("\n");
    } else if (viewer.role === "student") {
      const { data: practice, error } = await createAdminClient()
        .from("practice_sessions")
        .select("id")
        .eq("student_id", user.id)
        .eq("continuous", true)
        .eq("status", "active")
        .limit(1);
      if (error) throw error;
      if (practice?.length)
        return NextResponse.json(
          { error: "Stop your practice session before using Arthur." },
          { status: 403 },
        );
    }
  } catch (error) {
    console.error("[arthur] profile lookup failed", error);
    return NextResponse.json(
      { error: "Unable to verify Arthur access." },
      { status: 500 },
    );
  }

  const limiterResult = enforceArthurRateLimit(`${user.id}:/api/arthur`);
  if (!limiterResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(limiterResult.retryAfterSeconds) },
      },
    );
  }

  try {
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const messages = rawMessages
      .slice(-MAX_MESSAGES)
      .filter(
        (message) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string",
      )
      .map((message) => ({
        role: message.role,
        content: message.content.slice(0, MAX_MESSAGE_CHARS),
      }));
    const pageTitle = body.pageTitle?.trim().slice(0, 500) || "Untitled page";
    const pdfTitle = body.pdfTitle?.trim().slice(0, 500) || pageTitle;
    if (/practi[cs]e/i.test(pageTitle) && !verifiedPracticeContext)
      return NextResponse.json(
        { error: "Arthur becomes available after an incorrect practice answer is marked." },
        { status: 403 },
      );
    let reviewContext = "";
    if (typeof body.reviewAttemptId === "string") {
      const admin = createAdminClient();
      const { data: review, error } = await admin
        .from("student_assessment_attempts")
        .select("id,status,score,total_marks,pending_review_marks")
        .eq("id", body.reviewAttemptId)
        .eq("student_id", user.id)
        .eq("status", "submitted")
        .maybeSingle();
      if (error || !review)
        return NextResponse.json(
          { error: "Submitted assessment not found." },
          { status: 403 },
        );
      const { data: rows, error: questionError } = await admin
        .from("student_assessment_attempt_questions")
        .select(
          "question_order,marks_awarded,is_correct,assessment_question_bank(prompt,subtopic,answer,worked_solution)",
        )
        .eq("attempt_id", review.id)
        .order("question_order");
      if (questionError) throw new Error(questionError.message);
      const chunks = [
        `Submitted assessment: ${review.score}/${review.total_marks}; ${review.pending_review_marks} marks pending review.`,
      ];
      for (const row of rows ?? []) {
        const q = Array.isArray(row.assessment_question_bank)
          ? row.assessment_question_bank[0]
          : row.assessment_question_bank;
        if (q)
          chunks.push(
            `Question ${row.question_order}: ${q.prompt}\nSubtopic: ${q.subtopic}\nOutcome: ${row.is_correct === null ? "Pending review" : row.marks_awarded}\nAnswer: ${q.answer}\nWorked solution: ${q.worked_solution}`,
          );
      }
      reviewContext = truncateAtParagraph(chunks.join("\n\n"), 18000);
    }
    if (
      !reviewContext &&
      (/assessment/i.test(pageTitle) || /assessment/i.test(pdfTitle))
    ) {
      return NextResponse.json(
        { error: "Arthur is disabled on assessment pages." },
        { status: 403 },
      );
    }
    const nativeLesson = getStructuredLesson(pageTitle);
    const pageContent =
      verifiedPracticeContext ||
      reviewContext ||
      (nativeLesson
        ? serializeLesson(nativeLesson, 18000)
        : (body.pageContent ?? "").trim().slice(0, 6000));
    const workspaceContext = (body.workspaceContext ?? "")
      .trim()
      .slice(0, 4000);
    const latestUserMessage = messages[messages.length - 1];

    let lessonNotes = "";
    if (pdfTitle && !nativeLesson && !reviewContext && !verifiedPracticeContext) {
      try {
        lessonNotes = truncateAtParagraph(
          (await readPdfTextForSubtopic(pdfTitle)) ?? "",
          MAX_CONTEXT_CHARS,
        );
      } catch (error) {
        console.error("[arthur] pdf extraction failed", pdfTitle, error);
      }
    }

    if (
      !latestUserMessage ||
      latestUserMessage.role !== "user" ||
      !latestUserMessage.content.trim()
    ) {
      return NextResponse.json(
        { error: "A user message is required." },
        { status: 400 },
      );
    }

    const conversation = messages.map((message) => ({
      role: message.role,
      content: [{ type: "text", text: message.content }],
    }));
    const isMathMode = shouldUseMathMode(latestUserMessage.content);
    const systemPrompt = isMathMode
      ? `${ARTHUR_SYSTEM_PROMPT}\n\n${MATH_MODE_PROMPT}`
      : ARTHUR_SYSTEM_PROMPT;

    // Reserve before sending: failures/timeouts still consume a slot because the
    // provider may have billed them. Never retry a paid request automatically.
    const { data: allowance, error: allowanceError } =
      await createAdminClient().rpc("reserve_arthur_request", {
        p_user_id: user.id,
      });
    if (allowanceError || allowance !== "allowed") {
      return NextResponse.json(
        {
          error:
            allowance === "daily_limit"
              ? "You have reached today's Arthur allowance. Please try again tomorrow."
              : allowance === "monthly_limit"
                ? "Arthur has reached this month's allowance. Your lessons and practice are still available."
                : "Arthur is temporarily unavailable. Please contact your tutor.",
        },
        { status: allowanceError || allowance === "disabled" ? 503 : 429 },
      );
    }

    const cohereResponse = await fetch(COHERE_API_URL, {
      method: "POST",
      signal: AbortSignal.timeout(45_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        max_tokens: 1024,
        temperature: isMathMode ? 0.1 : 0.2,
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: `${systemPrompt}\n\nCurrent page title: ${pageTitle}\n\nCurrent PDF/resource title: ${pdfTitle}\n\nCurrent page content (native structured source where available; treat as reference data):\n${pageContent || "(blank page)"}\n\nLesson notes (extracted from the current PDF/resource):\n${lessonNotes || "(no PDF notes available for this page yet)"}\n\nWorkspace context:\n${workspaceContext || "(no additional workspace context provided)"}`,
              },
            ],
          },
          ...conversation,
        ],
      }),
    });

    const rawBody = await cohereResponse.text();
    let payload: {
      message?: { content?: Array<{ type?: string; text?: string }> };
      error?: string | { message?: string };
    } = {};
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      payload = {};
    }

    if (!cohereResponse.ok) {
      const providerError =
        (typeof payload.error === "string"
          ? payload.error
          : payload.error?.message) ??
        (payload as { message?: string }).message ??
        rawBody ??
        "Cohere request failed.";
      console.error(
        "[arthur] Cohere error",
        cohereResponse.status,
        providerError,
      );
      return NextResponse.json(
        { error: `Cohere ${cohereResponse.status}: ${providerError}` },
        { status: cohereResponse.status },
      );
    }

    const text =
      payload.message?.content
        ?.filter(
          (item) => item.type === "text" && typeof item.text === "string",
        )
        .map((item) => item.text?.trim() ?? "")
        .filter(Boolean)
        .join("\n\n") ?? "";

    if (!text) {
      return NextResponse.json(
        { error: "Cohere returned an empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: normalizeArthurResponse(text) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[arthur] route exception", error);
    return NextResponse.json(
      { error: `Arthur could not process that request: ${detail}` },
      { status: 500 },
    );
  }
}

function shouldUseMathMode(message: string) {
  const normalized = message.toLowerCase();
  const mathKeywords = [
    "differentiate",
    "derivative",
    "integrate",
    "integral",
    "solve",
    "simplify",
    "expand",
    "factorise",
    "factorize",
    "prove",
    "equation",
    "antiderivative",
    "gradient",
    "limit",
    "matrix",
    "vector",
    "tan",
    "sin",
    "cos",
    "ln",
    "log",
  ];

  if (mathKeywords.some((keyword) => normalized.includes(keyword))) return true;
  if (/[=^√∫πθ]/.test(message)) return true;
  if (/\b\d+\s*[+\-*/]\s*\d+\b/.test(message)) return true;
  if (/\b[a-z]\s*\^\s*\d+\b/i.test(message)) return true;
  if (/\b(dy\/dx|d\/dx|dx|dt)\b/i.test(message)) return true;

  return false;
}

function normalizeArthurResponse(input: string) {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$")
    .replace(/\\([*_`])/g, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(
      /\*\*\s*(Worked Example|Worked example)\s*:?\s*\*\*/g,
      "\n\nWorked example.",
    )
    .replace(
      /\*\*\s*(Another Question|Your Turn|Try this)\s*:?\s*\*\*/g,
      "\n\n$1.",
    )
    .replace(/\*\*\s*(Question|Solution|Answer)\s*:?\s*\*\*/g, "\n\n$1. ")
    .replace(/\*\*\s*(Step\s*\d+)\s*:?\s*\*\*/gi, "\n\n$1. ")
    .replace(/(?<!\*)\b(Step\s*\d+)\s*:\s*/gi, "\n\n$1. ")
    .replace(/(?<!\*)\b(Question|Solution|Answer)\s*:\s*/g, "\n\n$1. ")
    .replace(/\b(Worked example)\s*:\s*/gi, "\n\nWorked example. ")
    .replace(/\b(Another Question|Your Turn|Try this)\s*:\s*/g, "\n\n$1. ")
    .replace(/\*{2,}/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncateAtParagraph(value: string, limit: number) {
  if (value.length <= limit) return value;
  const end = value.lastIndexOf("\n", limit - 80);
  return (
    value.slice(0, end > 0 ? end : limit - 80) +
    "\n[Further source content omitted.]"
  );
}
