import {nativeLesson,p,m,h,group,example} from './authoring.ts';
import type {LessonBlock} from '../../lib/lessons/schema.ts';
const raw=String.raw;
const lesson=(title:string,blocks:LessonBlock[])=>nativeLesson('Pure Mathematics','Chapter 3: Coordinate Geometry',title,blocks);
export const COORDINATE_GEOMETRY_LESSONS=[
lesson('3.1 Straight Lines',[
 p('The equation of a straight line can be expressed in several forms. Two essential gradient conditions govern parallel and perpendicular lines.'),
 group('Equation of a Straight Line',[
 m('y-y_1=m(x-x_1)'),p('(line through $(x_1,y_1)$ with gradient $m$)'),m('y=mx+c'),p('(gradient-intercept form)'),m('ax+by+c=0'),p('(general form)'),p('Gradient between two points:'),m(raw`m=\frac{y_2-y_1}{x_2-x_1}`),p('Parallel lines: $m_1=m_2$'),p('Perpendicular lines: $m_1m_2=-1$'),
 ]),p(raw`The perpendicular bisector of a line segment $AB$ passes through the midpoint of $AB$ and has gradient $-\frac1{m_{AB}}$.`),h('Worked Examples'),
 example([p('The points $A(-1,5)$ and $B(7,11)$ have perpendicular bisector with equation $4x+3y=36$. Show this, then find the area of triangle $OPQ$ where $P$ and $Q$ are the intercepts of this bisector with the coordinate axes.'),p('Step 1: Find the midpoint of $AB$:'),m(raw`M=\left(\frac{-1+7}{2},\frac{5+11}{2}\right)=(3,8)`),p('Step 2: Find the gradient of $AB$:'),m(raw`m_{AB}=\frac{11-5}{7-(-1)}=\frac68=\frac34`),p(raw`Step 3: The perpendicular bisector has gradient $-\frac43$ and passes through $(3,8)$:`),m(raw`\begin{aligned}y-8&=-\frac43(x-3)\\3(y-8)&=-4(x-3)\\3y-24&=-4x+12\\4x+3y&=36\end{aligned}`),p('Step 4: Find the intercepts. At $y=0$: $4x=36$, so $P=(9,0)$. At $x=0$: $3y=36$, so $Q=(0,12)$.'),p('Step 5: Area of triangle $OPQ$:'),m(raw`\text{Area}=\frac12\times9\times12=54\text{ square units}`)]),
 group('Practice Questions',[p('1. Find the equation of the line through $(2,-3)$ perpendicular to $3x+5y=7$.'),p(raw`2. The line through $A(1,4\sqrt3)$ and $B(-3+\sqrt3,3)$ has equation $y=\sqrt3(x+k)$. Find $k$.`),p('3. The cost £$y$ of making $x$ items is modelled as $y=mx+c$. Given that 100 items cost £850 and 250 items cost £1600, find $m$ and $c$ and interpret $c$.')]),
 group('Solutions to Practice Questions',[
 example([p('1. Line through $(2,-3)$ perpendicular to $3x+5y=7$.'),p(raw`Gradient of $3x+5y=7$ is $m=-\frac35$. Perpendicular gradient: $\frac53$.`),p(raw`$y+3=\frac53(x-2)$, i.e. $3y+9=5x-10$, giving $5x-3y=19$.`)]),
 example([p(raw`2. Line through $A(1,4\sqrt3)$ and $B(-3+\sqrt3,3)$. Find $k$ in $y=\sqrt3(x+k)$.`),p(raw`Gradient: $m=\frac{4\sqrt3-3}{1-(-3+\sqrt3)}=\frac{4\sqrt3-3}{4-\sqrt3}$.`),p('Rationalise:'),m(raw`\begin{aligned}\frac{(4\sqrt3-3)(4+\sqrt3)}{(4-\sqrt3)(4+\sqrt3)}&=\frac{16\sqrt3+12-12-3\sqrt3}{16-3}\\&=\frac{13\sqrt3}{13}=\sqrt3.\end{aligned}`),p(raw`So $m=\sqrt3$. Using point $A$: $4\sqrt3=\sqrt3(1+k)$, so $4=1+k$, $k=3$.`)]),
 example([p(raw`3. $m=\frac{1600-850}{250-100}=\frac{750}{150}=5$. Then $850=5(100)+c$, so $c=350$. The value $c=350$ represents the fixed cost (in £) regardless of quantity.`)]),
 ]),
]),
lesson('3.2 Circles',[
 p('A circle with centre $(a,b)$ and radius $r$ has equation $(x-a)^2+(y-b)^2=r^2$. The expanded form $x^2+y^2+2fx+2gy+c=0$ can be converted by completing the square.'),
 group('Circle Equations and Properties',[
 p('Standard form: $(x-a)^2+(y-b)^2=r^2$ (centre $(a,b)$, radius $r$)'),p(raw`General form: $x^2+y^2+2fx+2gy+c=0$ (centre $(-f,-g)$, radius $\sqrt{f^2+g^2-c}$)`),p('Key properties:'),p('• The angle in a semicircle is a right angle.'),p('• The perpendicular from the centre to a chord bisects the chord.'),p('• The tangent at any point is perpendicular to the radius at that point.'),
 ]),{type:'diagram',description:'A circle with centre (a,b), radius r to point P, and a tangent perpendicular to the radius at P. The coordinate axes are x and y.',drawing:{type:'circle-tangent'}},h('Worked Examples'),
 example([p('Circle $C_1$: $x^2+y^2-6x+14y+33=0$. Find the centre and radius.'),p('Complete the square:'),m('(x^2-6x+9)+(y^2+14y+49)+33-9-49=0'),m('(x-3)^2+(y+7)^2=25'),p('Centre $(3,-7)$, radius 5.')]),
 example([p('Circle $x^2+y^2-4x-6y+8=0$. The tangent $T_1$ at $P(4,4)$ passes through $Q(2,8)$. Find the equation of $T_1$.'),p(raw`Step 1: Find the centre. Completing the square: $(x-2)^2+(y-3)^2=5$. Centre $(2,3)$, radius $\sqrt5$.`),p(raw`Step 2: Gradient of radius to $P(4,4)$: $m=\frac{4-3}{4-2}=\frac12$`),p('Step 3: Tangent is perpendicular to radius: gradient $=-2$.'),p('$y-4=-2(x-4)$, giving $y=-2x+12$, or $2x+y=12$.'),p('Check: At $Q(2,8)$: $2(2)+8=12$. Confirmed.')]),
 example([p('Circle $C_1$ has centre $(3,-7)$ and radius 5. Circle $C_2$ has centre $(-6,-8)$ and radius $k$. Given $C_1$ and $C_2$ intersect at two distinct points, find the range of values of $k$ in set notation.'),p('Step 1: Distance between centres:'),m(raw`d=\sqrt{(3-(-6))^2+(-7-(-8))^2}=\sqrt{81+1}=\sqrt{82}`),p('Step 2: For two circles to intersect at two distinct points:'),m('|r_1-r_2|<d<r_1+r_2'),p(raw`So $|5-k|<\sqrt{82}<5+k$.`),p(raw`From $\sqrt{82}<5+k$: $k>\sqrt{82}-5$.`),p(raw`From $|5-k|<\sqrt{82}$: $-\sqrt{82}<5-k<\sqrt{82}$, giving $5-\sqrt{82}<k<5+\sqrt{82}$.`),p(raw`Since $k>0$ (it is a radius) and $\sqrt{82}-5>0$ (since $\sqrt{82}\approx9.06$), the binding constraint is:`),m(raw`\{k:\sqrt{82}-5<k<\sqrt{82}+5\}`)]),
 group('Practice Questions',[p('1. Circle $C$: $x^2+y^2+20x-2y+52=0$. Find the centre and radius.'),p('2. Find the equation of the tangent to $x^2+y^2-10x-12y+56=0$ at the point $A(6,4)$.'),p('3. Two circles have centres 13 units apart. One has radius 5 and the other has radius $r$. Find the range of $r$ for two intersection points.')]),
 group('Solutions to Practice Questions',[
 example([p('1. $x^2+y^2+20x-2y+52=0$.'),p('$(x+10)^2-100+(y-1)^2-1+52=0$, so $(x+10)^2+(y-1)^2=49$.'),p('Centre $(-10,1)$, radius 7.')]),
 example([p('2. Tangent to $x^2+y^2-10x-12y+56=0$ at $A(6,4)$.'),p('Centre: $(x-5)^2+(y-6)^2=5$. Centre $(5,6)$.'),p(raw`Gradient of radius to $A(6,4)$: $m=\frac{4-6}{6-5}=-2$.`),p(raw`Tangent gradient: $\frac12$. Equation: $y-4=\frac12(x-6)$, giving $x-2y+2=0$.`)]),
 example([p('3. Centres 13 apart, radii 5 and $r$. For two intersections: $|5-r|<13<5+r$.'),p('From $13<5+r$: $r>8$. From $|5-r|<13$: $-13<5-r<13$, so $-8<r<18$.'),p(raw`Combined with $r>0$: $\{r:8<r<18\}$.`)]),
 ]),
]),
lesson('3.3 Parametric Equations',[
 p('A curve can be described by expressing $x$ and $y$ separately in terms of a parameter $t$. Conversion to Cartesian form requires eliminating $t$. The domain of $t$ may restrict which part of the curve is traced.'),
 group('Parametric Equations',[
 p(raw`Circle: $x=a+r\cos t$, $y=b+r\sin t$ (centre $(a,b)$, radius $r$)`),p(raw`Conversion to Cartesian: Eliminate $t$ using algebra or identities (e.g. $\cos^2t+\sin^2t=1$).`),p('Parametric differentiation:'),m(raw`\frac{dy}{dx}=\frac{dy/dt}{dx/dt}`),p('Key skill: Pay attention to the domain of $t$, as it may describe only part of a curve.'),
 ]),h('Worked Examples'),
 example([p(raw`A curve $C$ has parametric equations $x=\frac{t+3}{t+1}$, $y=\frac2{t+2}$, $t\ne-1$, $t\ne-2$. Show that the Cartesian equation is $y=\frac{2(x-1)}{x+1}$.`),p(raw`Step 1: Express $t$ in terms of $x$. From $x=\frac{t+3}{t+1}$:`),m(raw`\begin{aligned}x(t+1)&=t+3\\xt+x&=t+3\\t(x-1)&=3-x\\t&=\frac{3-x}{x-1}\end{aligned}`),p(raw`Step 2: Substitute into $y=\frac2{t+2}$:`),m(raw`\begin{aligned}t+2&=\frac{3-x}{x-1}+2\\&=\frac{3-x+2(x-1)}{x-1}\\&=\frac{x+1}{x-1}\end{aligned}`),p(raw`Therefore $y=\frac2{\frac{x+1}{x-1}}=\frac{2(x-1)}{x+1}$.`)]),
 example([p(raw`Curve $C_1$: $x=10\cos t$, $y=4\sqrt2\sin t$, $0\le t<2\pi$. Circle $C_2$: $x^2+y^2=66$. Find the Cartesian coordinates of the intersection point $S$ in the 4th quadrant.`),p(raw`Step 1: From the parametric equations: $\cos t=\frac{x}{10}$ and $\sin t=\frac{y}{4\sqrt2}$.`),p(raw`Using $\cos^2t+\sin^2t=1$:`),m(raw`\frac{x^2}{100}+\frac{y^2}{32}=1`),p('Step 2: Substitute $y^2=66-x^2$ from $C_2$:'),m(raw`\begin{aligned}\frac{x^2}{100}+\frac{66-x^2}{32}&=1\\\frac{32x^2+100(66-x^2)}{3200}&=1\\32x^2+6600-100x^2&=3200\\-68x^2&=-3400\\x^2&=50,\quad x=\pm5\sqrt2\end{aligned}`),p(raw`Then $y^2=66-50=16$, so $y=\pm4$.`),p(raw`Step 3: In the 4th quadrant: $x>0$, $y<0$. So $S=(5\sqrt2,-4)$.`)]),
 group('Practice Questions',[p(raw`1. A curve has parametric equations $x=5t$, $y=\frac5t$. Find its Cartesian equation.`),p(raw`2. Curve: $x=2+5\cos t$, $y=-4+5\sin t$. State the centre and radius of the resulting circle.`),p('3. A point $P(20,60)$ lies on the curve $x=2at$, $y=8at-at^2$. Find the value of $a$.')]),
 group('Solutions to Practice Questions',[
 example([p('1. $x=5t$, $y=5/t$. Then $t=x/5$, so $y=5/(x/5)=25/x$. Cartesian equation: $xy=25$.')]),
 example([p(raw`2. $x-2=5\cos t$ and $y+4=5\sin t$. So $(x-2)^2+(y+4)^2=25$. Centre $(2,-4)$, radius 5.`)]),
 example([p('3. At $P(20,60)$: $20=2at$ and $60=8at-at^2$.'),p('From the first: $at=10$, so $t=10/a$. Substitute into the second:'),m(raw`60=8(10)-a\left(\frac{10}{a}\right)^2=80-\frac{100}{a}`),p(raw`So $\frac{100}{a}=20$, giving $a=5$.`)]),
 ]),
]),
lesson('3.4 Parametric Equations in Modelling',[
 p('Parametric equations are used to model real-world curves such as projectile paths, the motion of points on wheels, and the shapes of physical structures. In modelling contexts, the parameter often represents time.'),
 group('Parametric Modelling',[p('An object moving with constant velocity from point $A$ at $t=0$ to point $B$ at $t=T$ can be modelled by:'),m(raw`x=x_A+\frac{x_B-x_A}{T}t,\qquad y=y_A+\frac{y_B-y_A}{T}t`),p('When interpreting a parametric model, pay attention to the range of $t$ and what it represents physically.')]),h('Worked Examples'),
 example([p('An object moves with constant velocity from $(1,8)$ at $t=0$ to $(6,20)$ at $t=5$. Write parametric equations for the motion.'),m(raw`x=1+\frac{6-1}{5}t=1+t`),m(raw`y=8+\frac{20-8}{5}t=8+\frac{12}{5}t`),p(raw`for $0\le t\le5$. The Cartesian equation is $y=8+\frac{12}{5}(x-1)=\frac{12}{5}x+\frac{28}{5}$.`)]),
 example([p(raw`Curve $C$: $x=(t+3)^2$, $y=1-t^3$, $-2\le t\le1$. Point $P(4,2)$ lies on $C$. Using parametric differentiation, show that the tangent at $P$ has equation $3x+4y=20$.`),p(raw`Step 1: Find $t$ at $P$. From $x=4$: $(t+3)^2=4$, so $t+3=\pm2$, giving $t=-1$ or $t=-5$. Since $-2\le t\le1$, $t=-1$. Check: $y=1-(-1)^3=2$. Confirmed.`),p('Step 2: Differentiate parametrically.'),m(raw`\frac{dx}{dt}=2(t+3),\qquad\frac{dy}{dt}=-3t^2`),p(raw`At $t=-1$: $\frac{dx}{dt}=2(2)=4$ and $\frac{dy}{dt}=-3(1)=-3$.`),m(raw`\frac{dy}{dx}=-\frac34`),p('Step 3: Tangent at $P(4,2)$:'),m(raw`\begin{aligned}y-2&=-\frac34(x-4)\\4y-8&=-3x+12\\3x+4y&=20\end{aligned}`)]),
 group('Practice Questions',[p(raw`1. A water park slide is modelled by $x=(t+3)^2$, $y=1-t^3$, $-2\le t\le1$, where $y$ is height in metres. Find the greatest height of the slide above water level.`),p('2. An object moves so that $x=t^2+1$, $y=2t+2$. Find the Cartesian equation.')]),
 group('Solutions to Practice Questions',[
 example([p(raw`1. Greatest height: maximise $y=1-t^3$ on $-2\le t\le1$.`),p(raw`$\frac{dy}{dt}=-3t^2=0$ gives $t=0$, where $y=1$. At endpoints: $t=-2$, $y=1-(-8)=9$; $t=1$, $y=0$.`),p('Greatest height is 9 metres (at $t=-2$).')]),
 example([p(raw`2. From $y=2t+2$: $t=\frac{y-2}{2}$. Substitute: $x=\left(\frac{y-2}{2}\right)^2+1=\frac{(y-2)^2}{4}+1$.`),p('Rearranging: $(y-2)^2=4(x-1)$, which is a parabola with vertex $(1,2)$.')]),
 ]),
]),
];
