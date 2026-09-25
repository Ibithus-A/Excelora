import {
  nativeLesson,
  p,
  m,
  h,
  group,
  example,
  step,
  table,
} from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson(
    "Statistics",
    "Chapter 8: Regression, Correlation and Hypothesis Testing",
    title,
    blocks,
  );
export const STATISTICS_REGRESSION_LESSONS = [
  lesson("8.1 Exponential Models", [
    p(
      "Regression lines are only informative when the underlying relationship is linear. Many real quantities — populations, radioactive decay, cooling, reaction rates — do not grow linearly. The two most common non-linear patterns are the power law $y=ax^n$ and the exponential law $y=kb^x$. For both, a well-chosen change of variable converts the relationship into a straight line.",
    ),
    h("Linearising a power law"),
    p("Suppose the variables $x$ and $y$ are related by"),
    m(raw`y=ax^n,\quad a,n\in\mathbb R.`),
    p(
      "Taking logarithms (base 10 throughout this chapter, although any base would work) of both sides and applying the laws of logarithms gives",
    ),
    m(raw`\log y=\log a+n\log x.`),
    p(
      raw`If we set $Y=\log y$ and $X=\log x$, then $Y=\log a+nX$, which is a straight line in $(X,Y)$ coordinates. The gradient is the exponent $n$ and the vertical intercept is $\log a$.`,
    ),
    h("Linearising an exponential law"),
    p("Suppose instead that"),
    m(raw`y=kb^x,\quad k,b>0.`),
    p("Taking logarithms gives"),
    m(raw`\log y=\log k+x\log b.`),
    p(
      raw`If we set $Y=\log y$ and leave $X=x$ unchanged, then $Y=\log k+(\log b)X$, again a straight line. The gradient is $\log b$ and the vertical intercept is $\log k$.`,
    ),
    group("Linearising the two standard non-linear models", [
      p("Power law: $y=ax^n$"),
      m(raw`\log y=\log a+n\log x`),
      p(raw`Plot $\log y$ against $\log x$.`),
      p(raw`Gradient $=n$, intercept $=\log a$.`),
      p("Exponential law: $y=kb^x$"),
      m(raw`\log y=\log k+x\log b`),
      p(raw`Plot $\log y$ against $x$.`),
      p(raw`Gradient $=\log b$, intercept $=\log k$.`),
    ]),
    p(
      "If a scatter diagram of the raw data does not look linear, it is good practice to plot the two candidate linearisations and see which produces a straighter line. That diagnostic — the straightness of the plot of coded data — is the informal basis for choosing between a power and an exponential model.",
    ),
    group("Worked examples", [
      example([
        p(
          raw`Example 1.1.1. Coded data satisfy the regression line $Y=1.2+0.4X$, where $Y=\log y$ and $X=\log x$. Express $y$ in terms of $x$ in the form $y=ax^n$, giving $a$ and $n$ to 3 significant figures where appropriate.`,
        ),
        p(
          raw`Since $Y=\log y$ and $X=\log x$, substitute into the coded equation:`,
        ),
        m(raw`\log y=1.2+0.4\log x.`),
        p(
          raw`Use the law $c\log x=\log x^c$ on the last term and the addition law in reverse:`,
        ),
        m(
          raw`\log y=1.2+\log x^{0.4}=\log(10^{1.2})+\log x^{0.4}=\log(10^{1.2}x^{0.4}).`,
        ),
        p(raw`Since $\log$ is one-to-one, this gives`),
        m("y=10^{1.2}x^{0.4}."),
        p("Evaluating $10^{1.2}$ on a calculator,"),
        m("y=15.8x^{0.4}"),
        p("so $a=15.8$ (3 s.f.) and $n=0.4$."),
      ]),
      example([
        p(
          raw`Example 1.1.2. Coded data satisfy the regression line $Y=0.4+1.6X$, where $Y=\log y$ and $X=x$. Express $y$ in terms of $x$ in the form $y=kb^x$, giving $k$ and $b$ to 3 significant figures where appropriate.`,
        ),
        p("Here only $y$ has been logged, so the coded equation is"),
        m(raw`\log y=0.4+1.6x.`),
        p("Rewrite the right-hand side as a single logarithm:"),
        m(
          raw`\log y=\log 10^{0.4}+\log 10^{1.6x}=\log(10^{0.4}\cdot(10^{1.6})^x).`,
        ),
        p("Therefore"),
        m(
          raw`y=10^{0.4}\cdot(10^{1.6})^x=2.51\cdot39.8^x\quad(3\text{ s.f.}),`,
        ),
        p("so $k=2.51$ and $b=39.8$ (both to 3 s.f.)."),
      ]),
      example([
        p(
          raw`Example 1.1.3. A biologist records the size $P$ of a mole population at $t$ months after a survey begins. The data are coded using $X=t$, $Y=\log P$ and the regression line of $Y$ on $X$ is found to be $Y=1.740+0.0635X$. Given that the data are modelled by $P=ab^t$, find $a$ and $b$ to 3 significant figures, and interpret the constant $b$ in context.`,
        ),
        step(1, "Compare the coded equation", [
          p(raw`Compare the coded equation with $\log P=\log a+t\log b$.`),
          p(raw`The coded regression line is $\log P=1.740+0.0635t$.`),
          p(
            raw`Matching coefficients gives $\log a=1.740$ and $\log b=0.0635$.`,
          ),
        ]),
        step(2, "Solve for a and b.", [
          m(raw`a=10^{1.740}=55.0\quad(3\text{ s.f.}),`),
          m(raw`b=10^{0.0635}=1.16\quad(3\text{ s.f.}).`),
        ]),
        step(3, "Interpret b.", [
          p(
            "Since $P$ is multiplied by $b$ every time $t$ increases by 1, the constant $b$ represents the factor by which the mole population is multiplied each month. A value of 1.16 indicates a monthly increase of approximately 16% in the population.",
          ),
        ]),
      ]),
    ]),
    group("Practice questions", [
      p(
        raw`1. Coded data are given by $Y=\log y$ and $X=\log x$, with regression line $Y=0.80-0.60X$. Express $y$ in the form $y=ax^n$, giving $a$ and $n$ to 3 significant figures.`,
      ),
      p(
        raw`2. Coded data are given by $Y=\log y$, $X=x$, with regression line $Y=-0.15+0.24x$. Express $y$ in the form $y=kb^x$, giving $k$ and $b$ to 3 significant figures.`,
      ),
      p(
        raw`3. The value $V$ (in thousands of pounds) of a piece of equipment $t$ years after purchase is modelled by $V=kb^t$. A regression line of $\log V$ on $t$ is found to be $\log V=1.602-0.0969t$. Find $k$ and $b$, and interpret both in context.`,
      ),
      p(
        raw`4. Measurements of the width $w$ and mass $m$ of a sample of pebbles are taken. The coded data, using $x=\log w$ and $y=\log m$, satisfy the regression line $y=0.900+2.40x$. Find an equation linking $m$ and $w$ in the form $m=Aw^n$, and comment briefly on what this says about how mass scales with width.`,
      ),
    ]),
    group("Solutions", [
      example([
        p(raw`Practice 1. $Y=0.80-0.60X$ with $Y=\log y$, $X=\log x$.`),
        p("Substituting:"),
        m(
          raw`\log y=0.80-0.60\log x=\log10^{0.80}+\log x^{-0.60}=\log(10^{0.80}x^{-0.60}).`,
        ),
        p("Therefore"),
        m(raw`y=10^{0.80}x^{-0.60}=6.31x^{-0.60}\quad(3\text{ s.f.}).`),
        p("So $a=6.31$ and $n=-0.60$."),
      ]),
      example([
        p(raw`Practice 2. $Y=-0.15+0.24x$ with $Y=\log y$, $X=x$.`),
        p("Substituting:"),
        m(raw`\log y=-0.15+0.24x=\log10^{-0.15}+\log(10^{0.24})^x.`),
        p("Therefore"),
        m(
          raw`y=10^{-0.15}\cdot(10^{0.24})^x=0.708\cdot1.74^x\quad(3\text{ s.f.}).`,
        ),
        p("So $k=0.708$ and $b=1.74$."),
      ]),
      example([
        p(
          raw`Practice 3. $\log V=1.602-0.0969t$, model $V=kb^t$. Find and interpret $k$ and $b$.`,
        ),
        p(raw`Comparing with $\log V=\log k+t\log b$:`),
        m(raw`\log k=1.602\implies k=10^{1.602}=40.0\quad(3\text{ s.f.}),`),
        m(
          raw`\log b=-0.0969\implies b=10^{-0.0969}=0.800\quad(3\text{ s.f.}).`,
        ),
        p(
          "Interpretation. $k=40.0$ is the value of $V$ when $t=0$, i.e. the initial value of the equipment is approximately £40,000. $b=0.800$ is the factor by which the value is multiplied each year, so the equipment loses approximately 20% of its value per year.",
        ),
      ]),
      example([
        p(
          raw`Practice 4. $y=0.900+2.40x$ with $x=\log w$, $y=\log m$. Find $m$ in terms of $w$.`,
        ),
        p("Substituting:"),
        m(
          raw`\log m=0.900+2.40\log w=\log10^{0.900}+\log w^{2.40}=\log(10^{0.900}w^{2.40}).`,
        ),
        p("Therefore"),
        m(raw`m=10^{0.900}w^{2.40}=7.94w^{2.40}\quad(3\text{ s.f.}).`),
        p("So $A=7.94$ and $n=2.40$."),
        p(
          raw`Comment. Mass grows roughly as the 2.4th power of width. If width doubles, mass is multiplied by $2^{2.4}\approx5.28$, so the pebbles scale slightly faster than surface area ($n=2$) but slower than volume ($n=3$), consistent with pebbles that are flatter than cubes.`,
        ),
      ]),
    ]),
  ]),
  lesson("8.2 Measuring Correlation", [
    p(
      raw`A scatter diagram can suggest whether two variables are positively or negatively correlated, but the eye is not a reliable judge of the strength of the linear pattern. To put a number on it we use the product moment correlation coefficient, written $r$ for a sample and $\rho$ (rho) for the underlying population.`,
    ),
    group("The product moment correlation coefficient r", [
      p(
        "$r$ measures the strength of the linear correlation between two variables. It always satisfies",
      ),
      m(raw`-1\leq r\leq1.`),
      p(
        "$r=+1$: perfect positive linear correlation (all points on a rising straight line).",
      ),
      p(
        "$r=-1$: perfect negative linear correlation (all points on a falling straight line).",
      ),
      p("$r=0$: no linear correlation (the line of best fit is horizontal)."),
      p(
        "The closer $|r|$ is to 1, the stronger the linear relationship. The closer to 0, the weaker. A value close to 0 does not rule out a non-linear relationship.",
      ),
    ]),
    p(
      "In practice, $r$ is calculated using the statistics mode of a scientific or graphical calculator, which requires only the raw $(x,y)$ pairs. It is not part of the specification to compute $r$ by hand from its defining formula, but you must know how to enter bivariate data, how to extract $r$, and how to state its value correctly to three significant figures.",
    ),
    h("Two important properties"),
    p(
      "1. Linear coding leaves $r$ unchanged. If $x$ and $y$ are transformed by $X=p+qx$ and $Y=s+ty$ with $q,t$ non-zero, then the PMCC between $X$ and $Y$ equals the PMCC between $x$ and $y$ (up to a sign that flips if $q$ and $t$ have opposite signs). This is why coding by subtraction or by a simple multiple of a variable does not change the correlation.",
    ),
    p(
      raw`2. Logarithmic coding does change $r$. Replacing a variable by its logarithm is not a linear transformation. However, if the underlying relationship is $y=ax^n$ or $y=kb^x$, then the coded variables really are linearly related, so the coded PMCC becomes close to $\pm1$. A coded PMCC close to $\pm1$ is therefore evidence that the chosen non-linear model is a good fit.`,
    ),
    group("Worked examples", [
      example([
        p(
          "Example 1.2.1. The table shows the daily mean windspeed $w$ (knots) and daily maximum gust $g$ (knots) at a UK weather station on 8 days.",
        ),
        table(
          ["$w$", "4", "4", "8", "7", "12", "12", "3", "10"],
          [["$g$", "13", "12", "19", "23", "33", "37", "10", "23"]],
        ),
        p(
          "Calculate $r$ to 4 decimal places and comment on what your value suggests about the suitability of a linear regression model for these data.",
        ),
        p(
          "Entering the eight pairs into the calculator’s bivariate statistics mode and reading off the product moment correlation coefficient gives",
        ),
        m(raw`r=0.9533\quad(4\text{ d.p.}).`),
        p(
          "Since $r$ is very close to $+1$, there is a strong positive linear correlation between daily mean windspeed and daily maximum gust. On days when the mean wind is stronger, the maximum gust tends to be larger too. The value of $r$ being close to 1 means the data points lie close to a straight line, so a linear regression model is appropriate.",
        ),
      ]),
      example([
        p(
          raw`Example 1.2.2. The times $t$ (in minutes) taken by a computer to test whether $n$ different integers are prime are recorded. A scatter diagram of $t$ against $n$ is clearly non-linear, so a change of variable $X=\log n$, $Y=\log t$ is applied. The PMCC between $X$ and $Y$ is calculated to be 0.996.`,
        ),
        p(
          "Explain why this suggests that a model of the form $t=an^k$ is a good fit to the data.",
        ),
        p("Taking logs of the proposed model gives"),
        m(raw`\log t=\log a+k\log n,`),
        p(
          raw`so if the model is correct, the coded variables $X=\log n$ and $Y=\log t$ satisfy a straight-line equation $Y=\log a+kX$. A PMCC close to $+1$ on the coded data means that the $(X,Y)$ points lie almost exactly on a straight line, which is precisely the behaviour predicted by $t=an^k$. The value $r=0.996$ is therefore strong evidence that the power-law model is a good fit.`,
        ),
      ]),
    ]),
    group("Practice questions", [
      p(
        "1. The table shows the ages, $x$ (years), of ten students and their average times, $y$ (hours), to reach a level of proficiency in a training scheme.",
      ),
      table(
        ["$x$", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"],
        [["$y$", "12", "11", "10", "9", "11", "8", "9", "7", "6", "8"]],
      ),
      p(
        "Use your calculator to find $r$, correct to 3 decimal places, and describe the correlation in context.",
      ),
      p(
        "2. A scientist records the number of atoms $n$ of a radioactive substance $t$ minutes after an experiment starts.",
      ),
      table(
        ["$t$", "1", "2", "4", "5", "7"],
        [["$n$", "231", "41", "17", "7", "2"]],
      ),
      p(
        raw`Compute $\log n$ for each value, then find the PMCC between $t$ and $\log n$. With reference to your value, state whether an exponential model of the form $n=ab^t$ is a good fit.`,
      ),
      p(
        "3. Eight students sat two mathematics tests, $t$ marked on theory and $p$ marked on application. Their scores were:",
      ),
      table(
        ["$t$", "5", "9", "7", "11", "20", "4", "17", "12"],
        [["$p$", "6", "8", "9", "13", "20", "9", "17", "14"]],
      ),
      p(
        "Find $r$ to 3 significant figures and comment briefly on what it suggests about the relationship between theory and application scores for these students.",
      ),
    ]),
    group("Solutions", [
      example([
        p("Practice 1. Ten students, variables age $x$ and time $y$."),
        p(
          raw`Entering the ten pairs $(16,12),(17,11),\ldots,(25,8)$ into the calculator gives`,
        ),
        m(raw`r=-0.874\quad(3\text{ d.p.}).`),
        p(
          "There is a strong negative linear correlation between age and average time to reach proficiency: in this sample, older students tend to reach proficiency more quickly.",
        ),
      ]),
      example([
        p(
          raw`Practice 2. Radioactive atoms data. Find PMCC between $t$ and $\log n$ and comment.`,
        ),
        p(raw`First tabulate $\log n$ (to 4 s.f.):`),
        table(
          ["$t$", "1", "2", "4", "5", "7"],
          [[raw`$\log n$`, "2.364", "1.613", "1.230", "0.845", "0.301"]],
        ),
        p(raw`Entering the five pairs $(t,\log n)$ into the calculator gives`),
        m(raw`r=-0.986\quad(3\text{ d.p.}).`),
        p(
          "$r$ is very close to $-1$, so the coded variables are close to a perfect negative linear relationship. This is strong evidence that the exponential model $n=ab^t$ with $0<b<1$ (decay) is a good fit.",
        ),
      ]),
      example([
        p("Practice 3. Test scores."),
        p("Entering the eight pairs into the calculator gives"),
        m(raw`r=0.962\quad(3\text{ s.f.}).`),
        p(
          "This value is very close to $+1$, so there is a very strong positive linear correlation between theoretical and applied scores in this sample. Students who scored well on the theory test tended to score very well on the applied test.",
        ),
      ]),
    ]),
  ]),
];
