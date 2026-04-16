import { NextResponse } from "next/server";
import { readPdfTextForSubtopic } from "@/lib/pdf-text";

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

type ArthurRequestBody = {
  pageTitle?: string;
  pageContent?: string;
  workspaceContext?: string;
  messages?: AssistantMessage[];
};

const COHERE_API_URL = "https://api.cohere.com/v2/chat";
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

  try {
    const body = (await request.json()) as ArthurRequestBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const pageTitle = body.pageTitle?.trim() ?? "Untitled page";
    const pageContent = body.pageContent?.trim() ?? "";
    const workspaceContext = body.workspaceContext?.trim() ?? "";
    const latestUserMessage = messages[messages.length - 1];

    let lessonNotes = "";
    if (pageTitle) {
      try {
        lessonNotes = (await readPdfTextForSubtopic(pageTitle)) ?? "";
      } catch (error) {
        console.error("[arthur] pdf extraction failed", pageTitle, error);
      }
    }

    if (!latestUserMessage || latestUserMessage.role !== "user" || !latestUserMessage.content.trim()) {
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

    const cohereResponse = await fetch(COHERE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        temperature: isMathMode ? 0.1 : 0.2,
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: `${systemPrompt}\n\nCurrent page title: ${pageTitle}\n\nCurrent page content:\n${pageContent || "(blank page)"}\n\nLesson notes (extracted from the subtopic PDF):\n${lessonNotes || "(no PDF notes available for this subtopic yet)"}\n\nWorkspace context:\n${workspaceContext || "(no additional workspace context provided)"}`,
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
        (typeof payload.error === "string" ? payload.error : payload.error?.message) ??
        (payload as { message?: string }).message ??
        rawBody ??
        "Cohere request failed.";
      console.error("[arthur] Cohere error", cohereResponse.status, providerError);
      return NextResponse.json(
        { error: `Cohere ${cohereResponse.status}: ${providerError}` },
        { status: cohereResponse.status },
      );
    }

    const text =
      payload.message?.content
        ?.filter((item) => item.type === "text" && typeof item.text === "string")
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
    .replace(/\*\*\s*(Worked Example|Worked example)\s*:?\s*\*\*/g, "\n\nWorked example.")
    .replace(/\*\*\s*(Another Question|Your Turn|Try this)\s*:?\s*\*\*/g, "\n\n$1.")
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
