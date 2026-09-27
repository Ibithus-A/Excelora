import type { LessonBlock, LessonDrawing, NativeLesson } from "../../lib/lessons/schema.ts";
import { group, p } from "./authoring.ts";

const raw = String.raw;
const diagram = (description: string, drawing: LessonDrawing): LessonBlock => ({
  type: "diagram",
  description,
  drawing,
});

function plot(
  description: string,
  drawing: Omit<Extract<LessonDrawing, { type: "teaching-plot" }>, "type">,
) {
  return diagram(description, { type: "teaching-plot", ...drawing });
}

function scene(
  description: string,
  drawing: Omit<Extract<LessonDrawing, { type: "scene" }>, "type">,
) {
  return diagram(description, { type: "scene", ...drawing });
}

const axes = { xLabel: "x", yLabel: "y" } as const;

const TRIG_VISUALS: Record<string, LessonBlock> = {
  "5.1 Radians, Arc Length and Sector Area": group("See the geometry", [
    p("A radian is a ratio, not just another label for an angle. The shaded sector grows with both the angle and the square of the radius; its curved edge grows with the angle and the radius."),
    diagram("A unit-circle sector showing theta, its radius and the arc controlled by theta.", {
      type: "unit-circle", angle: 58, angleLabel: raw`\theta`, mode: "sector", pointLabel: "B", caption: [raw`s=r\theta`, raw`A=\frac12r^2\theta`],
    }),
  ]),
  "5.2 Sine Rule, Cosine Rule and Area of a Triangle": group("See the triangle", [
    p("The lowercase side always sits opposite its matching uppercase angle. The perpendicular height is the visual reason that the area formula contains a sine."),
    scene("A scalene triangle ABC with opposite sides a, b and c, and a perpendicular height from C.", {
      lines: [
        { from: [70, 205], to: [330, 205] }, { from: [70, 205], to: [235, 48] }, { from: [235, 48], to: [330, 205] },
        { from: [235, 48], to: [235, 205], dashed: true },
      ],
      labels: [
        { x: 55, y: 210, text: "A" }, { x: 338, y: 210, text: "B" }, { x: 235, y: 20, text: "C" },
        { x: 315, y: 112, text: "a" }, { x: 105, y: 112, text: "b" }, { x: 195, y: 210, text: "c" }, { x: 195, y: 122, text: "h=b\\sin A", width: 70 },
      ], caption: [raw`a\leftrightarrow A`, raw`b\leftrightarrow B`, raw`c\leftrightarrow C`],
    }),
  ]),
  "5.3 Exact Trigonometric Values": group("See where the values come from", [
    p("On a unit circle, cosine is the horizontal coordinate and sine is the vertical coordinate. Exact values are therefore coordinates, not isolated facts to memorise."),
    diagram("The first-quadrant unit-circle point at pi over three with coordinate projections for cosine and sine.", {
      type: "unit-circle", angle: 60, angleLabel: raw`\pi/3`, mode: "coordinates", pointLabel: raw`(\frac12,\frac{\sqrt3}{2})`, caption: [raw`x=\cos\theta`, raw`y=\sin\theta`],
    }),
  ]),
  "5.4 Trigonometric Graphs and Symmetry": group("See the cycles", [
    p("Sine starts at zero while cosine starts at its maximum. A horizontal shift of a quarter-turn makes the two shapes coincide."),
    plot("Sine and cosine across one complete cycle, with quarter-turn ticks.", {
      ...axes, xRange: [0, 2 * Math.PI], yRange: [-1.35, 1.35],
      curves: [{ kind: "sin", label: raw`y=\sin x` }, { kind: "cos", label: raw`y=\cos x` }],
      xTicks: [{ value: Math.PI / 2, label: raw`\pi/2` }, { value: Math.PI, label: raw`\pi` }, { value: 3 * Math.PI / 2, label: raw`3\pi/2` }, { value: 2 * Math.PI, label: raw`2\pi` }],
      yTicks: [{ value: -1, label: "-1" }, { value: 1, label: "1" }],
    }),
  ]),
  "5.5 Small Angle Approximations": group("See why the approximation works", [
    p("Near the origin, the curve and its tangent are almost indistinguishable. Moving farther from zero makes the gap visible, which is why the approximation requires a small angle in radians."),
    plot("The sine curve and the straight line y equals x near the origin.", {
      ...axes, xRange: [-1.2, 1.2], yRange: [-1.3, 1.3],
      curves: [{ kind: "sin", label: raw`y=\sin x` }, { kind: "polynomial", coefficients: [0, 1], label: raw`y=x`, dashed: true }],
    }),
  ]),
  "5.6 Reciprocal and Inverse Trigonometric Functions": group("See the reciprocal graph", [
    p("Where cosine approaches zero, its reciprocal grows without bound. The broken branches of secant therefore line up with the zeros of cosine."),
    plot("Secant and cosine on the same axes, with secant asymptotes where cosine is zero.", {
      ...axes, xRange: [-Math.PI, Math.PI], yRange: [-4, 4],
      curves: [{ kind: "cos", label: raw`y=\cos x`, dashed: true }, { kind: "sec", amplitude: 1, frequency: 1, label: raw`y=\sec x` }],
      asymptotes: [-Math.PI / 2, Math.PI / 2], xTicks: [{ value: -Math.PI / 2, label: raw`-\pi/2` }, { value: Math.PI / 2, label: raw`\pi/2` }],
    }),
  ]),
  "5.7 Trigonometric Identities": group("See the identity", [
    p("The Pythagorean identity is the unit-circle equation written using the point coordinates. Every angle lands on a point whose horizontal and vertical components form a right triangle."),
    diagram("A unit-circle radius resolved into cosine theta and sine theta, showing the right triangle behind the Pythagorean identity.", {
      type: "unit-circle", angle: 38, angleLabel: raw`\theta`, mode: "coordinates", caption: [raw`\cos^2\theta+\sin^2\theta=1`],
    }),
  ]),
  "5.8 The R cos Form": group("See the resultant amplitude", [
    p("The coefficients form perpendicular components of one resultant vector. Its length is R, and its direction supplies the phase angle alpha."),
    scene("A right triangle with perpendicular components a and b and resultant R at angle alpha.", {
      lines: [{ from: [75, 205], to: [320, 205], arrow: true }, { from: [320, 205], to: [320, 55], arrow: true }, { from: [75, 205], to: [320, 55], arrow: true }],
      paths: [{ d: "M111 205 A36 36 0 0 0 106 186" }],
      labels: [{ x: 190, y: 210, text: "a" }, { x: 363, y: 125, text: "b" }, { x: 155, y: 67, text: "R=\\sqrt{a^2+b^2}", width: 130 }, { x: 100, y: 167, text: "\\alpha", width: 30 }],
      caption: [raw`R\cos\alpha=a`, raw`R\sin\alpha=b`],
    }),
  ]),
  "5.9 Solving Trigonometric Equations": group("See every solution", [
    p("A horizontal coordinate or vertical coordinate usually occurs at more than one point on a circle. Reading all matching points before applying the interval prevents missing a solution."),
    diagram("A unit circle marking a first-quadrant reference angle and its coordinate projection for finding related solutions.", {
      type: "unit-circle", angle: 32, angleLabel: raw`\alpha`, mode: "solutions", pointLabel: raw`(\cos\alpha,\sin\alpha)`, caption: [raw`\text{reference angle}`, raw`\text{check the required interval}`],
    }),
  ]),
  "5.10 Trigonometry in Modelling": group("See the model", [
    p("The midline gives the average value, the amplitude gives the maximum departure from it, and the period gives the time taken for one complete repeat."),
    plot("A periodic model with its midline, maximum and minimum values visible.", {
      xLabel: "t", yLabel: "h", xRange: [0, 12], yRange: [1, 9],
      curves: [{ kind: "sin", amplitude: 3, frequency: Math.PI / 6, verticalShift: 5, label: raw`h=5+3\sin(\pi t/6)` }, { kind: "polynomial", coefficients: [5], label: "h=5", dashed: true }],
      points: [{ x: 3, y: 8, label: "(3,8)" }, { x: 9, y: 2, label: "(9,2)", dy: 4 }],
      xTicks: [{ value: 3, label: "3" }, { value: 6, label: "6" }, { value: 12, label: "12" }], yTicks: [{ value: 2, label: "2" }, { value: 5, label: "5" }, { value: 8, label: "8" }],
    }),
  ]),
};

const DIFF_VISUALS: LessonBlock[] = [
  group("See the limiting gradient", [p("The first-principles quotient is the gradient of a secant. As h shrinks, the second point moves toward the first and the secant becomes the tangent."), plot("A parabola with a secant through two nearby points and the limiting tangent at the first point.", { ...axes, xRange: [-0.5, 3.5], yRange: [-1, 10], curves: [{ kind: "polynomial", coefficients: [0, 0, 1], label: raw`y=x^2` }], points: [{ x: 1, y: 1, label: raw`(x,f(x))` }, { x: 2.2, y: 4.84, label: raw`(x+h,f(x+h))`, dx: 0, dy: -30 }], tangents: [{ x: 1, y: 1, slope: 2, label: raw`h\to0` }] })]),
  group("See what derivatives describe", [p("The derivative records the changing slope of the original curve. At the marked point, the dashed tangent makes that local gradient visible."), plot("A cubic curve with its tangent at x equals one.", { ...axes, xRange: [-2, 2.2], yRange: [-5, 7], curves: [{ kind: "polynomial", coefficients: [0, -1, 0, 1], label: raw`y=x^3-x` }], tangents: [{ x: 1, y: 0, slope: 2, label: raw`f'(1)=2` }], points: [{ x: 1, y: 0, label: "P" }] })]),
  group("See the chain", [p("For a composite function, a change in x first changes the inner quantity, which then changes the outer quantity. The derivative multiplies those two local rates."), scene("A dependency chain from x through u equals g of x to y equals f of u, with derivative rates on the arrows.", { lines: [{ from: [55, 125], to: [165, 125], arrow: true }, { from: [230, 125], to: [345, 125], arrow: true }], rects: [{ x: 25, y: 98, width: 45, height: 48 }, { x: 165, y: 98, width: 65, height: 48 }, { x: 345, y: 98, width: 42, height: 48 }], labels: [{ x: 47, y: 108, text: "x" }, { x: 197, y: 108, text: "u=g(x)", width: 65 }, { x: 366, y: 108, text: "y" }, { x: 110, y: 88, text: "du/dx", width: 65 }, { x: 285, y: 88, text: "dy/du", width: 65 }], caption: [raw`\frac{dy}{dx}=\frac{dy}{du}\frac{du}{dx}`] })]),
  group("See stationary points", [p("At a stationary point the tangent is horizontal. The derivative changes from positive to negative at a maximum, and from negative to positive at a minimum."), plot("A cubic with a local maximum and minimum, both marked with horizontal tangents.", { ...axes, xRange: [-1, 4.5], yRange: [-3, 7], curves: [{ kind: "polynomial", coefficients: [1, 9, -6, 1], label: raw`y=x^3-6x^2+9x+1` }], points: [{ x: 1, y: 5, label: raw`\text{maximum}` }, { x: 3, y: 1, label: raw`\text{minimum}`, dy: 4 }], tangents: [{ x: 1, y: 5, slope: 0, label: raw`f'(x)=0` }, { x: 3, y: 1, slope: 0, label: raw`f'(x)=0` }] })]),
  group("See the parametric motion", [p("A parameter traces one point through the plane. The horizontal and vertical rates combine to give the gradient of the path."), diagram("The parametric curve x equals t squared, y equals t cubed minus 3t, with the point at t equals two marked.", { type: "parametric", xCoefficients: [0, 0, 1], yCoefficients: [0, -3, 0, 1], domain: [-2, 2], xRange: [-1, 5], yRange: [-4, 4], xLabel: "x", yLabel: "y", labels: [{ x: 4, y: 2, text: raw`t=2`, dx: 18, dy: -18, guide: true }] })]),
  group("See the modelling translation", [p("A differential equation links a quantity to the rate at which it changes. The arrows show the modelling chain from a verbal relationship to a rate law and then to a calibrated constant."), scene("A three-stage flow from a verbal rate statement to a differential equation and then a condition used to find the constant.", { lines: [{ from: [112, 125], to: [152, 125], arrow: true }, { from: [270, 125], to: [310, 125], arrow: true }], rects: [{ x: 15, y: 88, width: 98, height: 74 }, { x: 152, y: 88, width: 118, height: 74 }, { x: 310, y: 88, width: 78, height: 74 }], labels: [{ x: 64, y: 102, text: raw`\text{verbal rate}`, width: 86 }, { x: 211, y: 102, text: raw`dr/dt=k/\sqrt r`, width: 105 }, { x: 349, y: 102, text: raw`\text{condition}`, width: 67 }], caption: [raw`\text{relationship}`, raw`\text{equation}`, raw`\text{calibration}`] })]),
];

const INT_VISUALS: LessonBlock[] = [
  group("See the family of antiderivatives", [p("An indefinite integral represents a family of curves with identical shape. The constant of integration moves the curve vertically without changing its derivative."), plot("Three vertically translated parabolas representing the same antiderivative family.", { ...axes, xRange: [-2.2, 2.2], yRange: [-1, 6], curves: [{ kind: "polynomial", coefficients: [0, 0, 1], label: raw`F(x)` }, { kind: "polynomial", coefficients: [2, 0, 1], label: raw`F(x)+2` }, { kind: "polynomial", coefficients: [-0.7, 0, 1], label: raw`F(x)-0.7`, dashed: true }] })]),
  group("See the accumulated area", [p("A definite integral adds thin vertical strips. Between two curves, each strip has height top function minus bottom function; the shaded region is the total of those strips."), plot("The shaded finite area between y equals 6x minus x squared and y equals 2x from zero to four.", { ...axes, xRange: [-0.5, 5], yRange: [-1, 10], curves: [{ kind: "polynomial", coefficients: [0, 6, -1], label: raw`y=6x-x^2` }, { kind: "polynomial", coefficients: [0, 2], label: raw`y=2x` }], shade: [{ from: 0, to: 4, curve: 0, against: 1 }], xTicks: [{ value: 4, label: "4" }], caption: [raw`\text{shaded area}=\int_0^4[(6x-x^2)-2x]\,dx`] })]),
  group("See substitution as a change of variable", [p("Substitution changes the scale used to describe the same integral. Every occurrence of x, including dx and the limits, must travel through the mapping."), scene("A two-way substitution map between an x-integral and a simpler u-integral, with transformed limits.", { lines: [{ from: [145, 95], to: [255, 95], arrow: true }, { from: [255, 165], to: [145, 165], arrow: true }], rects: [{ x: 25, y: 74, width: 120, height: 112 }, { x: 255, y: 74, width: 120, height: 112 }], labels: [{ x: 85, y: 96, text: raw`x,\,dx,\,\text{limits}`, width: 105 }, { x: 315, y: 96, text: raw`u,\,du,\,\text{limits}`, width: 105 }, { x: 200, y: 62, text: "u=g(x)", width: 80 }, { x: 200, y: 173, text: raw`\text{back-substitute}`, width: 105 }], caption: [raw`\text{same accumulated quantity}`, raw`\text{new coordinate}`] })]),
  group("See integration by parts", [p("The product rule contains two product terms. Integration by parts keeps one as uv and transfers the remaining integral to a form chosen to be simpler."), scene("A balanced transformation showing the product-rule terms rearranged into the integration-by-parts formula.", { lines: [{ from: [75, 128], to: [325, 128], arrow: true }], labels: [{ x: 75, y: 88, text: "d(uv)", width: 72 }, { x: 200, y: 88, text: raw`u\,dv+v\,du`, width: 120 }, { x: 325, y: 88, text: raw`u\,dv=d(uv)-v\,du`, width: 150 }, { x: 200, y: 164, text: raw`\text{integrate both sides}`, width: 140 }], caption: [raw`\int u\,dv=uv-\int v\,du`] })]),
  group("See why partial fractions help", [p("A rational expression can be split into simpler reciprocal branches. Each simple denominator then integrates directly to a logarithm."), plot("Two reciprocal component curves separated by their vertical asymptotes.", { ...axes, xRange: [-4, 5], yRange: [-5, 5], curves: [{ kind: "reciprocal", phase: 1, label: raw`1/(x+1)` }, { kind: "reciprocal", amplitude: 4, phase: -3, label: raw`4/(x-3)`, dashed: true }], asymptotes: [-1, 3], xTicks: [{ value: -1, label: "-1" }, { value: 3, label: "3" }] })]),
  group("See separation of variables", [p("Separation gathers every y-dependent factor with dy and every x-dependent factor with dx. Integration then compares two accumulated changes, with the condition selecting one curve from the family."), scene("A flow diagram for separating, integrating and applying a boundary condition to a differential equation.", { lines: [{ from: [115, 125], to: [150, 125], arrow: true }, { from: [250, 125], to: [285, 125], arrow: true }], rects: [{ x: 12, y: 88, width: 103, height: 74 }, { x: 150, y: 88, width: 100, height: 74 }, { x: 285, y: 88, width: 103, height: 74 }], labels: [{ x: 63, y: 101, text: raw`\text{separate }x\text{ and }y`, width: 103 }, { x: 200, y: 101, text: raw`\text{integrate both}`, width: 96 }, { x: 336, y: 101, text: raw`\text{apply condition}`, width: 98 }], caption: [raw`dy/g(y)=f(x)\,dx`, raw`\text{constant fixed last}`] })]),
];

function insertVisual(lesson: NativeLesson, visual: LessonBlock) {
  const firstPractice = lesson.blocks.findIndex((block) => block.type === "group" && /Practice Questions/i.test(block.title ?? ""));
  lesson.blocks.splice(firstPractice >= 0 ? firstPractice : Math.min(2, lesson.blocks.length), 0, visual);
}

export function addTrigonometryVisuals(lessons: NativeLesson[]) {
  for (const lesson of lessons) {
    const visual = TRIG_VISUALS[lesson.sourceTitle];
    if (visual) insertVisual(lesson, visual);
  }
}

export function addDifferentiationVisuals(lessons: NativeLesson[]) {
  lessons.forEach((lesson, index) => {
    const visual = DIFF_VISUALS[index];
    if (visual) insertVisual(lesson, visual);
  });
}

export function addIntegrationVisuals(lessons: NativeLesson[]) {
  lessons.forEach((lesson, index) => {
    const visual = INT_VISUALS[index];
    if (visual) insertVisual(lesson, visual);
  });
}
