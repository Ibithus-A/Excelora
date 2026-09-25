import { nativeLesson, transcript } from "./authoring.ts";
import { inclineForces, slopePulley } from "./mechanics-scenes.ts";
const raw = String.raw;
export const MECHANICS_FRICTION_LESSON = nativeLesson(
  "Mechanics",
  "Chapter 6: Forces and Friction",
  "6.1 Friction on Inclined Planes",
  transcript(
    raw`
## Forces on an Inclined Plane

For a particle on a slope inclined at angle $\alpha$:

Perpendicular to plane: $R=mg\cos\alpha$.

Parallel to plane: Component of weight down slope $=mg\sin\alpha$.

Friction: $F\leqslant\mu R$, opposing motion. $F=\mu R$ when sliding or in limiting equilibrium.

Condition to stay at rest on a rough slope: $\mu\geqslant\tan\alpha$.

The diagram below shows the forces on a block on a rough slope. The weight is vertical; $R$ is perpendicular to the slope; friction acts along the slope opposing motion.

@diagram generic

## Worked Example 1

A particle of mass $m$ on a rough plane at angle $\alpha$ where $\tan\alpha=\frac5{12}$. The coefficient of friction is $\mu<\frac5{12}$. The particle is released from rest. Show that $a=\frac g{13}(5-12\mu)$.

@diagram rough

With $\tan\alpha=5/12$: $\sin\alpha=5/13$, $\cos\alpha=12/13$.

Perpendicular: $R=mg\cos\alpha=\frac{12mg}{13}$.

Parallel (down slope positive):

$$mg\sin\alpha-\mu R=ma\implies\frac{5mg}{13}-\frac{12\mu mg}{13}=ma\implies a=\frac g{13}(5-12\mu)$$

## Worked Example 2

A box of mass 8 kg is pushed up a rough slope at $20^\circ$ by a force $P$ parallel to the slope. The coefficient of friction is 0.4. Find the minimum $P$ to keep the box moving at constant velocity.

@diagram push

$R=8g\cos20^\circ=73.7$ N. Friction $=\mu R=0.4\times73.7=29.5$ N.

Constant velocity $\Rightarrow$ net force parallel to slope is zero:

$$P=8g\sin20^\circ+\mu R=26.8+29.5=56.3\text{ N}$$

## Practice Questions

1. A 5 kg block is on a rough slope at $30^\circ$ with $\mu=0.3$. Find the acceleration down the slope.

2. A particle is released on a rough slope at $45^\circ$ with $\mu=0.6$. Does it slide? If so, find the acceleration.

3. A 4 kg block on a smooth slope at $30^\circ$ is connected via a pulley at the top to a 3 kg mass hanging vertically. Find the acceleration and tension.

## Practice Solutions

1. 5 kg block on rough $30^\circ$ slope, $\mu=0.3$, sliding down.

@diagram down30

$R=5g\cos30^\circ=42.4$ N. Friction $=0.3\times42.4=12.7$ N.

Down slope: $5g\sin30^\circ-12.7=5a\implies24.5-12.7=5a\implies a=2.36\text{ m s}^{-2}$.

2. Check: $\tan45^\circ=1>0.6=\mu$, so the block slides.

@diagram down45

$a=g(\sin45^\circ-0.6\cos45^\circ)=g\times\frac{0.4}{\sqrt2}\approx2.77\text{ m s}^{-2}$.

3. 4 kg on smooth $30^\circ$ slope connected via pulley at the top to 3 kg hanging.

@diagram pulley

For 3 kg hanging (down): $3g-T=3a$. For 4 kg on smooth slope (up): $T-4g\sin30^\circ=4a$.

Adding: $3g-19.6=7a\implies a=\frac{29.4-19.6}7=1.4\text{ m s}^{-2}$. $T=3g-3(1.4)=25.2$ N.
`,
    {
      generic: inclineForces("m", "mg", 30, raw`\alpha`, "up"),
      rough: inclineForces(
        "m",
        "mg",
        (Math.atan(5 / 12) * 180) / Math.PI,
        raw`\alpha`,
        "up",
        undefined,
        "a",
      ),
      push: inclineForces(
        raw`8\text{ kg}`,
        "8g",
        20,
        raw`20^\circ`,
        "down",
        "P",
      ),
      down30: inclineForces(
        raw`5\text{ kg}`,
        "5g",
        30,
        raw`30^\circ`,
        "up",
        undefined,
        "a",
      ),
      down45: inclineForces("m", "mg", 45, raw`45^\circ`, "up"),
      pulley: slopePulley(),
    },
  ),
);
