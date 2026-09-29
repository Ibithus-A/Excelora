import type { SupabaseClient } from "@supabase/supabase-js";

type ProgressRow = { topic_title: string; chapter_title: string | null; subject_title: string | null; status: string; updated_at: string };
type AttemptRow = { assessment_key: string; score: number; total_marks: number; percentage: number | null; submitted_at: string | null };
type HistoryRow = { subtopic: string; marks_awarded: number | null; available_marks: number; attempted_at: string };

export type LearningEvidence = {
  completedTopics: number;
  currentTopics: string[];
  recentAssessments: Array<{ title: string; score: number; total: number; percentage: number; date: string | null }>;
  topicPerformance: Array<{ topic: string; awarded: number; available: number; percentage: number; attempts: number }>;
};

export async function getLearningEvidence(admin: SupabaseClient, userId: string): Promise<LearningEvidence> {
  const [progressResult, attemptsResult, historyResult] = await Promise.all([
    admin.from("student_topic_progress").select("topic_title,chapter_title,subject_title,status,updated_at").eq("student_id", userId).order("updated_at", { ascending: false }).limit(80).returns<ProgressRow[]>(),
    admin.from("student_assessment_attempts").select("assessment_key,score,total_marks,percentage,submitted_at").eq("student_id", userId).eq("status", "submitted").order("submitted_at", { ascending: false }).limit(5).returns<AttemptRow[]>(),
    admin.from("student_question_attempt_history").select("subtopic,marks_awarded,available_marks,attempted_at").eq("student_id", userId).order("attempted_at", { ascending: false }).limit(100).returns<HistoryRow[]>(),
  ]);
  if (progressResult.error) throw progressResult.error;
  if (attemptsResult.error) throw attemptsResult.error;
  if (historyResult.error) throw historyResult.error;
  const aggregates = new Map<string, { awarded: number; available: number; attempts: number }>();
  for (const row of historyResult.data ?? []) {
    const current = aggregates.get(row.subtopic) ?? { awarded: 0, available: 0, attempts: 0 };
    current.awarded += Number(row.marks_awarded ?? 0);
    current.available += Number(row.available_marks ?? 0);
    current.attempts += 1;
    aggregates.set(row.subtopic, current);
  }
  return {
    completedTopics: (progressResult.data ?? []).filter((row) => row.status === "completed").length,
    currentTopics: (progressResult.data ?? []).filter((row) => row.status === "current").slice(0, 5).map((row) => row.topic_title),
    recentAssessments: (attemptsResult.data ?? []).map((row) => ({
      title: row.assessment_key, score: Number(row.score), total: Number(row.total_marks),
      percentage: row.percentage == null ? Math.round(100 * Number(row.score) / Math.max(1, Number(row.total_marks))) : Number(row.percentage),
      date: row.submitted_at,
    })),
    topicPerformance: [...aggregates].map(([topic, value]) => ({
      topic, ...value, percentage: value.available ? Math.round(100 * value.awarded / value.available) : 0,
    })).sort((a, b) => a.percentage - b.percentage || b.attempts - a.attempts),
  };
}

export function summarizeLearningEvidence(evidence: LearningEvidence) {
  const lines = [`Completed lesson topics: ${evidence.completedTopics}.`];
  lines.push(evidence.currentTopics.length ? `Current topics: ${evidence.currentTopics.join(", ")}.` : "No topic is currently marked as in progress.");
  if (evidence.recentAssessments.length) lines.push(`Recent submitted assessments: ${evidence.recentAssessments.map((item) => `${item.title}: ${item.score}/${item.total} (${item.percentage}%)`).join("; ")}.`);
  if (evidence.topicPerformance.length) lines.push(`Question evidence by topic: ${evidence.topicPerformance.slice(0, 8).map((item) => `${item.topic}: ${item.percentage}% across ${item.attempts} attempt${item.attempts === 1 ? "" : "s"}`).join("; ")}. Percentages are deterministic totals, not mastery claims.`);
  return lines.join("\n");
}
