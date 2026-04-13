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

    return NextResponse.json({ message: text });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[arthur] route exception", error);
    return NextResponse.json(
      { error: `Arthur could not process that request: ${detail}` },
      { status: 500 },
    );
  }
}
