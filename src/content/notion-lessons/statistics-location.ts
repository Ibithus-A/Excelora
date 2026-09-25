import {
  nativeLesson,
  p,
  m,
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
    "Chapter 2: Measures of Location and Spread",
    title,
    blocks,
  );
const centralQuestions = [
  p(
    "1. The times (in seconds) taken by 8 students to solve a puzzle are: 12, 15, 18, 18, 22, 25, 30, 45. Find the mean, median and mode.",
  ),
  p(
    raw`2. A data set has 60 values with $\sum x=480$. A second data set has 40 values with $\sum x=280$. Find the mean of the combined 100 values.`,
  ),
  p(
    "3. The heights (cm) of a group of students are recorded in a grouped frequency table:",
  ),
];
const heights = table(
  ["Height, $h$ (cm)", "Frequency"],
  [
    [raw`$150\leqslant h<160$`, "5"],
    [raw`$160\leqslant h<170$`, "18"],
    [raw`$170\leqslant h<180$`, "12"],
    [raw`$180\leqslant h<190$`, "5"],
  ],
);
const heightParts = [
  p("(a) Write down the modal class."),
  p("(b) Estimate the mean height."),
  p("(c) Find the class containing the median."),
];
const quartileQuestions = [
  p(
    "1. The weights (g) of 12 apples are: 105, 108, 112, 115, 118, 120, 122, 125, 130, 135, 140, 180. Find $Q_1$, $Q_3$, the IQR, and determine whether any values are outliers.",
  ),
  p(
    "2. A data set has $Q_1=14$, $Q_3=26$. Find the IQR and determine the outlier boundaries.",
  ),
  p(
    "3. For a data set of 20 values arranged in order, find the positions of the median, $Q_1$ and $Q_3$.",
  ),
];
const varianceQuestions = [
  p(
    "1. The times (minutes) spent on homework by 6 students are: 20, 25, 30, 35, 45, 55. Calculate the variance and standard deviation.",
  ),
  p(
    raw`2. A data set of 30 values has $\sum x=180$ and $\sum x^2=1260$. Calculate the mean and standard deviation. Another data set of 20 values has mean 5 and $\sum x^2=600$. Find the standard deviation of this second data set.`,
  ),
  p(
    raw`3. The masses (kg) of 100 packages have $\sum x=250$ and $\sum x^2=750$. Calculate the mean and standard deviation. An extra package of mass 10 kg is added. Find the new mean and standard deviation of all 101 packages.`,
  ),
];
const codingQuestions = [
  p(
    raw`1. The masses of 30 items have been coded using $y=\frac{x-50}{2}$. The coded data gives $\bar y=3.5$ and $\sigma_y=1.8$. Find the mean and standard deviation of the original masses.`,
  ),
  p(
    raw`2. Data are coded using $y=x-200$. Given $\sum y=150$ and $\sum y^2=1250$ for $n=25$, find the mean and standard deviation of the original data $x$.`,
  ),
  p(
    "3. Explain why coding does not change the standard deviation when $b=1$ (i.e. when $y=x-a$).",
  ),
];
export const STATISTICS_LOCATION_LESSONS = [
  lesson("2.1 Measures of Central Tendency", [
    p(
      "A measure of location is a single value that describes a position in a data set. When it describes the centre of the data, it is called a measure of central tendency. The three most common measures are the mean, the median and the mode.",
    ),
    group("Key Definitions and Formulae", [
      p(
        "The mode (or modal class) is the value or class that occurs most often.",
      ),
      p(
        raw`The median is the middle value when all data values are placed in order. For $n$ values, the median is the $\left(\frac{n+1}{2}\right)$th value.`,
      ),
      p("The mean of a data set is:"),
      m(raw`\bar x=\frac{\sum x}{n}`),
      p(
        raw`where $\sum x$ is the sum of all data values and $n$ is the number of values.`,
      ),
      p("For data in a frequency table:"),
      m(raw`\bar x=\frac{\sum xf}{\sum f}`),
      p("where $f$ is the frequency for each value $x$."),
      p("For grouped data, use midpoints of each class in place of $x$."),
      p(
        raw`For data in a frequency table, the median is found by identifying the $\left(\frac{n+1}{2}\right)$th value using cumulative frequencies.`,
      ),
    ]),
    p(
      "The mode is useful for qualitative data. The median is robust against extreme values (outliers). The mean uses all data values and gives a true measure of centre, but is affected by extreme values.",
    ),
    group("Worked Example 1", [
      p(
        "The mean of a sample of 25 observations is 6.4. The mean of a second sample of 30 observations is 7.2. Calculate the mean of all 55 observations.",
      ),
      step(1, "Find the sum of each set of observations", [
        p(
          raw`Find the sum of each set of observations using $\sum x=n\bar x$.`,
        ),
        p(raw`For the first set: $\sum x=25\times6.4=160$.`),
        p(raw`For the second set: $\sum y=30\times7.2=216$.`),
      ]),
      step(2, "Combine the two sets", [
        m(
          raw`\text{Combined mean}=\frac{160+216}{25+30}=\frac{376}{55}=6.836\ldots\approx6.84\quad(2\text{ d.p.})`,
        ),
      ]),
    ]),
    group("Worked Example 2", [
      p(
        "The number of pets owned by each of 40 students is recorded in a frequency table:",
      ),
      table(
        ["Number of pets", "0", "1", "2", "3", "4"],
        [["Frequency", "8", "14", "10", "5", "3"]],
      ),
      p("Find the mean, median and mode."),
      p(raw`Mean: Calculate $\sum xf$:`),
      m(raw`\sum xf=(0)(8)+(1)(14)+(2)(10)+(3)(5)+(4)(3)=0+14+20+15+12=61`),
      m(raw`\bar x=\frac{\sum xf}{\sum f}=\frac{61}{40}=1.525`),
      p(
        raw`Median: There are 40 values, so the median is the $\frac{40+1}{2}=20.5$th value, i.e. the average of the 20th and 21st values.`,
      ),
      p("Build cumulative frequencies: 8, 22, 32, 37, 40."),
      p(
        "The 20th and 21st values both fall in the “1 pet” group (cumulative frequency reaches 22 at $x=1$).",
      ),
      p("So the median is 1."),
      p(
        "Mode: The value with the highest frequency is 1 (frequency 14), so the mode is 1.",
      ),
    ]),
    group("Worked Example 3", [
      p("The ages of members of a running club are summarised in the table:"),
      table(
        ["Age, $a$ (years)", "Frequency"],
        [
          [raw`$20\leqslant a<30$`, "12"],
          [raw`$30\leqslant a<40$`, "28"],
          [raw`$40\leqslant a<50$`, "35"],
          [raw`$50\leqslant a<70$`, "15"],
        ],
      ),
      p("(a) Write down the modal class."),
      p("(b) Estimate the mean age."),
      p(
        raw`(a) The modal class is $40\leqslant a<50$ since it has the highest frequency (35).`,
      ),
      p("(b) Use the midpoint of each class:"),
      p("Midpoints: 25, 35, 45, 60"),
      m(
        raw`\begin{aligned}\sum xf&=(25)(12)+(35)(28)+(45)(35)+(60)(15)\\&=300+980+1575+900=3755\end{aligned}`,
      ),
      m(
        raw`\bar x=\frac{\sum xf}{\sum f}=\frac{3755}{90}=41.72\approx41.7\text{ years}`,
      ),
      p(
        "This is an estimate because we use class midpoints rather than the actual data values.",
      ),
    ]),
    group("Practice Questions", [...centralQuestions, heights, ...heightParts]),
    group("Practice Solutions", [
      example([
        centralQuestions[0],
        p("Mean:"),
        m(
          raw`\bar x=\frac{12+15+18+18+22+25+30+45}{8}=\frac{185}{8}=23.125\text{ seconds}`,
        ),
        p(
          "Median: There are 8 values, so the median is the average of the 4th and 5th values.",
        ),
        p("The ordered data is: 12, 15, 18, 18, 22, 25, 30, 45."),
        m(raw`\text{Median}=\frac{18+22}{2}=20\text{ seconds}`),
        p(
          "Mode: The value 18 appears twice (more than any other value), so the mode is 18 seconds.",
        ),
      ]),
      example([
        centralQuestions[1],
        m(raw`\text{Combined mean}=\frac{480+280}{60+40}=\frac{760}{100}=7.6`),
      ]),
      example([
        p("3. Heights of students are recorded in a grouped frequency table."),
        p(
          "(a) Write down the modal class. (b) Estimate the mean height. (c) Find the class containing the median.",
        ),
        p(
          raw`(a) The modal class is $160\leqslant h<170$ (highest frequency of 18).`,
        ),
        p(
          "(b) Midpoints: 155, 165, 175, 185. Total frequency: $5+18+12+5=40$.",
        ),
        m(
          raw`\begin{aligned}\sum xf&=(155)(5)+(165)(18)+(175)(12)+(185)(5)\\&=775+2970+2100+925=6770\end{aligned}`,
        ),
        m(raw`\bar x=\frac{6770}{40}=169.25\text{ cm}`),
        p(
          raw`(c) With 40 values, the median is the $\frac{40+1}{2}=20.5$th value.`,
        ),
        p("Cumulative frequencies: 5, 23, 35, 40."),
        p(
          raw`The 20.5th value lies in the second class ($160\leqslant h<170$) since the cumulative frequency reaches 23 at this class.`,
        ),
      ]),
    ]),
  ]),
  lesson("2.2 Quartiles, Percentiles and Measures of Spread", [
    p(
      "Quartiles and percentiles describe positions within a data set. Measures of spread describe how widely the data values are dispersed.",
    ),
    group("Quartiles and Percentiles", [
      p(
        raw`The lower quartile ($Q_1$) divides the bottom 25% of the data. For $n$ values, $Q_1$ is the $\frac{n}{4}$th value.`,
      ),
      p(
        raw`The upper quartile ($Q_3$) divides the bottom 75% of the data. $Q_3$ is the $\frac{3n}{4}$th value.`,
      ),
      p(
        "If the position is not a whole number, round up to find the value at that position. If it is a whole number, take the average of that value and the next.",
      ),
      p(
        "The $k$th percentile $P_k$ is the value below which $k$% of the data lies.",
      ),
    ]),
    group("Measures of Spread", [
      m(raw`\text{Range}=x_{\max}-x_{\min}`),
      m(raw`\text{Interquartile range (IQR)}=Q_3-Q_1`),
      m(raw`\text{Interpercentile range}=P_b-P_a`),
      p(
        raw`A value is an outlier if it is more than $1.5\times\mathrm{IQR}$ below $Q_1$ or above $Q_3$:`,
      ),
      m(raw`\text{Outlier if }x<Q_1-1.5\times\mathrm{IQR}`),
      m(raw`\text{or }x>Q_3+1.5\times\mathrm{IQR}`),
    ]),
    p(
      "The IQR is a more robust measure of spread than the range because it is not affected by extreme values. Percentiles are used for more refined analysis; the 10th to 90th interpercentile range captures the central 80% of the data.",
    ),
    group("Worked Example 4", [
      p(
        "The following data shows the number of minutes 11 commuters spend travelling to work each day:",
      ),
      m("15,18,22,25,28,30,35,40,42,55,90"),
      p("(a) Find the median, lower quartile and upper quartile."),
      p("(b) Calculate the IQR and determine whether any values are outliers."),
      p("(a) The data is already in order with $n=11$."),
      p(
        raw`Median position: $\frac{11+1}{2}=6$th value $\Rightarrow$ median $=30$.`,
      ),
      p(
        raw`$Q_1$ position: $\frac{11}{4}=2.75$, round up to 3rd value $\Rightarrow Q_1=22$.`,
      ),
      p(
        raw`$Q_3$ position: $\frac{3\times11}{4}=8.25$, round up to 9th value $\Rightarrow Q_3=42$.`,
      ),
      p("(b) IQR $=Q_3-Q_1=42-22=20$."),
      p(raw`Lower fence: $Q_1-1.5\times\mathrm{IQR}=22-30=-8$.`),
      p(raw`Upper fence: $Q_3+1.5\times\mathrm{IQR}=42+30=72$.`),
      p("Since $90>72$, the value 90 is an outlier."),
      p("No values are below $-8$, so there are no outliers at the lower end."),
    ]),
    group("Practice Questions", quartileQuestions),
    group("Practice Solutions", [
      example([
        p(
          "1. Weights (g) of 12 apples: 105, 108, 112, 115, 118, 120, 122, 125, 130, 135, 140, 180.",
        ),
        p(
          "Find $Q_1$, $Q_3$, the IQR, and determine whether any values are outliers.",
        ),
        p(
          raw`$n=12$. $Q_1$ position: $\frac{12}{4}=3$, so $Q_1=\frac{112+115}{2}=113.5$ g.`,
        ),
        p(
          raw`$Q_3$ position: $\frac{3\times12}{4}=9$, so $Q_3=\frac{130+135}{2}=132.5$ g.`,
        ),
        p("IQR $=132.5-113.5=19$ g."),
        p(raw`Lower fence: $113.5-1.5\times19=113.5-28.5=85$.`),
        p(raw`Upper fence: $132.5+1.5\times19=132.5+28.5=161$.`),
        p("Since $180>161$, the value 180 g is an outlier."),
        p("No values are below 85, so there are no lower outliers."),
      ]),
      example([
        quartileQuestions[1],
        p("IQR $=Q_3-Q_1=26-14=12$."),
        p(raw`Lower fence: $Q_1-1.5\times\mathrm{IQR}=14-18=-4$.`),
        p(raw`Upper fence: $Q_3+1.5\times\mathrm{IQR}=26+18=44$.`),
        p(
          "Any value less than $-4$ or greater than 44 would be classified as an outlier.",
        ),
      ]),
      example([
        quartileQuestions[2],
        p(
          raw`Median position: $\frac{20+1}{2}=10.5$, so the median is the average of the 10th and 11th values.`,
        ),
        p(
          raw`$Q_1$ position: $\frac{20}{4}=5$, so $Q_1$ is the average of the 5th and 6th values.`,
        ),
        p(
          raw`$Q_3$ position: $\frac{3\times20}{4}=15$, so $Q_3$ is the average of the 15th and 16th values.`,
        ),
      ]),
    ]),
  ]),
  lesson("2.3 Variance and Standard Deviation", [
    p(
      "The variance and standard deviation measure how spread out the data values are from the mean. Unlike the range and IQR, they use every data point, giving a more complete picture of the spread.",
    ),
    group("Variance and Standard Deviation", [
      p("The variance of a data set is:"),
      m(
        raw`\sigma^2=\frac{\sum(x-\bar x)^2}{n}=\frac{\sum x^2}{n}-\left(\frac{\sum x}{n}\right)^2=\frac{S_{xx}}{n}`,
      ),
      p(
        raw`where $S_{xx}=\sum(x-\bar x)^2=\sum x^2-\frac{(\sum x)^2}{n}$ is the summary statistic.`,
      ),
      p("The standard deviation is:"),
      m(
        raw`\sigma=\sqrt{\text{variance}}=\sqrt{\frac{\sum x^2}{n}-\left(\frac{\sum x}{n}\right)^2}`,
      ),
      p("For data in a frequency table:"),
      m(
        raw`\sigma^2=\frac{\sum fx^2}{\sum f}-\left(\frac{\sum fx}{\sum f}\right)^2`,
      ),
      m(
        raw`\sigma=\sqrt{\frac{\sum fx^2}{\sum f}-\left(\frac{\sum fx}{\sum f}\right)^2}`,
      ),
      p(
        raw`The formula $\frac{\sum x^2}{n}-\bar x^2$ is often described as “the mean of the squares minus the square of the mean”.`,
      ),
    ]),
    p(
      raw`The variance has units that are the square of the original units (e.g. $\mathrm{cm}^2$), while the standard deviation has the same units as the data. A larger standard deviation indicates greater spread.`,
    ),
    group("Worked Example 5", [
      p(
        "The marks gained in a test by seven randomly selected students are: 3, 4, 6, 2, 8, 8, 5. Find the variance and standard deviation.",
      ),
      step(1, "Calculate the sums", [
        p(raw`Calculate $\sum x$ and $\sum x^2$.`),
        m(raw`\sum x=3+4+6+2+8+8+5=36`),
        m(raw`\sum x^2=9+16+36+4+64+64+25=218`),
      ]),
      step(2, "Apply the variance formula", [
        p("Apply the variance formula with $n=7$:"),
        m(
          raw`\begin{aligned}\sigma^2&=\frac{\sum x^2}{n}-\left(\frac{\sum x}{n}\right)^2\\&=\frac{218}{7}-\left(\frac{36}{7}\right)^2\\&=31.143-26.449=4.69\quad(3\text{ s.f.})\end{aligned}`,
        ),
      ]),
      step(3, "Standard deviation", [
        m(raw`\sigma=\sqrt{4.69}=2.17\quad(3\text{ s.f.})`),
      ]),
    ]),
    group("Worked Example 6", [
      p(
        raw`A data set of 50 observations has $\sum x=400$ and $\sum x^2=3600$. Find the mean and standard deviation.`,
      ),
      p("Mean:"),
      m(raw`\bar x=\frac{\sum x}{n}=\frac{400}{50}=8`),
      p("Standard deviation:"),
      m(
        raw`\sigma=\sqrt{\frac{\sum x^2}{n}-\bar x^2}=\sqrt{\frac{3600}{50}-8^2}=\sqrt{72-64}=\sqrt8=2\sqrt2\approx2.83`,
      ),
    ]),
    group("Practice Questions", varianceQuestions),
    group("Practice Solutions", [
      example([
        p(
          "1. Times (minutes) spent on homework by 6 students: 20, 25, 30, 35, 45, 55. Calculate the variance and standard deviation.",
        ),
        m(raw`\sum x=20+25+30+35+45+55=210`),
        m(raw`\sum x^2=400+625+900+1225+2025+3025=8200`),
        m(
          raw`\sigma^2=\frac{8200}{6}-\left(\frac{210}{6}\right)^2=1366.\overline6-35^2=1366.\overline6-1225=141.\overline6`,
        ),
        m(
          raw`\sigma=\sqrt{141.\overline6}=11.9\text{ minutes }(3\text{ s.f.})`,
        ),
      ]),
      example([
        p(
          raw`2. First data set: $n=30$, $\sum x=180$, $\sum x^2=1260$. Second data set: $n=20$, mean $=5$, $\sum x^2=600$.`,
        ),
        p("First data set:"),
        m(
          raw`\bar x=\frac{180}{30}=6.\qquad\sigma=\sqrt{\frac{1260}{30}-6^2}=\sqrt{42-36}=\sqrt6\approx2.45.`,
        ),
        p("Second data set:"),
        m(
          raw`\sigma=\sqrt{\frac{600}{20}-5^2}=\sqrt{30-25}=\sqrt5\approx2.24.`,
        ),
      ]),
      example([
        p(
          raw`3. 100 packages: $\sum x=250$, $\sum x^2=750$. An extra package of 10 kg is added.`,
        ),
        p(raw`Original: $\bar x=\frac{250}{100}=2.5$ kg.`),
        m(
          raw`\sigma=\sqrt{\frac{750}{100}-2.5^2}=\sqrt{7.5-6.25}=\sqrt{1.25}\approx1.12\text{ kg}.`,
        ),
        p("With extra package:"),
        p(
          raw`New $\sum x=250+10=260$. New $\sum x^2=750+100=850$. New $n=101$.`,
        ),
        m(
          raw`\bar x_{\text{new}}=\frac{260}{101}=2.574\ldots\approx2.57\text{ kg}`,
        ),
        m(
          raw`\sigma_{\text{new}}=\sqrt{\frac{850}{101}-\left(\frac{260}{101}\right)^2}=\sqrt{8.4158-6.6266}=\sqrt{1.7892}\approx1.34\text{ kg}`,
        ),
        p(
          "The extra heavy package has increased both the mean and the standard deviation.",
        ),
      ]),
    ]),
  ]),
  lesson("2.4 Coding", [
    p(
      "Coding is a technique for simplifying statistical calculations by transforming data values into smaller, more manageable numbers. If the original data values are large or have awkward decimals, coding can make calculations much easier.",
    ),
    group("Coding Formulae", [
      p(
        raw`If data is coded using the formula $y=\frac{x-a}{b}$, where $a$ and $b$ are constants:`,
      ),
      p("Mean:"),
      m(raw`\bar y=\frac{\bar x-a}{b}`),
      p(raw`Rearranging: $\bar x=b\bar y+a$`),
      p("Standard deviation:"),
      m(raw`\sigma_y=\frac{\sigma_x}{b}`),
      p(raw`Rearranging: $\sigma_x=b\sigma_y$`),
      p(
        "Note: The constant $a$ affects only the mean (it shifts the data), not the spread. The constant $b$ scales both the mean and the standard deviation.",
      ),
    ]),
    p(
      "The key idea is that adding or subtracting a constant changes the mean but not the standard deviation. Dividing by a constant scales both the mean and the standard deviation by the same factor.",
    ),
    group("Worked Example 7", [
      p(
        raw`A scientist measures the temperature, $x\,{}^\circ\mathrm C$, at five different points in a nuclear reactor. Her results are: 332, 355, 306, 317, 340.`,
      ),
      p(raw`(a) Use the coding $y=\frac{x-300}{10}$ to code this data.`),
      p("(b) Calculate the mean and standard deviation of the coded data."),
      p(
        "(c) Use your answer to part (b) to calculate the mean and standard deviation of the original data.",
      ),
      p(raw`(a) Apply $y=\frac{x-300}{10}$ to each value:`),
      m(
        raw`332\to\frac{332-300}{10}=3.2,\quad355\to5.5,\quad306\to0.6,\quad317\to1.7,\quad340\to4.0`,
      ),
      p("Coded values: 3.2, 5.5, 0.6, 1.7, 4.0."),
      p(raw`(b) $\sum y=3.2+5.5+0.6+1.7+4.0=15.0$`),
      m(raw`\sum y^2=10.24+30.25+0.36+2.89+16.00=59.74`),
      m(raw`\bar y=\frac{15.0}{5}=3.0`),
      m(
        raw`\sigma_y=\sqrt{\frac{59.74}{5}-3.0^2}=\sqrt{11.948-9}=\sqrt{2.948}=1.717\ldots\approx1.72`,
      ),
      p(raw`(c) Using $\bar x=b\bar y+a=10(3.0)+300=330\,{}^\circ\mathrm C$.`),
      m(
        raw`\sigma_x=b\sigma_y=10\times1.717=17.2\,{}^\circ\mathrm C\quad(3\text{ s.f.}).`,
      ),
    ]),
    group("Practice Questions", codingQuestions),
    group("Practice Solutions", [
      example([
        p(
          raw`1. Coded data: $y=\frac{x-50}{2}$, $\bar y=3.5$, $\sigma_y=1.8$. Find $\bar x$ and $\sigma_x$.`,
        ),
        m(raw`\bar x=b\bar y+a=2(3.5)+50=7+50=57.`),
        m(raw`\sigma_x=b\sigma_y=2(1.8)=3.6.`),
      ]),
      example([
        p(
          raw`2. $y=x-200$, $\sum y=150$, $\sum y^2=1250$, $n=25$. Find mean and standard deviation of $x$.`,
        ),
        p("Here $a=200$ and $b=1$."),
        p(raw`$\bar y=\frac{150}{25}=6$. So $\bar x=1(6)+200=206$.`),
        m(
          raw`\sigma_y=\sqrt{\frac{1250}{25}-6^2}=\sqrt{50-36}=\sqrt{14}\approx3.74.`,
        ),
        p(raw`Since $b=1$: $\sigma_x=1\times\sigma_y=\sqrt{14}\approx3.74$.`),
      ]),
      example([
        p(
          "3. Explain why coding does not change the standard deviation when $b=1$.",
        ),
        p(
          raw`When $b=1$, the coding is $y=x-a$, which simply shifts every data value by the same constant $a$. Since every value is shifted by the same amount, the distances between data values remain unchanged. The standard deviation measures how spread out the data values are from the mean, and this spread is unaffected by a uniform shift. Mathematically, $\sigma_x=b\sigma_y=1\times\sigma_y=\sigma_y$.`,
        ),
      ]),
    ]),
    group("End of Topic Assessment", [
      p("15 QUESTIONS"),
      example([
        p(
          raw`1. Joshua is investigating the daily total rainfall in Hurn for May to October 2015. Using the large data set, Joshua calculates $\sum r=174.9$ and $\sum r^2=643.53$ for the 31 days of August.`,
        ),
        p(
          "(a) Explain why Joshua needs to clean the data before calculating the mean.",
        ),
        p("(b) Describe how “tr” values should be handled."),
        p(
          "(c) Calculate the mean daily total rainfall for August 2015 in Hurn.",
        ),
        p("(d) Calculate the standard deviation."),
      ]),
      example([
        p(
          "2. Jiang is studying Daily Mean Pressure from the large data set. He draws a box plot but fails to label the scale correctly and gives an incorrect median.",
        ),
        p("(a) State the units of Daily Mean Pressure in the large data set."),
        p(
          "(b) Using your knowledge of the large data set, explain what the five values are that Jiang needs to draw a box and whisker plot.",
        ),
      ]),
      example([
        p(
          raw`3. A random sample of 30 call durations (in minutes) at a call centre gives $\sum x=135$ and $\sum x^2=1020$.`,
        ),
        p("(a) Calculate the mean call duration."),
        p("(b) Calculate the standard deviation."),
        p(
          raw`A second sample of 20 calls gives a mean of 5.2 minutes and $\sum x^2=620$.`,
        ),
        p(
          "(a) Find the mean and standard deviation for all 50 calls combined.",
        ),
      ]),
      example([
        p(
          raw`3. The ages of 50 employees are summarised: $\sum(x-40)=85$ and $\sum(x-40)^2=3200$.`,
        ),
        p("(a) Find the mean age."),
        p("(b) Find the standard deviation of the ages."),
      ]),
      example([
        p(
          raw`4. The histogram below represents the time, $t$ minutes, that 100 customers spend in a shop. The class intervals and frequencies are: $0\leqslant t<5$ (15), $5\leqslant t<10$ (30), $10\leqslant t<20$ (35), $20\leqslant t<40$ (20).`,
        ),
        p("(a) Write down the modal class."),
      ]),
    ]),
  ]),
];
