import { nativeLesson, p, m, group, example } from "./authoring.ts";
import type { LessonBlock, LessonDrawing } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson("Mechanics", "Chapter 2: Constant Acceleration", title, blocks);
const diagram = (description: string, drawing: LessonDrawing): LessonBlock => ({
  type: "diagram",
  description,
  drawing,
});
const graph = (
  description: string,
  points: [number, number][],
  xMax: number,
  yMax: number,
  xTicks: number[],
  yTicks: { value: number; label: string }[],
  caption: string[],
  displacement = false,
) =>
  diagram(description, {
    type: "motion-graph",
    points,
    xMax,
    yMax,
    xLabel: raw`t/\mathrm s`,
    yLabel: displacement ? raw`s/\mathrm m` : raw`v/\mathrm{m\,s^{-1}}`,
    xTicks: xTicks.map((value) => ({ value, label: String(value) })),
    yTicks,
    shade: !displacement,
    caption,
  });
export const MECHANICS_CONSTANT_ACCELERATION_LESSONS = [
  lesson("2.1 Velocity-Time Graphs", [
    group("Key Properties", [
      p("Displacement–time graph:"),
      p("Gradient = velocity."),
      p("Velocity–time graph:"),
      p("Gradient = acceleration."),
      p("Area under graph = displacement."),
    ]),
    p(
      "A typical three-phase motion: accelerate, constant velocity, decelerate.",
    ),
    graph(
      "Schematic velocity–time graph: linear acceleration from rest to maximum velocity, a constant-velocity plateau, then linear deceleration to rest. The shaded area is displacement s. The phases have a>0, a=0 and a<0 respectively.",
      [
        [0, 0],
        [2, 1],
        [7, 1],
        [9, 0],
      ],
      10,
      1.3,
      [],
      [{ value: 1, label: raw`v_{\max}` }],
      ["a>0", "a=0", "a<0", raw`\text{Area}=s`],
    ),
    group("Worked Example 1", [
      p(
        raw`A car starts from rest and accelerates uniformly to $20\text{ m s}^{-1}$ in 10 s, travels at this speed for 15 s, then decelerates uniformly to rest in 5 s. Find the total distance and deceleration.`,
      ),
      graph(
        "Car velocity–time graph through (0,0), (10,20), (25,20), (30,0), with time in seconds and velocity in metres per second. The three phase areas are 100 m, 300 m and 50 m.",
        [
          [0, 0],
          [10, 20],
          [25, 20],
          [30, 0],
        ],
        34,
        25,
        [10, 25, 30],
        [{ value: 20, label: "20" }],
        [raw`100\text{ m}`, raw`300\text{ m}`, raw`50\text{ m}`],
      ),
      p("Total distance = area under graph:"),
      m(raw`\frac12(10)(20)+(15)(20)+\frac12(5)(20)=100+300+50=450\text{ m}`),
      p(raw`Deceleration $=\frac{|0-20|}{5}=4\text{ m s}^{-2}$.`),
    ]),
    group("Worked Example 2", [
      p(
        raw`A speed–time graph models a 200 m race completed in 24 s. The athlete starts from rest, accelerates uniformly to $10\text{ m s}^{-1}$ at $t=4$ s, runs at this speed until $t=18$ s, then decelerates uniformly to speed $U$ at $t=24$ s. Find $U$.`,
      ),
      graph(
        "Athlete speed–time graph through (0,0), (4,10), (18,10), (24,U). The final speed U is 10/3 m s⁻¹; it remains labelled U as in the problem. The phase areas are 20 m, 140 m and 40 m.",
        [
          [0, 0],
          [4, 10],
          [18, 10],
          [24, 10 / 3],
        ],
        28,
        13,
        [4, 18, 24],
        [
          { value: 10, label: "10" },
          { value: 10 / 3, label: "U" },
        ],
        [raw`20\text{ m}`, raw`140\text{ m}`, raw`40\text{ m}`],
      ),
      p(
        raw`Phase 1 area: $\frac12(4)(10)=20$ m. Phase 2 area: $(14)(10)=140$ m.`,
      ),
      p("Total so far: 160 m. Remaining $=200-160=40$ m in the final 6 s."),
      p(
        "The final phase is a trapezium with parallel sides 10 and $U$, width 6:",
      ),
      m(
        raw`\frac12(10+U)(6)=40\implies10+U=\frac{40}{3}\implies U=\frac{10}{3}\approx3.33\text{ m s}^{-1}`,
      ),
    ]),
    group("Practice Questions", [
      p(
        raw`1. A train accelerates from $5\text{ m s}^{-1}$ to $25\text{ m s}^{-1}$ in 20 s, runs at $25\text{ m s}^{-1}$ for 60 s, then decelerates to rest in 10 s. Sketch the v–t graph and find the total distance.`,
      ),
      p(
        raw`2. A cyclist travels 100 m in 20 s, decelerating uniformly from $u$ to $3\text{ m s}^{-1}$. Find $u$.`,
      ),
      p(
        "3. A particle has displacement–time graph with a straight line from $(0,0)$ to $(4,20)$, then horizontal to $(10,20)$. Describe the motion and find the velocity in the first phase.",
      ),
    ]),
    group("Practice Solutions", [
      example([
        p(
          raw`1. Train: $5\to25$ in 20 s, constant for 60 s, $25\to0$ in 10 s.`,
        ),
        graph(
          "Train velocity–time graph through (0,5), (20,25), (80,25), (90,0). The phase areas are 300, 1500 and 125 square graph units, giving metres of displacement.",
          [
            [0, 5],
            [20, 25],
            [80, 25],
            [90, 0],
          ],
          102,
          31,
          [20, 80, 90],
          [
            { value: 5, label: "5" },
            { value: 25, label: "25" },
          ],
          ["300", "1500", "125"],
        ),
        m(
          raw`\frac12(5+25)(20)+25(60)+\frac12(25)(10)=300+1500+125=1925\text{ m}.`,
        ),
      ]),
      p(
        raw`2. Trapezium area = displacement: $\frac12(u+3)(20)=100$. $u+3=10$, so $u=7\text{ m s}^{-1}$.`,
      ),
      example([
        p(
          raw`3. First phase: gradient $=20/4=5\text{ m s}^{-1}$. Second phase: horizontal line means stationary.`,
        ),
        graph(
          "Displacement–time graph from (0,0) to (4,20), then horizontal to (10,20). The first gradient is 5 m s⁻¹; displacement then stays at 20 m.",
          [
            [0, 0],
            [4, 20],
            [10, 20],
          ],
          12,
          25,
          [4, 10],
          [{ value: 20, label: "20" }],
          [],
          true,
        ),
      ]),
    ]),
  ]),
  lesson("2.2 The SUVAT Equations", [
    group("The Five SUVAT Equations", [
      m(raw`1.\quad v=u+at`),
      m(raw`2.\quad s=\left(\frac{u+v}{2}\right)t`),
      m(raw`3.\quad s=ut+\frac12at^2`),
      m(raw`4.\quad s=vt-\frac12at^2`),
      m(raw`5.\quad v^2=u^2+2as`),
      p(
        "$s=$ displacement, $u=$ initial velocity, $v=$ final velocity, $a=$ acceleration, $t=$ time.",
      ),
      p(
        "Each equation uses four of the five. Identify the three knowns and the one unknown you want, then pick the equation.",
      ),
    ]),
    p("The standard SUVAT particle diagram:"),
    diagram(
      "Particle at Start with rightward initial velocity u and at End with rightward final velocity v. Displacement s is between the two positions; acceleration a points right and the elapsed time is t.",
      {
        type: "suvat",
        initial: "u",
        final: "v",
        displacement: "s",
        acceleration: "a",
        labels: true,
        time: raw`\text{time}=t`,
      },
    ),
    group("Worked Example 3", [
      p(
        raw`A car travelling at $25\text{ m s}^{-1}$ brakes, decelerating uniformly at $5\text{ m s}^{-2}$. Find the stopping time and braking distance.`,
      ),
      diagram(
        "Braking car: initial rightward velocity u=25, final velocity v=0, unknown displacement s, and leftward acceleration labelled a=−5.",
        {
          type: "suvat",
          initial: "u=25",
          final: "v=0",
          finalArrow: false,
          displacement: "s=?",
          acceleration: "a=-5",
          accelerationDirection: "left",
        },
      ),
      p("Known: $u=25$, $v=0$, $a=-5$."),
      p(raw`Time: $v=u+at$: $0=25-5t\implies t=5$ s.`),
      p(raw`Distance: $v^2=u^2+2as$: $0=625-10s\implies s=62.5$ m.`),
    ]),
    group("Worked Example 4", [
      p(
        raw`A particle accelerates uniformly from $8\text{ m s}^{-1}$ to $20\text{ m s}^{-1}$ over a distance of 56 m. Find the acceleration and time taken.`,
      ),
      diagram(
        "Particle moving right: initial velocity u=8, final velocity v=20, displacement s=56 m and unknown rightward acceleration a.",
        {
          type: "suvat",
          initial: "u=8",
          final: "v=20",
          displacement: raw`s=56\text{ m}`,
          acceleration: "a=?",
        },
      ),
      p(raw`$v^2=u^2+2as$: $400=64+112a\implies a=3\text{ m s}^{-2}$.`),
      p(raw`$v=u+at$: $20=8+3t\implies t=4$ s.`),
    ]),
    group("Practice Questions", [
      p(
        raw`1. A particle accelerates from rest at $3.2\text{ m s}^{-2}$. Find the speed and distance after 5 s.`,
      ),
      p(
        raw`2. A train decelerates from $30\text{ m s}^{-1}$ to rest in 450 m. Find the deceleration and time.`,
      ),
      p(
        raw`3. A car travelling at $30\text{ m s}^{-1}$ decelerates at $2\text{ m s}^{-2}$. Find the distance travelled when the speed is $10\text{ m s}^{-1}$.`,
      ),
    ]),
    group("Practice Solutions", [
      example([
        p("1. $u=0$, $a=3.2$, $t=5$."),
        diagram(
          "Initially stationary particle: u=0, final velocity v unknown, displacement s unknown and rightward acceleration a=3.2.",
          {
            type: "suvat",
            initial: "u=0",
            initialArrow: false,
            final: "v=?",
            displacement: "s=?",
            acceleration: "a=3.2",
          },
        ),
        p(raw`$v=0+3.2(5)=16\text{ m s}^{-1}$. $s=\frac12(3.2)(25)=40$ m.`),
      ]),
      example([
        p("2. $u=30$, $v=0$, $s=450$."),
        diagram(
          "Train stopping over displacement s=450 m: initial rightward velocity u=30, final velocity v=0.",
          {
            type: "suvat",
            initial: "u=30",
            final: "v=0",
            finalArrow: false,
            displacement: raw`s=450\text{ m}`,
          },
        ),
        p(
          raw`$v^2=u^2+2as$: $0=900+900a\implies a=-1\text{ m s}^{-2}$. Deceleration $1\text{ m s}^{-2}$.`,
        ),
        p("$v=u+at$: $t=30$ s."),
      ]),
      example([
        p("3. $u=30$, $v=10$, $a=-2$."),
        p(raw`$v^2=u^2+2as$: $100=900-4s\implies s=200$ m.`),
      ]),
    ]),
  ]),
  lesson("2.3 Vertical Motion Under Gravity", [
    p(
      raw`When an object moves vertically under gravity alone, use SUVAT with $a=\pm g$ where $g=9.8\text{ m s}^{-2}$.`,
    ),
    diagram(
      "Vertical launch schematic: upward initial velocity u, velocity zero at the peak, greatest height H above launch level and downward gravitational acceleration g. The positions show a single vertical line of motion.",
      {
        type: "vertical-motion",
        mode: "up",
        initial: "u",
        final: raw`v=0\text{ at peak}`,
        height: "H",
        gravity: "g",
      },
    ),
    group("Vertical Motion Conventions", [
      p("Taking upward positive: $a=-g$. At the highest point: $v=0$."),
      p(
        raw`Thrown upward with speed $u$: greatest height $H=\frac{u^2}{2g}$; time to peak $=\frac ug$; total time to return to launch height $=\frac{2u}{g}$.`,
      ),
    ]),
    group("Worked Example 5", [
      p(
        raw`A stone is thrown vertically upward with speed $15\text{ m s}^{-1}$ from a point 2 m above the ground. Find (a) the maximum height above the ground, (b) the time to reach the ground.`,
      ),
      diagram(
        "Stone launched vertically upward at u=15 from 2 m above ground. The peak has v=0; H measures peak height above ground.",
        {
          type: "vertical-motion",
          mode: "up",
          initial: "u=15",
          final: "v=0",
          height: "H",
          launchHeight: raw`2\text{ m}`,
        },
      ),
      p("Take upward positive. $u=15$, $a=-9.8$."),
      p(
        raw`(a) At max height, $v=0$. $v^2=u^2+2as$: $0=225-19.6s\implies s=11.48$ m above launch.`,
      ),
      p("Height above ground $=2+11.48=13.5$ m."),
      p(
        "(b) When the stone hits the ground, $s=-2$ (taking launch as origin).",
      ),
      m(raw`-2=15t-4.9t^2\implies4.9t^2-15t-2=0`),
      m(
        raw`t=\frac{15+\sqrt{225+39.2}}{9.8}=\frac{15+16.25}{9.8}=3.19\text{ s}`,
      ),
    ]),
    group("Practice Questions", [
      p(
        "1. A ball is dropped from 45 m. Find the time to reach the ground and impact speed.",
      ),
      p(
        "2. A ball projected upward returns to its starting height after 4 s. Find the initial speed.",
      ),
      p(
        raw`3. A stone thrown downward at $5\text{ m s}^{-1}$ from a 40 m tower. Find the time to the ground and impact speed.`,
      ),
    ]),
    group("Practice Solutions", [
      example([
        p("1. Ball dropped from 45 m."),
        diagram(
          "Ball dropped from rest, u=0, at height 45 m. Gravity g points down and the impact velocity v is unknown.",
          {
            type: "vertical-motion",
            mode: "down",
            initial: "u=0",
            initialArrow: false,
            final: "v=?",
            height: raw`45\text{ m}`,
            gravity: "g",
          },
        ),
        p(raw`$s=\frac12gt^2\implies t=\sqrt{\frac{2\times45}{9.8}}=3.03$ s.`),
        p(raw`$v=gt=9.8(3.03)=29.7\text{ m s}^{-1}$.`),
      ]),
      example([
        p("2. Total time up and down $=4$ s, so time to peak $=2$ s."),
        p(raw`At peak, $v=0=u-9.8(2)\implies u=19.6\text{ m s}^{-1}$.`),
      ]),
      example([
        p("3. $u=5$ (down), $s=40$ (down)."),
        diagram(
          "Stone thrown vertically downward with initial speed u=5 from 40 m above ground.",
          {
            type: "vertical-motion",
            mode: "down",
            initial: "u=5",
            height: raw`40\text{ m}`,
          },
        ),
        p(raw`Taking down positive: $40=5t+4.9t^2\implies4.9t^2+5t-40=0$.`),
        m(
          raw`t=\frac{-5+\sqrt{25+784}}{9.8}=\frac{-5+28.44}{9.8}=2.39\text{ s}`,
        ),
        p(raw`$v^2=25+2(9.8)(40)=809\implies v=28.4\text{ m s}^{-1}$.`),
      ]),
    ]),
  ]),
];
