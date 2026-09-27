import { nativeLesson, transcript, p, group, table } from "./authoring.ts";
import { addTrigonometryVisuals } from "./visual-learning-diagrams.ts";
const raw = String.raw;
const lesson = (title: string, source: string) =>
  nativeLesson(
    "Pure Mathematics",
    "Chapter 5: Trigonometry",
    title,
    transcript(source),
  );
export const PURE_TRIGONOMETRY_LESSONS = [
  lesson(
    "5.1 Radians, Arc Length and Sector Area",
    raw`
Radians provide the natural unit for measuring angles in calculus. One radian is the angle subtended at the centre of a circle by an arc equal in length to the radius.

## Radian Measure

$\pi$ radians $=180^\circ$

To convert: multiply degrees by $\frac\pi{180}$

Arc length: $s=r\theta$

Sector area: $A=\frac12r^2\theta$

Key conversions:

$$30^\circ=\frac\pi6,\quad45^\circ=\frac\pi4,\quad60^\circ=\frac\pi3$$

$$90^\circ=\frac\pi2,\quad180^\circ=\pi,\quad360^\circ=2\pi$$

(where $\theta$ is in radians)

## Worked Examples

@card

Circle centre $O$, radius $r$ cm. Minor sector $AOB$ subtends angle $\theta$ radians. Area of sector $=48$ cm² and arc $AB=12$ cm. Find $r$ and $\theta$.

From $s=r\theta$: $12=r\theta$ … (1)

From $A=\frac12r^2\theta$: $48=\frac12r^2\theta$ … (2)

Divide (2) by (1): $\frac{48}{12}=\frac{\frac12r^2\theta}{r\theta}=\frac r2$. So $r=8$ cm.

From (1): $\theta=12/8=3/2$ radians.

@card

Semicircle centre $O$, radius 12 cm. Chord $CD$ is parallel to the diameter $AOB$, with $\angle DOB=0.6$ radians. Find the area of the segment between chord $CD$ and the arc.

Step 1: By symmetry, $\angle COA=0.6$ radians. So $\angle COD=\pi-2(0.6)=\pi-1.2$ radians.

Step 2: Area of segment = area of sector $COD$ minus area of triangle $COD$:

$$\begin{aligned}\text{Segment}&=\tfrac12r^2(\theta-\sin\theta)\\&=\tfrac12(144)(\pi-1.2-\sin(\pi-1.2))\\&=72(\pi-1.2-\sin1.2)\\&=72(\pi-1.2-0.9320\ldots)\\&\approx72(1.009)\approx72.7\text{ cm}^2\end{aligned}$$

## Practice Questions

1. A sector of a circle has radius 6 cm and angle $\frac{2\pi}3$ radians. Find its arc length and area.

2. Convert $\frac{5\pi}{12}$ radians to degrees.

3. A student calculates the area of a sector with radius 5 cm and angle $40^\circ$ as $\frac12(25)(40)=500$ cm². Explain the error and give the correct answer.

## Solutions to Practice Questions

1. Arc length $=6\times\frac{2\pi}3=4\pi$ cm. Area $=\frac12(36)(\frac{2\pi}3)=12\pi$ cm².

2. $\frac{5\pi}{12}\times\frac{180}\pi=\frac{5\times180}{12}=75^\circ$.

3. The student used degrees instead of radians. Convert: $40^\circ=\frac{40\pi}{180}=\frac{2\pi}9$ radians. Correct area $=\frac12(25)(\frac{2\pi}9)=\frac{25\pi}9\approx8.73$ cm².
`,
  ),
  lesson(
    "5.2 Sine Rule, Cosine Rule and Area of a Triangle",
    raw`
These formulae allow us to solve triangles that are not right-angled.

## Triangle Formulae

(triangle $ABC$ with sides $a,b,c$ opposite angles $A,B,C$)

Sine rule: $\frac a{\sin A}=\frac b{\sin B}=\frac c{\sin C}$ (including the ambiguous case)

Cosine rule: $a^2=b^2+c^2-2bc\cos A$

Area: $\text{Area}=\frac12ab\sin C$

## Worked Examples

@card

In triangle $ABC$, $a=8$, $b=5$, $C=60^\circ$. Find the area and the length of side $c$.

Area $=\frac12(8)(5)\sin60^\circ=20\times\frac{\sqrt3}2=10\sqrt3$.

Using the cosine rule: $c^2=64+25-2(8)(5)\cos60^\circ=89-80(0.5)=89-40=49$. So $c=7$.

## Practice Questions

1. In triangle $PQR$, $p=10$, $q=7$, $\angle R=72^\circ$. Find the area.

2. Use the cosine rule to find the largest angle in a triangle with sides 5, 7, 9.

## Solutions to Practice Questions

1. Area $=\frac12(10)(7)\sin72^\circ=35\sin72^\circ\approx33.3$.

2. Largest angle is opposite the longest side (9). $\cos A=\frac{25+49-81}{2(5)(7)}=\frac{-7}{70}=-0.1$. $A=\arccos(-0.1)\approx95.7^\circ$.
`,
  ),
  nativeLesson(
    "Pure Mathematics",
    "Chapter 5: Trigonometry",
    "5.3 Exact Trigonometric Values",
    [
      p(
        raw`Students must know exact values of $\sin$, $\cos$, $\tan$ for standard angles and be able to use them throughout the specification.`,
      ),
      group("Exact Values", [
        table(
          [
            raw`$\theta$`,
            "0",
            raw`$\frac\pi6$`,
            raw`$\frac\pi4$`,
            raw`$\frac\pi3$`,
            raw`$\frac\pi2$`,
            raw`$\pi$`,
          ],
          [
            [
              raw`$\sin\theta$`,
              "0",
              raw`$\frac12$`,
              raw`$\frac{\sqrt2}2$`,
              raw`$\frac{\sqrt3}2$`,
              "1",
              "0",
            ],
            [
              raw`$\cos\theta$`,
              "1",
              raw`$\frac{\sqrt3}2$`,
              raw`$\frac{\sqrt2}2$`,
              raw`$\frac12$`,
              "0",
              "$-1$",
            ],
            [
              raw`$\tan\theta$`,
              "0",
              raw`$\frac1{\sqrt3}$`,
              "1",
              raw`$\sqrt3$`,
              "—",
              "0",
            ],
          ],
        ),
      ]),
    ],
  ),
  lesson(
    "5.4 Trigonometric Graphs and Symmetry",
    raw`
The graphs of $\sin x$, $\cos x$ and $\tan x$ exhibit key symmetries and periodicities.

## Key Properties

$\sin x$: period $2\pi$, range $[-1,1]$

$\cos x$: period $2\pi$, range $[-1,1]$

$\tan x$: period $\pi$, range $\mathbb R$

$\sin(-x)=-\sin x$ (odd)

$\cos(-x)=\cos x$ (even)

$$\cos x=\sin(\tfrac\pi2-x)$$

Transformations apply: $y=A\sin(Bx+C)+D$ has amplitude $|A|$, period $\frac{2\pi}{|B|}$, phase shift $-\frac CB$, and vertical shift $D$.

## Worked Examples

@card

$y=A\cos(x^\circ+60^\circ)$. The point $P(0,2)$ lies on the curve. Find $A$ and the first three positive $x$-intercepts.

At $P$: $2=A\cos60^\circ=\frac A2$, so $A=4$.

For $x$-intercepts: $\cos(x^\circ+60^\circ)=0$, so $x^\circ+60^\circ=90^\circ+360^\circ k$ or $x^\circ+60^\circ=270^\circ+360^\circ k$.

$x=30^\circ+360^\circ k$ or $x=210^\circ+360^\circ k$.

First three positive values: $x=30^\circ,210^\circ,390^\circ$.

## Practice Questions

1. Sketch $y=2\sin(3x)$ for $0\leq x\leq2\pi$, stating the period and amplitude.

2. The graph of $y=\cos(x+30^\circ)$ is sketched. State the coordinates of the first maximum with $x>0$.

## Solutions to Practice Questions

1. Period $=2\pi/3$, amplitude $=2$. Three complete cycles in $[0,2\pi]$. The curve oscillates between $y=-2$ and $y=2$, crossing the $x$-axis at $x=0,\frac\pi3,\frac{2\pi}3,\pi,\frac{4\pi}3,\frac{5\pi}3,2\pi$.

2. Maximum of $\cos$ at argument $=0$: $x+30^\circ=360^\circ$, so $x=330^\circ$. The first maximum with $x>0$ is at $(330^\circ,1)$.
`,
  ),
  lesson(
    "5.5 Small Angle Approximations",
    raw`
When $\theta$ is small and measured in radians, the following approximations hold.

## Small Angle Approximations

($\theta$ in radians)

$$\sin\theta\approx\theta,\quad\cos\theta\approx1-\frac{\theta^2}2,\quad\tan\theta\approx\theta$$

## Worked Examples

@card

Given that $\theta$ is small, find an approximate numerical value of $\frac{\theta\tan2\theta}{1-\cos3\theta}$.

Using small angle approximations: $\tan2\theta\approx2\theta$ and $\cos3\theta\approx1-\frac{(3\theta)^2}2=1-\frac{9\theta^2}2$.

$$\frac{\theta\cdot2\theta}{1-(1-\frac{9\theta^2}2)}=\frac{2\theta^2}{\frac{9\theta^2}2}=2\theta^2\cdot\frac2{9\theta^2}=\frac49$$

@card

Approximate $\frac{\cos3x-1}{\sin4x\cdot x}$ when $x$ is small.

$\cos3x\approx1-\frac{9x^2}2$, $\sin4x\approx4x$.

$$\frac{1-\frac{9x^2}2-1}{4x\cdot x}=\frac{-\frac{9x^2}2}{4x^2}=-\frac98$$

## Practice Questions

1. When $x$ is small, approximate $\frac{\sin5x}{x+\tan3x}$.

2. Use small angle approximations to estimate $\cos0.1$ to 4 decimal places.

## Solutions to Practice Questions

1. $\sin5x\approx5x$, $\tan3x\approx3x$. So $\frac{5x}{x+3x}=\frac{5x}{4x}=\frac54$.

2. $\cos0.1\approx1-\frac{0.01}2=1-0.005=0.9950$. (True value: $0.99500\ldots$)
`,
  ),
  lesson(
    "5.6 Reciprocal and Inverse Trigonometric Functions",
    raw`
The reciprocal functions and inverse functions extend the range of trigonometric expressions we can work with.

## Reciprocal Functions

$$\sec\theta=\frac1{\cos\theta},\quad\csc\theta=\frac1{\sin\theta},\quad\cot\theta=\frac1{\tan\theta}=\frac{\cos\theta}{\sin\theta}$$

## Inverse Functions

$\arcsin x$ has domain $[-1,1]$, range $[-\frac\pi2,\frac\pi2]$

$\arccos x$ has domain $[-1,1]$, range $[0,\pi]$

$\arctan x$ has domain $\mathbb R$, range $(-\frac\pi2,\frac\pi2)$

## Worked Examples

@card

$\cot A=-\frac34$, $\cos B=\frac5{13}$, both angles reflex. Show that $\tan(A+B)=\frac{56}{33}$.

Step 1: $\tan A=\frac1{\cot A}=-\frac43$.

Since $A$ is reflex and $\tan A<0$, $A$ is in the range $270^\circ<A<360^\circ$ (4th quadrant of the reflex range).

Step 2: $\cos B=\frac5{13}$, $B$ reflex. In the range $270^\circ<B<360^\circ$: $\sin B<0$, so $\sin B=-\frac{12}{13}$, $\tan B=-\frac{12}5$.

Step 3: Apply the addition formula:

$$\begin{aligned}\tan(A+B)&=\frac{\tan A+\tan B}{1-\tan A\tan B}\\&=\frac{-\frac43+(-\frac{12}5)}{1-(-\frac43)(-\frac{12}5)}=\frac{-\frac{20}{15}-\frac{36}{15}}{1-\frac{48}{15}}=\frac{-\frac{56}{15}}{-\frac{33}{15}}=\frac{56}{33}\end{aligned}$$

## Practice Questions

1. Given $\sec x=3$ and $0<x<\frac\pi2$, find exact values of $\sin x$, $\tan x$ and $\cot x$.

2. Find the exact value of $\arcsin(\frac{\sqrt3}2)+\arctan(-1)$.

## Solutions to Practice Questions

1. $\cos x=1/3$. $\sin x=\sqrt{1-1/9}=\sqrt{8/9}=\frac{2\sqrt2}3$. $\tan x=\frac{2\sqrt2/3}{1/3}=2\sqrt2$. $\cot x=\frac1{2\sqrt2}=\frac{\sqrt2}4$.

2. $\arcsin(\sqrt3/2)=\pi/3$ and $\arctan(-1)=-\pi/4$. Sum $=\pi/3-\pi/4=\pi/12$.
`,
  ),
  lesson(
    "5.7 Trigonometric Identities",
    raw`
The fundamental identities form the backbone of trigonometric algebra.

## Core Identities

$$\tan\theta=\frac{\sin\theta}{\cos\theta}$$

$$\sin^2\theta+\cos^2\theta=1$$

$$\sec^2\theta=1+\tan^2\theta$$

$$\csc^2\theta=1+\cot^2\theta$$

Compound Angle Formulae:

$$\sin(A\pm B)=\sin A\cos B\pm\cos A\sin B$$

$$\cos(A\pm B)=\cos A\cos B\mp\sin A\sin B$$

$$\tan(A\pm B)=\frac{\tan A\pm\tan B}{1\mp\tan A\tan B}$$

## Double Angle Formulae

$$\sin2A=2\sin A\cos A$$

$$\cos2A=\cos^2A-\sin^2A=2\cos^2A-1=1-2\sin^2A$$

$$\tan2A=\frac{2\tan A}{1-\tan^2A}$$

Half-angle rearrangements:

$$\cos^2A=\frac{1+\cos2A}2,\quad\sin^2A=\frac{1-\cos2A}2$$

## Worked Examples

@card

Prove that $\cos x\cos2x+\sin x\sin2x\equiv\cos x$.

The left-hand side is in the form $\cos A\cos B+\sin A\sin B=\cos(A-B)$:

$$\cos x\cos2x+\sin x\sin2x=\cos(x-2x)=\cos(-x)=\cos x$$

@card

Using the compound angle formula for $\sin(A+B)$, show that $\sin3x=3\sin x-4\sin^3x$.

Write $\sin3x=\sin(2x+x)$:

$$\begin{aligned}\sin3x&=\sin2x\cos x+\cos2x\sin x\\&=2\sin x\cos x\cdot\cos x+(1-2\sin^2x)\sin x\\&=2\sin x\cos^2x+\sin x-2\sin^3x\end{aligned}$$

Replace $\cos^2x=1-\sin^2x$:

$$\begin{aligned}&=2\sin x(1-\sin^2x)+\sin x-2\sin^3x\\&=2\sin x-2\sin^3x+\sin x-2\sin^3x\\&=3\sin x-4\sin^3x\end{aligned}$$

@card

Prove that $\frac1{\csc\theta-1}+\frac1{\csc\theta+1}\equiv2\tan\theta\sec\theta$.

Combine the fractions on the left:

$$\frac{(\csc\theta+1)+(\csc\theta-1)}{(\csc\theta-1)(\csc\theta+1)}=\frac{2\csc\theta}{\csc^2\theta-1}$$

Using $\csc^2\theta-1=\cot^2\theta$:

$$\begin{aligned}&=\frac{2\csc\theta}{\cot^2\theta}=\frac{2/\sin\theta}{\cos^2\theta/\sin^2\theta}\\&=\frac{2\sin\theta}{\cos^2\theta}=\frac{2\sin\theta}{\cos\theta}\cdot\frac1{\cos\theta}=2\tan\theta\sec\theta\end{aligned}$$

## Practice Questions

1. Prove that $\frac{\sin2\theta}{1+\cos2\theta}\equiv\tan\theta$.

2. Show that $\sec^2x-\csc^2x\equiv\tan^2x-\cot^2x$.

3. Use the compound angle formula to find the exact value of $\cos75^\circ$.

## Solutions to Practice Questions

1. LHS: $\frac{2\sin\theta\cos\theta}{1+2\cos^2\theta-1}=\frac{2\sin\theta\cos\theta}{2\cos^2\theta}=\frac{\sin\theta}{\cos\theta}=\tan\theta$.

2. LHS: $(1+\tan^2x)-(1+\cot^2x)=\tan^2x-\cot^2x=\text{RHS}$.

3. $\cos75^\circ=\cos(45^\circ+30^\circ)=\cos45^\circ\cos30^\circ-\sin45^\circ\sin30^\circ=\frac{\sqrt2}2\cdot\frac{\sqrt3}2-\frac{\sqrt2}2\cdot\frac12=\frac{\sqrt6-\sqrt2}4$.
`,
  ),
  lesson(
    "5.8 The R cos Form",
    raw`
Expressions of the form $a\cos\theta+b\sin\theta$ can be written as a single sinusoidal function, which is essential for finding maximum/minimum values and solving equations.

## R-form

$a\cos\theta+b\sin\theta\equiv R\cos(\theta-\alpha)$ where $R=\sqrt{a^2+b^2}$ and $\tan\alpha=\frac ba$

$$a\cos\theta-b\sin\theta\equiv R\cos(\theta+\alpha)$$

$a\sin\theta+b\cos\theta\equiv R\sin(\theta+\alpha)$ where $\tan\alpha=\frac ba$

## Worked Examples

@card

Express $140\cos\theta-480\sin\theta$ in the form $K\cos(\theta+\alpha)$, $K>0$, $0<\alpha<90^\circ$.

$$K=\sqrt{140^2+480^2}=\sqrt{19600+230400}=\sqrt{250000}=500$$

$\tan\alpha=\frac{480}{140}=\frac{24}7$, so $\alpha=\arctan(\frac{24}7)\approx73.74^\circ$.

Therefore $140\cos\theta-480\sin\theta=500\cos(\theta+73.74^\circ)$.

@card

Express $5\cos\theta-12\sin\theta$ as $R\cos(\theta+\alpha)$ and hence state the maximum value and the angle at which it occurs.

$R=\sqrt{25+144}=13$. $\tan\alpha=\frac{12}5$, $\alpha=\arctan(12/5)\approx67.38^\circ$.

$$5\cos\theta-12\sin\theta=13\cos(\theta+67.38^\circ).$$

Maximum value is 13, occurring when $\cos(\theta+67.38^\circ)=1$, i.e. $\theta=-67.38^\circ$ (or equivalently $\theta=292.62^\circ$).

## Practice Questions

1. Express $3\sin x+4\cos x$ in the form $R\sin(x+\alpha)$. State the maximum and minimum values.

2. Solve $3\cos\theta+4\sin\theta=2$ for $0^\circ\leq\theta\leq360^\circ$.

## Solutions to Practice Questions

1. $R=5$, $\tan\alpha=4/3$, $\alpha\approx53.13^\circ$. So $3\sin x+4\cos x=5\sin(x+53.13^\circ)$. Max $=5$, min $=-5$.

2. Write $3\cos\theta+4\sin\theta=5\cos(\theta-53.13^\circ)$. So $5\cos(\theta-53.13^\circ)=2$, $\cos(\theta-53.13^\circ)=0.4$.

$\theta-53.13^\circ=\pm66.42^\circ+360^\circ k$.

$\theta=119.55^\circ$ or $\theta=-13.29^\circ+360^\circ=346.71^\circ$.

Solutions: $\theta\approx119.6^\circ$ and $\theta\approx346.7^\circ$.
`,
  ),
  lesson(
    "5.9 Solving Trigonometric Equations",
    raw`
Solving trigonometric equations requires finding all solutions within a given interval. Start by reducing the equation to a standard form using identities, then find the principal value and use symmetry or periodicity to find all solutions.

## Equation-Solving Strategy

Step 1: Rearrange to involve a single trig function (using identities if necessary).

Step 2: Solve for the principal value.

Step 3: Use the graph/CAST diagram to find all solutions in the given interval.

Common identity substitutions:

$\sin^2x+\cos^2x=1$ (to convert mixed $\sin/\cos$ to single function)

$\sin2x=2\sin x\cos x$ (to reduce double-angle equations)

## Worked Examples

@card

Solve $5\sin2\theta=9\tan\theta$ for $-180^\circ\leq\theta\leq180^\circ$.

Step 1: Replace $\sin2\theta=2\sin\theta\cos\theta$ and $\tan\theta=\frac{\sin\theta}{\cos\theta}$:

$$5(2\sin\theta\cos\theta)=\frac{9\sin\theta}{\cos\theta}$$

$$10\sin\theta\cos^2\theta=9\sin\theta$$

Step 2: Factor: $\sin\theta(10\cos^2\theta-9)=0$.

Case 1: $\sin\theta=0$: $\theta=-180^\circ,0^\circ,180^\circ$.

Case 2: $\cos^2\theta=9/10$: $\cos\theta=\pm\frac3{\sqrt{10}}$.

$\theta=\pm18.43^\circ$ and $\theta=\pm(180^\circ-18.43^\circ)=\pm161.57^\circ$.

But check $\cos\theta\neq0$ (domain of $\tan$): all solutions valid.

Solutions: $\theta=-180^\circ,-161.6^\circ,-18.4^\circ,0^\circ,18.4^\circ,161.6^\circ,180^\circ$.

@card

Solve $6\cos^2x+\sin x-5=0$ for $0\leq x<360^\circ$.

Replace $\cos^2x=1-\sin^2x$:

$$\begin{aligned}6(1-\sin^2x)+\sin x-5&=0\\-6\sin^2x+\sin x+1&=0\\6\sin^2x-\sin x-1&=0\\(3\sin x+1)(2\sin x-1)&=0\end{aligned}$$

$\sin x=-\frac13$: $x=180^\circ+19.47^\circ=199.5^\circ$ or $x=360^\circ-19.47^\circ=340.5^\circ$.

$\sin x=\frac12$: $x=30^\circ$ or $x=150^\circ$.

Solutions: $x=30^\circ,150^\circ,199.5^\circ,340.5^\circ$.

## Practice Questions

1. Solve $\sin(x+70^\circ)=0.5$ for $0<x<360^\circ$.

2. Solve $3+5\cos2x=1$ for $-180^\circ<x<180^\circ$.

3. Solve $\frac{\cos2x}{1+\cos2x}=1-2\tan x$ for $0\leq x<2\pi$.

## Solutions to Practice Questions

1. $x+70^\circ=30^\circ$ or $x+70^\circ=150^\circ$ (plus multiples of $360^\circ$). So $x=-40^\circ$ (out of range) or $x=80^\circ$; also $x+70^\circ=390^\circ$, $x=320^\circ$; $x+70^\circ=510^\circ$, $x=440^\circ$ (out).

Solutions: $x=80^\circ,320^\circ$.

2. $5\cos2x=-2$, $\cos2x=-0.4$. $2x=\pm113.6^\circ+360^\circ k$. For $-360^\circ<2x<360^\circ$: $2x=113.6^\circ,-113.6^\circ,-246.4^\circ,246.4^\circ$. So $x=56.8^\circ,-56.8^\circ,-123.2^\circ,123.2^\circ$.

3. Note $1+\cos2x=2\cos^2x$ and $\cos2x=2\cos^2x-1$.

LHS: $\frac{2\cos^2x-1}{2\cos^2x}$. RHS: $1-\frac{2\sin x}{\cos x}$.

$$\begin{aligned}\frac{2\cos^2x-1}{2\cos^2x}&=1-\frac{2\sin x}{\cos x}\\1-\frac1{2\cos^2x}&=1-\frac{2\sin x}{\cos x}\\\frac1{2\cos^2x}&=\frac{2\sin x}{\cos x}\end{aligned}$$

$\frac1{2\cos x}=2\sin x$, so $\sin x\cos x=\frac14$, $\sin2x=\frac12$.

$2x=\frac\pi6,\frac{5\pi}6,\frac{13\pi}6,\frac{17\pi}6$. So $x=\frac\pi{12},\frac{5\pi}{12},\frac{13\pi}{12},\frac{17\pi}{12}$.
`,
  ),
  lesson(
    "5.10 Trigonometry in Modelling",
    raw`
Trigonometric functions model periodic real-world phenomena: tides, daylight hours, temperature cycles, wave motion, and circular motion.

## Worked Examples

@card

The number of rabbits $R=A+140\cos(30t)^\circ-480\sin(30t)^\circ$ where $t$ is months after the start of the year. The maximum number is 1500. Find $A$ and the minimum number of rabbits.

From Section 8: $140\cos(30t)^\circ-480\sin(30t)^\circ=500\cos(30t+73.74^\circ)^\circ$.

So $R=A+500\cos(30t+73.74^\circ)^\circ$.

Maximum: $R_{\max}=A+500=1500$, so $A=1000$.

Minimum: $R_{\min}=A-500=500$ rabbits.

## Practice Questions

1. A tide is modelled by $h=5+3\sin(\frac{\pi t}6)$ metres, where $t$ is hours after midnight. Find the maximum height and the first time it occurs.

## Solutions to Practice Questions

1. Max $h=5+3=8$ m when $\sin(\pi t/6)=1$, i.e. $\pi t/6=\pi/2$, $t=3$ hours. First occurs at 3:00 am.
`,
  ),
];
addTrigonometryVisuals(PURE_TRIGONOMETRY_LESSONS);
