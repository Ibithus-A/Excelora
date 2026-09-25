import type { LessonBlock, LessonDrawing } from "../../lib/lessons/schema.ts";
type Scene = Extract<LessonDrawing, { type: "scene" }>;
const raw = String.raw;
const line = (
  a: [number, number],
  b: [number, number],
  arrow = false,
  dashed = false,
): Scene["lines"][number] => ({ from: a, to: b, arrow, dashed });
const label = (x: number, y: number, text: string, width = 65) => ({
  x,
  y,
  text,
  width,
});
const scene = (
  description: string,
  drawing: Omit<Scene, "type">,
): LessonBlock => ({
  type: "diagram",
  description,
  drawing: { type: "scene", ...drawing },
});
export function horizontalForces(
  mass: string,
  weight: string,
  force: string,
  angle = 0,
  friction?: string,
  acceleration?: string,
  surface?: string,
): LessonBlock {
  const r = (angle * Math.PI) / 180,
    tip: [number, number] = [200 + 100 * Math.cos(r), 125 - 100 * Math.sin(r)];
  return scene(
    `A body labelled ${mass} on a horizontal surface. Weight ${weight} acts vertically down, reaction R vertically up, applied force ${force} acts at ${angle} degrees to the rightward horizontal.${friction ? ` Friction ${friction} acts left.` : ""}${acceleration ? ` Acceleration ${acceleration} is rightwards.` : ""}`,
    {
      lines: [
        line([40, 145], [350, 145]),
        line([180, 145], [180, 218], true),
        line([180, 110], [180, 35], true),
        line([205, 125], tip, true),
        ...(friction ? [line([155, 125], [60, 125], true)] : []),
        ...(acceleration ? [line([285, 210], [345, 210], true)] : []),
      ],
      rects: [{ x: 155, y: 110, width: 50, height: 35 }],
      labels: [
        label(180, 121, mass, 50),
        label(240, 202, weight),
        label(210, 34, "R", 35),
        label(
          Math.min(335, tip[0] + 22),
          tip[1] + (angle < 0 ? 15 : -30),
          force,
          90,
        ),
        ...(angle ? [label(270, 160, `${Math.abs(angle)}^\\circ`)] : []),
        ...(friction ? [label(95, 98, friction)] : []),
        ...(acceleration ? [label(315, 224, acceleration)] : []),
      ],
      caption: surface ? [raw`\text{${surface}}`] : [],
    },
  );
}
export function inclineForces(
  mass: string,
  weight: string,
  angle: number,
  angleLabel: string,
  friction?: "up" | "down",
  applied?: string,
  motion?: string,
  components = false,
): LessonBlock {
  const rad = (angle * Math.PI) / 180,
    c = Math.cos(rad),
    s = Math.sin(rad),
    end: [number, number] = [65 + 220 * c, 60 + 220 * s];
  const center: [number, number] = [
    65 + 110 * c + 18 * s,
    60 + 110 * s - 18 * c,
  ];
  const [x, y] = center;
  const normal: [number, number] = [x + 62 * s, y - 62 * c],
    down: [number, number] = [x + 82 * c, y + 82 * s],
    up: [number, number] = [x - 82 * c, y - 82 * s];
  return scene(
    `A block ${mass} on a slope labelled ${angleLabel}, descending to the right. Weight ${weight} is vertical, R normal to the plane.${friction ? ` Friction mu R acts ${friction} the slope.` : ""}${applied ? ` Force ${applied} acts up the slope.` : ""}${motion ? ` ${motion} indicates downward motion along the slope.` : ""}${components ? " Dashed components of weight act down the slope and into the plane." : ""}`,
    {
      lines: [
        line([65, 60], end),
        line([65, 60], [65, end[1]]),
        line([65, end[1]], end),
        line([x, y + 15], [x, Math.min(225, y + 100)], true),
        line(center, normal, true),
        ...(friction
          ? [line(center, friction === "up" ? up : down, true)]
          : []),
        ...(applied ? [line(center, up, true)] : []),
        ...(motion
          ? [
              line(
                [end[0] - 80, end[1] - 30],
                [end[0] - 40, end[1] + (40 * s) / c - 30],
                true,
              ),
            ]
          : []),
        ...(components
          ? [
              line(center, [x + 35 * c, y + 35 * s], true, true),
              line(
                [x + 35 * c, y + 35 * s],
                [x + 35 * c - 50 * s, y + 35 * s + 50 * c],
                true,
                true,
              ),
            ]
          : []),
      ],
      rects: [{ x: x - 22, y: y - 16, width: 44, height: 32, rotate: angle }],
      labels: [
        label(x - 30, Math.min(225, y + 100) + 10, weight),
        label(normal[0] + 22, normal[1] - 12, "R", 30),
        label(end[0] - 35, end[1] + 12, angleLabel, 45),
        ...(friction
          ? [
              label(
                (friction === "up" ? up : down)[0] +
                  (friction === "up" ? -10 : 20),
                (friction === "up" ? up : down)[1] - 23,
                raw`\mu R`,
                50,
              ),
            ]
          : []),
        ...(applied ? [label(up[0] - 12, up[1] - 23, applied, 35)] : []),
      ],
      caption: [
        raw`\text{Block: }${mass}`,
        ...(motion ? [`${motion}\\text{ down the slope}`] : []),
        ...(components
          ? [raw`${weight}\sin\alpha`, raw`${weight}\cos\alpha`]
          : []),
      ],
    },
  );
}
export function pulleyDiagram(
  left: string,
  right: string,
  leftWeight: string,
  rightWeight: string,
  table = false,
  full = true,
): LessonBlock {
  if (table)
    return scene(
      `${left} lies on a smooth horizontal table and is connected by a string over an edge pulley to hanging ${right}. Tension T acts rightwards on the table body and upwards on the hanging body; ${rightWeight} acts downwards. The bodies accelerate rightwards and downwards respectively.`,
      {
        lines: [
          line([45, 112], [246, 112]),
          line([250, 112], [250, 230]),
          line([148, 92], [260, 92]),
          line([272, 104], [272, 166]),
          line([148, 92], [225, 92], true),
          line([272, 168], [272, 124], true),
          line([272, 200], [272, 234], true),
          ...(full
            ? [
                line([123, 110], [123, 162], true),
                line([123, 76], [123, 25], true),
              ]
            : []),
        ],
        circles: [{ x: 260, y: 104, r: 12 }],
        rects: [
          { x: 98, y: 76, width: 50, height: 34 },
          { x: 247, y: 168, width: 50, height: 32 },
        ],
        labels: [
          label(123, 86, left, 50),
          label(272, 175, "B", 30),
          label(200, 66, "T", 30),
          label(306, 126, "T", 30),
          label(314, 216, rightWeight, 65),
          ...(full ? [label(93, 142, leftWeight), label(94, 22, "R", 30)] : []),
        ],
        caption: [
          raw`B:\ ${right}`,
          raw`\text{smooth table}`,
          raw`a\text{ rightwards on the table, downwards on the hanging body}`,
        ],
      },
    );
  return scene(
    `Two hanging bodies ${left} and ${right} connected by a light string over a smooth pulley. Each has upward tension T and downward weight (${leftWeight} and ${rightWeight}). The left body accelerates down and the right body up.`,
    {
      lines: [
        line([140, 55], [140, 145]),
        line([260, 55], [260, 175]),
        line([140, 145], [140, 95], true),
        line([140, 178], [140, 230], true),
        line([260, 175], [260, 125], true),
        line([260, 208], [260, 239], true),
      ],
      paths: [{ d: "M140 55 A60 40 0 0 1 260 55" }],
      rects: [
        { x: 110, y: 145, width: 60, height: 33 },
        { x: 230, y: 175, width: 60, height: 33 },
      ],
      labels: [
        label(140, 155, left, 60),
        label(260, 185, right, 60),
        label(112, 100, "T", 30),
        label(175, 214, leftWeight),
        label(288, 132, "T", 30),
        label(310, 220, rightWeight),
      ],
      caption: [
        raw`\text{smooth pulley}`,
        raw`a\text{ down on the left, up on the right}`,
      ],
    },
  );
}
export function liftDiagram(): LessonBlock {
  return scene(
    "A lift of mass 500 kg carries a 70 kg passenger. Cable tension acts upwards, combined weight 570g downwards, and the lift accelerates upwards at 2 m/s².",
    {
      lines: [
        line([200, 60], [200, 15], true),
        line([200, 190], [200, 237], true),
        line([305, 170], [305, 90], true),
      ],
      rects: [
        { x: 120, y: 60, width: 160, height: 130 },
        { x: 180, y: 125, width: 40, height: 50 },
      ],
      labels: [
        label(230, 14, raw`T_{\rm cable}`, 90),
        label(200, 85, raw`\text{Lift }500\text{ kg}`, 150),
        label(200, 141, raw`70\text{ kg}`, 55),
        label(238, 216, "570g"),
        label(337, 119, "a=2", 60),
      ],
      caption: [],
    },
  );
}
export function suspendedForces(): LessonBlock {
  const x = 200,
    y = 140;
  return scene(
    "A 2 kg particle in equilibrium with vertical downward weight 2g. Tension T1 acts upwards to the left, 30 degrees from the vertical; T2 acts upwards right, 60 degrees from vertical.",
    {
      lines: [
        line([60, 30], [350, 30]),
        line(
          [x, y],
          [x - 100 * Math.sin(Math.PI / 6), y - 100 * Math.cos(Math.PI / 6)],
          true,
        ),
        line(
          [x, y],
          [x + 100 * Math.sin(Math.PI / 3), y - 100 * Math.cos(Math.PI / 3)],
          true,
        ),
        line([x, y], [x, 220], true),
        line([x, 40], [x, y], false, true),
      ],
      circles: [{ x, y, r: 5 }],
      labels: [
        label(125, 64, "T_1"),
        label(316, 82, "T_2"),
        label(230, 210, "2g"),
        label(182, 42, raw`30^\circ`, 30),
        label(243, 61, raw`60^\circ`, 40),
      ],
      caption: [raw`2\text{ kg}`],
    },
  );
}
export function horizontalRod(
  length: number,
  forces: { at: number; label: string; up?: boolean }[],
  distances: string[],
): LessonBlock {
  const sx = (x: number) => 60 + (280 * x) / length;
  return scene(
    `A horizontal rod AB of length ${length}. ${forces.map((f) => `${f.label} acts ${f.up ? "upwards" : "downwards"} at distance ${f.at} from A`).join("; ")}.`,
    {
      lines: [
        line([60, 115], [340, 115]),
        ...forces.map((f) =>
          line([sx(f.at), 115], [sx(f.at), f.up ? 50 : 190], true),
        ),
      ],
      labels: [
        label(38, 103, "A", 24),
        label(362, 103, "B", 24),
        ...forces.map((f) => label(sx(f.at), f.up ? 19 : 203, f.label, 70)),
      ],
      caption: distances,
    },
  );
}
export function angledRod(
  weight: string,
  angle: number,
  angleLabel: string,
  wall = true,
  additionalWeight?: string,
): LessonBlock {
  const a: [number, number] = [90, 210],
    rad = (angle * Math.PI) / 180,
    b: [number, number] = [90 + 200 * Math.cos(rad), 210 - 200 * Math.sin(rad)];
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
    c: [number, number] = [
      a[0] + 0.75 * (b[0] - a[0]),
      a[1] + 0.75 * (b[1] - a[1]),
    ];
  const tension: [number, number] = [
    b[0] - 60 * Math.sin(rad),
    b[1] - 60 * Math.cos(rad),
  ];
  return scene(
    `Rod AB rests with A on rough ground at angle ${angleLabel}. ${weight} acts down at its midpoint; reaction R acts up at A and friction F rightwards at A. ${wall ? "The smooth wall at B exerts a horizontal leftward reaction S." : `A perpendicular tension T acts at B, and ${additionalWeight} acts down at C, three quarters along the rod.`}`,
    {
      lines: [
        line([45, 210], [350, 210]),
        line(a, b),
        line(a, [90, 140], true),
        line(a, [145, 210], true),
        line(mid, [mid[0], mid[1] + 65], true),
        ...(wall
          ? [line([b[0], 25], [b[0], 210]), line(b, [b[0] - 70, b[1]], true)]
          : [line(b, tension, true), line(c, [c[0], c[1] + 65], true)]),
      ],
      circles: additionalWeight ? [{ x: c[0], y: c[1], r: 4 }] : [],
      labels: [
        label(63, 187, "A", 25),
        label(b[0] + 22, b[1] - 15, "B", 25),
        label(58, 144, "R", 25),
        label(135, 227, "F", 25),
        label(207, 224, angleLabel, 50),
        label(mid[0] + 20, mid[1] + 25, weight, 50),
        ...(wall
          ? [label(b[0] - 35, b[1] - 28, "S", 30)]
          : [
              label(tension[0] - 20, tension[1] - 24, "T", 30),
              label(c[0] - 17, c[1] - 26, "C", 25),
              label(c[0] + 30, c[1] + 45, additionalWeight ?? "", 65),
            ]),
      ],
      caption: additionalWeight ? [raw`AC=1.5a`, raw`AB=2a`] : [],
    },
  );
}
export function slopePulley(): LessonBlock {
  return scene(
    "A 4 kg block lies on a smooth 30 degree incline and connects over a pulley at the top to a freely hanging 3 kg mass. The hanging weight is labelled 3g.",
    {
      lines: [
        line([55, 200], [250, 200 - 195 * Math.tan(Math.PI / 6)]),
        line([55, 200], [250, 200]),
        line([250, 200], [250, 88]),
        line([163, 123], [250, 73]),
        line([265, 88], [265, 165]),
        line([265, 198], [265, 230], true),
      ],
      circles: [{ x: 253, y: 85, r: 12 }],
      rects: [
        { x: 130, y: 122, width: 50, height: 30, rotate: -30 },
        { x: 240, y: 165, width: 50, height: 33 },
      ],
      labels: [
        label(125, 99, "A", 24),
        label(265, 175, "B", 24),
        label(300, 212, "3g"),
        label(106, 215, raw`30^\circ`, 50),
      ],
      caption: [raw`A:4\text{ kg}`, raw`B:3\text{ kg}`],
    },
  );
}
