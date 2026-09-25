import type {
  BankDifficulty,
  BankQuestion,
  QuestionExposure,
} from "./bank-types.ts";
export const PRACTICE_COUNTS = [1, 2, 3, 4, 5, 10, 15, 20] as const;
export type PracticeDifficulty = BankDifficulty | "balanced";
export function selectPracticeQuestions(input: {
  questions: readonly BankQuestion[];
  courseTopicKey: string;
  subtopic: string;
  count: number;
  difficulty: PracticeDifficulty;
  exposure: readonly QuestionExposure[];
  random?: () => number;
}) {
  if (!(PRACTICE_COUNTS as readonly number[]).includes(input.count))
    throw new Error("Invalid practice batch size.");
  if (
    !["balanced", "Foundation", "Standard", "Stretch"].includes(
      input.difficulty,
    )
  )
    throw new Error("Invalid difficulty.");
  const seen = new Map(input.exposure.map((e) => [e.questionId, e.timesSeen]));
  const random = input.random ?? Math.random;
  const pool = input.questions
    .filter(
      (q) =>
        q.courseTopicKey === input.courseTopicKey &&
        (!input.subtopic || q.subtopic === input.subtopic) &&
        !q.exposedInNotes &&
        (input.difficulty === "balanced" || q.difficulty === input.difficulty),
    )
    .map((q) => ({ q, tie: random() }));
  if (pool.length < input.count)
    throw new Error(
      `Only ${pool.length} questions are available for this selection. Choose fewer questions or balanced difficulty.`,
    );
  const picked: BankQuestion[] = [];
  const counts = new Map<string, number>();
  const topics = new Map<string, number>();
  while (picked.length < input.count) {
    pool.sort(
      (a, b) =>
        (seen.get(a.q.id) ?? 0) - (seen.get(b.q.id) ?? 0) ||
        (topics.get(a.q.subtopic) ?? 0) - (topics.get(b.q.subtopic) ?? 0) ||
        (counts.get(a.q.difficulty) ?? 0) - (counts.get(b.q.difficulty) ?? 0) ||
        a.tie - b.tie,
    );
    const q = pool.shift()!.q;
    picked.push(q);
    topics.set(q.subtopic, (topics.get(q.subtopic) ?? 0) + 1);
    counts.set(q.difficulty, (counts.get(q.difficulty) ?? 0) + 1);
  }
  return picked;
}
