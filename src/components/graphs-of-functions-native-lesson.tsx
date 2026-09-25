"use client";

import { NativeLessonDiagram, NativePlotSvg } from "@/components/native-lesson-diagram";
import {
  DisplayMath,
  LessonSection,
  MathText,
  NotionLessonRenderer,
  Question,
  Step,
} from "@/components/notion-lesson-renderer";
import { NOTION_LESSON_DEFINITIONS } from "@/content/notion-lessons/definitions";

function CubicGraph() {
  return (
    <NativeLessonDiagram
      caption={
        <>
          <span className="font-medium text-zinc-700">
            <MathText>{String.raw`y=x(x-2)(x+1)`}</MathText>
          </span>
          <span className="mx-2 text-zinc-300">·</span>
          x-intercepts: <MathText>{String.raw`-1,\ 0,\ 2`}</MathText>
        </>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label="Cubic graph crossing the x-axis at minus 1, 0, and 2"
      >
        <line x1="38" y1="132" x2="366" y2="132" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="200" y1="222" x2="200" y2="26" stroke="#a1a1aa" strokeWidth="1.25" />
        <path
          d="M48 216 C68 174 86 141 104 132 C136 113 168 94 200 132 C228 167 264 173 296 132 C321 101 337 58 354 32"
          fill="none"
          stroke="#18181b"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        {[104, 200, 296].map((x) => <circle key={x} cx={x} cy="132" r="3.5" fill="#18181b" />)}
        {[104, 200, 296].map((x) => <line key={x} x1={x} y1="127" x2={x} y2="137" stroke="#71717a" strokeWidth="1.25" />)}
        <text x="104" y="156" textAnchor="middle" fontSize="12" fill="#52525b">−1</text>
        <text x="190" y="156" textAnchor="end" fontSize="12" fill="#52525b">0</text>
        <text x="296" y="156" textAnchor="middle" fontSize="12" fill="#52525b">2</text>
        <text x="374" y="136" fontSize="13" fill="#52525b">x</text>
        <text x="207" y="21" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}

function TranslatedReciprocalGraph() {
  return (
    <NativeLessonDiagram
      caption={
        <>
          <span className="font-medium text-zinc-700">
            <MathText>{String.raw`y=\frac2{x+1}+1`}</MathText>
          </span>
          <span className="mx-2 text-zinc-300">·</span>
          Asymptotes: <MathText>{String.raw`x=-1`}</MathText> and <MathText>{String.raw`y=1`}</MathText>
        </>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label="Translated reciprocal graph with asymptotes x equals minus 1 and y equals 1"
      >
        <line x1="38" y1="160" x2="366" y2="160" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="208" y1="222" x2="208" y2="26" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="128" y1="26" x2="128" y2="222" stroke="#71717a" strokeWidth="1.25" strokeDasharray="6 5" />
        <line x1="38" y1="94" x2="366" y2="94" stroke="#71717a" strokeWidth="1.25" strokeDasharray="6 5" />
        <path d="M42 104 C74 109 104 136 116 218" fill="none" stroke="#18181b" strokeWidth="2.25" strokeLinecap="round" />
        <path d="M140 30 C154 67 188 86 362 91" fill="none" stroke="#18181b" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="128" y1="155" x2="128" y2="165" stroke="#71717a" />
        <text x="148" y="188" textAnchor="end" fontSize="12" fill="#52525b">−1</text>
        <line x1="203" y1="94" x2="213" y2="94" stroke="#71717a" />
        <text x="32" y="88" textAnchor="end" fontSize="12" fill="#52525b">1</text>
        <text x="374" y="164" fontSize="13" fill="#52525b">x</text>
        <text x="215" y="21" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}

export function GraphsOfFunctionsNativeLesson() {
  return (
    <NotionLessonRenderer
      definition={NOTION_LESSON_DEFINITIONS.graphsOfFunctions}
      introduction={
        <p>
          Students must be able to sketch graphs of polynomials (including cubics and quartics),
          reciprocal functions <MathText>{String.raw`y=\frac ax`}</MathText> and
          <MathText>{String.raw`y=\frac a{x^2}`}</MathText>, and use intersection points to solve
          equations graphically. Proportional relationships and their graphical representations
          are also required.
        </p>
      }
    >

      <LessonSection title="Key Graph Types">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
            <p className="font-semibold text-zinc-950">Cubic:</p>
            <DisplayMath>{String.raw`y=ax^3+bx^2+cx+d`}</DisplayMath>
            <p>Shape depends on sign of <MathText>a</MathText> and number of turning points. Find roots by factorising.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
            <p className="font-semibold text-zinc-950">Quartic:</p>
            <DisplayMath>{String.raw`y=ax^4+\ldots`}</DisplayMath>
            <p>U-shape (when <MathText>{String.raw`a>0`}</MathText>) or inverted U (when <MathText>{String.raw`a<0`}</MathText>) for large <MathText>{String.raw`|x|`}</MathText>.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
            <p className="font-semibold text-zinc-950">Reciprocal:</p>
            <DisplayMath>{String.raw`y=\frac ax`}</DisplayMath>
            <p>Asymptotes at <MathText>{String.raw`x=0`}</MathText> and <MathText>{String.raw`y=0`}</MathText>.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
            <p className="font-semibold text-zinc-950">Translated reciprocal:</p>
            <DisplayMath>{String.raw`y=\frac a{x+p}+q`}</DisplayMath>
            <p>has asymptotes <MathText>{String.raw`x=-p`}</MathText>, <MathText>{String.raw`y=q`}</MathText>.</p>
          </div>
        </div>

        <div className="grid gap-5">
          <CubicGraph />
          <TranslatedReciprocalGraph />
        </div>

        <p>
          When sketching, always identify: roots (where the curve crosses or touches the
          <MathText>x</MathText>-axis), the <MathText>y</MathText>-intercept, turning points, and
          asymptotes (for rational functions).
        </p>
      </LessonSection>

      <LessonSection title="Worked Examples">
        <div className="rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            Sketch the graph of <MathText>{String.raw`y=x^2(2x-1)^2`}</MathText>, showing coordinates
            of all points where the curve meets the axes.
          </p>
          <div className="mt-6 space-y-5">
            <Step number={1} title="Find roots.">
              <p>
                Setting <MathText>{String.raw`y=0`}</MathText>:
                <MathText>{String.raw`x^2(2x-1)^2=0`}</MathText>, so
                <MathText>{String.raw`x=0`}</MathText> (repeated) or
                <MathText>{String.raw`x=\frac12`}</MathText> (repeated). The curve touches the
                <MathText>x</MathText>-axis at both roots.
              </p>
            </Step>
            <Step number={2} title="y-intercept:">
              <p>when <MathText>{String.raw`x=0`}</MathText>, <MathText>{String.raw`y=0`}</MathText>.</p>
            </Step>
            <Step number={3} title="Behaviour for large |x|:">
              <p>
                expanding gives leading term <MathText>{String.raw`4x^4`}</MathText>, so
                <MathText>{String.raw`y\to+\infty`}</MathText> as
                <MathText>{String.raw`x\to\pm\infty`}</MathText>.
              </p>
            </Step>
            <Step number={4} title="Describe the curve.">
              <p>
                The curve is a quartic that touches the axis at <MathText>{String.raw`x=0`}</MathText>
                and <MathText>{String.raw`x=\frac12`}</MathText>, is non-negative everywhere (since
                it is a product of squares), and has a local maximum between the two roots.
              </p>
            </Step>
          </div>
        </div>
      </LessonSection>

      <LessonSection title="Practice Questions">
        <ol className="space-y-5">
          <Question number={1}>
            Sketch the curve <MathText>{String.raw`y=(x+2)(x-1)(x-3)`}</MathText>, showing axis
            intercepts.
          </Question>
          <Question number={2}>
            Sketch the graph of <MathText>{String.raw`y=\frac3{x-2}+1`}</MathText>, stating the
            equations of the asymptotes.
          </Question>
          <Question number={3}>
            The circumference <MathText>C</MathText> of a circle is directly proportional to its
            diameter <MathText>d</MathText>. Express this relationship using the proportion symbol
            and describe the graph.
          </Question>
        </ol>
      </LessonSection>

      <LessonSection title="Solutions to Practice Questions">
        <div className="space-y-9">
          <div>
            <h3 className="font-semibold text-zinc-950">
              1. Sketch <MathText>{String.raw`y=(x+2)(x-1)(x-3)`}</MathText>, showing axis intercepts.
            </h3>
            <p className="mt-3">Roots: <MathText>{String.raw`x=-2`}</MathText>, <MathText>{String.raw`x=1`}</MathText>, <MathText>{String.raw`x=3`}</MathText> (all simple, so the curve crosses at each).</p>
            <p><MathText>y</MathText>-intercept: <MathText>{String.raw`y=(2)(-1)(-3)=6`}</MathText>.</p>
            <p>Leading term: <MathText>{String.raw`x^3`}</MathText> (positive), so the curve goes from bottom-left to top-right.</p>
            <p>
              The curve crosses the <MathText>x</MathText>-axis at <MathText>{String.raw`(-2,0)`}</MathText>,
              <MathText>{String.raw`(1,0)`}</MathText>, <MathText>{String.raw`(3,0)`}</MathText> and the
              <MathText>y</MathText>-axis at <MathText>{String.raw`(0,6)`}</MathText>, with the typical cubic S-shape.
            </p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              2. Sketch <MathText>{String.raw`y=\frac3{x-2}+1`}</MathText>, stating asymptotes.
            </h3>
            <p className="mt-3">This is a translated reciprocal. Vertical asymptote: <MathText>{String.raw`x=2`}</MathText>. Horizontal asymptote: <MathText>{String.raw`y=1`}</MathText>.</p>
            <p><MathText>y</MathText>-intercept: <MathText>{String.raw`y=\frac3{-2}+1=-\frac12`}</MathText>.</p>
            <p><MathText>x</MathText>-intercept:</p>
            <DisplayMath>{String.raw`0=\frac3{x-2}+1\implies\frac3{x-2}=-1\implies x=-1`}</DisplayMath>
            <p>
              The graph has two branches: one in the region <MathText>{String.raw`x<2`}</MathText>
              (below the horizontal asymptote approaching <MathText>{String.raw`y=1`}</MathText> from
              below as <MathText>{String.raw`x\to-\infty`}</MathText>, and tending to
              <MathText>{String.raw`-\infty`}</MathText> as <MathText>{String.raw`x\to2^-`}</MathText>)
              and one in <MathText>{String.raw`x>2`}</MathText> (approaching
              <MathText>{String.raw`+\infty`}</MathText> as <MathText>{String.raw`x\to2^+`}</MathText>
              and approaching <MathText>{String.raw`y=1`}</MathText> from above as
              <MathText>{String.raw`x\to+\infty`}</MathText>).
            </p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              3. <MathText>{String.raw`C\propto d`}</MathText>. Express and describe the graph.
            </h3>
            <p className="mt-3">
              <MathText>{String.raw`C=kd`}</MathText> where <MathText>k</MathText> is the constant of
              proportionality (here <MathText>{String.raw`k=\pi`}</MathText>). The graph of
              <MathText>C</MathText> against <MathText>d</MathText> is a straight line through the
              origin with gradient <MathText>{String.raw`\pi`}</MathText>.
            </p>
          </div>
        </div>
      </LessonSection>
    </NotionLessonRenderer>
  );
}
