export type AnalyticCurve =
  | {
      kind: "exponential";
      rate: number;
      scale: number;
      offset?: number;
      label: string;
      dashed?: boolean;
    }
  | {
      kind: "normal";
      mean: number;
      sigma: number;
      label: string;
      dashed?: boolean;
    };
export function curveValue(curve: AnalyticCurve, x: number): number {
  if (curve.kind === "exponential")
    return curve.scale * Math.exp(curve.rate * x) + (curve.offset ?? 0);
  const z = (x - curve.mean) / curve.sigma;
  return Math.exp((-z * z) / 2) / (curve.sigma * Math.sqrt(2 * Math.PI));
}
export function curveDerivative(curve: AnalyticCurve, x: number): number {
  if (curve.kind === "exponential")
    return curve.rate * curve.scale * Math.exp(curve.rate * x);
  return (
    (-(x - curve.mean) / (curve.sigma * curve.sigma)) * curveValue(curve, x)
  );
}
/** Cubic Hermite segments share exact endpoint values and derivatives. */
export function curveSegments(
  curve: AnalyticCurve,
  domain: [number, number],
  count = 256,
): [number, number][][] {
  if (
    domain[1] <= domain[0] ||
    count < 1 ||
    !Number.isInteger(count) ||
    (curve.kind === "normal" && curve.sigma <= 0)
  )
    throw new Error("Invalid curve domain");
  return Array.from({ length: count }, (_, i) => {
    const x = domain[0] + ((domain[1] - domain[0]) * i) / count;
    const next = domain[0] + ((domain[1] - domain[0]) * (i + 1)) / count;
    const h = (next - x) / 3;
    return [
      [x, curveValue(curve, x)],
      [x + h, curveValue(curve, x) + h * curveDerivative(curve, x)],
      [next - h, curveValue(curve, next) - h * curveDerivative(curve, next)],
      [next, curveValue(curve, next)],
    ];
  });
}
