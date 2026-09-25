import { compoundParts } from "./compound-parts.ts";
import { parseAssessmentAnswer } from "../assessment-answer.ts";

export function answerText(value: string): string {
  return parseAssessmentAnswer(value)
    .map((s) => (s.type === "math" ? s.latex : s.value))
    .join("")
    .trim();
}

/** Only explicit prose labels are inferred, never letters inside mathematical expressions. */
export function answerParts(
  prompt: string,
): { key: string; label: string; description?: string }[] {
  const prose = prompt.replace(/\$[^$]*\$/g, " ");
  const matches = [
    ...prose.matchAll(
      /(?:^|\s)\(([a-h]|i{1,3}|iv|v|vi{0,3})\)(?:\s*\((i{1,3}|iv|v|vi{0,3})\))?/g,
    ),
  ];
  let parent = "";
  const parts = [
    ...new Set(
      matches.map((m) => {
        if (/^[a-h]$/.test(m[1])) {
          parent = m[2] ? `(${m[1]})` : "";
          return `(${m[1]})${m[2] ? `(${m[2]})` : ""}`;
        }
        return `${parent}(${m[1]})`;
      }),
    ),
  ];
  const compound = compoundParts(prompt);
  if (!parts.length && compound)
    return compound.map((description, index) => ({
      key: `(${String.fromCharCode(97 + index)})`,
      label: `Answer (${String.fromCharCode(97 + index)}):`,
      description,
    }));
  return parts.length
    ? parts.map((key) => ({ key, label: `Answer ${key}:` }))
    : [{ key: "value", label: "Answer:" }];
}

const PREFIX = "excelora-parts-v1:";
export function decodeParts(value: string): Record<string, string> {
  if (!value.startsWith(PREFIX)) return { value };
  try {
    const data = JSON.parse(value.slice(PREFIX.length));
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, val]) => key.length < 40 && typeof val === "string",
      ),
    ) as Record<string, string>;
  } catch {
    return {};
  }
}
export function encodeParts(parts: Record<string, string>) {
  return PREFIX + JSON.stringify(parts);
}
export function responseHasContent(value = "") {
  return Object.values(decodeParts(value)).some(
    (part) => answerText(part).length > 0,
  );
}
