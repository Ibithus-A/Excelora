import { nativeLesson, transcript } from "./authoring.ts";
const raw = String.raw;
const lesson = (title: string, source: string) =>
  nativeLesson(
    "Pure Mathematics",
    "Chapter 10: Vectors",
    title,
    transcript(source),
  );
export const PURE_VECTOR_LESSONS = [
  lesson(
    "10.1 Vectors in Two and Three Dimensions",
    raw`
A vector has both magnitude and direction. In 2D, vectors use $\mathbf i$, $\mathbf j$ unit vectors; in 3D, $\mathbf i$, $\mathbf j$, $\mathbf k$.

## Vector Notation and Operations

Magnitude:

$$|\mathbf a|=\sqrt{x^2+y^2+z^2}$$

Unit vector: $\hat{\mathbf a}=\frac{\mathbf a}{|\mathbf a|}$

Parallel vectors: $\mathbf b=\lambda\mathbf a$

Displacement: $\overrightarrow{AB}=\mathbf b-\mathbf a$

Distance: $AB=|\overrightarrow{AB}|$

## Worked Examples

@card

Find the magnitude of $\mathbf v=3\mathbf i-4\mathbf j+12\mathbf k$ and the unit vector in its direction. $|\mathbf v|=\sqrt{9+16+144}=\sqrt{169}=13$. $\hat{\mathbf v}=\frac1{13}(3\mathbf i-4\mathbf j+12\mathbf k)$.

## Practice Questions

1. Find the magnitude of $\begin{pmatrix}2\\-1\\2\end{pmatrix}$ and the unit vector in its direction.

2. Show that $\begin{pmatrix}6\\-9\\15\end{pmatrix}$ and $\begin{pmatrix}-2\\3\\-5\end{pmatrix}$ are parallel.

## Solutions to Practice Questions

1. $|\mathbf v|=\sqrt{4+1+4}=3$. Unit vector: $\frac13\begin{pmatrix}2\\-1\\2\end{pmatrix}$.

2. $\begin{pmatrix}6\\-9\\15\end{pmatrix}=-3\begin{pmatrix}-2\\3\\-5\end{pmatrix}$. Scalar multiple, so parallel.
`,
  ),
  lesson(
    "10.2 Position Vectors and Distance",
    raw`
The position vector of $A$ is $\overrightarrow{OA}$. The displacement $\overrightarrow{AB}=\mathbf b-\mathbf a$. The midpoint is $\frac12(\mathbf a+\mathbf b)$.

## Distance Formula

$$d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}$$

Section formula: $P$ divides $AB$ in ratio $m:n$: $\mathbf p=\frac{n\mathbf a+m\mathbf b}{m+n}$.

## Worked Examples

@card

$A(2,3,-1)$, $B(5,-3,4)$, $C(0,7,-4)$. $ABCD$ is a parallelogram. Find $D$ and distance $AC$. $\overrightarrow{AB}=\begin{pmatrix}3\\-6\\5\end{pmatrix}$. In parallelogram: $\overrightarrow{DC}=\overrightarrow{AB}$, so $\overrightarrow{OD}=\overrightarrow{OC}-\overrightarrow{AB}=\begin{pmatrix}-3\\13\\-9\end{pmatrix}$.

$\overrightarrow{AC}=\begin{pmatrix}-2\\4\\-3\end{pmatrix}$. $AC=\sqrt{4+16+9}=\sqrt{29}$.

@card

Line $l$ through $A(2,-3,5)$ and $B(5,6,8)$. Point $P$ on $l$ with $|\overrightarrow{AP}|=2|\overrightarrow{BP}|$. Find $P$.

$\overrightarrow{AB}=\begin{pmatrix}3\\9\\3\end{pmatrix}$. Point on $l$: $\mathbf p=\begin{pmatrix}2+3t\\-3+9t\\5+3t\end{pmatrix}$.

$|\overrightarrow{AP}|^2=99t^2$ and $|\overrightarrow{BP}|^2=99(t-1)^2$.

$99t^2=4\times99(t-1)^2$: $t^2=4(t-1)^2$, $3t^2-8t+4=0$, $(3t-2)(t-2)=0$.

$t=2/3$: $P=\begin{pmatrix}4\\3\\7\end{pmatrix}$. $t=2$: $P=\begin{pmatrix}8\\15\\11\end{pmatrix}$.

## Practice Questions

1. $A(1,2,3)$, $B(4,-1,7)$. Find the midpoint and distance $AB$.

2. Find the position vector of the point dividing $AB$ in ratio $2:3$ where $A(1,4,2)$, $B(6,-1,7)$.

## Solutions to Practice Questions

1. Midpoint: $(2.5,0.5,5)$. $AB=\sqrt{9+9+16}=\sqrt{34}$.

2. $\mathbf p=\frac{3\mathbf a+2\mathbf b}5=\frac15\begin{pmatrix}15\\10\\20\end{pmatrix}=\begin{pmatrix}3\\2\\4\end{pmatrix}$.
`,
  ),
  lesson(
    "10.3 Vector Problems in Pure Mathematics",
    raw`
## Common Problem Types

Fourth vertex: In parallelogram $ABCD$: $\mathbf d=\mathbf a+\mathbf c-\mathbf b$.

Collinearity: Show $\overrightarrow{AB}=\lambda\overrightarrow{AC}$.

Intersection: Express a point on two different lines, equate components.

## Worked Examples

@card

Triangle $OAB$. $\overrightarrow{OC}=2\overrightarrow{OA}$. $M$ is midpoint of $AB$. Line $CM$ meets $OB$ at $N$. Show $ON:NB=2:1$. Let $\overrightarrow{OA}=\mathbf a$, $\overrightarrow{OB}=\mathbf b$. Then $\overrightarrow{OC}=2\mathbf a$, $\overrightarrow{OM}=\frac12(\mathbf a+\mathbf b)$.

$$\overrightarrow{CM}=\overrightarrow{OM}-\overrightarrow{OC}=-\frac32\mathbf a+\frac12\mathbf b.$$

$N$ on line $CM$: $\overrightarrow{ON}=2\mathbf a+\lambda(-\frac32\mathbf a+\frac12\mathbf b)=(2-\frac32\lambda)\mathbf a+\frac12\lambda\mathbf b$.

$N$ on $OB$: the $\mathbf a$-component is zero. $2-\frac32\lambda=0$, $\lambda=\frac43$.

$\overrightarrow{ON}=\frac12\cdot\frac43\mathbf b=\frac23\mathbf b$. So $ON:NB=2:1$.

@card

$A(2,-1,4)$, $B(0,-5,10)$, $C(3,1,3)$. Show three points are collinear. $\overrightarrow{AB}=\begin{pmatrix}-2\\-4\\6\end{pmatrix}$, $\overrightarrow{AC}=\begin{pmatrix}1\\2\\-1\end{pmatrix}$.

$\overrightarrow{AB}=-2\overrightarrow{AC}$. Since $\overrightarrow{AB}$ is a scalar multiple of $\overrightarrow{AC}$ and they share point $A$, the three points are collinear.

## Practice Questions

1. Triangle $OAQ$. $P$ on $OA$ with $OP:OA=3:5$. $B$ on $OQ$ with $OB:BQ=1:2$. Find where $AB$ meets $PQ$.

2. $ABCD$ is a parallelogram with $A(0,1,2)$, $B(3,5,2)$, $C(7,4,6)$. Find $D$.

## Solutions to Practice Questions

1. $\overrightarrow{OP}=\frac35\mathbf a$, $\overrightarrow{OB}=\frac13\mathbf b$. $R$ on $PQ$: $\overrightarrow{OR}=\frac35(1-h)\mathbf a+h\mathbf b$.

$R$ on $AB$: $\overrightarrow{OR}=(1-k)\mathbf a+\frac k3\mathbf b$. Equating: $h=k/3$ and $\frac{3(1-h)}5=1-k$.

With $k=3h$: $\frac{3-3h}5=1-3h$, $12h=2$, $h=\frac16$. So $PR:PQ=1:6$.

2. $\overrightarrow{AD}=\overrightarrow{BC}=\begin{pmatrix}4\\-1\\4\end{pmatrix}$. $D=A+\overrightarrow{AD}=\begin{pmatrix}4\\0\\6\end{pmatrix}$.
`,
  ),
];
PURE_VECTOR_LESSONS[0].blocks.splice(2, 0, {
  type: "diagram",
  description:
    "Head-to-tail vector addition: a runs from the origin to its endpoint, b starts at that endpoint, and the dashed resultant a+b runs from the origin to the final endpoint. The axes are the i and j directions.",
  drawing: {
    type: "vectors",
    xRange: [-0.5, 5.5],
    yRange: [-0.5, 4.5],
    xLabel: raw`\mathbf i`,
    yLabel: raw`\mathbf j`,
    vectors: [
      { x: 3, y: 2, label: raw`\mathbf a` },
      { from: [3, 2], x: 4.5, y: 3.5, label: raw`\mathbf b` },
      { x: 4.5, y: 3.5, label: raw`\mathbf a+\mathbf b`, dashed: true },
    ],
  },
});
