import { nativeLesson, transcript } from "./authoring.ts";
import { horizontalRod, angledRod } from "./mechanics-scenes.ts";
const raw = String.raw;
export const MECHANICS_MOMENTS_LESSON = nativeLesson(
  "Mechanics",
  "Chapter 5: Moments",
  "5.1 Moments and the Principle of Moments",
  transcript(
    raw`
## Moment of a Force

Moment $=F\times d$, where $d$ is the perpendicular distance from the pivot to the line of action of the force.

If a force $F$ acts at angle $\theta$ to a rod of length $r$: Moment $=Fr\sin\theta$.

Principle of Moments: For a body in equilibrium, the sum of clockwise moments about any point equals the sum of anticlockwise moments.

Conditions for equilibrium: (1) Resultant force $=0$. (2) Resultant moment about any point $=0$.

For a uniform rod, weight acts at the midpoint.

A uniform rod resting horizontally on two supports:

@diagram generic

## Worked Example 1

A uniform beam $AB$ of mass 40 kg and length 6 m rests horizontally on supports. The supports are at points 1 m and 5 m from $A$. A child of mass 30 kg sits at $B$. Find the reactions at the two supports.

@diagram beam

Moments about the support at 1 m (to eliminate $R_1$):

$$R_2(4)=40g(2)+30g(5)=80g+150g=230g$$

$$R_2=57.5g=563.5\text{ N}$$

Resolving vertically:

$$R_1+R_2=40g+30g=70g\implies R_1=70g-57.5g=12.5g=122.5\text{ N}$$

## Worked Example 2

A uniform rod $AB$ of mass $M$ and length $2a$ has end $A$ on rough horizontal ground. It is held at angle $\theta$ to the ground by a light string attached at $B$, perpendicular to the rod. A particle of mass $2M$ is attached at $C$, where $AC=1.5a$. Show that $T=2Mg\cos\theta$.

@diagram tension

Take moments about $A$ (eliminates unknown reaction $R$ and friction $F$).

The weight $Mg$ acts at the midpoint, at horizontal distance $a\cos\theta$ from $A$.

The weight $2Mg$ acts at $C$, at horizontal distance $1.5a\cos\theta$ from $A$.

The tension $T$ acts perpendicular to the rod at $B$, at distance $2a$ along the rod from $A$.

$$T(2a)=Mg(a\cos\theta)+2Mg(1.5a\cos\theta)$$

$$2aT=Mga\cos\theta+3Mga\cos\theta=4Mga\cos\theta$$

$$T=2Mg\cos\theta$$

## Worked Example 3

A uniform rod $AB$ of mass $M$ and length $2a$ rests with end $A$ on rough ground and end $B$ against a smooth vertical wall at angle $\theta$ to the ground. Show that the reaction at the wall is $\frac12Mg\cot\theta$.

@diagram wall

Take moments about $A$:

The weight $Mg$ acts vertically at the midpoint, perpendicular distance $a\cos\theta$ from $A$.

The wall reaction $S$ acts horizontally at $B$, perpendicular distance $2a\sin\theta$ from $A$.

$$S(2a\sin\theta)=Mg(a\cos\theta)$$

$$S=\frac{Mg\cos\theta}{2\sin\theta}=\frac12Mg\cot\theta$$

## Practice Questions

1. A light rod $AB$ of length 3 m has a 5 kg mass at $A$ and a 3 kg mass at $B$. It rests on a single support. Find the distance of the support from $A$ for equilibrium.

2. A non-uniform rod of mass 8 kg and length 3 m has its centre of mass 1 m from $A$. It is suspended horizontally by vertical strings at $A$ and $B$. Find the tensions.

3. A uniform ladder of mass 25 kg and length 6 m rests against a smooth vertical wall at $60^\circ$ to the ground. Find the reaction at the wall, the friction at the ground, and the normal reaction at the ground.

## Practice Solutions

1. Light rod, masses 5 kg at $A$ and 3 kg at $B$, length 3 m.

@diagram support

Moments about support: $5g\cdot d=3g(3-d)$, so $5d=9-3d\implies d=1.125$ m from $A$.

2. Non-uniform rod: 8 kg, 3 m, CoM 1 m from $A$.

@diagram nonuniform

Moments about $A$: $T_B(3)=8g(1)\implies T_B=\frac{8g}3=26.1$ N.

Vertically: $T_A+T_B=8g\implies T_A=78.4-26.1=52.3$ N.

3. Ladder 25 kg, 6 m, smooth wall, ground, angle $60^\circ$.

@diagram ladder

Moments about $A$: $S(6\sin60^\circ)=25g(3\cos60^\circ)$.

$$S=\frac{25g\cdot3\cdot0.5}{6\cdot\frac{\sqrt3}2}=\frac{37.5g}{3\sqrt3}=\frac{12.5g}{\sqrt3}=70.7\text{ N}$$

Horizontally: $F=S=70.7$ N. Vertically: $R=25g=245$ N.
`,
    {
      generic: horizontalRod(
        2,
        [
          { at: 0, label: "R_A", up: true },
          { at: 2, label: "R_B", up: true },
          { at: 1, label: "Mg" },
        ],
        [raw`\text{half length}`, raw`\text{full length}`],
      ),
      beam: horizontalRod(
        6,
        [
          { at: 1, label: "R_1", up: true },
          { at: 5, label: "R_2", up: true },
          { at: 3, label: "40g" },
          { at: 6, label: "30g" },
        ],
        [raw`1\text{ m},\;2\text{ m},\;2\text{ m},\;1\text{ m}`],
      ),
      tension: angledRod("Mg", 30, raw`\theta`, false, "2Mg"),
      wall: angledRod("Mg", 50, raw`\theta`),
      support: horizontalRod(
        3,
        [
          { at: 0, label: "5g" },
          { at: 3, label: "3g" },
          { at: 1.125, label: "R", up: true },
        ],
        ["d", "3-d"],
      ),
      nonuniform: horizontalRod(
        3,
        [
          { at: 0, label: "T_A", up: true },
          { at: 3, label: "T_B", up: true },
          { at: 1, label: "8g" },
        ],
        [raw`1\text{ m}`, raw`2\text{ m}`],
      ),
      ladder: angledRod("25g", 60, raw`60^\circ`),
    },
  ),
);
