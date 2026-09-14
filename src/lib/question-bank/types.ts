export type QuestionBankSegment =
  | { type: "text"; value: string }
  | { type: "math"; value: string };

export type QuestionBankAnswerPart = {
  key: string;
  label: string;
};

export type QuestionBankItem = {
  id: string;
  number: number;
  marks: number;
  topic: string;
  skills: string[];
  paragraphs: QuestionBankSegment[][];
  answerParts?: QuestionBankAnswerPart[];
  hasSketch?: boolean;
  provenance: {
    kind: "excelora-original";
    authoringVersion: string;
  };
};

export const text = (value: string): QuestionBankSegment => ({ type: "text", value });
export const math = (value: string): QuestionBankSegment => ({ type: "math", value });

