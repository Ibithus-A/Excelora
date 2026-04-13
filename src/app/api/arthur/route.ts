import { NextResponse } from "next/server";
import { readPdfTextForSubtopic } from "@/lib/pdf-text";

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

type ArthurRequestBody = {
  pageTitle?: string;
  pageContent?: string;
  messages?: AssistantMessage[];
};

const COHERE_API_URL = "https://api.cohere.com/v2/chat";
const ARTHUR_SYSTEM_PROMPT = `
You are Arthur, a friendly AI study assistant inside the Excelora workspace.
Be concise, accurate, and encouraging.
Use the provided page title, page content, and lesson notes (extracted from the subtopic PDF) as the primary context when answering.
Treat the lesson notes as the authoritative source for this subtopic — quote, paraphrase, and reason from them directly when answering questions.
If the page content and lesson notes are both sparse or missing, say that you are working from limited context.
Prefer helpful study actions like explanation, recap, quizzes, worked examples, and revision support.
Do not claim to see anything outside the provided page context, lesson notes, and user messages.
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

    const cohereResponse = await fetch(COHERE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: `${ARTHUR_SYSTEM_PROMPT}\n\nPage title: ${pageTitle}\n\nPage content:\n${pageContent || "(blank page)"}\n\nLesson notes (extracted from the subtopic PDF):\n${lessonNotes || "(no PDF notes available for this subtopic yet)"}`,
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

function normalizeArthurResponse(input: string) {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\((.*?)\\\)/gs, "$$$1$")
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
