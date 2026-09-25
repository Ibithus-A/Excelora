// The assessment material embedded in the original 9.4 PDF, not a generated paper.
import { p, m, group, example, step } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
export const CONDITIONAL_ASSESSMENT_SOURCE: LessonBlock[] = [
  group("End of topic assessment", [
    p("15 QUESTIONS"),
    p(
      "This assessment covers the content of Sections 2.1–2.5. Show all working. Give probabilities as exact fractions or as decimals to at least 3 significant figures. Justify claims of independence or dependence by direct calculation.",
    ),
    example([
      p(
        raw`1. The Venn diagram below shows three events $A$, $B$ and $C$ with associated probabilities 0.2 (only $A$), $p$ (only $B$), 0.1 (only $C$), 0.08 ($A\cap B$ only), 0.05 ($A\cap C$ only), 0.04 ($B\cap C$ only), 0.02 ($A\cap B\cap C$) and 0.31 (outside all three).`,
      ),
      p("(a) Find the value of $p$."),
      p(
        "(b) Write down a pair of mutually exclusive events from $A$, $B$ and $C$, giving a reason for your answer.",
      ),
    ]),
    example([
      p(
        raw`2. Three events $A$, $B$ and $C$ are represented on a Venn diagram. Events $B$ and $C$ are mutually exclusive and events $A$ and $C$ are independent. The probabilities of the regions are $\mathrm P(A\cap B)=x$, $\mathrm P(A\cap C)=y$, $\mathrm P(A\cap B'\cap C')=0.3$, $\mathrm P(A'\cap B\cap C')=0.2$, $\mathrm P(A'\cap B'\cap C)=z$ and $\mathrm P(A'\cap B'\cap C')=0.17$. Given that $\mathrm P(A)=0.5$, $\mathrm P(B)=0.35$ and $\mathrm P(C)=0.2$, find the values of $x$, $y$ and $z$.`,
      ),
    ]),
    example([
      p(
        "3. In an after-school club, 45 students choose to take part in Art, Music, both or neither. Of these, 25 students take part in Art, 12 students take part in both Art and Music, and $x$ students take part in Music.",
      ),
      p("(a) Find the range of possible values of $x$."),
      p(
        "One of the 45 students is selected at random. Event $A$ is the event that the student takes Art, and event $M$ the event that the student takes Music.",
      ),
      p(
        "(b) Determine whether or not it is possible for events $A$ and $M$ to be independent.",
      ),
    ]),
    example([
      p(
        "4. 120 students are asked about their viewing habits. Of these, 56 watch sports ($S$) and 77 watch dramas ($D$). Of those who watch dramas, 18 also watch sports.",
      ),
      p("(a) Complete a two-way table to summarise this information."),
      p("A student is chosen at random. Find:"),
      p(raw`(b) $\mathrm P(D')$,`),
      p(raw`(c) $\mathrm P(S'\cap D')$,`),
      p(raw`(d) $\mathrm P(S\mid D)$,`),
      p(raw`(e) $\mathrm P(D'\mid S)$.`),
    ]),
    example([
      p(
        raw`5. The Venn diagram shows the probabilities associated with four events $A$, $B$, $C$ and $D$. The probabilities of the regions are: $A$ only $=0.24$, $A\cap B$ only $=0.07$, $B$ only $=q$ (with $p=\mathrm P(B\cap C)$), $C$ only $=0.16$, $D=r$ and outside all four $=s$. Given that $\mathrm P(B)=0.4$ and events $A$ and $B$ are independent:`,
      ),
      p(
        "(a) Write down any pair of mutually exclusive events, stating a reason.",
      ),
      p("(b) Find $p$."),
      p("(c) Find $q$."),
      p(raw`Given further that $\mathrm P(B'\mid C)=0.64$:`),
      p("(d) Find $r$ and $s$."),
    ]),
    example([
      p(
        "6. A bag contains 7 sweet and 3 sour jelly beans. Two jelly beans are taken, one at a time and without replacement, and eaten. Emilia finds the probability that both beans are sweet, given that at least one is sweet, using the following reasoning:",
      ),
      m(
        raw`\mathrm P(\text{both sweet})=\frac7{10}\times\frac7{10}=\frac{49}{100}.`,
      ),
      m(
        raw`\mathrm P(\text{at least one sweet})=1-\frac3{10}\times\frac3{10}=\frac{91}{100}.`,
      ),
      m(
        raw`\mathrm P(\text{both sweet}\mid\text{at least one sweet})=\frac{49/100}{91/100}=\frac{49}{91}.`,
      ),
      p("Identify Emilia’s mistake and find the correct probability."),
    ]),
    example([
      p(
        "7. Sasha has three bags, each containing one red marble and some green marbles. Bag A has 1 red and 9 green, Bag B has 1 red and 4 green, Bag C has 1 red and 2 green. Sasha picks a marble at random from Bag A. If it is red, she stops. Otherwise she picks from Bag B; if red she stops, otherwise she picks from Bag C.",
      ),
      p("(a) Draw a tree diagram to illustrate this situation."),
      p("(b) Find the probability that Sasha selects 3 green marbles."),
      p(
        "(c) Find the probability that Sasha selects at least one marble of each colour.",
      ),
      p(
        "(d) Given that Sasha selects a red marble, find the probability that it came from Bag B.",
      ),
    ]),
    example([
      p(
        "8. A company has 1825 employees classified as professional, skilled or elementary. The following are given:",
      ),
      p("• 65% of professional employees work from home;"),
      p("• 40% of skilled employees work from home;"),
      p("• 5% of elementary employees work from home."),
      p(
        raw`For a randomly chosen employee, let $F$ be the event “the employee is professional”, $H$ the event “the employee works from home” and let $R$ be an independently given event with $\mathrm P(R)=0.6$.`,
      ),
      p(
        raw`Assume that $\mathrm P(F)=0.24$, $\mathrm P(\text{skilled})=0.36$ and $\mathrm P(\text{elementary})=0.40$, and that $F$, $H$ and $R$ are arranged on a Venn diagram with the probabilities of the overlapping regions determined by the information above.`,
      ),
      p(raw`(a) Find $\mathrm P(H)$.`),
      p(raw`(b) Find $\mathrm P(F\mid H)$.`),
    ]),
    example([
      p(
        "9. In a group of 60 high-school students, 35 study French, 45 study Spanish and 27 study both. Find the probability that a randomly chosen student:",
      ),
      p("(a) studies only one of the two languages,"),
      p("(b) studies French, given that they study Spanish,"),
      p("(c) studies Spanish, given that they do not study French."),
      p(
        "It is further found that 75% of those who study just French wear glasses and half of those who study just Spanish wear glasses. Find the probability that a randomly chosen student:",
      ),
      p("(d) studies one language only and wears glasses,"),
      p("(e) wears glasses, given that they study one language only."),
    ]),
    example([
      p(
        raw`10. A Venn diagram of three events $A$, $B$ and $C$ has the following regional probabilities: $\mathrm P(A\text{ only})=0.13$, $\mathrm P(A\cap B\text{ only})=0.25$, $\mathrm P(B\cap C\text{ only})=0.05$, $\mathrm P(A'\cap B'\cap C')=0.30$, $\mathrm P(A\cap B\cap C)=p$, $\mathrm P(C\text{ only})=q$, and $\mathrm P(B\text{ only})=0$, $\mathrm P(A\cap C\text{ only})=0$.`,
      ),
      p(raw`(a) Find $\mathrm P(A)$.`),
      p("(b) Given that $B$ and $C$ are independent, find $p$ and $q$."),
      p(raw`(c) Find $\mathrm P(A\mid B')$.`),
    ]),
    example([
      p(
        raw`11. Two events $A$ and $B$ satisfy $\mathrm P(A)=0.4$, $\mathrm P(A\cap B)=0.12$ and $A$ and $B$ are independent.`,
      ),
      p(raw`(a) Find $\mathrm P(B)$ and $\mathrm P(A'\cap B')$.`),
      p(
        raw`A third event $C$ has $\mathrm P(C)=0.4$. Given that $A$ and $C$ are mutually exclusive and $\mathrm P(B\cap C)=0.1$:`,
      ),
      p(raw`(b) Find $\mathrm P(B\mid C)$.`),
      p(raw`(c) Find $\mathrm P(A\cap(B'\cup C))$.`),
    ]),
    example([
      p(
        "12. In a tennis match, the probability that Anne wins the first set against Colin is 0.7. If Anne wins the first set, the probability that she wins the second set is 0.8. If Anne loses the first set, the probability that she wins the second set is 0.4. A match is won when one player wins two sets.",
      ),
      p("(a) Find the probability that the match is over after two sets."),
      p(
        "(b) Given that the match is over after two sets, find the probability that Anne won.",
      ),
      p(
        "If the set score is tied at one set all, a tiebreaker is played, and the probability of Anne winning the tiebreaker is 0.55.",
      ),
      p("(c) Find the probability that Anne wins the entire match."),
    ]),
    example([
      p(
        "13. In a football match, the probability that team $A$ scores first is 0.6 and the probability that team $B$ scores first is 0.35.",
      ),
      p("(a) Suggest a reason why these two probabilities do not sum to 1."),
      p(
        "The probability that team $A$ scores first and wins the match is 0.48.",
      ),
      p(
        "(b) Find the probability that team $A$ scores first and does not win the match.",
      ),
      p(
        "If team $B$ scores first, the probability that team $A$ wins the match is 0.3.",
      ),
      p(
        "(c) Given that team $A$ wins the match, find the probability that they did not score first.",
      ),
    ]),
    example([
      p(
        "14. A box of 24 chocolates contains 10 dark and 14 milk chocolates. Linda picks one chocolate at random and eats it, then picks and eats another.",
      ),
      p("(a) Draw a tree diagram to illustrate the experiment."),
      p("Find the probability that Linda eats:"),
      p("(b) two dark chocolates,"),
      p("(c) one dark and one milk chocolate (in either order),"),
      p(
        "(d) two dark chocolates, given that she eats at least one dark chocolate.",
      ),
    ]),
    example([
      p(
        "15. In an engineering company, factories $A$, $B$ and $C$ all produce tin sheets of the same type. Factory $A$ produces 25% of all sheets, factory $B$ produces 45%, and the rest are produced by factory $C$. Factories $A$, $B$ and $C$ produce flawed sheets with probabilities 0.02, 0.07 and 0.04 respectively.",
      ),
      p("(a) Draw a tree diagram to represent this information."),
      p(
        "(b) Find the probability that a randomly selected sheet is produced by factory $B$ and is flawed.",
      ),
      p("(c) Find the probability that a randomly selected sheet is flawed."),
      p(
        "(d) Given that a randomly selected sheet is flawed, find the probability that it was produced by factory $A$.",
      ),
    ]),
  ]),
  group("Solutions to end of topic assessment", [
    example([
      p(
        "Question 1. Venn diagram with three events; find $p$ and a pair of mutually exclusive events.",
      ),
      p("(a) All regions must sum to 1:"),
      m("0.2+p+0.1+0.08+0.05+0.04+0.02+0.31=1."),
      p("So $p=1-0.80=0.20$."),
      p(
        raw`(b) Two events are mutually exclusive if and only if their intersection has zero probability. Inspecting the diagram, every pair from $\{A,B,C\}$ does have a non-empty intersection, so no two of the three labelled events are mutually exclusive as stated. However, the event “only $A$” and the event “only $B$” are mutually exclusive (no region overlap), with probabilities 0.2 and 0.2 respectively. Either pair such as (“$A$ only”, “$C$ only”) would also be a valid answer with justification that their intersection is empty.`,
      ),
    ]),
    example([
      p(
        raw`Question 2. $\mathrm P(A)=0.5$, $\mathrm P(B)=0.35$, $\mathrm P(C)=0.2$; $B$, $C$ mutually exclusive; $A$, $C$ independent.`,
      ),
      step(1, "", [
        p("Find $y$. Since $A$ and $C$ are independent,"),
        m(
          raw`y=\mathrm P(A\cap C)=\mathrm P(A)\mathrm P(C)=0.5\times0.2=0.10.`,
        ),
      ]),
      step(2, "", [
        p(
          raw`Find $x$. Because $B$ and $C$ are mutually exclusive, $\mathrm P(A\cap B\cap C)=0$, so the region “$A\cap B$ only” is the entire intersection $A\cap B$. Then`,
        ),
        m(
          raw`\mathrm P(A)=\mathrm P(A\cap B'\cap C')+\mathrm P(A\cap B)+\mathrm P(A\cap C)\implies0.5=0.3+x+0.10,`,
        ),
        p("giving $x=0.10$."),
      ]),
      step(3, "", [
        p("Find $z$."),
        m(
          raw`\mathrm P(C)=\mathrm P(A\cap C)+\mathrm P(A'\cap B'\cap C)=0.10+z=0.2,`,
        ),
        p("so $z=0.10$."),
      ]),
      p("Check. Total probability $=0.3+0.2+0.10+0.10+0.10+0.17+0.03=1.00$."),
    ]),
  ]),
];
