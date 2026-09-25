import { nativeLesson, transcript } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (
  title: string,
  source: string,
  diagrams: Record<string, LessonBlock> = {},
) =>
  nativeLesson(
    "Statistics",
    "Chapter 10: The Normal Distribution",
    title,
    transcript(source, diagrams),
  );
export function normalDiagram(
  mean: number,
  sigma: number,
  ticks: { x: number; label: string }[],
  description: string,
  label: string,
  shade?: [number, number][],
): LessonBlock {
  return {
    type: "diagram",
    description,
    drawing: {
      type: "function-curves",
      xRange: [mean - 3.4 * sigma, mean + 3.4 * sigma],
      yRange: [0, 0.45 / sigma],
      yAxisAt: mean - 3.4 * sigma,
      yLabel: "f(x)",
      curves: [{ kind: "normal", mean, sigma, label }],
      ticks,
      shade,
    },
  };
}
export const STATISTICS_NORMAL_A_LESSONS = [
  lesson(
    "10.1 The Normal Distribution",
    raw`
A continuous random variable can take any value in an interval. Unlike discrete distributions, where probabilities attach to individual outcomes, a continuous random variable has probability zero of taking any specific value; probability attaches to intervals instead, computed as areas under a probability density curve.

Many continuous variables in nature — heights of adults, weights of animals, measurement errors — cluster around a central value with rarer extremes in both directions. The normal distribution is a mathematical idealisation of this clustering: a single bell-shaped curve, symmetric about a mean $\mu$, with a spread controlled by the standard deviation $\sigma$.

## The normal distribution

$$X\sim\mathrm N(\mu,\sigma^2)$$

The two parameters are $\mu$, the population mean, and $\sigma^2$, the population variance. The distribution

is symmetric about $\mu$, so $\mu=$ mean $=$ median $=$ mode;

has a bell-shaped curve with asymptotes at each end;

has total area under the curve equal to 1;

has points of inflection at $\mu-\sigma$ and $\mu+\sigma$.

Landmark percentages. For $X\sim\mathrm N(\mu,\sigma^2)$,

approximately 68% of values lie within 1 standard deviation of $\mu$;

approximately 95% lie within 2 standard deviations of $\mu$;

approximately 99.7% lie within 3 standard deviations of $\mu$.

@diagram normal

Although a normal random variable could in principle take any value on the real line, in practice observations more than 5 standard deviations from $\mu$ have probability so close to zero that they are negligible. This is why we can use large numbers like $\mu+100\sigma$ as effective “upper limits” in calculator routines without affecting the answer.

## Worked examples

Example 3.1.1. The diameters of a rivet produced by a particular machine, $X$ mm, is modelled as $X\sim\mathrm N(8,0.2^2)$. Find:

(a) $P(X>8)$,

(b) $P(7.8<X<8.2)$.

(a) The value 8 is the mean of the distribution. The normal curve is symmetric about the mean, so

$$P(X>\mu)=0.5,\quad\text{so }P(X>8)=0.5.$$

(b) The limits 7.8 and 8.2 are each exactly one standard deviation from the mean of 8 (since $\sigma=0.2$). Using the landmark 68% rule,

$$P(\mu-\sigma<X<\mu+\sigma)\approx0.68,$$

so $P(7.8<X<8.2)\approx0.68$.

Example 3.1.2. The lengths of a colony of adders, $Y$ cm, are modelled as $Y\sim\mathrm N(100,\sigma^2)$. Given that 68% of the adders have a length between 93 cm and 107 cm, find $\sigma^2$.

The landmark 68% corresponds to the interval $(\mu-\sigma,\mu+\sigma)$. Here $\mu=100$ and the given interval is $(93,107)$, which is symmetric about 100 with half-width 7. Therefore $\sigma=7$ and

$$\sigma^2=49.$$

Example 3.1.3. The weights of a group of dormice, $D$ grams, are modelled as $D\sim\mathrm N(\mu,25)$. Given that 97.5% of dormice weigh less than 70 grams, find $\mu$.

Variance $=25$, so $\sigma=5$. By the 95% rule,

$$P(\mu-2\sigma<D<\mu+2\sigma)\approx0.95.$$

The 2.5% that lie above $\mu+2\sigma$, combined with the 50% below the mean and the 47.5% between the mean and $\mu+2\sigma$, give 97.5% of the population below $\mu+2\sigma$.

So $\mu+2\sigma=70$, and

$$\mu+2\times5=70\implies\mu=60.$$

## Practice questions

1. The lengths, $X$ mm, of a bolt produced by a particular machine are normally distributed with mean 35 mm and standard deviation 0.4 mm. Sketch the distribution of $X$.

2. The armspans of a group of Year 5 pupils, $X$ cm, are modelled as $X\sim\mathrm N(120,16)$.

(a) State the proportion of pupils with armspan between 116 cm and 124 cm.

(b) State the proportion of pupils with armspan between 112 cm and 128 cm.

3. The masses of pigs on a farm, $M$ kg, are modelled as $M\sim\mathrm N(\mu,\sigma^2)$. Given that 84% of pigs weigh more than 52 kg and 97.5% of pigs weigh more than 47.5 kg, find $\mu$ and $\sigma^2$.

4. The diagram shows the distribution of heights, in cm, of barn owls in the UK. An ornithologist notices that the distribution is approximately normal, with marked inflection points visibly at heights 32 cm and 40 cm and an axis of symmetry at 36 cm.

(a) State the value of the mean height.

(b) Estimate the standard deviation of the heights.

## Solutions

Practice 1. $X\sim\mathrm N(35,0.4^2)$. Sketch.

The curve is a bell shape symmetric about $x=35$ with points of inflection at $x=34.6$ and $x=35.4$. The horizontal axis extends slightly past $\mu\pm3\sigma$, i.e. from about 33.8 to 36.2, after which the curve effectively touches the axis.

@diagram bolts

Practice 2. $X\sim\mathrm N(120,16)$, so $\sigma=4$.

(a) The interval $(116,124)$ is $(\mu-\sigma,\mu+\sigma)$, so the proportion is approximately 0.68.

(b) The interval $(112,128)$ is $(\mu-2\sigma,\mu+2\sigma)$, so the proportion is approximately 0.95.

Practice 3. $M\sim\mathrm N(\mu,\sigma^2)$. 84% weigh more than 52; 97.5% weigh more than 47.5. Find $\mu$ and $\sigma^2$.

84% above 52 means 16% below 52, which is approximately the proportion below $\mu-\sigma$ by the 68% rule. So $\mu-\sigma=52$.

97.5% above 47.5 means 2.5% below 47.5, which by the 95% rule corresponds to $\mu-2\sigma=47.5$.

Subtracting the two equations:

$$(\mu-\sigma)-(\mu-2\sigma)=52-47.5\implies\sigma=4.5.$$

Substituting back, $\mu=52+4.5=56.5$. So $\mu=56.5$ and $\sigma^2=20.25$.

Practice 4. Barn owl heights, inflection at 32 and 40, symmetry at 36.

(a) By symmetry, the mean height is 36 cm.

(b) The points of inflection on the normal curve occur at $\mu\pm\sigma$, so $\sigma=40-36=4$ cm (or equivalently $36-32=4$ cm). An estimate of the standard deviation is 4 cm.
`,
    {
      normal: normalDiagram(
        0,
        1,
        [-2, -1, 0, 1, 2].map((x, i) => ({
          x,
          label: [
            raw`\mu-2\sigma`,
            raw`\mu-\sigma`,
            raw`\mu`,
            raw`\mu+\sigma`,
            raw`\mu+2\sigma`,
          ][i],
        })),
        "A symmetric normal density centred on mu, with horizontal-axis labels mu minus two sigma, mu minus sigma, mu, mu plus sigma and mu plus two sigma.",
        raw`X\sim\mathrm N(\mu,\sigma^2)`,
      ),
      bolts: normalDiagram(
        35,
        0.4,
        [34.6, 35, 35.4].map((x) => ({ x, label: String(x) })),
        "A bell-shaped normal density centred at 35 with standard deviation 0.4. Inflection positions 34.6 and 35.4 are labelled on the horizontal axis.",
        raw`X\sim\mathrm N(35,0.4^2)`,
      ),
    },
  ),
  lesson(
    "10.2 Finding Probabilities for Normal Distributions",
    raw`
The landmark percentages of Section 3.1 handle only intervals that are integer multiples of the standard deviation. For any other interval we use the normal cumulative distribution function (normal CDF) on a scientific or graphical calculator.

The calculator routine takes four inputs: a lower limit $a$, an upper limit $b$, the mean $\mu$ and the standard deviation $\sigma$. It returns

$$P(a<X<b)=\int_a^b f(x)\,dx,$$

the area under the normal curve between $a$ and $b$. Because the normal distribution is continuous, $P(X=a)=0$, so $<$ and $\leq$ can be used interchangeably. This is a major practical difference from the binomial distribution, where $P(X=a)$ need not be zero.

## Using the calculator for normal probabilities

To find $P(a<X<b)$ for $X\sim\mathrm N(\mu,\sigma^2)$:

Enter the lower limit $a$, the upper limit $b$, the mean $\mu$, and the standard deviation $\sigma$.

If the region has no lower bound, use a small value at least $5\sigma$ below $\mu$, e.g. $-100$ or $-1000$.

If the region has no upper bound, use a large value at least $5\sigma$ above $\mu$, e.g. 100 or 1000.

The calculator expects $\sigma$, not $\sigma^2$. When the problem gives variance, take the square root first.

Always sketch the required region before calculating, so that you can check whether your answer should be above or below 0.5.

## Worked examples

Example 3.2.1. $X\sim\mathrm N(30,4^2)$. Find:

(a) $P(X<33)$,

(b) $P(X\geq24)$,

(c) $P(33.5<X<38.2)$,

(d) $P(X<27\text{ or }X>32)$.

$\mu=30$, $\sigma=4$.

(a) 33 is above the mean, so the shaded left tail to 33 should have probability greater than 0.5. Using the calculator with lower limit $-100$, upper limit 33:

$$P(X<33)=0.7734\quad(4\text{ d.p.}).$$

(b) Use the fact that $P(X\geq24)=P(X>24)$ for a continuous distribution. Upper limit 100, lower limit 24:

$$P(X\geq24)=0.9332\quad(4\text{ d.p.}).$$

(c) Both limits are above the mean, so the probability should be small. Lower 33.5, upper 38.2:

$$P(33.5<X<38.2)=0.1706\quad(4\text{ d.p.}).$$

(d) Use the complement:

$$\begin{aligned}P(X<27\text{ or }X>32)&=1-P(27<X<32)\\&=1-0.4648=0.5352\quad(4\text{ d.p.}).\end{aligned}$$

Example 3.2.2. An IQ test is applied to a population of adults. The scores, $X$, on the test are normally distributed with $X\sim\mathrm N(100,15^2)$. Adults scoring more than 140 are classified as ‘genius’.

(a) Find the probability that a randomly chosen adult is classified as ‘genius’. Give your answer to 3 significant figures.

(b) Twenty adults take the test. Find the probability that two or more are classified as ‘genius’.

(a) Lower 140, upper 200:

$$P(X>140)=0.00383\quad(3\text{ s.f.}).$$

(b) Let $Y$ be the number of adults in a random sample of 20 who are classified as genius. Each adult is classified independently with probability 0.00383, so

$$Y\sim\mathrm B(20,0.00383).$$

$$P(Y\geq2)=1-P(Y\leq1).$$

Using the binomial CDF on a calculator,

$$P(Y\leq1)=0.9973379\ldots$$

so

$$P(Y\geq2)=1-0.9973379\ldots=0.00266\quad(3\text{ s.f.}).$$

Example 3.2.3. The heights of a large group of women are normally distributed with a mean of 165 cm and a standard deviation of 3.5 cm. A woman is selected at random.

(a) Find the probability that she is shorter than 160 cm.

Steven is looking for a woman whose height is between 168 cm and 174 cm for a part in his next film.

(b) Find the proportion of women who meet Steven’s criteria.

A sample of 20 women is taken.

(c) Find the probability that at least 5 of them meet Steven’s criteria.

Let $H$ be the height. $H\sim\mathrm N(165,3.5^2)$.

(a) Lower 50, upper 160:

$$P(H<160)=0.0766\quad(4\text{ d.p.}).$$

(b) Lower 168, upper 174:

$$P(168<H<174)=0.1907\quad(4\text{ d.p.}).$$

(c) Let $Y$ be the number of women in a random sample of 20 who meet Steven’s criteria. Then $Y\sim\mathrm B(20,0.1907)$.

$$P(Y\geq5)=1-P(Y\leq4)=1-0.7568=0.2432\quad(4\text{ d.p.}).$$

## Practice questions

1. The random variable $X\sim\mathrm N(30,2^2)$. Find (a) $P(X<33)$, (b) $P(X>26)$, (c) $P(X\geq31.6)$.

2. The random variable $X\sim\mathrm N(40,9)$ (so variance $=9$, $\sigma=3$). Find (a) $P(X>45)$, (b) $P(X\leq38)$, (c) $P(41\leq X\leq44)$.

3. The random variable $M\sim\mathrm N(15,1.5^2)$.

(a) Find (i) $P(M>14)$ and (ii) $P(M<14)$.

(b) Calculate the sum of your answers to (a)(i) and (a)(ii) and comment on your answer.

4. The amount of mineral water, $W$ ml, in a bottle produced by a certain manufacturer is modelled as $W\sim\mathrm N(500,14^2)$.

(a) Find (i) $P(W>505)$ and (ii) $P(W<490)$.

A sample of 4 bottles is taken.

(b) Find the probability that all 4 bottles contain more than 490 ml.

## Solutions

Practice 1. $X\sim\mathrm N(30,2^2)$.

Using the calculator with $\mu=30$, $\sigma=2$:

$$P(X<33)=0.9332\quad(4\text{ d.p.}),$$

$$P(X>26)=0.9772\quad(4\text{ d.p.}),$$

$$P(X\geq31.6)=0.2119\quad(4\text{ d.p.}).$$

Practice 2. $X\sim\mathrm N(40,9)$.

Variance 9, so $\sigma=3$. Using the calculator with $\mu=40$, $\sigma=3$:

$$P(X>45)=0.0478\quad(4\text{ d.p.}),$$

$$P(X\leq38)=0.2525\quad(4\text{ d.p.}),$$

$$P(41\leq X\leq44)=0.2789\quad(4\text{ d.p.}).$$

Practice 3. $M\sim\mathrm N(15,1.5^2)$.

(a)

$$P(M>14)=0.7475\quad(4\text{ d.p.}),$$

$$P(M<14)=0.2525\quad(4\text{ d.p.}).$$

(b) The sum is $0.7475+0.2525=1$. This is because the events $\{M>14\}$ and $\{M<14\}$ are complementary (their union is the whole real line, apart from the zero-probability point $M=14$), so their probabilities must add to 1.

Practice 4. $W\sim\mathrm N(500,14^2)$.

(a)

$$P(W>505)=0.3606\quad(4\text{ d.p.}),$$

$$P(W<490)=0.2375\quad(4\text{ d.p.}).$$

(b) Let $Y$ be the number of the four bottles that contain more than 490 ml. Each bottle is independent, and each individually has

$$P(W>490)=1-0.2375=0.7625.$$

Then $Y\sim\mathrm B(4,0.7625)$ and

$$P(Y=4)=0.7625^4=0.3380\quad(4\text{ d.p.}).$$
`,
  ),
  lesson(
    "10.3 The Inverse Normal Distribution Function",
    raw`
The normal CDF of Section 3.2 answers “what is the probability that $X$ lies in this interval?”. The reverse question — “what value of $X$ has a given probability to its left?” — is answered by the inverse normal distribution function.

## The inverse normal function

For $X\sim\mathrm N(\mu,\sigma^2)$ and a given probability $p$, the inverse normal function returns the value $a$ such that

$$P(X<a)=p.$$

Key manoeuvres:

Right-tail: if $P(X>a)=p$, use the calculator with the left-tail probability $1-p$.

Interval: $P(c<X<a)=p$ implies $P(X<a)=p+P(X<c)$, which is then solvable.

Sketch the region every time. A left-tail probability greater than 0.5 means $a>\mu$; less than 0.5 means $a<\mu$.

## Worked examples

Example 3.3.1. $X\sim\mathrm N(20,3^2)$. Find, correct to 2 decimal places, the values of $a$ such that:

(a) $P(X<a)=0.75$,

(b) $P(X>a)=0.4$,

(c) $P(16<X<a)=0.3$.

(a) Directly using the inverse normal with $\mu=20$, $\sigma=3$, $p=0.75$:

$$a=22.02\quad(2\text{ d.p.}).$$

(b) $P(X>a)=0.4$ means $P(X<a)=0.6$. Using the inverse normal with $p=0.6$:

$$a=20.76\quad(2\text{ d.p.}).$$

Since $a>\mu=20$, this is sensible (a right-tail probability less than 0.5 must cut off a value above the mean).

(c) You cannot read this off directly. Split the interval:

$$P(X<a)=P(X<16)+P(16<X<a).$$

First compute $P(X<16)=0.09121$ using the normal CDF. Then

$$P(X<a)=0.09121+0.3=0.39121.$$

Using the inverse normal with $p=0.39121$:

$$a=19.17\quad(2\text{ d.p.}).$$

Example 3.3.2. Plates made using a particular process have diameter $D$ cm modelled by $D\sim\mathrm N(20,1.5^2)$.

(a) Given that 60% of plates have a diameter less than $x$ cm, find $x$.

(b) Find the interquartile range of the plate diameters.

(a) Use the inverse normal with $\mu=20$, $\sigma=1.5$, $p=0.6$:

$$x=20.38\quad(2\text{ d.p.}).$$

(b) The lower quartile $Q_1$ satisfies $P(D<Q_1)=0.25$, and the upper quartile $Q_3$ satisfies $P(D<Q_3)=0.75$. Using the inverse normal twice:

$$Q_1=18.99,\quad Q_3=21.01\quad(2\text{ d.p.}).$$

$IQR=Q_3-Q_1=21.01-18.99=2.02$ (2 d.p.).

Note $Q_1$ and $Q_3$ are equidistant from the mean 20, reflecting the symmetry of the normal distribution.

## Practice questions

1. The random variable $X\sim\mathrm N(30,5^2)$. Find the value of $a$, to 2 decimal places, such that:

(a) $P(X<a)=0.3$,

(b) $P(X<a)=0.75$,

(c) $P(X>a)=0.4$,

(d) $P(32<X<a)=0.2$.

2. The masses, $M$ kg, of a population of badgers are modelled as $M\sim\mathrm N(4.5,0.6^2)$. Find:

(a) the lower quartile,

(b) the 80th percentile.

3. The masses, $Y$ grams, of a brand of chocolate bar are modelled as $Y\sim\mathrm N(60,2^2)$. Find:

(a) the value of $y$ such that $P(Y>y)=0.2$,

(b) the 10% to 90% interpercentile range of masses.

## Solutions

Practice 1. $X\sim\mathrm N(30,5^2)$.

(a) Inverse normal with $\mu=30$, $\sigma=5$, $p=0.3$: $a=27.38$ (2 d.p.).

(b) Inverse normal, $p=0.75$: $a=33.37$ (2 d.p.).

(c) $P(X>a)=0.4\Rightarrow P(X<a)=0.6$. Inverse normal, $p=0.6$: $a=31.27$ (2 d.p.).

(d) Need $P(32<X<a)=0.2$.

$$P(X<32)=0.6554\quad(4\text{ d.p.}).$$

So $P(X<a)=0.6554+0.2=0.8554$. Inverse normal, $p=0.8554$: $a=35.30$ (2 d.p.).

Practice 2. $M\sim\mathrm N(4.5,0.6^2)$.

(a) Lower quartile. $P(M<Q_1)=0.25$. Inverse normal, $p=0.25$:

$$Q_1=4.10\quad(2\text{ d.p.}).$$

(b) 80th percentile. $P(M<M_{80})=0.80$. Inverse normal, $p=0.80$:

$$M_{80}=5.00\quad(2\text{ d.p.}).$$

Practice 3. $Y\sim\mathrm N(60,2^2)$.

(a) $P(Y>y)=0.2\Rightarrow P(Y<y)=0.8$. Inverse normal:

$$y=61.68\quad(2\text{ d.p.}).$$

(b) 10% to 90% interpercentile range. Let $y_{10},y_{90}$ be the 10th and 90th percentiles.

$P(Y<y_{10})=0.1\Rightarrow y_{10}=57.44$, $P(Y<y_{90})=0.9\Rightarrow y_{90}=62.56$.

Interpercentile range $=62.56-57.44=5.13$ grams (2 d.p.).
`,
  ),
];
