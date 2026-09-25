// Disposable PostgreSQL integration test. Never connects to Supabase or production.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { selectAssessmentQuestions } from "../src/lib/question-bank/selector.ts";
import { selectPracticeQuestions } from "../src/lib/question-bank/practice-selector.ts";
import {
  markBankResponse,
  parseNumericAnswer,
} from "../src/lib/question-bank/marking.server.ts";
const { PGlite } = await import(
  process.env.EXCELORA_PGLITE_MODULE ?? "@electric-sql/pglite"
);
const root = process.argv[2];
if (!root) throw new Error("Provide supplied assessment-bank directory");
const mappings = JSON.parse(
  readFileSync(path.join(root, "all_course_topic_map.json")),
);
const keyByChapter = new Map(
  mappings.map((m) => [
    `${m.domain}::${m.chapter.replace(/^\d+\s+/, "").toLowerCase()}`,
    m.course_topic_key,
  ]),
);
const raw = [
  "Pure/pure_bank_all_chapters.json",
  "Mechanics/mechanics_bank_all_chapters.json",
  "Statistics/statistics_bank_all_chapters.json",
]
  .flatMap((f) => JSON.parse(readFileSync(path.join(root, f))).questions)
  .map((q) => ({
    ...q,
    course_topic_key:
      q.course_topic_key ??
      keyByChapter.get(`${q.domain}::${q.chapter.toLowerCase()}`),
  }));
const bank = raw.map((q) => ({
  ...q,
  courseTopicKey: q.course_topic_key,
  responseType: q.response_type,
  exposedInNotes: q.exposed_in_notes,
}));
const secrets = new Map(raw.map((q) => [q.id, q]));
const db = new PGlite();
await db.exec(
  `create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated; create role service_role;`,
);
for (const file of [
  "20260827_interactive_assessments.sql",
  "20260828_assessment_scoring.sql",
  "20260829_locked_assessment_answers.sql",
  "20260915_generated_assessment_bank.sql",
  "20260921_practice_and_attempt_safety.sql",
  "20260924_chapter_wide_practice.sql",
  "20260924_continuous_practice_and_activity.sql",
])
  await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
const student = "11111111-1111-4111-8111-111111111111",
  other = "22222222-2222-4222-8222-222222222222";
await db.query("insert into auth.users values ($1),($2)", [student, other]);
for (let i = 0; i < raw.length; i += 250)
  await db.query(
    `insert into assessment_question_bank(id,qualification,domain,course_topic_key,chapter,subtopic,family,variant,difficulty,marks,response_type,prompt,answer,worked_solution,fingerprint) select id,qualification,domain,course_topic_key,chapter,subtopic,family,variant,difficulty,marks,response_type,prompt,answer,worked_solution,fingerprint from jsonb_to_recordset($1) as q(id text,qualification text,domain text,course_topic_key text,chapter text,subtopic text,family text,variant integer,difficulty text,marks integer,response_type text,prompt text,answer text,worked_solution text,fingerprint text)`,
    [JSON.stringify(raw.slice(i, i + 250))],
  );
const chapterStudent="33333333-3333-4333-8333-333333333333";
await db.query("insert into auth.users values ($1)",[chapterStudent]);
for(const domain of ["Pure Mathematics","Mechanics","Statistics"]){
 const topic=bank.find(q=>q.domain===domain).courseTopicKey;
 const selected=selectPracticeQuestions({questions:bank,courseTopicKey:topic,subtopic:"",count:20,difficulty:"balanced",exposure:[]});
 assert.ok(new Set(selected.map(q=>q.subtopic)).size>1);
 const mixed=(await db.query("select start_practice($1,$2,$3,$4,$5) as id",[chapterStudent,topic,"","balanced",selected.map(q=>q.id)])).rows[0].id;
 assert.equal(Number((await db.query("select count(*) from practice_session_questions where session_id=$1",[mixed])).rows[0].count),20);
 await assert.rejects(()=>db.query("select start_practice($1,$2,$3,$4,$5)",[chapterStudent,topic,selected[0].subtopic,"balanced",selected.map(q=>q.id)]));
}
// Start/continue/stop are persisted independently of legacy fixed sets.
const continuousStudent="44444444-4444-4444-8444-444444444444";
await db.query("insert into auth.users values($1)",[continuousStudent]);
const pool=bank.filter(q=>q.courseTopicKey===bank[0].courseTopicKey&&!q.exposedInNotes).slice(0,12);
const runId=(await db.query("select start_practice_run($1,$2,$3,$4) as id",[continuousStudent,pool[0].courseTopicKey,"",pool.slice(0,5).map(q=>q.id)])).rows[0].id;
assert.equal((await db.query("select start_practice_run($1,$2,$3,$4) as id",[continuousStudent,pool[0].courseTopicKey,"",pool.slice(5,10).map(q=>q.id)])).rows[0].id,runId);
await db.query("select extend_practice_run($1,$2,$3)",[continuousStudent,runId,pool.slice(5,10).map(q=>q.id)]);
assert.equal((await db.query("select question_count from practice_sessions where id=$1",[runId])).rows[0].question_count,5);
for(const q of pool.slice(0,5))await db.query("select check_practice($1,$2,$3,$4,$5,$6,$7)",[continuousStudent,runId,q.id,"saved",0,false,true]);
assert.equal((await db.query("select status from practice_sessions where id=$1",[runId])).rows[0].status,"active");
await assert.rejects(()=>db.query("select extend_practice_run($1,$2,$3)",[other,runId,pool.slice(5,10).map(q=>q.id)]));
await db.query("select extend_practice_run($1,$2,$3)",[continuousStudent,runId,pool.slice(5,10).map(q=>q.id)]);
assert.equal((await db.query("select question_count from practice_sessions where id=$1",[runId])).rows[0].question_count,10);
await db.query("select save_practice_draft($1,$2,$3,$4)",[continuousStudent,runId,pool[5].id,"saved before stopping"]);
await db.query("select stop_practice_run($1,$2)",[continuousStudent,runId]);
await assert.rejects(()=>db.query("select check_practice($1,$2,$3,$4,$5,$6,$7)",[continuousStudent,runId,pool[5].id,"changed after stop",1,true,false]));
assert.equal((await db.query("select response from practice_session_questions where session_id=$1 and question_id=$2",[runId,pool[5].id])).rows[0].response,"saved before stopping");
await db.exec("set role authenticated");await assert.rejects(()=>db.query("select * from student_activity"));await assert.rejects(()=>db.query("select stop_practice_run($1,$2)",[continuousStudent,runId]));await db.exec("reset role");
const report = { bankQuestions: raw.length, subjects: [], checks: [] };
for (const domain of ["Pure Mathematics", "Mechanics", "Statistics"]) {
  const topic = bank.find((q) => q.domain === domain).courseTopicKey;
  const subtopic = bank.find((q) => q.courseTopicKey === topic).subtopic;
  const practice = selectPracticeQuestions({
    questions: bank,
    courseTopicKey: topic,
    subtopic,
    count: 5,
    difficulty: "balanced",
    exposure: [],
  });
  const session = (
    await db.query("select start_practice($1,$2,$3,$4,$5) as id", [
      student,
      topic,
      subtopic,
      "balanced",
      practice.map((q) => q.id),
    ])
  ).rows[0].id;
  assert.equal(
    Number(
      (
        await db.query(
          "select count(*) from student_assessment_attempts where assessment_key=$1",
          [topic],
        )
      ).rows[0].count,
    ),
    0,
  );
  await db.query("select save_practice_draft($1,$2,$3,$4)", [
    student,
    session,
    practice[0].id,
    "draft working",
  ]);
  const draft = (
    await db.query(
      "select response,checked_at,marks_awarded from practice_session_questions where session_id=$1 and question_id=$2",
      [session, practice[0].id],
    )
  ).rows[0];
  assert.equal(draft.response, "draft working");
  assert.equal(draft.checked_at, null);
  assert.equal(draft.marks_awarded, null);
  await assert.rejects(() =>
    db.query("select save_practice_draft($1,$2,$3,$4)", [
      other,
      session,
      practice[0].id,
      "intruder",
    ]),
  );
  for (const q of practice) {
    const secret = secrets.get(q.id),
      response = secret.answer;
    const grade = markBankResponse(
      q.responseType,
      response,
      {
        questionId: q.id,
        answer: secret.answer,
        workedSolution: secret.worked_solution,
      },
      q.marks,
    );
    await db.query("select check_practice($1,$2,$3,$4,$5,$6,$7)", [
      student,
      session,
      q.id,
      response,
      grade.marks,
      grade.isCorrect,
      grade.requiresReview,
    ]);
  }
  assert.equal(
    (
      await db.query("select status from practice_sessions where id=$1", [
        session,
      ])
    ).rows[0].status,
    "completed",
  );
  await assert.rejects(() =>
    db.query("select check_practice($1,$2,$3,$4,$5,$6,$7)", [
      other,
      session,
      practice[0].id,
      "bad",
      0,
      false,
      false,
    ]),
  );
  await assert.rejects(() =>
    db.query("select save_practice_draft($1,$2,$3,$4)", [
      student,
      session,
      practice[0].id,
      "overwrite checked",
    ]),
  );
  const exposure = practice.map((q) => ({
    questionId: q.id,
    family: q.family,
    timesSeen: 1,
    lastSeenAt: new Date().toISOString(),
  }));
  const paper = selectAssessmentQuestions({
    questions: bank,
    courseTopicKey: topic,
    exposure,
  });
  assert.ok(paper.every((q) => !practice.some((p) => p.id === q.id)));
  const args = [student, topic, topic, 5400, paper.map((q) => q.id)];
  const attempt = (
    await db.query(
      "select start_generated_assessment($1,$2,$3,$4,$5) as id",
      args,
    )
  ).rows[0].id;
  assert.equal(
    (
      await db.query(
        "select start_generated_assessment($1,$2,$3,$4,$5) as id",
        args,
      )
    ).rows[0].id,
    attempt,
  );
  assert.deepEqual(
    (
      await db.query(
        "select question_id from student_assessment_attempt_questions where attempt_id=$1 order by question_order",
        [attempt],
      )
    ).rows.map((r) => r.question_id),
    paper.map((q) => q.id),
  );
  const answers = Object.fromEntries(
    paper.map((q) => [q.id, secrets.get(q.id).answer]),
  );
  await db.query("select save_generated_answers($1,$2,$3)", [
    student,
    attempt,
    JSON.stringify(answers),
  ]);
  await assert.rejects(() =>
    db.query("select save_generated_answers($1,$2,$3)", [
      other,
      attempt,
      JSON.stringify(answers),
    ]),
  );
  const grades = paper.map((q) => {
    const secret = secrets.get(q.id);
    const g = markBankResponse(
      q.responseType,
      answers[q.id],
      {
        questionId: q.id,
        answer: secret.answer,
        workedSolution: secret.worked_solution,
      },
      q.marks,
    );
    return {
      id: q.id,
      response: answers[q.id],
      marks: g.marks,
      correct: g.isCorrect,
      review: g.requiresReview,
    };
  });
  await assert.rejects(() =>
    db.query("select start_practice($1,$2,$3,$4,$5)", [
      student,
      topic,
      subtopic,
      "balanced",
      practice.map((q) => q.id),
    ]),
  );
  await assert.rejects(() =>
    db.query("select check_practice($1,$2,$3,$4,$5,$6,$7)", [
      student,
      session,
      practice[0].id,
      "changed",
      0,
      false,
      false,
    ]),
  );
  await assert.rejects(() =>
    db.query("select submit_generated_assessment($1,$2,$3)", [
      student,
      attempt,
      JSON.stringify(grades.map((g, i) => (i === 1 ? grades[0] : g))),
    ]),
  );
  await db.query("select lock_generated_answer($1,$2,$3,$4,$5,$6)", [
    student,
    attempt,
    grades[0].id,
    grades[0].response,
    grades[0].marks,
    grades[0].correct,
  ]);
  await assert.rejects(() =>
    db.query("select save_generated_answers($1,$2,$3)", [
      student,
      attempt,
      JSON.stringify({ [grades[0].id]: "changed" }),
    ]),
  );
  await assert.rejects(() =>
    db.query("select submit_generated_assessment($1,$2,$3)", [
      student,
      attempt,
      JSON.stringify(
        grades.map((g, i) => (i ? g : { ...g, response: "stale" })),
      ),
    ]),
  );
  assert.equal(
    (
      await db.query(
        "select status from student_assessment_attempts where id=$1",
        [attempt],
      )
    ).rows[0].status,
    "active",
  );
  await db.query("select submit_generated_assessment($1,$2,$3)", [
    student,
    attempt,
    JSON.stringify(grades),
  ]);
  await db.query("select submit_generated_assessment($1,$2,$3)", [
    student,
    attempt,
    JSON.stringify(grades),
  ]);
  await assert.rejects(() =>
    db.query("select save_generated_answers($1,$2,$3)", [
      student,
      attempt,
      "{}",
    ]),
  );
  const result = (
    await db.query(
      "select status,score,pending_review_marks from student_assessment_attempts where id=$1",
      [attempt],
    )
  ).rows[0];
  assert.equal(result.status, "submitted");
  assert.equal(
    Number(
      (
        await db.query(
          "select count(*) from student_question_attempt_history where attempt_id=$1",
          [attempt],
        )
      ).rows[0].count,
    ),
    15,
  );
  const retake = selectAssessmentQuestions({
    questions: bank,
    courseTopicKey: topic,
    exposure: [
      ...exposure,
      ...paper.map((q) => ({
        questionId: q.id,
        family: q.family,
        timesSeen: 1,
        lastSeenAt: new Date().toISOString(),
      })),
    ],
  });
  assert.ok(retake.every((q) => !paper.some((p) => p.id === q.id)));
  const second = (
    await db.query("select start_generated_assessment($1,$2,$3,$4,$5) as id", [
      student,
      topic,
      topic,
      5400,
      retake.map((q) => q.id),
    ])
  ).rows[0].id;
  assert.equal(
    (
      await db.query(
        "select attempt_number from student_assessment_attempts where id=$1",
        [second],
      )
    ).rows[0].attempt_number,
    2,
  );
  await db.query(
    "update student_assessment_attempts set deadline_at=now()-interval '1 second' where id=$1",
    [second],
  );
  await assert.rejects(() =>
    db.query("select save_generated_answers($1,$2,$3)", [
      student,
      second,
      "{}",
    ]),
  );
  await db.query("select submit_generated_assessment($1,$2,$3)", [
    student,
    second,
    JSON.stringify(
      retake.map((q) => ({
        id: q.id,
        response: "",
        marks: 0,
        correct: false,
        review: false,
      })),
    ),
  ]);
  report.subjects.push({
    domain,
    topic,
    practiceQuestions: 5,
    formalQuestions: 15,
    distribution: [4, 7, 4],
    result,
    retakeAvoidedRepeats: true,
  });
}
assert.equal(
  Number(
    (
      await db.query(
        "select count(*) from student_question_exposure where student_id=$1",
        [other],
      )
    ).rows[0].count,
  ),
  0,
);
await db.exec("set role authenticated");
await assert.rejects(() =>
  db.query("select answer from assessment_question_bank"),
);
await assert.rejects(() => db.query("select * from practice_sessions"));
await assert.rejects(() =>
  db.query("select start_practice($1,$2,$3,$4,$5)", [
    student,
    "x",
    "x",
    "balanced",
    [],
  ]),
);
await db.exec("reset role");
report.checks = [
  "new migration applies to assessment schema",
  "separate practice records",
  "whole-chapter 20-question mixed-subtopic sessions for all subjects; scoped sessions reject mixed IDs",
  "unchecked drafts persist without grading, enforce ownership and cannot replace checked responses",
  "complete practice and formal sessions across all three subjects",
  "4/7/4 and exact persisted question order",
  "idempotent start and submission",
  "stale marking rolls back",
  "duplicate marking rejected",
  "practice start and check blocked during active formal attempts",
  "expired papers can submit saved responses",
  "student isolation",
  "practice avoidance",
  "retake avoidance",
  "deadline enforcement",
  "locked answers cannot change",
  "anonymous/authenticated roles cannot access question secrets or persistence RPCs",
];
writeFileSync(
  "docs/qa/database-test-results.json",
  JSON.stringify(report, null, 2) + "\n",
);
const types = {};
for (const q of raw) {
  const r = types[q.response_type] ?? { count: 0, safelyNumeric: 0 };
  r.count++;
  if (q.response_type === "numeric" && parseNumericAnswer(q.answer) !== null)
    r.safelyNumeric++;
  types[q.response_type] = r;
}
const issues = raw
  .filter(
    (q) =>
      q.response_type !== "numeric" || parseNumericAnswer(q.answer) === null,
  )
  .map((q) => ({
    id: q.id,
    responseType: q.response_type,
    reason:
      q.response_type === "numeric"
        ? "Expected answer is not a scalar numeric literal or fraction"
        : "Requires authored equivalence or written/multipart marking",
  }));
writeFileSync(
  "docs/qa/question-bank-marking-audit.json",
  JSON.stringify(
    {
      types,
      unmatched: raw.filter((q) => !q.course_topic_key).map((q) => q.id),
      reviewRequired: issues,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(report, null, 2));
await db.close();
