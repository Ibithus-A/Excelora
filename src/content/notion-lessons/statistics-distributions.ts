import { nativeLesson, p, m, group, example, table } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson(
    "Statistics",
    "Chapter 6: Statistical Distributions",
    title,
    blocks,
  );
export const STATISTICS_DISTRIBUTION_LESSONS = [
  lesson("6.1 Discrete Random Variables", [
    p(
      "A random variable is a variable whose value depends on the outcome of a random event. A discrete random variable takes specific, countable values. Its probability distribution lists all possible values and their probabilities.",
    ),
    group("Key Properties", [
      p(
        "For a discrete random variable $X$ with probability distribution $P(X=x)$:",
      ),
      p(raw`$\sum P(X=x)=1$ (probabilities sum to 1)`),
      p(raw`$0\leqslant P(X=x)\leqslant1$ for all $x$`),
      p(raw`$E(X)=\sum xP(X=x)=\mu$ (expected value / mean)`),
      m(raw`\operatorname{Var}(X)=E(X^2)-[E(X)]^2`),
      p(raw`where $E(X^2)=\sum x^2P(X=x)$`),
      p(raw`$\sigma=\sqrt{\operatorname{Var}(X)}$ (standard deviation)`),
    ]),
    group("Worked Example 1", [
      p(
        "A discrete random variable $X$ has the following probability distribution:",
      ),
      table(
        ["$x$", "1", "2", "3", "4"],
        [["$P(X=x)$", "0.1", "$k$", "0.3", "0.2"]],
      ),
      p(raw`(a) Find $k$. (b) Find $E(X)$ and $\operatorname{Var}(X)$.`),
      p(raw`(a) $0.1+k+0.3+0.2=1\implies k=0.4$.`),
      p("(b) $E(X)=1(0.1)+2(0.4)+3(0.3)+4(0.2)=0.1+0.8+0.9+0.8=2.6$."),
      m("E(X^2)=1(0.1)+4(0.4)+9(0.3)+16(0.2)=0.1+1.6+2.7+3.2=7.6."),
      m(raw`\operatorname{Var}(X)=7.6-2.6^2=7.6-6.76=0.84.`),
    ]),
    group("Practice Questions", [
      p(
        raw`1. $X$ has distribution: $P(X=0)=0.15$, $P(X=1)=0.35$, $P(X=2)=a$, $P(X=3)=0.1$. Find $a$, $E(X)$ and $\operatorname{Var}(X)$.`,
      ),
      p(
        "2. A fair spinner has sections labelled 1, 1, 2, 3, 5. Let $X$ be the score. Write the probability distribution and find $E(X)$.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(raw`1. $0.15+0.35+a+0.1=1\implies a=0.4$.`),
        m("E(X)=0(0.15)+1(0.35)+2(0.4)+3(0.1)=0+0.35+0.8+0.3=1.45."),
        m("E(X^2)=0+0.35+1.6+0.9=2.85."),
        m(raw`\operatorname{Var}(X)=2.85-1.45^2=2.85-2.1025=0.7475.`),
      ]),
      example([
        p(
          raw`2. Spinner: 1, 1, 2, 3, 5. $P(X=1)=\frac25$, $P(X=2)=\frac15$, $P(X=3)=\frac15$, $P(X=5)=\frac15$.`,
        ),
        m(
          raw`E(X)=1\times\frac25+2\times\frac15+3\times\frac15+5\times\frac15=\frac{2+2+3+5}{5}=\frac{12}{5}=2.4.`,
        ),
      ]),
    ]),
  ]),
  lesson("6.2 The Binomial Distribution", [
    p(
      "The binomial distribution models the number of successes in a fixed number of independent trials, each with the same probability of success.",
    ),
    group("Binomial Distribution", [
      m(raw`X\sim B(n,p)`),
      p(
        "Conditions: (1) Fixed number of trials $n$. (2) Each trial has exactly two outcomes (success/failure). (3) Probability of success $p$ is constant. (4) Trials are independent.",
      ),
      p(
        raw`$P(X=r)=\binom nr p^r(1-p)^{n-r}$, where $\binom nr=\frac{n!}{r!(n-r)!}$.`,
      ),
      m("E(X)=np"),
      m(raw`\operatorname{Var}(X)=np(1-p)`),
      p(
        raw`$P(X\leqslant r)$ can be found using cumulative binomial tables or a calculator.`,
      ),
    ]),
    group("Worked Example 2", [
      p(
        "A factory produces items with a 5% defect rate. A random sample of 20 items is selected. Let $X$ be the number of defective items.",
      ),
      p("(a) State a suitable model for $X$ and justify."),
      p(
        raw`(b) Find $P(X=2)$. (c) Find $P(X\leqslant1)$. (d) Find $E(X)$ and $\operatorname{Var}(X)$.`,
      ),
      p(
        raw`(a) $X\sim B(20,0.05)$. Each item is either defective (success, $p=0.05$) or not. There are $n=20$ independent trials with constant probability.`,
      ),
      p(
        raw`(b) $P(X=2)=\binom{20}{2}(0.05)^2(0.95)^{18}=190\times0.0025\times0.3972=0.1887$.`,
      ),
      p(raw`(c) $P(X\leqslant1)=P(X=0)+P(X=1)$.`),
      p("$P(X=0)=(0.95)^{20}=0.3585$. $P(X=1)=20(0.05)(0.95)^{19}=0.3774$."),
      m(raw`P(X\leqslant1)=0.3585+0.3774=0.7359.`),
      p(
        raw`(d) $E(X)=20\times0.05=1$. $\operatorname{Var}(X)=20\times0.05\times0.95=0.95$.`,
      ),
    ]),
    group("Worked Example 3", [
      p(raw`$X\sim B(10,0.3)$. Find $P(X\geqslant4)$.`),
      m(raw`P(X\geqslant4)=1-P(X\leqslant3).`),
      p(
        raw`Using cumulative binomial probabilities (from tables or calculator): $P(X\leqslant3)=0.6496$.`,
      ),
      m(raw`P(X\geqslant4)=1-0.6496=0.3504.`),
    ]),
    group("Practice Questions", [
      p(
        "1. In a university, 8% of students are members of the dance club. A random sample of 36 students is taken. Let $X$ be the number who are members. (a) State the distribution of $X$. (b) Find $P(X=3)$. (c) Find $E(X)$.",
      ),
      p(
        raw`2. $X\sim B(8,0.4)$. Find: (a) $P(X=3)$, (b) $P(X<3)$, (c) $P(2\leqslant X\leqslant5)$.`,
      ),
      p(
        "3. A student claims that a coin is biased. In 50 flips, 32 heads are observed. (a) If the coin were fair, what distribution would model the number of heads? (b) Comment on whether 32 heads provides evidence of bias.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p("1. 8% in dance club, $n=36$."),
        p(raw`(a) $X\sim B(36,0.08)$.`),
        p(
          raw`(b) $P(X=3)=\binom{36}{3}(0.08)^3(0.92)^{33}=7140\times0.000512\times0.0637=0.2327$.`,
        ),
        p(raw`(c) $E(X)=36\times0.08=2.88$.`),
      ]),
      example([
        p(raw`2. $X\sim B(8,0.4)$.`),
        p(
          raw`(a) $P(X=3)=\binom83(0.4)^3(0.6)^5=56\times0.064\times0.07776=0.2787$.`,
        ),
        p("(b) $P(X<3)=P(0)+P(1)+P(2)=0.01680+0.08958+0.20902=0.3154$."),
        p(
          raw`(c) $P(2\leqslant X\leqslant5)=P(X\leqslant5)-P(X\leqslant1)=0.9502-0.1064=0.8438$.`,
        ),
      ]),
      example([
        p("3. 50 flips, 32 heads."),
        p(raw`(a) $X\sim B(50,0.5)$ under the assumption of a fair coin.`),
        p(
          "(b) $E(X)=25$. Getting 32 is 7 above the expected value. The probability of getting 32 or more heads from a fair coin is small (approximately 0.016), which suggests the coin may be biased. However, a formal hypothesis test would be needed to draw a firm conclusion.",
        ),
      ]),
    ]),
  ]),
];
