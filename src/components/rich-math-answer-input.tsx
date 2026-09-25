"use client";

import katex from "katex";
import {
  encodeAssessmentAnswer,
  parseAssessmentAnswer,
  type AssessmentAnswerSegment,
} from "@/lib/assessment-answer";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";

export type RichMathAnswerHandle = {
  insertMath: (latex: string) => void;
};

function createMathChip(latex: string) {
  const chip = document.createElement("span");
  chip.setAttribute("contenteditable", "false");
  chip.dataset.assessmentMath = "true";
  chip.dataset.latex = latex;
  chip.className = "math-chip";
  chip.innerHTML = katex.renderToString(latex, {
    throwOnError: false,
    strict: "ignore",
  });
  return chip;
}

function appendTextWithBreaks(root: HTMLElement, text: string) {
  const parts = text.split("\n");
  parts.forEach((part, index) => {
    if (part) root.append(document.createTextNode(part));
    if (index < parts.length - 1) root.append(document.createElement("br"));
  });
}

function hydrateAnswer(root: HTMLElement, value: string) {
  root.replaceChildren();
  for (const segment of parseAssessmentAnswer(value)) {
    if (segment.type === "text") appendTextWithBreaks(root, segment.value);
    else root.append(createMathChip(segment.latex), document.createTextNode("\u00a0"));
  }
}

function serializeAnswer(root: HTMLElement) {
  const segments: AssessmentAnswerSegment[] = [];
  const pushText = (value: string) => {
    if (!value) return;
    const previous = segments.at(-1);
    if (previous?.type === "text") previous.value += value;
    else segments.push({ type: "text", value });
  };
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(node.textContent ?? "");
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.dataset.assessmentMath === "true") {
      const latex = node.dataset.latex?.trim();
      if (latex) segments.push({ type: "math", latex });
      return;
    }
    if (node.tagName === "BR") {
      pushText("\n");
      return;
    }
    const isLine = node.tagName === "DIV" || node.tagName === "P";
    node.childNodes.forEach(walk);
    if (isLine) pushText("\n");
  };
  root.childNodes.forEach(walk);
  return encodeAssessmentAnswer(segments);
}

export const RichMathAnswerInput = forwardRef<
  RichMathAnswerHandle,
  { value: string; onChange: (value: string) => void; onFocus?: () => void; id: string; readOnly?: boolean; ariaLabel?: string }
>(function RichMathAnswerInput({ value, onChange, onFocus, id, readOnly = false, ariaLabel }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastEmittedRef = useRef<string | null>(null);

  const emitChange = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const serialized = serializeAnswer(root);
    lastEmittedRef.current = serialized;
    onChange(serialized);
  }, [onChange]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || value === lastEmittedRef.current) return;
    hydrateAnswer(root, value);
    lastEmittedRef.current = value;
  }, [value]);

  const rememberSelection = () => {
    const root = rootRef.current;
    const selection = window.getSelection();
    if (!root || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (root.contains(range.commonAncestorContainer)) savedRangeRef.current = range.cloneRange();
  };

  useImperativeHandle(ref, () => ({
    insertMath(latex: string) {
      const root = rootRef.current;
      if (!root || readOnly || !latex.trim()) return;
      const chip = createMathChip(latex.trim());
      const range = savedRangeRef.current?.cloneRange() ?? document.createRange();
      if (!savedRangeRef.current || !root.contains(range.commonAncestorContainer)) {
        range.selectNodeContents(root);
        range.collapse(false);
      } else {
        range.deleteContents();
      }
      range.insertNode(chip);
      const spacer = document.createTextNode("\u00a0");
      chip.after(spacer);
      const caret = document.createRange();
      caret.setStart(spacer, 1);
      caret.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(caret);
      savedRangeRef.current = caret.cloneRange();
      root.focus();
      emitChange();
    },
  }), [emitChange, readOnly]);

  return (
    <div data-maths-answer className={["relative mt-2 rounded-xl border border-zinc-200 bg-zinc-50/50 transition", readOnly ? "" : "focus-within:border-zinc-400 focus-within:bg-white"].join(" ")}>
      <div
        ref={rootRef}
        id={id}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel ?? (readOnly ? "Confirmed answer" : "Answer")}
        aria-readonly={readOnly}
        onInput={emitChange}
        onFocus={onFocus}
        onBlur={rememberSelection}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        className={["math-composer min-h-[88px] w-full px-4 py-3 text-[15px] leading-7 text-zinc-800 outline-none sm:text-base", readOnly ? "cursor-default" : ""].join(" ")}
      />
    </div>
  );
});
