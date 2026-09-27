import { nativeLesson, transcript } from "./authoring.ts";
import { horizontalForces, suspendedForces } from "./mechanics-scenes.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (
  title: string,
  source: string,
  diagrams: Record<string, LessonBlock>,
) =>
  nativeLesson(
    "Mechanics",
    "Chapter 8: Applications of Forces",
    title,
    transcript(source, diagrams),
  );
export const MECHANICS_APPLIED_FORCE_LESSONS = [
  lesson(
    "8.1 Forces in Two Dimensions",
    raw`
## Key Principles

Resolving: A force $F$ at angle $\theta$ to the horizontal has components $F\cos\theta$ (horizontal) and $F\sin\theta$ (vertical).

Equilibrium in 2D: Sum of horizontal components $=0$ and sum of vertical components $=0$.

Newton’s 2nd law in 2D: $\mathbf F=m\mathbf a$ applied separately in each direction.

Direction of motion: For resultant $\mathbf F=p\mathbf i+q\mathbf j$, angle from $\mathbf i$ is $\arctan(q/p)$.

## Worked Example 1

A particle $P$ of mass 4 kg is at rest. At $t=0$, forces $\mathbf F_1=(4\mathbf i-\mathbf j)$ N and $\mathbf F_2=(\lambda\mathbf i+\mu\mathbf j)$ N are applied. $P$ begins to move in the direction $(3\mathbf i+\mathbf j)$. Show $\lambda-3\mu+7=0$.

Resultant: $\mathbf F_{\rm res}=(4+\lambda)\mathbf i+(-1+\mu)\mathbf j$.

For motion in direction $(3\mathbf i+\mathbf j)$, the resultant must be parallel to $(3,1)$:

$$\frac{4+\lambda}3=\frac{-1+\mu}1\implies4+\lambda=-3+3\mu\implies\lambda-3\mu+7=0$$

@diagram resultant

## Worked Example 2

A 2 kg particle hangs in equilibrium from two strings attached to a ceiling. One string makes $30^\circ$ with the vertical, the other $60^\circ$. Find both tensions.

@diagram suspended

Horizontal: $T_1\sin30^\circ=T_2\sin60^\circ\implies T_1=T_2\sqrt3$.

Vertical: $T_1\cos30^\circ+T_2\cos60^\circ=2g$.

Substituting: $T_2\sqrt3\cdot\frac{\sqrt3}2+T_2\cdot\frac12=2g\implies2T_2=19.6$.

$T_2=9.8$ N. $T_1=9.8\sqrt3\approx17.0$ N.

## Practice Questions

1. Forces $(3\mathbf i+5\mathbf j)$ N and $(-\mathbf i+2\mathbf j)$ N act on a 2 kg particle. Find the acceleration vector and its magnitude.

2. A particle is in equilibrium under $\mathbf F_1=(a\mathbf i+3\mathbf j)$, $\mathbf F_2=(-2\mathbf i+b\mathbf j)$ and $\mathbf F_3=(4\mathbf i-5\mathbf j)$. Find $a$ and $b$.

3. An 8 kg block on a rough horizontal surface ($\mu=0.3$) is pulled by a 40 N force at $30^\circ$ above the horizontal. Find the acceleration.

## Practice Solutions

1. Resultant $\mathbf F=(2\mathbf i+7\mathbf j)$ N. $\mathbf a=\mathbf F/m=(\mathbf i+3.5\mathbf j)\text{ m s}^{-2}$.

$|\mathbf a|=\sqrt{1+12.25}=\sqrt{13.25}\approx3.64\text{ m s}^{-2}$.

2. $\mathbf i$: $a-2+4=0\implies a=-2$. $\mathbf j$: $3+b-5=0\implies b=2$.

3. 8 kg on rough horizontal, $\mu=0.3$, pulled 40 N at $30^\circ$.

@diagram pull

Vertically: $R+40\sin30^\circ=8g\implies R=78.4-20=58.4$ N. Friction $=0.3(58.4)=17.5$ N.

Horizontally: $40\cos30^\circ-17.5=8a\implies34.64-17.5=8a\implies a=2.14\text{ m s}^{-2}$.
`,
    {
      resultant: {
        type: "diagram",
        description:
          "The source schematic shows F1 pointing right and down, F2 pointing right and up and the resultant pointing right and up parallel to 3i+j. No unique values of lambda and mu are specified.",
        drawing: {
          type: "vectors",
          xRange: [-1, 8],
          yRange: [-2, 6],
          xLabel: raw`\mathbf i`,
          yLabel: raw`\mathbf j`,
          vectors: [
            { x: 4, y: -1, label: raw`\mathbf F_1` },
            { x: 2, y: 3, label: raw`\mathbf F_2` },
            {
              x: 6,
              y: 2,
              label: raw`\mathbf F_{\rm res}\propto(3\mathbf i+\mathbf j)`,
              dashed: true,
            },
          ],
        },
      },
      suspended: suspendedForces(),
      pull: horizontalForces(
        raw`8\text{ kg}`,
        "8g",
        raw`40\text{ N}`,
        30,
        raw`\mu R`,
      ),
    },
  ),
  lesson(
    "8.2 Vector Kinematics with Forces",
    raw`
## Vector Form of F = ma

If constant force $\mathbf F$ acts on a particle of mass $m$:

$$\mathbf a=\frac{\mathbf F}m$$

Then using $\mathbf v=\mathbf u+\mathbf at$ and $\mathbf r=\mathbf r_0+\mathbf ut+\frac12\mathbf at^2$.

Speed: $|\mathbf v|=\sqrt{v_x^2+v_y^2}$.

@diagram process

## Worked Example 3

A 4 kg particle at rest experiences resultant force $(6\mathbf i+8\mathbf j)$ N. Find the acceleration, speed after 5 s, and direction of motion.

$|\mathbf F|=\sqrt{36+64}=10$ N. $\mathbf a=\frac14(6\mathbf i+8\mathbf j)=1.5\mathbf i+2\mathbf j$. $|\mathbf a|=2.5\text{ m s}^{-2}$.

$\mathbf v(5)=5(1.5\mathbf i+2\mathbf j)=7.5\mathbf i+10\mathbf j$. $|\mathbf v|=12.5\text{ m s}^{-1}$.

Direction: $\theta=\arctan(10/7.5)=53.1^\circ$ above $\mathbf i$.

@diagram vector

## Practice Questions

1. A 3 kg particle has initial velocity $(4\mathbf i+2\mathbf j)\text{ m s}^{-1}$. After 3 s it has velocity $(10\mathbf i-\mathbf j)\text{ m s}^{-1}$. Find the constant force acting.

2. A particle has position $(4\mathbf i-\mathbf j)$ m and velocity $(3\mathbf i+2\mathbf j)\text{ m s}^{-1}$ at $t=0$. A constant force $(4\mathbf i+6\mathbf j)$ N acts on it, given mass 2 kg. Find position at $t=2$.

## Practice Solutions

1. $\mathbf a=\frac{(10-4)\mathbf i+(-1-2)\mathbf j}3=2\mathbf i-\mathbf j$. $\mathbf F=3(2\mathbf i-\mathbf j)=(6\mathbf i-3\mathbf j)$ N.

2. $\mathbf a=\mathbf F/m=(2\mathbf i+3\mathbf j)$. $\mathbf r(2)=\mathbf r_0+2\mathbf u+\frac12(2)^2\mathbf a$.

$=(4\mathbf i-\mathbf j)+(6\mathbf i+4\mathbf j)+(4\mathbf i+6\mathbf j)=(14\mathbf i+9\mathbf j)$ m.
`,
    {
      process: {
        type: "diagram",
        description:
          "A mechanics modelling chain showing how the resultant force and mass determine acceleration, which then updates velocity and position component by component.",
        drawing: {
          type: "scene",
          lines: [
            { from: [92, 125], to: [138, 125], arrow: true },
            { from: [202, 125], to: [248, 125], arrow: true },
            { from: [312, 125], to: [360, 125], arrow: true },
          ],
          rects: [
            { x: 18, y: 94, width: 74, height: 62 },
            { x: 138, y: 94, width: 64, height: 62 },
            { x: 248, y: 94, width: 64, height: 62 },
            { x: 360, y: 94, width: 28, height: 62 },
          ],
          labels: [
            { x: 55, y: 105, text: raw`\mathbf F,m`, width: 62 },
            { x: 170, y: 105, text: raw`\mathbf a`, width: 38 },
            { x: 280, y: 105, text: raw`\mathbf v`, width: 38 },
            { x: 374, y: 105, text: raw`\mathbf r`, width: 28 },
            { x: 115, y: 78, text: raw`\div m`, width: 46 },
            { x: 225, y: 78, text: raw`\times t`, width: 46 },
            { x: 336, y: 78, text: raw`\times t`, width: 46 },
          ],
          caption: [
            raw`\mathbf a=\mathbf F/m`,
            raw`\mathbf v=\mathbf u+\mathbf at`,
          ],
        },
      },
      vector: {
        type: "diagram",
        description:
          "A force vector F has horizontal component 6 and vertical component 8, at angle theta above the i-axis.",
        drawing: {
          type: "vectors",
          xRange: [-1, 8],
          yRange: [-1, 10],
          xLabel: raw`\mathbf i`,
          yLabel: raw`\mathbf j`,
          vectors: [
            {
              x: 6,
              y: 8,
              label: raw`\mathbf F=6\mathbf i+8\mathbf j`,
              endpointLabel: raw`\theta=\arctan(8/6)`,
              labelDx: 0,
              labelDy: -35,
            },
          ],
        },
      },
    },
  ),
];
