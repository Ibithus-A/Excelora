export const ASSESSMENT_DIFFICULTY_SPLIT = {
  Foundation: 4,
  Standard: 7,
  Stretch: 4,
} as const;

export type BankDifficulty = keyof typeof ASSESSMENT_DIFFICULTY_SPLIT;

export type BankQuestion = {
  id: string;
  qualification: string;
  domain: string;
  courseStage?: string | null;
  courseTopicKey: string;
  chapter: string;
  subtopic: string;
  specRefs: string[];
  family: string;
  variant: number;
  difficulty: BankDifficulty;
  marks: number;
  responseType: string;
  prompt: string;
  tags: string[];
  fingerprint: string;
  exposedInNotes: boolean;
};

export type BankQuestionSecret = {
  questionId: string;
  answer: string;
  workedSolution: string;
};

export type QuestionExposure = {
  questionId: string;
  family: string;
  timesSeen: number;
  lastSeenAt: string | null;
};
