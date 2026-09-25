import type { ReactNode } from "react";
export function QuestionSessionHeader({
  number,
  total,
  detail,
  action,
}: {
  number: number;
  total?: number;
  detail: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold">
          Question {number}
          {total ? ` of ${total}` : ""}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">{detail}</span>
          {action}
        </div>
      </div>
      {total && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div
            data-assessment-progress-fill
            className="h-full rounded-full bg-[var(--excelora-green)] transition-[width] duration-300"
            style={{ width: `${(number / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
