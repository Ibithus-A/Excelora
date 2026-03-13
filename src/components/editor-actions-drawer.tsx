"use client";

type EditorActionsDrawerProps = {
  onHoverChange?: (isHovered: boolean) => void;
};

export function EditorActionsDrawer({
  onHoverChange,
}: EditorActionsDrawerProps) {
  return (
    <div
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={[
        "group/assistant pointer-events-none absolute inset-y-0 right-0 z-30 hidden md:block",
        "w-[min(390px,42vw)]",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-auto absolute inset-y-0 right-0 w-8 md:w-10",
        ].join(" ")}
      />

      <aside
        className={[
          "pointer-events-auto absolute inset-y-0 right-0 h-full min-h-full w-[min(390px,42vw)] overflow-hidden border-l border-zinc-200 bg-[var(--surface-sidebar)]",
          "translate-x-full opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover/assistant:translate-x-0 group-hover/assistant:opacity-100",
        ].join(" ")}
      >
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

          <div className="min-h-0 flex-1 px-4 py-4">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="mx-auto max-w-[260px] pt-6 text-center">
                  <p className="text-sm font-medium text-zinc-700">No messages yet</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    The AI assistant interface is visible, but chatting is disabled until launch.
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-200 bg-white p-3">
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
        </div>
      </aside>
    </div>
  );
}
