import { nativeLesson,p,m,group,example } from './authoring.ts';
import type { LessonBlock, LessonDrawing } from '../../lib/lessons/schema.ts';
const raw=String.raw;
const lesson=(title:string,blocks:LessonBlock[])=>nativeLesson('Mechanics','Chapter 1: Modelling in Mechanics',title,blocks);
const diagram=(description:string,drawing:LessonDrawing):LessonBlock=>({type:'diagram',description,drawing});
export const MECHANICS_MODELLING_LESSONS=[
 lesson('1.1 Modelling Assumptions',[
 group('Common Modelling Assumptions',[
 p('Particle: body with negligible size; mass is concentrated at a point. Air resistance and rotation are neglected.'),
 p('Light: of negligible mass. (“Light string” has zero mass.)'),
 p('Inextensible: does not stretch. Particles connected by a light inextensible string share the same acceleration magnitude.'),
 p(raw`Smooth: no friction. Rough: friction present; $F\le\mu R$.`),
 p('Uniform: same density throughout. For a uniform rod, weight acts at the midpoint.'),
 p('Rigid body: retains its shape; no deformation.'),
 p(raw`Gravity: $g=9.8\ \mathrm{m\,s^{-2}}$ (or sometimes 9.81), assumed constant near Earth’s surface.`),
 ]),p('The three most common simplifications as diagrams:'),
 diagram('Particle represented by a point, with weight mg acting vertically downward.',{type:'model',model:'particle',weight:'mg'}),
 diagram('Uniform rod AB, with centre of mass at its midpoint and weight Mg acting vertically downward.',{type:'model',model:'rod',weight:'Mg'}),
 diagram('Lamina with its centre of mass marked and weight Mg acting vertically downward.',{type:'model',model:'lamina',weight:'Mg'}),
 group('Worked Example 1',[
 p('A tennis ball is served horizontally. State three modelling assumptions commonly made in the basic projectile model, and one effect each assumption has.'),
 p('(1) The ball is a particle. Rotation/spin is ignored — in reality spin changes the trajectory.'),
 p('(2) Air resistance is negligible. The horizontal velocity stays constant — in reality the ball slows, reducing range.'),
 p('(3) $g$ is constant. At low altitudes this is a good approximation.'),
 ]),
 ]),
 lesson('1.2 Vectors in Mechanics',[
 group('Vector Notation',[
 p(raw`A vector has magnitude and direction. We write $\mathbf{F}=a\mathbf{i}+b\mathbf{j}$ where $\mathbf{i}$ is east and $\mathbf{j}$ is north (or some other orthogonal basis).`),
 p(raw`Magnitude: $|\mathbf{F}|=\sqrt{a^2+b^2}$.`),
 p(raw`Direction: $\theta=\arctan(b/a)$ from $\mathbf{i}$.`),
 p(raw`Addition: $(a_1\mathbf{i}+b_1\mathbf{j})+(a_2\mathbf{i}+b_2\mathbf{j})=(a_1+a_2)\mathbf{i}+(b_1+b_2)\mathbf{j}$.`),
 p(raw`Resolving a force $F$ at angle $\theta$ to the horizontal: $F_x=F\cos\theta$, $F_y=F\sin\theta$.`),
 ]),group('Worked Example 2',[
 p(raw`Two forces $\mathbf{F}_1=(3\mathbf{i}+4\mathbf{j})\ \mathrm{N}$ and $\mathbf{F}_2=(-\mathbf{i}+2\mathbf{j})\ \mathrm{N}$ act on a particle. Find the resultant and its magnitude and direction.`),
 diagram('Forces F1=(3,4) and F2=(-1,2), and their resultant R=(2,6), drawn from the origin on axes i and j.',{type:'vectors',xRange:[-2,5],yRange:[-1,7],xLabel:raw`\mathbf{i}`,yLabel:raw`\mathbf{j}`,vectors:[{x:3,y:4,label:raw`\mathbf{F}_1:\ (3,4)`},{x:-1,y:2,label:raw`\mathbf{F}_2:\ (-1,2)`,dashed:true},{x:2,y:6,label:raw`\text{resultant }\mathbf{R}:\ (2,6)`}]}),
 p(raw`$\mathbf{R}=\mathbf{F}_1+\mathbf{F}_2=(3-1)\mathbf{i}+(4+2)\mathbf{j}=2\mathbf{i}+6\mathbf{j}\ \mathrm{N}$.`),
 p(raw`Magnitude $=\sqrt{4+36}=\sqrt{40}=2\sqrt{10}\approx6.32\ \mathrm{N}$.`),
 p(raw`Direction from $\mathbf{i}$: $\theta=\arctan(6/2)=71.6^\circ$.`),
 ]),group('Worked Example 3',[
 p(raw`A boat has velocity $\mathbf{v}=4\mathbf{i}+3\mathbf{j}\ \mathrm{km\,h^{-1}}$ relative to the water. The current flows with velocity $\mathbf{c}=\mathbf{i}-\mathbf{j}\ \mathrm{km\,h^{-1}}$. Find the boat’s resultant velocity, speed, and bearing.`),
 diagram('Boat velocity v=(4,3), current c=(1,-1), and resultant (5,2), on east i and north j axes.',{type:'vectors',xRange:[-1,6],yRange:[-2,4],xLabel:raw`\mathrm{E}\ (\mathbf{i})`,yLabel:raw`\mathrm{N}\ (\mathbf{j})`,vectors:[{x:4,y:3,label:raw`\mathbf{v}`},{x:1,y:-1,label:raw`\mathbf{c}`,dashed:true},{x:5,y:2,label:raw`\text{resultant}`}]}),
 p(raw`Resultant $=\mathbf{v}+\mathbf{c}=5\mathbf{i}+2\mathbf{j}\ \mathrm{km\,h^{-1}}$.`),
 p(raw`Speed $=\sqrt{25+4}=\sqrt{29}\approx5.39\ \mathrm{km\,h^{-1}}$.`),
 p(raw`Bearing $=090^\circ-\arctan(2/5)=090^\circ-21.8^\circ=068^\circ$.`),
 ]),group('Practice Questions',[
 p(raw`1. Forces $\mathbf{F}_1=(2\mathbf{i}-5\mathbf{j})\ \mathrm{N}$ and $\mathbf{F}_2=(-3\mathbf{i}+\mathbf{j})\ \mathrm{N}$ act on a particle. Find the resultant’s magnitude and direction.`),
 p(raw`2. A force of $20\ \mathrm{N}$ acts at $60^\circ$ above the horizontal. Find the horizontal and vertical components.`),
 p(raw`3. A particle is in equilibrium under three forces: $\mathbf{F}_1=(4\mathbf{i}+3\mathbf{j})\ \mathrm{N}$, $\mathbf{F}_2=(-2\mathbf{i}+a\mathbf{j})\ \mathrm{N}$, and $\mathbf{F}_3=(b\mathbf{i}-5\mathbf{j})\ \mathrm{N}$. Find $a$ and $b$.`),
 ]),group('Practice Solutions',[
 example([p(raw`1. $\mathbf{F}=(-\mathbf{i}-4\mathbf{j})\ \mathrm{N}$.`),diagram('Forces F1=(2,-5), F2=(-3,1) and resultant R=(-1,-4).',{type:'vectors',xRange:[-4,3],yRange:[-6,2],xLabel:raw`\mathbf{i}`,yLabel:raw`\mathbf{j}`,vectors:[{x:2,y:-5,label:raw`\mathbf{F}_1`},{x:-3,y:1,label:raw`\mathbf{F}_2`,dashed:true},{x:-1,y:-4,label:raw`\mathbf{R}`}]}),p(raw`Magnitude $=\sqrt{1+16}=\sqrt{17}\approx4.12\ \mathrm{N}$.`),p(raw`Direction: in third quadrant. $\theta=180^\circ+\arctan(4/1)=256^\circ$ from $\mathbf{i}$.`)]),
 example([p(raw`2. $F_x=20\cos60^\circ=10\ \mathrm{N}$. $F_y=20\sin60^\circ=17.3\ \mathrm{N}$.`),diagram('A 20 N force acts at 60 degrees above the horizontal, with horizontal component 10 N and vertical component 17.3 N.',{type:'resolved-force',magnitude:20,angle:60,horizontalLabel:'10',verticalLabel:'17.3'})]),
 example([p(raw`3. Equilibrium: $\sum\mathbf{F}=\mathbf{0}$.`),m(raw`\mathbf{i}:\quad4-2+b=0\implies b=-2.`),m(raw`\mathbf{j}:\quad3+a-5=0\implies a=2.`)]),
 ]),
 ]),
];
