"use client";

import { EditorActionsDrawer } from "@/components/editor-actions-drawer";
import { useFlowState } from "@/context/flowstate-context";
import { DUPLICATE_PAGE_NAME_MESSAGE } from "@/lib/constants/messages";
import { useAutoDismissMessage } from "@/lib/hooks/use-auto-dismiss-message";
import {
  getDefaultTitle,
  getNodeLockInfo,
  hasDuplicatePageTitleInParent,
} from "@/lib/tree-utils";
import { useMemo, useRef, useState } from "react";

type SlashOption = {
  id: string;
  label: string;
  hint: string;
  template?: string;
};

type EditorPaneProps = {
  role: "tutor" | "student";
};

const SLASH_OPTIONS: SlashOption[] = [
  {
    id: "heading-1",
    label: "Heading 1",
    hint: "Large section title",
    template: "# $0",
  },
  {
    id: "heading-2",
    label: "Heading 2",
    hint: "Medium section title",
    template: "## $0",
  },
  {
    id: "heading-3",
    label: "Heading 3",
    hint: "Small section title",
    template: "### $0",
  },
  {
    id: "bulleted-list",
    label: "Bullet List",
    hint: "Create a bulleted list",
    template: "- $0",
  },
  {
    id: "link",
    label: "Link",
    hint: "Insert a URL link",
  },
];

const DEFAULT_LOCK_INFO = {
  isEffectivelyLocked: false,
  isLockedBySelf: false,
  isLockedByAncestorFolder: false,
  isLockedByAncestorPage: false,
  canToggleLock: false,
};

function getSlashContext(value: string, cursor: number) {
  const upToCursor = value.slice(0, cursor);
  const slashIndex = upToCursor.lastIndexOf("/");
  if (slashIndex === -1) return null;

  const lineStart = upToCursor.lastIndexOf("\n") + 1;
  if (slashIndex < lineStart) return null;

  const beforeSlash = upToCursor.slice(0, slashIndex);
  const previousChar = beforeSlash.slice(-1);
  if (previousChar && previousChar.trim() !== "") return null;

  const query = upToCursor.slice(slashIndex + 1);
  if (/\s/.test(query)) return null;

  return { start: slashIndex, query };
}

function materializeTemplate(template: string) {
  const marker = "$0";
  const markerIndex = template.indexOf(marker);

  if (markerIndex === -1) {
    return { text: template, caretOffset: template.length };
  }

  return {
    text: template.replace(marker, ""),
    caretOffset: markerIndex,
  };
}

export function EditorPane({ role }: EditorPaneProps) {
  const { state, updateContent, updateTitle } = useFlowState();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [slashContext, setSlashContext] = useState<{
    start: number;
    query: string;
  } | null>(null);
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const { message: renameNotice, setMessage: setRenameNotice } =
    useAutoDismissMessage(2400);

  const selectedId = state.selectedId;
  const selectedNode = selectedId ? state.nodes[selectedId] : null;
  const lockInfo = selectedNode
    ? getNodeLockInfo(state, selectedNode.id)
    : DEFAULT_LOCK_INFO;
  const isStudent = role === "student";
  const canEditTitle = !isStudent;
  const canEditContent = !isStudent;

  const slashOptions = useMemo(() => {
    if (!canEditContent) return [];
    if (!slashContext) return [];

    const query = slashContext.query.trim().toLowerCase();
    if (!query) return SLASH_OPTIONS;

    return SLASH_OPTIONS.filter((option) =>
      `${option.label} ${option.hint}`.toLowerCase().includes(query),
    );
  }, [canEditContent, slashContext]);

  if (!selectedNode) {
    return (
      <section className="flex h-full items-center justify-center bg-[var(--surface-panel)] p-6 md:p-10">
        <div className="w-full max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            Excelora
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
            Start with a new page
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 md:text-base">
            Capture ideas, write notes, or organize folders. Everything is saved
            locally and ready whenever you come back.
          </p>
        </div>
      </section>
    );
  }

  const closeSlashMenu = () => {
    setSlashContext(null);
    setActiveCommandIndex(0);
  };

  const applyNextContent = (
    nextValue: string,
    nextCursor?: number,
    focusCursor = true,
  ) => {
    if (!selectedNode) return;
    if (!canEditContent) return;
    updateContent(selectedNode.id, nextValue);
    closeSlashMenu();

    if (!focusCursor) return;

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const cursor = nextCursor ?? nextValue.length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const applySlashOption = (option: SlashOption) => {
    if (!canEditContent) return;
    const textarea = textareaRef.current;
    if (!textarea || !slashContext) return;

    const value = selectedNode.content;
    const commandStart = slashContext.start;
    const commandEnd = textarea.selectionStart ?? commandStart;

    if (option.id === "link") {
      const url = window.prompt("Enter link URL:");
      if (!url) {
        closeSlashMenu();
        return;
      }

      const label = window.prompt("Link text:", "Open link") || "Open link";
      const text = `[${label}](${url})`;
      const nextValue = `${value.slice(0, commandStart)}${text}${value.slice(commandEnd)}`;
      applyNextContent(nextValue, commandStart + text.length);
      return;
    }

    if (!option.template) {
      closeSlashMenu();
      return;
    }

    const { text, caretOffset } = materializeTemplate(option.template);

    const nextValue = `${value.slice(0, commandStart)}${text}${value.slice(commandEnd)}`;
    applyNextContent(nextValue, commandStart + caretOffset);
  };

  return (
    <section className="relative grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] bg-[var(--surface-panel)]">
      <EditorActionsDrawer />

      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]">
        <div
          className={[
            "grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] transition",
            lockInfo.isEffectivelyLocked ? "pointer-events-none select-none" : "",
          ].join(" ")}
        >
          <header
            className={[
              "px-6 pt-14 pb-3 md:pt-16",
              lockInfo.isEffectivelyLocked ? "opacity-65" : "",
            ].join(" ")}
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
              <div className="min-w-0">
                <input
                  value={selectedNode.title}
                  onChange={(event) => {
                    if (!canEditTitle) return;
                    const nextTitle = event.target.value;
                    if (hasDuplicatePageTitleInParent(state, selectedNode.id, nextTitle)) {
                      setRenameNotice(DUPLICATE_PAGE_NAME_MESSAGE);
                      return;
                    }
                    updateTitle(selectedNode.id, nextTitle);
                  }}
                  onBlur={() => {
                    if (!canEditTitle) return;
                    const trimmed = selectedNode.title.trim();
                    if (!trimmed) {
                      updateTitle(selectedNode.id, getDefaultTitle(selectedNode.kind));
                    } else if (
                      hasDuplicatePageTitleInParent(state, selectedNode.id, trimmed)
                    ) {
                      setRenameNotice(DUPLICATE_PAGE_NAME_MESSAGE);
                    } else if (trimmed !== selectedNode.title) {
                      updateTitle(selectedNode.id, trimmed);
                    }
                  }}
                  className="w-full rounded-md border border-transparent bg-transparent px-1 py-1 text-4xl font-semibold tracking-[-0.03em] text-zinc-900 outline-none placeholder:text-zinc-300"
                  placeholder={getDefaultTitle(selectedNode.kind)}
                  readOnly={!canEditTitle}
                />

                {renameNotice && (
                  <p className="mt-2 inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                    {renameNotice}
                  </p>
                )}
              </div>
            </div>
          </header>

        <div
          className={[
            "scroll-slim min-h-0 overflow-y-auto px-6 py-6 transition",
            lockInfo.isEffectivelyLocked ? "opacity-30 blur-md" : "",
          ].join(" ")}
        >
          <div className="relative mx-auto w-full max-w-3xl">
            {slashContext && (
              <div className="absolute left-0 top-0 z-20 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-2 shadow-[0_18px_40px_rgba(9,9,11,0.16)]">
                <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
                  Insert Block
                </p>
                <ul className="space-y-1">
                  {slashOptions.length === 0 ? (
                    <li className="rounded-lg px-2 py-2 text-sm text-zinc-500">
                      No matching commands
                    </li>
                  ) : (
                    slashOptions.map((option, index) => (
                      <li key={option.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => applySlashOption(option)}
                          className={[
                            "w-full rounded-lg px-2 py-2 text-left transition",
                            index === activeCommandIndex
                              ? "bg-zinc-100"
                              : "hover:bg-zinc-50",
                          ].join(" ")}
                        >
                          <span className="block text-sm font-medium text-zinc-800">
                            {option.label}
                          </span>
                          <span className="block text-xs text-zinc-500">{option.hint}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}

            <textarea
              ref={textareaRef}
              id="note-content"
              value={selectedNode.content}
              onChange={(event) => {
                if (!canEditContent) return;
                const nextValue = event.target.value;
                updateContent(selectedNode.id, nextValue);

                const cursor = event.target.selectionStart ?? nextValue.length;
                const nextSlashContext = getSlashContext(nextValue, cursor);

                if (!nextSlashContext) {
                  closeSlashMenu();
                  return;
                }

                setSlashContext(nextSlashContext);
                setActiveCommandIndex(0);
              }}
              onBlur={() => {
                window.setTimeout(() => {
                  closeSlashMenu();
                }, 120);
              }}
              onKeyDown={(event) => {
                if (!canEditContent) return;
                if (!slashContext) return;

                if (event.key === "Escape") {
                  event.preventDefault();
                  closeSlashMenu();
                  return;
                }

                if (slashOptions.length === 0) return;

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveCommandIndex((index) => (index + 1) % slashOptions.length);
                  return;
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveCommandIndex(
                    (index) => (index - 1 + slashOptions.length) % slashOptions.length,
                  );
                  return;
                }

                if (event.key === "Enter" || event.key === "Tab") {
                  event.preventDefault();
                  applySlashOption(slashOptions[activeCommandIndex]);
                }
              }}
              placeholder={
                selectedNode.kind === "folder"
                  ? "Write notes for this folder... Type / for commands."
                  : "Start writing your thoughts... Type / for commands."
              }
              readOnly={!canEditContent}
              className={[
                "scroll-slim notion-editor min-h-[60vh] w-full resize-none bg-transparent py-1 text-[15px] leading-7 text-zinc-800 outline-none placeholder:text-zinc-400",
                !canEditContent ? "cursor-default opacity-75" : "",
              ].join(" ")}
            />
          </div>
        </div>
      </div>
      </div>

      {lockInfo.isEffectivelyLocked && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <p className="notion-editor text-3xl font-semibold tracking-tight text-zinc-900">
            Content Unavailable :/
          </p>
        </div>
      )}
    </section>
  );
}
