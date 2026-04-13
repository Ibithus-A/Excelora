"use client";

import { ArrowUpIcon, AssistantIcon, CloseIcon } from "@/components/icons";
import katex from "katex";
import { FormEvent, KeyboardEvent, ReactNode, useEffect, useMemo, useState } from "react";

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

type MessageSegment =
  | { type: "text"; content: string }
  | { type: "math"; content: string; displayMode: boolean };

type AssistantBlock =
  | { type: "divider" }
  | { type: "paragraph"; content: string };

type EditorActionsDrawerProps = {
  pageTitle: string;
  pageContent: string;
  pageNodeId: string;
  onHoverChange?: (isHovered: boolean) => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (isOpen: boolean) => void;
};

export function EditorActionsDrawer({
  pageTitle,
  pageContent,
  pageNodeId,
  onHoverChange,
  isMobileOpen = false,
  onMobileOpenChange,
}: EditorActionsDrawerProps) {
  const [canUseHoverAssistant, setCanUseHoverAssistant] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateHoverCapability = () => {
      setCanUseHoverAssistant(mediaQuery.matches);
    };

    updateHoverCapability();
    mediaQuery.addEventListener("change", updateHoverCapability);
    return () => {
      mediaQuery.removeEventListener("change", updateHoverCapability);
    };
  }, []);

  return (
    <>
      {canUseHoverAssistant ? (
        <div
          onMouseEnter={() => onHoverChange?.(true)}
          onMouseLeave={() => onHoverChange?.(false)}
          className={[
            "group/assistant pointer-events-none absolute inset-y-0 right-0 z-30 hidden md:block",
            "w-[min(390px,42vw)]",
          ].join(" ")}
        >
          <div
            className={[
              "pointer-events-auto absolute inset-y-0 right-0 w-8 md:w-10",
            ].join(" ")}
          />

          <aside
            className={[
              "pointer-events-auto absolute inset-y-0 right-0 h-full min-h-full w-[min(390px,42vw)] overflow-hidden border-l border-zinc-200 bg-[var(--surface-sidebar)]",
              "translate-x-full opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "group-hover/assistant:translate-x-0 group-hover/assistant:opacity-100",
            ].join(" ")}
          >
            <DrawerContent pageTitle={pageTitle} pageContent={pageContent} pageNodeId={pageNodeId} />
          </aside>
        </div>
      ) : null}

      {!canUseHoverAssistant ? (
        <button
          type="button"
          onClick={() => onMobileOpenChange?.(true)}
          className="fixed bottom-4 right-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-[0_18px_45px_rgba(9,9,11,0.14)] transition hover:bg-zinc-50"
          aria-label="Open AI assistant"
        >
          <AssistantIcon className="h-5 w-5" />
        </button>
      ) : null}

      {!canUseHoverAssistant ? (
        <div
          className={[
            "fixed inset-0 z-50 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => onMobileOpenChange?.(false)}
            className={[
              "absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isMobileOpen ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-label="Close AI assistant"
          />
          <aside
            className={[
              "absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-[28px] border-t border-zinc-200 bg-[var(--surface-sidebar)] shadow-[0_-24px_60px_rgba(9,9,11,0.18)]",
              "transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isMobileOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            ].join(" ")}
          >
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                    <AssistantIcon className="h-4 w-4 text-zinc-800" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Arthur</p>
                    <p className="text-xs text-zinc-500">{pageTitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onMobileOpenChange?.(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700"
                  aria-label="Close AI assistant"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              <DrawerContent pageTitle={pageTitle} pageContent={pageContent} pageNodeId={pageNodeId} />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function DrawerContent({
  pageTitle,
  pageContent,
  pageNodeId,
}: {
  pageTitle: string;
  pageContent: string;
  pageNodeId: string;
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMessages([]);
    setDraft("");
    setErrorMessage("");
  }, [pageTitle]);

  const helperText = useMemo(() => {
    if (pageContent.trim()) {
      return "Arthur can explain this page, summarize it, or help you revise from the notes.";
    }

    return "This page is blank, so Arthur will work from your prompt alone.";
  }, [pageContent]);

  const sendMessage = async () => {
    const trimmedDraft = draft.trim();
    if (!trimmedDraft || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmedDraft }];
    setMessages(nextMessages);
    setDraft("");
    setErrorMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/arthur", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageTitle,
          pageContent,
          pageNodeId,
          messages: nextMessages,
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok || !payload.message) {
        throw new Error(payload.error ?? "Arthur could not respond right now.");
      }

      setMessages((current) => [...current, { role: "assistant", content: payload.message ?? "" }]);
    } catch (error) {
      const nextError =
        error instanceof Error ? error.message : "Arthur could not respond right now.";
      setErrorMessage(nextError);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage();
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    await sendMessage();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="hidden border-b border-zinc-200 px-4 py-4 md:block">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
              Arthur AI Assistant
            </p>
            <p className="mt-1 text-xs text-zinc-500">{pageTitle}</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-700">
            Live
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 px-4 py-4">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[12px] border border-zinc-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-[260px] pt-6 text-center">
                <p className="text-sm font-medium text-zinc-700">Arthur is ready</p>
                <p className="mt-2 text-sm text-zinc-500">{helperText}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={[
                      "max-w-[92%] rounded-[16px] px-4 py-3.5 text-sm leading-6 shadow-sm",
                      message.role === "assistant"
                        ? "assistant-message mr-auto border border-zinc-200/90 bg-[var(--surface-sidebar)] text-zinc-800"
                        : "user-message ml-auto bg-zinc-900 text-white",
                    ].join(" ")}
                  >
                    {message.role === "assistant" ? (
                      <RenderedAssistantMessage content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                  </div>
                ))}
                {isSending ? (
                  <div className="mr-auto max-w-[92%] rounded-[16px] border border-zinc-200/90 bg-[var(--surface-sidebar)] px-4 py-3.5 shadow-sm">
                    <ArthurThinkingSkeleton />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-zinc-200/80 bg-white px-3 py-3">
            <div className="flex items-center gap-2 rounded-[10px] bg-zinc-50 px-3 py-1.5 ring-1 ring-inset ring-zinc-200/80 transition focus-within:bg-white focus-within:ring-zinc-400">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Arthur to explain, quiz, or summarize..."
                className="h-9 flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  void sendMessage();
                }}
                disabled={!draft.trim() || isSending}
                aria-label="Send message"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-zinc-900 text-white shadow-[0_6px_16px_rgba(9,9,11,0.18)] transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
            </div>
            {errorMessage ? (
              <p className="mt-2 px-1 text-xs text-rose-600">{errorMessage}</p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

function RenderedAssistantMessage({ content }: { content: string }) {
  const blocks = useMemo(() => parseAssistantBlocks(content), [content]);

  return (
    <div className="space-y-3.5 text-[14px] leading-[1.75] tracking-[-0.005em]">
      {blocks.map((block, index) =>
        block.type === "divider" ? (
          <div key={`divider-${index}`} className="flex items-center py-1.5" aria-hidden="true">
            <span className="h-px w-full bg-zinc-200" />
          </div>
        ) : (
          <p key={`paragraph-${index}`} className="whitespace-pre-wrap break-words text-zinc-700">
            {renderParagraph(block.content, `paragraph-${index}`)}
          </p>
        ),
      )}
    </div>
  );
}

function ArthurThinkingSkeleton() {
  return (
    <div aria-label="Arthur is thinking" aria-live="polite" className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-zinc-400">
        <span className="loading-dot h-2 w-2 rounded-full bg-zinc-300" />
        Arthur is thinking
      </div>
      <div className="space-y-2">
        <div className="loading-skeleton h-3 w-24 rounded-full" />
        <div className="loading-skeleton h-3 w-full rounded-full" />
        <div className="loading-skeleton h-3 w-[88%] rounded-full" />
        <div className="loading-skeleton h-3 w-[68%] rounded-full" />
      </div>
    </div>
  );
}

function parseAssistantBlocks(content: string) {
  const normalized = normalizeAssistantContent(content);

  const chunks = normalized.split(/\n{2,}/).map((chunk) => chunk.trim()).filter(Boolean);

  return chunks.map<AssistantBlock>((chunk) => {
    if (/^([-_])\1{2,}$/.test(chunk)) {
      return { type: "divider" as const };
    }

    return {
      type: "paragraph" as const,
      content: chunk
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (/^([-_])\1{2,}$/.test(trimmed)) {
            return "";
          }

          return trimmed.replace(/^([-*]|\d+\.)\s+/, "");
        })
        .filter(Boolean)
        .join(" "),
    };
  });
}

function renderInlineSegments(content: string, keyPrefix: string) {
  return splitMessageSegments(content).map((segment, index) => {
    if (segment.type === "math") {
      return <MathSegment key={`${keyPrefix}-math-${index}`} segment={segment} />;
    }

    return renderFormattedText(segment.content, `${keyPrefix}-text-${index}`);
  });
}

function splitMessageSegments(content: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  const mathPattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g;
  let lastIndex = 0;

  for (const match of content.matchAll(mathPattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", content: content.slice(lastIndex, index) });
    }

    const token = match[0];
    const displayMode = token.startsWith("$$");
    segments.push({
      type: "math",
      content: token.slice(displayMode ? 2 : 1, displayMode ? -2 : -1).trim(),
      displayMode,
    });
    lastIndex = index + token.length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", content: content.slice(lastIndex) });
  }

  return segments;
}

function renderFormattedText(content: string, keyPrefix: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`)/g;
  let lastIndex = 0;

  for (const match of content.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(content.slice(lastIndex, index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-${index}`} className="font-semibold text-zinc-900">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyPrefix}-${index}`}
          className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.92em] text-zinc-800"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return nodes;
}

function renderParagraph(content: string, keyPrefix: string) {
  const labelMatch = content.match(/^(Step\s*\d+\.|Question\.|Solution\.|Answer\.)\s+(.*)$/);
  if (!labelMatch) {
    return renderInlineSegments(content, keyPrefix);
  }

  return (
    <>
      <span className="mr-1.5 font-semibold text-zinc-900">{labelMatch[1]}</span>
      {renderInlineSegments(labelMatch[2], `${keyPrefix}-rest`)}
    </>
  );
}

function normalizeAssistantContent(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\((.*?)\\\)/gs, (_, math: string) => `$${math.trim()}$`)
    .replace(/\\([*_`])/g, "$1")
    .replace(/\*{3,}/g, "")
    .replace(/\*\*\s*(Worked Example|Worked example)\s*:?\s*\*\*/g, "\n\nWorked example.")
    .replace(/\*\*\s*(Another Question|Your Turn|Try this)\s*:?\s*\*\*/g, "\n\n$1.")
    .replace(/\*\*\s*(Question|Solution|Answer)\s*:?\s*\*\*/g, "\n\n$1. ")
    .replace(/\*\*\s*(Step\s*\d+)\s*:?\s*\*\*/gi, "\n\n$1. ")
    .replace(/(?<!\*)\b(Step\s*\d+)\s*:\s*/gi, "\n\n$1. ")
    .replace(/(?<!\*)\b(Question|Solution|Answer)\s*:\s*/g, "\n\n$1. ")
    .replace(/\b(Worked example)\s*:\s*/gi, "\n\nWorked example. ")
    .replace(/\b(Another Question|Your Turn|Try this)\s*:\s*/g, "\n\n$1. ")
    .replace(/^\*\s+/gm, "")
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, "$1$2")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function MathSegment({ segment }: { segment: Extract<MessageSegment, { type: "math" }> }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(segment.content, {
        displayMode: segment.displayMode,
        throwOnError: false,
        strict: "ignore",
      });
    } catch {
      return null;
    }
  }, [segment.content, segment.displayMode]);

  if (!html) {
    return (
      <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.92em] text-zinc-800">
        {segment.content}
      </code>
    );
  }

  return (
    <span
      className={segment.displayMode ? "my-2 block overflow-x-auto" : "inline-block align-middle"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
