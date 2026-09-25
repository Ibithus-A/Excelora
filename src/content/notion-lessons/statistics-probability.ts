import { nativeLesson, p, m, group, example } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson("Statistics", "Chapter 5: Probability", title, blocks);
export const STATISTICS_PROBABILITY_LESSONS = [
  lesson("5.1 Calculating Probabilities", [
    p(
      "Probability measures the likelihood of an event occurring on a scale from 0 (impossible) to 1 (certain). In this chapter we develop the formal rules for combining probabilities and representing them visually.",
    ),
    group("Key Definitions", [
      p(
        "A trial (or experiment) is a single performance of an action whose outcome is uncertain.",
      ),
      p("An event is a set of one or more outcomes."),
      p("The sample space $S$ is the set of all possible outcomes."),
      p(
        raw`For equally likely outcomes: $P(A)=\dfrac{\text{number of outcomes favourable to }A}{\text{total number of outcomes}}$.`,
      ),
      p(raw`$P(A')=1-P(A)$, where $A'$ is the complement of $A$ (“not $A$”).`),
    ]),
    group("Worked Example 1", [
      p(
        "A bag contains 5 red, 3 blue and 2 green marbles. One marble is drawn at random.",
      ),
      p(
        raw`(a) Find $P(\text{blue})$. (b) Find $P(\text{not red})$. (c) Find $P(\text{red or green})$.`,
      ),
      p("Total marbles: $5+3+2=10$."),
      p(raw`(a) $P(\text{blue})=\frac3{10}$.`),
      p(
        raw`(b) $P(\text{not red})=1-P(\text{red})=1-\frac5{10}=\frac5{10}=\frac12$.`,
      ),
      p(raw`(c) $P(\text{red or green})=\frac{5+2}{10}=\frac7{10}$.`),
    ]),
  ]),
  lesson("5.2 Venn Diagrams", [
    p(
      "Venn diagrams represent events as circles within a rectangle (the sample space). They are particularly useful for visualising intersections, unions and complements.",
    ),
    group("Venn Diagram Notation and Rules", [
      p(raw`$A\cap B$ means “$A$ and $B$” (intersection — both events occur).`),
      p(raw`$A\cup B$ means “$A$ or $B$” (union — at least one event occurs).`),
      p(raw`$A'$ means “not $A$” (complement).`),
      p("Addition Rule:"),
      m(raw`P(A\cup B)=P(A)+P(B)-P(A\cap B)`),
      p("This avoids double-counting the outcomes in both $A$ and $B$."),
    ]),
    {
      type: "diagram",
      description:
        "The sample space S is a rectangle containing overlapping circles A and B. The left exclusive region is labelled A only, the overlap A intersection B, and the right exclusive region B only.",
      drawing: {
        type: "venn-two",
        sampleSpace: "S",
        sets: ["A", "B"],
        regions: [raw`A\text{ only}`, raw`A\cap B`, raw`B\text{ only}`],
      },
    },
    group("Worked Example 2", [
      p(
        "In a class of 30 students, 18 study French, 12 study Spanish, and 5 study both.",
      ),
      p(
        raw`(a) Draw a Venn diagram. (b) Find $P(F\cup S)$. (c) Find $P(F'\cap S')$.`,
      ),
      p("(a) Let $F=$ French, $S=$ Spanish."),
      p(
        raw`$F\text{ only}=18-5=13$. $S\text{ only}=12-5=7$. Neither $=30-13-5-7=5$.`,
      ),
      p(raw`(b) $P(F\cup S)=\frac{13+5+7}{30}=\frac{25}{30}=\frac56$.`),
      p(
        raw`Or: $P(F\cup S)=P(F)+P(S)-P(F\cap S)=\frac{18}{30}+\frac{12}{30}-\frac5{30}=\frac{25}{30}=\frac56$.`,
      ),
      p(
        raw`(c) $P(F'\cap S')$ is the probability of studying neither language: $\frac5{30}=\frac16$.`,
      ),
      p(raw`Note: $P(F'\cap S')=1-P(F\cup S)=1-\frac56=\frac16$.`),
    ]),
    group("Practice Questions", [
      p(
        raw`1. In a group of 50 people, 30 like tea, 25 like coffee, and 10 like both. Draw a Venn diagram and find: (a) $P(\text{tea only})$, (b) $P(\text{tea or coffee})$, (c) $P(\text{neither})$.`,
      ),
      p(raw`2. $P(A)=0.4$, $P(B)=0.5$, $P(A\cup B)=0.7$. Find $P(A\cap B)$.`),
    ]),
    group("Practice Solutions", [
      example([
        p("1. 50 people: 30 tea, 25 coffee, 10 both."),
        p("Tea only $=20$. Coffee only $=15$. Neither $=50-20-10-15=5$."),
        p(raw`(a) $P(\text{tea only})=\frac{20}{50}=\frac25$.`),
        p(raw`(b) $P(\text{tea or coffee})=\frac{45}{50}=\frac9{10}$.`),
        p(raw`(c) $P(\text{neither})=\frac5{50}=\frac1{10}$.`),
      ]),
      example([
        p(raw`2. $P(A)=0.4$, $P(B)=0.5$, $P(A\cup B)=0.7$.`),
        m(raw`P(A\cap B)=P(A)+P(B)-P(A\cup B)=0.4+0.5-0.7=0.2.`),
      ]),
    ]),
  ]),
  lesson("5.3 Mutually Exclusive and Independent Events", [
    p(
      "Two important relationships between events determine which probability rules can be applied.",
    ),
    group("Mutually Exclusive Events", [
      p(
        raw`Events $A$ and $B$ are mutually exclusive if they cannot both occur: $P(A\cap B)=0$.`,
      ),
      p(raw`If mutually exclusive: $P(A\cup B)=P(A)+P(B)$.`),
    ]),
    group("Independent Events", [
      p(
        "Events $A$ and $B$ are independent if the occurrence of one does not affect the probability of the other:",
      ),
      m(raw`P(A\cap B)=P(A)\times P(B)`),
      p(
        raw`Test for independence: Check whether $P(A\cap B)=P(A)\times P(B)$. If equal, the events are independent; otherwise they are not.`,
      ),
    ]),
    p(
      "Note that mutually exclusive events (with non-zero probabilities) are never independent: if $A$ occurs, then $B$ cannot, so knowing $A$ has occurred changes the probability of $B$ to zero.",
    ),
    group("Worked Example 3", [
      p(
        raw`$P(A)=0.3$, $P(B)=0.4$, $P(A\cap B)=0.12$. Are $A$ and $B$ independent?`,
      ),
      p(raw`Check: $P(A)\times P(B)=0.3\times0.4=0.12$.`),
      p(
        raw`Since $P(A\cap B)=0.12=P(A)\times P(B)$, the events are independent.`,
      ),
    ]),
    group("Worked Example 4", [
      p(
        raw`$P(C)=0.5$, $P(D)=0.6$, $P(C\cap D)=0.25$. Are $C$ and $D$ independent? Find $P(C\cup D)$.`,
      ),
      p(raw`Check: $P(C)\times P(D)=0.5\times0.6=0.30\neq0.25$.`),
      p(
        raw`Since $P(C\cap D)\neq P(C)\times P(D)$, the events are not independent.`,
      ),
      m(raw`P(C\cup D)=0.5+0.6-0.25=0.85.`),
    ]),
    group("Practice Questions", [
      p(
        raw`1. $P(X)=0.6$, $P(Y)=0.3$. $X$ and $Y$ are independent. Find $P(X\cap Y)$ and $P(X\cup Y)$.`,
      ),
      p(
        raw`2. Events $A$ and $B$ are mutually exclusive. $P(A)=0.35$, $P(B)=0.45$. Find $P(A\cup B)$ and explain why $A$ and $B$ cannot be independent.`,
      ),
      p(
        raw`3. $P(A)=0.7$, $P(B)=0.5$, $P(A\cup B)=0.9$. Determine whether $A$ and $B$ are independent.`,
      ),
    ]),
    group("Practice Solutions", [
      example([
        p("1. $P(X)=0.6$, $P(Y)=0.3$, independent."),
        m(raw`P(X\cap Y)=0.6\times0.3=0.18.`),
        m(raw`P(X\cup Y)=0.6+0.3-0.18=0.72.`),
      ]),
      example([
        p("2. Mutually exclusive: $P(A)=0.35$, $P(B)=0.45$."),
        p(raw`$P(A\cup B)=0.35+0.45=0.80$ (since $P(A\cap B)=0$).`),
        p(
          raw`If independent: $P(A\cap B)=0.35\times0.45=0.1575\neq0$. But mutually exclusive requires $P(A\cap B)=0$. Since both $P(A)$ and $P(B)$ are non-zero, they cannot be both mutually exclusive and independent simultaneously.`,
        ),
      ]),
      example([
        p(raw`3. $P(A)=0.7$, $P(B)=0.5$, $P(A\cup B)=0.9$.`),
        m(raw`P(A\cap B)=0.7+0.5-0.9=0.3.`),
        p(raw`If independent: $P(A)\times P(B)=0.35\neq0.3$. Not independent.`),
      ]),
    ]),
  ]),
  lesson("5.4 Tree Diagrams", [
    p(
      "Tree diagrams are useful for calculating probabilities involving sequences of events, particularly when outcomes depend on previous results (without replacement) or when multiple stages are involved.",
    ),
    group("Tree Diagram Rules", [
      p(raw`Multiply along branches to find $P(\text{combined outcome})$.`),
      p(raw`Add probabilities of different paths to find $P(\text{event})$.`),
      p("Probabilities on branches from the same node must sum to 1."),
      p(
        "For events without replacement, the probabilities on the second set of branches change depending on the first outcome.",
      ),
    ]),
    group("Worked Example 5", [
      p(
        "A bag contains 4 red and 6 blue balls. Two balls are drawn without replacement. Find the probability that (a) both are red, (b) the balls are different colours.",
      ),
      p(
        raw`(a) $P(\text{RR})=\frac4{10}\times\frac39=\frac{12}{90}=\frac2{15}$.`,
      ),
      p(raw`(b) $P(\text{different})=P(\text{RB})+P(\text{BR})$:`),
      m(
        raw`P(\text{RB})=\frac4{10}\times\frac69=\frac{24}{90},\quad P(\text{BR})=\frac6{10}\times\frac49=\frac{24}{90}`,
      ),
      m(
        raw`P(\text{different})=\frac{24}{90}+\frac{24}{90}=\frac{48}{90}=\frac8{15}.`,
      ),
    ]),
    group("Practice Questions", [
      p(
        raw`1. A coin is biased: $P(H)=0.6$. The coin is flipped 3 times. Find $P(\text{exactly 2 heads})$.`,
      ),
      p(
        "2. A box contains 3 white and 5 black counters. Two counters are drawn without replacement. Find the probability that at least one is white.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p("1. $P(H)=0.6$, $P(T)=0.4$. Three flips."),
        p("Exactly 2 heads can occur as HHT, HTH, THH."),
        m(raw`P=3\times(0.6)^2(0.4)=3\times0.144=0.432.`),
      ]),
      example([
        p(
          raw`2. 3 white, 5 black. Two without replacement. $P(\text{at least one white})$.`,
        ),
        m(
          raw`P(\text{at least one W})=1-P(\text{both black})=1-\frac58\times\frac47=1-\frac{20}{56}=1-\frac5{14}=\frac9{14}.`,
        ),
      ]),
    ]),
    group("End of Topic Assessment", [
      p("15 QUESTIONS"),
      p(
        "1. In a class of 32 students, 20 play football, 15 play basketball, and 8 play both.",
      ),
      p("(a) Draw a Venn diagram."),
      p(
        "(b) Find the probability that a randomly selected student plays football or basketball.",
      ),
      p("(c) Find the probability that a student plays exactly one sport."),
      p("2. $P(A)=0.4$, $P(B)=0.5$. $A$ and $B$ are independent."),
      p(raw`(a) Find $P(A\cap B)$.`),
      p(raw`(b) Find $P(A\cup B)$.`),
      p(raw`(c) Find $P(A'\cap B')$.`),
      p(
        "3. A bag contains 6 red, 4 blue and 2 green marbles. Two marbles are drawn without replacement.",
      ),
      p("(a) Find the probability that both are red."),
      p("(b) Find the probability that they are the same colour."),
      p("(c) Find the probability that at least one is green."),
      p(
        raw`4. Events $C$ and $D$ satisfy $P(C)=0.6$, $P(D)=0.3$, $P(C\cap D)=0.15$.`,
      ),
      p(raw`(a) Find $P(C\cup D)$.`),
      p("(b) Determine whether $C$ and $D$ are independent."),
      p("(c) Determine whether $C$ and $D$ are mutually exclusive."),
      p(
        "5. A box contains 10 chocolates: 4 are dark, 3 are milk, and 3 are white. Three chocolates are chosen at random without replacement. Find the probability that all three are different types.",
      ),
      p(
        "6. In a factory, machine $A$ produces 60% of items and machine $B$ produces 40%. The defect rate for $A$ is 3% and for $B$ is 5%.",
      ),
      p("(a) Find the probability that a randomly selected item is defective."),
    ]),
  ]),
];
