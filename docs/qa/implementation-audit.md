# Historical baseline audit — 21 September 2026

This records the initial state, not the current implementation. See `implementation-status.md` for the 25 September handoff.

Starting working tree: clean. Reviewed course seed/reconciliation, access controls,
assessment configuration, generated route and selector, legacy Chapter 1 input and
renderer, lesson registry/primitives, Arthur/PDF context, migrations and standards.

The 29 chapters use the generated renderer already. Persisted paper IDs and the
4/7/4 selector exist. The renderer lacks a displayed timer, multipart fields and a
maths inserter; tutor marking compares strings. Formal start/save/submit uses
multiple database requests, leaving race/failure windows. Active presentation uses
`select('*')` for attempts and includes marking columns. Arthur checks client-supplied
titles but does not check active attempts. Native content is JSX, not structured
lesson data. Twelve Chapter 1 native lessons exist; remaining lessons use PDFs.
The seed's legacy reconciliation can remove duplicate pages.

User requirements supersede older standards: preserve retakes, and label new native
duplicates until approved. Do not run rebuild_subtopic_pdfs.py: it removes subject
asset directories before rebuilding them.

Bank audit: 4,616 records; five response types. numeric=1,080;
numeric_multi=888; symbolic=288; symbolic_or_written=1,688; short_text=672.
Numeric records are only automatically markable when both values parse safely.
Numeric_multi is potentially partially markable, but needs authored part schemas,
rounding tolerances and mark allocations. Symbolic requires equivalence checking.
Symbolic_or_written and short_text require review, especially proof/explanation
questions: an exact final answer alone cannot establish the required working.
No structured diagram or per-part mark-scheme field exists in the imported schema.
Some questions contain undelimited Unicode mathematics. PDF extraction is not a
faithful native conversion without checking equations, reading order and diagrams.
