"use client";

import {
  NativeDiagramMathLabel,
  NativeDiagramLegend,
  NativeDiagramLegendItem,
  NativeLessonDiagram,
  NativePlotSvg,
} from "@/components/native-lesson-diagram";
import {
  DisplayMath,
  LessonSection,
  MathText,
  NotionLessonRenderer,
  Question,
} from "@/components/notion-lesson-renderer";
import { NOTION_LESSON_DEFINITIONS } from "@/content/notion-lessons/definitions";

function PathArrow({ label }: { label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1" aria-hidden="true">
      <span className="whitespace-nowrap text-xs font-medium text-zinc-600">{label}</span>
      <svg viewBox="0 0 52 8" className="h-2 w-full" preserveAspectRatio="none">
        <line x1="1" y1="4" x2="48" y2="4" stroke="#a1a1aa" strokeWidth="1.25" />
        <path d="M44 1L49 4L44 7" fill="none" stroke="#a1a1aa" strokeWidth="1.25" />
      </svg>
    </div>
  );
}

function PointTransformationDiagram() {
  return (
    <NativeLessonDiagram
      caption={
        <>
          The three pathways act on the coordinates of <MathText>{String.raw`P(3,-2)`}</MathText>
          in the stated order.
        </>
      }
    >
      <div
        role="img"
        aria-label="Three pathways mapping the point 3 comma minus 2 to 5 comma minus 2, 3 over 2 comma minus 2, and minus 3 comma minus 1"
        className="space-y-8 py-1"
      >
        <div>
          <p className="mb-3 text-sm font-medium text-zinc-700">(i)</p>
          <div className="grid grid-cols-[minmax(0,1fr)_84px_minmax(0,1fr)] items-center gap-2">
            <p className="text-center text-base text-zinc-900">
              <MathText>{String.raw`(3,-2)`}</MathText>
            </p>
            <PathArrow label="right 2" />
            <p className="text-center text-base text-zinc-900">
              <MathText>{String.raw`(5,-2)`}</MathText>
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-200/80 pt-5">
          <p className="mb-3 text-sm font-medium text-zinc-700">(ii)</p>
          <div className="grid grid-cols-[minmax(0,1fr)_84px_minmax(0,1fr)] items-center gap-2">
            <p className="text-center text-base text-zinc-900">
              <MathText>{String.raw`(3,-2)`}</MathText>
            </p>
            <PathArrow label="x ÷ 2" />
            <p className="text-center text-base text-zinc-900">
              <MathText>{String.raw`(\frac32,-2)`}</MathText>
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-200/80 pt-5">
          <p className="mb-3 text-sm font-medium text-zinc-700">(iii)</p>
          <div className="grid grid-cols-[minmax(0,1fr)_34px_minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)_36px_minmax(0,1fr)_36px_minmax(0,1fr)]">
            <p className="text-center text-xs text-zinc-900 sm:text-sm">
              <MathText>{String.raw`(3,-2)`}</MathText>
            </p>
            <PathArrow label="reflect" />
            <p className="text-center text-xs text-zinc-900 sm:text-sm">
              <MathText>{String.raw`(-3,-2)`}</MathText>
            </p>
            <PathArrow label="×3" />
            <p className="text-center text-xs text-zinc-900 sm:text-sm">
              <MathText>{String.raw`(-3,-6)`}</MathText>
            </p>
            <PathArrow label="+5" />
            <p className="text-center text-xs text-zinc-900 sm:text-sm">
              <MathText>{String.raw`(-3,-1)`}</MathText>
            </p>
          </div>
        </div>
      </div>
    </NativeLessonDiagram>
  );
}

function TranslatedParabolaDiagram() {
  return (
    <NativeLessonDiagram
      caption={
        <div className="space-y-1">
          <p>
            The vertex moves from <MathText>{String.raw`(0,0)`}</MathText> to
            <MathText>{String.raw`(-4,-4)`}</MathText>: left 4, then down 4.
          </p>
        </div>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label="The parabola y equals x squared translated four units left and four units down"
      >
        <line x1="38" y1="104" x2="366" y2="104" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="270" y1="222" x2="270" y2="26" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="138" y1="104" x2="270" y2="104" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="138" y1="104" x2="138" y2="162" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <path d="M184 28 Q270 198 356 28" fill="none" stroke="#71717a" strokeWidth="2.25" strokeDasharray="7 5" strokeLinecap="round" />
        <path d="M52 70 Q138 240 224 70" fill="none" stroke="#18181b" strokeWidth="2.25" strokeLinecap="round" />
        <circle cx="270" cy="104" r="3.5" fill="#71717a" />
        <circle cx="138" cy="162" r="3.5" fill="#18181b" />
        <line x1="138" y1="99" x2="138" y2="109" stroke="#71717a" />
        <text x="138" y="84" textAnchor="middle" fontSize="12" fill="#52525b">−4</text>
        <text x="249" y="132" textAnchor="start" fontSize="12" fill="#52525b">0</text>
        <text x="374" y="108" fontSize="13" fill="#52525b">x</text>
        <text x="277" y="21" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
      <NativeDiagramLegend>
        <NativeDiagramLegendItem dashed><MathText>{String.raw`y=x^2`}</MathText></NativeDiagramLegendItem>
        <NativeDiagramLegendItem><MathText>{String.raw`y=(x+4)^2-4`}</MathText></NativeDiagramLegendItem>
      </NativeDiagramLegend>
    </NativeLessonDiagram>
  );
}

function SineTransformationDiagram() {
  return (
    <NativeLessonDiagram
      caption={
        <>
          <MathText>{String.raw`y=3+\sin 2x`}</MathText> has period <MathText>π</MathText>, midline
          <MathText>{String.raw`y=3`}</MathText>, maximum 4 and minimum 2.
        </>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label="Two cycles of y equals 3 plus sine 2x between 0 and 2 pi, oscillating between 2 and 4 around y equals 3"
      >
        <line x1="52" y1="202" x2="366" y2="202" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="68" y1="220" x2="68" y2="26" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="68" y1="68" x2="350" y2="68" stroke="#d4d4d8" strokeWidth="1.25" />
        <line x1="68" y1="112" x2="350" y2="112" stroke="#a1a1aa" strokeWidth="1.25" strokeDasharray="6 5" />
        <line x1="68" y1="156" x2="350" y2="156" stroke="#d4d4d8" strokeWidth="1.25" />
        <path
          d="M68 112 C80 86 92 68 103 68 C115 68 127 86 138.5 112 C150 138 162 156 173.5 156 C185 156 197 138 209 112 C221 86 232 68 244 68 C256 68 268 86 279.5 112 C291 138 303 156 314.5 156 C326 156 338 138 350 112"
          fill="none"
          stroke="#18181b"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <text x="54" y="72" textAnchor="end" fontSize="12" fill="#52525b">4</text>
        <text x="54" y="116" textAnchor="end" fontSize="12" fill="#52525b">3</text>
        <text x="54" y="160" textAnchor="end" fontSize="12" fill="#52525b">2</text>
        <text x="58" y="224" textAnchor="end" fontSize="12" fill="#52525b">0</text>
        <NativeDiagramMathLabel x={138.5} y={210}>{String.raw`\frac{\pi}{2}`}</NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={209} y={210}>{String.raw`\pi`}</NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={279.5} y={210} width={52}>{String.raw`\frac{3\pi}{2}`}</NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={350} y={210}>{String.raw`2\pi`}</NativeDiagramMathLabel>
        <text x="374" y="206" fontSize="13" fill="#52525b">x</text>
        <text x="75" y="21" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}

const TRANSFORMATIONS = [
  {
    expression: String.raw`y=f(x)+a`,
    effect: "Vertical shift up by a",
    description: String.raw`\text{Translation }\begin{pmatrix}0\\a\end{pmatrix}`,
  },
  {
    expression: String.raw`y=f(x+a)`,
    effect: "Horizontal shift left by a",
    description: String.raw`\text{Translation }\begin{pmatrix}-a\\0\end{pmatrix}`,
  },
  {
    expression: String.raw`y=af(x)`,
    effect: "Vertical stretch, scale factor a",
    description: "Stretch parallel to the y-axis",
  },
  {
    expression: String.raw`y=f(ax)`,
    effect: String.raw`\text{Horizontal stretch, scale factor }\frac1a`,
    description: "Stretch parallel to the x-axis",
  },
  {
    expression: String.raw`y=-f(x)`,
    effect: "Reflection in the x-axis",
    description: "",
  },
  {
    expression: String.raw`y=f(-x)`,
    effect: "Reflection in the y-axis",
    description: "",
  },
];

export function GraphTransformationsNativeLesson() {
  return (
    <NotionLessonRenderer
      definition={NOTION_LESSON_DEFINITIONS.graphTransformations}
      introduction={
        <p>
          Given the graph of <MathText>{String.raw`y=f(x)`}</MathText>, the following
          transformations produce related graphs. Combinations of transformations must be
          applied in the correct order.
        </p>
      }
    >

      <LessonSection title="Graph Transformations">
        <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200">
          {TRANSFORMATIONS.map((item) => (
            <div key={item.expression} className="grid gap-2 px-4 py-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5 sm:px-5">
              <p className="font-medium text-zinc-950">
                <MathText>{item.expression}</MathText>
              </p>
              <div>
                <p>{item.effect.includes("\\") ? <MathText>{item.effect}</MathText> : item.effect}</p>
                {item.description ? (
                  <p className="text-sm text-zinc-500">
                    {item.description.includes("\\") ? <MathText>{item.description}</MathText> : item.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <p>
          For combinations such as <MathText>{String.raw`y=2f(3x)+1`}</MathText>, work from the
          inside out: first the horizontal stretch (factor <MathText>{String.raw`\frac13`}</MathText>),
          then the vertical stretch (factor 2), then the vertical translation (up 1).
        </p>
      </LessonSection>

      <LessonSection title="Worked Examples">
        <div className="rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            The point <MathText>{String.raw`P(3,-2)`}</MathText> lies on
            <MathText>{String.raw`y=f(x)`}</MathText>. Find the coordinates of the image of
            <MathText>P</MathText> on:
          </p>
          <ol className="mt-4 space-y-1 pl-5 [list-style-type:lower-roman]">
            <li><MathText>{String.raw`y=f(x-2)`}</MathText></li>
            <li><MathText>{String.raw`y=f(2x)`}</MathText></li>
            <li><MathText>{String.raw`y=3f(-x)+5`}</MathText></li>
          </ol>
          <div className="mt-6 space-y-5 border-t border-zinc-200 pt-6">
            <p>
              <span className="font-semibold text-zinc-900">(i)</span>{" "}
              <MathText>{String.raw`y=f(x-2)`}</MathText>: translation by
              <MathText>{String.raw`\begin{pmatrix}2\\0\end{pmatrix}`}</MathText>. Image:
              <MathText>{String.raw`(3+2,-2)=(5,-2)`}</MathText>.
            </p>
            <p>
              <span className="font-semibold text-zinc-900">(ii)</span>{" "}
              <MathText>{String.raw`y=f(2x)`}</MathText>: horizontal stretch factor
              <MathText>{String.raw`\frac12`}</MathText>, so the <MathText>x</MathText>-coordinate
              is halved. Image: <MathText>{String.raw`(\frac32,-2)`}</MathText>.
            </p>
            <p>
              <span className="font-semibold text-zinc-900">(iii)</span>{" "}
              <MathText>{String.raw`y=3f(-x)+5`}</MathText>: reflect in the <MathText>y</MathText>-axis
              (<MathText>{String.raw`x\to-x`}</MathText>), then vertical stretch factor 3, then
              translate up 5.
            </p>
            <DisplayMath>
              {String.raw`(3,-2)\longrightarrow(-3,-2)\longrightarrow(-3,-6)\longrightarrow(-3,-1)`}
            </DisplayMath>
            <p>Image: <MathText>{String.raw`(-3,-1)`}</MathText>.</p>
          </div>
          <PointTransformationDiagram />
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            Describe two geometric transformations that map <MathText>{String.raw`y=x^2`}</MathText>
            onto <MathText>{String.raw`y=x^2+8x+12`}</MathText>.
          </p>
          <p className="mt-5">Complete the square:</p>
          <DisplayMath>{String.raw`x^2+8x+12=(x+4)^2-4`}</DisplayMath>
          <p>
            So <MathText>{String.raw`y=(x+4)^2-4`}</MathText> is
            <MathText>{String.raw`y=x^2`}</MathText> translated by
            <MathText>{String.raw`\begin{pmatrix}-4\\0\end{pmatrix}`}</MathText> then by
            <MathText>{String.raw`\begin{pmatrix}0\\-4\end{pmatrix}`}</MathText>.
          </p>
          <p>
            Equivalently: a translation of
            <MathText>{String.raw`\begin{pmatrix}-4\\-4\end{pmatrix}`}</MathText> (left 4, down 4).
            As two separate transformations:
          </p>
          <div className="space-y-2 border-l-2 border-zinc-200 pl-4">
            <p>
              <span className="font-semibold text-zinc-900">Transformation 1:</span> Translation by
              <MathText>{String.raw`\begin{pmatrix}-4\\0\end{pmatrix}`}</MathText> (4 units left).
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Transformation 2:</span> Translation by
              <MathText>{String.raw`\begin{pmatrix}0\\-4\end{pmatrix}`}</MathText> (4 units down).
            </p>
          </div>
          <TranslatedParabolaDiagram />
        </div>
      </LessonSection>

      <LessonSection title="Practice Questions">
        <ol className="space-y-5">
          <Question number={1}>
            The curve <MathText>{String.raw`y=f(x)`}</MathText> passes through
            <MathText>{String.raw`(4,7)`}</MathText>. Find the coordinates of the image on
            <MathText>{String.raw`y=f(3x)-2`}</MathText>.
          </Question>
          <Question number={2}>
            Sketch <MathText>{String.raw`y=3+\sin2x`}</MathText> for
            <MathText>{String.raw`0\le x\le2\pi`}</MathText>, identifying the transformations applied
            to <MathText>{String.raw`y=\sin x`}</MathText>.
          </Question>
          <Question number={3}>
            The graph of <MathText>{String.raw`y=f(2x)`}</MathText> passes through
            <MathText>{String.raw`(6,0)`}</MathText> and <MathText>{String.raw`(0,2)`}</MathText>.
            Sketch <MathText>{String.raw`y=f(x)`}</MathText>, labelling axis intercepts.
          </Question>
        </ol>
      </LessonSection>

      <LessonSection title="Solutions to Practice Questions">
        <div className="space-y-9">
          <div>
            <h3 className="font-semibold text-zinc-950">
              1. <MathText>{String.raw`(4,7)`}</MathText> on <MathText>{String.raw`y=f(x)`}</MathText>.
              Find the image on <MathText>{String.raw`y=f(3x)-2`}</MathText>.
            </h3>
            <p className="mt-3">
              <MathText>{String.raw`y=f(3x)`}</MathText>: horizontal stretch factor
              <MathText>{String.raw`\frac13`}</MathText>, so the <MathText>x</MathText>-coordinate
              becomes <MathText>{String.raw`\frac43`}</MathText>.
            </p>
            <p>
              <MathText>{String.raw`y=f(3x)-2`}</MathText>: then shift down 2, so the
              <MathText>y</MathText>-coordinate becomes <MathText>{String.raw`7-2=5`}</MathText>.
            </p>
            <p>Image: <MathText>{String.raw`(\frac43,5)`}</MathText>.</p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              2. <MathText>{String.raw`y=3+\sin2x`}</MathText>
            </h3>
            <p className="mt-3">
              This is <MathText>{String.raw`y=\sin x`}</MathText> with a horizontal stretch factor
              <MathText>{String.raw`\frac12`}</MathText> (so period <MathText>π</MathText>) and a
              vertical translation up 3. The curve oscillates between <MathText>{String.raw`y=2`}</MathText>
              and <MathText>{String.raw`y=4`}</MathText>, centred on <MathText>{String.raw`y=3`}</MathText>.
            </p>
            <SineTransformationDiagram />
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">3.</h3>
            <p className="mt-3">
              If <MathText>{String.raw`y=f(2x)`}</MathText> passes through
              <MathText>{String.raw`(6,0)`}</MathText> and <MathText>{String.raw`(0,2)`}</MathText>,
              then <MathText>{String.raw`y=f(x)`}</MathText> passes through the points obtained by
              “undoing” the horizontal stretch of factor <MathText>{String.raw`\frac12`}</MathText>:
              multiply <MathText>x</MathText>-coordinates by 2.
            </p>
            <p>
              So <MathText>{String.raw`y=f(x)`}</MathText> passes through
              <MathText>{String.raw`(12,0)`}</MathText> and <MathText>{String.raw`(0,2)`}</MathText>.
            </p>
          </div>
        </div>
      </LessonSection>
    </NotionLessonRenderer>
  );
}
