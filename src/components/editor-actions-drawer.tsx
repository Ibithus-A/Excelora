"use client";

import { ArrowUpIcon, AssistantIcon, CloseIcon, MathsIcon } from "@/components/icons";
import katex from "katex";
import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

type MathShortcut = {
  label: string;
  insert: string;
  caretOffset?: number;
  ariaLabel: string;
  className?: string;
  latexLabel?: string;
};

const MATH_SHORTCUTS: MathShortcut[] = [
  { label: "( )", latexLabel: "\\left(\\,\\right)", insert: "()", caretOffset: -1, ariaLabel: "Insert brackets" },
  { label: "x²", latexLabel: "x^2", insert: "x²", caretOffset: 0, ariaLabel: "Insert squared" },
  { label: "xⁿ", latexLabel: "x^n", insert: "x^()", caretOffset: -1, ariaLabel: "Insert power" },
  { label: "√x", latexLabel: "\\sqrt{x}", insert: "√()", caretOffset: -1, ariaLabel: "Insert square root" },
  { label: "a/b", latexLabel: "\\frac{a}{b}", insert: "()/()", caretOffset: -4, ariaLabel: "Insert fraction template" },
  { label: "∫", latexLabel: "\\int", insert: "∫ ", caretOffset: 0, ariaLabel: "Insert integral" },
  { label: "d/dx", latexLabel: "\\frac{d}{dx}", insert: "d/dx ", caretOffset: 0, ariaLabel: "Insert derivative" },
  { label: "π", latexLabel: "\\pi", insert: "π", caretOffset: 0, ariaLabel: "Insert pi" },
  { label: "θ", latexLabel: "\\theta", insert: "θ", caretOffset: 0, ariaLabel: "Insert theta" },
  { label: "≤", latexLabel: "\\leq", insert: " ≤ ", caretOffset: 0, ariaLabel: "Insert less than or equal to" },
  { label: "≥", latexLabel: "\\geq", insert: " ≥ ", caretOffset: 0, ariaLabel: "Insert greater than or equal to" },
  { label: "≠", latexLabel: "\\neq", insert: " ≠ ", caretOffset: 0, ariaLabel: "Insert not equal to" },
  { label: "±", latexLabel: "\\pm", insert: " ± ", caretOffset: 0, ariaLabel: "Insert plus or minus" },
  { label: "sin", latexLabel: "\\sin(x)", insert: "sin()", caretOffset: -1, ariaLabel: "Insert sine" },
  { label: "cos", latexLabel: "\\cos(x)", insert: "cos()", caretOffset: -1, ariaLabel: "Insert cosine" },
  { label: "tan", latexLabel: "\\tan(x)", insert: "tan()", caretOffset: -1, ariaLabel: "Insert tangent" },
  { label: "sin⁻¹", latexLabel: "\\sin^{-1}(x)", insert: "sin⁻¹()", caretOffset: -1, ariaLabel: "Insert inverse sine" },
  { label: "cos⁻¹", latexLabel: "\\cos^{-1}(x)", insert: "cos⁻¹()", caretOffset: -1, ariaLabel: "Insert inverse cosine" },
  { label: "tan⁻¹", latexLabel: "\\tan^{-1}(x)", insert: "tan⁻¹()", caretOffset: -1, ariaLabel: "Insert inverse tangent" },
  { label: "log", latexLabel: "\\log(x)", insert: "log()", caretOffset: -1, ariaLabel: "Insert logarithm" },
  { label: "ln", latexLabel: "\\ln(x)", insert: "ln()", caretOffset: -1, ariaLabel: "Insert natural logarithm" },
  { label: "eˣ", latexLabel: "e^x", insert: "e^()", caretOffset: -1, ariaLabel: "Insert exponential" },
  { label: "|x|", latexLabel: "\\left|x\\right|", insert: "| |", caretOffset: -2, ariaLabel: "Insert modulus" },
];

type EditorActionsDrawerProps = {
  pageTitle: string;
  pageContent: string;
  pageNodeId: string;
  workspaceContext: string;
  onHoverChange?: (isHovered: boolean) => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (isOpen: boolean) => void;
};

export function EditorActionsDrawer({
  pageTitle,
  pageContent,
  pageNodeId,
  workspaceContext,
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
            <DrawerContent
              pageTitle={pageTitle}
              pageContent={pageContent}
              pageNodeId={pageNodeId}
              workspaceContext={workspaceContext}
            />
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
              <DrawerContent
                pageTitle={pageTitle}
                pageContent={pageContent}
                pageNodeId={pageNodeId}
                workspaceContext={workspaceContext}
              />
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
  workspaceContext,
}: {
  pageTitle: string;
  pageContent: string;
  pageNodeId: string;
  workspaceContext: string;
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMathsOpen, setIsMathsOpen] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setMessages([]);
    setDraft("");
    setErrorMessage("");
    setIsMathsOpen(false);
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
          workspaceContext,
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

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    await sendMessage();
  };

  const insertShortcut = (shortcut: MathShortcut) => {
    const composer = composerRef.current;
    const insertText = shortcut.insert;

    if (!composer) {
      setDraft((current) => `${current}${insertText}`);
      return;
    }

    const selectionStart = composer.selectionStart ?? draft.length;
    const selectionEnd = composer.selectionEnd ?? draft.length;
    const nextDraft =
      draft.slice(0, selectionStart) + insertText + draft.slice(selectionEnd);
    const nextCaret =
      selectionStart +
      insertText.length +
      (shortcut.caretOffset ?? 0);

    setDraft(nextDraft);

    requestAnimationFrame(() => {
      composer.focus();
      composer.setSelectionRange(nextCaret, nextCaret);
    });
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
                      <RenderedUserMessage content={message.content} />
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
            <div className="space-y-2 rounded-[12px] bg-zinc-50 px-2.5 py-2.5 ring-1 ring-inset ring-zinc-200/80 transition focus-within:bg-white focus-within:ring-zinc-400">
              {isMathsOpen ? (
                <div className="rounded-[10px] border border-zinc-200 bg-white p-2">
                  <div className="flex flex-wrap gap-1.5">
                    {MATH_SHORTCUTS.map((shortcut) => (
                      <MathShortcutButton
                        key={shortcut.label}
                        shortcut={shortcut}
                        onClick={() => insertShortcut(shortcut)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex items-end gap-1.5">
                <textarea
                  ref={composerRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Ask Arthur anything."
                  aria-label="Ask Arthur anything"
                  className="max-h-28 min-h-[52px] flex-1 resize-none bg-transparent px-0.5 pt-1 text-sm leading-5 text-zinc-800 placeholder:text-zinc-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsMathsOpen((current) => !current)}
                  className={[
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border transition",
                    isMathsOpen
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100",
                  ].join(" ")}
                  aria-expanded={isMathsOpen}
                  aria-label="Toggle maths symbols"
                >
                  <MathsIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void sendMessage();
                  }}
                  disabled={!draft.trim() || isSending}
                  aria-label="Send message"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-zinc-900 text-white shadow-[0_6px_16px_rgba(9,9,11,0.16)] transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
                >
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                </button>
              </div>
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

function MathShortcutButton({
  shortcut,
  onClick,
}: {
  shortcut: MathShortcut;
  onClick: () => void;
}) {
  const html = useMemo(() => {
    if (!shortcut.latexLabel) return null;

    try {
      return katex.renderToString(shortcut.latexLabel, {
        displayMode: false,
        throwOnError: false,
        strict: "ignore",
      });
    } catch {
      return null;
    }
  }, [shortcut.latexLabel]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-8 min-w-[46px] items-center justify-center rounded-[10px] border border-zinc-200/90 bg-[var(--surface-sidebar)] px-3 text-[12.5px] font-normal text-zinc-600 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-zinc-300 hover:bg-white hover:text-zinc-700",
        shortcut.className ?? "",
      ].join(" ")}
      aria-label={shortcut.ariaLabel}
    >
      {html ? (
        <span
          className="math-shortcut-label inline-flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        shortcut.label
      )}
    </button>
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

function RenderedUserMessage({ content }: { content: string }) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2.5 text-[14px] leading-[1.7]">
      {paragraphs.map((paragraph, index) => (
        <p key={`user-paragraph-${index}`} className="whitespace-pre-wrap break-words text-white">
          {renderInlineSegments(paragraph.replace(/\n/g, " "), `user-paragraph-${index}`)}
        </p>
      ))}
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
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, math: string) => `$${math.trim()}$`)
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
      className={
        segment.displayMode
          ? "my-2 block max-w-full overflow-x-auto overflow-y-hidden"
          : "inline-flex max-w-full overflow-x-auto overflow-y-hidden align-middle py-0.5"
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
