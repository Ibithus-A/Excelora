import { nativeLesson, p, m, group, example, step } from "./authoring.ts";
import type { LessonBlock } from "../../lib/lessons/schema.ts";
const raw = String.raw;
const lesson = (title: string, blocks: LessonBlock[]) =>
  nativeLesson(
    "Pure Mathematics",
    "Chapter 4: Sequences and Series",
    title,
    blocks,
  );
export const SEQUENCES_SERIES_LESSONS = [
  lesson("4.1 Arithmetic Sequences and Series", [
    p(
      "An arithmetic sequence has a constant difference $d$ between consecutive terms. The $n$th term and the sum of the first $n$ terms are given by standard formulae whose proofs students should know.",
    ),
    group("Arithmetic Sequence", [
      p("$n$th term: $u_n=a+(n-1)d$"),
      p("where $a$ is the first term and $d$ is the common difference."),
      p("Sum of $n$ terms:"),
      m(raw`S_n=\frac n2(2a+(n-1)d)=\frac n2(a+l)`),
      p("where $l$ is the last term."),
    ]),
    p(
      "The proof of the sum formula proceeds by writing $S_n$ forwards and backwards, then adding:",
    ),
    m(raw`S_n=a+(a+d)+\cdots+(a+(n-1)d)`),
    p("and"),
    m(raw`S_n=l+(l-d)+\cdots+(l-(n-1)d).`),
    p("Adding gives $2S_n=n(a+l)$."),
    group("Worked Examples", [
      example([
        p(
          "A theatre has seats arranged in rows forming an arithmetic series. Row 6 has 23 seats and row 15 has 50 seats. Find the number of seats in the first row and the total number of seats in 20 rows.",
        ),
        step(1, "Using the nth-term formula", [
          p("Using $u_n=a+(n-1)d$:"),
          m(raw`u_6=a+5d=23\quad\ldots(1)`),
          m(raw`u_{15}=a+14d=50\quad\ldots(2)`),
        ]),
        step(2, "Subtract (1) from (2)", [
          p("Subtract (1) from (2): $9d=27$, so $d=3$."),
          p("From (1): $a=23-15=8$."),
        ]),
        step(3, "Total seats in 20 rows", [
          m(raw`S_{20}=\frac{20}{2}(2(8)+19(3))=10(16+57)=10(73)=730`),
        ]),
      ]),
      example([
        p(
          "Arithmetic series: 16th term is 6, sum of first 16 terms is 456. Find the first term and common difference. Given $S_k=0$, find $k$.",
        ),
        step(1, "", [
          m(raw`u_{16}=a+15d=6\quad\ldots(1)`),
          p(
            raw`$S_{16}=\frac{16}{2}(a+u_{16})=8(a+6)=456$, so $a+6=57$, $a=51\quad\ldots(2)$`,
          ),
        ]),
        step(2, "From (1)", [p("From (1): $51+15d=6$, so $15d=-45$, $d=-3$.")]),
        step(3, "", [
          p("$S_k=0$:"),
          m(raw`\frac k2(2(51)+(k-1)(-3))=0`),
          m(raw`\frac k2(102-3k+3)=0`),
          m(raw`\frac k2(105-3k)=0`),
          p("Since $k>0$: $105-3k=0$, so $k=35$."),
        ]),
      ]),
    ]),
    group("Practice Questions", [
      p(
        "1. An arithmetic sequence has first term 7 and common difference 4. Find the sum of the first 20 terms.",
      ),
      p(
        "2. The 5th term of an AP is 19 and the 12th term is 54. Find $a$ and $d$.",
      ),
      p("3. $S_{25}=1050$ and $u_{25}=72$. Find $a$ and $d$."),
    ]),
    group("Solutions to Practice Questions", [
      p(
        raw`1. $a=7$, $d=4$. $S_{20}=\frac{20}{2}(14+19\times4)=10(14+76)=10(90)=900$.`,
      ),
      p(
        "2. $a+4d=19$ and $a+11d=54$. Subtracting: $7d=35$, $d=5$. Then $a=19-20=-1$.",
      ),
      p(
        raw`3. $S_{25}=\frac{25}{2}(a+72)=1050$. So $a+72=84$, $a=12$. Then $a+24d=72$, $24d=60$, $d=2.5$.`,
      ),
    ]),
  ]),
  lesson("4.2 Geometric Sequences and Series", [
    p(
      "A geometric sequence has a constant ratio $r$ between consecutive terms. When $|r|<1$, the series converges and the sum to infinity exists.",
    ),
    group("Geometric Sequence", [
      p("$n$th term: $u_n=ar^{n-1}$"),
      p("Sum of $n$ terms:"),
      m(raw`S_n=\frac{a(1-r^n)}{1-r},\quad r\ne1`),
      p("Sum to infinity ($|r|<1$):"),
      m(raw`S_\infty=\frac a{1-r}`),
      p(
        "Students should know the proof of $S_n$: write $S_n$ and $rS_n$, then subtract.",
      ),
    ]),
    p(
      raw`To find $n$ from a geometric sum or term condition, logarithms are used. For example, if $ar^{n-1}=k$, then $n-1=\frac{\ln(k/a)}{\ln r}$.`,
    ),
    group("Worked Examples", [
      example([
        p(
          "In a geometric series the sum of the 2nd and 4th terms is 156 and the sum of the 3rd and 5th terms is 234. Find the first term and the common ratio.",
        ),
        step(1, "Write the terms", [
          m(raw`u_2+u_4=ar+ar^3=ar(1+r^2)=156\quad\ldots(1)`),
          m(raw`u_3+u_5=ar^2+ar^4=ar^2(1+r^2)=234\quad\ldots(2)`),
        ]),
        step(2, "Divide (2) by (1)", [
          m(raw`\frac{ar^2(1+r^2)}{ar(1+r^2)}=r=\frac{234}{156}=\frac32`),
        ]),
        step(3, "Substitute into (1)", [
          m(raw`a\cdot\frac32\cdot\left(1+\frac94\right)=156`),
          m(raw`\frac{3a}{2}\cdot\frac{13}{4}=156`),
          m(raw`\frac{39a}{8}=156`),
          m("a=32"),
        ]),
      ]),
      example([
        p(
          raw`Geometric progression: first term 1200, sum to infinity 1600. Find the sum of the first 5 terms and evaluate $\sum_{r=6}^\infty u_r$.`,
        ),
        step(1, "", [
          p(
            raw`$S_\infty=\frac a{1-r}=\frac{1200}{1-r}=1600$, so $1-r=\frac34$, $r=\frac14$.`,
          ),
        ]),
        step(2, "", [
          m(
            raw`\begin{aligned}S_5&=\frac{1200(1-(1/4)^5)}{1-1/4}=\frac{1200\cdot(1-1/1024)}{3/4}\\&=1600\left(\frac{1023}{1024}\right)=\frac{1023\times1600}{1024}\\&=\frac{204600}{128}=\frac{25575}{16}=1598.4375\end{aligned}`,
          ),
        ]),
        step(3, "", [
          m(
            raw`\sum_{r=6}^\infty u_r=S_\infty-S_5=1600-\frac{25575}{16}=\frac{25600-25575}{16}=\frac{25}{16}`,
          ),
        ]),
      ]),
      example([
        p(
          raw`The first 3 terms of a geometric sequence are $3^{4k-5}$, $9^{7-2k}$, $3^{2(k-1)}$. Prove that $k=\frac52$ and find the sum to infinity.`,
        ),
        step(1, "Rewrite all terms as powers of 3", [
          m(
            raw`u_1=3^{4k-5},\quad u_2=9^{7-2k}=3^{2(7-2k)}=3^{14-4k},\quad u_3=3^{2k-2}.`,
          ),
        ]),
        step(2, "", [
          p(
            raw`For a geometric sequence, $u_2^2=u_1\cdot u_3$ (equivalent to constant ratio):`,
          ),
          m(raw`(3^{14-4k})^2=3^{4k-5}\cdot3^{2k-2}`),
          m(raw`3^{28-8k}=3^{6k-7}`),
          p(raw`Equate exponents: $28-8k=6k-7$, so $35=14k$, $k=\frac52$.`),
        ]),
        step(3, "", [
          p(raw`With $k=\frac52$: $u_1=3^5=243$, $u_2=3^4=81$, $u_3=3^3=27$.`),
          p(
            raw`$r=\frac{81}{243}=\frac13$. Since $|r|<1$: $S_\infty=\frac{243}{1-1/3}=\frac{243}{2/3}=\frac{729}{2}$.`,
          ),
        ]),
      ]),
    ]),
    group("Practice Questions", [
      p(
        "1. A geometric series has $S_4=5S_2$ and the terms alternate in sign. Find $r$. Given the 5th term is 36, find $a$.",
      ),
      p(
        raw`2. A 20 km race. First 4 km at 6 min/km. After 4 km, each km takes 5% longer. Show the $r$th km ($r\geq5$) takes $6\times1.05^{r-4}$ minutes, and estimate total time.`,
      ),
      p(raw`3. Find $\sum_{r=4}^\infty20\times\left(\frac12\right)^r$.`),
    ]),
    group("Solutions to Practice Questions", [
      example([
        p(raw`1. $S_4=5S_2$. Using $S_n=\frac{a(1-r^n)}{1-r}$:`),
        p(
          raw`$\frac{a(1-r^4)}{1-r}=5\cdot\frac{a(1-r^2)}{1-r}$. Cancel $\frac a{1-r}$: $1-r^4=5(1-r^2)$.`,
        ),
        p(
          raw`Factor: $(1-r^2)(1+r^2)=5(1-r^2)$. Since $r\ne\pm1$: $1+r^2=5$, so $r^2=4$, $r=\pm2$.`,
        ),
        p(
          raw`Signs alternate, so $r=-2$. 5th term: $ar^4=16a=36$, $a=\frac{36}{16}=\frac94$.`,
        ),
      ]),
      example([
        p(
          raw`2. First 4 km: $4\times6=24$ min. 5th km takes $6\times1.05=6.3$ min. $r$th km ($r\geq5$): the time is $6\times1.05^{r-4}$ (a geometric sequence with first term 6.3 at $r=5$, ratio 1.05).`,
        ),
        p(
          raw`Total for km 5–20 (16 terms of a GP, $a=6\times1.05$, $r=1.05$):`,
        ),
        m(
          raw`S_{16}=\frac{6\times1.05(1.05^{16}-1)}{1.05-1}=\frac{6.3(1.05^{16}-1)}{0.05}`,
        ),
        p(
          raw`$1.05^{16}\approx2.1829$. So $S_{16}\approx\frac{6.3\times1.1829}{0.05}\approx149.0$. Total $\approx24+149=173$ min, or 2 hours 53 minutes.`,
        ),
      ]),
      example([
        m(
          raw`3.\quad\sum_{r=4}^\infty20\times(1/2)^r=20[(1/2)^4+(1/2)^5+\cdots]`,
        ),
        p(
          raw`This is a GP with first term $20\times(1/2)^4=20/16=5/4$ and ratio $1/2$:`,
        ),
        m(raw`S_\infty=\frac{5/4}{1-1/2}=\frac{5/4}{1/2}=\frac52`),
      ]),
    ]),
  ]),
  lesson("4.3 Sigma Notation and Recurrence Relations", [
    p(
      raw`Sigma notation $\sum_{r=1}^n u_r$ represents the sum $u_1+u_2+\cdots+u_n$. Students should know that $\sum_{r=1}^n1=n$. Sequences can also be defined by recurrence relations of the form $x_{n+1}=f(x_n)$.`,
    ),
    group("Sigma Notation", [
      m(raw`\sum_{r=1}^n u_r=u_1+u_2+u_3+\cdots+u_n`),
      p("Sequence Types:"),
      p(
        "A sequence is increasing if $u_{n+1}>u_n$ for all $n$, decreasing if $u_{n+1}<u_n$ for all $n$, and periodic with period $k$ if $u_{n+k}=u_n$ for all $n$.",
      ),
    ]),
    group("Worked Examples", [
      example([
        p(
          "A sequence is defined by $u_{n+1}=ku_n-5$, $u_1=6$, where $k$ is a positive constant. Given $u_3=-1$, show that $6k^2-5k-4=0$ and find $k$.",
        ),
        step(1, "", [
          p("Find $u_2$ and $u_3$ in terms of $k$:"),
          m("u_2=ku_1-5=6k-5"),
          m("u_3=ku_2-5=k(6k-5)-5=6k^2-5k-5"),
        ]),
        step(2, "", [p("Set $u_3=-1$:"), m("6k^2-5k-5=-1"), m("6k^2-5k-4=0")]),
        step(3, "", [
          p(raw`Factorise: $(6k+3)(k-\frac43)$... Let’s use the formula:`),
          m(raw`k=\frac{5\pm\sqrt{25+96}}{12}=\frac{5\pm11}{12}`),
          m(
            raw`k=\frac{16}{12}=\frac43\quad\text{or}\quad k=\frac{-6}{12}=-\frac12.`,
          ),
          p(raw`Since $k$ is positive: $k=\frac43$.`),
        ]),
      ]),
      example([
        p(
          raw`Show that $\sum_{n=1}^{48}\log_5\left(\frac{n+2}{n+1}\right)=2$.`,
        ),
        p(
          raw`Using the log law $\log_5\left(\frac{n+2}{n+1}\right)=\log_5(n+2)-\log_5(n+1)$, this is a telescoping series:`,
        ),
        m(
          raw`\begin{aligned}\sum_{n=1}^{48}[\log_5(n+2)-\log_5(n+1)]&=\log_5(50)-\log_5(2)\\&=\log_5\left(\frac{50}{2}\right)=\log_5(25)=\log_5(5^2)=2\end{aligned}`,
        ),
      ]),
    ]),
    group("Practice Questions", [
      p(
        raw`1. A sequence is defined by $x_{n+1}=\frac{k-5x_n}{x_n}$, $x_1=1$, $k>5$. Find $x_3$ in terms of $k$ and the range of $k$ for which $x_3>6$.`,
      ),
      p(raw`2. Write out and simplify $\sum_{r=1}^5(3r-1)$.`),
      p(
        raw`3. A sequence has $u_{n+1}=\frac1{u_n}$ for $n>1$ and $u_1=3$. State the period and find $u_{100}$.`,
      ),
    ]),
    group("Solutions to Practice Questions", [
      example([
        p(
          raw`1. $x_1=1$. $x_2=\frac{k-5}{1}=k-5$. $x_3=\frac{k-5(k-5)}{k-5}=\frac{k-5k+25}{k-5}=\frac{25-4k}{k-5}$.`,
        ),
        p(
          raw`$x_3>6$: $\frac{25-4k}{k-5}>6$. Since $k>5$, $k-5>0$, so $25-4k>6(k-5)$, $25-4k>6k-30$, $55>10k$, $k<5.5$.`,
        ),
        p("Combined with $k>5$: $5<k<5.5$."),
      ]),
      p(raw`2. $\sum_{r=1}^5(3r-1)=2+5+8+11+14=40$.`),
      example([
        p(
          raw`3. $u_1=3$, $u_2=1/3$, $u_3=3$, $u_4=1/3$, $\ldots$ The sequence is periodic with period 2.`,
        ),
        p("Since 100 is even, $u_{100}=u_2=1/3$."),
      ]),
    ]),
  ]),
  lesson("4.4 Binomial Expansion - Positive Integer n", [
    p(
      raw`The binomial theorem expands $(a+b)^n$ for positive integers $n$. Pascal’s triangle provides the coefficients, which are also given by the formula $\binom nr$.`,
    ),
    group("Binomial Expansion — Positive Integer n", [
      m(raw`(a+b)^n=\sum_{r=0}^n\binom nr a^{n-r}b^r`),
      m(raw`\text{where}\quad\binom nr=\frac{n!}{r!(n-r)!}`),
      p("In particular:"),
      m(
        raw`(1+x)^n=1+nx+\frac{n(n-1)}{2!}x^2+\frac{n(n-1)(n-2)}{3!}x^3+\cdots+x^n`,
      ),
    ]),
    group("Worked Examples", [
      p("Find the first 4 terms of $(2+3x)^8$ in ascending powers of $x$."),
      m(
        raw`\begin{aligned}(2+3x)^8&=\sum_{r=0}^8\binom8r2^{8-r}(3x)^r\\&=\binom802^8+\binom812^7(3x)+\binom822^6(3x)^2+\binom832^5(3x)^3+\cdots\\&=256+8(128)(3x)+28(64)(9x^2)+56(32)(27x^3)+\cdots\\&=256+3072x+16128x^2+48384x^3+\cdots\end{aligned}`,
      ),
    ]),
    group("Practice Questions", [
      p("1. Find the coefficient of $x^3$ in the expansion of $(1-2x)^{10}$."),
      p("2. Expand $(1+x)^5$ fully."),
      p("3. The coefficient of $x^2$ in $(3+kx)^6$ is 2160. Find $k$."),
    ]),
    group("Solutions to Practice Questions", [
      p(
        raw`1. Coefficient of $x^3$ in $(1-2x)^{10}$: $\binom{10}{3}(-2)^3=120\times(-8)=-960$.`,
      ),
      p("2. $(1+x)^5=1+5x+10x^2+10x^3+5x^4+x^5$."),
      p(
        raw`3. $x^2$ term: $\binom623^4(kx)^2=15\times81\times k^2x^2=1215k^2x^2$.`,
      ),
      p(
        raw`$1215k^2=2160$, $k^2=\frac{2160}{1215}=\frac{16}{9}$, $k=\pm\frac43$.`,
      ),
    ]),
  ]),
  lesson("4.5 Binomial Expansion - Rational n", [
    p(
      raw`When $n$ is not a positive integer, the binomial expansion of $(1+bx)^n$ produces an infinite series valid only when $|bx|<1$, i.e. $|x|<\frac1{|b|}$.`,
    ),
    group("Binomial Expansion — Rational n (Infinite Series)", [
      m(
        raw`(1+bx)^n=1+n(bx)+\frac{n(n-1)}{2!}(bx)^2+\frac{n(n-1)(n-2)}{3!}(bx)^3+\cdots`,
      ),
      p(raw`Valid for $|bx|<1$, i.e. $|x|<\frac1{|b|}$`),
      p(
        "This expansion may be combined with partial fractions: decompose a rational function into partial fractions, then expand each fraction using the binomial series.",
      ),
    ]),
    group("Worked Examples", [
      example([
        p(
          raw`Expand $f(x)=\sqrt{1+\frac18x}$ up to and including the term in $x^2$, stating the range of validity.`,
        ),
        p(
          raw`$f(x)=\left(1+\frac x8\right)^{1/2}$. Using the expansion with $n=\frac12$, $b=\frac18$:`,
        ),
        m(
          raw`\begin{aligned}f(x)&=1+\frac12\left(\frac x8\right)+\frac{\frac12(-\frac12)}2\left(\frac x8\right)^2+\cdots\\&=1+\frac x{16}+\frac{-\frac14}{2}\cdot\frac{x^2}{64}+\cdots\\&=1+\frac x{16}-\frac{x^2}{512}+\cdots\end{aligned}`,
        ),
        p(raw`Valid for $\left|\frac x8\right|<1$, i.e. $|x|<8$.`),
      ]),
      example([
        p(
          "In the convergent expansion of $(1+bx)^n$ with $|bx|<1$, the coefficient of $x$ is $-6$ and the coefficient of $x^2$ is 27. Show that $b=3$ and find $n$. State the range of validity.",
        ),
        step(1, "", [
          p(raw`Coefficient of $x$: $nb=-6\quad\ldots(1)$`),
          p(raw`Coefficient of $x^2$: $\frac{n(n-1)}2b^2=27\quad\ldots(2)$`),
        ]),
        step(2, "", [
          p("From (1): $n=-6/b$. Substitute into (2):"),
          m(raw`\frac{(-6/b)(-6/b-1)}2\cdot b^2=27`),
          m(raw`\frac{(-6/b)\cdot((-6-b)/b)}2\cdot b^2=27`),
          m(raw`\frac{(-6)(-6-b)}2=27`),
          m(raw`\frac{6(6+b)}2=27`),
          m("3(6+b)=27"),
          m("6+b=9"),
          m("b=3"),
        ]),
        step(3, "", [
          p("From (1): $n=-6/3=-2$."),
          p(raw`Valid for $|3x|<1$, i.e. $|x|<\frac13$.`),
        ]),
      ]),
      example([
        p(
          raw`Find the first three terms in ascending powers of $x$ of $\frac1{\sqrt{4-x}}$.`,
        ),
        m(
          raw`\frac1{\sqrt{4-x}}=(4-x)^{-1/2}=4^{-1/2}\left(1-\frac x4\right)^{-1/2}=\frac12\left(1-\frac x4\right)^{-1/2}`,
        ),
        p(raw`Expand with $n=-\frac12$, $bx=-\frac x4$:`),
        m(
          raw`\begin{aligned}\left(1-\frac x4\right)^{-1/2}&=1+\left(-\frac12\right)\left(-\frac x4\right)+\frac{(-1/2)(-3/2)}2\left(-\frac x4\right)^2+\cdots\\&=1+\frac x8+\frac{3x^2}{128}+\cdots\end{aligned}`,
        ),
        p(
          raw`So $\frac1{\sqrt{4-x}}=\frac12+\frac x{16}+\frac{3x^2}{256}+\cdots$, valid for $|x|<4$.`,
        ),
      ]),
    ]),
    group("Practice Questions", [
      p(
        "1. Expand $(1+3x)^{-1}$ up to the term in $x^3$. State the range of validity.",
      ),
      p(
        raw`2. By differentiating $(1+3x)^{-1}$, show that $(1+3x)^{-2}=1-6x+27x^2+\cdots$`,
      ),
      p(raw`3. Find the first three terms of $f(x)=\frac{4+x}{(1+3x)^2}$.`),
    ]),
    group("Solutions to Practice Questions", [
      example([
        m(
          raw`\begin{aligned}1.\quad(1+3x)^{-1}&=1+(-1)(3x)+\frac{(-1)(-2)}2(3x)^2+\frac{(-1)(-2)(-3)}6(3x)^3+\cdots\\&=1-3x+9x^2-27x^3+\cdots\end{aligned}`,
        ),
        p(raw`valid for $|x|<\frac13$.`),
      ]),
      example([
        p(
          raw`2. $\frac d{dx}(1+3x)^{-1}=-3(1+3x)^{-2}$. From Q1: $\frac d{dx}[1-3x+9x^2-27x^3+\cdots]=-3+18x-81x^2+\cdots$`,
        ),
        p(
          raw`So $-3(1+3x)^{-2}=-3+18x-81x^2+\cdots$, giving $(1+3x)^{-2}=1-6x+27x^2+\cdots$`,
        ),
      ]),
      m(
        raw`\begin{aligned}3.\quad f(x)&=(4+x)(1+3x)^{-2}=(4+x)(1-6x+27x^2+\cdots)\\&=4-24x+108x^2+x-6x^2+\cdots=4-23x+102x^2+\cdots\end{aligned}`,
      ),
    ]),
  ]),
  lesson("4.6 Sequences and Series in Modelling", [
    p(
      "Arithmetic and geometric sequences arise naturally in financial and real-world modelling. Saving schemes with fixed deposits are arithmetic; investments growing by a fixed percentage are geometric.",
    ),
    group("Modelling with Sequences", [
      p(
        "Arithmetic: constant amount added each period (e.g. monthly deposit of £$d$)",
      ),
      p(
        "Geometric: constant percentage change each period (e.g. 5% growth per year)",
      ),
      p(
        "When solving modelling problems, identify whether the situation involves constant difference (arithmetic) or constant ratio (geometric), set up the appropriate formulae, and use logarithms when needed to find $n$.",
      ),
    ]),
    group("Worked Examples", [
      p(
        "Jamie takes out an interest-free loan of £8100. Jamie repays £400 in month 1, £390 in month 2, £380 in month 3, and so on. Show that Jamie repays £290 in month 12. After Jamie’s $N$th payment, the loan is completely paid back. Show that $N^2-81N+1620=0$ and find $N$.",
      ),
      step(1, "", [
        p(
          "This is an AP with $a=400$, $d=-10$. Month 12: $u_{12}=400+11(-10)=400-110=290$.",
        ),
      ]),
      step(2, "Total repaid after N months equals 8100", [
        m(
          raw`\begin{aligned}S_N&=\frac N2(2\times400+(N-1)(-10))=\frac N2(800-10N+10)\\&=\frac N2(810-10N)=8100\end{aligned}`,
        ),
        p(
          "$N(810-10N)=16200$, so $810N-10N^2=16200$, giving $N^2-81N+1620=0$.",
        ),
      ]),
      step(3, "", [
        p("$(N-36)(N-45)=0$. $N=36$ or $N=45$."),
        p(
          "But $u_{36}=400+35(-10)=50>0$ (valid). $u_{45}=400+44(-10)=-40<0$ (invalid — cannot repay a negative amount).",
        ),
        p("Therefore $N=36$."),
      ]),
    ]),
    group("Practice Questions", [
      p(
        "1. A car depreciates by 15% per year. It is worth £20 000 when new. Find its value after 5 years and the time for its value to drop below £5000.",
      ),
      p(
        "2. A savings account pays 3% per year. £1000 is deposited at the start. Find the balance after 10 years.",
      ),
    ]),
    group("Solutions to Practice Questions", [
      example([
        p(
          raw`1. GP with $a=20000$, $r=0.85$. After 5 years: $20000\times0.85^5=20000\times0.4437\approx$ £8874.`,
        ),
        p(raw`For value $<5000$: $20000\times0.85^n<5000$, so $0.85^n<0.25$.`),
        p(
          raw`$n\ln0.85<\ln0.25$, so $n>\frac{\ln0.25}{\ln0.85}=\frac{-1.3863}{-0.16252}\approx8.53$.`,
        ),
        p("After 9 complete years."),
      ]),
      p(raw`2. $1000\times1.03^{10}=1000\times1.3439\approx$ £1343.92.`),
    ]),
  ]),
];
