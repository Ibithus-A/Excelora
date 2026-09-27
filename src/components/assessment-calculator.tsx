"use client";
import katex from "katex";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatPlainMath } from "@/lib/math-format";
import { SHARED_MATH_INPUT_GROUPS } from "@/lib/math-input-catalog";
import { buildMathInputInsertion } from "@/lib/math-input-builder";
type MathInputKey = {
  id: string;
  latex: string;
  ariaLabel: string;
  wide?: boolean;
  build: (selection: string) => { text: string; caret: number };
};

const wrapMathInput =
  (prefix: string, suffix: string) => (selection: string) => ({
    text: `${prefix}${selection}${suffix}`,
    caret: prefix.length + selection.length + (selection ? suffix.length : 0),
  });

const insertMathSymbol = (text: string) => () => ({ text, caret: text.length });

const VARIABLE_KEYS: MathInputKey[] = Array.from(
  "abcdefghijklmnopqrstuvwxyz",
  (letter) => ({
    id: `variable-${letter}`,
    latex: letter,
    ariaLabel: `Insert variable ${letter}`,
    build: insertMathSymbol(letter),
  }),
);

const LEGACY_MATH_INPUT_GROUPS: Array<{
  id: string;
  label: string;
  keys: MathInputKey[];
}> = [
  {
    id: "structure",
    label: "Structure",
    keys: [
      {
        id: "fraction",
        latex: String.raw`\frac{a}{b}`,
        ariaLabel: "Insert fraction",
        build: (selection) =>
          selection
            ? { text: `${selection}/()`, caret: selection.length + 2 }
            : { text: "()/()", caret: 1 },
      },
      {
        id: "sqrt",
        latex: String.raw`\sqrt{x}`,
        ariaLabel: "Insert square root",
        build: wrapMathInput("√(", ")"),
      },
      {
        id: "power",
        latex: String.raw`x^n`,
        ariaLabel: "Insert power",
        build: (selection) =>
          selection
            ? { text: `${selection}^()`, caret: selection.length + 2 }
            : { text: "^()", caret: 2 },
      },
      {
        id: "squared",
        latex: String.raw`x^2`,
        ariaLabel: "Insert squared",
        build: (selection) => ({
          text: `${selection}^2`,
          caret: selection.length + 2,
        }),
      },
      {
        id: "subscript",
        latex: String.raw`x_n`,
        ariaLabel: "Insert subscript",
        build: (selection) =>
          selection
            ? { text: `${selection}_()`, caret: selection.length + 2 }
            : { text: "_()", caret: 2 },
      },
      {
        id: "brackets",
        latex: String.raw`\left(\square\right)`,
        ariaLabel: "Insert brackets",
        build: wrapMathInput("(", ")"),
      },
      {
        id: "abs",
        latex: String.raw`|x|`,
        ariaLabel: "Insert absolute value",
        build: wrapMathInput("|", "|"),
      },
    ],
  },
  {
    id: "variables",
    label: "Variables",
    keys: VARIABLE_KEYS,
  },
  {
    id: "functions",
    label: "Functions",
    keys: [
      {
        id: "sin",
        latex: String.raw`\sin x`,
        ariaLabel: "Insert sine",
        build: wrapMathInput("sin(", ")"),
      },
      {
        id: "cos",
        latex: String.raw`\cos x`,
        ariaLabel: "Insert cosine",
        build: wrapMathInput("cos(", ")"),
      },
      {
        id: "tan",
        latex: String.raw`\tan x`,
        ariaLabel: "Insert tangent",
        build: wrapMathInput("tan(", ")"),
      },
      {
        id: "asin",
        latex: String.raw`\sin^{-1}x`,
        ariaLabel: "Insert inverse sine",
        build: wrapMathInput("asin(", ")"),
      },
      {
        id: "acos",
        latex: String.raw`\cos^{-1}x`,
        ariaLabel: "Insert inverse cosine",
        build: wrapMathInput("acos(", ")"),
      },
      {
        id: "atan",
        latex: String.raw`\tan^{-1}x`,
        ariaLabel: "Insert inverse tangent",
        build: wrapMathInput("atan(", ")"),
      },
      {
        id: "log",
        latex: String.raw`\log x`,
        ariaLabel: "Insert logarithm",
        build: wrapMathInput("log(", ")"),
      },
      {
        id: "ln",
        latex: String.raw`\ln x`,
        ariaLabel: "Insert natural logarithm",
        build: wrapMathInput("ln(", ")"),
      },
      {
        id: "exp",
        latex: String.raw`e^x`,
        ariaLabel: "Insert exponential",
        build: (selection) => ({
          text: `e^(${selection})`,
          caret: selection ? selection.length + 4 : 3,
        }),
      },
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    keys: [
      {
        id: "pi",
        latex: String.raw`\pi`,
        ariaLabel: "Insert pi",
        build: insertMathSymbol("π"),
      },
      {
        id: "theta",
        latex: String.raw`\theta`,
        ariaLabel: "Insert theta",
        build: insertMathSymbol("θ"),
      },
      {
        id: "alpha",
        latex: String.raw`\alpha`,
        ariaLabel: "Insert alpha",
        build: insertMathSymbol("α"),
      },
      {
        id: "beta",
        latex: String.raw`\beta`,
        ariaLabel: "Insert beta",
        build: insertMathSymbol("β"),
      },
      {
        id: "infty",
        latex: String.raw`\infty`,
        ariaLabel: "Insert infinity",
        build: insertMathSymbol("∞"),
      },
      {
        id: "pm",
        latex: String.raw`\pm`,
        ariaLabel: "Insert plus or minus",
        build: insertMathSymbol(" ± "),
      },
      {
        id: "times",
        latex: String.raw`\times`,
        ariaLabel: "Insert times",
        build: insertMathSymbol(" × "),
      },
      {
        id: "cdot",
        latex: String.raw`\cdot`,
        ariaLabel: "Insert dot product",
        build: insertMathSymbol(" · "),
      },
      {
        id: "leq",
        latex: String.raw`\leq`,
        ariaLabel: "Insert less than or equal",
        build: insertMathSymbol(" ≤ "),
      },
      {
        id: "geq",
        latex: String.raw`\geq`,
        ariaLabel: "Insert greater than or equal",
        build: insertMathSymbol(" ≥ "),
      },
      {
        id: "neq",
        latex: String.raw`\neq`,
        ariaLabel: "Insert not equal",
        build: insertMathSymbol(" ≠ "),
      },
      {
        id: "approx",
        latex: String.raw`\approx`,
        ariaLabel: "Insert approximately",
        build: insertMathSymbol(" ≈ "),
      },
      {
        id: "to",
        latex: String.raw`\to`,
        ariaLabel: "Insert right arrow",
        build: insertMathSymbol(" → "),
      },
    ],
  },
];

const LEGACY_ASSESSMENT_KEYS = new Map(
  LEGACY_MATH_INPUT_GROUPS.flatMap((group) => group.keys).map((key) => [
    key.id,
    key,
  ]),
);

const ASSESSMENT_CALCULUS_KEYS = new Set([
  "integral",
  "definite-integral",
  "derivative",
  "dy-dx",
  "limit",
  "sum",
]);

const MATH_INPUT_GROUPS: Array<{
  id: string;
  label: string;
  keys: MathInputKey[];
}> = SHARED_MATH_INPUT_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  keys: group.items.map((item) => {
    const existing = LEGACY_ASSESSMENT_KEYS.get(item.id);
    if (!existing && !ASSESSMENT_CALCULUS_KEYS.has(item.id)) {
      throw new Error(
        `Missing assessment maths input implementation for ${item.id}`,
      );
    }
    return {
      id: item.id,
      latex: item.labelLatex,
      ariaLabel: item.ariaLabel,
      wide: item.wide,
      build: (selection: string) => buildMathInputInsertion(item.id, selection),
    };
  }),
}));

function CalculatorKeyLabel({ latex }: { latex: string }) {
  const html = useMemo(
    () =>
      katex.renderToString(latex, { throwOnError: false, strict: "ignore" }),
    [latex],
  );
  return (
    <span
      className="math-keypad-label inline-flex max-w-full items-center justify-center overflow-hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function MathsInputPalette({
  onInsertLatex,
}: {
  onInsertLatex: (latex: string) => void;
}) {
  const [activeGroupId, setActiveGroupId] = useState(MATH_INPUT_GROUPS[0].id);
  const [expression, setExpression] = useState("");
  const expressionRef = useRef<HTMLInputElement>(null);
  const activeGroup =
    MATH_INPUT_GROUPS.find((group) => group.id === activeGroupId) ??
    MATH_INPUT_GROUPS[0];
  const previewLatex = useMemo(
    () => (expression.trim() ? formatPlainMath(expression) : ""),
    [expression],
  );
  const previewHtml = useMemo(
    () =>
      previewLatex
        ? katex.renderToString(previewLatex, {
            displayMode: true,
            throwOnError: false,
            strict: "ignore",
          })
        : "",
    [previewLatex],
  );
  const insertKey = (key: MathInputKey) => {
    const input = expressionRef.current;
    const start = input?.selectionStart ?? expression.length;
    const end = input?.selectionEnd ?? start;
    const insertion = key.build(expression.slice(start, end));
    const nextExpression = `${expression.slice(0, start)}${insertion.text}${expression.slice(end)}`;
    const nextCaret = start + insertion.caret;
    setExpression(nextExpression);
    window.requestAnimationFrame(() => {
      expressionRef.current?.focus();
      expressionRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  return (
    <div
      className="overflow-hidden rounded-[12px] border border-zinc-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
      aria-label="Maths expression input"
    >
      <div className="space-y-2.5 border-b border-zinc-200/80 p-3">
        <label
          htmlFor="assessment-maths-expression"
          className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400"
        >
          Expression
        </label>
        <input
          ref={expressionRef}
          id="assessment-maths-expression"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          className="h-10 w-full rounded-[10px] border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition focus:border-zinc-400"
        />
        <div className="math-builder-preview min-h-20 overflow-x-auto rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 py-2">
          <p className="mb-1 text-[11px] font-medium text-zinc-400">Preview</p>
          <div
            className="flex min-h-10 items-center justify-center text-zinc-800"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
      <div
        role="tablist"
        aria-label="Maths input categories"
        className="grid grid-cols-3 gap-1 border-b border-zinc-200/80 bg-zinc-50/70 px-1.5 py-1.5"
      >
        {MATH_INPUT_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={activeGroupId === group.id}
            onClick={() => setActiveGroupId(group.id)}
            className={[
              "inline-flex flex-1 items-center justify-center rounded-[8px] px-2 py-1.5 text-[11px] font-medium transition",
              activeGroupId === group.id
                ? "bg-white text-zinc-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                : "text-zinc-500 hover:text-zinc-800",
            ].join(" ")}
          >
            {group.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5 p-2">
        {activeGroup.keys.map((key) => (
          <button
            key={key.id}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => insertKey(key)}
            aria-label={key.ariaLabel}
            title={key.ariaLabel}
            className={[
              "inline-flex h-11 min-w-0 items-center justify-center overflow-hidden rounded-[10px] border border-zinc-200/80 bg-white px-1 text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100",
              key.wide ? "col-span-2" : "",
            ].join(" ")}
          >
            <CalculatorKeyLabel latex={key.latex} />
          </button>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 border-t border-zinc-200/80 p-3">
        <button
          type="button"
          onClick={() => setExpression("")}
          disabled={!expression}
          className="inline-flex h-9 items-center justify-center rounded-[9px] border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            if (!expression.trim()) return;
            onInsertLatex(previewLatex);
            setExpression("");
          }}
          disabled={!expression.trim()}
          className="inline-flex h-9 items-center justify-center rounded-[9px] bg-zinc-900 px-3 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Insert expression
        </button>
      </div>
    </div>
  );
}

export function CalculatorDrawer({
  isOpen,
  questionNumber,
  onClose,
  onHoverChange,
  onInsertLatex,
}: {
  isOpen: boolean;
  questionNumber?: number;
  onClose: () => void;
  onHoverChange: (isHovered: boolean) => void;
  onInsertLatex: (latex: string) => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [isOpen, onClose]);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const openFromHover = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    onHoverChange(true);
  };

  const closeFromHover = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onHoverChange(false);
      closeTimerRef.current = null;
    }, 90);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-y-0 right-0 z-[70] w-full max-w-[390px]"
      onMouseEnter={openFromHover}
      onMouseLeave={closeFromHover}
    >
      <button
        type="button"
        data-maths-input-trigger
        aria-label="Open maths input"
        tabIndex={isOpen ? -1 : 0}
        onClick={() => onHoverChange(true)}
        onFocus={() => onHoverChange(true)}
        className={[
          "pointer-events-auto absolute right-0 top-1/2 hidden h-32 w-9 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-zinc-200 bg-white/95 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 shadow-[-8px_0_24px_rgba(15,23,42,0.08)] backdrop-blur transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex",
          isOpen
            ? "pointer-events-none translate-x-full opacity-0"
            : "translate-x-0 opacity-100 hover:w-10 hover:text-zinc-900",
        ].join(" ")}
      >
        <span className="[writing-mode:vertical-rl]">Maths</span>
      </button>
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        className={[
          "fixed inset-0 bg-black/20 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-label="Close maths input"
        aria-hidden={!isOpen}
      />
      <aside
        data-maths-input-drawer
        role="dialog"
        aria-label="Maths input"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={[
          "absolute inset-y-0 right-0 flex h-dvh w-full max-w-[390px] flex-col border-l border-zinc-200 bg-[var(--surface-sidebar)] shadow-[-24px_0_60px_rgba(9,9,11,0.12)]",
          "transition-[transform,opacity,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          isOpen
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0",
        ].join(" ")}
      >
        <div className="border-b border-zinc-200 px-4 py-4">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                Calculator · Maths input
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border px-3 py-1 text-xs"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {questionNumber ? `Question ${questionNumber}` : "Answer input"}
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <MathsInputPalette
            key={questionNumber}
            onInsertLatex={onInsertLatex}
          />
        </div>
      </aside>
    </div>,
    document.body,
  );
}
