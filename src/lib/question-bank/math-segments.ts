/** Parse supplied mixed prose/maths without interpreting or evaluating expressions. */
export type BankMathSegment = {
  math: boolean;
  value: string;
  display?: boolean;
};
const commands = /^(?:\\{1,2}[A-Za-z]+|\\[,;! {}])(?:\*?)/;
const token =
  /^(?:\d+(?:\.\d+)?|[A-Za-z]\d*|[α-ωΑ-Ω]|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+|[=+−×÷±<>≤≥≠≈∈∩∪∞√∑∫^_{}()[\]|*/:,-])/;
const words =
  /^(?:cm|mm|km|kg|kx|ax|np|mg|AB|AC|BC|OA|OB|OC|dx|dy|dt|du|dv|dr|ds|sin|cos|tan|sec|cosec|cot|arcsin|arccos|arctan|ln|log|exp)(?![A-Za-z])/;
function balanced(source: string, start: number): number {
  const closer: Record<string, string> = { "{": "}", "(": ")", "[": "]" };
  const stack = [closer[source[start]]];
  let i = start + 1;
  for (; i < source.length && stack.length; i++) {
    if (closer[source[i]]) stack.push(closer[source[i]]);
    else if (source[i] === stack.at(-1)) stack.pop();
  }
  return stack.length ? start : i;
}
export function normalizeBankLatex(value: string): string {
  // Some bank generators escaped commands twice; matrix row separators are retained.
  let s = value.replace(/\\\\(?=[A-Za-z])/g, "\\");
  s = s.replace(/([_^])(-?\d+)/g, "$1{$2}");
  const map: Record<string, string> = {
    "²": "2",
    "³": "3",
    "¹": "1",
    "⁰": "0",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9",
    "⁻": "-",
  };
  s = s.replace(
    /[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g,
    (v) => `^{${[...v].map((c) => map[c]).join("")}}`,
  );
  // Convert grouped plain-text powers, preserving all inner parentheses.
  for (let i = s.length - 2; i >= 0; i--)
    if ((s[i] === "^" || s[i] === "_") && s[i + 1] === "(") {
      const end = balanced(s, i + 1);
      if (end > i + 1)
        s =
          s.slice(0, i + 1) +
          "{" +
          s.slice(i + 2, end - 1) +
          "}" +
          s.slice(end);
    }
  s = s.replace(/\^(\\(?:log|ln)\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, "^{$1}");
  return s.replace(
    /(^|[^\\A-Za-z])(sin|cos|tan|sec|cot|ln|log|exp)(?![A-Za-z])/g,
    "$1\\$2",
  );
}
function undelimited(source: string): BankMathSegment[] {
  const result: BankMathSegment[] = [];
  let plain = "",
    i = 0;
  const flush = () => {
    if (plain) {
      result.push({ math: false, value: plain });
      plain = "";
    }
  };
  while (i < source.length) {
    const start = i;
    let end = i,
      hasMath = false;
    while (end < source.length) {
      let at = end;
      while (/\s/.test(source[at] ?? "") && at < source.length) at++;
      const rest = source.slice(at);
      let length = 0;
      const command = rest.match(commands);
      if (source[at] === "{") {
        const close = balanced(source, at);
        if (close > at) {
          end = close;
          hasMath = true;
          continue;
        }
      }
      if (command) {
        length = command[0].length;
        // Consume command arguments as a unit, including prose in operator names.
        let cursor = at + length;
        while (source[cursor] === "{") {
          const next = balanced(source, cursor);
          if (next === cursor) break;
          cursor = next;
        }
        if (/\\begin$/.test(command[0])) {
          const environment = source
            .slice(at, cursor)
            .match(/\{([^}]+)\}/)?.[1];
          const close = environment ? `\\end{${environment}}` : "";
          const closeAt = close ? source.indexOf(close, cursor) : -1;
          if (closeAt >= 0) cursor = closeAt + close.length;
        }
        length = cursor - at;
        hasMath = true;
      } else {
        const named = rest.match(words);
        const ordinary = rest.match(/^[A-Za-z]+/);
        if (named) {
          length = named[0].length;
          hasMath = true;
        } else if (ordinary && ordinary[0].length > 1) break;
        else {
          const match = rest.match(token);
          if (!match) break;
          length = match[0].length;
          if (/[=+−×÷±<>≤≥≠≈∈∩∪∞√∑∫^_α-ωΑ-Ω⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(match[0]))
            hasMath = true;
        }
      }
      end = at + length;
    }
    if (end > start && hasMath) {
      let value = source.slice(start, end);
      const suffix = value.match(/[\s,:;-]+$/)?.[0] ?? "";
      value = value.slice(0, value.length - suffix.length);
      const leading = value.match(/^\s*/)?.[0] ?? "";
      plain += leading;
      value = value.slice(leading.length);
      flush();
      result.push({ math: true, value: normalizeBankLatex(value) });
      plain = suffix;
      i = end;
    } else {
      // Keep entire prose words together so suffix letters cannot become maths.
      const word = source.slice(i).match(/^[A-Za-z]+/);
      const count = word?.[0].length ?? 1;
      plain += source.slice(i, i + count);
      i += count;
    }
  }
  flush();
  return result;
}
export function bankMathSegments(source: string): BankMathSegment[] {
  const result: BankMathSegment[] = [];
  const delimiters =
    /\$\$([\s\S]*?)\$\$|\$([^$]+)\$|\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;
  let end = 0;
  for (const match of source.matchAll(delimiters)) {
    result.push(...undelimited(source.slice(end, match.index)));
    result.push({
      math: true,
      value: normalizeBankLatex(match[1] ?? match[2] ?? match[3] ?? match[4]),
      display: match[1] !== undefined || match[4] !== undefined,
    });
    end = match.index + match[0].length;
  }
  result.push(...undelimited(source.slice(end)));
  return result;
}
