import { nativeLesson, p, m, group, example } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson("Statistics", "Chapter 4: Correlation", title, blocks);
const scatter = (caption: string, ys: number[]): LessonBlock => ({
  type: "diagram",
  description: `${caption}: ten points at the positions shown in the source schematic. The horizontal x-axis represents the explanatory variable and the vertical y-axis the response variable. The diagram has no numerical tick labels.`,
  drawing: {
    type: "scatter",
    points: ys.map((y, i) => [i + 1, y]),
    xRange: [0, 12],
    yRange: [0, 10],
    xLabel: "x",
    yLabel: "y",
    caption,
  },
});
export const STATISTICS_CORRELATION_LESSONS = [
  lesson("4.1 Scatter Diagrams and Correlation", [
    p(
      "When two variables are measured for each individual in a sample, the resulting data is called bivariate data. A scatter diagram plots one variable against the other to reveal any relationship between them.",
    ),
    group("Types of Correlation", [
      p(
        "Positive correlation: As one variable increases, the other tends to increase. Points slope upward from left to right.",
      ),
      p(
        "Negative correlation: As one variable increases, the other tends to decrease. Points slope downward.",
      ),
      p("No correlation: No discernible linear pattern."),
      p(
        "The strength of correlation describes how closely the points lie to a straight line: strong, moderate, or weak.",
      ),
      p(
        "The independent (explanatory) variable goes on the $x$-axis. The dependent (response) variable goes on the $y$-axis.",
      ),
      p(
        "Correlation does not imply causation. A correlation between two variables does not mean one causes the other.",
      ),
    ]),
    scatter("Strong positive", [1.6, 3, 3.6, 5, 5.6, 6.4, 7, 8, 7.6, 9]),
    scatter("Strong negative", [8.4, 7.6, 7, 6, 5.6, 4.4, 4, 3, 2.4, 1.6]),
    scatter("No correlation", [6, 2, 8, 5, 3, 7, 1.6, 8.4, 4, 7]),
    group("Worked Example 1", [
      p(
        "A researcher collects data on the number of hours of sunshine per day and the number of ice creams sold by a shop. She finds a strong positive correlation.",
      ),
      p("(a) Describe the relationship between sunshine and ice cream sales."),
      p(
        "(b) Can the researcher conclude that sunshine causes more ice creams to be sold? Explain.",
      ),
      p(
        "(a) As the number of hours of sunshine increases, the number of ice creams sold also tends to increase. The strong positive correlation means the data points lie close to a line with positive gradient.",
      ),
      p(
        "(b) No. Correlation does not imply causation. While it is plausible that sunny weather leads to higher ice cream sales (e.g. because people go out more), there could be other factors involved, such as temperature, school holidays, or day of the week. A controlled experiment would be needed to establish causation.",
      ),
    ]),
    group("Practice Questions", [
      p(
        "1. Describe the type of correlation you would expect between: (a) temperature and heating bills, (b) height and shoe size, (c) number of pets and exam results.",
      ),
      p(
        "2. A study finds a strong positive correlation between the number of fire engines at a fire and the amount of damage caused. Explain why this does not mean fire engines cause damage.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(
          "1. Expected correlation: (a) temperature and heating, (b) height and shoe size, (c) pets and exam results.",
        ),
        p(
          "(a) Strong negative correlation — as temperature increases, heating bills tend to decrease.",
        ),
        p(
          "(b) Moderate positive correlation — taller people tend to have larger feet, but there is natural variation.",
        ),
        p(
          "(c) No correlation — there is no reason to expect a linear relationship between number of pets and exam performance.",
        ),
      ]),
      example([
        p("2. Fire engines and damage correlation."),
        p(
          "More fire engines are sent to larger fires, and larger fires naturally cause more damage. The correlation is caused by a third variable (the size/severity of the fire) which influences both the number of engines dispatched and the damage caused. The fire engines do not cause the damage — they are responding to a fire that is already large.",
        ),
      ]),
    ]),
  ]),
  lesson("4.2 Regression Lines", [
    p(
      "A regression line (line of best fit) models the linear relationship between two variables. In statistics at this level, you use the regression line of $y$ on $x$, written $y=a+bx$.",
    ),
    group("The Regression Line", [
      m("y=a+bx"),
      p(
        "$b$ is the gradient (slope) of the line. It represents the change in $y$ for each unit increase in $x$.",
      ),
      p(
        "$a$ is the $y$-intercept. It represents the predicted value of $y$ when $x=0$.",
      ),
      p(raw`The regression line passes through the point $(\bar x,\bar y)$.`),
      p(
        "Interpolation: Using the regression line to predict $y$ for values of $x$ within the range of the data. This is reliable.",
      ),
      p(
        "Extrapolation: Using the line to predict $y$ for values of $x$ outside the data range. This is unreliable because the linear relationship may not hold beyond the observed data.",
      ),
    ]),
    group("Worked Example 2", [
      p(
        raw`The regression line for daily mean temperature $t$ $^\circ\mathrm C$ and heating cost $c$ (pounds) is $c=8.5-0.3t$. The data covers temperatures from $2^\circ\mathrm C$ to $18^\circ\mathrm C$.`,
      ),
      p("(a) Interpret the gradient. (b) Interpret the $y$-intercept."),
      p(
        "(c) Predict the heating cost when $t=10$. (d) Why would it be unreliable to predict cost when $t=30$?",
      ),
      p(
        raw`(a) The gradient is $-0.3$, meaning that for each $1^\circ\mathrm C$ increase in temperature, the heating cost decreases by £0.30 on average.`,
      ),
      p(
        raw`(b) The $y$-intercept is 8.5, meaning that when the temperature is $0^\circ\mathrm C$, the predicted daily heating cost is £8.50. This is just outside the data range (2–18) so should be treated with caution.`,
      ),
      p(
        "(c) $c=8.5-0.3(10)=8.5-3=$ £5.50. This is interpolation (10 is within 2–18) so the prediction is reliable.",
      ),
      p(
        "(d) $t=30$ is well outside the data range (2–18), so this would be extrapolation. The linear relationship may not hold at high temperatures (e.g. heating costs might be zero or air conditioning costs might apply).",
      ),
    ]),
    group("Practice Questions", [
      p(
        "1. The regression line for the number of hours studied ($h$) and exam score ($s$) is $s=42+5.2h$. Data was collected for $h$ between 1 and 10.",
      ),
      p("(a) Interpret the gradient and intercept in context."),
      p("(b) Predict the score for a student who studied 6 hours."),
      p("(c) Explain why predicting a score for $h=20$ would be unreliable."),
      p(
        raw`2. A regression line gives a predicted value $\hat y=15$ for a data point that has actual value $y=18$. Find the residual and explain its significance.`,
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(raw`1. $s=42+5.2h$, $1\leqslant h\leqslant10$.`),
        p(
          "(a) Gradient 5.2: for each additional hour of study, the exam score increases by 5.2 marks on average. Intercept 42: a student who studied 0 hours would be predicted to score 42 marks. This is extrapolation (outside 1–10) so is unreliable.",
        ),
        p("(b) $s=42+5.2(6)=42+31.2=73.2$ marks. Reliable (interpolation)."),
        p(
          "(c) $h=20$ is well beyond the data range. The linear relationship may break down — scores cannot exceed 100, and there are diminishing returns to study.",
        ),
      ]),
      example([
        p(raw`2. Predicted $\hat y=15$, actual $y=18$.`),
        p(
          raw`Residual $=y-\hat y=18-15=3$. A positive residual means the actual value is above the regression line. The model underestimates $y$ at this point.`,
        ),
      ]),
    ]),
  ]),
];
