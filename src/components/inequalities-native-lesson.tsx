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

function ParabolaDiagram({ direction }: { direction: "up" | "down" }) {
  const isUpward = direction === "up";

  return (
    <NativeLessonDiagram
      caption={
        <>
          <p className="font-medium text-zinc-700">
            {isUpward ? (
              <MathText>{String.raw`y=(x-2)(x-3)>0`}</MathText>
            ) : (
              <MathText>{String.raw`-(x-2)(x-3)\ge0`}</MathText>
            )}
          </p>
          <p className="mt-1">
            {isUpward ? (
              <MathText>{String.raw`x<2\text{ or }x>3`}</MathText>
            ) : (
              <MathText>{String.raw`2\le x\le3`}</MathText>
            )}
          </p>
        </>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label={
          isUpward
            ? "Upward-opening parabola crossing the x-axis at 2 and 3"
            : "Downward-opening parabola crossing the x-axis at 2 and 3"
        }
      >
        <line x1="42" y1="124" x2="366" y2="124" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="82" y1="214" x2="82" y2="28" stroke="#a1a1aa" strokeWidth="1.25" />
        <path
          d={isUpward ? "M120 34 Q200 264 280 34" : "M120 214 Q200 -16 280 214"}
          fill="none"
          stroke="#18181b"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <circle cx="160" cy="124" r="3.5" fill="#18181b" />
        <circle cx="240" cy="124" r="3.5" fill="#18181b" />
        <line x1="160" y1="119" x2="160" y2="129" stroke="#71717a" />
        <line x1="240" y1="119" x2="240" y2="129" stroke="#71717a" />
        <text x={isUpward ? 160 : 176} y="150" textAnchor="middle" fontSize="12" fill="#52525b">2</text>
        <text x={isUpward ? 240 : 224} y="150" textAnchor="middle" fontSize="12" fill="#52525b">3</text>
        <text x="374" y="128" fontSize="13" fill="#52525b">x</text>
        <text x="65" y="16" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}

export function InequalitiesNativeLesson() {
  return (
    <NotionLessonRenderer
      definition={NOTION_LESSON_DEFINITIONS.inequalities}
      introduction={
        <p>
          Linear inequalities are solved by the same algebraic steps as equations, remembering to
          reverse the inequality when multiplying or dividing by a negative number. Quadratic
          inequalities require sketching the parabola to identify the correct region.
        </p>
      }
    >

      <LessonSection title="Solving Quadratic Inequalities">
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-6">
          <Step number={1} title="Rearrange so that one side is zero." />
          <Step number={2} title="Factorise (or find roots by formula)." />
          <Step number={3} title="Sketch the parabola, noting where it crosses the x-axis." />
          <Step number={4} title="Read off the required region." />
        </div>

        <div className="rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">Set Notation:</p>
          <DisplayMath>
            {String.raw`x<a\text{ or }x>b\text{ is written }\{x:x<a\}\cup\{x:x>b\}`}
          </DisplayMath>
          <DisplayMath>
            {String.raw`c<x<d\text{ is written }\{x:c<x\}\cap\{x:x<d\}`}
          </DisplayMath>
        </div>

        <div className="grid gap-1">
          <ParabolaDiagram direction="up" />
          <ParabolaDiagram direction="down" />
        </div>
      </LessonSection>

      <LessonSection title="Worked Examples">
        <div className="rounded-xl border border-zinc-200 p-4 italic sm:p-6">
          <p>
            Solve <MathText>{String.raw`6\cos^2x+\sin x-5\ge0`}</MathText>... is an example of a
            quadratic inequality in a function of the unknown. Here we focus on purely algebraic
            inequalities.
          </p>
          <p>
            Solve <MathText>{String.raw`\frac{x}{a}<b`}</MathText> where
            <MathText>{String.raw`a>0`}</MathText>, and give an example of a fractional inequality
            reducing to a quadratic.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p>This illustrates that fractional inequalities can be reduced to linear or quadratic form.</p>
          <p>Consider:</p>
          <DisplayMath>{String.raw`\frac{3x+1}{x-2}\ge4\qquad(x\ne2)`}</DisplayMath>
          <p>
            Multiply both sides by <MathText>{String.raw`(x-2)^2`}</MathText> (which is always
            non-negative):
          </p>
          <DisplayMath>{String.raw`(3x+1)(x-2)\ge4(x-2)^2`}</DisplayMath>
          <p>This guarantees the inequality direction is preserved. Rearranging:</p>
          <DisplayMath>{String.raw`(3x+1)(x-2)-4(x-2)^2\ge0`}</DisplayMath>
          <DisplayMath>{String.raw`(x-2)[(3x+1)-4(x-2)]\ge0`}</DisplayMath>
          <DisplayMath>{String.raw`(x-2)(9-x)\ge0`}</DisplayMath>
          <p>
            Sketching the parabola (with roots at <MathText>{String.raw`x=2`}</MathText> and
            <MathText>{String.raw`x=9`}</MathText>, opening downward since the coefficient of
            <MathText>{String.raw`x^2`}</MathText> is negative), the expression is non-negative when
            <MathText>{String.raw`2\le x\le9`}</MathText>.
          </p>
          <p>
            Since <MathText>{String.raw`x\ne2`}</MathText>, the solution is
            <MathText>{String.raw`2<x\le9`}</MathText>, or
            <MathText>{String.raw`\{x:2<x\le9\}`}</MathText>.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            Solve the inequality <MathText>{String.raw`x^2-73x+1200<0`}</MathText>.
          </p>
          <div className="mt-6 space-y-5">
            <Step number={1} title="Find the roots using the quadratic formula:">
              <DisplayMath>{String.raw`x=\frac{73\pm\sqrt{73^2-4(1200)}}2`}</DisplayMath>
              <DisplayMath>{String.raw`=\frac{73\pm\sqrt{5329-4800}}2`}</DisplayMath>
              <DisplayMath>{String.raw`=\frac{73\pm\sqrt{529}}2`}</DisplayMath>
              <DisplayMath>{String.raw`=\frac{73\pm23}{2}`}</DisplayMath>
              <p>
                So <MathText>{String.raw`x=48`}</MathText> or <MathText>{String.raw`x=25`}</MathText>.
              </p>
            </Step>
            <Step number={2} title="The parabola opens upward (positive x² coefficient). It is below the x-axis between the roots.">
              <p>
                Therefore <MathText>{String.raw`25<x<48`}</MathText>, or equivalently
                <MathText>{String.raw`\{x:25<x<48\}`}</MathText>.
              </p>
            </Step>
          </div>
        </div>
      </LessonSection>

      <LessonSection title="Practice Questions">
        <ol className="space-y-5">
          <Question number={1}>
            Solve <MathText>{String.raw`2x^2-x-15\le0`}</MathText>, expressing your answer in set
            notation.
          </Question>
          <Question number={2}>
            Find the set of values of <MathText>x</MathText> for which both
            <MathText>{String.raw`3x-7>2`}</MathText> and
            <MathText>{String.raw`x^2-9x+14<0`}</MathText>.
          </Question>
          <Question number={3}>
            Solve <MathText>{String.raw`\frac2{x+1}>3`}</MathText>,
            <MathText>{String.raw`x\ne-1`}</MathText>.
          </Question>
        </ol>
      </LessonSection>

      <LessonSection title="Solutions to Practice Questions">
        <div className="space-y-9">
          <div>
            <h3 className="font-semibold text-zinc-950">
              1. Solve <MathText>{String.raw`2x^2-x-15\le0`}</MathText>.
            </h3>
            <p className="mt-3">
              Factorise: <MathText>{String.raw`2x^2-x-15=(2x+5)(x-3)`}</MathText>.
            </p>
            <p>
              The roots are <MathText>{String.raw`x=-\frac52`}</MathText> and
              <MathText>{String.raw`x=3`}</MathText>. Since the parabola opens upward, it is
              non-positive between the roots:
            </p>
            <DisplayMath>{String.raw`\left\{x:-\frac52\le x\le3\right\}`}</DisplayMath>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              2. Find the set of values of <MathText>x</MathText> for which both
              <MathText>{String.raw`3x-7>2`}</MathText> and
              <MathText>{String.raw`x^2-9x+14<0`}</MathText>.
            </h3>
            <p className="mt-3">
              Linear inequality: <MathText>{String.raw`3x-7>2\implies3x>9\implies x>3`}</MathText>.
            </p>
            <p>
              Quadratic inequality: <MathText>{String.raw`x^2-9x+14<0`}</MathText>. Factorise:
              <MathText>{String.raw`(x-2)(x-7)<0`}</MathText>.
            </p>
            <p>
              The parabola is below the axis between the roots: <MathText>{String.raw`2<x<7`}</MathText>.
            </p>
            <p>
              Intersection: <MathText>{String.raw`x>3`}</MathText> and
              <MathText>{String.raw`2<x<7`}</MathText> gives <MathText>{String.raw`3<x<7`}</MathText>,
              i.e. <MathText>{String.raw`\{x:3<x<7\}`}</MathText>.
            </p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              3. Solve <MathText>{String.raw`\frac2{x+1}>3`}</MathText>,
              <MathText>{String.raw`x\ne-1`}</MathText>.
            </h3>
            <p className="mt-3">
              Rearrange: <MathText>{String.raw`\frac2{x+1}-3>0`}</MathText>, so
              <MathText>{String.raw`\frac{2-3(x+1)}{x+1}>0`}</MathText>, giving
              <MathText>{String.raw`\frac{-3x-1}{x+1}>0`}</MathText>.
            </p>
            <p>
              Multiply the entire inequality by −1 (reversing the inequality):
              <MathText>{String.raw`\frac{3x+1}{x+1}<0`}</MathText>.
            </p>
            <p>
              The critical values are <MathText>{String.raw`x=-\frac13`}</MathText> and
              <MathText>{String.raw`x=-1`}</MathText>. Testing signs:
            </p>
            <p>
              The expression is negative when <MathText>{String.raw`-1<x<-\frac13`}</MathText>.
            </p>
            <p>
              Solution: <MathText>{String.raw`\left\{x:-1<x<-\frac13\right\}`}</MathText>.
            </p>
          </div>
        </div>
      </LessonSection>
    </NotionLessonRenderer>
  );
}
