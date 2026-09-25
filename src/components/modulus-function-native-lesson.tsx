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
  Step,
} from "@/components/notion-lesson-renderer";
import { NOTION_LESSON_DEFINITIONS } from "@/content/notion-lessons/definitions";

function ModulusIntervalDiagram() {
  return (
    <NativeLessonDiagram
      caption={
        <>
          <span className="font-medium text-zinc-700">
            <MathText>{String.raw`|2x-3|\le\frac52`}</MathText>
          </span>{" "}
          The modulus curve is below the dashed boundary between the intersections, so{" "}
          <MathText>{String.raw`\frac14\le x\le\frac{11}{4}`}</MathText>.
        </>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label="Graph of y equals the modulus of 2x minus 3 below y equals five over two between one quarter and eleven quarters"
      >
        <line x1="42" y1="194" x2="366" y2="194" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="68" y1="218" x2="68" y2="26" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="68" y1="102" x2="366" y2="102" stroke="#71717a" strokeWidth="1.25" strokeDasharray="6 5" />
        <path d="M58 28 L208 194 L358 28" fill="none" stroke="#18181b" strokeWidth="2.25" strokeLinejoin="round" />
        <line x1="131" y1="194" x2="285" y2="194" stroke="#52525b" strokeWidth="5" strokeLinecap="round" />
        <line x1="131" y1="106" x2="131" y2="194" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="285" y1="106" x2="285" y2="194" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <circle cx="131" cy="102" r="3.5" fill="#18181b" />
        <circle cx="285" cy="102" r="3.5" fill="#18181b" />
        <NativeDiagramMathLabel x={131} y={202}>{String.raw`\frac14`}</NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={285} y={202}>{String.raw`\frac{11}{4}`}</NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={58} y={78} width={42} align="end">{String.raw`\frac52`}</NativeDiagramMathLabel>
        <NativeDiagramMathLabel x={208} y={202}>{String.raw`\frac32`}</NativeDiagramMathLabel>
        <text x="374" y="198" fontSize="13" fill="#52525b">x</text>
        <text x="42" y="16" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}

function ModulusIntersectionDiagram() {
  return (
    <NativeLessonDiagram
      caption={
        <div className="space-y-2">
          <p>
            Intersections: <MathText>{String.raw`(-2,3)`}</MathText> and{" "}
            <MathText>{String.raw`(0,1)`}</MathText>. The dashed graph is on or above the solid
            graph when <MathText>{String.raw`x\le-2`}</MathText> or{" "}
            <MathText>{String.raw`x\ge0`}</MathText>.
          </p>
        </div>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label="Graphs of y equals modulus x minus 1 and y equals modulus 2x plus 1 intersecting at minus 2 comma 3 and 0 comma 1"
      >
        <line x1="38" y1="182" x2="366" y2="182" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="238" y1="212" x2="238" y2="26" stroke="#a1a1aa" strokeWidth="1.25" />
        <path d="M44 62 L304 182 L360 156" fill="none" stroke="#18181b" strokeWidth="2.25" strokeLinejoin="round" />
        <path d="M44 30 L205 182 L360 34" fill="none" stroke="#71717a" strokeWidth="2.25" strokeDasharray="7 5" strokeLinejoin="round" />
        <circle cx="108" cy="92" r="3.5" fill="#18181b" />
        <circle cx="238" cy="152" r="3.5" fill="#18181b" />
        <line x1="108" y1="177" x2="108" y2="187" stroke="#71717a" />
        <line x1="238" y1="177" x2="238" y2="187" stroke="#71717a" />
        <text x="108" y="206" textAnchor="middle" fontSize="12" fill="#52525b">−2</text>
        <text x="228" y="206" textAnchor="end" fontSize="12" fill="#52525b">0</text>
        <text x="374" y="186" fontSize="13" fill="#52525b">x</text>
        <text x="245" y="21" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
      <NativeDiagramLegend>
        <NativeDiagramLegendItem><MathText>{String.raw`y=|x-1|`}</MathText></NativeDiagramLegendItem>
        <NativeDiagramLegendItem dashed><MathText>{String.raw`y=|2x+1|`}</MathText></NativeDiagramLegendItem>
      </NativeDiagramLegend>
    </NativeLessonDiagram>
  );
}

export function ModulusFunctionNativeLesson() {
  return (
    <NotionLessonRenderer
      definition={NOTION_LESSON_DEFINITIONS.modulusFunction}
      introduction={
        <p>
          The modulus (absolute value) of <MathText>x</MathText>, written
          <MathText>{String.raw`|x|`}</MathText>, gives the non-negative value of
          <MathText>x</MathText>: <MathText>{String.raw`|x|=x`}</MathText> when
          <MathText>{String.raw`x\ge0`}</MathText> and <MathText>{String.raw`|x|=-x`}</MathText> when
          <MathText>{String.raw`x<0`}</MathText>. The graph of
          <MathText>{String.raw`y=|f(x)|`}</MathText> is obtained from
          <MathText>{String.raw`y=f(x)`}</MathText> by reflecting any part below the
          <MathText>x</MathText>-axis upward.
        </p>
      }
    >

      <LessonSection title="Modulus Properties">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 sm:px-6 sm:py-4">
          <DisplayMath>
            {String.raw`|ax+b|=\begin{cases}ax+b&\text{if }ax+b\ge0\\-(ax+b)&\text{if }ax+b<0\end{cases}`}
          </DisplayMath>
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p>
            <span className="font-semibold text-zinc-900">
              Solving <MathText>{String.raw`|f(x)|=g(x)`}</MathText>:
            </span>{" "}
            Solve <MathText>{String.raw`f(x)=g(x)`}</MathText> and
            <MathText>{String.raw`f(x)=-g(x)`}</MathText>, then check each solution.
          </p>
          <p>
            <span className="font-semibold text-zinc-900">
              Solving <MathText>{String.raw`|f(x)|\le g(x)`}</MathText>:
            </span>{" "}
            Equivalent to <MathText>{String.raw`-g(x)\le f(x)\le g(x)`}</MathText> (when
            <MathText>{String.raw`g(x)>0`}</MathText>).
          </p>
        </div>
      </LessonSection>

      <LessonSection title="Worked Examples">
        <div className="rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            Solve <MathText>{String.raw`12-2|2x-3|\ge7`}</MathText>.
          </p>
          <div className="mt-6 space-y-5">
            <Step number={1} title="Isolate the modulus term:">
              <DisplayMath>{String.raw`-2|2x-3|\ge7-12=-5`}</DisplayMath>
              <DisplayMath>{String.raw`|2x-3|\le\frac52`}</DisplayMath>
              <p>(Note: dividing by −2 reverses the inequality.)</p>
            </Step>
            <Step number={2} title="Apply the definition of modulus inequality:">
              <DisplayMath>{String.raw`-\frac52\le2x-3\le\frac52`}</DisplayMath>
            </Step>
            <Step number={3} title="Solve both sides:">
              <DisplayMath>{String.raw`-\frac52+3\le2x\le\frac52+3`}</DisplayMath>
              <DisplayMath>{String.raw`\frac12\le2x\le\frac{11}{2}`}</DisplayMath>
              <DisplayMath>{String.raw`\frac14\le x\le\frac{11}{4}`}</DisplayMath>
              <p>
                The solution is <MathText>{String.raw`\frac14\le x\le\frac{11}{4}`}</MathText>.
              </p>
            </Step>
          </div>
          <ModulusIntervalDiagram />
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            Sketch the graphs of <MathText>{String.raw`y=|x-1|`}</MathText> and
            <MathText>{String.raw`y=|2x+1|`}</MathText> on the same axes. Hence solve
            <MathText>{String.raw`|2x+1|\ge|x-1|`}</MathText>.
          </p>
          <p className="mt-5">
            <span className="font-semibold text-zinc-900">Sketching:</span>{" "}
            <MathText>{String.raw`y=|x-1|`}</MathText> has vertex at
            <MathText>{String.raw`(1,0)`}</MathText> and <MathText>y</MathText>-intercept at
            <MathText>{String.raw`(0,1)`}</MathText>. <MathText>{String.raw`y=|2x+1|`}</MathText> has
            vertex at <MathText>{String.raw`\left(-\frac12,0\right)`}</MathText> and
            <MathText>y</MathText>-intercept at <MathText>{String.raw`(0,1)`}</MathText>.
          </p>
          <ModulusIntersectionDiagram />
          <p>
            <span className="font-semibold text-zinc-900">Finding intersection points:</span>{" "}
            Set <MathText>{String.raw`|2x+1|=|x-1|`}</MathText>.
          </p>
          <div className="space-y-4 border-l-2 border-zinc-200 pl-4">
            <p>
              <span className="font-semibold text-zinc-900">Case 1:</span>{" "}
              <MathText>{String.raw`2x+1=x-1`}</MathText>, giving
              <MathText>{String.raw`x=-2`}</MathText>, so <MathText>{String.raw`y=3`}</MathText>.
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Case 2:</span>{" "}
              <MathText>{String.raw`2x+1=-(x-1)=-x+1`}</MathText>, giving
              <MathText>{String.raw`3x=0`}</MathText>, so <MathText>{String.raw`x=0,y=1`}</MathText>.
            </p>
          </div>
          <p>
            <span className="font-semibold text-zinc-900">Reading the graph:</span>{" "}
            <MathText>{String.raw`|2x+1|\ge|x-1|`}</MathText> where the graph of
            <MathText>{String.raw`|2x+1|`}</MathText> is on or above
            <MathText>{String.raw`|x-1|`}</MathText>. From the sketch this occurs when
            <MathText>{String.raw`x\le-2`}</MathText> or <MathText>{String.raw`x\ge0`}</MathText>.
          </p>
          <p>
            Solution: <MathText>{String.raw`\{x:x\le-2\}\cup\{x:x\ge0\}`}</MathText>.
          </p>
        </div>
      </LessonSection>

      <LessonSection title="Practice Questions">
        <ol className="space-y-5">
          <Question number={1}>
            Sketch the graph of <MathText>{String.raw`y=|3x-6|`}</MathText> and use it to solve
            <MathText>{String.raw`|3x-6|=x+2`}</MathText>.
          </Question>
          <Question number={2}>
            Solve <MathText>{String.raw`|2x+5|<3`}</MathText>.
          </Question>
          <Question number={3}>
            The point <MathText>{String.raw`P(3,-2)`}</MathText> lies on
            <MathText>{String.raw`y=f(x)`}</MathText>. Find the coordinates of the image of
            <MathText>P</MathText> on <MathText>{String.raw`y=3|f(x)|+5`}</MathText>.
          </Question>
        </ol>
      </LessonSection>

      <LessonSection title="Solutions to Practice Questions">
        <div className="space-y-9">
          <div>
            <h3 className="font-semibold text-zinc-950">
              1. Sketch <MathText>{String.raw`y=|3x-6|`}</MathText> and solve
              <MathText>{String.raw`|3x-6|=x+2`}</MathText>.
            </h3>
            <p className="mt-3">
              The graph of <MathText>{String.raw`y=|3x-6|`}</MathText> has vertex at
              <MathText>{String.raw`(2,0)`}</MathText> and <MathText>y</MathText>-intercept at
              <MathText>{String.raw`(0,6)`}</MathText>.
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Case 1:</span>
            </p>
            <DisplayMath>{String.raw`3x-6=x+2`}</DisplayMath>
            <DisplayMath>{String.raw`2x=8\implies x=4`}</DisplayMath>
            <p>
              Check: <MathText>{String.raw`|6|=6`}</MathText> and <MathText>{String.raw`6=6`}</MathText>.
            </p>
            <p className="font-semibold text-zinc-900">Case 2:</p>
            <DisplayMath>{String.raw`-(3x-6)=x+2`}</DisplayMath>
            <DisplayMath>{String.raw`-3x+6=x+2`}</DisplayMath>
            <DisplayMath>{String.raw`4=4x\implies x=1`}</DisplayMath>
            <p>
              Check: <MathText>{String.raw`|-3|=3`}</MathText> and <MathText>{String.raw`3=3`}</MathText>.
            </p>
            <p>
              Solutions: <MathText>{String.raw`x=1`}</MathText> or <MathText>{String.raw`x=4`}</MathText>.
            </p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              2. Solve <MathText>{String.raw`|2x+5|<3`}</MathText>.
            </h3>
            <DisplayMath>{String.raw`-3<2x+5<3`}</DisplayMath>
            <DisplayMath>{String.raw`-8<2x<-2`}</DisplayMath>
            <p>giving <MathText>{String.raw`-4<x<-1`}</MathText>.</p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              3. <MathText>{String.raw`P(3,-2)`}</MathText> on <MathText>{String.raw`y=f(x)`}</MathText>.
              Find the image on <MathText>{String.raw`y=3|f(x)|+5`}</MathText>.
            </h3>
            <p className="mt-3">
              At <MathText>{String.raw`x=3`}</MathText>, <MathText>{String.raw`f(3)=-2`}</MathText>.
              Then <MathText>{String.raw`|f(3)|=|-2|=2`}</MathText>, so
              <MathText>{String.raw`y=3(2)+5=11`}</MathText>.
            </p>
            <p>The image is <MathText>{String.raw`(3,11)`}</MathText>.</p>
          </div>
        </div>
      </LessonSection>
    </NotionLessonRenderer>
  );
}
