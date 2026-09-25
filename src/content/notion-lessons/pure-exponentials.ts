import { nativeLesson, transcript } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, source: string) =>
  nativeLesson(
    "Pure Mathematics",
    "Chapter 6: Exponentials and Logarithms",
    title,
    transcript(source),
  );
export const PURE_EXPONENTIAL_LESSONS = [
  lesson(
    "6.1 Exponential Functions",
    raw`
The function $a^x$ is defined for $a>0$. When $a>1$ it represents exponential growth; when $0<a<1$ it represents exponential decay. The special base $e\approx2.71828$ arises naturally because the gradient of $y=e^x$ equals $e^x$ itself.

## Key Results

$y=a^x$ passes through $(0,1)$ for all $a>0$

$y=e^{ax+b}+c$ has asymptote $y=c$

$$\frac{d}{dx}(e^{kx})=ke^{kx}$$

When the rate of change is proportional to the current value, use an exponential model.

$y=Ae^{kt}$: growth if $k>0$, decay if $k<0$.

## Worked Examples

@card

The curves $y=2e^{-x}$ and $y=e^x-1$ intersect at point $P$. Find the exact coordinates of $P$.

Set equal: $2e^{-x}=e^x-1$. Let $u=e^x$, so $e^{-x}=1/u$:

$$\begin{aligned}\frac2u&=u-1\\2&=u^2-u\\u^2-u-2&=0\\(u-2)(u+1)&=0\end{aligned}$$

Since $u=e^x>0$, we have $u=2$, so $x=\ln2$.

$y=e^{\ln2}-1=2-1=1$.

The coordinates of $P$ are $(\ln2,1)$.

@card

Solve $e^{2x}-5e^x+6=0$, giving exact answers.

Let $u=e^x$, so $e^{2x}=u^2$:

$$u^2-5u+6=0$$

$$(u-2)(u-3)=0$$

$u=2$ gives $x=\ln2$. $u=3$ gives $x=\ln3$.

## Practice Questions

1. Sketch $y=3(2^{-x})-1$ for $x\geq0$, marking intercepts and the asymptote.

2. Solve $e^{3x-1}=7$, giving your answer in exact form.

3. Solve $2^{2x}-6\cdot2^x+8=0$.

## Solutions to Practice Questions

1. At $x=0$: $y=3-1=2$. As $x\to\infty$: $2^{-x}\to0$, so $y\to-1$ (asymptote $y=-1$). For the $x$-intercept: $3\cdot2^{-x}=1$, so $2^{-x}=\frac13$, giving $x=\log_2 3\approx1.585$. The curve decreases from $(0,2)$ towards the asymptote $y=-1$.

2. Take natural logarithms: $3x-1=\ln7$, so $x=\frac{1+\ln7}3$.

3. Let $u=2^x$: $u^2-6u+8=0$, $(u-2)(u-4)=0$. $u=2$: $x=1$. $u=4$: $x=2$.
`,
  ),
  lesson(
    "6.2 Logarithms and Their Laws",
    raw`
The logarithm $\log_a x$ is defined as the inverse of $a^x$: if $a^n=x$, then $\log_a x=n$. The natural logarithm $\ln x=\log_e x$.

## Laws of Logarithms

$$\log_a(xy)=\log_a x+\log_a y$$

$$\log_a(\tfrac xy)=\log_a x-\log_a y$$

$$\log_a(x^k)=k\log_a x$$

$$\log_a a=1,\quad\log_a1=0$$

$$a^{\log_a x}=x$$

Change of base:

$$\log_a x=\frac{\log_b x}{\log_b a}$$

## Worked Examples

@card

Given $p=\log_6 25$ and $q=\log_6 2$, express $\log_6(200)$, $\log_6(3.2)$ and $\log_6(75)$ in terms of $p$ and $q$.

(i) $200=8\times25=2^3\times25$, so $\log_6 200=3\log_6 2+\log_6 25=3q+p$.

(ii) $3.2=\frac{32}{10}=\frac{2^5}{2\times5}=\frac{2^4}5$. Since $25=5^2$, we have $\log_6 5=\frac p2$.

$$\log_6 3.2=4\log_6 2-\log_6 5=4q-\frac p2.$$

(iii) $75=3\times25$. Since $\log_6 3=\log_6(\frac62)=1-q$:

$$\log_6 75=(1-q)+p=1+p-q.$$

@card

Simplify $\ln(2\sqrt e)-\frac13\ln\frac8{e^2}-\ln\frac e3$.

Evaluate each term:

$$\ln(2\sqrt e)=\ln2+\frac12$$

$$\frac13\ln\frac8{e^2}=\frac13(3\ln2-2)=\ln2-\frac23$$

$$\ln\frac e3=1-\ln3$$

Combine:

$$(\ln2+\tfrac12)-(\ln2-\tfrac23)-(1-\ln3)=\tfrac12+\tfrac23-1+\ln3=\tfrac16+\ln3$$

@card

Given $a>b>0$ and $\log a-\log b=\log(a-b)$, show that $a=\frac{b^2}{b-1}$ and state the full restriction on $b$.

Apply the subtraction law: $\log(\frac ab)=\log(a-b)$, so $\frac ab=a-b$.

Multiply both sides by $b$: $a=b(a-b)=ab-b^2$.

Rearrange: $a-ab=-b^2$, so $a(1-b)=-b^2$, giving $a=\frac{b^2}{b-1}$.

For $a>0$: since $b^2>0$, we need $b-1>0$, i.e. $b>1$.

## Practice Questions

1. Solve $\log_2(256x^2)=1+2\log_2(\frac12x^4)$.

2. Solve $2^{3x-1}=3$, giving your answer in exact form.

3. Solve simultaneously: $3\log_8(xy)=4\log_2 x$ and $\log_2 y=1+\log_2 x$.

## Solutions to Practice Questions

1. LHS: $\log_2 256+2\log_2 x=8+2\log_2 x$.

RHS: $1+2(\log_2\frac12+4\log_2 x)=1+2(-1+4\log_2 x)=-1+8\log_2 x$.

Equating: $8+2\log_2 x=-1+8\log_2 x$, so $9=6\log_2 x$, $\log_2 x=\frac32$, $x=2^{3/2}=2\sqrt2$.

2. Taking $\log_2$ of both sides: $3x-1=\log_2 3$, so $x=\frac{1+\log_2 3}3$.

3. From the second equation: $\log_2\frac yx=1$, so $y=2x$.

First equation: using $\log_8(xy)=\frac{\log_2(xy)}3$, we get $3\frac{\log_2(xy)}3=4\log_2 x$, so $\log_2(xy)=4\log_2 x$, giving $xy=x^4$.

Substituting $y=2x$: $2x^2=x^4$, so $x^2(x^2-2)=0$. Since $x>0$: $x=\sqrt2$, $y=2\sqrt2$.
`,
  ),
  lesson(
    "6.3 Logarithmic Graphs for Estimating Parameters",
    raw`
When data follows $y=ax^n$ or $y=kb^x$, a logarithmic transformation linearises the relationship.

## Log-Linearisation

Model $y=ax^n$:

$$\log y=\log a+n\log x$$

Plot $\log y$ vs $\log x$: gradient $=n$, intercept $=\log a$.

Model $y=kb^x$:

$$\log y=\log k+x\log b$$

Plot $\log y$ vs $x$: gradient $=\log b$, intercept $=\log k$.

## Worked Examples

@card

World population $P$ billions modelled by $P=ab^t$ where $t$ is years after 2004. The graph of $\log_{10}P$ against $t$ has gradient 0.0054 and intercept 0.81. Estimate $a$ and $b$ to 3 d.p. Interpret $a$ and $b$. Estimate population in 2030 and comment on reliability.

Step 1: $\log_{10}P=0.81+0.0054t$.

Intercept: $\log_{10}a=0.81$, so $a=10^{0.81}\approx6.457$.

Gradient: $\log_{10}b=0.0054$, so $b=10^{0.0054}\approx1.013$.

Step 2: Interpretation. $a\approx6.457$ billion is the world population in 2004. $b\approx1.013$ means the population grows by approximately 1.3% per year.

Step 3: In 2030, $t=26$: $P=6.457\times1.013^{26}\approx6.457\times1.397\approx9.0$ billion.

Step 4: This extrapolates 26 years from data spanning only 2004–2007 (3 years). Such a long extrapolation is unreliable, as growth rates may change due to demographic shifts.

@card

Braking distance $d$ metres at speed $V$ km/h. The log-log graph has intercept $-1.77$ on the $\log_{10}d$ axis and passes through the point $(\log_{10}30,\log_{10}20)$. Show $k\approx0.017$ and find $n$.

The model $d=kV^n$ gives $\log_{10}d=\log_{10}k+n\log_{10}V$.

Intercept: $\log_{10}k=-1.77$, so $k=10^{-1.77}\approx0.017$.

Using the data point $(30,20)$: $\log_{10}20=-1.77+n\log_{10}30$.

$1.301=-1.77+1.477n$, so $n=\frac{3.071}{1.477}\approx2.08$.

## Practice Questions

1. Data follows $H=kt^n$. The graph of $\log H$ against $\log t$ has gradient 1.5 and intercept 0.7. Find $k$ and $n$.

2. A straight-line graph of $\log_{10}y$ against $x$ passes through $(0,2)$ and $(4,3.6)$. Find the relationship between $y$ and $x$.

## Solutions to Practice Questions

1. $n=1.5$ (the gradient). $\log k=0.7$, so $k=10^{0.7}\approx5.012$.

2. Gradient $=\frac{3.6-2}4=0.4$. Intercept $=2$. So $\log_{10}y=0.4x+2$.

$y=10^{0.4x+2}=100\times10^{0.4x}=100\times(10^{0.4})^x\approx100\times2.512^x$.
`,
  ),
  lesson(
    "6.4 Exponential Growth and Decay",
    raw`
Exponential models arise when the rate of change of a quantity is proportional to its current value. Students must be able to find model constants, explore long-term behaviour, and evaluate limitations.

## Exponential Models

Growth: $P=P_0e^{kt}$ ($k>0$) Decay: $N=N_0e^{-\lambda t}$ ($\lambda>0$)

“Initial” means $t=0$: substituting gives the initial value.

“Long term” means $t\to\infty$: check whether the model predicts sensible behaviour.

“Half-life:” set $N=\frac12N_0$ and solve for $t$.

## Worked Examples

@card

Car A: value £20 000 when new, £16 000 after 1 year. Find the exponential model $V=V_0a^t$. After 10 years the value is £2 000. Evaluate the model’s reliability. Car B depreciates more slowly: explain how to adapt the equation.

Step 1: $V_0=20000$. At $t=1$: $16000=20000a$, so $a=0.8$.

The model is $V=20000\times0.8^t$.

Step 2: At $t=10$: $V=20000\times0.8^{10}\approx$ £2 147. The actual value is £2 000, so the model slightly overestimates. This suggests the depreciation rate may increase over time, making the model less reliable for long-term predictions.

Step 3: For Car B (slower depreciation), replace 0.8 with a value closer to 1, for example $V=20000\times0.85^t$.

@card

$f(x)\equiv4^{ax+b}$ where $a$ and $b$ are non-zero constants. Given $f(\frac23)=\frac14\sqrt[3]4$ and $f(\frac32)=\frac12\sqrt2$, find $a$ and $b$.

Write $4=2^2$, so $f(x)=2^{2(ax+b)}$.

Condition 1: $f(\frac23)=2^{2(2a/3+b)}=2^{4a/3+2b}$. And $\frac14\sqrt[3]4=2^{-2}\cdot2^{2/3}=2^{-4/3}$.

So $\frac{4a}3+2b=-\frac43$ … (1)

Condition 2: $f(\frac32)=2^{3a+2b}$. And $\frac12\sqrt2=2^{-1/2}$.

So $3a+2b=-\frac12$ … (2)

Step 3: Subtract (1) from (2): $3a-\frac{4a}3=-\frac12+\frac43$, so $\frac{5a}3=\frac56$, giving $a=\frac12$.

From (2): $\frac32+2b=-\frac12$, so $2b=-2$, $b=-1$.

## Practice Questions

1. A radioactive substance has half-life 5 years. Initially 100 g present. Find the mass after 12 years.

2. A model gives $T=25+60e^{-0.1t}$. State the initial temperature, the long-term temperature, and find $t$ when $T=40$.

3. $f(x)=3(2^{-x})-1$, $x\geq0$ and $g(x)=\log_2 x$, $x\geq1$. Sketch $f$, state its range, and find $f(g(x))$ in simplest form.

## Solutions to Practice Questions

1. $M=100\times(\frac12)^{t/5}$. At $t=12$: $M=100\times2^{-12/5}=100\times2^{-2.4}\approx18.9$ g.

2. Initial: $T(0)=25+60=85^\circ$. Long term: $e^{-0.1t}\to0$, so $T\to25^\circ$.

At $T=40$: $15=60e^{-0.1t}$, so $e^{-0.1t}=0.25$, $-0.1t=\ln0.25=-\ln4$, $t=10\ln4\approx13.9$.

3. Graph of $f$: $y$-intercept $(0,2)$, asymptote $y=-1$, decreasing. Range: $-1<f(x)\leq2$.

$f(g(x))=3(2^{-\log_2 x})-1=3\cdot\frac1x-1=\frac3x-1$.
`,
  ),
];
const exponentialDiagrams: LessonBlock[] = [1, -1].map((rate) => ({
  type: "diagram",
  description: `The curve y=e^${rate === 1 ? "x" : "(-x)"} passes through (0,1), ${rate === 1 ? "increases" : "decreases"} and approaches the horizontal axis asymptotically.`,
  drawing: {
    type: "function-curves",
    xRange: [-1.6, 1.6],
    yRange: [-0.25, 5.5],
    curves: [
      {
        kind: "exponential",
        rate,
        scale: 1,
        label: rate === 1 ? "y=e^x" : "y=e^{-x}",
      },
    ],
    points: [{ x: 0, y: 1, label: "(0,1)" }],
  },
}));
PURE_EXPONENTIAL_LESSONS[0].blocks.splice(2, 0, ...exponentialDiagrams);
