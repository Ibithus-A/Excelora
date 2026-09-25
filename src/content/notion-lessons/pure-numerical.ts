import { nativeLesson, transcript } from "./authoring.ts";
const raw = String.raw;
const lesson = (title: string, source: string) =>
  nativeLesson(
    "Pure Mathematics",
    "Chapter 9: Numerical Methods",
    title,
    transcript(source),
  );
export const PURE_NUMERICAL_LESSONS = [
  lesson(
    "9.1 Locating Roots by Sign Change",
    raw`
If $f(x)$ is continuous on $[a,b]$ and $f(a)$ and $f(b)$ have opposite signs, there is at least one root of $f(x)=0$ in $(a,b)$.

## Sign Change Method

If $f$ is continuous on $[a,b]$ and $f(a)\cdot f(b)<0$, there is a root in $(a,b)$.

When sign change fails: interval too large (even number of roots), discontinuity (asymptote, not a root), or repeated root (touches but does not cross the axis).

## Worked Examples

$f(x)=x+\tan(x/2)$, $\pi<x<3\pi/2$. Show that the root $\alpha$ lies in $[3.6,3.7]$. $f(3.6)=3.6+\tan(1.8)\approx3.6+(-4.286)=-0.686<0$

$f(3.7)=3.7+\tan(1.85)\approx3.7+(-3.380)=0.320>0$

Since $f$ is continuous on $[3.6,3.7]$ and there is a sign change, $\alpha\in[3.6,3.7]$.

## Practice Questions

1. Show that $x^3-3x-5=0$ has a root between $x=2$ and $x=3$.

2. Explain why sign change fails for $f(x)=1/x$ on $[-1,1]$.

3. Show that $e^x=4x$ has a root in $[0.3,0.4]$.

## Solutions to Practice Questions

1. $f(2)=-3<0$, $f(3)=13>0$. Continuous polynomial, sign change: root in $(2,3)$.

2. $f(-1)=-1<0$, $f(1)=1>0$. Sign change exists but $f$ is discontinuous at $x=0$ (asymptote). There is no root.

3. $g(x)=e^x-4x$. $g(0.3)\approx0.150>0$, $g(0.4)\approx-0.108<0$. Continuous, sign change: root in $(0.3,0.4)$.
`,
  ),
  lesson(
    "9.2 Fixed Point Iteration",
    raw`
A root of $f(x)=0$ can be found by rearranging to $x=g(x)$ and iterating $x_{n+1}=g(x_n)$.

## Iterative Method

$x_{n+1}=g(x_n)$, starting from initial estimate $x_1$.

Convergence: when $|g'(x)|<1$ near the root.

Staircase: $0<g'<1$. Cobweb: $-1<g'<0$. Divergence: $|g'|>1$.

## Worked Examples

$f'(x)=g'(x)$ at $x=\alpha$ where $f(x)=e^{4x^2-1}$, $g(x)=8\ln x$. Show $\alpha$ satisfies $4x^2+2\ln x-1=0$. Use $x_{n+1}=\sqrt{(1-2\ln x_n)/4}$, $x_1=0.6$, to find $x_2$. $f'(x)=8xe^{4x^2-1}$, $g'(x)=8/x$. Setting equal: $x^2e^{4x^2-1}=1$. Taking $\ln$: $2\ln x+4x^2-1=0$.

Rearranging: $x=\sqrt{(1-2\ln x)/4}$.

$x_1=0.6$: $x_2=\sqrt{(1-2\ln0.6)/4}=\sqrt{(1+1.0217)/4}=\sqrt{0.5054}\approx0.7109$.

## Practice Questions

1. Show $x^3-3x-5=0$ can be written as $x=(3x+5)^{1/3}$. Starting with $x_1=2$, find $x_2$, $x_3$, $x_4$.

2. Describe the difference between a staircase and a cobweb diagram.

## Solutions to Practice Questions

1. $x^3=3x+5$, $x=(3x+5)^{1/3}$. $x_2=(11)^{1/3}\approx2.2240$, $x_3\approx2.2527$, $x_4\approx2.2564$.

2. Staircase: iterates approach from one side in a step pattern (when $0<g'<1$). Cobweb: iterates alternate either side, spiralling inward (when $-1<g'<0$).
`,
  ),
  lesson(
    "9.3 The Newton-Raphson Method",
    raw`
## Newton–Raphson Formula

$$x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)}$$

Geometrically: the tangent at $(x_n,f(x_n))$ meets the $x$-axis at $x_{n+1}$.

Failure: near a stationary point, the tangent is nearly horizontal and may diverge.

## Worked Examples

$f(x)=x+\tan(x/2)$. Use $x_1=3.7$ and one Newton–Raphson step. $f'(x)=1+\frac12\sec^2(x/2)$. $f(3.7)\approx0.320$, $f'(3.7)\approx7.215$.

$$x_2=3.7-\frac{0.320}{7.215}\approx3.656$$

## Practice Questions

1. Use Newton–Raphson with $x_1=2$ to find the root of $x^3-3x-5=0$ (two iterations).

2. Explain geometrically why Newton–Raphson might fail near a turning point.

## Solutions to Practice Questions

1. $f'(x)=3x^2-3$. $f(2)=-3$, $f'(2)=9$. $x_2=2+1/3\approx2.333$.

$f(2.333)\approx1.70$, $f'(2.333)\approx13.35$. $x_3\approx2.206$.

2. If $f'(x_n)\approx0$, the tangent is nearly horizontal. Its $x$-intercept is far from $x_n$, causing divergence or jumping to a different part of the curve.
`,
  ),
  lesson(
    "9.4 The Trapezium Rule",
    raw`
## The Trapezium Rule

$$\int_a^b y\,dx\approx\frac h2[y_0+y_n+2(y_1+y_2+\cdots+y_{n-1})]$$

where $h=\frac{b-a}n$ and $y_i=f(a+ih)$.

Over/underestimate: overestimate for convex curves, underestimate for concave curves.

## Worked Examples

Estimate runway length from speed data: $t=0,5,10,15,20,25$ s, $v=2,5,10,18,28,42$ m/s. $h=5$:

$$\text{Distance}\approx\frac52[2+42+2(5+10+18+28)]=\frac52[44+122]=\frac52(166)=415\text{ m}$$

The jet accelerated smoothly (concave-up speed curve), so the trapezium rule gives an underestimate.

## Practice Questions

1. Use the trapezium rule with 4 strips to estimate $\int_1^3\frac1x\,dx$. Compare with the exact value.

2. Would the trapezium rule overestimate or underestimate $\int_0^2 e^{-x^2}\,dx$? Explain.

## Solutions to Practice Questions

1. $h=0.5$. Values: $f(1)=1$, $f(1.5)=0.667$, $f(2)=0.5$, $f(2.5)=0.4$, $f(3)=0.333$.

$\approx\frac{0.5}2[1+0.333+2(0.667+0.5+0.4)]=0.25(1.333+3.134)=1.117$.

Exact: $\ln3\approx1.099$. Overestimate (since $1/x$ is convex on $[1,3]$).

2. $y=e^{-x^2}$ is concave on most of $[0,2]$ (bell-shaped). Straight-line segments sit above the curve, giving an overestimate.
`,
  ),
];
