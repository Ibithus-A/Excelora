import { nativeLesson, transcript } from "./authoring.ts";
const raw = String.raw;
const lesson = (title: string, source: string) =>
  nativeLesson(
    "Statistics",
    "Chapter 10: The Normal Distribution",
    title,
    transcript(source),
  );
export const STATISTICS_NORMAL_C_LESSONS = [
  lesson(
    "10.6 Approximating the Binomial Distribution",
    raw`
Calculator tables of cumulative binomial probabilities typically go up to only $n=50$. For larger $n$, and when $p$ is close to 0.5, the binomial distribution is very close in shape to a normal distribution, and can be well approximated by one. This was a fundamental computational technique before widely available calculators and remains useful for exam questions.

## Normal approximation to a binomial

If $n$ is large and $p$ is close to 0.5, the distribution $X\sim\mathrm B(n,p)$ can be approximated by $Y\sim\mathrm N(\mu,\sigma^2)$ where

$$\mu=np,\qquad\sigma=\sqrt{np(1-p)}.$$

The approximation is only accurate when $p$ is close to 0.5 because the normal distribution is symmetric. For $p$ far from 0.5 the binomial is noticeably skewed.

## The continuity correction

The binomial distribution is discrete — it takes only integer values — while the normal is continuous. When converting a binomial probability statement into a normal one, we must spread each integer $k$ of the binomial onto the interval $(k-0.5,k+0.5)$ of the normal, to preserve probability.

## Continuity correction

When approximating $X\sim\mathrm B(n,p)$ by $Y\sim\mathrm N(\mu,\sigma^2)$, use:

$$P(X\le k)\approx P(Y<k+0.5),$$

$$P(X<k)=P(X\le k-1)\approx P(Y<k-0.5),$$

$$P(X\ge k)\approx P(Y>k-0.5),$$

$$P(X>k)=P(X\ge k+1)\approx P(Y>k+0.5),$$

$$P(X=k)\approx P(k-0.5<Y<k+0.5).$$

Rule of thumb: the continuity correction always extends the interval by 0.5 on each side.

## Worked examples

Example 3.6.1. A biased coin has $P(\text{Head})=0.53$. The coin is tossed 100 times and the number of heads, $X$, is recorded.

(a) Write down a binomial model for $X$.

(b) Explain why $X$ can be approximated by a normal distribution $Y\sim\mathrm N(\mu,\sigma^2)$.

(c) Find the values of $\mu$ and $\sigma$ in this approximation.

(a) Each toss is independent with a fixed probability 0.53 of heads, so

$$X\sim\mathrm B(100,0.53).$$

(b) The approximation is justified because $n=100$ is large and $p=0.53$ is close to 0.5.

(c) Using the approximation formulae:

$$\mu=np=100\times0.53=53,$$

$$\sigma=\sqrt{np(1-p)}=\sqrt{100\times0.53\times0.47}=\sqrt{24.91}=4.99\ (3\text{ s.f.}).$$

Example 3.6.2. The binomial random variable $X\sim\mathrm B(150,0.48)$ is approximated by the normal random variable $Y\sim\mathrm N(72,6.12^2)$.

(a) Use this approximation to find $P(X\le70)$.

(b) Use this approximation to find $P(80\le X<90)$.

(a) Apply the continuity correction:

$$P(X\le70)\approx P(Y<70.5).$$

Using the normal CDF with $\mu=72$, $\sigma=6.12$, upper limit 70.5:

$$P(Y<70.5)=0.4032\ (4\text{ d.p.}).$$

(b) For values of $X$ less than 90, consider values of $Y$ less than 89.5. For values of $X$ greater than or equal to 80, consider values of $Y$ greater than 79.5. So

$$P(80\le X<90)\approx P(79.5<Y<89.5).$$

Using the calculator:

$$P(79.5<Y<89.5)=0.9979-0.8898=0.1081\ (4\text{ d.p.}).$$

Example 3.6.3. For a particular type of flower bulb, 55% produce yellow flowers. A random sample of 80 bulbs is planted. Calculate the percentage error when using a normal approximation to estimate the probability that exactly 50 flowers are yellow.

Step 1 — Exact binomial probability. $X\sim\mathrm B(80,0.55)$.

$$P(X=50)=\binom{80}{50}(0.55)^{50}(0.45)^{30}=0.0365\ (4\text{ d.p.}).$$

Step 2 — Normal approximation. $\mu=80\times0.55=44$, $\sigma^2=80\times0.55\times0.45=19.8$.

So $Y\sim\mathrm N(44,19.8)$.

Applying the continuity correction to $X=50$:

$$P(X=50)\approx P(49.5<Y<50.5)=0.9280-0.8918=0.0362\ (4\text{ d.p.}).$$

Step 3 — Percentage error.

$$\text{Error}=\frac{|0.0365-0.0362|}{0.0365}\times100=0.82\%\ (2\text{ s.f.}).$$

## Practice questions

1. For each of the following binomial random variables, state with reasons whether $X$ can be approximated by a normal distribution, and if so write down the normal approximation in the form $\mathrm N(\mu,\sigma^2)$:

(a) $X\sim\mathrm B(120,0.6)$,

(b) $X\sim\mathrm B(20,0.5)$,

(c) $X\sim\mathrm B(300,0.85)$,

(d) $X\sim\mathrm B(400,0.48)$.

2. The random variable $X\sim\mathrm B(150,0.45)$. Use a suitable approximation to estimate:

(a) $P(X\le60)$,

(b) $P(X>75)$,

(c) $P(65\le X\le80)$.

3. A fair coin is tossed 70 times. Use a suitable approximation to estimate the probability of obtaining more than 45 heads.

4. A particular breakfast cereal has prizes in 56% of the boxes. A random sample of 100 boxes is taken.

(a) Find the exact probability that exactly 55 boxes contain a prize.

(b) Find the percentage error when using a normal approximation to calculate the probability that exactly 55 boxes contain prizes.

## Solutions

Practice 1. Suitability of normal approximation.

The approximation requires $n$ large and $p$ close to 0.5.

(a) $\mathrm B(120,0.6)$: $n$ large, $p$ reasonably close to 0.5. Suitable.

$$\mu=72,\qquad\sigma=\sqrt{120\times0.6\times0.4}=\sqrt{28.8}=5.37.$$

$Y\sim\mathrm N(72,28.8)$, i.e. $\mathrm N(72,5.37^2)$.

(b) $\mathrm B(20,0.5)$: $p$ exactly 0.5, but $n$ is small. The approximation is of limited accuracy, and since $n\le50$ the binomial CDF is directly tabulated. Approximation not needed.

(c) $\mathrm B(300,0.85)$: $n$ is large but $p=0.85$ is far from 0.5, so the binomial is skewed. Not suitable.

(d) $\mathrm B(400,0.48)$: $n$ large, $p$ close to 0.5. Suitable.

$$\mu=192,\qquad\sigma=\sqrt{400\times0.48\times0.52}=\sqrt{99.84}=9.99.$$

$Y\sim\mathrm N(192,99.84)$.

Practice 2. $X\sim\mathrm B(150,0.45)$. Approximate by $Y\sim\mathrm N(67.5,37.125)$; $\sigma=6.0930\ldots$.

(a) $P(X\le60)\approx P(Y<60.5)$. Using the normal CDF:

$$P(Y<60.5)=0.1288\ (4\text{ d.p.}).$$

(b) $P(X>75)\approx P(Y>75.5)$.

$$P(Y>75.5)=0.0946\ (4\text{ d.p.}).$$

(c) $P(65\le X\le80)\approx P(64.5<Y<80.5)$.

$$P(64.5<Y<80.5)=0.9833-0.3078=0.6755\ (4\text{ d.p.}).$$

Practice 3. Fair coin tossed 70 times. More than 45 heads.

$X\sim\mathrm B(70,0.5)$; $n$ large, $p=0.5$. Approximate by $Y\sim\mathrm N(35,17.5)$; $\sigma=\sqrt{17.5}=4.183\ldots$.

$$P(X>45)=P(X\ge46)\approx P(Y>45.5).$$

$$P(Y>45.5)=0.00721\ (3\text{ s.f.}).$$

Practice 4. Cereal, $n=100$, $p=0.56$, $P(X=55)$.

(a) Exact: $X\sim\mathrm B(100,0.56)$.

$$P(X=55)=\binom{100}{55}(0.56)^{55}(0.44)^{45}=0.0761\ (4\text{ d.p.}).$$

(b) Normal approximation: $\mu=56$, $\sigma=\sqrt{100\times0.56\times0.44}=\sqrt{24.64}=4.9639\ldots$.

$$P(X=55)\approx P(54.5<Y<55.5)=0.5395-0.4594=0.0801\ (4\text{ d.p.}).$$

Percentage error:

$$\frac{|0.0761-0.0801|}{0.0761}\times100=5.26\%\ (3\text{ s.f.}).$$
`,
  ),
  lesson(
    "10.7 Hypothesis Testing with the Normal Distribution",
    raw`
In Year 1 you carried out hypothesis tests on the parameter $p$ of a binomial distribution. The normal distribution supports a parallel framework: hypothesis tests about the population mean $\mu$ of a normal random variable, based on a random sample.

The key theoretical input is the sampling distribution of the sample mean. If individual observations are drawn from a normal distribution, their mean is also normal, with the same centre but a smaller spread.

## The distribution of the sample mean

If $X\sim\mathrm N(\mu,\sigma^2)$ and $\overline X$ is the mean of a random sample of size $n$, then

$$\overline X\sim\mathrm N\left(\mu,\frac{\sigma^2}{n}\right).$$

In other words, the mean of $\overline X$ is still $\mu$, but the variance is $\frac{\sigma^2}{n}$, so the standard deviation is $\frac{\sigma}{\sqrt n}$.

Standardising gives

$$Z=\frac{\overline X-\mu}{\sigma/\sqrt n}\sim\mathrm N(0,1).$$

This coded statistic is the natural test statistic for hypotheses about $\mu$.

## Framework for a test

To test $H_0:\mu=\mu_0$ against an alternative using a sample mean $\overline x$ from $n$ observations, with $\sigma$ known:

One-tailed (lower): $H_1:\mu<\mu_0$. Compute $P(\overline X<\overline x\mid H_0)$ and compare with the significance level.

One-tailed (upper): $H_1:\mu>\mu_0$. Compute $P(\overline X>\overline x\mid H_0)$ and compare with the significance level.

Two-tailed: $H_1:\mu\ne\mu_0$. Compare the smaller of $P(\overline X>\overline x\mid H_0)$ and $P(\overline X<\overline x\mid H_0)$ against half the significance level.

Equivalently, for any tail, use the standardised statistic $z=\frac{\overline x-\mu_0}{\sigma/\sqrt n}$ and compare with the critical value from the percentage-points table.

## Worked examples

Example 3.7.1. A company sells fruit juice in cartons. The amount of juice in a carton has a normal distribution with a standard deviation of 3 ml. The company claims that the mean amount of juice per carton, $\mu$, is 60 ml. A trading inspector has received complaints that the company is overstating the mean. The inspector takes a random sample of 16 cartons and finds that the sample mean is 59.1 ml. Using a 5% significance level, test whether or not there is evidence to uphold the complaint, stating your hypotheses clearly.

Step 1 — Hypotheses. The inspector is investigating whether the true mean is less than 60 ml.

$$H_0:\mu=60,\qquad H_1:\mu<60.$$

Step 2 — Sampling distribution under $H_0$. Under $H_0$, $X\sim\mathrm N(60,3^2)$, so

$$\overline X\sim\mathrm N\left(60,\frac{3^2}{16}\right)=\mathrm N(60,0.75^2).$$

Step 3 — Compute the $p$-value.

$$P(\overline X<59.1)=0.1151\ (4\text{ d.p.}).$$

Step 4 — Compare with the significance level. $0.1151>0.05$, so the observed sample mean is not sufficiently extreme to reject $H_0$.

Step 5 — Conclusion in context. There is insufficient evidence at the 5% level to conclude that the mean amount of juice per carton is less than 60 ml. The complaint is not upheld.

Example 3.7.2. A machine produces bolts of diameter $D$ where $D\sim\mathrm N(0.580,0.015^2)$. After a service, a random sample of 50 bolts is taken to see if the mean diameter has changed. The distribution of diameters after the service is still normal with standard deviation 0.015 cm.

(a) Find, at the 1% level, the critical region for this test, stating your hypotheses clearly.

The mean diameter of the sample of 50 bolts is found to be 0.587 cm.

(b) Comment on this observation in light of the critical region.

(a) Hypotheses.

$$H_0:\mu=0.580,\qquad H_1:\mu\ne0.580.$$

Two-tailed test at the 1% level, so 0.5% in each tail.

Under $H_0$, the sample mean $\overline D\sim\mathrm N\left(0.580,\frac{0.015^2}{50}\right)$, i.e. standard deviation $\frac{0.015}{\sqrt{50}}=0.002121\ldots$.

From the table, $P(Z>2.5758)=0.005$, so the critical region is

$$Z<-2.5758\quad\text{or}\quad Z>2.5758,$$

or in terms of $\overline D$:

$$\overline D<0.580-2.5758\times0.002121=0.5745,$$

$$\overline D>0.580+2.5758\times0.002121=0.5855.$$

The critical region is $\overline D\le0.575$ or $\overline D\ge0.585$ (3 s.f.).

(b) The observed sample mean $\overline d=0.587$ lies within the upper critical region ($0.587>0.585$), so we reject $H_0$.

There is sufficient evidence, at the 1% level, that the mean bolt diameter has changed from 0.580 cm.

## Practice questions

1. In each part, a random sample of size $n$ is taken from a population $X\sim\mathrm N(\mu,\sigma^2)$. Test the hypotheses at the stated levels of significance.

(a) $H_0:\mu=21$, $H_1:\mu\ne21$, $n=20$, $\overline x=21.2$, $\sigma=1.5$, at the 5% level.

(b) $H_0:\mu=100$, $H_1:\mu<100$, $n=36$, $\overline x=98.5$, $\sigma=5.0$, at the 5% level.

(c) $H_0:\mu=15$, $H_1:\mu>15$, $n=40$, $\overline x=16.5$, $\sigma=3.5$, at the 1% level.

2. The times taken for a capful of stain remover to remove a standard chocolate stain from a baby’s bib are normally distributed with a mean of 185 seconds and a standard deviation of 15 seconds. A new formula is claimed to shorten the time taken. A random sample of 25 capfuls of the new formula are tested and the mean time is 179 seconds. Test, at the 5% level, whether there is evidence that the new formula is an improvement.

3. The diameters of cardboard drinks mats produced by a certain machine are normally distributed with mean 9 cm and standard deviation 0.15 cm. After the machine is serviced a random sample of 30 mats is selected and the sample mean is 8.95 cm. Test, at the 5% level, whether there is significant evidence of a change in the mean diameter of mats produced.

## Solutions

Practice 1. Standard tests.

(a) Two-tailed at 5%. Under $H_0$, $\overline X\sim\mathrm N\left(21,\frac{1.5^2}{20}\right)$, standard deviation $\frac{1.5}{\sqrt{20}}=0.3354\ldots$.

$$P(\overline X>21.2)=0.2762\ldots$$

Compare to half-tail 0.025: $0.2762>0.025$, so do not reject $H_0$. There is insufficient evidence at the 5% level that the population mean differs from 21.

(b) One-tailed lower at 5%. $\overline X\sim\mathrm N\left(100,\frac{5^2}{36}\right)$, standard deviation $\frac56=0.8333\ldots$.

$$P(\overline X<98.5)=0.0359\ (4\text{ d.p.}).$$

$0.0359<0.05$, so reject $H_0$. There is sufficient evidence at the 5% level that the population mean is less than 100.

(c) One-tailed upper at 1%. $\overline X\sim\mathrm N\left(15,\frac{3.5^2}{40}\right)$, standard deviation $\frac{3.5}{\sqrt{40}}=0.5534\ldots$.

$$P(\overline X>16.5)=0.00338\ (3\text{ s.f.}).$$

$0.00338<0.01$, so reject $H_0$. There is sufficient evidence at the 1% level that the population mean is greater than 15.

Practice 2. Stain remover; test at 5% that the new formula shortens the time.

Hypotheses.

$$H_0:\mu=185,\qquad H_1:\mu<185.$$

Under $H_0$, $\overline X\sim\mathrm N\left(185,\frac{15^2}{25}\right)=\mathrm N(185,3^2)$.

$$P(\overline X<179)=0.02275\ (4\text{ d.p.}).$$

$0.02275<0.05$, so reject $H_0$. There is sufficient evidence at the 5% level that the new formula reduces the mean time, i.e. is an improvement.

Practice 3. Drinks mats after service; two-tailed at 5%.

Hypotheses.

$$H_0:\mu=9,\qquad H_1:\mu\ne9.$$

Under $H_0$, $\overline X\sim\mathrm N\left(9,\frac{0.15^2}{30}\right)$, standard deviation $\frac{0.15}{\sqrt{30}}=0.02739\ldots$.

$$P(\overline X<8.95)=0.0339\ (4\text{ d.p.}).$$

Compare with half-tail 0.025: $0.0339>0.025$, so do not reject $H_0$. There is insufficient evidence at the 5% level that the mean diameter of mats has changed.
`,
  ),
];
