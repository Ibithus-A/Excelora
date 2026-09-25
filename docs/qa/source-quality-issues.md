# Source and bank quality issues

The original PDFs remain available for comparison. A draft conversion preserves a questionable source claim rather than silently correcting it. The following require editorial review:

- Pure 2.4: the counterexample discussion dismisses n=1 as “not explicitly claimed to be” prime while continuing the search. Check the exact proposition and explanation. The modulus counterexample example demonstrates a failing interval, not a complete characterization.
- Statistics 1.1/1.2: broad claims that census results are completely accurate or that a sampling method is free from bias need context. Sampling 1.2 contains `85/300 × 80 = 22.6 ≈ 23`; the truncated intermediate value is preserved.
- Statistics 2.4: the standard-deviation coding formula assumes a positive scale b without explicitly stating it. The native draft preserves the source formula; an approved correction should address negative b.
- Statistics 2.4 PDF ends with only a fragment of an “End of Topic Assessment / 15 QUESTIONS”, repeats question number 3 and stops at question 4(a). The fragment has been retained in the draft. It refers to a histogram that is absent from the available fragment; no histogram has been invented.
- Mechanics 1.2: inverse tangent direction calculations require quadrant handling. Review the original wording before any correction.
- Mechanics 4.1: acceleration zero is stated as a condition for maximum velocity without specifying the required sign/second-derivative test. Mechanics 4.2 similarly states an inflection condition without qualification. These are source claims, not new assertions added by conversion.
- Mechanics 9.1: the component-ratio condition for parallel vectors needs care when a component is zero; the original expression is preserved.
- Bank response types do not consistently indicate answer structure. Some “numeric” answers include several values or units; symbolic questions can require a model, prediction and written limitation without explicit part labels.
- Bank fields mix dollar-delimited LaTeX, undelimited LaTeX, over-escaped commands, Unicode mathematics and plain-text notation. Delimited rendering alone is insufficient to approve all items.
- The imported schema has no authored per-part marks, rounding tolerances or diagram specification. Sixteen sketch prompts were identified (cubic/trigonometric); a saved sketch input is available, but automated graph marking is not.

The machine-readable marking audit lists every question currently outside the safely parseable single-numeric subset. No question should be considered fully supported solely because its chapter mapping succeeds.

- Pure 4.2: the solution to `S₄=5S₂` cancels `1−r²` and excludes `r=−1` without justification; an alternating sequence with r=−1 also has S₂=S₄=0. The source solution has been preserved for review. The logarithm formula for finding n also needs positive-domain conditions.
- Pure 4.3: practice question 3 specifies its recurrence for n>1, but the worked solution applies it at n=1 to obtain u₂. The draft retains both the question and solution as supplied.

- Statistics 6.2: practice solution 1(b) prints 0.2327 for B(36,0.08) at 3; direct calculation gives approximately 0.233328. Practice solution 3(b) prints approximately 0.016 for 32 or more heads in 50 fair flips; direct calculation gives approximately 0.032454.
- Statistics 7.1: the definition of actual significance level mixes the observed-value tail probability with the probability of the whole critical region. Practice solution 2 prints 0.1031 for the die-test lower tail; direct calculation gives approximately 0.102790, without changing its decision at 5%.
- Statistics 7.2: the two-tailed B(25,0.4) practice solution gives upper region X≥14 using incorrect probabilities. Direct calculation gives P(X≥14)≈0.077801 and P(X≥15)≈0.034392. Under its stated 5%-per-tail rule, the upper region should be X≥15. **This changes the answer and must be resolved before approval.** The native draft preserves the original PDF; see source-numeric-audit.json for the calculation evidence.
- Mechanics 2.3: vertical-motion illustrations were redrawn on a single vertical line to avoid implying horizontal travel in a vertical-motion problem. All source quantities and direction labels are retained. This visual normalization needs the owner's source-comparison approval along with the other drafts.

- Statistics 9.2: the introduction says the ace probability “rises” from 4/52 to 1/13 on learning that the card is a diamond. Those are equal; the draft preserves the source statement for editorial correction. The independence formula also requires positive-probability conditioning events.
- Statistics 9.4 includes Section 5 “Tree diagrams”, all 15 end-of-topic assessment questions and only the solutions to Questions 1–2. The PDF stops there. The native draft retains the complete available material; solutions 3–15 have not been invented.
- Statistics 9.4 assessment Question 1 asks for a mutually exclusive pair among three events whose pairwise overlaps are all positive. Its solution acknowledges this mismatch. Several assessment questions refer to Venn diagrams not drawn in the supplied PDF; regional probabilities are retained as text rather than inventing missing diagrams.
- Statistics 9.4 assessment Question 2 is internally inconsistent. Its solution derives x=0.10, which with the B-only probability 0.20 gives P(B)=0.30 rather than the stated 0.35. The stated six regions total 0.97 using that solution, and its final check inserts an unexplained extra 0.03. This requires editorial correction before approval.

## Statistics Chapter 8 — regression and correlation

- **8.1 Exponential Models:** The power-law introduction permits any real `a`, but taking real logarithms requires positive `a`, `x` and `y`. The source statement is retained for comparison; clarify the domain during editorial approval.
- **8.2 Measuring Correlation:** The source practice solutions report correlations −0.874, −0.986 and 0.962. Recomputing from the supplied raw pairs gives approximately −0.854152, −0.979511 (using unrounded base-10 logarithms) and 0.948861 respectively. The worked windspeed example's 0.9533 is consistent with its data. Original answers remain in the draft; see `correlation-source-audit.json`.
- **8.3 Hypothesis Testing for Zero Correlation, Practice 4:** The table labelled `n=10` reports 0.4716, 0.5822, 0.6664 and 0.7498. Numerical integration of the null Pearson-r density gives approximately 0.4428, 0.5494, 0.6319 and 0.7155 at one-tailed 10%, 5%, 2.5% and 1%. Thus `r=0.66` rejects at 2.5% among the listed levels, rather than the source's 5%. Its continuous one-tailed p-value is approximately 0.018913; “least possible” also needs clarification if it means the smallest tabulated level. Other critical values in this lesson agree to the stated precision. The source table and conclusion are preserved, pending editorial correction.
- Chapter 8's PDFs contain prose, equations and tables, with no supplied scatter plots to reconstruct. Native pages retain their table data without inventing scatter diagrams.

## Statistics Chapter 5 — probability

- **5.4 Tree Diagrams:** The supplied PDF contains an “End of Topic Assessment — 15 QUESTIONS” heading but stops at question 6(a). There are no later questions or assessment solutions in this file. The native draft preserves the complete supplied fragment without inventing the missing material; this static source section is separate from the generated formal assessment.
- **5.2 Venn Diagrams:** The source's generic two-set Venn diagram is reconstructed in the shared native diagram frame, with the sample space, sets, exclusive regions and intersection labelled. The worked/practice solutions give region counts in prose rather than additional drawn diagrams; those remain as supplied.

## Statistics Chapter 3 — representations of data

- **3.2 Box Plots, Practice 1:** The source declares 40 an outlier but calculates an upper fence of 44.5 under its own 1.5×IQR rule. With minimum 5 and maximum 40, neither is outside the stated fences. The contradictory question and solution are preserved pending correction.
- **3.2 Box Plots, Practice 2:** Class B's median 65 is 10 above Q1=55 and 9 below Q3=74. The source nevertheless describes it as closer to Q1 and positively skewed. The original statement remains in the draft for comparison.
- **3.2 generic box plot:** The source diagram has no variable or unit label, despite its prose requiring one. No variable or units have been invented. PDF vector coordinates place its five features at 10, 22.5, 35, 50 and 60 on a 0–80 axis; these positions and its displayed 0–70 ticks are preserved.
- **3.4 Histograms:** The worked solution begins with the erroneous fraction `(45−36)/5`, then explicitly corrects it to `4/5`. Both the false start and correction remain, as supplied.
- **3.5 Comparing Data Sets:** “More reliable bolts” is inferred solely from lower variation without a target dimension or tolerance; the statement should be qualified during editorial review. The description of median/IQR as “not affected” by extreme values is also stronger than the usual resistance claim.
- The cumulative-frequency and histogram PDFs supply tables and calculations but no drawn graphs. The native drafts preserve that source structure.

## Statistics Chapter 4 — correlation

- **4.1 Scatter Diagrams and Correlation:** The three schematic scatter patterns are reconstructed from the PDF vector point centres, with no added fitted lines or invented observations. They are stacked in their original order for mobile readability. Generic x/y axis labels come from the source's explanatory/response-variable prose; the source schematics have no numerical ticks or units.
- **4.2 Regression Lines:** The source states without qualification that interpolation is reliable. Reliability also depends on model fit and the data; the original claim and worked-solution wording are preserved pending editorial qualification. The exam-score example also assumes a maximum of 100 in its solution without specifying that maximum in the question.

## Pure Chapters 5–10 — source issues retained in native drafts

- **5.4:** The solution to `y=2 sin(3x)` lists only multiples of π/3 as zeros; the intervening odd multiples of π/6 are missing.
- **5.8:** `tan α=b/a` needs a quadrant convention and treatment of a=0. The source does not give those qualifications.
- **5.10:** The source mixes degree symbols inside and outside cosine arguments; that notation is retained rather than silently rewritten.
- **6.2 Practice 1:** The original logarithms admit both positive and negative nonzero x, but the solution expands `log(x²)` as `2 log x` and omits the negative root −2√2.
- **6.3:** The population example extrapolates with rounded growth constants; the stated 2004–2007 data span appears only in its solution.
- **7.4:** The normal-gradient formula needs a separate treatment when f′(a)=0.
- **7.5:** The derivative of arcsin(2x) is finite only for −1/2<x<1/2; the source includes the endpoints and calls cos(y) positive on a closed interval where it can be zero.
- **8.1:** The standard integral formulas involving 1/k require k≠0.
- **8.2:** The source's limiting-sum notation uses fixed integer bounds without a partition definition; preserved as printed.
- **8.6:** Separation divides by `(2y−1)(y−3)`. The displayed family includes y=3 at A=0 but misses the constant solution y=1/2. The source's “general solution” claim needs qualification.
- **9.1/9.3:** For x+tan(x/2), recomputed f(3.7)≈0.211940 and f′(3.7)≈7.583280, rather than 0.320 and 7.215. The root-bracketing signs remain valid, but the stated Newton step is inaccurate.
- **9.2:** Starting at 2, fixed-point iteration gives approximately 2.223980, 2.268372, 2.276967; the source's latter two iterates are incorrect.
- **9.3 Practice 1:** The second Newton update from x₂=7/3 is approximately 2.280556, rather than the source's 2.206.
- **9.4:** The runway example calls its concave-up trapezium estimate an underestimate, contradicting the rule above it. For exp(−x²), concavity changes at 1/√2, so the blanket concavity/overestimate explanation in Practice 2 is invalid.
- **10.3:** The claimed collinear points are not collinear: AB=(−2,−4,6), while −2AC=(−2,−4,2). The source's proof is false and remains flagged for correction.

## Final Normal Distribution conversions — 23 September 2026

The native pages preserve the printed values below. These are source issues for editorial correction, not permission to silently change the duplicate.

- **10.6, general guidance:** the source treats closeness of p to 0.5 as a necessary condition for a useful approximation. Accuracy also depends on n; the blanket rejection of B(300,0.85) needs review. Its “always extends the interval” continuity-correction shortcut is unsafe for strict inequalities; use the explicit five cases printed above it.
- **10.6, Example 3.6.3:** rounding both probabilities before calculating percentage error yields the printed 0.82%; using unrounded values gives approximately 0.915%. The transcription retains the source calculation.
- **10.6, Practice 2:** direct normal-CDF recomputation gives approximately 0.1253, 0.0946 and 0.6723; the first and third printed answers are 0.1288 and 0.6755.
- **10.6, Practice 3:** the stated normal model and continuity correction give approximately 0.00604, not the printed 0.00721.
- **10.6, Practice 4:** B(100,0.56) gives P(X=55)≈0.0783832 and its corrected normal approximation gives ≈0.0786272. The printed 0.0761 and 0.0801, and hence 5.26% error, are incorrect.
- **10.7, Example 3.7.2:** rounding critical-region boundaries to three significant figures changes the actual rejection region. Retain unrounded boundaries for decisions near the cutoff; the printed example observation is beyond either boundary.
- **10.7, Practice 2:** “0.02275 (4 d.p.)” has five decimal places; four decimal places would be 0.0228.
- **Mechanics 3.3:** the PDF includes a 15-question static assessment without supplied solutions. All questions are retained as lesson content; no solutions were invented and this does not replace the separately generated formal assessment.

The recomputations above use the normal CDF `0.5*(1+erf((x-mu)/(sigma*sqrt(2))))` and exact binomial coefficients, independently of the lesson renderer.
