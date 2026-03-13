import type { FlowNode, FlowState } from "@/types/flowstate";

export const A_LEVEL_MATHS_TITLE = "A Level Maths";
export const END_OF_TOPIC_ASSESSMENT_TITLE = "Assessment";
const LEGACY_END_OF_TOPIC_ASSESSMENT_TITLE = "End Of Topic Assessment";
const DEFAULT_PAGE_CONTENT = "";
const REMOVED_SUBTOPIC_TITLES = new Set([
  "introduction",
  "summary and review",
  "exploration",
]);
const LEGACY_CHAPTER_TITLES = new Set([
  "chapter 2: algebra 2",
  "chapter 3: coordinate geometry",
  "chapter 4: calculus 1",
  "chapter 5: trigonometry",
  "chapter 7: units and kinematics",
  "chapter 8: forces and newton's laws",
  "chapter 9: working with data",
  "chapter 10: statistical measures",
  "chapter 11: probability and statistical distributions",
  "chapter 12: algebra 3",
  "chapter 13: calculus 2",
  "chapter 14: trigonometry 2",
  "chapter 15: calculus 3",
  "chapter 16: vectors 2",
  "chapter 18: motion in two dimensions",
  "chapter 19: momentum and collisions",
  "chapter 20: statistics 2",
]);

type ChapterDef = {
  title: string;
  subtopics: string[];
};

function toCapitalizedWords(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word
        .split("-")
        .map((segment) => {
          if (!segment) return segment;
          const firstLetterIndex = segment.search(/[a-zA-Z]/);
          if (firstLetterIndex === -1) return segment;
          const prefix = segment.slice(0, firstLetterIndex);
          const letter = segment.charAt(firstLetterIndex).toUpperCase();
          const suffix = segment.slice(firstLetterIndex + 1).toLowerCase();
          return `${prefix}${letter}${suffix}`;
        })
        .join("-");
    })
    .join(" ");
}

export const A_LEVEL_MATHS_CHAPTERS: ChapterDef[] = [
  {
    title: "Chapter 1: Algebra 1",
    subtopics: [
      "1.1 Argument and proof",
      "1.2 Index laws",
      "1.3 Surds",
      "1.4 Quadratic functions",
      "1.5 Lines and circles",
      "1.6 Simultaneous equations",
      "1.7 Inequalities",
    ],
  },
  {
    title: "Chapter 2: Polynomials and the binomial theorem",
    subtopics: [
      "2.1 Expanding and factorising",
      "2.2 The binomial theorem",
      "2.3 Algebraic division",
      "2.4 Curve sketching",
    ],
  },
  {
    title: "Chapter 3: Trigonometry",
    subtopics: [
      "3.1 Sine, cosine and tangent",
      "3.2 The sine and cosine rules",
    ],
  },
  {
    title: "Chapter 4: Differentiation and integration",
    subtopics: [
      "4.1 Differentiation from first principles",
      "4.2 Differentiating ax^n and Leibniz notation",
      "4.3 Rates of change",
      "4.4 Tangents and normals",
      "4.5 Turning points",
      "4.6 Integration",
      "4.7 Area under a curve",
    ],
  },
  {
    title: "Chapter 5: Exponentials and logarithms",
    subtopics: [
      "5.1 The laws of logarithms",
      "5.2 Exponential functions",
      "5.3 Exponential processes",
      "5.4 Curve fitting",
    ],
  },
  {
    title: "Chapter 6: Vectors",
    subtopics: [
      "6.1 Definitions and properties",
      "6.2 Components of a vector",
    ],
  },
  {
    title: "Chapter 7: Units and kinematics",
    subtopics: [
      "7.1 Standard units and basic dimensions",
      "7.2 Motion in a straight line - definitions and graphs",
      "7.3 Equations of motion for constant acceleration",
      "7.4 Motion with variable acceleration",
    ],
  },
  {
    title: "Chapter 8: Forces and Newton's laws",
    subtopics: [
      "8.1 Forces 1",
      "8.2 Dynamics 1",
      "8.3 Motion under gravity",
      "8.4 Systems of forces",
    ],
  },
  {
    title: "Chapter 9: Collecting, representing and interpreting data",
    subtopics: [
      "9.1 Sampling",
      "9.2 Central tendency and spread",
      "9.3 Single-variable data",
      "9.4 Bivariate data",
    ],
  },
  {
    title: "Chapter 10: Probability and discrete random variables",
    subtopics: [
      "10.1 Probability",
      "10.2 Binomial distribution",
    ],
  },
  {
    title: "Chapter 11: Hypothesis testing 1",
    subtopics: [
      "11.1 Formulating a test",
      "11.2 The critical region",
    ],
  },
  {
    title: "Chapter 12: Algebra 2",
    subtopics: [
      "12.1 Further mathematical proof",
      "12.2 Functions",
      "12.3 Parametric equations",
      "12.4 Algebraic fractions",
      "12.5 Partial fractions",
      "12.6 Vectors in 3D",
    ],
  },
  {
    title: "Chapter 13: Sequences",
    subtopics: [
      "13.1 The binomial series",
      "13.2 Introduction to sequences",
      "13.3 Arithmetic sequences",
      "13.4 Geometric sequences",
    ],
  },
  {
    title: "Chapter 14: Trigonometric identities",
    subtopics: [
      "14.1 Radians",
      "14.2 Reciprocal and inverse trigonometric functions",
      "14.3 Compound angles",
      "14.4 Equivalent forms for a cos theta + b sin theta",
    ],
  },
  {
    title: "Chapter 15: Differentiation 2",
    subtopics: [
      "15.1 The shapes of functions",
      "15.2 Trigonometric functions",
      "15.3 Exponential and logarithmic functions",
      "15.4 The product and quotient rules",
      "15.5 The chain rule",
      "15.6 Inverse functions",
      "15.7 Implicit differentiation",
      "15.8 Parametric functions",
    ],
  },
  {
    title: "Chapter 16: Integration and differential equations",
    subtopics: [
      "16.1 Standard integrals",
      "16.2 Integration by substitution",
      "16.3 Integration by parts",
      "16.4 Integrating rational functions",
      "16.5 Differential equations",
    ],
  },
  {
    title: "Chapter 17: Numerical methods",
    subtopics: [
      "17.1 Simple root finding",
      "17.2 Iterative root finding",
      "17.3 Newton-Raphson root finding",
      "17.4 Numerical integration",
    ],
  },
  {
    title: "Chapter 18: Motion in two dimensions",
    subtopics: [
      "18.1 Two-dimensional motion with constant acceleration",
      "18.2 Two-dimensional motion with variable acceleration",
      "18.3 Motion under gravity 2",
      "18.4 Motion under forces",
    ],
  },
  {
    title: "Chapter 19: Forces 2",
    subtopics: [
      "19.1 Statics",
      "19.2 Dynamics 2",
      "19.3 Moments",
    ],
  },
  {
    title: "Chapter 20: Probability and continuous random variables",
    subtopics: [
      "20.1 Conditional probability",
      "20.2 Modelling with probability",
      "20.3 The Normal distribution",
      "20.4 Using the Normal distribution as an approximation to the binomial",
    ],
  },
  {
    title: "Chapter 21: Hypothesis testing 2",
    subtopics: [
      "21.1 Testing correlation",
      "21.2 Testing a Normal distribution",
    ],
  },
];

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

export const A_LEVEL_MATHS_CHAPTER_TITLES = A_LEVEL_MATHS_CHAPTERS.map(
  (chapter) => chapter.title,
);

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

function reparentNode(
  nodes: Record<string, FlowNode>,
  nodeId: string,
  nextParentId: string,
) {
  const node = nodes[nodeId];
  if (!node) return;

  const previousParentId = node.parentId;
  if (previousParentId && nodes[previousParentId]) {
    nodes[previousParentId].childrenIds = nodes[previousParentId].childrenIds.filter(
      (childId) => childId !== nodeId,
    );
  }

  node.parentId = nextParentId;
  if (!nodes[nextParentId].childrenIds.includes(nodeId)) {
    nodes[nextParentId].childrenIds.push(nodeId);
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

  const courseRootNode = next.nodes[courseRootId];
  if (courseRootNode) {
    const idsToRemove = new Set<string>();

    for (const childId of courseRootNode.childrenIds) {
      const child = next.nodes[childId];
      if (!child || child.kind !== "folder") continue;
      if (!LEGACY_CHAPTER_TITLES.has(normalizeTitle(child.title))) continue;
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

  for (const chapter of A_LEVEL_MATHS_CHAPTERS) {
    const normalizedSubtopics = chapter.subtopics.map((subtopic) =>
      toCapitalizedWords(subtopic),
    );

    const matchingChapterIds =
      next.nodes[courseRootId]?.childrenIds.filter((childId) => {
        const child = next.nodes[childId];
        return (
          child?.kind === "folder" &&
          normalizeTitle(child.title) === normalizeTitle(chapter.title)
        );
      }) ?? [];

    const existingChapterId = matchingChapterIds[0] ?? next.nodes[courseRootId]?.childrenIds.find((childId) => {
      const child = next.nodes[childId];
      return child?.kind === "folder" && normalizeTitle(child.title) === normalizeTitle(chapter.title);
    });

    const chapterId = existingChapterId ?? createFolder(chapter.title, courseRootId);
    if (next.nodes[chapterId].title !== chapter.title) {
      next.nodes[chapterId].title = chapter.title;
    }
    if (normalizeTitle(chapter.title) === normalizeTitle("Chapter 1: Algebra 1")) {
      next.nodes[chapterId].isExpanded = true;
    }

    for (const duplicateChapterId of matchingChapterIds.slice(1)) {
      const duplicateChapter = next.nodes[duplicateChapterId];
      if (!duplicateChapter) continue;
      attachChildren(next.nodes, chapterId, duplicateChapter.childrenIds);
      next.nodes[courseRootId].childrenIds = next.nodes[courseRootId].childrenIds.filter(
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

    const assessmentIds =
      next.nodes[chapterId]?.childrenIds.filter((childId) => {
        const child = next.nodes[childId];
        return (
          child?.kind === "page" &&
          normalizeTitle(child.title) === normalizeTitle(END_OF_TOPIC_ASSESSMENT_TITLE)
        );
      }) ?? [];

    for (const duplicateAssessmentId of assessmentIds.slice(1)) {
      next.nodes[chapterId].childrenIds = next.nodes[chapterId].childrenIds.filter(
        (childId) => childId !== duplicateAssessmentId,
      );
      delete next.nodes[duplicateAssessmentId];
    }

    const allowedPageTitles = new Set(
      [...normalizedSubtopics, END_OF_TOPIC_ASSESSMENT_TITLE, LEGACY_END_OF_TOPIC_ASSESSMENT_TITLE].map(
        (title) => normalizeTitle(title),
      ),
    );
    next.nodes[chapterId].childrenIds = next.nodes[chapterId].childrenIds.filter((childId) => {
      const child = next.nodes[childId];
      if (!child || child.kind !== "page") return true;
      if (REMOVED_SUBTOPIC_TITLES.has(normalizeTitle(child.title))) {
        delete next.nodes[childId];
        return false;
      }
      if (allowedPageTitles.has(normalizeTitle(child.title))) return true;
      if (child.content !== DEFAULT_PAGE_CONTENT) return true;
      delete next.nodes[childId];
      return false;
    });

    for (const subtopic of normalizedSubtopics) {
      const existingSubtopicId = next.nodes[chapterId]?.childrenIds.find((childId) => {
        const child = next.nodes[childId];
        return child?.kind === "page" && normalizeTitle(child.title) === normalizeTitle(subtopic);
      });
      if (!existingSubtopicId) {
        const matchingPageId = Object.keys(next.nodes).find((nodeId) => {
          const node = next.nodes[nodeId];
          return (
            node.kind === "page" &&
            normalizeTitle(node.title) === normalizeTitle(subtopic)
          );
        });

        if (matchingPageId) {
          reparentNode(next.nodes, matchingPageId, chapterId);
          if (next.nodes[matchingPageId].title !== subtopic) {
            next.nodes[matchingPageId].title = subtopic;
          }
          continue;
        }

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
      [...normalizedSubtopics, END_OF_TOPIC_ASSESSMENT_TITLE],
    );
  }

  next.nodes[courseRootId].childrenIds = orderChildrenByTitle(
    next.nodes,
    next.nodes[courseRootId].childrenIds,
    A_LEVEL_MATHS_CHAPTERS.map((chapter) => chapter.title),
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
