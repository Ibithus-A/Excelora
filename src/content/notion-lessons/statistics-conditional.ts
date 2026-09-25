import { nativeLesson, p, m, group, example, table } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson(
    "Statistics",
    "Chapter 9: Conditional Probability",
    title,
    blocks,
  );
export const STATISTICS_CONDITIONAL_LESSONS = [
  lesson("9.1 Set Notation", [
    p(
      "Events within a probability experiment can be combined or negated in a small number of standard ways. Using the right symbol for each combination keeps probability statements short and unambiguous, and is essential for reading exam questions that use the notation without explanation.",
    ),
    group("Standard set symbols for events", [
      p(raw`Let $A$ and $B$ be events within a sample space $\mathcal E$.`),
      p(raw`• $A\cap B$ is the event “$A$ and $B$” — both events occur.`),
      p(
        raw`• $A\cup B$ is the event “$A$ or $B$” — at least one event occurs (inclusive or).`,
      ),
      p(
        raw`• $A'$ is the event “not $A$” — the complement of $A$. Note $\mathrm P(A')=1-\mathrm P(A)$.`,
      ),
      p(
        raw`• If $A$ and $B$ are mutually exclusive, $A\cap B=\varnothing$ and $\mathrm P(A\cap B)=0$.`,
      ),
      p(
        raw`• If $A$ and $B$ are independent, $\mathrm P(A\cap B)=\mathrm P(A)\mathrm P(B)$.`,
      ),
    ]),
    p(
      raw`A Venn diagram represents each event by a region, with $\mathcal E$ the outer rectangle. The number in a region may stand for either a probability or a count of outcomes; context and notation clarify which. We write $n(A)$ for the number of outcomes in $A$ and $\mathrm P(A)$ for the probability.`,
    ),
    group("Worked examples", [
      example([
        p(
          raw`Example 2.1.1. A card is selected at random from a pack of 52 playing cards. Let $A$ be the event “the card is an ace” and $D$ the event “the card is a diamond”. Find $\mathrm P(A\cap D)$, $\mathrm P(A\cup D)$, $\mathrm P(A')$ and $\mathrm P(A'\cap D)$.`,
        ),
        p(
          "There are 4 aces and 13 diamonds, and 1 card (the ace of diamonds) is in both.",
        ),
        m(raw`\mathrm P(A\cap D)=\frac1{52},`),
        m(
          raw`\mathrm P(A\cup D)=\mathrm P(A)+\mathrm P(D)-\mathrm P(A\cap D)=\frac4{52}+\frac{13}{52}-\frac1{52}=\frac{16}{52}=\frac4{13},`,
        ),
        m(
          raw`\mathrm P(A')=1-\mathrm P(A)=1-\frac4{52}=\frac{48}{52}=\frac{12}{13},`,
        ),
        m(
          raw`\mathrm P(A'\cap D)=\mathrm P(D)-\mathrm P(A\cap D)=\frac{13}{52}-\frac1{52}=\frac{12}{52}=\frac3{13}.`,
        ),
      ]),
      example([
        p(
          raw`Example 2.1.2. Given that $\mathrm P(A)=0.3$, $\mathrm P(B)=0.4$ and $\mathrm P(A\cap B)=0.25$, explain why $A$ and $B$ are not independent.`,
        ),
        p(
          raw`If $A$ and $B$ were independent, then $\mathrm P(A\cap B)$ would have to equal $\mathrm P(A)\mathrm P(B)$:`,
        ),
        m(raw`\mathrm P(A)\mathrm P(B)=0.3\times0.4=0.12.`),
        p(
          raw`The actual value $\mathrm P(A\cap B)=0.25$ does not equal 0.12, so $A$ and $B$ are not independent.`,
        ),
      ]),
      example([
        p(
          raw`Example 2.1.3. Events $A$ and $B$ satisfy $\mathrm P(A)=0.5$, $\mathrm P(B)=0.2$ and $\mathrm P(A\cap B)=0.1$. Find $\mathrm P(A\cup B)$, $\mathrm P(B')$, $\mathrm P(A\cap B')$ and $\mathrm P(A\cup B')$.`,
        ),
        p(
          raw`Begin with a Venn diagram showing the four regions: $A\cap B'=0.4$, $A\cap B=0.1$, $A'\cap B=0.1$, $A'\cap B'=0.4$ (they must sum to 1).`,
        ),
        m(raw`\mathrm P(A\cup B)=0.4+0.1+0.1=0.6,`),
        m(raw`\mathrm P(B')=1-0.2=0.8,`),
        m(
          raw`\mathrm P(A\cap B')=\mathrm P(A)-\mathrm P(A\cap B)=0.5-0.1=0.4,`,
        ),
        m(
          raw`\mathrm P(A\cup B')=\mathrm P(A)+\mathrm P(B')-\mathrm P(A\cap B')=0.5+0.8-0.4=0.9.`,
        ),
      ]),
    ]),
    group("Practice questions", [
      p(
        raw`1. Events $C$ and $D$ are such that $\mathrm P(D)=0.4$, $\mathrm P(C\cap D)=0.15$ and $\mathrm P(C'\cap D')=0.1$. Find $\mathrm P(C'\cap D)$, $\mathrm P(C\cap D')$, $\mathrm P(C)$ and $\mathrm P(C'\cap D')$.`,
      ),
      p(
        "2. In a sports club, 50% of members play hockey, 40% play cricket, and 25% play both. Find the probability that a randomly chosen member plays: (a) hockey or cricket or both, (b) neither hockey nor cricket, (c) hockey but not cricket.",
      ),
      p(
        raw`3. A bag contains 50 counters numbered 1 to 50. The counters are either red or blue. Let $R$ be the event “counter is red” and $E$ the event “counter is even-numbered”. Given that $n(R)=17$, $n(E)=25$ and $n(R\cup E)=34$, find $n(R\cap E)$, $\mathrm P(R'\cap E')$ and $\mathrm P((R\cap E)')$.`,
      ),
    ]),
    group("Solutions", [
      example([
        p(
          raw`Practice 1. $\mathrm P(D)=0.4$, $\mathrm P(C\cap D)=0.15$, $\mathrm P(C'\cap D')=0.1$.`,
        ),
        p(
          "The four Venn regions must sum to 1. Starting from the intersection:",
        ),
        m(
          raw`\mathrm P(C'\cap D)=\mathrm P(D)-\mathrm P(C\cap D)=0.40-0.15=0.25,`,
        ),
        m(
          raw`\begin{aligned}\mathrm P(C\cap D')&=1-\mathrm P(C\cap D)-\mathrm P(C'\cap D)-\mathrm P(C'\cap D')\\&=1-0.15-0.25-0.10=0.50,\end{aligned}`,
        ),
        m(
          raw`\mathrm P(C)=\mathrm P(C\cap D)+\mathrm P(C\cap D')=0.15+0.50=0.65,`,
        ),
        m(raw`\mathrm P(C'\cap D')=0.10\quad(\text{given}).`),
      ]),
      example([
        p(
          raw`Practice 2. Sports club: $\mathrm P(H)=0.5$, $\mathrm P(C)=0.4$, $\mathrm P(H\cap C)=0.25$.`,
        ),
        p("(a) Addition formula:"),
        m(raw`\mathrm P(H\cup C)=0.5+0.4-0.25=0.65.`),
        p("(b) Neither event:"),
        m(raw`\mathrm P(H'\cap C')=1-\mathrm P(H\cup C)=1-0.65=0.35.`),
        p("(c) Hockey but not cricket:"),
        m(
          raw`\mathrm P(H\cap C')=\mathrm P(H)-\mathrm P(H\cap C)=0.5-0.25=0.25.`,
        ),
      ]),
      example([
        p(raw`Practice 3. 50 counters. $n(R)=17$, $n(E)=25$, $n(R\cup E)=34$.`),
        p("Using the addition formula on counts:"),
        m(raw`n(R\cap E)=n(R)+n(E)-n(R\cup E)=17+25-34=8.`),
        p("The number outside both events is"),
        m(raw`n(R'\cap E')=50-n(R\cup E)=50-34=16,`),
        p(raw`so $\mathrm P(R'\cap E')=\frac{16}{50}=\frac8{25}$.`),
        p(raw`Finally, $(R\cap E)'$ is the complement of the intersection:`),
        m(
          raw`\mathrm P((R\cap E)')=1-\mathrm P(R\cap E)=1-\frac8{50}=\frac{42}{50}=\frac{21}{25}.`,
        ),
      ]),
    ]),
  ]),
  lesson("9.2 Conditional Probability", [
    p(
      raw`The probability of an event often changes in the light of new information. If I tell you that a card drawn at random from a pack is a diamond, the probability that it is an ace rises from $\frac4{52}$ to $\frac1{13}$, because the sample space has been restricted. This idea is captured by the notion of conditional probability.`,
    ),
    group("Conditional probability", [
      p(
        raw`The probability that event $B$ occurs, given that event $A$ has already occurred, is written $\mathrm P(B\mid A)$. The vertical bar is read “given that”.`,
      ),
      p(
        "For independent events, knowledge of $A$ does not affect the probability of $B$, so",
      ),
      m(
        raw`\mathrm P(B\mid A)=\mathrm P(B\mid A')=\mathrm P(B)\quad\text{and}\quad\mathrm P(A\mid B)=\mathrm P(A\mid B')=\mathrm P(A).`,
      ),
      p("These equalities are often used as the definition of independence."),
    ]),
    p(
      "The key technique for computing conditional probability from a table or Venn diagram is to restrict the sample space to those outcomes for which the conditioning event has happened, and then count the favourable ones within that restricted sample space.",
    ),
    group("Worked examples", [
      example([
        p(
          raw`Example 2.2.1. A school has 75 Year 12 students. Of these, 25 study only humanities ($H$), 37 study only science ($S$) and 11 study both. Draw a two-way table and find $\mathrm P(S'\cap H')$, $\mathrm P(S\mid H)$ and $\mathrm P(H\mid S')$.`,
        ),
        p(
          raw`The table has rows for $S$ and $S'$ and columns for $H$ and $H'$. The four interior entries are: $S\cap H=11$ (both), $S\cap H'=37$ (only science), $S'\cap H=25$ (only humanities), so the last interior entry $S'\cap H'$ is obtained from the total:`,
        ),
        m(raw`S'\cap H'=75-11-37-25=2.`),
        table(
          ["", "$H$", "$H'$", "Total"],
          [
            ["$S$", "11", "37", "48"],
            ["$S'$", "25", "2", "27"],
            ["Total", "36", "39", "75"],
          ],
        ),
        p(raw`(i) $\mathrm P(S'\cap H')$. Unconditional: $\frac2{75}$.`),
        p(
          raw`(ii) $\mathrm P(S\mid H)$. Restrict the sample space to the column $H$. There are 36 humanities students, of whom 11 also study science.`,
        ),
        m(raw`\mathrm P(S\mid H)=\frac{11}{36}.`),
        p(
          raw`(iii) $\mathrm P(H\mid S')$. Restrict the sample space to the row $S'$. There are 27 non-science students, of whom 25 study humanities.`,
        ),
        m(raw`\mathrm P(H\mid S')=\frac{25}{27}.`),
      ]),
      example([
        p(
          "Example 2.2.2. Two fair four-sided dice are thrown and the sum of the scores is recorded. Given that at least one dice lands on 3, find the probability that the sum is exactly 5.",
        ),
        p(
          raw`The 16 equally likely outcomes can be laid out as pairs $(d_1,d_2)$ with each $d_i\in\{1,2,3,4\}$.`,
        ),
        p(
          "Restrict the sample space. At least one dice lands on 3 in the outcomes",
        ),
        m("(1,3),(2,3),(3,3),(4,3),(3,1),(3,2),(3,4)"),
        p("i.e. 7 outcomes. (Note $(3,3)$ is counted once only.)"),
        p(
          "Count favourable outcomes. Within this restricted sample space, the sum equals 5 only for $(2,3)$ and $(3,2)$. That is 2 outcomes.",
        ),
        p("Therefore"),
        m(raw`\mathrm P(\text{sum}=5\mid\text{at least one }3)=\frac27.`),
        p(
          "A modelling assumption is that the dice are fair, so every outcome is equally likely.",
        ),
      ]),
    ]),
    group("Practice questions", [
      p(
        "1. The two-way table below shows the fast-food preferences of 60 sixth-form students.",
      ),
      table(
        ["", "Pizza", "Curry", "Total"],
        [
          ["Male", "11", "18", "29"],
          ["Female", "14", "17", "31"],
          ["Total", "25", "35", "60"],
        ],
      ),
      p(
        raw`Find $\mathrm P(\text{Male})$, $\mathrm P(\text{Curry}\mid\text{Male})$, $\mathrm P(\text{Male}\mid\text{Curry})$ and $\mathrm P(\text{Pizza}\mid\text{Female})$.`,
      ),
      p(
        "2. Two fair coins are flipped and the results recorded. Given that at least one coin lands heads, find the probability of (a) two heads, (b) one head and one tail.",
      ),
      p(
        raw`3. 120 students are asked about their viewing habits. 56 watch sports ($S$), 77 watch dramas ($D$), and of those who watch dramas, 18 also watch sports. Draw a two-way table and find $\mathrm P(D')$, $\mathrm P(S'\cap D')$, $\mathrm P(S\mid D)$ and $\mathrm P(D'\mid S)$.`,
      ),
    ]),
    group("Solutions", [
      example([
        p("Practice 1. Fast-food table."),
        m(raw`\mathrm P(\text{Male})=\frac{29}{60},`),
        m(
          raw`\mathrm P(\text{Curry}\mid\text{Male})=\frac{18}{29}\quad(\text{restrict to row Male}),`,
        ),
        m(
          raw`\mathrm P(\text{Male}\mid\text{Curry})=\frac{18}{35}\quad(\text{restrict to column Curry}),`,
        ),
        m(
          raw`\mathrm P(\text{Pizza}\mid\text{Female})=\frac{14}{31}\quad(\text{restrict to row Female}).`,
        ),
      ]),
      example([
        p("Practice 2. Two fair coins; at least one head."),
        p(
          raw`Full sample space: $\{HH,HT,TH,TT\}$. Restrict to outcomes with at least one head: $\{HH,HT,TH\}$, i.e. 3 outcomes.`,
        ),
        p(
          raw`(a) Two heads is $\{HH\}$, a single outcome in the restricted sample space:`,
        ),
        m(raw`\mathrm P(HH\mid\text{at least one }H)=\frac13.`),
        p(raw`(b) One head and one tail is $\{HT,TH\}$, two outcomes:`),
        m(raw`\mathrm P(\text{one of each}\mid\text{at least one }H)=\frac23.`),
        p(
          "A modelling assumption is that the coins are fair, so every outcome is equally likely.",
        ),
      ]),
      example([
        p(raw`Practice 3. 120 students. $S=56$, $D=77$, $S\cap D=18$.`),
        p("Complete the two-way table:"),
        table(
          ["", "$D$", "$D'$", "Total"],
          [
            ["$S$", "18", "38", "56"],
            ["$S'$", "59", "5", "64"],
            ["Total", "77", "43", "120"],
          ],
        ),
        p(
          raw`($S'\cap D=77-18=59$; $S\cap D'=56-18=38$; $S'\cap D'=120-56-59=5$.)`,
        ),
        m(raw`\mathrm P(D')=\frac{43}{120},`),
        m(raw`\mathrm P(S'\cap D')=\frac5{120}=\frac1{24},`),
        m(raw`\mathrm P(S\mid D)=\frac{18}{77},`),
        m(raw`\mathrm P(D'\mid S)=\frac{38}{56}=\frac{19}{28}.`),
      ]),
    ]),
  ]),
  lesson("9.3 Conditional Probabilities in Venn Diagrams", [
    p(
      "When probabilities are given on a Venn diagram, conditional probabilities are computed by restricting attention to the region corresponding to the conditioning event, then calculating the proportion of that region that is also inside the event of interest.",
    ),
    group("Conditional probability from a Venn diagram", [
      p(raw`To evaluate $\mathrm P(B\mid A)$:`),
      p(
        "• Identify the region of the Venn diagram corresponding to $A$; this is the restricted sample space.",
      ),
      p(
        raw`• Identify the sub-region of that region that is also inside $B$; this is $A\cap B$.`,
      ),
      p("• Divide:"),
      m(raw`\mathrm P(B\mid A)=\frac{\mathrm P(A\cap B)}{\mathrm P(A)}.`),
    ]),
    p(
      "This formula will appear again in Section 2.4 as the multiplication formula for conditional probability, rearranged. It is often the fastest route to an answer when the individual regions of the Venn diagram are already labelled with probabilities.",
    ),
    group("Worked examples", [
      example([
        p(
          raw`Example 2.3.1. Events $A$ and $B$ are such that $\mathrm P(A)=0.55$, $\mathrm P(B)=0.4$ and $\mathrm P(A\cap B)=0.15$. Find $\mathrm P(A\mid B)$, $\mathrm P(B\mid A\cup B)$ and $\mathrm P(A'\mid B')$.`,
        ),
        p("Fill in the four regions of a Venn diagram:"),
        m(
          raw`A\cap B'=0.40,\quad A\cap B=0.15,\quad A'\cap B=0.25,\quad A'\cap B'=0.20.`,
        ),
        p("(These sum to 1.)"),
        p(
          raw`(i) $\mathrm P(A\mid B)$. Restrict the sample space to $B$, which has probability 0.4. The part of $A$ inside $B$ has probability 0.15.`,
        ),
        m(raw`\mathrm P(A\mid B)=\frac{0.15}{0.40}=\frac38.`),
        p(
          raw`(ii) $\mathrm P(B\mid A\cup B)$. Restrict to $A\cup B$, which has probability $0.40+0.15+0.25=0.80$. The part of $B$ inside this region is $0.15+0.25=0.40$.`,
        ),
        m(raw`\mathrm P(B\mid A\cup B)=\frac{0.40}{0.80}=\frac12.`),
        p(
          raw`(iii) $\mathrm P(A'\mid B')$. Restrict to $B'$, which has probability $0.40+0.20=0.60$. The part of $A'$ inside $B'$ is 0.20.`,
        ),
        m(raw`\mathrm P(A'\mid B')=\frac{0.20}{0.60}=\frac13.`),
      ]),
      example([
        p(
          raw`Example 2.3.2. 120 members of a youth club play snooker ($A$), pool ($B$), or neither. Given that 65 play snooker, 50 play pool and 20 play both, find $\mathrm P(A\cap B')$, $\mathrm P(A\mid B)$, $\mathrm P(B\mid A')$ and $\mathrm P(A\mid A\cup B)$.`,
        ),
        p("Count the four regions:"),
        m(raw`A\cap B'=65-20=45,\quad A\cap B=20,`),
        m(raw`A'\cap B=50-20=30,\quad A'\cap B'=120-95=25.`),
        p(raw`(i) $\mathrm P(A\cap B')$.`),
        m(raw`\mathrm P(A\cap B')=\frac{45}{120}=\frac38.`),
        p(raw`(ii) $\mathrm P(A\mid B)$. Restrict to $B$ (50 members).`),
        m(raw`\mathrm P(A\mid B)=\frac{20}{50}=\frac25.`),
        p(
          raw`(iii) $\mathrm P(B\mid A')$. Restrict to $A'$ ($120-65=55$ members).`,
        ),
        m(raw`\mathrm P(B\mid A')=\frac{30}{55}=\frac6{11}.`),
        p(
          raw`(iv) $\mathrm P(A\mid A\cup B)$. Restrict to $A\cup B$, which contains $45+20+30=95$ members. The part of $A$ inside this region is $A$ itself, i.e. 65 members.`,
        ),
        m(raw`\mathrm P(A\mid A\cup B)=\frac{65}{95}=\frac{13}{19}.`),
      ]),
    ]),
    group("Practice questions", [
      p(
        raw`1. The Venn diagram regions for events $A$ and $B$ have probabilities $\mathrm P(A\cap B')=0.3$, $\mathrm P(A\cap B)=0.12$, $\mathrm P(A'\cap B)=0.28$ and $\mathrm P(A'\cap B')=0.3$. Find $\mathrm P(A\cup B)$, $\mathrm P(A\mid B)$, $\mathrm P(B\mid A')$ and $\mathrm P(B\mid A\cup B)$.`,
      ),
      p(
        raw`2. Events $C$ and $D$ are such that $\mathrm P(C)=0.8$, $\mathrm P(D)=0.4$ and $\mathrm P(C\cap D)=0.25$. Draw a Venn diagram and find $\mathrm P(C\cup D)$, $\mathrm P(C\mid D)$, $\mathrm P(D\mid C)$ and $\mathrm P(D'\mid C')$.`,
      ),
      p(
        raw`3. A doctor completes a medical study of 100 people, 5 of whom are known to have a particular illness and 95 of whom are not. A diagnostic test is applied. All 5 of those with the illness test positive; 10 of those without the illness also test positive. Let $A$ be the event “person has the illness” and $B$ the event “person tests positive”. Find $\mathrm P(A\mid B)$ and comment briefly on the usefulness of the diagnostic test.`,
      ),
    ]),
    group("Solutions", [
      example([
        p("Practice 1. Four Venn regions given."),
        m(raw`\mathrm P(A\cup B)=0.30+0.12+0.28=0.70.`),
        m(
          raw`\mathrm P(A\mid B)=\frac{\mathrm P(A\cap B)}{\mathrm P(B)}=\frac{0.12}{0.12+0.28}=\frac{0.12}{0.40}=0.30,`,
        ),
        m(
          raw`\mathrm P(B\mid A')=\frac{\mathrm P(B\cap A')}{\mathrm P(A')}=\frac{0.28}{0.28+0.30}=\frac{0.28}{0.58}=\frac{14}{29},`,
        ),
        m(
          raw`\mathrm P(B\mid A\cup B)=\frac{\mathrm P(B\cap(A\cup B))}{\mathrm P(A\cup B)}=\frac{\mathrm P(B)}{\mathrm P(A\cup B)}=\frac{0.40}{0.70}=\frac47.`,
        ),
      ]),
      example([
        p(
          raw`Practice 2. $\mathrm P(C)=0.8$, $\mathrm P(D)=0.4$, $\mathrm P(C\cap D)=0.25$.`,
        ),
        p(
          raw`Regions: $C\cap D'=0.55$, $C\cap D=0.25$, $C'\cap D=0.15$, $C'\cap D'=0.05$.`,
        ),
        m(raw`\mathrm P(C\cup D)=0.55+0.25+0.15=0.95,`),
        m(raw`\mathrm P(C\mid D)=\frac{0.25}{0.40}=0.625,`),
        m(raw`\mathrm P(D\mid C)=\frac{0.25}{0.80}=0.3125,`),
        m(
          raw`\mathrm P(D'\mid C')=\frac{0.05}{0.05+0.15}=\frac{0.05}{0.20}=0.25.`,
        ),
      ]),
      example([
        p(
          "Practice 3. 100 people; 5 ill, 95 not; 5 of the ill and 10 of the well test positive.",
        ),
        p(
          raw`Venn counts: $A\cap B=5$, $A\cap B'=0$, $A'\cap B=10$, $A'\cap B'=85$.`,
        ),
        p("Restrict to $B$ (a total of 15 people test positive):"),
        m(raw`\mathrm P(A\mid B)=\frac5{15}=\frac13.`),
        p(
          "Comment. Only about a third of those who test positive actually have the illness. The test misses no genuine cases (its sensitivity is perfect) but it produces a large number of false positives. A positive test result is therefore not very informative on its own; a confirmatory second test would be needed before acting on the result.",
        ),
      ]),
    ]),
  ]),
];
