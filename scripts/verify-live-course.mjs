// Isolated QA identities only. No emails, paid AI requests, or existing student mutations.
import { A_LEVEL_MATHS_SUBJECTS } from "../src/lib/seed.ts";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
const created = [],
  checks = [];
const base = "http://127.0.0.1:3007";
let failure;
async function account(role) {
  const email = `excelora-qa-${randomUUID()}@example.invalid`,
    password = randomUUID() + randomUUID();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Temporary course QA" },
    app_metadata: { role },
  });
  if (error) throw error;
  created.push(data.user.id);
  const { error: e } = await admin
    .from("profiles")
    .update({ role, plan: "plus" })
    .eq("id", data.user.id);
  if (e) throw e;
  const cookies = new Map();
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll: (items) =>
        items.forEach(({ name, value }) => cookies.set(name, value)),
    },
  });
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  return {
    id: data.user.id,
    client,
    request: async (path, method = "GET", body) => {
      const r = await fetch(base + path, {
        method,
        headers: {
          Cookie: [...cookies].map(([n, v]) => `${n}=${v}`).join("; "),
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: r.status, data: await r.json() };
    },
  };
}
try {
  const student = await account("student"),
    other = await account("student"),
    tutor = await account("tutor");
  assert.equal(
    (await other.request("/api/student-progress?studentId=" + student.id))
      .status,
    403,
  );
  checks.push("student cannot read another student");
  const meta = {
    topicId: "qa-lesson-indices",
    topicTitle: "1.1 Laws of Indices",
    chapterTitle: "Chapter 1: Algebra and Functions",
    subjectTitle: "Pure Mathematics",
  };
  const complete = await student.request("/api/student-progress", "POST", {
    action: "complete-notes",
    ...meta,
  });
  assert.equal(complete.status, 200, JSON.stringify(complete.data));
  const saved = await admin
    .from("student_topic_progress")
    .select("status,watched_video")
    .eq("student_id", student.id)
    .eq("topic_id", meta.topicId)
    .single();
  assert.equal(saved.data.status, "completed");
  assert.equal(saved.data.watched_video, false);
  checks.push(
    "authenticated notes completion persists without claiming video watched",
  );
  const leaked = await other.client
    .from("student_topic_progress")
    .select("id")
    .eq("student_id", student.id);
  assert.equal(leaked.data?.length ?? 0, 0);
  checks.push("database RLS isolates lesson progress");
  const assessmentKey = "pure-mathematics:chapter-1-algebra-and-functions";
  const preview = await tutor.request("/api/practice", "POST", {
    action: "start",
    assessmentKey,
    subtopic: "",
  });
  assert.equal(preview.status, 200, JSON.stringify(preview.data));
  assert.equal(preview.data.session.preview, true);
  assert.equal(preview.data.session.questions.length, 5);
  assert.ok(!("answer" in preview.data.session.questions[0]));
  const previewCheck = await tutor.request("/api/practice", "POST", {
    action: "check",
    assessmentKey,
    sessionId: "preview",
    questionId: preview.data.session.questions[0].id,
    response: "4",
  });
  assert.equal(previewCheck.status, 200);
  assert.ok("answer" in previewCheck.data.previewQuestion);
  checks.push("real tutor practice preview and checking");
  assert.equal(
    (
      await student.request("/api/practice", "POST", {
        action: "check",
        assessmentKey,
        sessionId: "preview",
        questionId: preview.data.session.questions[0].id,
        response: "4",
      })
    ).status,
    403,
  );
  checks.push("student cannot use tutor preview");
  const schema = await admin
    .from("practice_sessions")
    .select("continuous")
    .limit(0);
  if (schema.error) {
    checks.push(
      "BLOCKED: continuous practice/activity migration is not installed",
    );
  } else {
    const beat = await student.request("/api/student-progress", "POST", {
      pageTitle: meta.topicTitle,
      mode: "practice",
    });
    assert.equal(beat.status, 200);
    const start = await student.request("/api/practice", "POST", {
      action: "start",
      assessmentKey,
      subtopic: "",
    });
    assert.equal(start.status, 200, JSON.stringify(start.data));
    let session = start.data.session;
    assert.equal(session.questions.length, 5);
    assert.ok(
      session.questions.every(
        (q) => !("answer" in q) && !("worked_solution" in q),
      ),
    );
    assert.equal(
      (
        await student.request("/api/practice", "POST", {
          action: "start",
          assessmentKey,
          subtopic: "",
        })
      ).data.session.id,
      session.id,
    );
    for (const q of session.questions) {
      const checked = await student.request("/api/practice", "POST", {
        action: "check",
        assessmentKey,
        sessionId: session.id,
        questionId: q.id,
        response: "4",
      });
      assert.equal(checked.status, 200);
      session = checked.data.session;
    }
    assert.equal(session.status, "active");
    const extended = await student.request("/api/practice", "POST", {
      action: "next",
      assessmentKey,
      sessionId: session.id,
    });
    assert.equal(extended.status, 200, JSON.stringify(extended.data));
    session = extended.data.session;
    assert.equal(session.questions.length, 10);
    assert.equal(
      (
        await other.request(
          `/api/practice?assessmentKey=${assessmentKey}&sessionId=${session.id}`,
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await student.request("/api/practice", "POST", {
          action: "save",
          assessmentKey,
          sessionId: session.id,
          questionId: session.questions[5].id,
          response: "Preserved before stopping",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await student.request("/api/practice", "POST", {
          action: "stop",
          assessmentKey,
          sessionId: session.id,
        })
      ).status,
      200,
    );
    const refresh = await student.request(
      `/api/practice?assessmentKey=${assessmentKey}&sessionId=${session.id}`,
    );
    assert.equal(refresh.data.session.status, "completed");
    assert.equal(
      refresh.data.session.questions[5].response,
      "Preserved before stopping",
    );
    const dashboard = await tutor.request(
      "/api/student-progress?studentId=" + student.id,
    );
    assert.equal(dashboard.status, 200);
    assert.ok(dashboard.data.practice.some((s) => s.id === session.id));
    const review = await tutor.request(
      `/api/student-progress?studentId=${student.id}&sessionId=${session.id}`,
    );
    assert.equal(review.status, 200);
    assert.equal(review.data.answers.length, 10);
    checks.push(
      "real student continuous start/resume/check/extend/save/stop/refresh",
      "practice isolation",
      "tutor activity and saved response review",
    );
    for (const title of A_LEVEL_MATHS_SUBJECTS[0].chapters[0].subtopics.filter(
      (t) => /^\d/.test(t),
    )) {
      const result = await student.request("/api/student-progress", "POST", {
        action: "complete-notes",
        topicId: "qa-" + title,
        topicTitle: title,
        chapterTitle: meta.chapterTitle,
        subjectTitle: meta.subjectTitle,
      });
      assert.equal(result.status, 200, JSON.stringify(result.data));
    }
    assert.equal(
      (
        await other.request("/api/assessments", "PATCH", {
          studentId: student.id,
          assessmentKey,
          isUnlocked: true,
        })
      ).status,
      403,
    );
    const unlocked = await tutor.request("/api/assessments", "PATCH", {
      studentId: student.id,
      assessmentKey,
      isUnlocked: true,
    });
    assert.equal(unlocked.status, 200, JSON.stringify(unlocked.data));
    const formal = await student.request("/api/generated-assessments", "POST", {
      action: "start",
      assessmentKey,
    });
    assert.equal(formal.status, 200, JSON.stringify(formal.data));
    assert.equal(formal.data.attempt.questions.length, 15);
    assert.ok(formal.data.attempt.questions.every((q) => !("answer" in q)));
    assert.equal(
      (
        await student.request("/api/practice", "POST", {
          action: "start",
          assessmentKey,
          subtopic: "",
        })
      ).status,
      403,
    );
    const submitted = await student.request(
      "/api/generated-assessments",
      "POST",
      {
        action: "submit",
        assessmentKey,
        attemptId: formal.data.attempt.id,
        answers: {},
      },
    );
    assert.equal(submitted.status, 200, JSON.stringify(submitted.data));
    assert.equal(submitted.data.attempt.status, "submitted");
    checks.push(
      "real all-module completion and tutor assessment unlock",
      "student cannot unlock assessments",
      "real exact-15 formal paper without answer leakage",
      "formal attempt blocks practice",
      "real formal submission",
    );
  }
} catch (e) {
  failure = e;
} finally {
  for (const id of created) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      failure ??= error;
      checks.push("QA cleanup failure: " + id);
    }
  }
}
const report = {
  date: new Date().toISOString(),
  checks,
  temporaryAuthUsersCreated: created.length,
  cleanupSucceeded: !checks.some((c) => c.startsWith("QA cleanup failure")),
  paidAIRequests: 0,
  existingStudentMutations: 0,
  ...(failure ? { failure: failure.message } : {}),
};
writeFileSync(
  "docs/qa/live-course-tests.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(report);
if (failure) throw failure;
