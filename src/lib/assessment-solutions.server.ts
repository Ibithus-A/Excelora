import { CHAPTER_ONE_ASSESSMENT_KEY } from "./assessment-config.ts";
import { parseAssessmentAnswer } from "./assessment-answer.ts";

type MarkingContext = { answer: string; compact: string };
type Checkpoint = { marks: number; answerKey?: string; matches: (context: MarkingContext) => boolean };
type QuestionSolution = { maxMarks: number; pendingReviewMarks?: number; checkpoints: Checkpoint[] };

export type QuestionScore = { marks: number; maxMarks: number; automatedMaxMarks: number; pendingReviewMarks: number };
export type AssessmentMarkingResult = {
  score: number;
  totalMarks: number;
  automatedTotalMarks: number;
  pendingReviewMarks: number;
  questionScores: Record<string, QuestionScore>;
  markingVersion: string;
};

export const ASSESSMENT_MARKING_VERSION = "chapter-1-form-a-v1";

function latexToPlain(value: string) {
  let next = value
    .toLowerCase()
    .replace(/\\left|\\right/g, "")
    .replace(/\\(?:,|;|!)/g, "")
    .replace(/\\cdot|\\times/g, "*")
    .replace(/\\pi/g, "pi")
    .replace(/\\(?:leq|le)(?![a-z])/g, "<=")
    .replace(/\\(?:geq|ge)(?![a-z])/g, ">=")
    .replace(/\\neq(?![a-z])/g, "!=")
    .replace(/\\infty(?![a-z])/g, "infinity")
    .replace(/\\cup(?![a-z])/g, "u")
    .replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)");
  for (let pass = 0; pass < 4; pass += 1) next = next.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");
  return next
    .replace(/\^\{([^{}]*)\}/g, "^($1)")
    .replace(/_\{([^{}]*)\}/g, "_($1)")
    .replace(/[{}]/g, "")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/≠/g, "!=")
    .replace(/√/g, "sqrt");
}

function answerText(value: string) {
  return parseAssessmentAnswer(value)
    .map((segment) => segment.type === "text" ? segment.value : ` ${segment.latex} `)
    .join(" ");
}

function compactAnswer(value: string) {
  return latexToPlain(answerText(value))
    .replace(/²/g, "^2")
    .replace(/\s+/g, "")
    .replace(/[£,]/g, "")
    .replace(/\(([-+]?\d+(?:\.\d+)?)\)/g, "$1");
}

function hasAny(...aliases: string[]) {
  const normalizedAliases = aliases.map((alias) => compactAnswer(alias));
  return ({ compact }: MarkingContext) => normalizedAliases.some((alias) => compact.includes(alias));
}

function hasAll(...required: string[]) {
  const normalizedRequired = required.map((value) => compactAnswer(value));
  return ({ compact }: MarkingContext) => normalizedRequired.every((value) => compact.includes(value));
}

function exactOrAssignment(variable: string, ...values: string[]) {
  const normalizedValues = values.map((value) => compactAnswer(value));
  return ({ compact }: MarkingContext) => normalizedValues.includes(compact) || normalizedValues.some((value) => compact.includes(`${variable}=${value}`));
}

const chapterOneSolutions: Record<string, QuestionSolution> = {
  q1: { maxMarks: 2, checkpoints: [{ marks: 2, matches: exactOrAssignment("x", "5") }] },
  q2: {
    maxMarks: 5,
    checkpoints: [
      { marks: 1, answerKey: "q2_a_i", matches: hasAny("3sqrt(3)", "3√3") },
      { marks: 1, answerKey: "q2_a_ii", matches: hasAny("-1-2sqrt(3)", "-1-2√3") },
      { marks: 3, answerKey: "q2_b", matches: hasAny("10-5sqrt(3)", "10-5√3", "5(2-sqrt(3))") },
    ],
  },
  q3: { maxMarks: 2, checkpoints: [{ marks: 2, matches: hasAny("(3x+2)(2x-1)", "(2x-1)(3x+2)") }] },
  q4: { maxMarks: 3, checkpoints: [{ marks: 1, matches: hasAny("x=0") }, { marks: 2, matches: hasAny("x=5/4", "x=1.25") }] },
  q5: { maxMarks: 4, checkpoints: [{ marks: 2, matches: hasAny("(0,1)", "x=0,y=1") }, { marks: 2, matches: hasAny("(4,5)", "x=4,y=5") }] },
  q6: {
    maxMarks: 5,
    checkpoints: [
      { marks: 3, answerKey: "q6_a", matches: hasAny("-1/3<=x<=2", "[-1/3,2]") },
      { marks: 2, answerKey: "q6_b", matches: hasAny("1<x<3", "(1,3)") },
    ],
  },
  q7: {
    maxMarks: 3,
    checkpoints: [
      { marks: 1, answerKey: "q7_a", matches: exactOrAssignment("c", "5") },
      { marks: 2, answerKey: "q7_b", matches: hasAny("(2,11)", "x=2,y=11") },
    ],
  },
  q8: { maxMarks: 3, checkpoints: [{ marks: 3, matches: hasAny("-2<=x<=1", "[-2,1]") }] },
  q9: {
    maxMarks: 5,
    checkpoints: [
      { marks: 3, answerKey: "q9_a", matches: hasAll("(-2,0)", "(0,0)", "(3,0)") },
      { marks: 2, answerKey: "q9_b", matches: hasAny("x<-2or0<x<3", "(-infinity,-2)u(0,3)", "(-∞,-2)∪(0,3)") },
    ],
  },
  q10: {
    maxMarks: 7,
    checkpoints: [
      { marks: 1, answerKey: "q10_a", matches: exactOrAssignment("a", "4") },
      { marks: 1, answerKey: "q10_a", matches: exactOrAssignment("b", "3") },
      { marks: 2, answerKey: "q10_b", matches: hasAny("g(x)=2x^2-2x+6") },
      { marks: 1, answerKey: "q10_b", matches: exactOrAssignment("p", "14") },
      { marks: 2, answerKey: "q10_b", matches: exactOrAssignment("q", "-9") },
    ],
  },
  q11: {
    maxMarks: 8,
    checkpoints: [
      { marks: 4, answerKey: "q11_a", matches: hasAny("-1/(x+1)+8/(x+3)", "8/(x+3)-1/(x+1)") },
      { marks: 4, answerKey: "q11_b", matches: hasAny("2x+1+3/(x+1)") },
    ],
  },
  q12: {
    maxMarks: 10,
    checkpoints: [
      { marks: 1, answerKey: "q12_a", matches: hasAny("fg(2)=7", "7") },
      { marks: 2, answerKey: "q12_b", matches: hasAny("gf(x)=4x^2-12x+10", "4x^2-12x+10") },
      { marks: 2, answerKey: "q12_c", matches: hasAny("f^-1(x)=(x+3)/2", "f^(-1)(x)=(x+3)/2") },
      { marks: 3, answerKey: "q12_d", matches: ({ compact }) => compact.includes("sqrt(x-2)+4") && (compact.includes("x>=2") || compact.includes("[2,infinity)")) },
      { marks: 2, answerKey: "q12_e", matches: hasAny("[1,infinity)", "gf(x)>=1", "y>=1") },
    ],
  },
  q13: {
    maxMarks: 4,
    checkpoints: [
      { marks: 2, answerKey: "q13_a", matches: hasAny("g(x)=x^2-4x+5") },
      { marks: 2, answerKey: "q13_b", matches: hasAny("h(x)=-x^2/2-2x", "h(x)=-(x^2)/2-2x", "h(x)=-(1/2)x^2-2x") },
    ],
  },
  q14: {
    maxMarks: 6,
    checkpoints: [
      { marks: 1, answerKey: "q14_a", matches: hasAny("c=md+k", "c=md+b", "c=mx+b") },
      { marks: 3, answerKey: "q14_b", matches: hasAny("c=2d+7") },
      { marks: 1, answerKey: "q14_c", matches: ({ answer }) => { const value = answer.toLowerCase(); return value.includes("2") && value.includes("per") && (value.includes("kilometre") || value.includes("km")); } },
      { marks: 1, answerKey: "q14_d", matches: hasAny("21") },
    ],
  },
  q15: {
    maxMarks: 8,
    checkpoints: [
      { marks: 1, answerKey: "q15_a", matches: hasAny("f(1)=0") },
      { marks: 3, answerKey: "q15_b", matches: ({ compact }) => compact.includes("x-1") && compact.includes("x+1") && compact.includes("x-4") },
      { marks: 2, answerKey: "q15_c", matches: ({ compact }) => compact.includes("x=-1") && compact.includes("x=1") && compact.includes("x=4") },
      { marks: 2, answerKey: "q15_d", matches: hasAny("-1<x<1orx>4", "(-1,1)u(4,infinity)") },
    ],
  },
};

const solutionBanks: Record<string, Record<string, QuestionSolution>> = { [CHAPTER_ONE_ASSESSMENT_KEY]: chapterOneSolutions };

export function markAssessmentAnswers(assessmentKey: string, answers: Record<string, string>, lockedQuestions: string[]): AssessmentMarkingResult {
  const bank = solutionBanks[assessmentKey];
  if (!bank) throw new Error("Assessment solution bank not found.");

  const questionScores: Record<string, QuestionScore> = {};
  let score = 0;
  let totalMarks = 0;
  let automatedTotalMarks = 0;
  let pendingReviewMarks = 0;
  const lockedQuestionSet = new Set(lockedQuestions);

  for (const [questionKey, solution] of Object.entries(bank)) {
    const contextFor = (answerKey: string): MarkingContext => {
      const storedAnswer = lockedQuestionSet.has(questionKey)
        ? answers[answerKey] ?? (answerKey !== questionKey ? answers[questionKey] : "") ?? ""
        : "";
      return { answer: answerText(storedAnswer), compact: compactAnswer(storedAnswer) };
    };
    const marks = Math.min(solution.maxMarks, solution.checkpoints.reduce(
      (sum, checkpoint) => sum + (checkpoint.matches(contextFor(checkpoint.answerKey ?? questionKey)) ? checkpoint.marks : 0),
      0,
    ));
    const questionPendingReviewMarks = solution.pendingReviewMarks ?? 0;
    const automatedMaxMarks = solution.maxMarks - questionPendingReviewMarks;
    questionScores[questionKey] = { marks, maxMarks: solution.maxMarks, automatedMaxMarks, pendingReviewMarks: questionPendingReviewMarks };
    score += marks;
    totalMarks += solution.maxMarks;
    automatedTotalMarks += automatedMaxMarks;
    pendingReviewMarks += questionPendingReviewMarks;
  }

  return { score, totalMarks, automatedTotalMarks, pendingReviewMarks, questionScores, markingVersion: ASSESSMENT_MARKING_VERSION };
}
