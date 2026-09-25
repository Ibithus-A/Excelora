import type { NotionLessonDefinition } from "@/components/notion-lesson-renderer";
import {
  COMPOSITE_INVERSE_FUNCTIONS_NATIVE_PREVIEW_TITLE,
  FUNCTIONS_MODELLING_NATIVE_PREVIEW_TITLE,
  GRAPH_TRANSFORMATIONS_NATIVE_PREVIEW_TITLE,
  GRAPHS_OF_FUNCTIONS_NATIVE_PREVIEW_TITLE,
  INEQUALITIES_NATIVE_PREVIEW_TITLE,
  LAWS_OF_INDICES_NATIVE_PREVIEW_TITLE,
  MODULUS_FUNCTION_NATIVE_PREVIEW_TITLE,
  PARTIAL_FRACTIONS_NATIVE_PREVIEW_TITLE,
  POLYNOMIALS_NATIVE_PREVIEW_TITLE,
  QUADRATIC_FUNCTIONS_NATIVE_PREVIEW_TITLE,
  SIMULTANEOUS_EQUATIONS_NATIVE_PREVIEW_TITLE,
  SURDS_NATIVE_PREVIEW_TITLE,
} from "../../lib/seed.ts";

const PURE_MATHEMATICS = "Pure Mathematics";
const ALGEBRA_AND_FUNCTIONS = "Algebra and Functions";

function defineLesson(
  definition: Omit<NotionLessonDefinition, "subjectTitle" | "chapterTitle">,
): NotionLessonDefinition {
  return {
    ...definition,
    subjectTitle: PURE_MATHEMATICS,
    chapterTitle: ALGEBRA_AND_FUNCTIONS,
  };
}

export const NOTION_LESSON_DEFINITIONS = {
  lawsOfIndices: defineLesson({
    id: "pure-mathematics-1-1-laws-of-indices",
    previewTitle: LAWS_OF_INDICES_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.1 Laws of Indices",
    title: "Laws of Indices",
  }),
  surds: defineLesson({
    id: "pure-mathematics-1-2-surds",
    previewTitle: SURDS_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.2 Surds and Rationalising Denominators",
    title: "Surds and Rationalising Denominators",
  }),
  quadraticFunctions: defineLesson({
    id: "pure-mathematics-1-3-quadratic-functions",
    previewTitle: QUADRATIC_FUNCTIONS_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.3 Quadratic Functions",
    title: "Quadratic Functions",
  }),
  simultaneousEquations: defineLesson({
    id: "pure-mathematics-1-4-simultaneous-equations",
    previewTitle: SIMULTANEOUS_EQUATIONS_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.4 Simultaneous Equations",
    title: "Simultaneous Equations",
  }),
  inequalities: defineLesson({
    id: "pure-mathematics-1-5-inequalities",
    previewTitle: INEQUALITIES_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.5 Inequalities",
    title: "Inequalities",
  }),
  polynomials: defineLesson({
    id: "pure-mathematics-1-6-polynomials",
    previewTitle: POLYNOMIALS_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.6 Polynomials and Algebraic Division",
    title: "Polynomials and Algebraic Division",
  }),
  graphsOfFunctions: defineLesson({
    id: "pure-mathematics-1-7-graphs-of-functions",
    previewTitle: GRAPHS_OF_FUNCTIONS_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.7 Graphs of Functions",
    title: "Graphs of Functions",
  }),
  modulusFunction: defineLesson({
    id: "pure-mathematics-1-8-modulus-function",
    previewTitle: MODULUS_FUNCTION_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.8 The Modulus Function",
    title: "The Modulus Function",
  }),
  compositeInverseFunctions: defineLesson({
    id: "pure-mathematics-1-9-composite-inverse-functions",
    previewTitle: COMPOSITE_INVERSE_FUNCTIONS_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.9 Composite and Inverse Functions",
    title: "Composite and Inverse Functions",
  }),
  graphTransformations: defineLesson({
    id: "pure-mathematics-1-10-graph-transformations",
    previewTitle: GRAPH_TRANSFORMATIONS_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.10 Transformations of Graphs",
    title: "Transformations of Graphs",
  }),
  partialFractions: defineLesson({
    id: "pure-mathematics-1-11-partial-fractions",
    previewTitle: PARTIAL_FRACTIONS_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.11 Partial Fractions",
    title: "Partial Fractions",
  }),
  functionsModelling: defineLesson({
    id: "pure-mathematics-1-12-functions-modelling",
    previewTitle: FUNCTIONS_MODELLING_NATIVE_PREVIEW_TITLE,
    sourceTitle: "1.12 Functions in Modelling",
    title: "Functions in Modelling",
  }),
} as const satisfies Record<string, NotionLessonDefinition>;

export type NotionLessonKey = keyof typeof NOTION_LESSON_DEFINITIONS;
