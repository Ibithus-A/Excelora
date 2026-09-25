import { nativeLesson, transcript, table } from "./authoring.ts";
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
export const STATISTICS_NORMAL_B_LESSONS = [
  lesson(
    "10.4 The Standard Normal Distribution",
    raw`
Every normal distribution has the same bell shape, just shifted (by the mean $\mu$) and stretched (by the standard deviation $\sigma$). It is often useful to rescale a normal variable so that it fits a single universal normal distribution — the standard normal distribution $Z\sim\mathrm N(0,1^2)$, with mean 0 and standard deviation 1. Probabilities on the standard curve are tabulated in the Mathematical Formulae and Statistical Tables booklet, and this allows exam-style use without relying on a calculator’s inverse normal feature.

## The coding formula

If $X\sim\mathrm N(\mu,\sigma^2)$, then the coded variable

$$Z=\frac{X-\mu}{\sigma}$$

satisfies $Z\sim\mathrm N(0,1^2)$. The probability $P(Z<a)$ for this coded variable is sometimes written $\Phi(a)$.

Key facts:

The standard normal has mean 0 and standard deviation 1.

$P(Z<a)=\Phi(a)$; by symmetry, $\Phi(-a)=1-\Phi(a)$.

The percentage-points table gives values of $z$ such that $P(Z>z)=p$ for selected $p$, e.g. $z=1.6449$ for $p=0.05$, $z=1.96$ for $p=0.025$, $z=2.5758$ for $p=0.005$.

## Using the percentage-points table

The table provided in the formula booklet lists values of $z$ such that

$$P(Z>z)=p$$

for common values of $p$. The most-used entries are:

@diagram table

For negative $z$, use the symmetry $P(Z<-z)=P(Z>z)$, which means $P(Z>-z)=1-P(Z>z)$. For example, $P(Z<-1.96)=0.025$ and hence $P(Z>-1.96)=0.975$.

## Worked examples

Example 3.4.1. The random variable $X\sim\mathrm N(50,4^2)$. Write in terms of $\Phi(z)$ for some value $z$:

(a) $P(X<53)$,

(b) $P(X\ge55)$.

(a) Code with $\mu=50$, $\sigma=4$:

$$z=\frac{53-50}{4}=0.75.$$

So

$$P(X<53)=P(Z<0.75)=\Phi(0.75).$$

(b) Use $P(X\ge55)=1-P(X<55)$. Code:

$$z=\frac{55-50}{4}=1.25,\qquad P(X<55)=\Phi(1.25).$$

Therefore

$$P(X\ge55)=1-\Phi(1.25).$$

Example 3.4.2. The systolic blood pressure of an adult population, $S$ mmHg, is modelled as a normal distribution with mean 127 and standard deviation 16. A medical researcher wants to study adults with blood pressure higher than the 95th percentile. Find the minimum blood pressure for an adult included in the study.

$S\sim\mathrm N(127,16^2)$. The researcher needs $s$ such that $P(S>s)=0.05$, i.e. $P(S<s)=0.95$.

From the percentage-points table, $P(Z>1.6449)=0.05$. Equating:

$$\frac{s-127}{16}=1.6449,$$

so

$$s=127+16\times1.6449=153.3184=153\ (3\text{ s.f.}).$$

The researcher should include adults with blood pressure greater than 153 mmHg.

Remember: the denominator is $\sigma$, not $\sigma^2$.

## Practice questions

1. For the standard normal distribution $Z\sim\mathrm N(0,1^2)$, find:

(a) $P(Z<2.12)$,

(b) $P(Z>0.84)$,

(c) $P(Z<-0.38)$,

(d) $P(-1.57<Z<1.57)$.

2. The random variable $X\sim\mathrm N(0.8,0.05^2)$. For each value of $X$, write down the corresponding standardised value $z$:

(a) $x=0.8$,

(b) $x=0.792$,

(c) $x=0.81$,

(d) $x=0.837$.

3. A fighter-jet training programme takes only the top 2.5% of candidates on a test. The scores can be modelled using a normal distribution with mean 80 and standard deviation 4. Using the percentage-points table, find the score necessary to get on the programme.

4. A hat manufacturer makes a special ‘petite’ hat which should fit 15% of its customers. Given that hat sizes can be modelled using a normal distribution with mean 57 cm and standard deviation 2 cm, use the percentage-points table to find the size of a ‘petite’ hat.

5. A particular brand of light bulb has a life modelled as a normal distribution with mean 1175 hours and standard deviation 56 hours. The bulb’s life is considered ‘standard’ if it falls into the 10% to 90% interpercentile range. Use the percentage-points table to find the range of life, to the nearest hour, of a ‘standard’ bulb.

## Solutions

Practice 1. Standard normal probabilities.

Using the normal CDF with $\mu=0$, $\sigma=1$:

$$P(Z<2.12)=0.9830\ (4\text{ d.p.}),$$

$$P(Z>0.84)=1-P(Z<0.84)=1-0.7995=0.2005\ (4\text{ d.p.}),$$

$$P(Z<-0.38)=1-P(Z<0.38)=1-0.6480=0.3520\ (4\text{ d.p.}),$$

$$P(-1.57<Z<1.57)=2P(Z<1.57)-1=2(0.9418)-1=0.8836\ (4\text{ d.p.}).$$

Practice 2. Standardise $X\sim\mathrm N(0.8,0.05^2)$ for four $x$-values.

$$x=0.8:\quad z=\frac{0.8-0.8}{0.05}=0,$$

$$x=0.792:\quad z=\frac{0.792-0.8}{0.05}=-0.16,$$

$$x=0.81:\quad z=\frac{0.81-0.8}{0.05}=0.2,$$

$$x=0.837:\quad z=\frac{0.837-0.8}{0.05}=0.74.$$

Practice 3. Top 2.5% of a $\mathrm N(80,4^2)$.

Need $s$ such that $P(S>s)=0.025$. From the table, $z=1.96$.

$$\frac{s-80}{4}=1.96\Rightarrow s=80+4(1.96)=87.84.$$

A candidate must score above 87.84 on the test.

Practice 4. Fit 15% of customers with a $\mathrm N(57,2^2)$.

Need $h$ such that $P(H<h)=0.15$, so $P(H>h)=0.85$.

By symmetry, this corresponds to a positive-tail probability of 0.15 on the other side. From the table, $z=1.0364$, so

$$\frac{h-57}{2}=-1.0364\Rightarrow h=57-2(1.0364)=54.9272=54.9\ (3\text{ s.f.}).$$

The petite hat is 54.9 cm.

Practice 5. 10% to 90% interpercentile range of a $\mathrm N(1175,56^2)$.

From the table, $P(Z>1.2816)=0.10$, so the 10th and 90th percentiles in $z$-space are $\pm1.2816$.

$$L_{10}=1175-56(1.2816)=1103.2304\ldots\approx1103\text{ hours},$$

$$L_{90}=1175+56(1.2816)=1246.7696\ldots\approx1247\text{ hours}.$$

The range of life for a ‘standard’ bulb is 1103 to 1247 hours.
`,
    {
      table: table(
        ["$p$", "$z$", "$p$", "$z$"],
        [
          ["0.500", "0.0000", "0.050", "1.6449"],
          ["0.400", "0.2533", "0.025", "1.9600"],
          ["0.300", "0.5244", "0.010", "2.3263"],
          ["0.200", "0.8416", "0.005", "2.5758"],
          ["0.150", "1.0364", "0.001", "3.0902"],
          ["0.100", "1.2816", "0.0005", "3.2905"],
        ],
      ),
    },
  ),
  lesson(
    "10.5 Finding Mu and Sigma",
    raw`
Sometimes a question gives probability statements but asks for the unknown mean or standard deviation. The technique is to use the standardisation $Z=\frac{X-\mu}{\sigma}$ to convert each probability statement into an equation in $\mu$ and/or $\sigma$, which can then be solved.

## Finding unknown μ and σ

If $X\sim\mathrm N(\mu,\sigma^2)$ with $\mu$ or $\sigma$ unknown:

Restate each given probability as $P(Z<z)$, with $z$ obtained either from the percentage-points table or from the inverse-normal calculator with $\mu=0$, $\sigma=1$.

Write $z=\frac{x-\mu}{\sigma}$, giving an equation in $\mu$ and/or $\sigma$.

Two unknowns require two independent probability statements — solve simultaneously.

## Worked examples

Example 3.5.1. The random variable $X\sim\mathrm N(\mu,3^2)$. Given that $P(X>20)=0.20$, find the value of $\mu$.

$P(X>20)=0.20$ standardises to

$$P\left(Z>\frac{20-\mu}{3}\right)=0.20.$$

From the percentage-points table, $P(Z>0.8416)=0.20$, so

$$\frac{20-\mu}{3}=0.8416\Rightarrow20-\mu=2.5248\Rightarrow\mu=17.4752\ldots$$

Therefore $\mu=17.5$ (3 s.f.).

Example 3.5.2. A machine makes metal sheets with width $X$ cm, modelled as $X\sim\mathrm N(50,\sigma^2)$.

(a) Given that $P(X<46)=0.2119$, find $\sigma$.

(b) Find the 90th percentile of the widths.

(a) Standardise:

$$P\left(Z<\frac{46-50}{\sigma}\right)=0.2119.$$

Using the inverse normal with $\mu=0$, $\sigma=1$, $p=0.2119$: $z=-0.80$. So

$$\frac{46-50}{\sigma}=-0.80\Rightarrow\sigma=\frac{-4}{-0.80}=5.$$

(b) Now $X\sim\mathrm N(50,5^2)$. The 90th percentile satisfies $P(X<a)=0.90$. Using the inverse normal with $\mu=50$, $\sigma=5$, $p=0.90$:

$$a=56.4\ (1\text{ d.p.}).$$

Example 3.5.3. The random variable $X\sim\mathrm N(\mu,\sigma^2)$. Given that $P(X>35)=0.025$ and $P(X<15)=0.1469$, find $\mu$ and $\sigma$.

Step 1 — Convert to $Z$.

$$P(Z>z_1)=0.025\Rightarrow z_1=1.96,$$

$$P(Z<z_2)=0.1469\Rightarrow z_2=-1.05.$$

(Using the inverse normal, $1-0.1469=0.8531$ corresponds to 1.05, so by symmetry $z_2=-1.05$.)

Step 2 — Write equations in $\mu$ and $\sigma$.

$$\frac{35-\mu}{\sigma}=1.96\Rightarrow35-\mu=1.96\sigma,\qquad(1)$$

$$\frac{15-\mu}{\sigma}=-1.05\Rightarrow15-\mu=-1.05\sigma.\qquad(2)$$

Step 3 — Solve simultaneously. Subtract (2) from (1):

$$(35-\mu)-(15-\mu)=1.96\sigma-(-1.05\sigma)\Rightarrow20=3.01\sigma,$$

so

$$\sigma=\frac{20}{3.01}=6.6445\ldots=6.64\ (3\text{ s.f.}).$$

Substitute into (1):

$$\mu=35-1.96\times6.6445\ldots=21.976\ldots=22.0\ (3\text{ s.f.}).$$

## Practice questions

1. The random variable $X\sim\mathrm N(\mu,5^2)$ and $P(X<18)=0.9032$. Find $\mu$.

2. The random variable $X\sim\mathrm N(11,\sigma^2)$ and $P(X>20)=0.01$. Find $\sigma$.

3. The random variable $Y\sim\mathrm N(\mu,40)$ and $P(Y<25)=0.15$. Find $\mu$.

4. The random variable $X\sim\mathrm N(\mu,\sigma^2)$. The lower quartile of $X$ is 25 and the upper quartile is 45. Find $\mu$ and $\sigma$.

5. The random variable $X\sim\mathrm N(\mu,\sigma^2)$. Given that $P(X<17)=0.8159$ and $P(X<25)=0.9970$, find $\mu$ and $\sigma$.

6. The masses of penguins on an island are found to be normally distributed with mean $\mu$ and standard deviation $\sigma$. Given that 10% of the penguins have a mass less than 18 kg and 5% have a mass greater than 30 kg, find $\mu$ and $\sigma$.

## Solutions

Practice 1. $X\sim\mathrm N(\mu,5^2)$, $P(X<18)=0.9032$.

Standardise:

$$P\left(Z<\frac{18-\mu}{5}\right)=0.9032.$$

Inverse normal with $\mu=0$, $\sigma=1$, $p=0.9032$: $z=1.30$.

$$\frac{18-\mu}{5}=1.30\Rightarrow\mu=18-6.5=11.5.$$

Practice 2. $X\sim\mathrm N(11,\sigma^2)$, $P(X>20)=0.01$.

From the table, $P(Z>2.3263)=0.01$, so

$$\frac{20-11}{\sigma}=2.3263\Rightarrow\sigma=\frac9{2.3263}=3.8688\ldots=3.87\ (3\text{ s.f.}).$$

Practice 3. $Y\sim\mathrm N(\mu,40)$, so $\sigma=\sqrt{40}=2\sqrt{10}$; $P(Y<25)=0.15$.

From the table, $P(Z>1.0364)=0.15$, so $P(Z<-1.0364)=0.15$. Hence

$$\frac{25-\mu}{2\sqrt{10}}=-1.0364\Rightarrow\mu=25+1.0364\times2\sqrt{10}=31.55\ldots=31.6\ (3\text{ s.f.}).$$

Practice 4. Quartiles 25 and 45.

The quartiles are symmetric about the mean, so

$$\mu=\frac{25+45}{2}=35.$$

$Q_3$ satisfies $P(X<45)=0.75$, and $P(Z<0.6745)=0.75$ (from the calculator inverse normal). Therefore

$$\frac{45-35}{\sigma}=0.6745\Rightarrow\sigma=\frac{10}{0.6745}=14.825\ldots=14.8\ (3\text{ s.f.}).$$

Practice 5. $P(X<17)=0.8159$, $P(X<25)=0.9970$.

Inverse normal (standard): $p=0.8159\Rightarrow z_1=0.9$; $p=0.9970\Rightarrow z_2=2.748$. (The latter is $\Phi^{-1}(0.9970)$ from the calculator.)

$$\frac{17-\mu}{\sigma}=0.9,\qquad\frac{25-\mu}{\sigma}=2.748.$$

Subtracting:

$$\frac{25-17}{\sigma}=2.748-0.9=1.848\Rightarrow\sigma=\frac8{1.848}=4.329\ldots=4.33\ (3\text{ s.f.}).$$

Back-substitute:

$$\mu=17-0.9\times4.329=13.10\ldots=13.1\ (3\text{ s.f.}).$$

Practice 6. 10% below 18; 5% above 30.

$P(X<18)=0.10\Rightarrow z_1=-1.2816$. $P(X>30)=0.05\Rightarrow z_2=1.6449$.

$$\frac{18-\mu}{\sigma}=-1.2816,\qquad(1)$$

$$\frac{30-\mu}{\sigma}=1.6449.\qquad(2)$$

Subtracting (1) from (2):

$$\frac{12}{\sigma}=2.9265\Rightarrow\sigma=\frac{12}{2.9265}=4.10\ (3\text{ s.f.}).$$

Substituting into (2):

$$\mu=30-1.6449\times4.1003=23.258\ldots=23.3\ (3\text{ s.f.}).$$
`,
  ),
];
