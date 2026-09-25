import { nativeLesson, transcript, group, table } from "./authoring.ts";
const raw = String.raw;
const lesson = (title: string, source: string) =>
  nativeLesson(
    "Pure Mathematics",
    "Chapter 7: Differentiation",
    title,
    transcript(source),
  );
export const PURE_DIFFERENTIATION_LESSONS = [
  lesson(
    "7.1 Differentiation from First Principles",
    raw`
The derivative of $f(x)$ is defined as $f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}h$. This limit gives the gradient of the tangent to $y=f(x)$ at the point $(x,f(x))$.

## First Principles

$$f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}h$$

Students must be able to apply this for small positive integer powers of $x$, and for $\sin x$ and $\cos x$.

## Worked Examples

@card

Given $y=x^2$, use differentiation from first principles to show that $\frac{dy}{dx}=2x$.

$$\begin{aligned}\frac{dy}{dx}&=\lim_{h\to0}\frac{(x+h)^2-x^2}h=\lim_{h\to0}\frac{x^2+2xh+h^2-x^2}h\\&=\lim_{h\to0}\frac{2xh+h^2}h=\lim_{h\to0}(2x+h)=2x\end{aligned}$$

@card

Differentiate $f(x)=x^3$ from first principles.

$(x+h)^3=x^3+3x^2h+3xh^2+h^3$. Therefore:

$$f'(x)=\lim_{h\to0}\frac{3x^2h+3xh^2+h^3}h=\lim_{h\to0}(3x^2+3xh+h^2)=3x^2$$

@card

Show from first principles that the derivative of $\sin x$ is $\cos x$.

Using the compound angle formula $\sin(x+h)=\sin x\cos h+\cos x\sin h$:

$$\begin{aligned}\frac{\sin(x+h)-\sin x}h&=\frac{\sin x\cos h+\cos x\sin h-\sin x}h\\&=\sin x\left(\frac{\cos h-1}h\right)+\cos x\left(\frac{\sin h}h\right)\end{aligned}$$

As $h\to0$: $\frac{\cos h-1}h\to0$ and $\frac{\sin h}h\to1$.

Therefore $\frac d{dx}(\sin x)=\sin x(0)+\cos x(1)=\cos x$.

## Practice Questions

1. Differentiate $f(x)=5x^2-3x$ from first principles.

2. Differentiate $\frac1{x^2-2x}$ from first principles.

## Solutions to Practice Questions

1. $f(x+h)=5(x+h)^2-3(x+h)=5x^2+10xh+5h^2-3x-3h$.

$f(x+h)-f(x)=10xh+5h^2-3h$. Dividing by $h$: $10x+5h-3\to10x-3$ as $h\to0$.

2. Let $f(x)=(x^2-2x)^{-1}$.

$$\frac{f(x+h)-f(x)}h=\frac1h\left[\frac1{(x+h)^2-2(x+h)}-\frac1{x^2-2x}\right]$$

Combining over a common denominator, the numerator simplifies to:

$$(x^2-2x)-[(x+h)^2-2(x+h)]=-2xh-h^2+2h=h(-2x-h+2)$$

Cancel $h$ and take the limit as $h\to0$:

$$f'(x)=\frac{2-2x}{(x^2-2x)^2}$$
`,
  ),
  lesson(
    "7.2 Standard Derivatives and Basic Rules",
    raw`
## Worked Examples

$y=4x^3-7x^2+5x-10$. Find $\frac{dy}{dx}$ and $\frac{d^2y}{dx^2}$. Find the exact $x$ when $\frac{d^2y}{dx^2}=0$.

$\frac{dy}{dx}=12x^2-14x+5$. $\frac{d^2y}{dx^2}=24x-14$.

Setting $24x-14=0$: $x=\frac7{12}$.

$y=\frac{5x^2+10x}{(x+1)^2}$, $x\neq-1$. Show $\frac{dy}{dx}=\frac A{(x+1)^n}$ and find $A,n$.

Apply the quotient rule with $u=5x^2+10x$ and $v=(x+1)^2$:

$$\begin{aligned}\frac{dy}{dx}&=\frac{(x+1)^2(10x+10)-(5x^2+10x)\cdot2(x+1)}{(x+1)^4}\\&=\frac{(x+1)[10(x+1)^2-2(5x^2+10x)]}{(x+1)^4}\\&=\frac{10x^2+20x+10-10x^2-20x}{(x+1)^3}=\frac{10}{(x+1)^3}\end{aligned}$$

So $A=10$, $n=3$. The derivative is negative when $x<-1$.

## Practice Questions

1. Differentiate $y=(2x+5)(x-1)$ by expanding first.

2. Find $f'(x)$ where $f(x)=3e^{2x}-4\sin3x+\ln x$.

3. Find the gradient of $y=5\tan2x$ at $x=\pi/8$.

## Solutions to Practice Questions

1. $y=2x^2+3x-5$. $\frac{dy}{dx}=4x+3$.

2. $f'(x)=6e^{2x}-12\cos3x+\frac1x$.

3. $\frac{dy}{dx}=10\sec^22x$. At $x=\pi/8$: $\sec^2(\pi/4)=(\sqrt2)^2=2$. Gradient $=20$.
`,
  ),
  lesson(
    "7.3 Chain Rule, Product Rule and Quotient Rule",
    raw`
## Differentiation Rules

Chain rule:

$$\frac d{dx}[f(g(x))]=f'(g(x))\cdot g'(x)$$

Product rule:

$$\frac d{dx}(uv)=u\frac{dv}{dx}+v\frac{du}{dx}$$

Quotient rule:

$$\frac d{dx}(\tfrac uv)=\frac{v\frac{du}{dx}-u\frac{dv}{dx}}{v^2}$$

Connected rates:

$$\frac{dV}{dt}=\frac{dV}{dr}\times\frac{dr}{dt}$$

These also give: $\frac d{dx}(\sec x)=\sec x\tan x$, $\frac d{dx}(\csc x)=-\csc x\cot x$, $\frac d{dx}(\cot x)=-\csc^2x$.

## Worked Examples

@card

$f(x)=\frac{2x-3}{x^2+4}$. Show $f'(x)=\frac{-2x^2+6x+8}{(x^2+4)^2}$. Find where $f$ is decreasing.

Quotient rule with $u=2x-3$, $v=x^2+4$:

$$f'(x)=\frac{(x^2+4)(2)-(2x-3)(2x)}{(x^2+4)^2}=\frac{2x^2+8-4x^2+6x}{(x^2+4)^2}=\frac{-2x^2+6x+8}{(x^2+4)^2}$$

For $f$ decreasing, $f'(x)<0$. Since $(x^2+4)^2>0$, need $-2x^2+6x+8<0$, i.e. $x^2-3x-4>0$, i.e. $(x-4)(x+1)>0$. This holds when $x<-1$ or $x>4$.

@card

$f(x)=3\ln2x$, $g(x)=2x^2+1$. Show gradient on $y=gf(x)$ at $x=e$ is $\frac{36}e(1+\ln2)$.

$gf(x)=g(3\ln2x)=2(3\ln2x)^2+1=18(\ln2x)^2+1$.

Differentiating by the chain rule: $\frac d{dx}[18(\ln2x)^2]=36\ln2x\cdot\frac1x=\frac{36\ln2x}x$.

At $x=e$: $\ln2e=\ln2+1$, so the gradient is $\frac{36(1+\ln2)}e$.

## Practice Questions

1. Differentiate $y=2x^4\sin x$.

2. Differentiate $y=\cos^2x$.

3. A sphere has radius increasing at 0.3 cm/s. Find the rate of increase of surface area when $r=5$.

## Solutions to Practice Questions

1. Product rule: $\frac{dy}{dx}=8x^3\sin x+2x^4\cos x=2x^3(4\sin x+x\cos x)$.

2. Chain rule: $\frac{dy}{dx}=2\cos x\cdot(-\sin x)=-2\sin x\cos x=-\sin2x$.

3. $A=4\pi r^2$, $\frac{dA}{dr}=8\pi r$. $\frac{dA}{dt}=8\pi(5)(0.3)=12\pi$ cm²/s.
`,
  ),
  lesson(
    "7.4 Applications of Differentiation",
    raw`
## Key Applications

Tangent at $(a,f(a))$: $y-f(a)=f'(a)(x-a)$

Normal: $y-f(a)=-\frac1{f'(a)}(x-a)$

Stationary points: $f'(x)=0$. Nature: $f''(x)>0$ (min), $f''(x)<0$ (max).

Points of inflection: $f''(x)$ changes sign.

Increasing: $f'(x)>0$. Decreasing: $f'(x)<0$.

## Worked Examples

@card

Open cylinder, radius $r$, height $h$, capacity 1500 cm³. Show $A=\pi r^2+\frac{3000}r$, find $r$ for minimum $A$, confirm minimum, calculate $A$.

Step 1: $\pi r^2h=1500$, so $h=\frac{1500}{\pi r^2}$. Surface area (base + side): $A=\pi r^2+2\pi rh=\pi r^2+\frac{3000}r$.

Step 2: $\frac{dA}{dr}=2\pi r-\frac{3000}{r^2}=0$. So $r^3=\frac{1500}\pi$, $r=(\frac{1500}\pi)^{1/3}\approx7.82$ cm.

Step 3: $\frac{d^2A}{dr^2}=2\pi+\frac{6000}{r^3}>0$ always. Minimum confirmed.

Step 4: $A=\pi(7.82)^2+\frac{3000}{7.82}\approx192+384\approx576$ cm².

## Practice Questions

1. Find the equation of the tangent to $y=x^3-3x+2$ at $(1,0)$.

2. Find and classify the stationary points of $y=x^3-6x^2+9x+1$.

## Solutions to Practice Questions

1. $\frac{dy}{dx}=3x^2-3$. At $(1,0)$: gradient $=0$. Tangent: $y=0$.

2. $\frac{dy}{dx}=3(x-1)(x-3)=0$: $x=1$ ($y=5$) and $x=3$ ($y=1$). $f''(x)=6x-12$. At $x=1$: $f''=-6<0$ (max). At $x=3$: $f''=6>0$ (min).
`,
  ),
  lesson(
    "7.5 Implicit and Parametric Differentiation",
    raw`
Implicit: Differentiate each term w.r.t. $x$, using chain rule for $y$-terms: $\frac d{dx}(y^n)=ny^{n-1}\frac{dy}{dx}$.

Parametric: $\frac{dy}{dx}=\frac{dy/dt}{dx/dt}$. Also: $\frac{dy}{dx}=\frac1{dx/dy}$.

## Worked Examples

@card

Curve: $\frac{3x^2}y-5y=2(x+8)$. Find the stationary point.

Differentiate implicitly ($3x^2y^{-1}-5y=2x+16$):

$$6xy^{-1}-3x^2y^{-2}\frac{dy}{dx}-5\frac{dy}{dx}=2$$

At a stationary point $\frac{dy}{dx}=0$, so $\frac{6x}y=2$, giving $y=3x$.

Substitute $y=3x$ into the original: $\frac{3x^2}{3x}-15x=2x+16$, so $x-15x=2x+16$, giving $-16x=16$, $x=-1$, $y=-3$.

The stationary point is $(-1,-3)$.

@card

Curve $C$: $(x+y)^3=3x^2-3y-2$. Find $\frac{dy}{dx}$. Show the normal at $P(1,0)$ is $y=-2x+2$. Prove the normal does not meet $C$ again.

Step 1: Differentiate: $3(x+y)^2(1+\frac{dy}{dx})=6x-3\frac{dy}{dx}$.

$\frac{dy}{dx}[3(x+y)^2+3]=6x-3(x+y)^2$, so $\frac{dy}{dx}=\frac{2x-(x+y)^2}{(x+y)^2+1}$.

Step 2: At $(1,0)$: $\frac{dy}{dx}=\frac{2-1}{1+1}=\frac12$. Normal gradient $=-2$. Normal: $y=-2(x-1)=-2x+2$.

Step 3: Substitute $y=-2x+2$ into $(x+y)^3=3x^2-3y-2$:

$(-x+2)^3=3x^2+6x-6-2$, so $-x^3+6x^2-12x+8=3x^2+6x-8$.

$x^3-3x^2+18x-16=0$. Since $x=1$ is known: $(x-1)(x^2-2x+16)=0$.

The discriminant of $x^2-2x+16$ is $4-64=-60<0$: no further real roots. The normal meets $C$ only at $P$.

$y=\arcsin2x$, $-\frac12\leq x\leq\frac12$. Show $\frac{dy}{dx}=\frac2{\sqrt{1-4x^2}}$.

From $y=\arcsin2x$, we have $\sin y=2x$. Differentiate implicitly:

$\cos y\cdot\frac{dy}{dx}=2$, so $\frac{dy}{dx}=\frac2{\cos y}$.

Since $\sin y=2x$ and $\cos y=\sqrt{1-\sin^2y}=\sqrt{1-4x^2}$ (positive because $-\frac\pi2\leq y\leq\frac\pi2$):

$$\frac{dy}{dx}=\frac2{\sqrt{1-4x^2}}$$

## Practice Questions

1. Find $\frac{dy}{dx}$ for $x^2+y^2=25$ and the gradient at $(3,4)$.

2. Curve: $x=t^2$, $y=t^3-3t$. Find the gradient at $t=2$.

3. At point $P$ on $y^3-y^2=e^x$, the gradient is $\frac65$. Find the coordinates of $P$.

## Solutions to Practice Questions

1. $2x+2y\frac{dy}{dx}=0$, $\frac{dy}{dx}=-x/y$. At $(3,4)$: gradient $=-3/4$.

2. $\frac{dx}{dt}=2t$, $\frac{dy}{dt}=3t^2-3$. $\frac{dy}{dx}=\frac{3t^2-3}{2t}$. At $t=2$: $\frac94$.

3. Implicit differentiation: $(3y^2-2y)\frac{dy}{dx}=e^x$, so $\frac{dy}{dx}=\frac{e^x}{3y^2-2y}=\frac65$.

Then $5e^x=6(3y^2-2y)=18y^2-12y$. Using $e^x=y^3-y^2$:

$5(y^3-y^2)=18y^2-12y$, so $5y^3-23y^2+12y=0$, $y(5y^2-23y+12)=0$.

$y=0$ is rejected (makes $\frac{dy}{dx}$ undefined). $5y^2-23y+12=0$: $y=\frac{23\pm17}{10}$.

$y=4$: $e^x=64-16=48$, $x=\ln48$. $y=3/5$: $e^x=27/125-9/25=-18/125<0$ (rejected).

$P=(\ln48,4)$.
`,
  ),
  lesson(
    "7.6 Constructing Differential Equations",
    raw`
## Key Translations

“Rate of change of $y$” → $\frac{dy}{dt}$. “Proportional to $y$” → $=ky$. “Rate of decrease” → negative sign.

“Inversely proportional to $\sqrt r$” → $=k/\sqrt r$.

## Worked Examples

@card

The rate of increase of a balloon’s radius is inversely proportional to $\sqrt r$. At $t=10$, $r=16$ cm and increasing at 0.9 cm/s. Write the DE.

$\frac{dr}{dt}=\frac k{\sqrt r}$. At $r=16$: $0.9=k/4$, so $k=3.6$. The DE is $\frac{dr}{dt}=\frac{3.6}{\sqrt r}$.

## Practice Questions

1. A population $P$ grows proportionally to $P$. Initially $P=500$, growing at 20/day. Write the DE.

2. Rate of decrease of radius of a dissolving mint is inversely proportional to $r^2$. Write the DE.

## Solutions to Practice Questions

1. $\frac{dP}{dt}=kP$. At $P=500$: $20=500k$, $k=0.04$. DE: $\frac{dP}{dt}=0.04P$.

2. $\frac{dr}{dt}=-\frac k{r^2}$ for some $k>0$ (negative because decreasing).
`,
  ),
];
PURE_DIFFERENTIATION_LESSONS[1].blocks.unshift(
  group("Standard Derivatives", [
    table(
      ["$f(x)$", "$f'(x)$"],
      [
        ["$x^n$ (rational $n$)", "$nx^{n-1}$"],
        ["$e^{kx}$", "$ke^{kx}$"],
        ["$a^{kx}$", raw`$ka^{kx}\ln a$`],
        [raw`$\ln x$`, "$1/x$"],
        [raw`$\sin kx$`, raw`$k\cos kx$`],
        [raw`$\cos kx$`, raw`$-k\sin kx$`],
        [raw`$\tan kx$`, raw`$k\sec^2kx$`],
      ],
    ),
  ]),
);
