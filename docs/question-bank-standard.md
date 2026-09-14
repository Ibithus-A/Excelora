# Excelora Question Bank Standard

This is the required format and workflow for building assessment and additional-practice banks. The aim is broad specification coverage without exposing lesson answers or republishing third-party paper questions.

## Non-negotiable separation

- Lesson examples, lesson practice, topic practice and summative assessments are separate release surfaces.
- A summative item cannot reuse the wording, mathematical data, diagram or answer of a visible lesson item.
- Every item has a stable ID, topic, skill tags, mark total and provenance record.
- Correct answers and mark-scheme checkpoints remain server-only. Client question files must never contain solutions.
- Released forms are versioned. Do not change a question without changing the authoring and marking versions together.

## Source policy

Pearson/Edexcel papers, MadAsMaths papers and other third-party material are research sources, not a pool of text to copy. Before ingesting any source, record its owner, URL/file reference, qualification, paper date, and Excelora's licence or permitted use.

Use source papers to extract abstract metadata only:

- specification point and prerequisite skills;
- question archetype and command word;
- calculator status, marks and expected completion time;
- difficulty and common misconception;
- whether the item is procedural, proof, modelling, graphical or synoptic.

Write a new Excelora question from that blueprint with independently chosen values, context, structure and diagram. Do not paraphrase line-by-line or preserve distinctive data. If redistribution rights are later obtained, record that licence explicitly in provenance before storing source text.

## Bank record

The reusable types live in `src/lib/question-bank/types.ts`. Each released item includes:

- `id`: immutable identifier such as `c1-surds-001`;
- `number` and `marks`: its position and mark total in the current form;
- `topic` and `skills`: specification coverage used by the form builder;
- `paragraphs`: structured text and maths segments rendered consistently by the assessment UI;
- `answerParts`: one storage key per labelled part;
- `provenance`: original-authoring status and version.

The first migrated paper is `src/lib/question-bank/chapter-one.ts`. Future work should add difficulty, calculator, estimated-time, specification-reference and variant-family metadata before automated form generation is enabled.

## Authoring pipeline

1. Build a specification coverage matrix for every subtopic and skill.
2. Catalogue licensed research sources at the archetype/metadata level.
3. Identify gaps by skill, difficulty, command word and question style.
4. Author an original parameterised family for each gap.
5. Generate candidate variants, rejecting invalid, ambiguous or trivial parameter combinations.
6. Solve every variant independently and create server-only checkpoints.
7. Run algebraic, numerical, formatting and collision tests.
8. Have a maths reviewer approve wording, marks, solutions and specification fit.
9. Freeze a versioned assessment form; keep additional valid variants for topic practice.

## Required release checks

- IDs and answer keys are unique.
- Question numbering is contiguous and marks equal the configured paper total.
- Every labelled part has exactly one answer box and one matching server checkpoint.
- No distinctive assessment expression occurs in lesson source.
- Equivalent valid answer forms are accepted by the marker.
- Correct, partially correct and incorrect multipart answers return the expected marks.
- No solution data appears in the browser bundle or API response.
- Existing in-progress attempts are never silently moved to a different paper version.

Run `npm run test:question-bank` alongside the assessment verification commands before release.
