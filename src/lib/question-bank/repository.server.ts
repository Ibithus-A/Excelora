import { createAdminClient } from "../supabase/admin";
import type { BankQuestion, QuestionExposure } from "./bank-types";
export const PUBLIC_BANK_FIELDS =
  "id,qualification,domain,course_stage,course_topic_key,chapter,subtopic,spec_refs,family,variant,difficulty,marks,response_type,prompt,tags,fingerprint,exposed_in_notes";
export function toBankQuestion(row: Record<string, unknown>): BankQuestion {
  return {
    id: String(row.id),
    qualification: String(row.qualification),
    domain: String(row.domain),
    courseStage: row.course_stage ? String(row.course_stage) : null,
    courseTopicKey: String(row.course_topic_key),
    chapter: String(row.chapter),
    subtopic: String(row.subtopic),
    specRefs: (row.spec_refs as string[]) ?? [],
    family: String(row.family),
    variant: Number(row.variant),
    difficulty: row.difficulty as BankQuestion["difficulty"],
    marks: Number(row.marks),
    responseType: String(row.response_type),
    prompt: String(row.prompt),
    tags: (row.tags as string[]) ?? [],
    fingerprint: String(row.fingerprint),
    exposedInNotes: Boolean(row.exposed_in_notes),
  };
}
export async function loadBank(topic: string) {
  const admin = createAdminClient();
  const all: BankQuestion[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await admin
      .from("assessment_question_bank")
      .select(PUBLIC_BANK_FIELDS)
      .eq("course_topic_key", topic)
      .eq("exposed_in_notes", false)
      .order("id")
      .range(offset, offset + 999);
    if (error) throw new Error(error.message);
    all.push(...(data ?? []).map(toBankQuestion));
    if (!data || data.length < 1000) break;
  }
  return all;
}
/** Practice exposure is derived from separately persisted session membership. */
export async function loadExposure(
  student: string,
  topic: string,
): Promise<QuestionExposure[]> {
  const admin = createAdminClient();
  const { data: formal, error } = await admin
    .from("student_question_exposure")
    .select("question_id,family,times_seen,last_seen_at")
    .eq("student_id", student)
    .eq("course_topic_key", topic);
  if (error) throw new Error(error.message);
  const result = new Map(
    (formal ?? []).map((r) => [
      r.question_id,
      {
        questionId: r.question_id,
        family: r.family,
        timesSeen: r.times_seen,
        lastSeenAt: r.last_seen_at,
      },
    ]),
  );
  for (let offset = 0; ; offset += 1000) {
    const { data, error: practiceError } = await admin
      .from("practice_session_questions")
      .select(
        "question_id,practice_sessions!inner(student_id,course_topic_key,created_at),assessment_question_bank(family)",
      )
      .eq("practice_sessions.student_id", student)
      .eq("practice_sessions.course_topic_key", topic)
      .order("session_id")
      .order("question_order")
      .range(offset, offset + 999);
    if (practiceError) throw new Error(practiceError.message);
    for (const row of data ?? []) {
      const session = Array.isArray(row.practice_sessions)
        ? row.practice_sessions[0]
        : row.practice_sessions;
      const q = Array.isArray(row.assessment_question_bank)
        ? row.assessment_question_bank[0]
        : row.assessment_question_bank;
      const old = result.get(row.question_id);
      result.set(row.question_id, {
        questionId: row.question_id,
        family: q?.family ?? "",
        timesSeen: (old?.timesSeen ?? 0) + 1,
        lastSeenAt:
          old?.lastSeenAt && old.lastSeenAt > session.created_at
            ? old.lastSeenAt
            : session.created_at,
      });
    }
    if (!data || data.length < 1000) break;
  }
  return [...result.values()];
}
