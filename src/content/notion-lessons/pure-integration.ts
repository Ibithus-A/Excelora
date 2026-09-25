import { nativeLesson, transcript, group, table, m } from "./authoring.ts";
const raw = String.raw;
const lesson = (title: string, source: string) =>
  nativeLesson(
    "Pure Mathematics",
    "Chapter 8: Integration",
    title,
    transcript(source),
  );
export const PURE_INTEGRATION_LESSONS = [
  lesson(
    "8.1 Standard Integrals",
    raw`
Integration is the reverse of differentiation. An indefinite integral always requires $+c$.

## Worked Examples

@card

Find $\int\sin^2x\,dx$. Using $\sin^2x=\frac{1-\cos2x}2$:

$$\int\sin^2x\,dx=\frac12x-\frac14\sin2x+c$$

@card

Find $\int(x^{-1/2}-3e^{2x}+\frac2x)\,dx$. Integrate term by term:

$$2\sqrt x-\frac32e^{2x}+2\ln|x|+c$$

## Practice Questions

1. Find $\int(2x+5)(x-1)\,dx$.

2. Find $\int\tan^2x\,dx$.

3. Find $\int\frac2{3x+5}\,dx$.

## Solutions to Practice Questions

1. Expand: $2x^2+3x-5$. $\int=\frac{2x^3}3+\frac{3x^2}2-5x+c$.

2. $\int(\sec^2x-1)\,dx=\tan x-x+c$.

3. $\frac23\ln|3x+5|+c$.
`,
  ),
  lesson(
    "8.2 Definite Integrals and Areas",
    raw`
Area under curve: $\int_a^b f(x)\,dx$ (when $f(x)\geq0$)

Area between curves: $\int_a^b[f(x)-g(x)]\,dx$ (when $f\geq g$)

Parametric area: $\int_{t_1}^{t_2}y\frac{dx}{dt}\,dt$

## Worked Examples

@card

Find the finite area bounded by $y=6x-x^2$ and $y=2x$. Intersections: $6x-x^2=2x$, so $x(x-4)=0$, giving $x=0$ and $x=4$.

$$\text{Area}=\int_0^4(4x-x^2)\,dx=\left[2x^2-\frac{x^3}3\right]_0^4=32-\frac{64}3=\frac{32}3$$

@card

$y=8x^2e^{-3x}$, $x\geq0$. Find the exact area between the curve, $x=1$, and the $x$-axis.

Area $=\int_0^1 8x^2e^{-3x}\,dx$. Apply integration by parts twice.

Let $I=\int x^2e^{-3x}\,dx$. First application ($u=x^2$, $dv=e^{-3x}\,dx$):

$$I=-\frac{x^2}3e^{-3x}+\frac23\int xe^{-3x}\,dx$$

Second application ($u=x$, $dv=e^{-3x}\,dx$):

$$\int xe^{-3x}\,dx=-\frac x3e^{-3x}-\frac19e^{-3x}$$

Combining: $I=-\frac{x^2}3e^{-3x}-\frac{2x}9e^{-3x}-\frac2{27}e^{-3x}$.

$$\left.8I\right|_0^1=8\left[(-\tfrac13-\tfrac29-\tfrac2{27})e^{-3}+\tfrac2{27}\right]=8\left[\tfrac2{27}-\tfrac{17}{27}e^{-3}\right]=\frac{16}{27}-\frac{136}{27}e^{-3}$$

## Practice Questions

1. Evaluate $\int_1^4(\sqrt x+1/x)\,dx$.

2. Calculate $\lim_{\delta x\to0}\sum_{x=4}^9\sqrt x\,\delta x$.

## Solutions to Practice Questions

1. $[\frac23x^{3/2}+\ln x]_1^4=(\frac{16}3+\ln4)-\frac23=\frac{14}3+\ln4$.

2. This equals $\int_4^9\sqrt x\,dx=[\frac23x^{3/2}]_4^9=\frac23(27-8)=\frac{38}3$.
`,
  ),
  lesson(
    "8.3 Integration by Substitution",
    raw`
Method: Choose $u=g(x)$, find $du/dx$, replace all $x$ and $dx$, integrate in $u$, back-substitute.

## Worked Examples

@card

Using $u=2x^{3/2}-1$, find $\int\frac{6x^2}{2x^{3/2}-1}\,dx$. $u=2x^{3/2}-1$, $\frac{du}{dx}=3x^{1/2}$, so $dx=\frac{du}{3\sqrt x}$.

The integrand becomes $\frac{6x^2}u\cdot\frac{du}{3\sqrt x}=\frac{2x^{3/2}}u\,du=\frac{u+1}u\,du$ (since $2x^{3/2}=u+1$).

$$\int\frac{u+1}u\,du=u+\ln|u|+c=(2x^{3/2}-1)+\ln|2x^{3/2}-1|+c$$

@card

Using $u^2=e^x-1$, evaluate $\int_{\ln2}^{\ln5}\frac{3e^{2x}}{\sqrt{e^x-1}}\,dx$. $u^2=e^x-1$, so $e^x=u^2+1$ and $2u\,du=e^x\,dx$. Limits: $x=\ln2\Rightarrow u=1$; $x=\ln5\Rightarrow u=2$.

$$\begin{aligned}\int_1^2\frac{3(u^2+1)^2}u\cdot\frac{2u}{u^2+1}\,du&=6\int_1^2(u^2+1)\,du\\&=6\left[\frac{u^3}3+u\right]_1^2=6(\tfrac83+2-\tfrac13-1)=20\end{aligned}$$

## Practice Questions

1. Find $\int\frac x{(2x+1)^3}\,dx$ using $u=2x+1$.

## Solutions to Practice Questions

1. $u=2x+1$, $x=(u-1)/2$, $dx=du/2$. $\int\frac{(u-1)/2}{u^3}\cdot\frac{du}2=\frac14\int(u^{-2}-u^{-3})\,du=-\frac1{4(2x+1)}+\frac1{8(2x+1)^2}+c$.
`,
  ),
  lesson(
    "8.4 Integration by Parts",
    raw`
$$\int u\frac{dv}{dx}\,dx=uv-\int v\frac{du}{dx}\,dx$$

LIATE order for $u$: Logs, Inverse trig, Algebraic, Trig, Exponential.

Special: $\int\ln x\,dx=x\ln x-x+c$

## Worked Examples

@card

Find $\int x\cos(x/2)\,dx$. Hence find $\int x^2\sin(x/2)\,dx$. $u=x$, $dv=\cos(x/2)\,dx$, $v=2\sin(x/2)$:

$$\int x\cos(x/2)\,dx=2x\sin(x/2)-2\int\sin(x/2)\,dx=2x\sin(x/2)+4\cos(x/2)+c.$$

For $\int x^2\sin(x/2)\,dx$: $u=x^2$, $dv=\sin(x/2)\,dx$, $v=-2\cos(x/2)$:

$$\begin{aligned}&=-2x^2\cos(x/2)+4\int x\cos(x/2)\,dx\\&=-2x^2\cos(x/2)+8x\sin(x/2)+16\cos(x/2)+c\end{aligned}$$

## Practice Questions

1. Find $\int xe^{3x}\,dx$.

2. Find $\int x^2e^{-x}\,dx$.

## Solutions to Practice Questions

1. $u=x$, $v=\frac13e^{3x}$. Result: $\frac{e^{3x}}9(3x-1)+c$.

2. Two applications of parts: $-e^{-x}(x^2+2x+2)+c$.
`,
  ),
  lesson(
    "8.5 Integration Using Partial Fractions",
    raw`
$$\int\frac A{ax+b}\,dx=\frac Aa\ln|ax+b|+c$$

$$\int\frac A{(ax+b)^2}\,dx=-\frac A{a(ax+b)}+c$$

## Worked Examples

@card

$\frac{x^2+3}{x-1}\equiv Ax+B+\frac C{x-1}$. Find $A,B,C$ and evaluate $\int_2^4\frac{x^2+3}{x-1}\,dx$. Comparing coefficients gives $A=1$, $B=1$, $C=4$.

$$\begin{aligned}\int_2^4(x+1+\tfrac4{x-1})\,dx&=\left[\frac{x^2}2+x+4\ln|x-1|\right]_2^4\\&=(8+4+4\ln3)-(2+2+0)=8+4\ln3\end{aligned}$$

## Practice Questions

1. Find $\int\frac{5x+1}{(x+1)(x-3)}\,dx$.

## Solutions to Practice Questions

1. $\frac{5x+1}{(x+1)(x-3)}=\frac1{x+1}+\frac4{x-3}$. $\int=\ln|x+1|+4\ln|x-3|+c$.
`,
  ),
  lesson(
    "8.6 Differential Equations",
    raw`
A first order separable DE has the form $\frac{dy}{dx}=f(x)g(y)$.

## Separation of Variables

Step 1: Separate: $\frac1{g(y)}\,dy=f(x)\,dx$. Step 2: Integrate both sides.

Step 3: Apply boundary conditions. Step 4: Rearrange for $y$.

## Worked Examples

@card

Show the general solution of $5\frac{dy}{dx}=2y^2-7y+3$ is $y=\frac{Ae^x-3}{2Ae^x-1}$. Factorise: $2y^2-7y+3=(2y-1)(y-3)$. Separate: $\frac5{(2y-1)(y-3)}\,dy=dx$.

Partial fractions: $\frac5{(2y-1)(y-3)}=\frac{-2}{2y-1}+\frac1{y-3}$.

Integrate: $-\ln|2y-1|+\ln|y-3|=x+c$, so $\frac{y-3}{2y-1}=Ae^x$.

Rearrange: $y-3=2Ae^xy-Ae^x$, so $y(1-2Ae^x)=3-Ae^x$, giving $y=\frac{Ae^x-3}{2Ae^x-1}$.

@card

$\frac{dV}{dt}=\frac1{10}V(25-V)$, $V(0)=20$. Find time for $V=24$ microlitres. Using $\frac1{V(25-V)}=\frac1{25V}+\frac1{25(25-V)}$ and separating:

$\frac1{25}\ln\frac V{25-V}=\frac t{10}+c$. At $t=0$, $V=20$: $c=\frac{\ln4}{25}$.

At $V=24$: $\frac{\ln24-\ln4}{25}=\frac t{10}$, so $t=\frac{10\ln6}{25}=\frac{2\ln6}5\approx0.717$ hours $\approx43$ minutes.

@card

$\frac{dy}{dx}=\frac{y^2-1}x$, $y=2$ at $x=1$. Show $y=\frac{3+x^2}{3-x^2}$. Partial fractions: $\frac12(\frac1{y-1}-\frac1{y+1})\,dy=\frac{dx}x$.

Integrate: $\frac12\ln\frac{y-1}{y+1}=\ln x+c$.

At $x=1$, $y=2$: $c=\frac12\ln\frac13$. So $\ln\frac{y-1}{y+1}=\ln\frac{x^2}3$, giving $\frac{y-1}{y+1}=\frac{x^2}3$.

Rearrange: $3(y-1)=x^2(y+1)$, $y(3-x^2)=3+x^2$, $y=\frac{3+x^2}{3-x^2}$.

## Practice Questions

1. A population $p$ obeys $\frac{dp}{dt}=kp\cos kt$, $p=p_0$ at $t=0$. Solve for $p$.

2. $\frac{dH}{dt}=-0.12e^{-0.2t}$, initially $H=1.5$. Find $H(t)$.

## Solutions to Practice Questions

1. $\int\frac{dp}p=\int k\cos kt\,dt$. $\ln p=\sin kt+\ln p_0$, so $p=p_0e^{\sin kt}$.

2. $H=0.6e^{-0.2t}+c$. At $t=0$: $c=0.9$. $H=0.6e^{-0.2t}+0.9$.
`,
  ),
];
PURE_INTEGRATION_LESSONS[0].blocks.splice(
  1,
  0,
  group("Standard Integrals", [
    table(
      ["$f(x)$", raw`$\int f(x)\,dx$`],
      [
        [raw`$x^n$ ($n\neq-1$)`, raw`$\frac{x^{n+1}}{n+1}+c$`],
        ["$1/x$", raw`$\ln|x|+c$`],
        ["$e^{kx}$", raw`$\frac1k e^{kx}+c$`],
        [raw`$\cos kx$`, raw`$\frac1k\sin kx+c$`],
        [raw`$\sin kx$`, raw`$-\frac1k\cos kx+c$`],
        [raw`$\sec^2kx$`, raw`$\frac1k\tan kx+c$`],
      ],
    ),
    m(raw`\text{Key pattern: }\int\frac{f'(x)}{f(x)}\,dx=\ln|f(x)|+c`),
  ]),
);
