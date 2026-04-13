import type { FlowNode, FlowState } from "@/types/flowstate";

export const A_LEVEL_MATHS_TITLE = "A Level Maths";
export const END_OF_TOPIC_ASSESSMENT_TITLE = "Assessment";
const LEGACY_END_OF_TOPIC_ASSESSMENT_TITLE = "End Of Topic Assessment";
const DEFAULT_PAGE_CONTENT = "";

type ChapterDef = {
  title: string;
  subtopics: string[];
};

type SubjectDef = {
  title: string;
  chapters: ChapterDef[];
};

export const PURE_MATHEMATICS_TITLE = "Pure Mathematics";
export const MECHANICS_TITLE = "Mechanics";
export const STATISTICS_TITLE = "Statistics";

export const A_LEVEL_MATHS_SUBJECTS: SubjectDef[] = [
  {
    title: PURE_MATHEMATICS_TITLE,
    chapters: [
      {
        title: "Chapter 1: Algebra and Functions",
        subtopics: [
          "1.1 Laws of Indices",
          "1.2 Surds and Rationalising Denominators",
          "1.3 Quadratic Functions",
          "1.4 Simultaneous Equations",
          "1.5 Inequalities",
          "1.6 Polynomials and Algebraic Division",
          "1.7 Graphs of Functions",
          "1.8 The Modulus Function",
          "1.9 Composite and Inverse Functions",
          "1.10 Transformations of Graphs",
          "1.11 Partial Fractions",
          "1.12 Functions in Modelling",
        ],
      },
      {
        title: "Chapter 2: Proof",
        subtopics: [
          "2.1 The Structure of Mathematical Proof",
          "2.2 Proof by Deduction",
          "2.3 Proof by Exhaustion",
          "2.4 Disproof by Counter Example",
          "2.5 Proof by Contradiction",
        ],
      },
      {
        title: "Chapter 3: Coordinate Geometry",
        subtopics: [
          "3.1 Straight Lines",
          "3.2 Circles",
          "3.3 Parametric Equations",
          "3.4 Parametric Equations in Modelling",
        ],
      },
      {
        title: "Chapter 4: Sequences and Series",
        subtopics: [
          "4.1 Arithmetic Sequences and Series",
          "4.2 Geometric Sequences and Series",
          "4.3 Sigma Notation and Recurrence Relations",
          "4.4 Binomial Expansion - Positive Integer n",
          "4.5 Binomial Expansion - Rational n",
          "4.6 Sequences and Series in Modelling",
        ],
      },
      {
        title: "Chapter 5: Trigonometry",
        subtopics: [
          "5.1 Radians, Arc Length and Sector Area",
          "5.2 Sine Rule, Cosine Rule and Area of a Triangle",
          "5.3 Exact Trigonometric Values",
          "5.4 Trigonometric Graphs and Symmetry",
          "5.5 Small Angle Approximations",
          "5.6 Reciprocal and Inverse Trigonometric Functions",
          "5.7 Trigonometric Identities",
          "5.8 The R cos Form",
          "5.9 Solving Trigonometric Equations",
          "5.10 Trigonometry in Modelling",
        ],
      },
      {
        title: "Chapter 6: Exponentials and Logarithms",
        subtopics: [
          "6.1 Exponential Functions",
          "6.2 Logarithms and Their Laws",
          "6.3 Logarithmic Graphs for Estimating Parameters",
          "6.4 Exponential Growth and Decay",
        ],
      },
      {
        title: "Chapter 7: Differentiation",
        subtopics: [
          "7.1 Differentiation from First Principles",
          "7.2 Standard Derivatives and Basic Rules",
          "7.3 Chain Rule, Product Rule and Quotient Rule",
          "7.4 Applications of Differentiation",
          "7.5 Implicit and Parametric Differentiation",
          "7.6 Constructing Differential Equations",
        ],
      },
      {
        title: "Chapter 8: Integration",
        subtopics: [
          "8.1 Standard Integrals",
          "8.2 Definite Integrals and Areas",
          "8.3 Integration by Substitution",
          "8.4 Integration by Parts",
          "8.5 Integration Using Partial Fractions",
          "8.6 Differential Equations",
        ],
      },
      {
        title: "Chapter 9: Numerical Methods",
        subtopics: [
          "9.1 Locating Roots by Sign Change",
          "9.2 Fixed Point Iteration",
          "9.3 The Newton-Raphson Method",
          "9.4 The Trapezium Rule",
        ],
      },
      {
        title: "Chapter 10: Vectors",
        subtopics: [
          "10.1 Vectors in Two and Three Dimensions",
          "10.2 Position Vectors and Distance",
          "10.3 Vector Problems in Pure Mathematics",
        ],
      },
    ],
  },
  {
    title: MECHANICS_TITLE,
    chapters: [],
  },
  {
    title: STATISTICS_TITLE,
    chapters: [],
  },
];

export const A_LEVEL_MATHS_SUBJECT_TITLES = A_LEVEL_MATHS_SUBJECTS.map(
  (subject) => subject.title,
);

export const A_LEVEL_MATHS_CHAPTERS: ChapterDef[] = A_LEVEL_MATHS_SUBJECTS.flatMap(
  (subject) => subject.chapters,
);

export const A_LEVEL_MATHS_CHAPTER_TITLES = A_LEVEL_MATHS_CHAPTERS.map(
  (chapter) => chapter.title,
);

export function getSubjectTitleForChapter(chapterTitle: string): string | null {
  const normalized = chapterTitle.trim().toLowerCase();
  for (const subject of A_LEVEL_MATHS_SUBJECTS) {
    if (subject.chapters.some((c) => c.title.trim().toLowerCase() === normalized)) {
      return subject.title;
    }
  }
  return null;
}

function makeNode(
  id: string,
  kind: "page" | "folder",
  title: string,
  parentId: string | null,
  content: string,
): FlowNode {
  const now = Date.now();
  return {
    id,
    kind,
    title,
    parentId,
    childrenIds: [],
    content,
    isLocked: false,
    isUnlockedOverride: false,
    isExpanded: true,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}

function makeNodeId(title: string, nodes: Record<string, FlowNode>, seed: { value: number }) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  while (true) {
    seed.value += 1;
    const id = `${slug || "node"}-${seed.value}`;
    if (!nodes[id]) return id;
  }
}

function cloneState(state: FlowState): FlowState {
  return {
    ...state,
    nodes: Object.fromEntries(
      Object.entries(state.nodes).map(([id, node]) => [
        id,
        {
          ...node,
          childrenIds: [...node.childrenIds],
        },
      ]),
    ),
    rootIds: [...state.rootIds],
  };
}

function collectSubtreeIds(nodes: Record<string, FlowNode>, id: string, ids: Set<string>) {
  const node = nodes[id];
  if (!node || ids.has(id)) return;

  ids.add(id);
  for (const childId of node.childrenIds) {
    collectSubtreeIds(nodes, childId, ids);
  }
}

function attachChildren(
  nodes: Record<string, FlowNode>,
  parentId: string,
  childIds: string[],
) {
  const parent = nodes[parentId];
  if (!parent) return;

  for (const childId of childIds) {
    const child = nodes[childId];
    if (!child) continue;
    child.parentId = parentId;
    if (!parent.childrenIds.includes(childId)) {
      parent.childrenIds.push(childId);
    }
  }
}

function orderChildrenByTitle(
  nodes: Record<string, FlowNode>,
  childrenIds: string[],
  orderedTitles: string[],
) {
  const priority = new Map(
    orderedTitles.map((title, index) => [normalizeTitle(title), index]),
  );
  const originalIndex = new Map(childrenIds.map((id, index) => [id, index]));

  return [...childrenIds].sort((leftId, rightId) => {
    const left = nodes[leftId];
    const right = nodes[rightId];

    const leftPriority = left ? priority.get(normalizeTitle(left.title)) : undefined;
    const rightPriority = right ? priority.get(normalizeTitle(right.title)) : undefined;

    if (leftPriority !== undefined && rightPriority !== undefined) {
      return leftPriority - rightPriority;
    }
    if (leftPriority !== undefined) return -1;
    if (rightPriority !== undefined) return 1;

    return (originalIndex.get(leftId) ?? 0) - (originalIndex.get(rightId) ?? 0);
  });
}

export function insertALevelMathsTree(state: FlowState): FlowState {
  const next = cloneState(state);
  const seed = { value: Object.keys(next.nodes).length };

  const createFolder = (title: string, parentId: string | null) => {
    const id = makeNodeId(title, next.nodes, seed);
    next.nodes[id] = makeNode(id, "folder", title, parentId, "");

    if (parentId) {
      next.nodes[parentId].childrenIds.push(id);
    } else {
      next.rootIds.push(id);
    }

    return id;
  };

  const createPage = (title: string, parentId: string) => {
    const id = makeNodeId(title, next.nodes, seed);
    next.nodes[id] = makeNode(
      id,
      "page",
      title,
      parentId,
      DEFAULT_PAGE_CONTENT,
    );
    next.nodes[parentId].childrenIds.push(id);
    return id;
  };

  const matchingCourseRootIds = next.rootIds.filter((rootId) => {
    const title = next.nodes[rootId]?.title;
    return title ? normalizeTitle(title) === normalizeTitle(A_LEVEL_MATHS_TITLE) : false;
  });

  const courseRootId = matchingCourseRootIds[0] ?? createFolder(A_LEVEL_MATHS_TITLE, null);
  if (next.nodes[courseRootId].title !== A_LEVEL_MATHS_TITLE) {
    next.nodes[courseRootId].title = A_LEVEL_MATHS_TITLE;
  }
  next.nodes[courseRootId].isExpanded = true;

  for (const duplicateRootId of matchingCourseRootIds.slice(1)) {
    const duplicateRoot = next.nodes[duplicateRootId];
    if (!duplicateRoot) continue;
    attachChildren(next.nodes, courseRootId, duplicateRoot.childrenIds);
    next.rootIds = next.rootIds.filter((id) => id !== duplicateRootId);
    delete next.nodes[duplicateRootId];
  }

  // Purge any children of the course root that aren't one of the new subject
  // folders. The prior tree layout placed chapters directly under the course
  // root; those need to be removed so the new subject > chapter hierarchy can
  // take their place cleanly.
  const courseRootNode = next.nodes[courseRootId];
  if (courseRootNode) {
    const subjectTitleSet = new Set(
      A_LEVEL_MATHS_SUBJECT_TITLES.map(normalizeTitle),
    );
    const idsToRemove = new Set<string>();
    for (const childId of courseRootNode.childrenIds) {
      const child = next.nodes[childId];
      if (!child) continue;
      if (child.kind === "folder" && subjectTitleSet.has(normalizeTitle(child.title))) {
        continue;
      }
      collectSubtreeIds(next.nodes, child.id, idsToRemove);
    }
    if (idsToRemove.size > 0) {
      courseRootNode.childrenIds = courseRootNode.childrenIds.filter(
        (childId) => !idsToRemove.has(childId),
      );
      for (const id of idsToRemove) {
        delete next.nodes[id];
      }
    }
  }

  for (const subject of A_LEVEL_MATHS_SUBJECTS) {
    const matchingSubjectIds =
      next.nodes[courseRootId]?.childrenIds.filter((childId) => {
        const child = next.nodes[childId];
        return (
          child?.kind === "folder" &&
          normalizeTitle(child.title) === normalizeTitle(subject.title)
        );
      }) ?? [];

    const subjectId = matchingSubjectIds[0] ?? createFolder(subject.title, courseRootId);
    if (next.nodes[subjectId].title !== subject.title) {
      next.nodes[subjectId].title = subject.title;
    }

    for (const duplicateSubjectId of matchingSubjectIds.slice(1)) {
      const duplicate = next.nodes[duplicateSubjectId];
      if (!duplicate) continue;
      attachChildren(next.nodes, subjectId, duplicate.childrenIds);
      next.nodes[courseRootId].childrenIds = next.nodes[courseRootId].childrenIds.filter(
        (childId) => childId !== duplicateSubjectId,
      );
      delete next.nodes[duplicateSubjectId];
    }

    // Purge any chapter folders inside this subject whose title is not in the
    // current chapter list. Keeps stale chapters from prior seed revisions out.
    const subjectChapterTitles = new Set(
      subject.chapters.map((c) => normalizeTitle(c.title)),
    );
    const staleChapterIds = new Set<string>();
    for (const childId of next.nodes[subjectId].childrenIds) {
      const child = next.nodes[childId];
      if (!child) continue;
      if (child.kind === "folder" && subjectChapterTitles.has(normalizeTitle(child.title))) {
        continue;
      }
      collectSubtreeIds(next.nodes, child.id, staleChapterIds);
    }
    if (staleChapterIds.size > 0) {
      next.nodes[subjectId].childrenIds = next.nodes[subjectId].childrenIds.filter(
        (childId) => !staleChapterIds.has(childId),
      );
      for (const id of staleChapterIds) {
        delete next.nodes[id];
      }
    }

    for (const chapter of subject.chapters) {
      const matchingChapterIds =
        next.nodes[subjectId]?.childrenIds.filter((childId) => {
          const child = next.nodes[childId];
          return (
            child?.kind === "folder" &&
            normalizeTitle(child.title) === normalizeTitle(chapter.title)
          );
        }) ?? [];

      const chapterId = matchingChapterIds[0] ?? createFolder(chapter.title, subjectId);
      if (next.nodes[chapterId].title !== chapter.title) {
        next.nodes[chapterId].title = chapter.title;
      }

      for (const duplicateChapterId of matchingChapterIds.slice(1)) {
        const duplicate = next.nodes[duplicateChapterId];
        if (!duplicate) continue;
        attachChildren(next.nodes, chapterId, duplicate.childrenIds);
        next.nodes[subjectId].childrenIds = next.nodes[subjectId].childrenIds.filter(
          (childId) => childId !== duplicateChapterId,
        );
        delete next.nodes[duplicateChapterId];
      }

      const legacyAssessmentId = next.nodes[chapterId]?.childrenIds.find((childId) => {
        const child = next.nodes[childId];
        return (
          child?.kind === "page" &&
          normalizeTitle(child.title) === normalizeTitle(LEGACY_END_OF_TOPIC_ASSESSMENT_TITLE)
        );
      });
      if (legacyAssessmentId) {
        const hasCurrentAssessment = next.nodes[chapterId]?.childrenIds.some((childId) => {
          const child = next.nodes[childId];
          return (
            child?.kind === "page" &&
            normalizeTitle(child.title) === normalizeTitle(END_OF_TOPIC_ASSESSMENT_TITLE)
          );
        });

        if (hasCurrentAssessment) {
          next.nodes[chapterId].childrenIds = next.nodes[chapterId].childrenIds.filter(
            (childId) => childId !== legacyAssessmentId,
          );
          delete next.nodes[legacyAssessmentId];
        } else {
          next.nodes[legacyAssessmentId].title = END_OF_TOPIC_ASSESSMENT_TITLE;
        }
      }

      const allowedPageTitles = new Set(
        [...chapter.subtopics, END_OF_TOPIC_ASSESSMENT_TITLE, LEGACY_END_OF_TOPIC_ASSESSMENT_TITLE].map(
          (title) => normalizeTitle(title),
        ),
      );
      next.nodes[chapterId].childrenIds = next.nodes[chapterId].childrenIds.filter((childId) => {
        const child = next.nodes[childId];
        if (!child || child.kind !== "page") return true;
        if (allowedPageTitles.has(normalizeTitle(child.title))) return true;
        if (child.content !== DEFAULT_PAGE_CONTENT) return true;
        delete next.nodes[childId];
        return false;
      });

      for (const subtopic of chapter.subtopics) {
        const existingSubtopicId = next.nodes[chapterId]?.childrenIds.find((childId) => {
          const child = next.nodes[childId];
          return child?.kind === "page" && normalizeTitle(child.title) === normalizeTitle(subtopic);
        });
        if (!existingSubtopicId) {
          createPage(subtopic, chapterId);
          continue;
        }

        if (next.nodes[existingSubtopicId].title !== subtopic) {
          next.nodes[existingSubtopicId].title = subtopic;
        }
      }

      const hasAssessment = next.nodes[chapterId]?.childrenIds.some((childId) => {
        const child = next.nodes[childId];
        return (
          child?.kind === "page" &&
          normalizeTitle(child.title) === normalizeTitle(END_OF_TOPIC_ASSESSMENT_TITLE)
        );
      });
      if (!hasAssessment) {
        createPage(END_OF_TOPIC_ASSESSMENT_TITLE, chapterId);
      }

      next.nodes[chapterId].childrenIds = orderChildrenByTitle(
        next.nodes,
        next.nodes[chapterId].childrenIds,
        [...chapter.subtopics, END_OF_TOPIC_ASSESSMENT_TITLE],
      );
    }

    next.nodes[subjectId].childrenIds = orderChildrenByTitle(
      next.nodes,
      next.nodes[subjectId].childrenIds,
      subject.chapters.map((chapter) => chapter.title),
    );
  }

  next.nodes[courseRootId].childrenIds = orderChildrenByTitle(
    next.nodes,
    next.nodes[courseRootId].childrenIds,
    A_LEVEL_MATHS_SUBJECT_TITLES,
  );

  if (!next.selectedId) {
    next.selectedId = courseRootId;
  }

  return next;
}

export function createSeedState(): FlowState {
  return insertALevelMathsTree({
    nodes: {},
    rootIds: [],
    selectedId: null,
  });
}
