import { nativeLesson, p, m, h, group, example, step } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
import { CONDITIONAL_ASSESSMENT_SOURCE } from "./statistics-conditional-assessment.ts";
const raw = String.raw;
const tree = (
  description: string,
  first: [string, string],
  second: [[string, string], [string, string]],
  probabilities: [string, string],
  conditional: [[string, string], [string, string]],
  start?: string,
): LessonBlock => ({
  type: "diagram",
  description,
  drawing: {
    type: "probability-tree",
    first,
    second,
    probabilities,
    conditional,
    start,
  },
});
export const PROBABILITY_FORMULAE_LESSON = nativeLesson(
  "Statistics",
  "Chapter 9: Conditional Probability",
  "9.4 Probability Formulae",
  [
    p(
      "Two formulae unify all the work so far. The addition formula relates the probability of a union to the probabilities of the individual events and their intersection. The multiplication formula defines how the probability of an intersection breaks down into a chain of conditional probabilities.",
    ),
    group("The two key formulae", [
      p("Addition formula. For any two events $A$ and $B$,"),
      m(raw`\mathrm P(A\cup B)=\mathrm P(A)+\mathrm P(B)-\mathrm P(A\cap B).`),
      p("The subtraction removes the double-count of the intersection."),
      p(
        raw`Multiplication formula. For any two events $A$ and $B$ with $\mathrm P(A)>0$,`,
      ),
      m(
        raw`\mathrm P(B\mid A)=\frac{\mathrm P(A\cap B)}{\mathrm P(A)},\quad\text{equivalently}\quad\mathrm P(A\cap B)=\mathrm P(B\mid A)\,\mathrm P(A).`,
      ),
      p(
        raw`The addition formula holds always; it collapses to $\mathrm P(A\cup B)=\mathrm P(A)+\mathrm P(B)$ only when $A$ and $B$ are mutually exclusive. The multiplication formula likewise holds always; for independent events it simplifies to $\mathrm P(A\cap B)=\mathrm P(A)\mathrm P(B)$, because $\mathrm P(B\mid A)=\mathrm P(B)$ when $A$ has no influence on $B$.`,
      ),
    ]),
    group("Worked examples", [
      example([
        p(
          raw`Example 2.4.1. Events $A$ and $B$ satisfy $\mathrm P(A)=0.6$, $\mathrm P(B)=0.7$ and $\mathrm P(A\cup B)=0.9$. Find $\mathrm P(A\cap B)$.`,
        ),
        p(
          "Since we do not know whether $A$ and $B$ are independent, the multiplication-for-independence shortcut cannot be used. Rearrange the addition formula:",
        ),
        m(
          raw`\mathrm P(A\cap B)=\mathrm P(A)+\mathrm P(B)-\mathrm P(A\cup B)=0.6+0.7-0.9=0.4.`,
        ),
      ]),
      example([
        p(
          raw`Example 2.4.2. Events $C$ and $D$ satisfy $\mathrm P(C)=0.2$, $\mathrm P(D)=0.6$ and $\mathrm P(C\mid D)=0.3$. Find $\mathrm P(C\cap D)$, $\mathrm P(D\mid C)$ and $\mathrm P(C\cup D)$.`,
        ),
        p(
          raw`(i) $\mathrm P(C\cap D)$. Apply the multiplication formula with $A=D$, $B=C$:`,
        ),
        m(
          raw`\mathrm P(C\cap D)=\mathrm P(C\mid D)\,\mathrm P(D)=0.3\times0.6=0.18.`,
        ),
        p(
          raw`(ii) $\mathrm P(D\mid C)$. Apply the multiplication formula the other way round:`,
        ),
        m(
          raw`\mathrm P(D\mid C)=\frac{\mathrm P(C\cap D)}{\mathrm P(C)}=\frac{0.18}{0.20}=0.9.`,
        ),
        p(raw`(iii) $\mathrm P(C\cup D)$. Apply the addition formula:`),
        m(
          raw`\mathrm P(C\cup D)=\mathrm P(C)+\mathrm P(D)-\mathrm P(C\cap D)=0.2+0.6-0.18=0.62.`,
        ),
      ]),
      example([
        p(
          raw`Example 2.4.3. Events $A$ and $B$ are such that $\mathrm P(A)=0.4$, $\mathrm P(B)=0.5$ and $\mathrm P(A\mid B)=0.4$. Determine whether $A$ and $B$ are independent, and hence find $\mathrm P(A\cap B)$ and $\mathrm P(A'\cap B')$.`,
        ),
        step(1, "Test for independence", [
          p(
            raw`Since $\mathrm P(A\mid B)=0.4=\mathrm P(A)$, knowledge of $B$ does not change the probability of $A$. Therefore $A$ and $B$ are independent.`,
          ),
        ]),
        step(2, "Use independence to find the intersection", [
          m(
            raw`\mathrm P(A\cap B)=\mathrm P(A)\mathrm P(B)=0.4\times0.5=0.20.`,
          ),
        ]),
        step(3, "", [
          p(raw`Find $\mathrm P(A'\cap B')$. Use $A'\cap B'=(A\cup B)'$:`),
          m(
            raw`\mathrm P(A\cup B)=0.4+0.5-0.20=0.70,\quad\mathrm P(A'\cap B')=1-0.70=0.30.`,
          ),
        ]),
      ]),
    ]),
    group("Practice questions", [
      p(
        raw`1. Events $A$ and $B$ are such that $\mathrm P(A)=0.4$, $\mathrm P(B)=0.5$ and $\mathrm P(A\cup B)=0.6$. Find $\mathrm P(A\cap B)$, $\mathrm P(A')$, $\mathrm P(A\cup B')$ and $\mathrm P(A'\cup B)$.`,
      ),
      p(
        raw`2. Events $E$ and $F$ are such that $\mathrm P(E)=0.7$, $\mathrm P(F)=0.8$ and $\mathrm P(E\cap F)=0.6$. Find $\mathrm P(E\cup F)$, $\mathrm P(E\cup F')$, $\mathrm P(E'\cap F)$ and $\mathrm P(E\mid F')$.`,
      ),
      p(
        "3. A survey of the households in a town shows that 70% have a freezer and 20% have a dishwasher, while 80% have either a freezer or a dishwasher (or both). Find the probability that a randomly chosen household has both appliances.",
      ),
      p(
        raw`4. Events $C$ and $D$ are such that $\mathrm P(C\mid D)=\frac13$, $\mathrm P(C\mid D')=\frac15$ and $\mathrm P(D)=\frac14$. Find $\mathrm P(C\cap D)$, $\mathrm P(C\cap D')$, $\mathrm P(C)$ and $\mathrm P(D\mid C)$.`,
      ),
    ]),
    group("Solutions", [
      example([
        p(
          raw`Practice 1. $\mathrm P(A)=0.4$, $\mathrm P(B)=0.5$, $\mathrm P(A\cup B)=0.6$.`,
        ),
        p("Rearranging the addition formula:"),
        m(raw`\mathrm P(A\cap B)=0.4+0.5-0.6=0.3.`),
        m(raw`\mathrm P(A')=1-0.4=0.6,`),
        m(
          raw`\begin{aligned}\mathrm P(A\cup B')&=\mathrm P(A)+\mathrm P(B')-\mathrm P(A\cap B')\\&=0.4+0.5-(0.4-0.3)=0.4+0.5-0.1=0.8,\end{aligned}`,
        ),
        m(
          raw`\begin{aligned}\mathrm P(A'\cup B)&=\mathrm P(A')+\mathrm P(B)-\mathrm P(A'\cap B)\\&=0.6+0.5-(0.5-0.3)=0.6+0.5-0.2=0.9.\end{aligned}`,
        ),
      ]),
      example([
        p(
          raw`Practice 2. $\mathrm P(E)=0.7$, $\mathrm P(F)=0.8$, $\mathrm P(E\cap F)=0.6$.`,
        ),
        m(raw`\mathrm P(E\cup F)=0.7+0.8-0.6=0.9,`),
        m(
          raw`\mathrm P(E\cap F')=\mathrm P(E)-\mathrm P(E\cap F)=0.7-0.6=0.1,`,
        ),
        m(
          raw`\begin{aligned}\mathrm P(E\cup F')&=\mathrm P(E)+\mathrm P(F')-\mathrm P(E\cap F')\\&=0.7+0.2-0.1=0.8,\end{aligned}`,
        ),
        m(
          raw`\mathrm P(E'\cap F)=\mathrm P(F)-\mathrm P(E\cap F)=0.8-0.6=0.2,`,
        ),
        m(
          raw`\mathrm P(E\mid F')=\frac{\mathrm P(E\cap F')}{\mathrm P(F')}=\frac{0.1}{0.2}=0.5.`,
        ),
      ]),
      example([
        p(
          raw`Practice 3. $\mathrm P(F)=0.7$, $\mathrm P(D)=0.2$, $\mathrm P(F\cup D)=0.8$.`,
        ),
        p("By the addition formula,"),
        m(
          raw`\mathrm P(F\cap D)=\mathrm P(F)+\mathrm P(D)-\mathrm P(F\cup D)=0.7+0.2-0.8=0.1.`,
        ),
        p(
          "So the probability that a randomly chosen household has both a freezer and a dishwasher is 0.1, i.e. 10%.",
        ),
      ]),
      example([
        p(
          raw`Practice 4. $\mathrm P(C\mid D)=\frac13$, $\mathrm P(C\mid D')=\frac15$, $\mathrm P(D)=\frac14$.`,
        ),
        p("Using the multiplication formula,"),
        m(
          raw`\mathrm P(C\cap D)=\mathrm P(C\mid D)\,\mathrm P(D)=\frac13\times\frac14=\frac1{12},`,
        ),
        m(
          raw`\mathrm P(C\cap D')=\mathrm P(C\mid D')\,\mathrm P(D')=\frac15\times\frac34=\frac3{20}.`,
        ),
        p(
          raw`Adding these gives $\mathrm P(C)$, since the events $(C\cap D)$ and $(C\cap D')$ are mutually exclusive and their union is $C$:`,
        ),
        m(
          raw`\mathrm P(C)=\frac1{12}+\frac3{20}=\frac5{60}+\frac9{60}=\frac{14}{60}=\frac7{30}.`,
        ),
        p("Finally,"),
        m(
          raw`\mathrm P(D\mid C)=\frac{\mathrm P(D\cap C)}{\mathrm P(C)}=\frac{1/12}{7/30}=\frac1{12}\times\frac{30}{7}=\frac{30}{84}=\frac5{14}.`,
        ),
      ]),
    ]),
    h("5 Tree diagrams"),
    p(
      "Conditional probabilities appear naturally on the later branches of a tree diagram. Each first-stage branch is labelled with an unconditional probability; each second-stage branch is labelled with a conditional probability given the outcome of the first stage. The probability of any path is the product of the probabilities along it.",
    ),
    group("Conditional probabilities on a tree diagram", [
      p("For two-stage events $A$ then $B$:"),
      p(
        raw`• The first-stage branches carry the unconditional probabilities $\mathrm P(A)$ and $\mathrm P(A')$.`,
      ),
      p(
        raw`• The second-stage branches from $A$ carry $\mathrm P(B\mid A)$ and $\mathrm P(B'\mid A)$.`,
      ),
      p(
        raw`• The second-stage branches from $A'$ carry $\mathrm P(B\mid A')$ and $\mathrm P(B'\mid A')$.`,
      ),
      p("• The probability of the full path $A$ then $B$ is"),
      m(raw`\mathrm P(A\cap B)=\mathrm P(A)\times\mathrm P(B\mid A).`),
    ]),
    p(
      "Tree diagrams are particularly useful for sampling without replacement: the probabilities on the second stage depend on what was drawn first, so they are genuinely conditional. The total probability of any composite event is obtained by adding the probabilities of the paths that lead to it.",
    ),
    tree(
      "Two-stage tree: Start branches to A and A′ with probabilities P(A) and P(A′). Each branches to B and B′, labelled respectively with conditional probabilities given A or A′.",
      ["A", "A'"],
      [
        ["B", "B'"],
        ["B", "B'"],
      ],
      [raw`\mathrm P(A)`, raw`\mathrm P(A')`],
      [
        [raw`\mathrm P(B\mid A)`, raw`\mathrm P(B'\mid A)`],
        [raw`\mathrm P(B\mid A')`, raw`\mathrm P(B'\mid A')`],
      ],
      raw`\text{Start}`,
    ),
    group("Worked examples", [
      example([
        p(
          "Example 2.5.1. A bag contains 6 green beads and 4 yellow beads. A bead is drawn at random and not replaced, then a second bead is drawn. Given that both beads are the same colour, find the probability that both are yellow.",
        ),
        step(1, "Identify the conditional probabilities", [
          p(
            "Initially there are 10 beads: 6 green and 4 yellow. After one bead is removed, 9 remain; the split depends on which colour was drawn first.",
          ),
          tree(
            "Without replacement: first green G₁ has probability 6/10 and yellow Y₁ has 4/10. After green, G₂ and Y₂ have probabilities 5/9 and 4/9; after yellow, they have 6/9 and 3/9.",
            ["G_1", "Y_1"],
            [
              ["G_2", "Y_2"],
              ["G_2", "Y_2"],
            ],
            [raw`\frac6{10}`, raw`\frac4{10}`],
            [
              [raw`\frac59`, raw`\frac49`],
              [raw`\frac69`, raw`\frac39`],
            ],
          ),
        ]),
        step(2, "Compute the probability of each required event", [
          m(
            raw`\mathrm P(\text{both yellow})=\mathrm P(Y_1)\,\mathrm P(Y_2\mid Y_1)=\frac4{10}\times\frac39=\frac{12}{90},`,
          ),
          m(
            raw`\mathrm P(\text{both green})=\mathrm P(G_1)\,\mathrm P(G_2\mid G_1)=\frac6{10}\times\frac59=\frac{30}{90},`,
          ),
          m(
            raw`\mathrm P(\text{same colour})=\frac{12}{90}+\frac{30}{90}=\frac{42}{90}.`,
          ),
        ]),
        step(3, "Apply the definition of conditional probability", [
          m(
            raw`\begin{aligned}\mathrm P(\text{both yellow}\mid\text{same colour})&=\frac{\mathrm P(\text{both yellow and same colour})}{\mathrm P(\text{same colour})}\\&=\frac{12/90}{42/90}=\frac{12}{42}=\frac27.\end{aligned}`,
          ),
        ]),
      ]),
      example([
        p(
          "Example 2.5.2. A factory has machines $A$, $B$ and $C$ producing screws, in the proportions 25%, 45% and 30% respectively. Machines $A$, $B$ and $C$ produce faulty screws with probabilities 0.02, 0.07 and 0.04 respectively.",
        ),
        p(
          "A randomly chosen screw is found to be faulty. Find the probability that it was produced by machine $B$.",
        ),
        step(1, "Identify the branches", [
          p(
            "The first stage is the producing machine; the second stage is fault / not fault, with conditional probabilities given the machine.",
          ),
        ]),
        step(2, "Find the joint probabilities via the multiplication formula", [
          m(raw`\mathrm P(A\cap\mathrm F)=0.25\times0.02=0.0050,`),
          m(raw`\mathrm P(B\cap\mathrm F)=0.45\times0.07=0.0315,`),
          m(raw`\mathrm P(C\cap\mathrm F)=0.30\times0.04=0.0120.`),
        ]),
        step(3, "", [
          p(raw`Sum to find $\mathrm P(\mathrm F)$.`),
          m(raw`\mathrm P(\mathrm F)=0.0050+0.0315+0.0120=0.0485.`),
        ]),
        step(4, "Apply the definition of conditional probability", [
          m(
            raw`\mathrm P(B\mid\mathrm F)=\frac{\mathrm P(B\cap\mathrm F)}{\mathrm P(\mathrm F)}=\frac{0.0315}{0.0485}=0.6495\quad(4\text{ d.p.}).`,
          ),
          p("So about 65% of faulty screws come from machine $B$."),
        ]),
      ]),
    ]),
    group("Practice questions", [
      example([
        p(
          "1. A bag contains 5 red and 4 blue tokens. A token is drawn at random and not replaced, then a second token is drawn.",
        ),
        p("(a) Draw a tree diagram to illustrate the experiment."),
        p(
          "(b) Find the probability that the second token is red, given that the first was blue.",
        ),
        p(
          "(c) Find the probability that the first token was red, given that the second is blue.",
        ),
        p(
          "(d) Find the probability that the first was blue, given that the two tokens are different colours.",
        ),
        p(
          "(e) Find the probability that the tokens are the same colour, given that the second is red.",
        ),
      ]),
      example([
        p(
          "2. A genetic condition is present in 4% of a population. A test gives a positive result with probability 0.9 for those who have the condition and with probability 0.02 for those who do not.",
        ),
        p(
          "(a) Find the probability that a randomly chosen person tests positive.",
        ),
        p(
          "(b) Given that a randomly chosen person tests negative, find the probability that they have the condition.",
        ),
        p(
          "(c) Comment briefly on the effectiveness of the test, referring to your answers.",
        ),
      ]),
      p(
        "3. Jean always goes to work by bus or by taxi. If one day she goes by bus, the probability she goes by taxi the next day is 0.4; if one day she goes by taxi, the probability she goes by bus the next day is 0.7. Given that Jean takes the bus to work on Monday, find the probability that she takes the taxi to work on Wednesday.",
      ),
    ]),
    group("Solutions", [
      example([
        p(
          "Practice 1. Bag of 5 red and 4 blue tokens, drawn without replacement.",
        ),
        p("(a) After the first draw, 8 tokens remain."),
        tree(
          "Two token draws without replacement: first R₁ has probability 5/9 and B₁ 4/9. From R₁, R₂ and B₂ each have probability 4/8; from B₁, R₂ has 5/8 and B₂ 3/8.",
          ["R_1", "B_1"],
          [
            ["R_2", "B_2"],
            ["R_2", "B_2"],
          ],
          [raw`\frac59`, raw`\frac49`],
          [
            [raw`\frac48`, raw`\frac48`],
            [raw`\frac58`, raw`\frac38`],
          ],
        ),
        p(
          raw`(b) $\mathrm P(R_2\mid B_1)$. Read directly from the tree: $\frac58$.`,
        ),
        p(raw`(c) $\mathrm P(R_1\mid B_2)$.`),
        m(
          raw`\mathrm P(B_2)=\frac59\cdot\frac48+\frac49\cdot\frac38=\frac{20}{72}+\frac{12}{72}=\frac{32}{72}=\frac49.`,
        ),
        m(
          raw`\mathrm P(R_1\mid B_2)=\frac{\mathrm P(R_1\cap B_2)}{\mathrm P(B_2)}=\frac{20/72}{32/72}=\frac{20}{32}=\frac58.`,
        ),
        p(raw`(d) $\mathrm P(B_1\mid\text{different})$.`),
        m(
          raw`\mathrm P(\text{different})=\frac59\cdot\frac48+\frac49\cdot\frac58=\frac{20}{72}+\frac{20}{72}=\frac{40}{72}=\frac59.`,
        ),
        m(
          raw`\mathrm P(B_1\mid\text{different})=\frac{\mathrm P(B_1\cap R_2)}{\mathrm P(\text{different})}=\frac{20/72}{40/72}=\frac12.`,
        ),
        p(raw`(e) $\mathrm P(\text{same}\mid R_2)$.`),
        m(
          raw`\mathrm P(R_2)=\frac59\cdot\frac48+\frac49\cdot\frac58=\frac{40}{72}=\frac59.`,
        ),
        p("The favourable event is both tokens red, so"),
        m(
          raw`\mathrm P(\text{same}\mid R_2)=\frac{\mathrm P(R_1\cap R_2)}{\mathrm P(R_2)}=\frac{20/72}{40/72}=\frac12.`,
        ),
      ]),
      example([
        p(
          raw`Practice 2. Genetic condition, $\mathrm P(\text{condition})=0.04$; test positive probabilities 0.9 (if condition) and 0.02 (if not).`,
        ),
        p(
          "Let $C$ be the event “person has the condition” and $T^+$ the event “test positive”.",
        ),
        p("(a)"),
        m(
          raw`\begin{aligned}\mathrm P(T^+)&=\mathrm P(C)\,\mathrm P(T^+\mid C)+\mathrm P(C')\,\mathrm P(T^+\mid C')\\&=0.04\times0.9+0.96\times0.02\\&=0.036+0.0192=0.0552.\end{aligned}`,
        ),
        p(
          raw`(b) Let $T^-$ denote a negative test. Then $\mathrm P(T^-)=1-0.0552=0.9448$, and the joint probability of having the condition and testing negative is`,
        ),
        m(raw`\mathrm P(C\cap T^-)=0.04\times0.1=0.004.`),
        p("Therefore"),
        m(
          raw`\mathrm P(C\mid T^-)=\frac{0.004}{0.9448}=0.004234\ldots=0.00423\quad(3\text{ s.f.}).`,
        ),
        p(
          raw`(c) The probability that someone testing negative actually has the condition is very small ($\approx0.4$%), so a negative result is strong evidence of not having the condition; the test is effective at ruling out the condition.`,
        ),
      ]),
      example([
        p(
          raw`Practice 3. Bus / taxi transition probabilities: $\mathrm P(\text{taxi next}\mid\text{bus today})=0.4$, $\mathrm P(\text{bus next}\mid\text{taxi today})=0.7$. Monday: bus.`,
        ),
        p(
          "There are two routes from Monday to a taxi on Wednesday, via Tuesday:",
        ),
        p("Bus → Bus → Taxi:"),
        p(
          raw`$\mathrm P(\text{bus Tue}\mid\text{bus Mon})=1-0.4=0.6$, $\mathrm P(\text{taxi Wed}\mid\text{bus Tue})=0.4$.`,
        ),
        p(raw`Joint: $0.6\times0.4=0.24$.`),
        p("Bus → Taxi → Taxi:"),
        p(
          raw`$\mathrm P(\text{taxi Tue}\mid\text{bus Mon})=0.4$, $\mathrm P(\text{taxi Wed}\mid\text{taxi Tue})=1-0.7=0.3$.`,
        ),
        p(raw`Joint: $0.4\times0.3=0.12$.`),
        p("Adding:"),
        m(raw`\mathrm P(\text{taxi Wed}\mid\text{bus Mon})=0.24+0.12=0.36.`),
      ]),
    ]),
    ...CONDITIONAL_ASSESSMENT_SOURCE,
  ],
);
