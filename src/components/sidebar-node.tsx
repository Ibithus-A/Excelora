"use client";

import {
  ChevronRightIcon,
  FolderIcon,
  FolderPlusIcon,
  PageIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { useFlowState } from "@/context/flowstate-context";
import { useAutoDismissMessage } from "@/lib/hooks/use-auto-dismiss-message";
import { getDefaultTitle, hasDuplicatePageTitleInParent } from "@/lib/tree-utils";
import type { DragEvent } from "react";
import { useState } from "react";

const DUPLICATE_PAGE_NAME_MESSAGE =
  "A page with this name already exists in this folder.";

type SidebarNodeProps = {
  nodeId: string;
  depth: number;
};

export function SidebarNode({ nodeId, depth }: SidebarNodeProps) {
  const {
    state,
    selectNode,
    toggleExpanded,
    addNode,
    moveNode,
    removeNode,
    updateTitle,
  } = useFlowState();
  const node = state.nodes[nodeId];
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [initialTitle, setInitialTitle] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const { message: renameNotice, setMessage: setRenameNotice } =
    useAutoDismissMessage(2400);

  if (!node) return null;

  const isSelected = state.selectedId === node.id;
  const hasChildren = node.childrenIds.length > 0;
  const indentPx = 8 + depth * 13;

  const commitTitle = () => {
    const nextTitle = draftTitle.trim() || getDefaultTitle(node.kind);
    if (hasDuplicatePageTitleInParent(state, node.id, nextTitle)) {
      setRenameNotice(DUPLICATE_PAGE_NAME_MESSAGE);
      setDraftTitle(node.title);
      return;
    }
    updateTitle(node.id, nextTitle);
    setIsEditing(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const draggedId = event.dataTransfer.getData("application/x-flowstate-node-id");
    if (!draggedId || draggedId === node.id) return;

    if (node.kind === "folder") {
      moveNode(draggedId, { type: "inside", targetId: node.id });
      return;
    }

    moveNode(draggedId, { type: "after", targetId: node.id });
  };

  return (
    <div>
      <div
        className={[
          "group mx-1 my-0.5 flex items-center rounded-md px-1.5 py-1 transition-all duration-150",
          isDragOver ? "bg-zinc-200/80" : "",
          isSelected
            ? "bg-zinc-100 text-zinc-900"
            : "text-zinc-700 hover:bg-zinc-100/90",
        ].join(" ")}
        style={{ marginLeft: `${indentPx}px` }}
        draggable={!isEditing}
        onDragStart={(event) => {
          event.stopPropagation();
          event.dataTransfer.setData("application/x-flowstate-node-id", node.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragOver(true);
          event.dataTransfer.dropEffect = "move";
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            selectNode(node.id);
            if (hasChildren) toggleExpanded(node.id);
          }}
          className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-600 disabled:opacity-30"
          disabled={!hasChildren}
          aria-label={hasChildren ? "Toggle folder" : "No children"}
          title={hasChildren ? "Expand / collapse" : "No children"}
        >
          <ChevronRightIcon
            className={`h-4 w-4 transition-transform ${hasChildren && node.isExpanded ? "rotate-90" : ""}`}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            if (isEditing) return;
            if (isTitleHovered && isSelected) {
              setInitialTitle(node.title);
              setDraftTitle(node.title);
              setIsEditing(true);
              return;
            }
            selectNode(node.id);
          }}
          onDoubleClick={() => {
            setInitialTitle(node.title);
            setDraftTitle(node.title);
            setIsEditing(true);
          }}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-0.5 text-left"
          title="Double-click name to rename"
        >
          {node.kind === "folder" ? (
            <FolderIcon className="h-4 w-4 shrink-0 text-zinc-500" />
          ) : (
            <PageIcon className="h-4 w-4 shrink-0 text-zinc-500" />
          )}
          {isEditing ? (
            <input
              autoFocus
              value={draftTitle}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setDraftTitle(nextTitle);
                if (hasDuplicatePageTitleInParent(state, node.id, nextTitle)) {
                  setRenameNotice(DUPLICATE_PAGE_NAME_MESSAGE);
                  return;
                }
                updateTitle(node.id, nextTitle);
              }}
              onClick={(event) => event.stopPropagation()}
              onBlur={commitTitle}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitTitle();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  setDraftTitle(initialTitle);
                  updateTitle(node.id, initialTitle);
                  setIsEditing(false);
                }
              }}
              className="h-5 w-full min-w-0 border-0 bg-transparent p-0 text-sm leading-5 text-zinc-800 outline-none"
              aria-label="Rename item"
            />
          ) : (
            <span
              className="truncate text-sm leading-5 hover:cursor-text"
              onMouseEnter={() => setIsTitleHovered(true)}
              onMouseLeave={() => setIsTitleHovered(false)}
            >
              {node.title || "Untitled"}
            </span>
          )}
        </button>

        <div className="ml-1 hidden items-center gap-0.5 group-hover:flex group-focus-within:flex">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              addNode("page", node.id);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-800"
            aria-label="Add page inside"
            title="Add page"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              addNode("folder", node.id);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-800"
            aria-label="Add folder inside"
            title="Add folder"
          >
            <FolderPlusIcon className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              removeNode(node.id);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete"
            title="Delete"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {renameNotice && (
        <div style={{ marginLeft: `${indentPx + 32}px` }} className="px-2 pb-1">
          <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
            {renameNotice}
          </p>
        </div>
      )}

      {hasChildren && node.isExpanded && (
        <div className="animate-[fadeIn_140ms_ease-out]">
          {node.childrenIds.map((childId) => (
            <SidebarNode key={childId} nodeId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
