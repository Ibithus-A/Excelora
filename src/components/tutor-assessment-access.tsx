"use client";
import { useState } from "react";
import { GENERATED_ASSESSMENT_CONFIGS } from "@/lib/assessment-config";
import { useAssessmentAccess } from "@/lib/hooks/use-assessment-access";
export function TutorAssessmentAccess({ studentId }: { studentId: string }) {
  const [key, setKey] = useState<string>(GENERATED_ASSESSMENT_CONFIGS[0].key);
  const access = useAssessmentAccess(studentId || null, "", key);
  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
      <h3 className="text-sm font-semibold text-zinc-950">Assessment Access</h3>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-xs text-zinc-500">
          Chapter
          <select
            className="mt-2 block w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-800 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-950/5"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          >
            {GENERATED_ASSESSMENT_CONFIGS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.subjectTitle} · {c.chapterTitle}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={
            !studentId ||
            access.isLoading ||
            (!access.isUnlocked && !access.prerequisite.isComplete)
          }
          onClick={() => void access.toggle()}
          className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-40"
        >
          {access.isLoading
            ? "Loading…"
            : access.isUnlocked
              ? "Lock assessment"
              : "Unlock assessment"}
        </button>
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        {access.prerequisite.completedCount}/{access.prerequisite.totalCount}{" "}
        lessons complete. Students need chapter access and must complete its
        lessons before an assessment can be unlocked.
      </p>
      {access.error && (
        <p role="alert" className="mt-3 text-sm text-rose-700">
          {access.error}
        </p>
      )}
    </section>
  );
}
