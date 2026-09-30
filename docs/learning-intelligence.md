# Learning intelligence

Excelora's learning-intelligence layer turns marked work into a compact, durable learner profile. It is intentionally built on top of the existing question bank and assessment records rather than copying question text into analytics tables.

## Data flow

1. A marked practice, generated-assessment or quiz answer creates one `student_learning_events` row.
2. An incorrect or partially correct marked answer creates or reactivates one `student_review_cards` row for that student and question.
3. The dashboard aggregates learning events into the 52-week activity heatmap, topic accuracy, streak and focus recommendation.
4. The current and recent weekly/monthly periods are saved as `student_learning_reports` snapshots for consistent tutor review.
5. When there is enough evidence (at least three recent questions and a score below 85%), a database trigger gives the student at most one adaptive homework quiz per week. Due review-card questions are prioritised. This does not depend on either dashboard being open.

Answers that require tutor review are not treated as mistakes until they have a final mark. If a pending answer is later marked fully correct, an untouched review card created from that answer is removed.

## Supabase migration

Apply `supabase/migrations/20260930000000_learning_intelligence.sql` before enabling the dashboard in production. It:

- creates `student_learning_events`, `student_review_cards` and `student_learning_reports`;
- installs service-only RLS policies and indexes;
- adds database triggers for practice, assessment and quiz outcomes;
- creates adaptive homework directly from new marked-answer events;
- backfills retained marked work;
- adds `assignment_source` and `recommendation_reason` to quizzes;
- permits a `null` tutor for system-created adaptive quizzes.

The API continues to use the server-side service-role client. The new tables are not directly readable or writable from the browser.

## Storage profile

Question prompts, answers and worked solutions remain in `assessment_question_bank`; review cards only store scheduling state and a question reference. Reports store small aggregates and short JSON topic lists. The only growing table is `student_learning_events`, with one row per marked question.

As a practical planning range, one million learning-event rows will usually consume hundreds of megabytes once PostgreSQL indexes and text topic keys are included. Exact size depends on key lengths and database settings. This is modest for normal early usage, but event-table size and index bloat should be monitored once the product reaches millions of attempts. At that point, retain report snapshots indefinitely and consider yearly partitioning or archiving old raw events.

## Scheduling

Reports are refreshed idempotently when the learning dashboard is opened, so no scheduler is required for correctness. For emailed reports or guaranteed generation when nobody opens the dashboard, schedule a weekly/monthly server job that calls the same report-generation service. Do not expose the service-role key to the scheduled client.

Adaptive homework does not require a scheduler: the database evaluates the student's recent topic record whenever a marked learning event is inserted or receives a final tutor mark.
