import { nativeLesson, p, m, group, example } from "./authoring.ts";
import type { LessonBlock, LessonDrawing } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson("Mechanics", "Chapter 4: Variable Acceleration", title, blocks);
const graph = (description: string, drawing: LessonDrawing): LessonBlock => ({
  type: "diagram",
  description,
  drawing,
});
export const MECHANICS_CALCULUS_LESSONS = [
  lesson("4.1 Calculus for Variable Acceleration", [
    group("The Calculus Relationships", [
      p(
        "For motion in a straight line with displacement $s$, velocity $v$ and acceleration $a$ as functions of time $t$:",
      ),
      m(raw`v=\frac{ds}{dt}\qquad a=\frac{dv}{dt}=\frac{d^2s}{dt^2}`),
      m(raw`s=\int v\,dt\qquad v=\int a\,dt`),
      p("Constants of integration are determined from initial conditions."),
      p(raw`At rest: $v=0$. Maximum velocity: $a=\frac{dv}{dt}=0$.`),
      p(
        "Distance travelled from $t_1$ to $t_2$: if $v$ changes sign, split the integral at the roots of $v$.",
      ),
    ]),
    group("Worked Example 1", [
      p(
        raw`A particle moves in a straight line with velocity $v=3t^2-12t+9\text{ m s}^{-1}$ at time $t$.`,
      ),
      p("(a) Find when the particle is at rest."),
      p("(b) Find the acceleration at $t=5$."),
      p("(c) Find the distance travelled from $t=0$ to $t=4$."),
      p(
        raw`(a) At rest: $v=0$. $3t^2-12t+9=0\implies t^2-4t+3=0\implies(t-1)(t-3)=0$.`,
      ),
      p("$t=1$ s and $t=3$ s."),
      graph(
        "Velocity–time parabola v=3t²−12t+9: intercept (0,9), zeros at t=1 and t=3, minimum (2,−3). Velocity is negative between the two roots.",
        {
          type: "polynomial",
          coefficients: [9, -12, 3],
          domain: [0, 4],
          xRange: [0, 4.7],
          yRange: [-5, 12],
          xLabel: "t",
          yLabel: "v",
          labels: [
            { x: 0, y: 9, text: "9", dx: -24, dy: -8 },
            { x: 1, y: 0, text: "t=1", dx: 0, dy: 38 },
            { x: 3, y: 0, text: "t=3", dx: 0, dy: 38 },
            { x: 0, y: -3, text: "-3", dx: -24, dy: -8 },
            { x: 2, y: 0, text: "2", dx: 0, dy: -29 },
          ],
        },
      ),
      p(raw`(b) $a=\frac{dv}{dt}=6t-12$. At $t=5$: $a=18\text{ m s}^{-2}$.`),
      p("(c) $v<0$ on $(1,3)$, so split the integral:"),
      m(raw`s=\int_0^1v\,dt+\left|\int_1^3v\,dt\right|+\int_3^4v\,dt.`),
      m(raw`\int(3t^2-12t+9)\,dt=t^3-6t^2+9t.`),
      p(raw`From 0 to 1: $[t^3-6t^2+9t]_0^1=4$.`),
      p(
        raw`From 1 to 3: $[t^3-6t^2+9t]_1^3=0-4=-4$. $\Rightarrow$ distance $=4$.`,
      ),
      p(raw`From 3 to 4: $[t^3-6t^2+9t]_3^4=4-0=4$.`),
      p("Total distance $=4+4+4=12$ m."),
    ]),
    group("Worked Example 2", [
      p(
        raw`A particle has acceleration $a=(4t-6)\text{ m s}^{-2}$. At $t=0$ it is at rest at the origin. Find the velocity and displacement at $t=4$.`,
      ),
      p(
        raw`$v=\int(4t-6)\,dt=2t^2-6t+C$. At $t=0$, $v=0$: $C=0$. So $v=2t^2-6t$.`,
      ),
      p(
        raw`$s=\int(2t^2-6t)\,dt=\frac{2t^3}{3}-3t^2+D$. At $t=0$, $s=0$: $D=0$.`,
      ),
      p(
        raw`At $t=4$: $v=32-24=8\text{ m s}^{-1}$. $s=\frac{128}{3}-48=-\frac{16}{3}\approx-5.33\text{ m}$.`,
      ),
      graph(
        "Velocity–time graph v=2t²−6t, passing through the origin and t=3, with labelled point (4,8). The curve is below the time axis for 0<t<3.",
        {
          type: "polynomial",
          coefficients: [0, -6, 2],
          domain: [0, 4],
          xRange: [0, 4.8],
          yRange: [-7, 13],
          xLabel: "t",
          yLabel: "v",
          labels: [
            { x: 0, y: 0, text: "0", dx: -22, dy: 12 },
            { x: 3, y: 0, text: "3", dx: 15, dy: 14 },
            { x: 4, y: 8, text: "(4,8)", dx: -27, dy: -33 },
          ],
        },
      ),
    ]),
    group("Practice Questions", [
      p(
        "1. A particle has velocity $v=6t^2-18t+12$. (a) Find when at rest. (b) Find total distance from $t=0$ to $t=3$.",
      ),
      p(
        "2. A particle has acceleration $a=6t-4$. At $t=0$, $v=1$, $s=0$. Find $s$ at $t=3$.",
      ),
      p(
        "3. A particle moves with $a=6-2t$. At $t=0$, $v=0$. Find maximum velocity.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p("1. $v=6t^2-18t+12=6(t-1)(t-2)$. At rest: $t=1,2$."),
        graph(
          "Velocity–time parabola v=6t²−18t+12 with vertical intercept 12 and time intercepts 1 and 2. The curve lies below the time axis between 1 and 2.",
          {
            type: "polynomial",
            coefficients: [12, -18, 6],
            domain: [0, 3],
            xRange: [0, 3.5],
            yRange: [-4, 16],
            xLabel: "t",
            yLabel: "v",
            labels: [
              { x: 0, y: 12, text: "12", dx: -25, dy: -8 },
              { x: 1, y: 0, text: "1", dx: -9, dy: -45 },
              { x: 2, y: 0, text: "2", dx: 14, dy: 13 },
            ],
          },
        ),
        p(raw`(b) $\int v\,dt=2t^3-9t^2+12t$.`),
        p(
          "$[0,1]$: $5-0=5$. $[1,2]$: $4-5=-1$, so distance $=1$. $[2,3]$: $9-4=5$.",
        ),
        p("Total distance $=5+1+5=11$ m."),
      ]),
      example([
        p(
          raw`2. $v=\int(6t-4)\,dt=3t^2-4t+C$. At $t=0$, $v=1\Rightarrow C=1$. So $v=3t^2-4t+1$.`,
        ),
        p(raw`$s=\int v\,dt=t^3-2t^2+t+D$. At $t=0$, $s=0\Rightarrow D=0$.`),
        p("At $t=3$: $s=27-18+3=12$ m."),
      ]),
      example([
        p(
          raw`3. $v=\int(6-2t)\,dt=6t-t^2+C$. At $t=0$, $v=0\Rightarrow C=0$. So $v=6t-t^2$.`,
        ),
        p(
          raw`Max velocity: $\frac{dv}{dt}=6-2t=0\implies t=3$. $v_{\max}=18-9=9\text{ m s}^{-1}$.`,
        ),
      ]),
    ]),
  ]),
  lesson("4.2 Differentiating Position", [
    group("From displacement to velocity to acceleration", [
      p("Given $s(t)$:"),
      m(raw`v(t)=\frac{ds}{dt},\qquad a(t)=\frac{d^2s}{dt^2}`),
      p("Stationary points of $s$: $v=0$. Inflection in $s$: $a=0$."),
      graph(
        "A derivative ladder from displacement s(t), through velocity v(t), to acceleration a(t), showing that each downward step differentiates with respect to time.",
        {
          type: "scene",
          lines: [
            { from: [125, 70], to: [200, 112], arrow: true },
            { from: [200, 138], to: [275, 180], arrow: true },
          ],
          circles: [
            { x: 105, y: 58, r: 35 },
            { x: 200, y: 125, r: 35 },
            { x: 295, y: 192, r: 35 },
          ],
          labels: [
            { x: 105, y: 47, text: raw`s(t)`, width: 48 },
            { x: 200, y: 114, text: raw`v(t)`, width: 48 },
            { x: 295, y: 181, text: raw`a(t)`, width: 48 },
            { x: 160, y: 35, text: raw`d/dt`, width: 48 },
            { x: 280, y: 112, text: raw`d/dt`, width: 48 },
          ],
          caption: [raw`v=s'`, raw`a=v'=s''`],
        },
      ),
    ]),
    group("Worked Example 3", [
      p("A particle moves with displacement $s=t^3-9t^2+24t$ from origin."),
      p(
        "(a) Find $v$ and $a$. (b) Find when the particle is momentarily at rest. (c) Find the displacement when acceleration is zero.",
      ),
      p("(a) $v=3t^2-18t+24=3(t-2)(t-4)$. $a=6t-18$."),
      p(raw`(b) $v=0\implies t=2$ or $t=4$.`),
      p(raw`(c) $a=0\implies t=3$. $s(3)=27-81+72=18$ m.`),
      graph(
        "Displacement–time cubic s=t³−9t²+24t, with a local maximum at t=2, a local minimum at t=4, and an inflection at t=3. Vertical guides mark t=2,3,4.",
        {
          type: "polynomial",
          coefficients: [0, 24, -9, 1],
          domain: [0, 5],
          xRange: [0, 5.6],
          yRange: [-5, 30],
          xLabel: "t",
          yLabel: "s",
          labels: [
            { x: 2, y: 20, text: "t=2", dx: -6, dy: -30, guide: true },
            { x: 4, y: 16, text: "t=4", dx: 38, dy: 15, guide: true },
            { x: 3, y: 18, text: "t=3", dx: 0, dy: 97, guide: true },
          ],
        },
      ),
    ]),
    group("Practice Questions", [
      p("1. $s=t^3-4t^2+3t$. Find when at rest and $s$ at those times."),
      p("2. $s=3t^2-t^3$. Find maximum displacement."),
    ]),
    group("Practice Solutions", [
      example([
        p(
          raw`1. $v=3t^2-8t+3=0\implies t=\frac{8\pm\sqrt{64-36}}{6}=\frac{8\pm\sqrt{28}}{6}\approx0.451,2.22\text{ s}$.`,
        ),
        p("$s(0.451)=0.092-0.814+1.353=0.631$ m."),
        p("$s(2.22)=10.94-19.71+6.66=-2.11$ m."),
      ]),
      example([
        p(
          "2. $v=6t-3t^2=3t(2-t)$. At rest: $t=0,2$. Max at $t=2$: $s=12-8=4$ m.",
        ),
      ]),
    ]),
  ]),
];
