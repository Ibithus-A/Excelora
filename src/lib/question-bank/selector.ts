import {
  ASSESSMENT_DIFFICULTY_SPLIT,
  type BankDifficulty,
  type BankQuestion,
  type QuestionExposure,
} from "./bank-types.ts";

export type SelectionInput = {
  questions: readonly BankQuestion[];
  courseTopicKey: string;
  exposure: readonly QuestionExposure[];
  random?: () => number;
};

function shuffled<T>(items: readonly T[], random: () => number) {
  return items.map((item) => ({ item, order: random() }))
    .sort((a, b) => a.order - b.order).map(({ item }) => item);
}

export function selectAssessmentQuestions(input: SelectionInput): BankQuestion[] {
  const random = input.random ?? Math.random;
  const history = new Map(input.exposure.map((item) => [item.questionId, item]));
  const familySeen = new Map<string, number>();
  for (const item of input.exposure) {
    familySeen.set(item.family, (familySeen.get(item.family) ?? 0) + item.timesSeen);
  }
  const eligible = input.questions.filter((question) =>
    question.courseTopicKey === input.courseTopicKey && !question.exposedInNotes,
  );
  const selected: BankQuestion[] = [];
  const selectedFamilies = new Map<string, number>();
  const selectedSubtopics = new Map<string, number>();

  for (const [difficulty, required] of Object.entries(ASSESSMENT_DIFFICULTY_SPLIT) as Array<[BankDifficulty, number]>) {
    const pool = shuffled(eligible.filter((q) => q.difficulty === difficulty), random);
    if (pool.length < required) {
      throw new Error(`${input.courseTopicKey} has only ${pool.length}/${required} eligible ${difficulty} questions`);
    }
    for (let index = 0; index < required; index += 1) {
      pool.sort((a, b) => {
        const ah = history.get(a.id); const bh = history.get(b.id);
        const unseen = Number(Boolean(ah)) - Number(Boolean(bh));
        if (unseen) return unseen;
        const family = (familySeen.get(a.family) ?? 0) - (familySeen.get(b.family) ?? 0);
        if (family) return family;
        const duplicateFamily = (selectedFamilies.get(a.family) ?? 0) - (selectedFamilies.get(b.family) ?? 0);
        if (duplicateFamily) return duplicateFamily;
        const breadth = (selectedSubtopics.get(a.subtopic) ?? 0) - (selectedSubtopics.get(b.subtopic) ?? 0);
        if (breadth) return breadth;
        return new Date(ah?.lastSeenAt ?? 0).getTime() - new Date(bh?.lastSeenAt ?? 0).getTime();
      });
      const question = pool.shift();
      if (!question) throw new Error(`Unable to complete ${difficulty} selection`);
      selected.push(question);
      selectedFamilies.set(question.family, (selectedFamilies.get(question.family) ?? 0) + 1);
      selectedSubtopics.set(question.subtopic, (selectedSubtopics.get(question.subtopic) ?? 0) + 1);
    }
  }
  if (selected.length !== 15) throw new Error("Assessment selection must contain exactly 15 questions");
  return shuffled(selected, random);
}

export function calculateSubtopicResults(
  questions: readonly Pick<BankQuestion, "id" | "subtopic" | "marks">[],
  awardedMarks: Readonly<Record<string, number>>,
) {
  const result: Record<string, { marks: number; available: number; percentage: number }> = {};
  for (const question of questions) {
    const row = result[question.subtopic] ?? { marks: 0, available: 0, percentage: 0 };
    row.available += question.marks;
    row.marks += Math.max(0, Math.min(question.marks, awardedMarks[question.id] ?? 0));
    row.percentage = Math.round((row.marks / row.available) * 100);
    result[question.subtopic] = row;
  }
  return result;
}
