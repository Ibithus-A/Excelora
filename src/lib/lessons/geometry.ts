/** Coefficients are in ascending powers. Cubic Bézier control points exactly
 * represent a polynomial of degree at most three over a finite interval. */
export function polynomialBezier(
  coefficients: readonly number[],
  domain: readonly [number, number],
) {
  if (
    coefficients.length > 4 ||
    coefficients.length === 0 ||
    ![...coefficients, ...domain].every(Number.isFinite) ||
    domain[1] <= domain[0]
  ) {
    throw new Error(
      "Expected a finite polynomial of degree at most three and an increasing domain.",
    );
  }
  const value = (x: number) =>
    coefficients.reduceRight((sum, c) => sum * x + c, 0);
  const derivative = (x: number) =>
    coefficients
      .slice(1)
      .map((c, i) => c * (i + 1))
      .reduceRight((sum, c) => sum * x + c, 0);
  const [a, b] = domain,
    third = (b - a) / 3;
  return [
    [a, value(a)],
    [a + third, value(a) + third * derivative(a)],
    [b - third, value(b) - third * derivative(b)],
    [b, value(b)],
  ] as const;
}
