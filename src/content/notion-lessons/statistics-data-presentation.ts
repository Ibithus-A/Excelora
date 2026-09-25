import { nativeLesson, p, m, group, example, table } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson(
    "Statistics",
    "Chapter 3: Representations of Data",
    title,
    blocks,
  );
export const STATISTICS_DATA_PRESENTATION_LESSONS = [
  lesson("3.1 Outliers", [
    p(
      "An outlier is an extreme value that lies significantly outside the general pattern of the data. Identifying outliers is important because they can distort summary statistics such as the mean and standard deviation.",
    ),
    group("Outlier Criteria", [
      p("A data value $x$ is classified as an outlier if:"),
      m(
        raw`x<Q_1-1.5\times\operatorname{IQR}\quad\text{or}\quad x>Q_3+1.5\times\operatorname{IQR}`,
      ),
      p(raw`where $\operatorname{IQR}=Q_3-Q_1$.`),
      p(
        raw`The values $Q_1-1.5\times\operatorname{IQR}$ and $Q_3+1.5\times\operatorname{IQR}$ are called the outlier fences (or boundaries).`,
      ),
      p(
        "Outliers are not necessarily errors — they may represent genuinely unusual observations. Deciding whether to keep or remove an outlier requires judgement about the context.",
      ),
    ]),
    p(
      "An outlier may be caused by a measurement error, a recording error, or it may be a genuine extreme value. For example, a very high rainfall reading on a single day may be genuine (a storm), while a negative temperature reading in August might indicate a recording error.",
    ),
    group("Worked Example 1", [
      p(
        "A data set has $Q_1=25$, $Q_3=45$. The minimum value is 2 and the maximum value is 72.",
      ),
      p("(a) Calculate the outlier boundaries."),
      p("(b) Determine whether the minimum and maximum values are outliers."),
      p(raw`(a) $\operatorname{IQR}=Q_3-Q_1=45-25=20$.`),
      p(
        raw`Lower fence: $Q_1-1.5\times\operatorname{IQR}=25-1.5(20)=25-30=-5$.`,
      ),
      p(
        raw`Upper fence: $Q_3+1.5\times\operatorname{IQR}=45+1.5(20)=45+30=75$.`,
      ),
      p("(b) Minimum value 2: since $2>-5$, it is not an outlier."),
      p("Maximum value 72: since $72<75$, it is not an outlier."),
    ]),
    group("Practice Questions", [
      p(
        "1. Data set: 3, 8, 12, 15, 18, 22, 24, 28, 30, 55. Find $Q_1$, $Q_3$, IQR, and identify any outliers.",
      ),
      p(
        "2. A data set has $Q_1=110$, $Q_3=150$. Determine which of the values 40, 80, 170, 220 are outliers.",
      ),
      p(
        "3. Explain why an outlier should not always be removed from a data set.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(
          "1. Data: 3, 8, 12, 15, 18, 22, 24, 28, 30, 55. Find $Q_1$, $Q_3$, IQR, and identify outliers.",
        ),
        p(
          raw`$n=10$. $Q_1$ position: $\frac{10}4=2.5$, round up to 3rd value: $Q_1=12$.`,
        ),
        p(
          raw`$Q_3$ position: $\frac{30}4=7.5$, round up to 8th value: $Q_3=28$.`,
        ),
        p(raw`$\operatorname{IQR}=28-12=16$.`),
        p(
          "Lower fence: $12-1.5(16)=12-24=-12$. Upper fence: $28+1.5(16)=28+24=52$.",
        ),
        p(
          "Since $55>52$, the value 55 is an outlier. No values are below $-12$.",
        ),
      ]),
      example([
        p("2. $Q_1=110$, $Q_3=150$. Check: 40, 80, 170, 220."),
        p(
          raw`$\operatorname{IQR}=150-110=40$. Lower fence: $110-60=50$. Upper fence: $150+60=210$.`,
        ),
        p(
          "$40<50$: outlier. 80: not an outlier. 170: not an outlier. $220>210$: outlier.",
        ),
      ]),
      example([
        p("3. Explain why an outlier should not always be removed."),
        p(
          "An outlier may represent a genuine extreme value that is a valid part of the data. Removing it could misrepresent the true variability of the population. Outliers should only be removed if there is evidence that they result from errors (measurement, recording or data entry). In some contexts, outliers are the most important values — for example, unusually high pollution readings or extreme weather events.",
        ),
      ]),
    ]),
  ]),
  lesson("3.2 Box Plots", [
    p(
      "A box plot (or box and whisker diagram) provides a visual summary of a data set using five key values. Box plots are particularly useful for comparing distributions.",
    ),
    group("Drawing a Box Plot", [
      p(
        "A box plot displays the five-number summary: minimum, $Q_1$, median ($Q_2$), $Q_3$, maximum.",
      ),
      p(
        raw`The “box” spans from $Q_1$ to $Q_3$ with a line at the median. The “whiskers” extend to the lowest and highest values that are not outliers. Outliers are plotted as individual crosses ($\times$).`,
      ),
      p(
        "Box plots are drawn on a linear scale and should always include a labelled axis with units.",
      ),
    ]),
    {
      type: "diagram",
      description:
        "A generic box plot on the source linear scale, with ticks 0, 10, 20, 30, 40, 50, 60 and 70. Labels min, Q1, Q2, Q3 and max identify the lower whisker, lower quartile, median, upper quartile and upper whisker. The source does not name the variable or units.",
      drawing: {
        type: "box-plot",
        range: [0, 80],
        ticks: [0, 10, 20, 30, 40, 50, 60, 70],
        values: [10, 22.5, 35, 50, 60],
        labels: [raw`\min`, "Q_1", "Q_2", "Q_3", raw`\max`],
      },
    },
    group("Worked Example 2", [
      p(
        "Two box plots are drawn for the masses of male and female cats. The male cats have $Q_1=3.8$, $Q_2=4.2$, $Q_3=4.7$, min $=3.0$, max $=5.4$. The female cats have $Q_1=3.2$, $Q_2=3.6$, $Q_3=4.1$, min $=2.6$, max $=5.0$.",
      ),
      p("Compare the two distributions."),
      p(
        "Location: The median mass of male cats (4.2 kg) is higher than the median mass of female cats (3.6 kg). On average, male cats are heavier.",
      ),
      p(
        "Spread: The IQR for males is $4.7-3.8=0.9$ kg. The IQR for females is $4.1-3.2=0.9$ kg. The middle 50% of masses are equally spread for both genders.",
      ),
      p(
        "Range: Males: $5.4-3.0=2.4$ kg. Females: $5.0-2.6=2.4$ kg. The overall range is identical.",
      ),
      p(
        "Skewness: For males, the median is closer to $Q_1$ than $Q_3$, suggesting slight positive skew. For females, the median is also closer to $Q_1$, suggesting a similar shape.",
      ),
    ]),
    group("Practice Questions", [
      p(
        "1. A data set has min $=5$, $Q_1=12$, $Q_2=18$, $Q_3=25$, max $=40$. An outlier test shows 40 is an outlier. Describe how the box plot should be drawn.",
      ),
      p(
        "2. Two classes sit the same test. Class A: min 35, $Q_1=52$, median 60, $Q_3=71$, max 92. Class B: min 42, $Q_1=55$, median 65, $Q_3=74$, max 85. Compare the two distributions.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(
          "1. Min $=5$, $Q_1=12$, $Q_2=18$, $Q_3=25$, max $=40$ is an outlier. Describe the box plot.",
        ),
        p(
          raw`The box spans from $Q_1=12$ to $Q_3=25$ with a line at the median 18. The upper whisker extends to the largest non-outlier value (not 40). To find this, we need the next highest value below the upper fence $Q_3+1.5\times\operatorname{IQR}=25+1.5(13)=44.5$. Since 40 is identified as an outlier, the upper whisker extends to the largest value that is not an outlier. The value 40 is plotted as a cross ($\times$) beyond the whisker. The lower whisker extends to 5 (which is above $Q_1-1.5\times13=-7.5$, so not an outlier).`,
        ),
      ]),
      example([
        p("2. Class A vs Class B comparison."),
        p(
          "Location: Class B has a higher median (65 vs 60), suggesting Class B performed better on average.",
        ),
        p(
          raw`Spread: Class A $\operatorname{IQR}=71-52=19$. Class B $\operatorname{IQR}=74-55=19$. The middle 50% of marks are equally spread. Class A range $=57$, Class B range $=43$. Class A has a wider overall range.`,
        ),
        p(
          "Skewness: Class A median is closer to $Q_1$ (positive skew). Class B median is closer to $Q_1$ (also positive skew). Both have similar shape.",
        ),
      ]),
    ]),
  ]),
  lesson("3.3 Cumulative Frequency Diagrams", [
    p(
      "A cumulative frequency diagram shows the running total of frequencies up to each class boundary. It is used to estimate the median, quartiles and percentiles from grouped data.",
    ),
    group("Key Facts", [
      p(
        "Plot cumulative frequency against the upper class boundary of each class.",
      ),
      p("Join the points with a smooth curve (or straight line segments)."),
      p(
        raw`To estimate the median: read across from $\frac n2$ on the cumulative frequency axis.`,
      ),
      p(
        raw`To estimate $Q_1$: read across from $\frac n4$. To estimate $Q_3$: read across from $\frac{3n}4$.`,
      ),
      p(
        "Linear interpolation can also be used to estimate median and quartiles from grouped data:",
      ),
      m(raw`\text{Estimated value}=L+\left(\frac{p-F}{f}\right)\times w`),
      p(
        "where $L$ is the lower class boundary, $p$ is the target position, $F$ is the cumulative frequency before the class, $f$ is the class frequency, and $w$ is the class width.",
      ),
    ]),
    group("Worked Example 3", [
      p(
        "The times (minutes) taken by 80 students to complete a task are summarised:",
      ),
      table(
        ["Time, $t$ (min)", "Frequency"],
        [
          [raw`$5\leqslant t<10$`, "8"],
          [raw`$10\leqslant t<15$`, "22"],
          [raw`$15\leqslant t<20$`, "30"],
          [raw`$20\leqslant t<30$`, "15"],
          [raw`$30\leqslant t<45$`, "5"],
        ],
      ),
      p(
        "Use linear interpolation to estimate the median and interquartile range.",
      ),
      p("Cumulative frequencies: 8, 30, 60, 75, 80."),
      p(
        raw`Median ($\frac{80}2=40$th value): lies in class $15\leqslant t<20$.`,
      ),
      m(
        raw`\text{Median}=15+\frac{40-30}{30}\times5=15+\frac{10}{30}\times5=15+1.67=16.7\text{ min}`,
      ),
      p(
        raw`$Q_1$ ($\frac{80}4=20$th value): lies in class $10\leqslant t<15$.`,
      ),
      m(
        raw`Q_1=10+\frac{20-8}{22}\times5=10+\frac{12}{22}\times5=10+2.73=12.7\text{ min}`,
      ),
      p(
        raw`$Q_3$ ($\frac{3\times80}4=60$th value): lies in class $15\leqslant t<20$.`,
      ),
      m(raw`Q_3=15+\frac{60-30}{30}\times5=15+5=20.0\text{ min}`),
      p(raw`$\operatorname{IQR}=Q_3-Q_1=20.0-12.7=7.3$ minutes.`),
    ]),
    group("Practice Questions", [
      p(
        "1. The speeds (mph) of 120 cars are: 20–30 (15), 30–40 (35), 40–50 (40), 50–60 (20), 60–80 (10). Use interpolation to estimate the median and IQR.",
      ),
      p(
        "2. Explain why the median from a cumulative frequency diagram is an estimate, not an exact value.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p("1. Speeds of 120 cars. Estimate median and IQR."),
        p("Cumulative frequencies: 15, 50, 90, 110, 120."),
        p(
          raw`Median (60th value): class 40–50. $\text{Med}=40+\frac{60-50}{40}\times10=40+2.5=42.5$ mph.`,
        ),
        p(
          raw`$Q_1$ (30th value): class 30–40. $Q_1=30+\frac{30-15}{35}\times10=30+4.29=34.3$ mph.`,
        ),
        p(
          raw`$Q_3$ (90th value): class 40–50. $Q_3=40+\frac{90-50}{40}\times10=40+10=50.0$ mph.`,
        ),
        p(raw`$\operatorname{IQR}=50.0-34.3=15.7$ mph.`),
      ]),
      example([
        p("2. Why is the median from cumulative frequency an estimate?"),
        p(
          "Cumulative frequency diagrams are drawn from grouped data, where individual values are unknown. The diagram assumes a uniform distribution within each class. Linear interpolation estimates positions within classes, but the actual distribution may not be uniform, so the result is only an approximation.",
        ),
      ]),
    ]),
  ]),
  lesson("3.4 Histograms", [
    p(
      "Histograms are used to represent grouped continuous data, especially when class widths are unequal. Unlike bar charts, the area of each bar (not the height) is proportional to the frequency.",
    ),
    group("Histograms", [
      m(
        raw`\text{Frequency density}=\frac{\text{frequency}}{\text{class width}}`,
      ),
      m(
        raw`\text{Area of bar}=\text{frequency density}\times\text{class width}=\text{frequency}`,
      ),
      p(
        "When all class widths are equal, frequency density is proportional to frequency, so the histogram looks like a bar chart.",
      ),
      p(
        "Joining the midpoints of the top of each bar produces a frequency polygon.",
      ),
    ]),
    group("Worked Example 4", [
      p(
        "200 students were asked how long they spent on homework. The results:",
      ),
      table(
        ["Time, $t$ (min)", "Frequency", "Class width"],
        [
          [raw`$25\leqslant t<30$`, "55", "5"],
          [raw`$30\leqslant t<35$`, "39", "5"],
          [raw`$35\leqslant t<40$`, "68", "5"],
          [raw`$40\leqslant t<50$`, "32", "10"],
          [raw`$50\leqslant t<80$`, "6", "30"],
        ],
      ),
      p("(a) Calculate the frequency densities."),
      p(
        "(b) Estimate the number of students who took between 36 and 45 minutes.",
      ),
      p(
        raw`(a) Frequency densities: $\frac{55}5=11$, $\frac{39}5=7.8$, $\frac{68}5=13.6$, $\frac{32}{10}=3.2$, $\frac6{30}=0.2$.`,
      ),
      p("(b) The interval 36–45 spans parts of two classes:"),
      p(
        raw`From 35–40: proportion $=\frac{45-36}5$ ... Actually, 36 to 40 covers $\frac45$ of the class 35–40: estimated frequency $=\frac45\times68=54.4$.`,
      ),
      p(
        raw`From 40–50: 40 to 45 covers $\frac5{10}$ of the class: estimated frequency $=\frac5{10}\times32=16$.`,
      ),
      p(raw`Total estimate: $54.4+16=70.4\approx70$ students.`),
    ]),
    group("Practice Questions", [
      p(
        "1. A histogram has the following data: 0–10 (20), 10–25 (45), 25–30 (30), 30–50 (40). Calculate the frequency densities and state the modal class (highest frequency density).",
      ),
      p(
        "2. From a histogram, the bar for class 20–30 has frequency density 4. Find the frequency.",
      ),
      p(
        "3. Estimate the number of values between 22 and 35 if classes 20–30 has frequency 40 and 30–40 has frequency 50.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(
          "1. Classes: 0–10 (20), 10–25 (45), 25–30 (30), 30–50 (40). Frequency densities and modal class.",
        ),
        p(
          raw`Frequency densities: $\frac{20}{10}=2$, $\frac{45}{15}=3$, $\frac{30}5=6$, $\frac{40}{20}=2$.`,
        ),
        p(
          "The modal class (highest frequency density) is 25–30 with density 6.",
        ),
      ]),
      example([
        p("2. Class 20–30 has frequency density 4. Find the frequency."),
        m(
          raw`\text{Frequency}=\text{frequency density}\times\text{class width}=4\times10=40.`,
        ),
      ]),
      example([
        p(
          "3. Estimate values between 22 and 35 if 20–30 has $f=40$ and 30–40 has $f=50$.",
        ),
        p(
          raw`From 22 to 30: $\frac8{10}\times40=32$. From 30 to 35: $\frac5{10}\times50=25$. Total: $32+25=57$.`,
        ),
      ]),
    ]),
  ]),
  lesson("3.5 Comparing Data Sets", [
    p(
      "When comparing two or more data sets, you should consider both a measure of location (such as the mean or median) and a measure of spread (such as the IQR or standard deviation). Always relate your comparison to the context of the data.",
    ),
    group("Framework for Comparisons", [
      p(
        "1. Location: Compare means or medians. State which is higher/lower and interpret in context.",
      ),
      p(
        "2. Spread: Compare standard deviations, IQRs or ranges. State which is more/less spread and interpret.",
      ),
      p("3. Shape: If box plots are given, comment on symmetry/skewness."),
      p(
        "Always use the context of the data when writing your comparison (e.g. “On average, male students scored higher…” rather than “The mean is bigger…”).",
      ),
    ]),
    group("Worked Example 5", [
      p(
        "Two factories produce bolts. Factory A: mean length 25.2 mm, standard deviation 0.8 mm. Factory B: mean length 25.0 mm, standard deviation 1.5 mm. Compare the two factories.",
      ),
      p(
        "Location: Factory A has a slightly higher mean length (25.2 mm vs 25.0 mm). On average, bolts from Factory A are marginally longer.",
      ),
      p(
        "Spread: Factory A has a much smaller standard deviation (0.8 mm vs 1.5 mm). This means bolt lengths from Factory A are more consistent and less variable. Factory A produces more reliable bolts.",
      ),
    ]),
    group("Practice Questions", [
      p(
        raw`1. Town A temperatures: median $18^\circ\mathrm C$, IQR $6^\circ\mathrm C$. Town B: median $22^\circ\mathrm C$, IQR $3^\circ\mathrm C$. Compare.`,
      ),
      p(
        "2. Explain why the median and IQR might be preferred over the mean and standard deviation when comparing data sets that contain outliers.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(
          raw`1. Town A: median $18^\circ\mathrm C$, IQR $6^\circ\mathrm C$. Town B: median $22^\circ\mathrm C$, IQR $3^\circ\mathrm C$.`,
        ),
        p(
          raw`Location: Town B has a higher median temperature ($22^\circ\mathrm C$ vs $18^\circ\mathrm C$), so on average Town B is warmer.`,
        ),
        p(
          raw`Spread: Town A has a larger IQR ($6^\circ\mathrm C$ vs $3^\circ\mathrm C$), so temperatures in Town A are more variable. Town B has more consistent temperatures.`,
        ),
      ]),
      example([
        p("2. Why might median and IQR be preferred when there are outliers?"),
        p(
          "The median and IQR are resistant measures — they are not affected by extreme values. The mean can be pulled towards outliers, giving a misleading centre. The standard deviation is inflated by outliers, exaggerating the apparent spread. When outliers are present, the median and IQR give a more representative summary of the typical data values.",
        ),
      ]),
    ]),
  ]),
];
