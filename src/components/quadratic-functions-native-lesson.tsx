"use client";

import {
  DisplayMath,
  LessonSection,
  MathText,
  NotionLessonRenderer,
  Question,
  Step,
} from "@/components/notion-lesson-renderer";
import {
  NativeDiagramLegend,
  NativeDiagramLegendItem,
  NativeLessonDiagram,
  NativePlotSvg,
} from "@/components/native-lesson-diagram";
import { NOTION_LESSON_DEFINITIONS } from "@/content/notion-lessons/definitions";

function DiscriminantCasesDiagram() {
  return (
    <NativeLessonDiagram caption="The discriminant determines how many times a quadratic graph meets the x-axis.">
      <NativePlotSvg
        role="img"
        aria-label="Three upward parabolas showing two x-axis intersections when delta is positive, one tangent intersection when delta is zero, and no intersections when delta is negative"
      >
        {[65, 198, 331].map((x) => (
          <line key={`y-${x}`} x1={x} y1="38" x2={x} y2="172" stroke="#d4d4d8" strokeWidth="1.25" />
        ))}
        <line x1="10" y1="130" x2="120" y2="130" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="143" y1="130" x2="253" y2="130" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="276" y1="130" x2="390" y2="130" stroke="#a1a1aa" strokeWidth="1.25" />

        <path d="M20 35 Q65 275 110 35" fill="none" stroke="#18181b" strokeWidth="2.25" />
        <circle cx="45" cy="130" r="3.25" fill="#18181b" />
        <circle cx="85" cy="130" r="3.25" fill="#18181b" />

        <path d="M153 35 Q198 225 243 35" fill="none" stroke="#18181b" strokeWidth="2.25" />
        <circle cx="198" cy="130" r="3.25" fill="#18181b" />

        <path d="M286 35 Q331 170 376 35" fill="none" stroke="#18181b" strokeWidth="2.25" />

        <text x="124" y="134" fontSize="12" fill="#52525b">x</text>
        <text x="257" y="134" fontSize="12" fill="#52525b">x</text>
        <text x="393" y="134" fontSize="12" fill="#52525b">x</text>
        <text x="72" y="34" fontSize="12" fill="#52525b">y</text>
        <text x="205" y="34" fontSize="12" fill="#52525b">y</text>
        <text x="338" y="34" fontSize="12" fill="#52525b">y</text>

        <text x="65" y="204" textAnchor="middle" fontSize="13" fill="#3f3f46">Δ &gt; 0</text>
        <text x="198" y="204" textAnchor="middle" fontSize="13" fill="#3f3f46">Δ = 0</text>
        <text x="331" y="204" textAnchor="middle" fontSize="13" fill="#3f3f46">Δ &lt; 0</text>
        <text x="65" y="228" textAnchor="middle" fontSize="12" fill="#71717a">two distinct roots</text>
        <text x="198" y="228" textAnchor="middle" fontSize="12" fill="#71717a">one repeated root</text>
        <text x="331" y="228" textAnchor="middle" fontSize="12" fill="#71717a">no real roots</text>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}

function CompletedSquareMinimumDiagram() {
  return (
    <NativeLessonDiagram
      caption={
        <>
          The vertex is <MathText>{String.raw`(-1,7)`}</MathText>, so the minimum value is 7.
        </>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label="Graph of y equals 2 times x plus 1 squared plus 7, with minimum point minus 1 comma 7"
      >
        <line x1="42" y1="200" x2="366" y2="200" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="58" y1="220" x2="58" y2="24" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="58" y1="90" x2="160" y2="90" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="160" y1="90" x2="160" y2="200" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <path d="M70 25 Q160 155 250 25" fill="none" stroke="#18181b" strokeWidth="2.25" />
        <circle cx="160" cy="90" r="3.5" fill="#18181b" />
        <text x="46" y="94" textAnchor="end" fontSize="12" fill="#52525b">7</text>
        <text x="160" y="220" textAnchor="middle" fontSize="12" fill="#52525b">−1</text>
        <text x="374" y="204" fontSize="13" fill="#52525b">x</text>
        <text x="45" y="16" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}

function RepeatedRootsDiagram() {
  return (
    <NativeLessonDiagram caption="Each repeated root is the single point where its parabola touches the x-axis.">
      <NativePlotSvg
        role="img"
        aria-label="Two parabolas tangent to the x-axis, at x equals minus 3 when k equals 7 and at x equals 1 when k equals minus 1"
      >
        <line x1="10" y1="170" x2="190" y2="170" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="90" y1="188" x2="90" y2="28" stroke="#d4d4d8" strokeWidth="1.25" />
        <path d="M10 50 Q50 290 90 50" fill="none" stroke="#18181b" strokeWidth="2.25" />
        <circle cx="50" cy="170" r="3.5" fill="#18181b" />
        <text x="50" y="193" textAnchor="middle" fontSize="12" fill="#52525b">−3</text>
        <text x="194" y="174" fontSize="12" fill="#52525b">x</text>
        <text x="97" y="24" fontSize="12" fill="#52525b">y</text>

        <line x1="210" y1="170" x2="390" y2="170" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="265" y1="188" x2="265" y2="28" stroke="#d4d4d8" strokeWidth="1.25" />
        <path d="M260 50 Q300 290 340 50" fill="none" stroke="#18181b" strokeWidth="2.25" />
        <circle cx="300" cy="170" r="3.5" fill="#18181b" />
        <text x="300" y="193" textAnchor="middle" fontSize="12" fill="#52525b">1</text>
        <text x="393" y="174" fontSize="12" fill="#52525b">x</text>
        <text x="272" y="24" fontSize="12" fill="#52525b">y</text>
      </NativePlotSvg>
      <NativeDiagramLegend>
        <NativeDiagramLegendItem><MathText>{String.raw`k=7:\ (x+3)^2=0`}</MathText></NativeDiagramLegendItem>
        <NativeDiagramLegendItem><MathText>{String.raw`k=-1:\ (x-1)^2=0`}</MathText></NativeDiagramLegendItem>
      </NativeDiagramLegend>
    </NativeLessonDiagram>
  );
}

function PositiveQuadraticDiagram() {
  return (
    <NativeLessonDiagram
      caption={
        <>
          The minimum point is <MathText>{String.raw`(3,1)`}</MathText>, which remains above the
          horizontal axis.
        </>
      }
    >
      <NativePlotSvg
        role="img"
        aria-label="Graph of y equals n minus 3 squared plus 1, with minimum point 3 comma 1 above the horizontal axis"
      >
        <line x1="42" y1="190" x2="366" y2="190" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="64" y1="214" x2="64" y2="24" stroke="#a1a1aa" strokeWidth="1.25" />
        <line x1="64" y1="110" x2="220" y2="110" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="220" y1="110" x2="220" y2="190" stroke="#d4d4d8" strokeWidth="1.25" strokeDasharray="4 4" />
        <path d="M110 30 Q220 190 330 30" fill="none" stroke="#18181b" strokeWidth="2.25" />
        <circle cx="220" cy="110" r="3.5" fill="#18181b" />
        <text x="52" y="114" textAnchor="end" fontSize="12" fill="#52525b">1</text>
        <text x="220" y="212" textAnchor="middle" fontSize="12" fill="#52525b">3</text>
        <text x="374" y="194" fontSize="13" fill="#52525b">n</text>
        <text x="71" y="20" fontSize="13" fill="#52525b">y</text>
      </NativePlotSvg>
    </NativeLessonDiagram>
  );
}


export function QuadraticFunctionsNativeLesson() {
  return (
    <NotionLessonRenderer
      definition={NOTION_LESSON_DEFINITIONS.quadraticFunctions}
      introduction={
        <p>
          Quadratic functions take the form
          <MathText>{String.raw`f(x)=ax^2+bx+c`}</MathText> where <MathText>{String.raw`a\ne0`}</MathText>.
          Their graphs are parabolas — opening upward when <MathText>{String.raw`a>0`}</MathText> and
          downward when <MathText>{String.raw`a<0`}</MathText>. Three key skills are completing the
          square, using the discriminant, and solving quadratic equations.
        </p>
      }
    >

      <LessonSection title="Completing the Square">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 sm:px-6 sm:py-4">
          <DisplayMath>
            {String.raw`ax^2+bx+c=a\left(x+\frac{b}{2a}\right)^2+c-\frac{b^2}{4a}`}
          </DisplayMath>
        </div>
      </LessonSection>

      <LessonSection title="The Quadratic Formula">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 sm:px-6 sm:py-4">
          <p>
            If <MathText>{String.raw`ax^2+bx+c=0`}</MathText>, then
          </p>
          <DisplayMath>{String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`}</DisplayMath>
        </div>
      </LessonSection>

      <LessonSection title="The Discriminant Δ = b² − 4ac">
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <div className="grid grid-cols-[95px_minmax(0,1fr)] border-b border-zinc-200 px-4 py-3 sm:px-6">
            <MathText>{String.raw`\Delta>0`}</MathText>
            <span>two distinct real roots</span>
          </div>
          <div className="grid grid-cols-[95px_minmax(0,1fr)] border-b border-zinc-200 px-4 py-3 sm:px-6">
            <MathText>{String.raw`\Delta=0`}</MathText>
            <span>one repeated root</span>
          </div>
          <div className="grid grid-cols-[95px_minmax(0,1fr)] px-4 py-3 sm:px-6">
            <MathText>{String.raw`\Delta<0`}</MathText>
            <span>no real roots</span>
          </div>
        </div>

        <p>
          When a quadratic equation involves a function of the unknown (for example,
          <MathText>{String.raw`e^{2x}-3e^x+2=0`}</MathText> is quadratic in
          <MathText>{String.raw`e^x`}</MathText>), make an appropriate substitution to reveal the
          quadratic structure.
        </p>

        <DiscriminantCasesDiagram />
      </LessonSection>

      <LessonSection title="Worked Examples">
        <div className="rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            Write <MathText>{String.raw`2x^2+4x+9`}</MathText> in the form
            <MathText>{String.raw`a(x+b)^2+c`}</MathText> and hence state the minimum value of the
            function.
          </p>

          <div className="mt-6 space-y-5">
            <Step number={1} title="Factor out the coefficient of x²:">
              <DisplayMath>{String.raw`2x^2+4x+9=2(x^2+2x)+9`}</DisplayMath>
            </Step>
            <Step number={2} title="Complete the square inside the bracket:">
              <DisplayMath>
                {String.raw`=2[(x+1)^2-1]+9=2(x+1)^2-2+9=2(x+1)^2+7`}
              </DisplayMath>
            </Step>
            <Step number={3} title="Identify the minimum.">
              <p>
                Since <MathText>{String.raw`(x+1)^2\ge0`}</MathText> for all
                <MathText>x</MathText>, the minimum value is 7, occurring when
                <MathText>{String.raw`x=-1`}</MathText>.
              </p>
            </Step>
          </div>
        </div>

        <CompletedSquareMinimumDiagram />

        <div className="mt-6 rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            The equation <MathText>{String.raw`x^2+(k-1)x+k+2=0`}</MathText> has two equal roots.
            Find the possible values of <MathText>k</MathText> and the corresponding solutions.
          </p>

          <div className="mt-6 space-y-5">
            <Step number={1} title="For equal (repeated) roots, set the discriminant equal to zero.">
              <DisplayMath>{String.raw`\Delta=(k-1)^2-4(1)(k+2)=0`}</DisplayMath>
            </Step>
            <Step number={2} title="Expand and solve:">
              <DisplayMath>{String.raw`k^2-2k+1-4k-8=0`}</DisplayMath>
              <DisplayMath>{String.raw`k^2-6k-7=0`}</DisplayMath>
              <DisplayMath>{String.raw`(k-7)(k+1)=0`}</DisplayMath>
              <p>
                So <MathText>{String.raw`k=7`}</MathText> or <MathText>{String.raw`k=-1`}</MathText>.
              </p>
            </Step>
            <Step number={3} title="Find the repeated root for each value.">
              <p>
                The repeated root is <MathText>{String.raw`x=-\frac{k-1}{2}`}</MathText>.
              </p>
              <p>
                When <MathText>{String.raw`k=7`}</MathText>: <MathText>{String.raw`x=-3`}</MathText>.
                When <MathText>{String.raw`k=-1`}</MathText>: <MathText>{String.raw`x=1`}</MathText>.
              </p>
            </Step>
          </div>
        </div>

        <RepeatedRootsDiagram />

        <div className="mt-6 rounded-xl border border-zinc-200 p-4 sm:p-6">
          <p className="font-semibold text-zinc-950">
            Show that <MathText>{String.raw`n^2-6n+10`}</MathText> is positive for all values of
            <MathText>n</MathText>.
          </p>
          <p className="mt-5">Complete the square:</p>
          <DisplayMath>{String.raw`n^2-6n+10=(n-3)^2-9+10=(n-3)^2+1`}</DisplayMath>
          <p>
            Since <MathText>{String.raw`(n-3)^2\ge0`}</MathText> for all <MathText>n</MathText>, it
            follows that <MathText>{String.raw`(n-3)^2+1\ge1>0`}</MathText> for all
            <MathText>n</MathText>.
          </p>
        </div>

        <PositiveQuadraticDiagram />
      </LessonSection>

      <LessonSection title="Practice Questions">
        <ol className="space-y-5">
          <Question number={1}>
            The equation <MathText>{String.raw`kx^2+6x+k=0`}</MathText> has no real roots. Find the
            set of values of <MathText>k</MathText>.
          </Question>
          <Question number={2}>
            By completing the square, find the range of the function
            <MathText>{String.raw`f(x)=3x^2-12x+5,\ x\in\mathbb R`}</MathText>.
          </Question>
          <Question number={3}>
            Solve <MathText>{String.raw`e^{2x}-5e^x+6=0`}</MathText>, giving your answers as exact
            values.
          </Question>
          <Question number={4}>
            <MathText>{String.raw`(2x+3)^2-(4-x)^2=45`}</MathText>. Solve for <MathText>x</MathText>.
          </Question>
        </ol>
      </LessonSection>

      <LessonSection title="Solutions to Practice Questions">
        <div className="space-y-9">
          <div>
            <h3 className="font-semibold text-zinc-950">
              1. The equation <MathText>{String.raw`kx^2+6x+k=0`}</MathText> has no real roots.
              Find the set of values of <MathText>k</MathText>.
            </h3>
            <p className="mt-3">
              For no real roots, <MathText>{String.raw`\Delta<0`}</MathText> (and
              <MathText>{String.raw`k\ne0`}</MathText> for it to be quadratic):
            </p>
            <DisplayMath>{String.raw`6^2-4(k)(k)<0`}</DisplayMath>
            <DisplayMath>{String.raw`36-4k^2<0`}</DisplayMath>
            <DisplayMath>{String.raw`4k^2>36`}</DisplayMath>
            <DisplayMath>{String.raw`k^2>9`}</DisplayMath>
            <p>
              So <MathText>{String.raw`k>3`}</MathText> or <MathText>{String.raw`k<-3`}</MathText>,
              i.e. <MathText>{String.raw`\{k:k<-3\}\cup\{k:k>3\}`}</MathText>.
            </p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              2. By completing the square, find the range of
              <MathText>{String.raw`f(x)=3x^2-12x+5`}</MathText>.
            </h3>
            <p className="mt-3">Factor out 3 from the <MathText>x</MathText> terms:</p>
            <DisplayMath>{String.raw`3x^2-12x+5=3(x^2-4x)+5`}</DisplayMath>
            <DisplayMath>{String.raw`=3[(x-2)^2-4]+5`}</DisplayMath>
            <DisplayMath>{String.raw`=3(x-2)^2-12+5`}</DisplayMath>
            <DisplayMath>{String.raw`=3(x-2)^2-7`}</DisplayMath>
            <p>
              Since <MathText>{String.raw`(x-2)^2\ge0`}</MathText>, the minimum value is −7. The
              range is <MathText>{String.raw`f(x)\ge-7`}</MathText>.
            </p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              3. Solve <MathText>{String.raw`e^{2x}-5e^x+6=0`}</MathText>, giving exact values.
            </h3>
            <p className="mt-3">
              Let <MathText>{String.raw`u=e^x`}</MathText>, so <MathText>{String.raw`e^{2x}=u^2`}</MathText>.
              The equation becomes:
            </p>
            <DisplayMath>{String.raw`u^2-5u+6=0`}</DisplayMath>
            <DisplayMath>{String.raw`(u-2)(u-3)=0`}</DisplayMath>
            <p>
              So <MathText>{String.raw`u=2`}</MathText> or <MathText>{String.raw`u=3`}</MathText>,
              giving <MathText>{String.raw`e^x=2`}</MathText> or <MathText>{String.raw`e^x=3`}</MathText>.
            </p>
            <p>
              Therefore <MathText>{String.raw`x=\ln2`}</MathText> or
              <MathText>{String.raw`x=\ln3`}</MathText>.
            </p>
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h3 className="font-semibold text-zinc-950">
              4. <MathText>{String.raw`(2x+3)^2-(4-x)^2=45`}</MathText>. Solve for
              <MathText>x</MathText>.
            </h3>
            <div className="mt-5 space-y-5">
              <Step number={1} title="Expand each square:">
                <DisplayMath>{String.raw`(2x+3)^2=4x^2+12x+9`}</DisplayMath>
                <DisplayMath>{String.raw`(4-x)^2=16-8x+x^2`}</DisplayMath>
              </Step>
              <Step number={2} title="Subtract and simplify:">
                <DisplayMath>{String.raw`4x^2+12x+9-16+8x-x^2=45`}</DisplayMath>
                <DisplayMath>{String.raw`3x^2+20x-7=45`}</DisplayMath>
                <DisplayMath>{String.raw`3x^2+20x-52=0`}</DisplayMath>
              </Step>
              <Step number={3} title="Factorise (or use the formula):">
                <DisplayMath>{String.raw`(3x+26)(x-2)=0`}</DisplayMath>
                <p>
                  So <MathText>{String.raw`x=2`}</MathText> or
                  <MathText>{String.raw`x=-\frac{26}{3}`}</MathText>.
                </p>
              </Step>
            </div>
          </div>
        </div>
      </LessonSection>
    </NotionLessonRenderer>
  );
}
