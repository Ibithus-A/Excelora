import { nativeLesson, p, m, group, example, step } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson("Statistics", "Chapter 7: Hypothesis Testing", title, blocks);
export const STATISTICS_HYPOTHESIS_LESSONS = [
  lesson("7.1 The Language of Hypothesis Testing", [
    p(
      "A hypothesis test is a formal procedure for deciding whether observed data provides sufficient evidence to reject a claim (hypothesis) about a population parameter.",
    ),
    group("Key Terminology", [
      p(
        "The null hypothesis $H_0$ is the default assumption. It typically states that there is no change or that a parameter takes a specific value, e.g. $H_0:p=0.3$.",
      ),
      p(
        "The alternative hypothesis $H_1$ states what we suspect is true instead of $H_0$.",
      ),
      p("One-tailed test:"),
      p("$H_1:p>0.3$ (test for increase)"),
      p("or $H_1:p<0.3$ (test for decrease)"),
      p("Two-tailed test:"),
      p(raw`$H_1:p\ne0.3$ (test for any change)`),
      p(
        raw`The significance level $\alpha$ is the probability of incorrectly rejecting $H_0$ (typically 5% or 1%).`,
      ),
      p(
        "The critical region is the set of values that would lead to rejecting $H_0$.",
      ),
      p(
        "The actual significance level is the probability of the observed value (or more extreme) falling in the critical region, assuming $H_0$ is true.",
      ),
    ]),
    group("Worked Example 1", [
      p(
        "A coin is suspected of being biased towards heads. In 20 flips, 14 heads are observed. Test at the 5% significance level whether the coin is biased towards heads.",
      ),
      step(1, "Define hypotheses", [
        p("Let $p=$ probability of heads."),
        p(
          "$H_0:p=0.5$ (coin is fair). $H_1:p>0.5$ (coin is biased towards heads).",
        ),
        p("This is a one-tailed test."),
      ]),
      step(2, "", [
        p(raw`Under $H_0$, $X\sim B(20,0.5)$ where $X=$ number of heads.`),
      ]),
      step(3, "", [
        p(raw`Find $P(X\geqslant14)$ under $H_0$:`),
        m(raw`P(X\geqslant14)=1-P(X\leqslant13)=1-0.9423=0.0577.`),
      ]),
      step(4, "Compare with significance level", [p("$0.0577>0.05$.")]),
      step(5, "Conclusion", [
        p(
          "Since $0.0577>0.05$, the result is not significant. There is insufficient evidence to reject $H_0$. We cannot conclude that the coin is biased towards heads at the 5% level.",
        ),
      ]),
    ]),
    group("Practice Questions", [
      p(
        "1. A manufacturer claims that 30% of customers prefer product A. A survey of 25 customers finds that 12 prefer product A. Test at the 5% level whether the proportion is higher than claimed.",
      ),
      p(
        "2. A die is thought to be biased against showing a 6. In 30 rolls, a 6 appears only twice. Test at the 5% level.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(raw`1. $H_0:p=0.3$, $H_1:p>0.3$. $X\sim B(25,0.3)$. $X=12$.`),
        m(raw`P(X\geqslant12)=1-P(X\leqslant11)=1-0.9558=0.0442.`),
        p(
          "$0.0442<0.05$: significant. Reject $H_0$. There is sufficient evidence at 5% that the proportion preferring A is higher than 0.3.",
        ),
      ]),
      example([
        p(
          raw`2. $H_0:p=\frac16$, $H_1:p<\frac16$. $X\sim B(30,\frac16)$. $X=2$.`,
        ),
        m(raw`P(X\leqslant2)=P(0)+P(1)+P(2).`),
        p(
          raw`$P(0)=(5/6)^{30}=0.00421$. $P(1)=30\times\frac16\times(5/6)^{29}=0.02527$. $P(2)=\binom{30}{2}(\frac16)^2(\frac56)^{28}=0.07360$.`,
        ),
        m(raw`P(X\leqslant2)=0.1031.`),
        p(
          "$0.1031>0.05$: not significant. Insufficient evidence to conclude the die is biased against 6.",
        ),
      ]),
    ]),
  ]),
  lesson("7.2 Finding Critical Regions", [
    p(
      "Instead of calculating the probability each time, we can find the critical region in advance — the set of values that would lead to rejecting $H_0$.",
    ),
    group("Finding the Critical Region", [
      p(raw`For a one-tailed test at significance level $\alpha$:`),
      p(
        raw`Upper tail ($H_1:p>p_0$): Find the smallest $c$ such that $P(X\geqslant c)\leqslant\alpha$. The critical region is $X\geqslant c$.`,
      ),
      p(
        raw`Lower tail ($H_1:p<p_0$): Find the largest $c$ such that $P(X\leqslant c)\leqslant\alpha$. The critical region is $X\leqslant c$.`,
      ),
      p(
        raw`For a two-tailed test: Split $\alpha$ equally between both tails. Find critical values for each tail using $\alpha/2$.`,
      ),
      p("The critical value is the boundary value of the critical region."),
    ]),
    group("Worked Example 2", [
      p(
        raw`$X\sim B(20,0.3)$ under $H_0$. Find the critical region for $H_1:p<0.3$ at the 5% level. State the actual significance level.`,
      ),
      p(raw`We need the largest $c$ such that $P(X\leqslant c)\leqslant0.05$.`),
      p(raw`$P(X\leqslant2)=0.0355$. $P(X\leqslant3)=0.1071$.`),
      p(
        raw`Since $P(X\leqslant2)=0.0355\leqslant0.05$ but $P(X\leqslant3)=0.1071>0.05$:`,
      ),
      p(raw`The critical region is $X\leqslant2$.`),
      p("The actual significance level is 3.55%."),
    ]),
    group("Practice Questions", [
      p(
        raw`1. $X\sim B(30,0.5)$ under $H_0$. Find the critical region for $H_1:p>0.5$ at the 5% level.`,
      ),
      p(
        raw`2. $X\sim B(25,0.4)$ under $H_0$. Find the critical region for a two-tailed test at the 10% significance level.`,
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(raw`1. $B(30,0.5)$, $H_1:p>0.5$, 5%.`),
        p(
          raw`$P(X\geqslant20)=1-P(X\leqslant19)=1-0.9506=0.0494\leqslant0.05$. $P(X\geqslant19)=0.1002>0.05$.`,
        ),
        p(
          raw`Critical region: $X\geqslant20$. Actual significance level: 4.94%.`,
        ),
      ]),
      example([
        p("2. $B(25,0.4)$, two-tailed, 10% (5% each tail)."),
        p(
          raw`Lower tail: $P(X\leqslant5)=0.0294\leqslant0.05$. $P(X\leqslant6)=0.0736>0.05$. Lower CR: $X\leqslant5$.`,
        ),
        p(
          raw`Upper tail: $P(X\geqslant15)=1-P(X\leqslant14)=0.0173\leqslant0.05$. $P(X\geqslant14)=0.0468\leqslant0.05$. Upper CR: $X\geqslant14$.`,
        ),
        p(raw`Critical region: $X\leqslant5$ or $X\geqslant14$.`),
      ]),
    ]),
  ]),
];
