import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import {
  bankMathSegments,
  normalizeBankLatex,
} from "../src/lib/question-bank/math-segments.ts";
test("bank maths preserves prose spacing and typesets undelimited expressions", () => {
  const parts = bankMathSegments(
    String.raw`Differentiate y=x^{2} \left(5 x^{2} + 4\right).`,
  );
  assert.deepEqual(parts, [
    { math: false, value: "Differentiate " },
    { math: true, value: String.raw`y=x^{2} \left(5 x^{2} + 4\right)` },
    { math: false, value: "." },
  ]);
});
test("matrix rows survive source double escaping", () => {
  const parts = bankMathSegments(
    String.raw`For vector a=\\begin{pmatrix}2\\-3\\6\\end{pmatrix}, find its magnitude.`,
  );
  const math = parts.find((p) => p.math)!;
  assert.equal(math.value, String.raw`a=\begin{pmatrix}2\\-3\\6\end{pmatrix}`);
  assert.doesNotThrow(() =>
    katex.renderToString(math.value, { throwOnError: true }),
  );
  assert.equal(parts.at(-1)?.value, ", find its magnitude.");
});
test("normalization retains grouped powers and derivative notation", () => {
  assert.equal(normalizeBankLatex("x^(2t+1)"), "x^{2t+1}");
  const parts = bankMathSegments("Find d²y/dx² for y=x².");
  assert.equal(parts.find((p) => p.math)?.value, "d^{2}y/dx^{2}");
  assert.equal(
    bankMathSegments("State the assumptions.")[0].value,
    "State the assumptions.",
  );
});
test("explicit math delimiters preserve display mode and complete expressions", () => {
  const parts = bankMathSegments(
    String.raw`Hence \[\frac{1}{2}=0.5\] and $x^2$.`,
  );
  assert.equal(parts[1].display, true);
  assert.equal(parts[1].value, String.raw`\frac{1}{2}=0.5`);
  assert.equal(parts[3].value, "x^{2}");
});
test("signed unit exponents remain one exponent", () => {
  assert.equal(normalizeBankLatex("s^-2"), "s^{-2}");
  assert.equal(normalizeBankLatex("x^12"), "x^{12}");
});
