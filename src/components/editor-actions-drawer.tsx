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
  id: string;
  label: string;
  insert: string;
  caretOffset?: number;
  ariaLabel: string;
  className?: string;
  latexLabel?: string;
  template?: MathTemplateKind;
  templateValues?: Record<string, string>;
  buildInsertion?: (selection: string) => { text: string; caretIndex: number };
};

type MathKeypadSection = {
  id: string;
  label: string;
  shortcuts: MathShortcut[];
};

type MathTemplateKind =
  | "fraction"
  | "power"
  | "root"
  | "integral"
  | "definiteIntegral"
  | "limit"
  | "function"
  | "derivative";

type ActiveMathTemplate = {
  kind: MathTemplateKind;
  values: Record<string, string>;
};

type ComposerMathItem = {
  id: string;
  text: string;
  latex: string;
};

type ComposerToken =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "math"; text: string; latex: string };

const MATH_SLOT_TOOLS = [
  { label: "x", insert: "x" },
  { label: "x²", insert: "x^2" },
  { label: "xⁿ", insert: "x^n" },
  { label: "√", insert: "sqrt(x)" },
  { label: "sin", insert: "sin(x)" },
  { label: "cos", insert: "cos(x)" },
  { label: "tan", insert: "tan(x)" },
  { label: "sec", insert: "sec(x)" },
  { label: "cosec", insert: "cosec(x)" },
  { label: "cot", insert: "cot(x)" },
  { label: "ln", insert: "ln(x)" },
  { label: "eˣ", insert: "e^x" },
  { label: "π", insert: "π" },
];

function groupBaseIfNeeded(value: string) {
  return /[\s+\-*/]/.test(value) ? `(${value})` : value;
}

const MATH_KEYPAD_SECTIONS: MathKeypadSection[] = [
  {
    id: "structure",
    label: "Structure",
    shortcuts: [
      {
        id: "brackets",
        label: "()",
        latexLabel: "\\left(\\square\\right)",
        insert: "()",
        caretOffset: -1,
        ariaLabel: "Insert brackets",
        buildInsertion: (selection) => ({
          text: selection ? `(${selection})` : "()",
          caretIndex: selection ? selection.length + 2 : 1,
        }),
      },
      {
        id: "squared",
        label: "x²",
        latexLabel: "x^2",
        insert: "",
        ariaLabel: "Build a square",
        template: "power",
        templateValues: { exponent: "2" },
      },
      {
        id: "power",
        label: "x^n",
        latexLabel: "x^n",
        insert: "",
        ariaLabel: "Build a power",
        template: "power",
      },
      {
        id: "root",
        label: "root",
        latexLabel: "\\sqrt{x}",
        insert: "",
        ariaLabel: "Build a square root",
        template: "root",
      },
      {
        id: "fraction",
        label: "fraction",
        latexLabel: "\\frac{a}{b}",
        insert: "",
        ariaLabel: "Build a fraction",
        template: "fraction",
        className: "min-w-[64px]",
      },
      {
        id: "absolute",
        label: "| |",
        latexLabel: "\\left|x\\right|",
        insert: "| |",
        caretOffset: -2,
        ariaLabel: "Insert modulus",
        buildInsertion: (selection) => ({
          text: selection ? `|${selection}|` : "| |",
          caretIndex: selection ? selection.length + 2 : 1,
        }),
      },
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    shortcuts: [
      {
        id: "integral",
        label: "integral",
        latexLabel: "\\int f(x)\\,dx",
        insert: "",
        ariaLabel: "Build an indefinite integral",
        template: "integral",
        className: "min-w-[72px]",
      },
      {
        id: "definite-integral",
        label: "definite integral",
        latexLabel: "\\int_a^b f(x)\\,dx",
        insert: "",
        ariaLabel: "Build a definite integral",
        template: "definiteIntegral",
        className: "min-w-[88px]",
      },
      {
        id: "derivative",
        label: "d/dx",
        latexLabel: "\\frac{d}{dx}f(x)",
        insert: "",
        ariaLabel: "Build a derivative",
        template: "derivative",
        templateValues: { numerator: "d", denominator: "dx" },
      },
      {
        id: "dy-dx",
        label: "dy/dx",
        latexLabel: "\\frac{dy}{dx}",
        insert: "",
        ariaLabel: "Build dy by dx",
        template: "derivative",
        templateValues: { numerator: "dy", denominator: "dx" },
      },
      {
        id: "limit",
        label: "limit",
        latexLabel: "\\lim_{x\\to a} f(x)",
        insert: "",
        ariaLabel: "Build a limit",
        template: "limit",
        className: "min-w-[82px]",
      },
    ],
  },
  {
    id: "functions",
    label: "Functions",
    shortcuts: [
      { id: "sin", label: "sin()", latexLabel: "\\sin(x)", insert: "", ariaLabel: "Build sine", template: "function", templateValues: { name: "sin" } },
      { id: "cos", label: "cos()", latexLabel: "\\cos(x)", insert: "", ariaLabel: "Build cosine", template: "function", templateValues: { name: "cos" } },
      { id: "tan", label: "tan()", latexLabel: "\\tan(x)", insert: "", ariaLabel: "Build tangent", template: "function", templateValues: { name: "tan" } },
      { id: "sec", label: "sec()", latexLabel: "\\sec(x)", insert: "", ariaLabel: "Build secant", template: "function", templateValues: { name: "sec" } },
      { id: "cosec", label: "cosec()", latexLabel: "\\cosec(x)", insert: "", ariaLabel: "Build cosecant", template: "function", templateValues: { name: "cosec", latexName: "\\cosec" } },
      { id: "cot", label: "cot()", latexLabel: "\\cot(x)", insert: "", ariaLabel: "Build cotangent", template: "function", templateValues: { name: "cot" } },
      { id: "asin", label: "sin⁻¹()", latexLabel: "\\sin^{-1}(x)", insert: "", ariaLabel: "Build inverse sine", template: "function", templateValues: { name: "sin⁻¹", latexName: "\\sin^{-1}" } },
      { id: "acos", label: "cos⁻¹()", latexLabel: "\\cos^{-1}(x)", insert: "", ariaLabel: "Build inverse cosine", template: "function", templateValues: { name: "cos⁻¹", latexName: "\\cos^{-1}" } },
      { id: "atan", label: "tan⁻¹()", latexLabel: "\\tan^{-1}(x)", insert: "", ariaLabel: "Build inverse tangent", template: "function", templateValues: { name: "tan⁻¹", latexName: "\\tan^{-1}" } },
      { id: "log", label: "log()", latexLabel: "\\log(x)", insert: "", ariaLabel: "Build logarithm", template: "function", templateValues: { name: "log" } },
      { id: "ln", label: "ln()", latexLabel: "\\ln(x)", insert: "", ariaLabel: "Build natural logarithm", template: "function", templateValues: { name: "ln" } },
      {
        id: "exponential",
        label: "e^()",
        latexLabel: "e^x",
        insert: "",
        ariaLabel: "Build exponential",
        template: "power",
        templateValues: { base: "e", exponent: "x" },
      },
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    shortcuts: [
      { id: "pi", label: "π", latexLabel: "\\pi", insert: "π", caretOffset: 0, ariaLabel: "Insert pi" },
      { id: "theta", label: "θ", latexLabel: "\\theta", insert: "θ", caretOffset: 0, ariaLabel: "Insert theta" },
      { id: "infinity", label: "∞", latexLabel: "\\infty", insert: "∞", caretOffset: 0, ariaLabel: "Insert infinity" },
      { id: "less-equal", label: "≤", latexLabel: "\\leq", insert: " ≤ ", caretOffset: 0, ariaLabel: "Insert less than or equal to" },
      { id: "greater-equal", label: "≥", latexLabel: "\\geq", insert: " ≥ ", caretOffset: 0, ariaLabel: "Insert greater than or equal to" },
      { id: "not-equal", label: "≠", latexLabel: "\\neq", insert: " ≠ ", caretOffset: 0, ariaLabel: "Insert not equal to" },
      { id: "plus-minus", label: "±", latexLabel: "\\pm", insert: " ± ", caretOffset: 0, ariaLabel: "Insert plus or minus" },
    ],
  },
];

type EditorActionsDrawerProps = {
  pageTitle: string;
  pdfTitle?: string;
  pageContent: string;
  pageNodeId: string;
  workspaceContext: string;
  onHoverChange?: (isHovered: boolean) => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (isOpen: boolean) => void;
};

export function EditorActionsDrawer({
  pageTitle,
  pdfTitle,
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
              pdfTitle={pdfTitle}
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
                pdfTitle={pdfTitle}
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
  pdfTitle,
  pageContent,
  pageNodeId,
  workspaceContext,
}: {
  pageTitle: string;
  pdfTitle?: string;
  pageContent: string;
  pageNodeId: string;
  workspaceContext: string;
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [composerTokens, setComposerTokens] = useState<ComposerToken[]>([]);
  const [draft, setDraft] = useState("");
  const [activeTextTokenId, setActiveTextTokenId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMathsOpen, setIsMathsOpen] = useState(false);
  const [activeMathTemplate, setActiveMathTemplate] = useState<ActiveMathTemplate | null>(null);
  const composerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMessages([]);
    setComposerTokens([]);
    setDraft("");
    setActiveTextTokenId(null);
    setErrorMessage("");
    setIsMathsOpen(false);
    setActiveMathTemplate(null);
  }, [pageTitle]);

  const helperText = useMemo(() => {
    if (pageContent.trim()) {
      return "Arthur can explain this page, summarize it, or help you revise from the notes.";
    }

    return "This page is blank, so Arthur will work from your prompt alone.";
  }, [pageContent]);

  const sendMessage = async () => {
    const trimmedDraft = draft.trim();
    const committedTokens = trimmedDraft
      ? [...composerTokens, createTextToken(trimmedDraft)]
      : composerTokens;
    const messageContent = serializeComposerTokens(committedTokens, "text");
    if (!messageContent || isSending) return;

    const displayContent = serializeComposerTokens(committedTokens, "display");
    const nextMessages = [...messages, { role: "user" as const, content: displayContent }];
    setMessages(nextMessages);
    setComposerTokens([]);
    setDraft("");
    setActiveTextTokenId(null);
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
          pdfTitle,
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

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !draft && composerTokens.length) {
      event.preventDefault();
      setComposerTokens((current) => current.slice(0, -1));
      return;
    }

    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    await sendMessage();
  };

  const commitDraftText = () => {
    const text = draft.trim();
    if (!text) return;

    setComposerTokens((current) => [...current, createTextToken(text)]);
    setDraft("");
    setActiveTextTokenId(null);
  };

  const insertComposerToken = (token: ComposerToken) => {
    setComposerTokens((current) => {
      if (!activeTextTokenId) return [...current, token];

      const activeIndex = current.findIndex((candidate) => candidate.id === activeTextTokenId);
      if (activeIndex === -1) return [...current, token];

      return [
        ...current.slice(0, activeIndex + 1),
        token,
        ...current.slice(activeIndex + 1),
      ];
    });
    setActiveTextTokenId(null);
  };

  const insertShortcut = (shortcut: MathShortcut) => {
    if (shortcut.template) {
      if (!activeTextTokenId) commitDraftText();
      setActiveMathTemplate(createMathTemplate(shortcut.template, shortcut.templateValues));
      return;
    }

    const selection = "";
    const insertion = shortcut.buildInsertion
      ? shortcut.buildInsertion(selection)
      : {
          text: shortcut.insert,
          caretIndex: shortcut.insert.length + (shortcut.caretOffset ?? 0),
        };

    setDraft((current) => `${current}${insertion.text}`);
    requestAnimationFrame(() => composerRef.current?.focus());
  };

  const commitMathTemplate = () => {
    if (!activeMathTemplate) return;

    const expression = serializeMathTemplate(activeMathTemplate);
    commitDraftText();
    insertComposerToken({
      id: `${Date.now()}-math-${Math.random().toString(36).slice(2)}`,
      type: "math",
      text: expression.text,
      latex: expression.latex,
    });
    setActiveMathTemplate(null);
    requestAnimationFrame(() => composerRef.current?.focus());
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
                  <div className="max-h-[214px] space-y-2.5 overflow-y-auto pr-0.5">
                    {MATH_KEYPAD_SECTIONS.map((section) => (
                      <section key={section.id} aria-label={`${section.label} maths controls`}>
                        <div className="mb-1.5 flex items-center gap-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                            {section.label}
                          </p>
                          <span className="h-px flex-1 bg-zinc-100" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {section.shortcuts.map((shortcut) => (
                            <MathShortcutButton
                              key={shortcut.id}
                              shortcut={shortcut}
                              onClick={() => insertShortcut(shortcut)}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeMathTemplate ? (
                <MathTemplateComposer
                  template={activeMathTemplate}
                  onChange={setActiveMathTemplate}
                  onCancel={() => setActiveMathTemplate(null)}
                  onInsert={commitMathTemplate}
                />
              ) : null}

              <div className="flex items-end gap-1.5">
                <div
                  className="scroll-slim max-h-28 min-h-[52px] flex-1 overflow-y-auto rounded-[9px] px-0.5 py-1"
                  onClick={() => composerRef.current?.focus()}
                >
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-sm leading-7 text-zinc-800">
                    {composerTokens.map((token) =>
                      token.type === "math" ? (
                        <ComposerMathChip
                          key={token.id}
                          item={token}
                          onRemove={() =>
                            setComposerTokens((current) =>
                              current.filter((candidate) => candidate.id !== token.id),
                            )
                          }
                        />
                      ) : (
                        <input
                          key={token.id}
                          value={token.text}
                          onFocus={() => setActiveTextTokenId(token.id)}
                          onChange={(event) => {
                            const nextText = event.target.value;
                            setComposerTokens((current) =>
                              current.map((candidate) =>
                                candidate.id === token.id
                                  ? { ...candidate, text: nextText }
                                  : candidate,
                              ),
                            );
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void sendMessage();
                            }
                          }}
                          aria-label="Edit prompt text"
                          className="min-h-8 min-w-[48px] max-w-full bg-transparent text-sm leading-7 text-zinc-800 outline-none"
                          style={{ width: `${Math.max(token.text.length + 1, 4)}ch` }}
                        />
                      ),
                    )}
                    <input
                      ref={composerRef}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onFocus={() => setActiveTextTokenId(null)}
                      onKeyDown={handleKeyDown}
                      placeholder={composerTokens.length ? "" : "Ask Arthur anything."}
                      aria-label="Ask Arthur anything"
                      className="min-h-8 min-w-[150px] flex-1 bg-transparent text-sm leading-7 text-zinc-800 placeholder:text-zinc-500 outline-none"
                    />
                  </div>
                </div>
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
                  disabled={(!draft.trim() && composerTokens.length === 0) || isSending}
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

function ComposerMathChip({
  item,
  onRemove,
}: {
  item: ComposerMathItem;
  onRemove: () => void;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(item.latex, {
        displayMode: false,
        throwOnError: false,
        strict: "ignore",
      });
    } catch {
      return null;
    }
  }, [item.latex]);

  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-[9px] border border-zinc-200 bg-[var(--surface-sidebar)] px-2.5 py-1 text-sm text-zinc-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {html ? (
        <span
          className="math-shortcut-label inline-flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <span className="math-shortcut-label inline-flex items-center justify-center">
          {item.text}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700"
        aria-label={`Remove ${item.text}`}
      >
        ×
      </button>
    </span>
  );
}

function createTextToken(text: string): ComposerToken {
  return {
    id: `${Date.now()}-text-${Math.random().toString(36).slice(2)}`,
    type: "text",
    text,
  };
}

function serializeComposerTokens(tokens: ComposerToken[], mode: "text" | "display") {
  return tokens
    .map((token) => {
      if (token.type === "math") {
        return mode === "display" ? `$${token.latex}$` : token.text;
      }

      return token.text;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function ComposerMathPreview({
  latex,
  fallback,
}: {
  latex: string;
  fallback: string;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        strict: "ignore",
      });
    } catch {
      return null;
    }
  }, [latex]);

  return (
    <div className="scroll-slim flex min-h-12 items-center overflow-x-auto rounded-[10px] border border-zinc-200/70 bg-white/80 px-3 py-2 text-zinc-800">
      {html ? (
        <div
          className="math-builder-preview min-w-max"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="min-w-max font-serif text-sm text-zinc-600">{fallback}</p>
      )}
    </div>
  );
}

function MathTemplateComposer({
  template,
  onChange,
  onCancel,
  onInsert,
}: {
  template: ActiveMathTemplate;
  onChange: (template: ActiveMathTemplate) => void;
  onCancel: () => void;
  onInsert: () => void;
}) {
  const preview = useMemo(() => serializeMathTemplate(template), [template]);
  const [focusedSlot, setFocusedSlot] = useState<string | null>(null);
  const updateValue = (key: string, value: string) => {
    onChange({
      ...template,
      values: {
        ...template.values,
        [key]: value,
      },
    });
  };
  const activeSlot = focusedSlot ?? getDefaultTemplateSlot(template.kind);
  const appendToSlot = (value: string) => {
    const currentValue = template.values[activeSlot] ?? "";
    updateValue(activeSlot, currentValue ? `${currentValue}${value}` : value);
  };

  return (
    <div className="rounded-[12px] border border-zinc-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-3 py-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
            Math builder
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Fill the slots, then insert the rendered expression.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[8px] border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onInsert}
            className="rounded-[8px] bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-[0_6px_14px_rgba(9,9,11,0.12)] transition hover:bg-zinc-800"
          >
            Insert
          </button>
        </div>
      </div>

      <div className="border-b border-zinc-100 bg-[var(--surface-sidebar)] px-3 py-2.5">
        <ComposerMathPreview latex={preview.latex} fallback={preview.text} />
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-zinc-100 px-3 py-2">
        {MATH_SLOT_TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            onClick={() => appendToSlot(tool.insert)}
            className="inline-flex h-7 min-w-8 items-center justify-center rounded-[8px] border border-zinc-200 bg-[var(--surface-sidebar)] px-2 text-[11px] text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-800"
            aria-label={`Insert ${tool.label} into active slot`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="px-3 py-3">
        {template.kind === "definiteIntegral" ? (
          <div className="flex min-h-[122px] w-full items-center rounded-[12px] border border-zinc-200/80 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="relative h-[96px] w-[72px] shrink-0">
              <MathSlot
                ariaLabel="Upper limit"
                placeholder="b"
                value={template.values.upper}
                onChange={(value) => updateValue("upper", value)}
                onFocus={() => setFocusedSlot("upper")}
                className="absolute left-0 top-0 h-7 w-14 text-center text-[12px]"
              />
              <span className="absolute left-4 top-4 font-serif text-[72px] leading-[0.85] text-zinc-800">
                ∫
              </span>
              <MathSlot
                ariaLabel="Lower limit"
                placeholder="a"
                value={template.values.lower}
                onChange={(value) => updateValue("lower", value)}
                onFocus={() => setFocusedSlot("lower")}
                className="absolute bottom-0 left-0 h-7 w-14 text-center text-[12px]"
              />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">
              <MathSlot
                ariaLabel="Integrand"
                placeholder="f(x)"
                value={template.values.expression}
                onChange={(value) => updateValue("expression", value)}
                onFocus={() => setFocusedSlot("expression")}
                className="h-12 min-w-0 flex-1 text-base"
              />
              <span className="shrink-0 text-sm italic text-zinc-500">d</span>
              <MathSlot
                ariaLabel="Variable"
                placeholder="x"
                value={template.values.variable}
                onChange={(value) => updateValue("variable", value)}
                onFocus={() => setFocusedSlot("variable")}
                className="h-10 w-14 shrink-0 text-center"
              />
            </div>
          </div>
        ) : null}

        {template.kind === "integral" ? (
          <div className="flex min-h-[92px] w-full items-center gap-3 rounded-[12px] border border-zinc-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <span className="shrink-0 font-serif text-[72px] leading-[0.85] text-zinc-800">∫</span>
            <MathSlot
              ariaLabel="Integrand"
              placeholder="f(x)"
              value={template.values.expression}
              onChange={(value) => updateValue("expression", value)}
              onFocus={() => setFocusedSlot("expression")}
              className="h-12 min-w-0 flex-1 text-base"
            />
            <span className="shrink-0 text-sm italic text-zinc-500">d</span>
            <MathSlot
              ariaLabel="Variable"
              placeholder="x"
              value={template.values.variable}
              onChange={(value) => updateValue("variable", value)}
              onFocus={() => setFocusedSlot("variable")}
              className="h-10 w-14 shrink-0 text-center"
            />
          </div>
        ) : null}

        {template.kind === "fraction" ? (
          <div className="inline-grid min-w-[180px] grid-rows-[42px_1px_42px] items-center py-1">
            <MathSlot
              ariaLabel="Numerator"
              placeholder="a"
              value={template.values.numerator}
              onChange={(value) => updateValue("numerator", value)}
              onFocus={() => setFocusedSlot("numerator")}
              className="mx-auto h-10 w-full text-center"
            />
            <span className="h-px w-full bg-zinc-700" />
            <MathSlot
              ariaLabel="Denominator"
              placeholder="b"
              value={template.values.denominator}
              onChange={(value) => updateValue("denominator", value)}
              onFocus={() => setFocusedSlot("denominator")}
              className="mx-auto h-10 w-full text-center"
            />
          </div>
        ) : null}

        {template.kind === "power" ? (
          <div className="flex min-w-[190px] items-start gap-1.5 py-1">
            <MathSlot
              ariaLabel="Base"
              placeholder="x"
              value={template.values.base}
              onChange={(value) => updateValue("base", value)}
              onFocus={() => setFocusedSlot("base")}
              className="h-10 min-w-[112px]"
            />
            <MathSlot
              ariaLabel="Power"
              placeholder="n"
              value={template.values.exponent}
              onChange={(value) => updateValue("exponent", value)}
              onFocus={() => setFocusedSlot("exponent")}
              className="h-7 w-16 text-center text-[12px]"
            />
          </div>
        ) : null}

        {template.kind === "root" ? (
          <div className="flex min-w-[190px] items-center gap-1.5 py-1">
            <span className="font-serif text-4xl leading-none text-zinc-700">√</span>
            <div className="border-t border-zinc-700 pt-1">
              <MathSlot
                ariaLabel="Radicand"
                placeholder="x"
                value={template.values.radicand}
                onChange={(value) => updateValue("radicand", value)}
                onFocus={() => setFocusedSlot("radicand")}
                className="h-10 min-w-[156px]"
              />
            </div>
          </div>
        ) : null}

        {template.kind === "limit" ? (
          <div className="flex min-w-[260px] items-center gap-3 py-1">
            <div className="grid justify-items-center">
              <span className="font-serif text-2xl text-zinc-700">lim</span>
              <div className="flex items-center gap-1">
                <MathSlot
                  ariaLabel="Limit variable"
                  placeholder="x"
                  value={template.values.variable}
                  onChange={(value) => updateValue("variable", value)}
                  onFocus={() => setFocusedSlot("variable")}
                  className="h-7 w-12 text-center text-[12px]"
                />
                <span className="text-xs text-zinc-500">→</span>
                <MathSlot
                  ariaLabel="Limit target"
                  placeholder="a"
                  value={template.values.target}
                  onChange={(value) => updateValue("target", value)}
                  onFocus={() => setFocusedSlot("target")}
                  className="h-7 w-12 text-center text-[12px]"
                />
              </div>
            </div>
            <MathSlot
              ariaLabel="Limit expression"
              placeholder="f(x)"
              value={template.values.expression}
              onChange={(value) => updateValue("expression", value)}
              onFocus={() => setFocusedSlot("expression")}
              className="h-10 min-w-[144px] flex-1"
            />
          </div>
        ) : null}

        {template.kind === "function" ? (
          <div className="flex min-w-[220px] items-center gap-1.5 py-1">
            <span className="font-serif text-2xl text-zinc-700">
              {template.values.name}
            </span>
            <span className="font-serif text-2xl text-zinc-500">(</span>
            <MathSlot
              ariaLabel={`${template.values.name} input`}
              placeholder="x"
              value={template.values.argument}
              onChange={(value) => updateValue("argument", value)}
              onFocus={() => setFocusedSlot("argument")}
              className="h-10 min-w-[148px] flex-1"
            />
            <span className="font-serif text-2xl text-zinc-500">)</span>
          </div>
        ) : null}

        {template.kind === "derivative" ? (
          <div className="flex min-w-[250px] items-center gap-3 py-1">
            <div className="inline-grid min-w-[68px] grid-rows-[32px_1px_32px] items-center">
              <MathSlot
                ariaLabel="Derivative numerator"
                placeholder="d"
                value={template.values.numerator}
                onChange={(value) => updateValue("numerator", value)}
                onFocus={() => setFocusedSlot("numerator")}
                className="mx-auto h-8 w-16 text-center text-[12px]"
              />
              <span className="h-px w-full bg-zinc-700" />
              <MathSlot
                ariaLabel="Derivative denominator"
                placeholder="dx"
                value={template.values.denominator}
                onChange={(value) => updateValue("denominator", value)}
                onFocus={() => setFocusedSlot("denominator")}
                className="mx-auto h-8 w-16 text-center text-[12px]"
              />
            </div>
            <MathSlot
              ariaLabel="Derivative expression"
              placeholder="f(x)"
              value={template.values.expression}
              onChange={(value) => updateValue("expression", value)}
              onFocus={() => setFocusedSlot("expression")}
              className="h-10 min-w-[144px] flex-1"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MathSlot({
  value,
  placeholder,
  ariaLabel,
  className,
  onChange,
  onFocus,
}: {
  value: string;
  placeholder: string;
  ariaLabel: string;
  className?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onFocus={onFocus}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      }}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={[
        "rounded-[8px] border border-zinc-200/80 bg-[var(--surface-sidebar)] px-2 font-serif text-sm text-zinc-800 outline-none transition placeholder:text-zinc-300 hover:border-zinc-300 hover:bg-white focus:border-zinc-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,24,27,0.06)]",
        className ?? "",
      ].join(" ")}
    />
  );
}

function createMathTemplate(
  kind: MathTemplateKind,
  initialValues: Record<string, string> = {},
): ActiveMathTemplate {
  if (kind === "definiteIntegral") {
    return { kind, values: { lower: "", upper: "", expression: "", variable: "x", ...initialValues } };
  }

  if (kind === "integral") {
    return { kind, values: { expression: "", variable: "x", ...initialValues } };
  }

  if (kind === "fraction") {
    return { kind, values: { numerator: "", denominator: "", ...initialValues } };
  }

  if (kind === "power") {
    return { kind, values: { base: "", exponent: "", ...initialValues } };
  }

  if (kind === "root") {
    return { kind, values: { radicand: "", ...initialValues } };
  }

  if (kind === "function") {
    return { kind, values: { name: "f", latexName: "", argument: "", ...initialValues } };
  }

  if (kind === "derivative") {
    return {
      kind,
      values: { numerator: "d", denominator: "dx", expression: "", ...initialValues },
    };
  }

  return { kind, values: { variable: "x", target: "", expression: "", ...initialValues } };
}

function getDefaultTemplateSlot(kind: MathTemplateKind) {
  if (kind === "fraction") return "numerator";
  if (kind === "power") return "base";
  if (kind === "root") return "radicand";
  if (kind === "limit") return "expression";
  if (kind === "function") return "argument";
  if (kind === "derivative") return "expression";
  return "expression";
}

function serializeMathTemplate(template: ActiveMathTemplate) {
  const value = (key: string, fallback: string) => template.values[key]?.trim() || fallback;

  if (template.kind === "definiteIntegral") {
    const lower = value("lower", "a");
    const upper = value("upper", "b");
    const expression = value("expression", "f(x)");
    const variable = value("variable", "x");
    return {
      text: `∫_${lower}^${upper} ${expression} d${variable}`,
      latex: `\\int_{${formatSlotLatex(lower)}}^{${formatSlotLatex(upper)}} ${formatSlotLatex(expression)} \\, d${formatSlotLatex(variable)}`,
    };
  }

  if (template.kind === "integral") {
    const expression = value("expression", "f(x)");
    const variable = value("variable", "x");
    return {
      text: `∫ ${expression} d${variable}`,
      latex: `\\int ${formatSlotLatex(expression)} \\, d${formatSlotLatex(variable)}`,
    };
  }

  if (template.kind === "fraction") {
    const numerator = value("numerator", "a");
    const denominator = value("denominator", "b");
    return {
      text: `(${numerator})/(${denominator})`,
      latex: `\\frac{${formatSlotLatex(numerator)}}{${formatSlotLatex(denominator)}}`,
    };
  }

  if (template.kind === "power") {
    const base = value("base", "x");
    const exponent = value("exponent", "n");
    return {
      text: `${groupBaseIfNeeded(base)}^(${exponent})`,
      latex: `{${formatSlotLatex(base)}}^{${formatSlotLatex(exponent)}}`,
    };
  }

  if (template.kind === "root") {
    const radicand = value("radicand", "x");
    return {
      text: `√(${radicand})`,
      latex: `\\sqrt{${formatSlotLatex(radicand)}}`,
    };
  }

  if (template.kind === "function") {
    const name = value("name", "f");
    const latexName = value("latexName", `\\${name}`);
    const argument = value("argument", "x");
    return {
      text: `${name}(${argument})`,
      latex: `${latexName}(${formatSlotLatex(argument)})`,
    };
  }

  if (template.kind === "derivative") {
    const numerator = value("numerator", "d");
    const denominator = value("denominator", "dx");
    const expression = value("expression", "f(x)");
    return {
      text: `${numerator}/${denominator} ${expression}`,
      latex: `\\frac{${formatSlotLatex(numerator)}}{${formatSlotLatex(denominator)}} ${formatSlotLatex(expression)}`,
    };
  }

  const variable = value("variable", "x");
  const target = value("target", "a");
  const expression = value("expression", "f(x)");
  return {
    text: `lim(${variable}→${target}) ${expression}`,
    latex: `\\lim_{${formatSlotLatex(variable)}\\to ${formatSlotLatex(target)}} ${formatSlotLatex(expression)}`,
  };
}

function formatSlotLatex(value: string) {
  return value
    .trim()
    .replace(/π/g, "\\pi")
    .replace(/\binfinity\b/gi, "\\infty")
    .replace(/sqrt\(([^()]*)\)/gi, "\\sqrt{$1}")
    .replace(/\b(sin|cos|tan|sec|cosec|cot|ln|log)\(([^()]*)\)/gi, (_, name: string, argument: string) => {
      const latexName = name.toLowerCase() === "cosec" ? "\\cosec" : `\\${name.toLowerCase()}`;
      return `${latexName}(${argument})`;
    })
    .replace(/([a-zA-Z0-9π)]+)\^\(([^()]*)\)/g, "{$1}^{$2}")
    .replace(/([a-zA-Z0-9π)]+)\^([a-zA-Z0-9π]+)/g, "{$1}^{$2}");
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
          ? "my-3 block max-w-full overflow-x-auto overflow-y-hidden py-1"
          : "mx-0.5 inline-flex max-w-full overflow-x-auto overflow-y-hidden align-middle py-1"
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
