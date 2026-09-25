import { nativeLesson, p, m, group, example } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson("Mechanics", "Chapter 9: Further Kinematics", title, blocks);
export const MECHANICS_VECTOR_KINEMATICS_LESSONS = [
  lesson("9.1 Vector Kinematics", [
    group("Vector Kinematics Relationships", [
      m(
        raw`\mathbf v=\frac{d\mathbf r}{dt}\qquad\mathbf a=\frac{d\mathbf v}{dt}\qquad\mathbf r=\int\mathbf v\,dt\qquad\mathbf v=\int\mathbf a\,dt`,
      ),
      p(
        raw`Constant acceleration: $\mathbf v=\mathbf u+\mathbf at$ and $\mathbf r=\mathbf r_0+\mathbf ut+\frac12\mathbf at^2$.`,
      ),
      p(raw`Speed $=|\mathbf v|=\sqrt{v_x^2+v_y^2}$.`),
      p(
        raw`Moving parallel to $\mathbf i$: $v_y=0$. Moving parallel to $\mathbf j$: $v_x=0$.`,
      ),
      p(
        raw`Moving parallel to $(a\mathbf i+b\mathbf j)$: $\frac{v_x}{a}=\frac{v_y}{b}$.`,
      ),
    ]),
    p(
      "A vector kinematics setup showing position, velocity, and acceleration at a point:",
    ),
    {
      type: "diagram",
      description:
        "Schematic i–j axes with origin O and point P on a curved path. The position vector r(t) runs from O to P. Velocity v is tangent to the path at P and points up and right; acceleration a starts at P and points down and right. No numerical trajectory is specified.",
      drawing: { type: "kinematics-setup" },
    },
    group("Worked Example 1", [
      p(
        raw`A particle has velocity $\mathbf v=(t^2-3t+7)\mathbf i+(2t^2-3)\mathbf j\text{ m s}^{-1}$.`,
      ),
      p("(a) Find the speed at $t=0$."),
      p(
        raw`(b) Find $t$ when the particle moves parallel to $(\mathbf i+\mathbf j)$.`,
      ),
      p("(c) Find the acceleration vector."),
      p(
        raw`(a) $\mathbf v(0)=7\mathbf i-3\mathbf j$. Speed $=\sqrt{49+9}=\sqrt{58}\approx7.62\text{ m s}^{-1}$.`,
      ),
      p(raw`(b) Parallel to $(\mathbf i+\mathbf j)$: components equal.`),
      m(raw`t^2-3t+7=2t^2-3\implies t^2+3t-10=0\implies(t+5)(t-2)=0`),
      p("Taking $t>0$: $t=2$ s."),
      p(
        raw`(c) $\mathbf a=\frac{d\mathbf v}{dt}=(2t-3)\mathbf i+4t\mathbf j$.`,
      ),
    ]),
    group("Worked Example 2", [
      p(
        raw`A particle has position vector $\mathbf r=(3t^2-1)\mathbf i+(t^3-6t)\mathbf j$ m. Find:`,
      ),
      p(
        raw`(a) the velocity, (b) the speed at $t=2$, (c) when the particle moves parallel to $\mathbf i$.`,
      ),
      p(raw`(a) $\mathbf v=6t\mathbf i+(3t^2-6)\mathbf j$.`),
      p(
        raw`(b) $\mathbf v(2)=12\mathbf i+6\mathbf j$. Speed $=\sqrt{144+36}=\sqrt{180}=6\sqrt5\approx13.4\text{ m s}^{-1}$.`,
      ),
      p(
        raw`(c) Parallel to $\mathbf i$: $\mathbf j$ component $=0$. $3t^2-6=0\implies t=\sqrt2$ s.`,
      ),
      {
        type: "diagram",
        description:
          "Path x=3t²−1, y=t³−6t for 0≤t≤2. It begins at (−1,0), labelled t=0, reaches a horizontal tangent at (5,−4√2), labelled t=√2, then reaches (11,−4), labelled t=2. Axes are i and j.",
        drawing: {
          type: "parametric",
          xCoefficients: [-1, 0, 3],
          yCoefficients: [0, -6, 0, 1],
          domain: [0, 2],
          xRange: [-5, 16],
          yRange: [-9, 3],
          xLabel: raw`\mathbf i`,
          yLabel: raw`\mathbf j`,
          labels: [
            { x: -1, y: 0, text: "t=0", dx: -33, dy: -28 },
            { x: 5, y: -4 * Math.sqrt(2), text: raw`t=\sqrt2`, dx: 0, dy: 18 },
            { x: 11, y: -4, text: "t=2", dx: 32, dy: -27 },
          ],
        },
      },
    ]),
    group("Practice Questions", [
      p(
        raw`1. $\mathbf v=2t\mathbf i+(3-t)\mathbf j$. At $t=0$, $\mathbf r=5\mathbf i$. Find $\mathbf r(t)$ and the time when the particle crosses the $x$-axis.`,
      ),
      p(
        raw`2. $\mathbf a=(4\mathbf i-2\mathbf j)\text{ m s}^{-2}$ with $\mathbf u=(-6\mathbf i+8\mathbf j)\text{ m s}^{-1}$. Find when the particle moves parallel to $\mathbf j$.`,
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(
          raw`1. Integrating: $\mathbf r=(t^2+C_1)\mathbf i+(3t-\frac{t^2}{2}+C_2)\mathbf j$. With $\mathbf r(0)=5\mathbf i$: $C_1=5$, $C_2=0$.`,
        ),
        m(
          raw`\mathbf r=(t^2+5)\mathbf i+\left(3t-\frac{t^2}{2}\right)\mathbf j.`,
        ),
        p(
          raw`Crosses $x$-axis when $\mathbf j$-component $=0$: $t(3-t/2)=0\implies t=6$ s (taking $t>0$).`,
        ),
      ]),
      example([
        p(
          raw`2. $\mathbf v=(-6+4t)\mathbf i+(8-2t)\mathbf j$. Parallel to $\mathbf j$: $\mathbf i$-component $=0$. $-6+4t=0\implies t=1.5$ s.`,
        ),
      ]),
    ]),
  ]),
  lesson("9.2 Constant Acceleration in Vector Form", [
    group("Using SUVAT with Vectors", [
      p(raw`When acceleration $\mathbf a$ is constant:`),
      m(
        raw`\mathbf v=\mathbf u+\mathbf at,\qquad\mathbf r=\mathbf r_0+\mathbf ut+\frac12\mathbf at^2`,
      ),
      p(
        raw`These apply component-wise: i.e., each equation holds for the $\mathbf i$ and $\mathbf j$ components separately.`,
      ),
    ]),
    group("Worked Example 3", [
      p(
        raw`At $t=0$ a particle is at $\mathbf r_0=(2\mathbf i-3\mathbf j)$ m with velocity $\mathbf u=(\mathbf i+4\mathbf j)\text{ m s}^{-1}$. It has constant acceleration $\mathbf a=(2\mathbf i-\mathbf j)\text{ m s}^{-2}$. Find the position and velocity at $t=3$.`,
      ),
      m(
        raw`\mathbf v(3)=(\mathbf i+4\mathbf j)+3(2\mathbf i-\mathbf j)=7\mathbf i+\mathbf j\text{ m s}^{-1}.`,
      ),
      m(
        raw`\begin{aligned}\mathbf r(3)&=(2\mathbf i-3\mathbf j)+3(\mathbf i+4\mathbf j)+\frac92(2\mathbf i-\mathbf j)\\&=2\mathbf i-3\mathbf j+3\mathbf i+12\mathbf j+9\mathbf i-4.5\mathbf j=14\mathbf i+4.5\mathbf j\text{ m}.\end{aligned}`,
      ),
      {
        type: "diagram",
        description:
          "Position vectors on i–j axes: r₀ points from the origin to the start (2,−3); r(3) points from the origin to (14,4.5), labelled t=3. These arrows show positions, not the trajectory between them.",
        drawing: {
          type: "vectors",
          xRange: [-1, 18],
          yRange: [-5, 7],
          xLabel: raw`\mathbf i`,
          yLabel: raw`\mathbf j`,
          vectors: [
            {
              x: 2,
              y: -3,
              label: raw`\mathbf r_0`,
              endpointLabel: raw`\text{start }(2,-3)`,
              labelDx: 38,
              labelDy: 16,
            },
            {
              x: 14,
              y: 4.5,
              label: raw`\mathbf r(3)`,
              endpointLabel: "t=3:(14,4.5)",
              labelDx: 0,
              labelDy: -32,
            },
          ],
        },
      },
    ]),
    group("Practice Questions", [
      p(
        raw`1. Constant $\mathbf a=(2.4\mathbf i+\mathbf j)$. $\mathbf u=(-16\mathbf i-3\mathbf j)$, $\mathbf r_0=(44\mathbf i-10\mathbf j)$. (a) Find speed at $t=5$. (b) Find $T>5$ when position is $(4\mathbf i+c\mathbf j)$.`,
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(
          raw`1. (a) $\mathbf v(5)=(-16+12)\mathbf i+(-3+5)\mathbf j=-4\mathbf i+2\mathbf j$. Speed $=\sqrt{16+4}=2\sqrt5\approx4.47\text{ m s}^{-1}$.`,
        ),
        p(
          raw`(b) $\mathbf i$-component: $44-16T+1.2T^2=4\implies1.2T^2-16T+40=0\implies3T^2-40T+100=0$.`,
        ),
        m(
          raw`T=\frac{40\pm\sqrt{1600-1200}}{6}=\frac{40\pm20}{6}.\qquad T=10\text{ or }T=10/3.`,
        ),
        p("Since $T>5$: $T=10$ s. $c=-10-30+50=10$."),
      ]),
    ]),
  ]),
];
