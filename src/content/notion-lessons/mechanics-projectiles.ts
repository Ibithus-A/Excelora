import { nativeLesson, transcript } from "./authoring.ts";
import { polynomialBezier } from "../../lib/lessons/geometry.ts";
import type { LessonBlock, LessonDrawing } from "../../lib/lessons/schema.ts";
const raw = String.raw;
function projectile(
  speed: number,
  angle: number,
  height: number,
  launchLabel: string,
  angleLabel: string,
  caption: string[],
  generic = false,
): LessonBlock {
  const radians = (angle * Math.PI) / 180,
    vx = speed * Math.cos(radians),
    vy = speed * Math.sin(radians),
    g = 9.8;
  const flight = (vy + Math.sqrt(vy * vy + 2 * g * height)) / g,
    range = vx * flight,
    peak = height + Math.max(0, vy) ** 2 / (2 * g);
  const scale = Math.min(265 / range, 135 / peak),
    sx = (x: number) => 55 + x * scale,
    sy = (y: number) => 200 - y * scale;
  const controls = polynomialBezier(
    [height, vy / vx, -g / (2 * vx * vx)],
    [0, range],
  );
  const path = `M${controls[0].map((v, i) => (i ? sy(v) : sx(v))).join(",")} C${controls
    .slice(1)
    .map(([x, y]) => `${sx(x)},${sy(y)}`)
    .join(" ")}`;
  const start: [number, number] = [55, sy(height)],
    tip: [number, number] = [
      55 + 65 * Math.cos(radians),
      sy(height) - 65 * Math.sin(radians),
    ];
  const peakX = (vx * vy) / g;
  return {
    type: "diagram",
    description: `A projectile launched ${height ? `from a cliff ${height} m above the landing level` : "from level ground"} at ${generic ? "speed U and angle alpha" : `${speed} m/s and ${angle} degrees`} follows a smooth parabolic trajectory. ${height ? "Horizontal displacement is x." : "The peak has zero vertical velocity; H is the greatest height and the horizontal range reaches A."} Gravity g acts downwards.`,
    drawing: {
      type: "scene",
      lines: [
        { from: [35, 200], to: [350, 200] },
        { from: start, to: tip, arrow: true },
        { from: [355, 45], to: [355, 88], arrow: true },
        ...((height
          ? [{ from: [55, sy(height)], to: [55, 200] }]
          : [
              {
                from: [sx(peakX), 200],
                to: [sx(peakX), sy(peak)],
                dashed: true,
              },
            ]) as Extract<LessonDrawing, { type: "scene" }>["lines"]),
      ],
      paths: [{ d: path }],
      labels: [
        { x: 34, y: sy(height) - 28, text: "O", width: 25 },
        { x: tip[0] + 36, y: tip[1] - 43, text: launchLabel, width: 90 },
        { x: 378, y: 58, text: "g", width: 24 },
        ...(height
          ? [
              {
                x: 28,
                y: (sy(height) + 200) / 2 - 7,
                text: `${height}\\text{ m}`,
                width: 50,
              },
            ]
          : [
              {
                x: sx(peakX) + 25,
                y: (200 + sy(peak)) / 2 - 6,
                text: "H",
                width: 24,
              },
              { x: sx(range) + 20, y: 214, text: "A", width: 24 },
            ]),
      ],
      caption: [...(angleLabel ? [angleLabel] : []), ...caption],
    },
  };
}
export const MECHANICS_PROJECTILE_LESSON = nativeLesson(
  "Mechanics",
  "Chapter 7: Projectiles",
  "7.1 Projectile Motion",
  transcript(
    raw`
@diagram generic

## Projectile Equations

Horizontal (constant velocity):

$$x=Ut\cos\alpha$$

$$\dot x=U\cos\alpha$$

Vertical (acceleration $-g$):

$$y=Ut\sin\alpha-\frac12gt^2$$

$$\dot y=U\sin\alpha-gt$$

Trajectory equation: $y=x\tan\alpha-\frac{gx^2}{2U^2\cos^2\alpha}$

Greatest height: $H=\frac{U^2\sin^2\alpha}{2g}$ Time of flight: $T=\frac{2U\sin\alpha}g$ Range: $R=\frac{U^2\sin2\alpha}g$

## Worked Example 1

A stone is projected from point $O$ on horizontal ground with speed $35\text{ m s}^{-1}$ at angle $\alpha$ to the horizontal, where $\tan\alpha=\frac34$. Show that the trajectory is $y=\frac34x-\frac{x^2}{160}$. Find the range and greatest height.

@diagram stone

With $\tan\alpha=\frac34$: $\sin\alpha=\frac35$, $\cos\alpha=\frac45$.

Horizontal: $x=35\cdot\frac45\cdot t=28t$, so $t=\frac x{28}$.

Vertical: $y=35\cdot\frac35\cdot t-4.9t^2=21t-4.9t^2$.

Substituting $t=\frac x{28}$:

$$y=21\cdot\frac x{28}-4.9\cdot\frac{x^2}{784}=\frac{3x}4-\frac{x^2}{160}$$

Range ($y=0$): $x(\frac34-\frac x{160})=0\implies x=120$ m.

Greatest height: $H=\frac{35^2\sin^2\alpha}{2g}=\frac{1225\cdot9/25}{19.6}=\frac{441}{19.6}=22.5$ m.

## Worked Example 2

A particle is projected horizontally with speed $12\text{ m s}^{-1}$ from the top of a cliff 45 m above the sea. Find (a) the time to reach the sea, (b) the horizontal distance travelled, (c) the speed on impact.

@diagram cliff

Take downward positive. $u_y=0$, $a=g$.

(a) Time: $45=\frac12(9.8)t^2\implies t^2=\frac{90}{9.8}\implies t=3.03$ s.

(b) Distance: $x=12\times3.03=36.4$ m.

(c) Impact speed: $v_y=gt=29.7$. $v=\sqrt{12^2+29.7^2}=\sqrt{144+882}=32.0\text{ m s}^{-1}$.

## Practice Questions

1. A ball is projected at $20\text{ m s}^{-1}$ at $45^\circ$ from ground level. Find the range and greatest height.

2. A stone is projected from a cliff 20 m high at $10\text{ m s}^{-1}$ at $30^\circ$ above horizontal. Find the time to reach the sea and the horizontal distance travelled.

3. Show that for a projectile from level ground, $\tan\alpha=\frac{4H}R$.

## Practice Solutions

1. $U=20$, $\alpha=45^\circ$.

@diagram ball

$R=\frac{U^2\sin2\alpha}g=\frac{400\times1}{9.8}=40.8$ m.

$H=\frac{U^2\sin^2\alpha}{2g}=\frac{400\times0.5}{19.6}=10.2$ m.

2. Cliff 20 m, $U=10$, $\alpha=30^\circ$ above horizontal.

@diagram cliff20

Taking up positive, $u_y=10\sin30^\circ=5$, $a=-9.8$. When it reaches the sea, $y=-20$:

$$-20=5t-4.9t^2\implies4.9t^2-5t-20=0$$

$t=\frac{5+\sqrt{25+392}}{9.8}=\frac{5+20.42}{9.8}=2.59$ s

Horizontal distance: $x=10\cos30^\circ\times2.59=22.4$ m.

3. $H=\frac{U^2\sin^2\alpha}{2g}$ and $R=\frac{U^2\sin2\alpha}g=\frac{2U^2\sin\alpha\cos\alpha}g$.

$$\frac{4H}R=\frac{4U^2\sin^2\alpha/(2g)}{2U^2\sin\alpha\cos\alpha/g}=\frac{\sin\alpha}{\cos\alpha}=\tan\alpha$$
`,
    {
      generic: projectile(
        14,
        40,
        0,
        "U",
        raw`\alpha`,
        [
          raw`U\cos\alpha`,
          raw`U\sin\alpha`,
          raw`v_y=0\text{ at the peak}`,
          raw`\text{range }R`,
        ],
        true,
      ),
      stone: projectile(
        35,
        (Math.atan(3 / 4) * 180) / Math.PI,
        0,
        "35",
        raw`\alpha`,
        [raw`\text{peak}`, raw`OA`],
      ),
      cliff: projectile(12, 0, 45, raw`12\text{ m s}^{-1}`, "", ["x"]),
      ball: projectile(20, 45, 0, "20", raw`45^\circ`, ["R"]),
      cliff20: projectile(10, 30, 20, "10", raw`30^\circ`, ["x"]),
    },
  ),
);
