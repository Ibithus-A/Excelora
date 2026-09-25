import {
  nativeLesson,
  inline,
  p,
  m,
  h,
  group,
  example,
  step,
  table,
} from "./authoring.ts";
const raw = String.raw;
export const STATISTICS_CORRELATION_TEST_LESSON = nativeLesson(
  "Statistics",
  "Chapter 8: Regression, Correlation and Hypothesis Testing",
  "8.3 Hypothesis Testing for Zero Correlation",
  [
    p(
      raw`A sample PMCC $r$ is calculated from a limited number of observations. Even when the underlying population has no linear relationship, a random sample can still produce a value of $r$ that happens to be away from zero. We therefore need a principled way of asking the question: is the observed $r$ large enough in magnitude to conclude that the population correlation $\rho$ is not zero?`,
    ),
    group("Hypotheses for a test of zero correlation", [
      p(
        "The null hypothesis is always that the population PMCC is zero. The alternative depends on what is being tested.",
      ),
      p("One-tailed tests:"),
      m(raw`H_0:\rho=0,\quad H_1:\rho>0\text{ or }H_1:\rho<0.`),
      p("Two-tailed test:"),
      m(raw`H_0:\rho=0,\quad H_1:\rho\neq0.`),
    ]),
    h("Using the table of critical values"),
    p(
      raw`For a given sample size and significance level, the Mathematical Formulae and Statistical Tables booklet provides a critical value $r^*$ such that, if $H_0$ is true,`,
    ),
    m(raw`P(r>r^*)=\text{significance level}.`),
    p("The critical value is always positive. The test works as follows."),
    p(
      raw`For $H_1:\rho>0$, the critical region is $r>r^*$ at the stated significance level.`,
    ),
    p(
      raw`For $H_1:\rho<0$, the critical region is $r<-r^*$ at the stated significance level (by symmetry).`,
    ),
    p(
      raw`For $H_1:\rho\neq0$ at total significance level $\alpha$, use the column for significance level $\alpha/2$ in each tail. The critical region is $r>r^*$ or $r<-r^*$.`,
    ),
    p(
      "If the sample $r$ lies in the critical region, reject $H_0$ and conclude (in context) that there is evidence of correlation of the specified sign. Otherwise there is insufficient evidence to reject $H_0$.",
    ),
    group("Worked examples", [
      example([
        p(
          "Example 1.3.1. A teacher collects daily maximum gust $x$ (knots) and daily maximum relative humidity $y$ (%) for a sample of 8 days. The PMCC for the sample is $r=0.1149$. Test at the 10% level of significance whether there is evidence of positive correlation between the two variables, stating your hypotheses clearly.",
        ),
        step(1, "State the hypotheses.", [
          p(
            raw`Let $\rho$ be the population PMCC between maximum gust and maximum relative humidity. Because we are looking for positive correlation, use a one-tailed test.`,
          ),
          m(raw`H_0:\rho=0,\quad H_1:\rho>0.`),
        ]),
        step(2, "Find the critical value.", [
          p(
            "Sample size $n=8$, significance level 0.10. Reading the table of critical values for a one-tailed test, the critical value is",
          ),
          m("r^*=0.5067."),
          p("So the critical region is $r>0.5067$."),
        ]),
        step(3, "Compare.", [
          p(
            "The observed value is $r=0.1149$, which is less than 0.5067. The observed value does not lie in the critical region.",
          ),
        ]),
        step(4, "Conclude in context.", [
          p(
            "There is insufficient evidence, at the 10% level of significance, to reject $H_0$. We cannot conclude that there is a positive correlation between daily maximum gust and daily maximum relative humidity for the population from which this sample was drawn.",
          ),
        ]),
      ]),
      example([
        p(
          "Example 1.3.2. A scientist takes 30 observations of the masses of two reactants and calculates a PMCC of $r=-0.45$. The scientist claims that there is no correlation between the masses of the two reactants. Test the scientist’s claim at the 10% level of significance.",
        ),
        step(1, "Identify the alternative.", [
          p(
            "The claim is of no correlation, so we test for any correlation (positive or negative). This requires a two-tailed test.",
          ),
          m(raw`H_0:\rho=0,\quad H_1:\rho\neq0.`),
        ]),
        step(2, "Find the critical value.", [
          p(
            "Total significance 10%, so use 5% in each tail. Sample size $n=30$. Reading the table at the 0.05 level for $n=30$ gives a critical value of",
          ),
          m("r^*=0.3061."),
          p("Critical region: $r>0.3061$ or $r<-0.3061$."),
        ]),
        step(3, "Compare.", [
          p(
            "Observed $r=-0.45$, which satisfies $-0.45<-0.3061$. The observed value lies in the critical region.",
          ),
        ]),
        step(4, "Conclude in context.", [
          p(
            "There is sufficient evidence, at the 10% level of significance, to reject $H_0$. The data provide evidence that there is correlation between the masses of the two reactants, so the scientist’s claim of no correlation is not supported.",
          ),
        ]),
      ]),
      example([
        {
          type: "paragraph",
          content: [
            ...inline(
              "Example 1.3.3. A student investigates the relationship between average income $x$ (GDP per capita, ",
            ),
            { type: "math", latex: String.raw`\$` },
            ...inline(
              ") and average annual carbon dioxide emissions $y$ (tonnes per capita) in a random sample of 24 countries. The PMCC between $x$ and $y$ is $r=0.446$.",
            ),
          ],
        },
        p(
          "Test, at the 5% level of significance, whether there is evidence that the population PMCC is positive. State your hypotheses clearly.",
        ),
        step(1, "Hypotheses.", [
          p(raw`Let $\rho$ be the population PMCC between $x$ and $y$.`),
          m(raw`H_0:\rho=0,\quad H_1:\rho>0.`),
          p("This is a one-tailed test at the 5% level."),
        ]),
        step(2, "Critical value.", [
          p(
            "From the table for a one-tailed test at the 0.05 level with $n=24$, the critical value is",
          ),
          m("r^*=0.3438."),
          p("Critical region: $r>0.3438$."),
        ]),
        step(3, "Compare.", [
          p(
            "Observed $r=0.446>0.3438$, so the observed value lies in the critical region.",
          ),
        ]),
        step(4, "Conclude in context.", [
          p(
            "There is sufficient evidence, at the 5% level, to reject $H_0$ and conclude that there is a positive correlation between GDP per capita and average annual CO₂ emissions for the population of countries from which the sample was drawn.",
          ),
        ]),
      ]),
    ]),
    group("Practice questions", [
      p(
        "1. A sample of 40 students from a college took two tests, and a PMCC of $r=0.3275$ was calculated between the scores. Test, at both the 5% and the 2% significance levels, whether there is evidence of correlation between the test scores. In each case state your hypotheses clearly.",
      ),
      p(
        "2. An ice-cream seller believes that there is a positive correlation between hours of sunshine and daily ice-cream sales. She collects data from 6 days and calculates $r=0.793$. Carry out a suitable test at the 5% level of significance. State your hypotheses clearly.",
      ),
      p(
        "3. A meteorologist collects daily mean windspeed and daily maximum gust data for 5 days and calculates a PMCC of $r=0.915$. Test, at the 5% level of significance, whether there is evidence of positive correlation between the two variables. State your hypotheses clearly and state the critical value you use.",
      ),
      p(
        raw`4. A safari ranger takes a random sample of 10 equal-sized areas of grassland and finds the PMCC between grass density and the number of grazing meerkats to be $r=0.66$. This value led him to reject $H_0:\rho=0$ in favour of $H_1:\rho>0$. Suggest the least possible significance level for the ranger’s test.`,
      ),
    ]),
    group("Solutions", [
      example([
        p(
          "Practice 1. Test at 5% and 2% levels, $n=40$, $r=0.3275$, evidence of correlation.",
        ),
        p(
          raw`Hypotheses (both tests). $H_0:\rho=0$, $H_1:\rho\neq0$ (two-tailed, since “evidence of correlation” means either sign).`,
        ),
        p(
          "Part (a) — 5% level. Use 2.5% in each tail. From the table with $n=40$, the critical value is $r^*=0.3120$. Critical region: $r>0.3120$ or $r<-0.3120$.",
        ),
        p(
          "Since $0.3275>0.3120$, the observed value lies in the critical region. Reject $H_0$. There is sufficient evidence at the 5% level of significance that there is correlation between the two test scores.",
        ),
        p(
          "Part (b) — 2% level. Use 1% in each tail. From the table with $n=40$, the critical value is $r^*=0.3665$. Critical region: $r>0.3665$ or $r<-0.3665$.",
        ),
        p(
          "Since $0.3275<0.3665$, the observed value does not lie in the critical region. Do not reject $H_0$. There is insufficient evidence at the 2% level of significance to conclude that there is correlation between the two test scores.",
        ),
        p(
          "Interpretation. The strength of evidence depends on the significance level chosen: the same sample gives a “significant” result at 5% but not at 2%.",
        ),
      ]),
      example([
        p(
          "Practice 2. Ice-cream seller, $n=6$, $r=0.793$, positive correlation at 5%.",
        ),
        p(
          raw`Hypotheses. Let $\rho$ be the population PMCC between sunshine and ice-cream sales. Since the belief is of positive correlation, use a one-tailed test.`,
        ),
        m(raw`H_0:\rho=0,\quad H_1:\rho>0.`),
        p(
          "Critical value. From the table for a one-tailed test at the 0.05 level with $n=6$: $r^*=0.7293$. Critical region: $r>0.7293$.",
        ),
        p(
          "Compare. $r=0.793>0.7293$, so the observed value lies in the critical region.",
        ),
        p(
          "Conclude. Reject $H_0$. There is sufficient evidence at the 5% level of significance that there is a positive correlation between hours of sunshine and daily ice-cream sales, supporting the seller’s belief.",
        ),
      ]),
      example([
        p(
          "Practice 3. Windspeed vs gust, $n=5$, $r=0.915$, positive correlation at 5%.",
        ),
        p(
          raw`Hypotheses. Let $\rho$ be the population PMCC between mean windspeed and maximum gust.`,
        ),
        m(raw`H_0:\rho=0,\quad H_1:\rho>0.`),
        p(
          "Critical value. One-tailed 5% with $n=5$: $r^*=0.8054$. Critical region: $r>0.8054$.",
        ),
        p(
          "Compare. $r=0.915>0.8054$, so the observed value lies in the critical region.",
        ),
        p(
          "Conclude. Reject $H_0$. There is sufficient evidence at the 5% level of significance of a positive correlation between daily mean windspeed and daily maximum gust, supporting the meteorologist’s claim.",
        ),
      ]),
      example([
        p(
          "Practice 4. Safari ranger, $n=10$, $r=0.66$, one-tailed test for positive correlation; $H_0$ was rejected. Suggest the least significance level.",
        ),
        p(
          raw`For a one-tailed test, rejecting $H_0$ requires $r\geq r^*$ for the critical value $r^*$ at the chosen significance level. Since smaller significance levels have larger critical values, the smallest significance level for which $H_0$ is rejected is the one whose critical value is just below $r=0.66$.`,
        ),
        p("Reading the one-tailed critical values for $n=10$:"),
        table(
          ["Significance level", "10%", "5%", "2.5%", "1%"],
          [["Critical value", "0.4716", "0.5822", "0.6664", "0.7498"]],
        ),
        p(
          "The value 0.66 exceeds 0.5822 (at 5%) but is less than 0.6664 (at 2.5%). Therefore the least possible significance level at which $H_0$ can be rejected is 5%.",
        ),
      ]),
    ]),
  ],
);
