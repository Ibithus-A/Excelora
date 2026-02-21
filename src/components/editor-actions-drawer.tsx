"use client";

import {
  ChevronRightIcon,
  LockIcon,
  MoonIcon,
  SunIcon,
  UnlockIcon,
} from "@/components/icons";
import type { NodeLockInfo } from "@/lib/tree-utils";

type EditorActionsDrawerProps = {
  isDarkMode: boolean;
  lockInfo: NodeLockInfo;
  lockLabel: string;
  onToggleLock: () => void;
  onToggleDarkMode: () => void;
};

export function EditorActionsDrawer({
  isDarkMode,
  lockInfo,
  lockLabel,
  onToggleLock,
  onToggleDarkMode,
}: EditorActionsDrawerProps) {
  return (
    <div className="group/actions absolute inset-y-0 right-0 z-40 w-2">
      <button
        type="button"
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-[55%] rounded-l-md border border-zinc-200 bg-white px-1 py-2 text-zinc-600 opacity-0 shadow-sm transition-all duration-200 ease-out group-hover/actions:pointer-events-auto group-hover/actions:translate-x-0 group-hover/actions:opacity-100"
        aria-label="Open page actions"
        title="Open page actions"
      >
        <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" />
      </button>

      <aside className="pointer-events-auto absolute inset-y-0 right-0 z-30 w-[250px] translate-x-full border-l border-zinc-200 bg-[var(--surface-sidebar)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/actions:translate-x-0">
        <div className="p-4 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Page Actions
          </p>

          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={onToggleLock}
              disabled={!lockInfo.canToggleLock}
              className={[
                "inline-flex w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition",
                lockInfo.canToggleLock
                  ? "hover:bg-zinc-50"
                  : "cursor-not-allowed opacity-45",
              ].join(" ")}
              aria-label={
                lockInfo.isEffectivelyLocked ? `Unlock ${lockLabel}` : `Lock ${lockLabel}`
              }
            >
              {lockInfo.isEffectivelyLocked ? (
                <UnlockIcon className="h-4 w-4" />
              ) : (
                <LockIcon className="h-4 w-4" />
              )}
              <span>
                {lockInfo.isEffectivelyLocked ? `Unlock ${lockLabel}` : `Lock ${lockLabel}`}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              className="inline-flex w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
            >
              {isDarkMode ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
              <span>{isDarkMode ? "Switch to Light" : "Switch to Dark"}</span>
            </button>

          </div>
        </div>
      </aside>
    </div>
  );
}
