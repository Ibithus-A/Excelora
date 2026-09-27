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

export type SynopticSelectionInput = {
  questions: readonly BankQuestion[];
  courseTopicKeys: readonly string[];
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

const SYNOPTIC_DIFFICULTY_SPLIT: Record<BankDifficulty, number> = {
  Foundation: 5,
  Standard: 10,
  Stretch: 5,
};

function preferenceScore(
  question: BankQuestion,
  history: ReadonlyMap<string, QuestionExposure>,
  familySeen: ReadonlyMap<string, number>,
  selectedFamilies: ReadonlyMap<string, number>,
  selectedTopics: ReadonlyMap<string, number>,
) {
  const exposure = history.get(question.id);
  return [
    exposure ? 1 : 0,
    familySeen.get(question.family) ?? 0,
    selectedFamilies.get(question.family) ?? 0,
    selectedTopics.get(question.courseTopicKey) ?? 0,
    new Date(exposure?.lastSeenAt ?? 0).getTime(),
  ];
}

function compareScores(left: number[], right: number[]) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

export function selectSynopticAssessmentQuestions(
  input: SynopticSelectionInput,
): BankQuestion[] {
  const random = input.random ?? Math.random;
  const topicKeys = [...new Set(input.courseTopicKeys)];
  if (topicKeys.length < 2 || topicKeys.length > 20)
    throw new Error("A synoptic paper requires between 2 and 20 distinct topics");
  const allowedTopics = new Set(topicKeys);
  const eligible = input.questions.filter(
    (question) => allowedTopics.has(question.courseTopicKey) && !question.exposedInNotes,
  );
  const missingTopic = topicKeys.find(
    (topic) => !eligible.some((question) => question.courseTopicKey === topic),
  );
  if (missingTopic) throw new Error(`${missingTopic} has no eligible synoptic questions`);

  const history = new Map(input.exposure.map((item) => [item.questionId, item]));
  const familySeen = new Map<string, number>();
  for (const item of input.exposure)
    familySeen.set(item.family, (familySeen.get(item.family) ?? 0) + item.timesSeen);
  const selected: BankQuestion[] = [];
  const selectedIds = new Set<string>();
  const selectedFamilies = new Map<string, number>();
  const selectedTopics = new Map<string, number>();
  const remaining: Record<BankDifficulty, number> = { ...SYNOPTIC_DIFFICULTY_SPLIT };

  const take = (pool: BankQuestion[]) => {
    const ranked = shuffled(pool, random).sort((left, right) =>
      compareScores(
        preferenceScore(left, history, familySeen, selectedFamilies, selectedTopics),
        preferenceScore(right, history, familySeen, selectedFamilies, selectedTopics),
      ),
    );
    const question = ranked[0];
    if (!question) return false;
    selected.push(question);
    selectedIds.add(question.id);
    remaining[question.difficulty] -= 1;
    selectedFamilies.set(question.family, (selectedFamilies.get(question.family) ?? 0) + 1);
    selectedTopics.set(question.courseTopicKey, (selectedTopics.get(question.courseTopicKey) ?? 0) + 1);
    return true;
  };

  // First reserve one question for every chapter/topic. Prefer the difficulty
  // with the largest remaining quota so breadth can never be lost while filling.
  for (const topic of shuffled(topicKeys, random)) {
    const availableDifficulties = (Object.keys(remaining) as BankDifficulty[])
      .filter((difficulty) => remaining[difficulty] > 0 && eligible.some(
        (question) => question.courseTopicKey === topic && question.difficulty === difficulty,
      ))
      .sort((left, right) => remaining[right] - remaining[left]);
    const difficulty = availableDifficulties[0];
    if (!difficulty || !take(eligible.filter(
      (question) => question.courseTopicKey === topic && question.difficulty === difficulty,
    ))) throw new Error(`Unable to represent ${topic} in the synoptic paper`);
  }

  for (const difficulty of Object.keys(remaining) as BankDifficulty[]) {
    while (remaining[difficulty] > 0) {
      const pool = eligible.filter(
        (question) => question.difficulty === difficulty && !selectedIds.has(question.id),
      );
      if (!take(pool))
        throw new Error(`Not enough eligible ${difficulty} questions for a synoptic paper`);
    }
  }

  if (selected.length !== 20) throw new Error("Synoptic assessment must contain exactly 20 questions");
  if (topicKeys.some((topic) => !selected.some((question) => question.courseTopicKey === topic)))
    throw new Error("Synoptic assessment does not cover every topic");
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
