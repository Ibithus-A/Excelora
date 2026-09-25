"use client";
import katex from "katex";
import { StructuredGraphSketch } from "./structured-graph-sketch";
import { useId, useRef, useState } from "react";
import {
  RichMathAnswerInput,
  type RichMathAnswerHandle,
} from "./rich-math-answer-input";
import {
  answerParts,
  decodeParts,
  encodeParts,
} from "@/lib/question-bank/responses";
import { CalculatorDrawer } from "./assessment-calculator";

import { bankMathSegments } from "@/lib/question-bank/math-segments";

export function BankMath({ value }: { value: string }) {
  const pieces = bankMathSegments(value);
  return (
    <>
      {pieces.map((piece, i) => {
        if (!piece.math) return <span key={i}>{piece.value}</span>;
        const display = piece.display;
        const latex = piece.value;
        try {
          return (
            <span
              key={i}
              className={`${display ? "lesson-math-display block py-2" : "lesson-math-inline"} max-w-full`}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(latex, {
                  displayMode: display,
                  throwOnError: true,
                  strict: "ignore",
                  trust: false,
                }),
              }}
            />
          );
        } catch {
          return (
            <span key={i} role="status">
              [Mathematical notation needs review]
            </span>
          );
        }
      })}
    </>
  );
}
export function BankQuestion({
  question,
  value,
  onChange,
  readOnly = false,
  questionNumber,
}: {
  question: { id: string; prompt: string; subtopic: string; marks: number };
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  questionNumber?: number;
}) {
  const inputId = useId();
  const hasSketch = /\bsketch\b/i.test(question.prompt);
  const parts = answerParts(question.prompt);
  const values = decodeParts(value);
  const handles = useRef<Record<string, RichMathAnswerHandle | null>>({});
  const [focused, setFocused] = useState(parts[0].key);
  const [open, setOpen] = useState(false);
  return (
    <section className="min-w-0 py-7 text-base leading-8 text-zinc-800">
      <div className="flex justify-between gap-4">
        <p className="text-sm text-zinc-500">{question.subtopic}</p>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm">{question.marks} marks</span>
          {!readOnly && (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium"
            >
              Calculator
            </button>
          )}
        </div>
      </div>
      <div className="mt-5 min-w-0 whitespace-pre-wrap break-words">
        <BankMath value={question.prompt} />
      </div>
      {parts.length > 1 && values.value && (
        <div className="mt-6">
          <p className="text-sm">
            Your earlier combined answer is preserved here. Use the labelled
            fields below for any additional working.
          </p>
          <RichMathAnswerInput
            id={`${inputId}-previous`}
            ariaLabel="Earlier combined answer"
            value={values.value}
            readOnly
            onChange={() => {}}
          />
        </div>
      )}
      <div className="mt-7 space-y-5">
        {parts.map((part) => (
          <div key={part.key}>
            <label
              htmlFor={`${inputId}-${part.key}`}
              className="mb-2 block font-normal"
            >
              {part.label}
              {part.description ? ` ${part.description}` : ""}
            </label>
            <RichMathAnswerInput
              ref={(handle) => {
                handles.current[part.key] = handle;
              }}
              id={`${inputId}-${part.key}`}
              ariaLabel={part.label}
              readOnly={readOnly}
              value={values[part.key] ?? ""}
              onFocus={() => {
                setFocused(part.key);
              }}
              onChange={(next) =>
                onChange(
                  parts.length === 1 && part.key === "value" && !hasSketch
                    ? next
                    : encodeParts({ ...values, [part.key]: next }),
                )
              }
            />
          </div>
        ))}
      </div>
      {hasSketch && (
        <div className="mt-6" inert={readOnly}>
          <p className="mb-3 text-sm">
            Sketch your graph and label the axes and intercepts. Sketches are
            saved for review.
          </p>
          <StructuredGraphSketch
            key={question.id}
            value={values.__sketch ?? ""}
            onChange={(sketch) =>
              onChange(encodeParts({ ...values, __sketch: sketch }))
            }
          />
        </div>
      )}
      {!readOnly && (
        <CalculatorDrawer
          isOpen={open}
          questionNumber={questionNumber}
          onClose={() => setOpen(false)}
          onHoverChange={() => {}}
          onInsertLatex={(latex) => {
            handles.current[focused]?.insertMath(latex);
            setOpen(false);
          }}
        />
      )}
    </section>
  );
}
