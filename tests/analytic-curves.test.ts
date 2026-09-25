import test from "node:test";
import assert from "node:assert/strict";
import {
  curveValue,
  curveDerivative,
  curveSegments,
  type AnalyticCurve,
} from "../src/lib/lessons/analytic-curves.ts";
test("smooth exponential and normal curves track their equations throughout every cubic segment", () => {
  const cases: { curve: AnalyticCurve; domain: [number, number] }[] = [
    {
      curve: { kind: "exponential", rate: 1, scale: 1, label: "" },
      domain: [-1.6, 1.6],
    },
    {
      curve: { kind: "exponential", rate: -1, scale: 1, label: "" },
      domain: [-1.6, 1.6],
    },
    {
      curve: { kind: "normal", mean: 0, sigma: 1, label: "" },
      domain: [-4, 4],
    },
    {
      curve: { kind: "normal", mean: 100, sigma: 15, label: "" },
      domain: [40, 160],
    },
  ];
  for (const { curve, domain } of cases) {
    const segments = curveSegments(curve, domain);
    segments.forEach((points, i) => {
      if (i) assert.deepEqual(points[0], segments[i - 1][3]);
      for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
        const weights = [
          (1 - t) ** 3,
          3 * (1 - t) ** 2 * t,
          3 * (1 - t) * t * t,
          t ** 3,
        ];
        const x = points.reduce((sum, p, j) => sum + p[0] * weights[j], 0);
        const y = points.reduce((sum, p, j) => sum + p[1] * weights[j], 0);
        assert.ok(Math.abs(y - curveValue(curve, x)) < 1e-8);
      }
      const slope =
        (points[1][1] - points[0][1]) / (points[1][0] - points[0][0]);
      assert.ok(Math.abs(slope - curveDerivative(curve, points[0][0])) < 1e-10);
    });
  }
});
test("normal curves have the specified mean and standard deviation", () => {
  const curve: AnalyticCurve = {
    kind: "normal",
    mean: 15,
    sigma: 3,
    label: "",
  };
  assert.ok(curveDerivative(curve, 15) === 0);
  assert.ok(Math.abs(curveValue(curve, 12) - curveValue(curve, 18)) < 1e-15);
  // Simpson integration of the actual rendered polynomial segments over ±4 sigma.
  let area = 0;
  for (const points of curveSegments(curve, [3, 27]))
    area +=
      ((points[3][0] - points[0][0]) *
        points.reduce((sum, p) => sum + p[1], 0)) /
      4;
  assert.ok(Math.abs(area - 0.9999366575) < 1e-8);
});
