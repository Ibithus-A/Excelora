"use client";

import { ChevronRightIcon } from "@/components/icons";

export function EditorActionsDrawer() {
  return (
    <div className="group/actions absolute inset-y-0 right-0 z-40 w-2">
      <button
        type="button"
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-[55%] rounded-l-md border border-zinc-200 bg-white px-1 py-2 text-zinc-600 opacity-0 shadow-sm transition-all duration-200 ease-out group-hover/actions:pointer-events-auto group-hover/actions:translate-x-0 group-hover/actions:opacity-100"
        aria-label="Open AI assistant panel"
        title="Open AI assistant panel"
      >
        <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" />
      </button>

      <aside className="pointer-events-auto absolute inset-y-0 right-0 z-30 w-[min(390px,88vw)] translate-x-full border-l border-zinc-200 bg-[var(--surface-sidebar)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/actions:translate-x-0">
        <div className="flex h-full min-h-0 flex-col">
          <header className="border-b border-zinc-200 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                AI Assistant
              </p>
              <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-600">
                Coming Soon
              </span>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
            <div className="flex flex-1 items-center justify-center overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="max-w-[260px] text-center">
                <p className="text-sm font-medium text-zinc-700">No messages yet</p>
                <p className="mt-2 text-sm text-zinc-500">
                  The AI assistant interface is visible, but chatting is disabled until launch.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value=""
                  disabled
                  readOnly
                  placeholder="Messaging will be available soon..."
                  className="h-11 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 outline-none disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                The AI assistant is planned for a future update.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
