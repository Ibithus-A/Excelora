import type { FlowNode, FlowState } from "@/types/flowstate";

function makeNode(
  id: string,
  kind: "page" | "folder",
  title: string,
  parentId: string | null,
  childrenIds: string[],
  content: string,
  isExpanded = true,
  isLocked = false,
): FlowNode {
  const now = Date.now();
  return {
    id,
    kind,
    title,
    parentId,
    childrenIds,
    content,
    isLocked,
    isUnlockedOverride: false,
    isExpanded,
    createdAt: now,
    updatedAt: now,
  };
}

type ChapterDef = {
  title: string;
  subtopics: string[];
};

type CourseDef = {
  title: string;
  chapters: ChapterDef[];
};

const AS_PURE_CHAPTERS: ChapterDef[] = [
  {
    title: "Chapter 1 - Algebraic Expressions",
    subtopics: [
      "1.1 Index laws",
      "1.2 Expanding brackets",
      "1.3 Factorising",
      "1.4 Negative and fractional indices",
      "1.5 Surds",
      "1.6 Rationalising denominators",
    ],
  },
  {
    title: "Chapter 2 - Quadratics",
    subtopics: [
      "2.1 Solving quadratic equations",
      "2.2 Completing the square",
      "2.3 Functions",
      "2.4 Quadratic graphs",
      "2.5 The discriminant",
      "2.6 Modelling with quadratics",
    ],
  },
  {
    title: "Chapter 3 - Equations and Inequalities",
    subtopics: [
      "3.1 Linear simultaneous equations",
      "3.2 Quadratic simultaneous equations",
      "3.3 Simultaneous equations on graphs",
      "3.4 Linear inequalities",
      "3.5 Quadratic inequalities",
      "3.6 Inequalities on graphs",
      "3.7 Regions",
    ],
  },
  {
    title: "Chapter 4 - Graphs and Transformations",
    subtopics: [
      "4.1 Cubic graphs",
      "4.2 Quartic graphs",
      "4.3 Reciprocal graphs",
      "4.4 Points of intersection",
      "4.5 Translating graphs",
      "4.6 Stretching graphs",
      "4.7 Transforming functions",
    ],
  },
  {
    title: "Chapter 5 - Straight Line Graphs",
    subtopics: [
      "5.1 y = mx + c",
      "5.2 Equations of straight lines",
      "5.3 Parallel and perpendicular lines",
      "5.4 Length and area",
      "5.5 Modelling with straight lines",
    ],
  },
  {
    title: "Chapter 6 - Circles",
    subtopics: [
      "6.1 Midpoints and perpendicular bisectors",
      "6.2 Equation of a circle",
      "6.3 Intersections of straight lines and circles",
      "6.4 Use tangent and chord properties",
      "6.5 Circles and triangles",
    ],
  },
  {
    title: "Chapter 7 - Algebraic Methods",
    subtopics: [
      "7.1 Algebraic fractions",
      "7.2 Dividing polynomials",
      "7.3 The factor theorem",
      "7.4 Mathematical proof",
      "7.5 Methods of proof",
    ],
  },
  {
    title: "Chapter 8 - The Binomial Expansion",
    subtopics: [
      "8.1 Pascal's triangle",
      "8.2 Factorial notation",
      "8.3 The binomial expansion",
      "8.4 Solving binomial problems",
      "8.5 Binomial estimation",
    ],
  },
  {
    title: "Chapter 9 - Trigonometric Ratios",
    subtopics: [
      "9.1 The cosine rule",
      "9.2 The sine rule",
      "9.3 Areas of triangles",
      "9.4 Solving triangle problems",
      "9.5 Graphs of sine, cosine and tangent",
      "9.6 Transforming trigonometric graphs",
    ],
  },
  {
    title: "Chapter 10 - Trigonometric Identities and Equations",
    subtopics: [
      "10.1 Angles in all four quadrants",
      "10.2 Exact values of trigonometrical ratios",
      "10.3 Trigonometric identities",
      "10.4 Simple trigonometric equations",
      "10.5 Harder trigonometric equations",
      "10.6 Equations and identities",
    ],
  },
  {
    title: "Chapter 11 - Vectors",
    subtopics: [
      "11.1 Vectors",
      "11.2 Representing vectors",
      "11.3 Magnitude and direction",
      "11.4 Position vectors",
      "11.5 Solving geometric problems",
      "11.6 Modelling with vectors",
    ],
  },
  {
    title: "Chapter 12 - Differentiation",
    subtopics: [
      "12.1 Gradients of curves",
      "12.2 Finding the derivative",
      "12.3 Differentiating x^n",
      "12.4 Differentiating quadratics",
      "12.5 Differentiating functions with two or more terms",
      "12.6 Gradients, tangents and normal",
      "12.7 Increasing and decreasing functions",
      "12.8 Second order derivatives",
      "12.9 Stationary points",
      "12.10 Sketching gradient functions",
      "12.11 Modelling with differentiation",
    ],
  },
  {
    title: "Chapter 13 - Integration",
    subtopics: [
      "13.1 Integrating x^n",
      "13.2 Indefinite integrals",
      "13.3 Finding functions",
      "13.4 Definite integrals",
      "13.5 Areas under curves",
      "13.6 Areas under the x-axis",
      "13.7 Areas between curves and lines",
    ],
  },
  {
    title: "Chapter 14 - Exponentials and Logarithms",
    subtopics: [
      "14.1 Exponential functions",
      "14.2 y = e^x",
      "14.3 Exponential modelling",
      "14.4 Logarithms",
      "14.5 Laws of logarithms",
      "14.6 Solving equations using logarithms",
      "14.7 Working with natural logarithms",
      "14.8 Logarithms and non-linear data",
    ],
  },
];

const AS_APPLIED_CHAPTERS: ChapterDef[] = [
  {
    title: "Chapter 1 - Data Collection",
    subtopics: [
      "1.1 Populations and samples",
      "1.2 Sampling",
      "1.3 Non-random sampling",
      "1.4 Types of data",
      "1.5 The large data set",
    ],
  },
  {
    title: "Chapter 2 - Measures of Location and Spread",
    subtopics: [
      "2.1 Measures of central tendency",
      "2.2 Other measures of location",
      "2.3 Measures of spread",
      "2.4 Variance and standard deviation",
      "2.5 Coding",
    ],
  },
  {
    title: "Chapter 3 - Representations of Data",
    subtopics: [
      "3.1 Outliers",
      "3.2 Box plots",
      "3.3 Cumulative frequency",
      "3.4 Histograms",
      "3.5 Comparing data",
    ],
  },
  {
    title: "Chapter 4 - Correlation",
    subtopics: ["4.1 Correlation", "4.2 Linear regression"],
  },
  {
    title: "Chapter 5 - Probability",
    subtopics: [
      "5.1 Calculating probabilities",
      "5.2 Venn diagrams",
      "5.3 Mutually exclusive and independent events",
      "5.4 Tree diagrams",
    ],
  },
  {
    title: "Chapter 6 - Statistical Distributions",
    subtopics: [
      "6.1 Probability distributions",
      "6.2 The binomial distribution",
      "6.3 Cumulative probabilities",
    ],
  },
  {
    title: "Chapter 7 - Hypothesis Testing",
    subtopics: [
      "7.1 Hypothesis testing",
      "7.2 Finding critical values",
      "7.3 One-tailed tests",
      "7.4 Two-tailed tests",
    ],
  },
  {
    title: "Chapter 8 - Modelling in Mechanics",
    subtopics: [
      "8.1 Constructing a model",
      "8.2 Modelling assumptions",
      "8.3 Quantities and units",
      "8.4 Working with vectors",
    ],
  },
  {
    title: "Chapter 9 - Constant Acceleration",
    subtopics: [
      "9.1 Displacement-time graphs",
      "9.2 Velocity-time graphs",
      "9.3 Constant acceleration formulae 1",
      "9.4 Constant acceleration formulae 2",
      "9.5 Vertical motion under gravity",
    ],
  },
  {
    title: "Chapter 10 - Forces and Motion",
    subtopics: [
      "10.1 Force diagrams",
      "10.2 Forces as vectors",
      "10.3 Forces and acceleration",
      "10.4 Motion in 2 dimensions",
      "10.5 Connected particles",
      "10.6 Pulleys",
    ],
  },
  {
    title: "Chapter 11 - Variable Acceleration",
    subtopics: [
      "11.1 Functions of time",
      "11.2 Using differentiation",
      "11.3 Maxima and minima problems",
      "11.4 Using integration",
      "11.5 Constant acceleration formulae",
    ],
  },
];

const A2_PURE_CHAPTERS: ChapterDef[] = [
  {
    title: "Chapter 1 - Algebraic Methods",
    subtopics: [
      "1.1 Proof by contradiction",
      "1.2 Algebraic fractions",
      "1.3 Partial fractions",
      "1.4 Repeated factors",
      "1.5 Algebraic division",
    ],
  },
  {
    title: "Chapter 2 - Functions and Graphs",
    subtopics: [
      "2.1 The modulus function",
      "2.2 Functions and mappings",
      "2.3 Composite functions",
      "2.4 Inverse functions",
      "2.5 y = |f(x)| and y = f(|x|)",
      "2.6 Combining transformations",
      "2.7 Solving modulus problems",
    ],
  },
  {
    title: "Chapter 3 - Sequences and Series",
    subtopics: [
      "3.1 Arithmetic sequences",
      "3.2 Arithmetic series",
      "3.3 Geometric sequences",
      "3.4 Geometric series",
      "3.5 Sum to infinity",
      "3.6 Sigma notation",
      "3.7 Recurrence relations",
      "3.8 Modelling with series",
    ],
  },
  {
    title: "Chapter 4 - Binomial Expansion",
    subtopics: [
      "4.1 Expanding (1 + x)^n",
      "4.2 Expanding (a + bx)^n",
      "4.3 Using partial fractions",
    ],
  },
  {
    title: "Chapter 5 - Radians",
    subtopics: [
      "5.1 Radian measure",
      "5.2 Arc length",
      "5.3 Areas of sectors and segments",
      "5.4 Solving trigonometric equations",
      "5.5 Small angle approximations",
    ],
  },
  {
    title: "Chapter 6 - Trigonometric Functions",
    subtopics: [
      "6.1 Secant, cosecant and cotangent",
      "6.2 Graphs of sec x, cosec x and cot x",
      "6.3 Using sec x, cosec x and cot x",
      "6.4 Trigonometric identities",
      "6.5 Inverse trigonometric functions",
    ],
  },
  {
    title: "Chapter 7 - Trigonometry and Modelling",
    subtopics: [
      "7.1 Addition formulae",
      "7.2 Using the angle addition formulae",
      "7.3 Double-angle formulae",
      "7.4 Solving trigonometric equations",
      "7.5 Simplifying a cos x +/- b sin x",
      "7.6 Proving trigonometric identities",
      "7.7 Modelling with trigonometric functions",
    ],
  },
  {
    title: "Chapter 8 - Parametric Equations",
    subtopics: [
      "8.1 Parametric equations",
      "8.2 Using trigonometric identities",
      "8.3 Curve sketching",
      "8.4 Points of intersection",
      "8.5 Modelling with parametric equations",
    ],
  },
  {
    title: "Chapter 9 - Differentiation",
    subtopics: [
      "9.1 Differentiating sin x and cos x",
      "9.2 Differentiating exponentials and logarithms",
      "9.3 The chain rule",
      "9.4 The product rule",
      "9.5 The quotient rule",
      "9.6 Differentiating trigonometric functions",
      "9.7 Parametric differentiation",
      "9.8 Implicit differentiation",
      "9.9 Using second derivatives",
      "9.10 Rates of change",
    ],
  },
  {
    title: "Chapter 10 - Numerical Methods",
    subtopics: [
      "10.1 Locating roots",
      "10.2 Iteration",
      "10.3 The Newton-Raphson method",
      "10.4 Applications to modelling",
    ],
  },
  {
    title: "Chapter 11 - Integration",
    subtopics: [
      "11.1 Integrating standard functions",
      "11.2 Integrating f(ax+b)",
      "11.3 Using trigonometric identities",
      "11.4 Reverse chain rule",
      "11.5 Integration by substitution",
      "11.6 Integration by parts",
      "11.7 Partial fractions",
      "11.8 Finding areas",
      "11.9 The trapezium rule",
      "11.10 Solving differential equations",
      "11.11 Modelling with differential equations",
    ],
  },
  {
    title: "Chapter 12 - Vectors",
    subtopics: [
      "12.1 3D coordinates",
      "12.2 Vectors in 3D",
      "12.3 Solving geometric problems",
      "12.4 Application to mechanics",
    ],
  },
];

const A2_APPLIED_CHAPTERS: ChapterDef[] = [
  {
    title: "Chapter 1 - Regression, Correlation and Hypothesis Testing",
    subtopics: [
      "1.1 Exponential models",
      "1.2 Measuring correlation",
      "1.3 Hypothesis testing for zero correlation",
    ],
  },
  {
    title: "Chapter 2 - Conditional Probability",
    subtopics: [
      "2.1 Set notation",
      "2.2 Conditional probability",
      "2.3 Conditional probabilities in Venn diagrams",
      "2.4 Probability formulae",
      "2.5 Tree diagrams",
    ],
  },
  {
    title: "Chapter 3 - The Normal Distribution",
    subtopics: [
      "3.1 The normal distribution",
      "3.2 Finding probabilities for normal distributions",
      "3.3 The inverse normal distribution function",
      "3.4 The standard normal distribution",
      "3.5 Finding mu and sigma",
      "3.6 Approximating a binomial distribution",
      "3.7 Hypothesis testing with the normal distribution",
    ],
  },
  {
    title: "Chapter 4 - Moments",
    subtopics: [
      "4.1 Moments",
      "4.2 Resultant moments",
      "4.3 Equilibrium",
      "4.4 Centres of mass",
      "4.5 Tilting",
    ],
  },
  {
    title: "Chapter 5 - Forces and Friction",
    subtopics: ["5.1 Resolving forces", "5.2 Inclined planes", "5.3 Friction"],
  },
  {
    title: "Chapter 6 - Projectiles",
    subtopics: [
      "6.1 Horizontal projection",
      "6.2 Horizontal and vertical components",
      "6.3 Projection at any angle",
      "6.4 Projectile motion formulae",
    ],
  },
  {
    title: "Chapter 7 - Applications of Forces",
    subtopics: [
      "7.1 Static particles",
      "7.2 Modelling with statics",
      "7.3 Friction and static particles",
      "7.4 Static rigid bodies",
      "7.5 Dynamics and inclined planes",
      "7.6 Connected particles",
    ],
  },
  {
    title: "Chapter 8 - Further Kinematics",
    subtopics: [
      "8.1 Vectors in kinematics",
      "8.2 Vector methods with projectiles",
      "8.3 Variable acceleration in one dimension",
      "8.4 Differentiating vectors",
      "8.5 Integrating vectors",
    ],
  },
];

const COURSES: CourseDef[] = [
  {
    title: "AS Pure Maths (Pure Mathematics Year 1/AS)",
    chapters: AS_PURE_CHAPTERS,
  },
  {
    title: "AS Applied Maths (Statistics & Mechanics Year 1/AS)",
    chapters: AS_APPLIED_CHAPTERS,
  },
  {
    title: "A2 Pure Maths (Pure Mathematics Year 2)",
    chapters: A2_PURE_CHAPTERS,
  },
  {
    title: "A2 Applied (Statistics & Mechanics Year 2)",
    chapters: A2_APPLIED_CHAPTERS,
  },
];

export function createSeedState(): FlowState {
  const nodes: Record<string, FlowNode> = {};
  const rootIds: string[] = [];
  let seed = 0;

  const makeNodeId = (title: string) => {
    seed += 1;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${slug || "node"}-${seed}`;
  };

  const createFolder = (title: string, parentId: string | null) => {
    const id = makeNodeId(title);
    nodes[id] = makeNode(id, "folder", title, parentId, [], "");

    if (parentId) {
      nodes[parentId].childrenIds.push(id);
    } else {
      rootIds.push(id);
    }

    return id;
  };

  const createPage = (title: string, parentId: string) => {
    const id = makeNodeId(title);
    nodes[id] = makeNode(
      id,
      "page",
      title,
      parentId,
      [],
      `${title}\n\nUse this space for notes and examples.`,
    );
    nodes[parentId].childrenIds.push(id);
    return id;
  };

  const createChapterTree = (chapter: ChapterDef, parentId: string) => {
    const chapterId = createFolder(chapter.title, parentId);
    for (const subtopic of chapter.subtopics) {
      createPage(subtopic, chapterId);
    }
    createPage("End of Topic Test", chapterId);
  };

  for (const course of COURSES) {
    const courseId = createFolder(course.title, null);
    for (const chapter of course.chapters) {
      createChapterTree(chapter, courseId);
    }
  }

  return {
    nodes,
    rootIds,
    selectedId: rootIds[0] ?? null,
  };
}
