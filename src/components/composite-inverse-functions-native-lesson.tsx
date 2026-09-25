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

function FunctionArrow({ label }: { label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1" aria-hidden="true">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <svg viewBox="0 0 52 8" className="h-2 w-full" preserveAspectRatio="none">
        <line x1="1" y1="4" x2="48" y2="4" stroke="#a1a1aa" strokeWidth="1.25" />
        <path d="M44 1L49 4L44 7" fill="none" stroke="#a1a1aa" strokeWidth="1.25" />
      </svg>
    </div>
  );
}

function FunctionPathwayDiagram() {
  return (
    <NativeLessonDiagram
      caption={
        <>
          Each composition is read from left to right. The function nearest
          <MathText>x</MathText> acts first.
        </>
      }
    >
      <div
        role="img"
        aria-label="Two function pathways: 2 passes through g to minus 1 and then through f to 1; x passes through f to 4 minus 3x squared and then through g to minus 5 over 6x squared plus 1"
        className="space-y-8 py-1"
      >
        <div>
          <p className="mb-4 text-center text-sm font-medium text-zinc-700">
            <MathText>{String.raw`fg(2)`}</MathText>
          </p>
          <div className="grid grid-cols-[minmax(0,1fr)_42px_minmax(0,1fr)_42px_minmax(0,1fr)] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)_52px_minmax(0,1fr)]">
            <p className="text-center text-lg text-zinc-900">
              <MathText>2</MathText>
            </p>
            <FunctionArrow label="g" />
            <p className="text-center text-lg text-zinc-900">
              <MathText>{String.raw`-1`}</MathText>
            </p>
            <FunctionArrow label="f" />
            <p className="text-center text-lg text-zinc-900">
              <MathText>1</MathText>
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-200/80 pt-6">
          <p className="mb-4 text-center text-sm font-medium text-zinc-700">
            <MathText>{String.raw`gf(x)`}</MathText>
          </p>
          <div className="grid grid-cols-[minmax(0,.7fr)_36px_minmax(0,1.5fr)_36px_minmax(0,1.5fr)] items-center gap-1 sm:grid-cols-[minmax(0,.7fr)_48px_minmax(0,1.5fr)_48px_minmax(0,1.5fr)]">
            <p className="text-center text-base text-zinc-900">
              <MathText>x</MathText>
            </p>
            <FunctionArrow label="f" />
            <p className="text-center text-base text-zinc-900">
              <MathText>{String.raw`4-3x^2`}</MathText>
            </p>
            <FunctionArrow label="g" />
            <p className="text-center text-base text-zinc-900">
              <MathText>{String.raw`-\frac5{6x^2+1}`}</MathText>
            </p>
          </div>
        </div>
      </div>
    </NativeLessonDiagram>
  );
}

function RestrictedParabolaDiagram() {
  return (
    <NativeLessonDiagram
      caption={
        <>
          On <MathText>{String.raw`0\le x\le5`}</MathText>, the vertex gives the minimum
          and the right endpoint gives the maximum: <MathText>{String.raw`-4\le f(x)\le12`}</MathText>.
        </>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label="Restricted upward parabola from x equals 0 to x equals 5, with vertex 1 comma minus 4, left endpoint 0 comma minus 3, and right endpoint 5 comma 12"
      >
        <line x1="54" y1="156" x2="366" y2="156" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="88" y1="220" x2="88" y2="26" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="130" y1="194" x2="130" y2="156" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="318" y1="48" x2="318" y2="156" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="45" y1="48" x2="45" y2="194" stroke="#a1a1aa" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="48" x2="50" y2="48" stroke="#71717a" strokeWidth="1.25" />
        <line x1="40" y1="194" x2="50" y2="194" stroke="#71717a" strokeWidth="1.25" />
        <path
          d="M88 184 Q202 232 318 48"
          fill="none"
          stroke="#18181b"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <circle cx="88" cy="184" r="3.5" fill="#18181b" />
        <circle cx="130" cy="194" r="3.5" fill="#18181b" />
        <circle cx="318" cy="48" r="3.5" fill="#18181b" />
        <text x="32" y="52" textAnchor="end" fontSize="12" fill="#52525b">12</text>
        <text x="32" y="198" textAnchor="end" fontSize="12" fill="#52525b">−4</text>
        <text x="78" y="142" textAnchor="end" fontSize="12" fill="#52525b">0</text>
        <text x="130" y="218" textAnchor="middle" fontSize="12" fill="#52525b">1</text>
        <text x="318" y="176" textAnchor="middle" fontSize="12" fill="#52525b">5</text>
        <text x="374" y="160" fontSize="13" fill="#52525b">x</text>
        <text x="95" y="21" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}

export function CompositeInverseFunctionsNativeLesson() {
  return (
    <NotionLessonRenderer
      definition={NOTION_LESSON_DEFINITIONS.compositeInverseFunctions}
      introduction={
        <p>
          A function <MathText>f</MathText> is a mapping from a set of inputs (the domain) to a set
          of outputs (the range), where each input maps to exactly one output. Functions may be
          one-to-one or many-to-one. Only one-to-one functions have inverses.
        </p>
      }
    >

      <LessonSection title="Composite Functions">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 sm:px-6 sm:py-4">
          <DisplayMath>{String.raw`fg(x)=f(g(x))`}</DisplayMath>
          <p className="text-center text-sm text-zinc-600">
            means “do <MathText>g</MathText> first, then <MathText>f</MathText>”.
          </p>
        </div>
        <p>
          The domain of <MathText>fg</MathText> is restricted to values of <MathText>x</MathText> in
          the domain of <MathText>g</MathText> for which <MathText>{String.raw`g(x)`}</MathText> lies
          in the domain of <MathText>f</MathText>.
        </p>
      </LessonSection>

      <LessonSection title="Inverse Functions">
        <p>
          If <MathText>f</MathText> is one-to-one, then <MathText>{String.raw`f^{-1}`}</MathText> exists
          and satisfies
        </p>
        <DisplayMath>{String.raw`f^{-1}(f(x))=f(f^{-1}(x))=x`}</DisplayMath>
        <div className="space-y-4 border-l-2 border-zinc-200 pl-4 sm:pl-5">
          <p>
            The graph of <MathText>{String.raw`y=f^{-1}(x)`}</MathText> is the reflection of
            <MathText>{String.raw`y=f(x)`}</MathText> in the line <MathText>{String.raw`y=x`}</MathText>.
          </p>
          <p>
            To find <MathText>{String.raw`f^{-1}`}</MathText>: Write
            <MathText>{String.raw`y=f(x)`}</MathText>, swap <MathText>x</MathText> and
            <MathText>y</MathText>, then rearrange for <MathText>y</MathText>.
          </p>
          <p>
            The domain of <MathText>{String.raw`f^{-1}`}</MathText> is the range of
            <MathText>f</MathText>, and vice versa.
          </p>
        </div>
      </LessonSection>

      <LessonSection title="Worked Examples">
        <div className="rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            <MathText>{String.raw`f(x)=4-3x^2,\ x\in\mathbb R`}</MathText>, and
            <MathText>{String.raw`g(x)=\frac5{2x-9},\ x\ne\frac92`}</MathText>.
          </p>
          <ol className="mt-4 space-y-1 pl-5 [list-style-type:lower-alpha]">
            <li>Find <MathText>{String.raw`fg(2)`}</MathText>.</li>
            <li>Find <MathText>{String.raw`g^{-1}(x)`}</MathText>.</li>
            <li>Find <MathText>{String.raw`gf(x)`}</MathText> as a simplified fraction.</li>
          </ol>

          <div className="mt-6 space-y-7 border-t border-zinc-200 pt-6">
            <div>
              <p className="font-semibold text-zinc-900">(a)</p>
              <p className="mt-2">First compute</p>
              <DisplayMath>{String.raw`g(2)=\frac5{4-9}=\frac5{-5}=-1`}</DisplayMath>
              <p>Then</p>
              <DisplayMath>{String.raw`fg(2)=f(-1)=4-3(-1)^2=4-3=1`}</DisplayMath>
            </div>

            <div className="border-t border-zinc-200 pt-6">
              <p className="font-semibold text-zinc-900">(b)</p>
              <p className="mt-2">
                Let <MathText>{String.raw`y=\frac5{2x-9}`}</MathText>. Swap <MathText>x</MathText> and
                <MathText>y</MathText>:
              </p>
              <DisplayMath>{String.raw`x=\frac5{2y-9}`}</DisplayMath>
              <p>Rearrange:</p>
              <DisplayMath>{String.raw`x(2y-9)=5`}</DisplayMath>
              <DisplayMath>{String.raw`2y-9=\frac5x`}</DisplayMath>
              <DisplayMath>{String.raw`y=\frac{5+9x}{2x}=\frac{9x+5}{2x}`}</DisplayMath>
              <p>Therefore</p>
              <DisplayMath>{String.raw`g^{-1}(x)=\frac{9x+5}{2x},\quad x\ne0`}</DisplayMath>
            </div>

            <div className="border-t border-zinc-200 pt-6">
              <p className="font-semibold text-zinc-900">(c)</p>
              <DisplayMath>
                {String.raw`gf(x)=g(f(x))=g(4-3x^2)=\frac5{2(4-3x^2)-9}`}
              </DisplayMath>
              <DisplayMath>{String.raw`=\frac5{8-6x^2-9}=\frac5{-6x^2-1}`}</DisplayMath>
              <p>Therefore</p>
              <DisplayMath>{String.raw`gf(x)=-\frac5{6x^2+1}`}</DisplayMath>
              <FunctionPathwayDiagram />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            <MathText>{String.raw`f:x\mapsto x^2-2x-3,\quad 0\le x\le5`}</MathText>. Find the range
            of <MathText>f</MathText>.
          </p>
          <div className="mt-5 space-y-5">
            <Step number={1} title="Complete the square.">
              <DisplayMath>{String.raw`f(x)=(x-1)^2-4`}</DisplayMath>
            </Step>
            <Step number={2} title="Find the value at the vertex.">
              <p>
                The vertex is at <MathText>{String.raw`x=1`}</MathText> (which lies in the domain
                <MathText>{String.raw`[0,5]`}</MathText>), giving
                <MathText>{String.raw`f(1)=-4`}</MathText>.
              </p>
            </Step>
            <Step number={3} title="Check the endpoints.">
              <p>
                <MathText>{String.raw`f(0)=-3`}</MathText> and
                <MathText>{String.raw`f(5)=25-10-3=12`}</MathText>.
              </p>
            </Step>
          </div>
          <RestrictedParabolaDiagram />
          <p className="mt-6">
            The minimum value is <MathText>{String.raw`-4`}</MathText> and the maximum value is
            <MathText>{String.raw`12`}</MathText>. The range is
            <MathText>{String.raw`-4\le f(x)\le12`}</MathText>.
          </p>
        </div>
      </LessonSection>

      <LessonSection title="Practice Questions">
        <ol className="space-y-5">
          <Question number={1}>
            <MathText>{String.raw`f(x)=2x+1`}</MathText>,
            <MathText>{String.raw`g(x)=x^2-3`}</MathText>. Find (a)
            <MathText>{String.raw`fg(x)`}</MathText>, (b) <MathText>{String.raw`gf(x)`}</MathText>,
            (c) show <MathText>{String.raw`fg(x)\ne gf(x)`}</MathText> in general.
          </Question>
          <Question number={2}>
            <MathText>{String.raw`h(x)=\frac{3x+3}{x-2},\ x\ne2`}</MathText>. Find
            <MathText>{String.raw`h^{-1}(x)`}</MathText> and state the value of <MathText>x</MathText>
            excluded from its domain.
          </Question>
          <Question number={3}>
            Explain why <MathText>{String.raw`g(x)=x^2,\ x\in\mathbb R`}</MathText> does not have an
            inverse, and state a restricted domain for which it would.
          </Question>
        </ol>
      </LessonSection>

      <LessonSection title="Solutions to Practice Questions">
        <div className="space-y-9">
          <div>
            <h3 className="font-semibold text-zinc-950">1.</h3>
            <p className="mt-3">
              (a) <MathText>{String.raw`fg(x)=f(x^2-3)=2(x^2-3)+1=2x^2-5`}</MathText>.
            </p>
            <p>
              (b) <MathText>{String.raw`gf(x)=g(2x+1)=(2x+1)^2-3=4x^2+4x-2`}</MathText>.
            </p>
            <p>
              (c) <MathText>{String.raw`fg(x)=2x^2-5\ne4x^2+4x-2=gf(x)`}</MathText> in general
              (e.g. at <MathText>{String.raw`x=1`}</MathText>:
              <MathText>{String.raw`fg(1)=-3`}</MathText>, <MathText>{String.raw`gf(1)=6`}</MathText>).
            </p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              2. <MathText>{String.raw`h(x)=\frac{3x+3}{x-2}`}</MathText>. Find
              <MathText>{String.raw`h^{-1}(x)`}</MathText>.
            </h3>
            <p className="mt-3">
              Let <MathText>{String.raw`y=\frac{3x+3}{x-2}`}</MathText>. Swap:
            </p>
            <DisplayMath>{String.raw`x=\frac{3y+3}{y-2}`}</DisplayMath>
            <p>Multiply:</p>
            <DisplayMath>{String.raw`x(y-2)=3y+3`}</DisplayMath>
            <DisplayMath>{String.raw`xy-2x=3y+3`}</DisplayMath>
            <DisplayMath>{String.raw`xy-3y=2x+3`}</DisplayMath>
            <p>Factor:</p>
            <DisplayMath>{String.raw`y(x-3)=2x+3`}</DisplayMath>
            <DisplayMath>{String.raw`y=\frac{2x+3}{x-3}`}</DisplayMath>
            <DisplayMath>{String.raw`h^{-1}(x)=\frac{2x+3}{x-3},\quad x\ne3`}</DisplayMath>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">3.</h3>
            <p className="mt-3">
              <MathText>{String.raw`g(x)=x^2,\ x\in\mathbb R`}</MathText>, is many-to-one (e.g.
              <MathText>{String.raw`g(2)=g(-2)=4`}</MathText>), so it has no inverse over the whole
              real line. Restricting to <MathText>{String.raw`x\ge0`}</MathText> (or
              <MathText>{String.raw`x\le0`}</MathText>) makes it one-to-one, allowing
              <MathText>{String.raw`g^{-1}(x)=\sqrt{x}`}</MathText> (or
              <MathText>{String.raw`-\sqrt{x}`}</MathText>).
            </p>
          </div>
        </div>
      </LessonSection>
    </NotionLessonRenderer>
  );
}
