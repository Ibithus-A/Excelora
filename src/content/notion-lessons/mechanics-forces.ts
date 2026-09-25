import { nativeLesson, transcript } from "./authoring.ts";
import {
  horizontalForces,
  inclineForces,
  pulleyDiagram,
  liftDiagram,
} from "./mechanics-scenes.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (
  title: string,
  source: string,
  diagrams: Record<string, LessonBlock>,
) =>
  nativeLesson(
    "Mechanics",
    "Chapter 3: Forces and Motion",
    title,
    transcript(source, diagrams),
  );
export const MECHANICS_FORCES_LESSONS = [
  lesson(
    "3.1 Newton's Laws and Force Diagrams",
    raw`
## Newton’s Three Laws

First Law: A body remains at rest or moves with constant velocity unless acted upon by a resultant force.

Second Law: $\mathbf F=m\mathbf a$. Third Law: Action and reaction are equal and opposite.

Weight: $W=mg$ acting vertically downward, $g=9.8\text{ m s}^{-2}$.

Standard method: (1) Draw a clear force diagram. (2) Resolve in two perpendicular directions. (3) Apply $F=ma$ in each direction. (4) Solve.

A typical body on a rough horizontal surface has four forces:

@diagram generic

On a smooth surface, friction is zero. On a rough surface, $F\leqslant\mu R$ (with equality when sliding or in limiting equilibrium).

## Worked Example 1

A box of mass 5 kg is pushed along a smooth horizontal surface by a horizontal force of 20 N. Find the acceleration.

@diagram smooth

Resolving vertically: $R=5g=49$ N.

Resolving horizontally (smooth, so no friction):

$$F=ma\implies20=5a\implies a=4\text{ m s}^{-2}$$

## Worked Example 2

A particle of mass 3 kg on a smooth horizontal surface is pulled by a string at $30^\circ$ above the horizontal with tension 15 N. Find the acceleration and normal reaction.

@diagram pull

Resolve horizontally:

$$15\cos30^\circ=3a\implies a=\frac{15(\sqrt3/2)}3=2.5\sqrt3\approx4.33\text{ m s}^{-2}$$

Resolve vertically:

$$R+15\sin30^\circ=3g\implies R=29.4-7.5=21.9\text{ N}$$

Note: the upward pull reduces the normal reaction below $mg$.

## Practice Questions

1. A 10 kg crate is pushed by a force of 40 N at $20^\circ$ below the horizontal on a smooth floor. Draw a force diagram and find the acceleration and normal reaction.

2. A 2 kg particle on a smooth surface is pulled by a string at $45^\circ$ with tension 10 N. Find the acceleration.

3. A car of mass 1200 kg has driving force 3000 N and resistance 800 N. Find the acceleration.

## Practice Solutions

1. 10 kg crate, 40 N at $20^\circ$ below horizontal, smooth floor.

@diagram push

Horizontally: $40\cos20^\circ=10a\implies a=3.76\text{ m s}^{-2}$.

Vertically: $R=10g+40\sin20^\circ=98+13.68=111.7$ N.

2. 2 kg particle, string at $45^\circ$, tension 10 N.

@diagram pull45

$a=\frac{10\cos45^\circ}2=\frac{5\sqrt2}2\approx3.54\text{ m s}^{-2}$.

$R=2g-10\sin45^\circ=19.6-7.07=12.5$ N.

3. Car 1200 kg, driving 3000 N, resistance 800 N.

@diagram car

$F=ma$: $3000-800=1200a\implies a=1.83\text{ m s}^{-2}$.
`,
    {
      generic: horizontalForces(
        "m",
        "mg",
        raw`P\text{ (applied)}`,
        0,
        raw`F\text{ (friction)}`,
        "a",
      ),
      smooth: horizontalForces(
        raw`5\text{ kg}`,
        raw`5g=49\text{ N}`,
        raw`20\text{ N}`,
        0,
        undefined,
        "a",
        "smooth",
      ),
      pull: horizontalForces(raw`3\text{ kg}`, "3g", raw`15\text{ N}`, 30),
      push: horizontalForces(raw`10\text{ kg}`, "10g", raw`40\text{ N}`, -20),
      pull45: horizontalForces(raw`2\text{ kg}`, "2g", raw`10\text{ N}`, 45),
      car: {
        type: "diagram",
        description:
          "A car of mass 1200 kg has a 3000 N driving force to the right and 800 N resistance to the left.",
        drawing: {
          type: "scene",
          lines: [
            { from: [240, 130], to: [350, 130], arrow: true },
            { from: [160, 130], to: [50, 130], arrow: true },
          ],
          rects: [{ x: 160, y: 105, width: 80, height: 50 }],
          labels: [
            { x: 200, y: 122, text: raw`1200\text{ kg}`, width: 75 },
            { x: 300, y: 100, text: raw`3000\text{ N}`, width: 80 },
            { x: 95, y: 100, text: raw`800\text{ N}`, width: 70 },
          ],
          caption: [raw`\text{Car}`],
        },
      },
    },
  ),
  lesson(
    "3.2 Connected Particles and Pulleys",
    raw`
## Connected Particles — Key Assumptions

Light inextensible string: Tension is constant throughout; particles share the same $|a|$.

Smooth pulley: Tension is equal on both sides.

Method: Draw separate force diagrams for each particle. Apply $F=ma$ to each. Add or solve simultaneously.

## Worked Example 3

Two particles $A$ (5 kg) and $B$ (3 kg) are connected by a light inextensible string over a smooth pulley. The system is released from rest. Find the acceleration and tension.

@diagram hanging

For $A$ (taking down positive since $A$ is heavier):

$$5g-T=5a\quad\text{so }49-T=5a\quad(1)$$

For $B$ (taking up positive):

$$T-3g=3a\quad\text{so }T-29.4=3a\quad(2)$$

Adding (1) and (2):

$$49-29.4=8a\implies19.6=8a\implies a=2.45\text{ m s}^{-2}$$

Substituting into (2):

$$T=3(2.45)+29.4=36.75\text{ N}$$

## Worked Example 4

A particle $A$ (3 kg) is on a smooth horizontal table. A light string connects it over a smooth pulley at the edge of the table to a particle $B$ (2 kg) hanging freely. Find the acceleration and tension.

@diagram table

For $A$ (horizontal, smooth): $T=3a$ (1)

For $B$ (vertical, moving down):

$$2g-T=2a\implies19.6-T=2a\quad(2)$$

Substituting (1) into (2): $19.6-3a=2a\implies19.6=5a$.

$a=3.92\text{ m s}^{-2}$. $T=3(3.92)=11.76$ N.

## Practice Questions

1. Two particles 4 kg and 6 kg are connected over a smooth pulley. Find the acceleration, tension, and force on the pulley.

2. A 3 kg block on a smooth table is connected via a pulley to a 5 kg hanging block. If the 5 kg block starts 2 m above the ground, find the speed when it hits the ground.

3. A lift of mass 500 kg carries a passenger of mass 70 kg. The lift accelerates upward at $2\text{ m s}^{-2}$. Find the cable tension and the reaction on the passenger.

## Practice Solutions

1. 4 kg and 6 kg over smooth pulley.

@diagram hanging64

For 6 kg: $6g-T=6a$. For 4 kg: $T-4g=4a$. Adding: $2g=10a$, so $a=1.96\text{ m s}^{-2}$.

$T=4(1.96)+4g=47.04$ N. Force on pulley $=2T=94.1$ N.

2. 3 kg on smooth table, 5 kg hanging. Speed after 2 m?

@diagram table35

For 5 kg: $5g-T=5a$. For 3 kg: $T=3a$. Adding: $5g=8a\implies a=6.125\text{ m s}^{-2}$.

Using $v^2=u^2+2as$: $v^2=2(6.125)(2)=24.5$, so $v=4.95\text{ m s}^{-1}$.

3. Lift (500 kg) and passenger (70 kg), $a=2\text{ m s}^{-2}$ upward.

@diagram lift

Whole system: $T-570g=570(2)\implies T=570(11.8)=6726$ N.

Passenger alone: $R-70g=70(2)\implies R=70(11.8)=826$ N.

The passenger feels heavier because the floor must push up harder to accelerate them.
`,
    {
      hanging: pulleyDiagram(
        raw`A\;5\text{ kg}`,
        raw`B\;3\text{ kg}`,
        raw`49\text{ N}`,
        raw`29.4\text{ N}`,
      ),
      table: pulleyDiagram(
        raw`A\;3\text{ kg}`,
        raw`B\;2\text{ kg}`,
        "3g",
        "2g",
        true,
      ),
      hanging64: pulleyDiagram(raw`6\text{ kg}`, raw`4\text{ kg}`, "6g", "4g"),
      table35: pulleyDiagram(
        raw`3\text{ kg}`,
        raw`5\text{ kg}`,
        "3g",
        "5g",
        true,
        false,
      ),
      lift: liftDiagram(),
    },
  ),
  lesson(
    "3.3 Inclined Planes",
    raw`
On an inclined plane, we resolve parallel and perpendicular to the slope.

@diagram generic

## Inclined Plane Results

Perpendicular: $R=mg\cos\alpha$. Parallel: Weight component down slope $=mg\sin\alpha$.

Friction: $F\leqslant\mu R$, opposing motion or tendency to move.

For remaining at rest: $\mu\geqslant\tan\alpha$.

## Worked Example 5

A 4 kg block is released from rest on a smooth slope at $30^\circ$. Find the acceleration down the slope and the normal reaction.

@diagram smooth

Perpendicular: $R=4g\cos30^\circ=4(9.8)(\sqrt3/2)=33.9$ N.

Parallel (down slope): $4g\sin30^\circ=4a\implies a=g\sin30^\circ=4.9\text{ m s}^{-2}$.

## Worked Example 6

A particle of mass $m$ is released on a rough plane at angle $\alpha$ where $\tan\alpha=\frac5{12}$. Given $\mu<\frac5{12}$, show that $a=\frac g{13}(5-12\mu)$.

@diagram rough

With $\tan\alpha=5/12$: $\sin\alpha=5/13$ and $\cos\alpha=12/13$.

Perpendicular: $R=mg\cos\alpha=\frac{12mg}{13}$.

Parallel (down slope positive):

$$mg\sin\alpha-\mu R=ma$$

$$mg\cdot\frac5{13}-\mu\cdot\frac{12mg}{13}=ma\implies a=\frac g{13}(5-12\mu)$$

## Practice Questions

1. A block slides down a rough slope at constant velocity. The slope is at $20^\circ$. Find $\mu$.

2. A 5 kg block is pushed up a rough slope ($30^\circ$, $\mu=0.2$) by a force parallel to the slope. Find the force needed to maintain constant velocity.

## Practice Solutions

1. Constant velocity $\Rightarrow a=0$ on rough $20^\circ$ slope.

@diagram constant

$mg\sin20^\circ=\mu mg\cos20^\circ\implies\mu=\tan20^\circ=0.364$.

2. 5 kg on $30^\circ$ slope, $\mu=0.2$, force $P$ up slope, constant velocity.

@diagram push

$R=5g\cos30^\circ=42.4$ N. Constant velocity means net force $=0$:

$$P=5g\sin30^\circ+\mu R=24.5+0.2(42.4)=33.0\text{ N}$$

## End of Topic Assessment

15 QUESTIONS

1. A 0.5 kg particle is at rest on a rough horizontal plane with $\mu=\frac27$. A horizontal force $X$ is applied and the particle is in limiting equilibrium. Find $R$ and $X$.

2. A 5 kg particle is pulled along a rough horizontal plane by a horizontal force of 28 N and accelerates at $1.4\text{ m s}^{-2}$. Find the normal reaction, the friction, and $\mu$.

3. Two particles 7 kg and 3 kg are connected by a light string over a smooth pulley. Find the acceleration, tension, and force on the pulley.

4. A 10 kg box is pushed by a 40 N force at $20^\circ$ below the horizontal on a smooth floor. Find the acceleration and normal reaction.

5. A 4 kg block on a smooth horizontal table is connected by a string over a pulley at the edge to a 6 kg hanging mass. Find the acceleration and tension.

6. A lift of mass 500 kg carries a 70 kg passenger and accelerates up at $2\text{ m s}^{-2}$. Find the cable tension and the reaction on the passenger.

7. A block of mass $m$ kg is on a rough surface ($\mu=0.4$). A horizontal force $P=50$ N is applied. If $m=8$ kg, find the acceleration.

8. An 8 kg particle $A$ on a smooth $30^\circ$ slope is connected over a pulley at the top of the slope to a 5 kg particle $B$ hanging vertically. Find the acceleration and tension.

9. A car (800 kg) tows a trailer (400 kg) with a light tow bar. Driving force 3600 N, resistance on car 600 N, on trailer 200 N. Find the acceleration and the tension in the tow bar.

10. A 2 kg particle is suspended from two strings. One makes $30^\circ$ and the other $60^\circ$ with the vertical. Find both tensions.

11. A 3 kg package in a lift: find the normal reaction when (a) constant velocity, (b) accelerating up at $1.5\text{ m s}^{-2}$, (c) decelerating (going up) at $2\text{ m s}^{-2}$.

12. A particle of mass $m$ slides down a smooth plane where $\sin\alpha=\frac35$. Find $a$ and $R$ in terms of $m$ and $g$.

13. Three particles of masses 2, 3 and 5 kg are connected in a line on a smooth surface. A 40 N force pulls the 5 kg mass. Find the acceleration and both string tensions.

14. A particle of mass $m$ rests on a rough slope at angle $\alpha$, on the point of sliding up, held by a force $P$ acting up the slope. Show $P=mg(\sin\alpha+\mu\cos\alpha)$.

15. State Newton’s three laws of motion in your own words.
`,
    {
      generic: inclineForces(
        "m",
        "mg",
        30,
        raw`\alpha`,
        "up",
        undefined,
        undefined,
        true,
      ),
      smooth: inclineForces(
        raw`4\text{ kg}`,
        "4g",
        30,
        raw`30^\circ`,
        undefined,
        undefined,
        "a",
      ),
      rough: inclineForces(
        "m",
        "mg",
        (Math.atan(5 / 12) * 180) / Math.PI,
        raw`\alpha`,
        "up",
        undefined,
        "a",
      ),
      constant: inclineForces(
        "m",
        "mg",
        20,
        raw`20^\circ`,
        "up",
        undefined,
        "v",
      ),
      push: inclineForces(
        raw`5\text{ kg}`,
        "5g",
        30,
        raw`30^\circ`,
        "down",
        "P",
      ),
    },
  ),
];
