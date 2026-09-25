import type { NativeLesson } from "../../lib/lessons/schema.ts";
const paragraph = (value: string) => ({
  type: "paragraph" as const,
  content: [{ type: "text" as const, value }],
});
export const PROOF_STRUCTURE: NativeLesson = {
  id: "pure-mathematics-2-1-proof-structure-native",
  title: "The Structure of Mathematical Proof",
  sourceTitle: "2.1 The Structure of Mathematical Proof",
  previewTitle: "2.1 The Structure of Mathematical Proof — Native review",
  subjectTitle: "Pure Mathematics",
  chapterTitle: "Chapter 2: Proof",
  subtopic: "The Structure of Mathematical Proof",
  sourcePdf:
    "archives/course-pdfs/Pure Mathematics/2.1 The Structure of Mathematical Proof.pdf",
  status: "draft",
  blocks: [
    paragraph(
      "A mathematical proof is a logical argument that proceeds from given assumptions (hypotheses) through a chain of justified steps to reach a conclusion that must be true whenever the assumptions hold. Unlike a numerical check or an example, a proof establishes a result for all cases covered by the hypotheses.",
    ),
    { type: "heading", title: "The Four Methods of Proof at A-Level" },
    {
      type: "callout",
      title: "Proof by deduction",
      children: [
        paragraph(
          "Start with known facts or assumptions and use logical steps to derive the required result. This is the most common method.",
        ),
      ],
    },
    {
      type: "callout",
      title: "Proof by exhaustion",
      children: [
        paragraph(
          "Check every possible case individually. Only feasible when the number of cases is finite and small.",
        ),
      ],
    },
    {
      type: "callout",
      title: "Disproof by counter example",
      children: [
        paragraph(
          "To disprove a statement, find a single example where it fails.",
        ),
      ],
    },
    {
      type: "callout",
      title: "Proof by contradiction",
      children: [
        paragraph(
          "Assume the opposite of the statement you wish to prove. Show this leads to a logical impossibility, so the original statement must be true.",
        ),
      ],
    },
    paragraph(
      "In A-Level Mathematics, proof is an overarching theme. Every “show that” question is a proof by deduction. The explicit proof methods listed above are tested directly, but the skill of constructing rigorous arguments is assessed throughout all topics.",
    ),
  ],
};
