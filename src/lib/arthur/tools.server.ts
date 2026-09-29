import type { SupabaseClient } from "@supabase/supabase-js";
import type { CanonicalCourseContext } from "./course-context";
import type { LearningEvidence } from "./learning-context.server";

export type ArthurToolContext = { admin: SupabaseClient; userId: string; course: CanonicalCourseContext; evidence: LearningEvidence };
type ArthurTool = { name: string; matches: (message: string) => boolean; execute: (context: ArthurToolContext) => string };

export const ARTHUR_TOOLS: ArthurTool[] = [
  {
    name: "get_student_progress",
    matches: (message) => /my progress|how have i improved|what have i completed/i.test(message),
    execute: ({ evidence }) => `Completed topics: ${evidence.completedTopics}. Current topics: ${evidence.currentTopics.join(", ") || "none recorded"}. Recent assessments: ${evidence.recentAssessments.map((a) => `${a.title} ${a.percentage}%`).join("; ") || "none recorded"}.`,
  },
  {
    name: "get_weak_topics",
    matches: (message) => /weak|struggl|revise next|what should i revise|mistakes.*keep/i.test(message),
    execute: ({ evidence }) => {
      const supported = evidence.topicPerformance.filter((item) => item.attempts >= 2).slice(0, 5);
      return supported.length ? `Lowest supported topic results: ${supported.map((item) => `${item.topic}: ${item.percentage}% across ${item.attempts} attempts`).join("; ")}. Treat these as evidence for revision, not a permanent mastery label.` : "There is not yet enough repeated question evidence to identify a reliable weak topic.";
    },
  },
  {
    name: "get_recent_assessment_results",
    matches: (message) => /assessment|test result|score|mark/i.test(message),
    execute: ({ evidence }) => evidence.recentAssessments.length ? evidence.recentAssessments.map((a) => `${a.title}: ${a.score}/${a.total} (${a.percentage}%), submitted ${a.date ?? "date unavailable"}`).join("\n") : "No submitted assessment results are available.",
  },
  {
    name: "get_topic_information",
    matches: (message) => /this topic|this lesson|what am i learning|where am i/i.test(message),
    execute: ({ course }) => `Course: ${course.course}. Subject: ${course.subject ?? "unknown"}. Chapter: ${course.chapter ?? "unknown"}. Topic: ${course.topic ?? course.pageTitle}.`,
  },
];

export function executeRelevantArthurTools(message: string, context: ArthurToolContext) {
  const selected = ARTHUR_TOOLS.filter((tool) => tool.matches(message)).slice(0, 2);
  return { names: selected.map((tool) => tool.name), output: selected.map((tool) => `${tool.name}:\n${tool.execute(context)}`).join("\n\n") };
}
