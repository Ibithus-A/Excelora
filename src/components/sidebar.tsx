"use client";

import { canAccessNode } from "@/lib/access";
import { FlowLogoIcon, FolderIcon, PlusIcon } from "@/components/icons";
import { SidebarNode } from "@/components/sidebar-node";
import { useFlowState } from "@/context/flowstate-context";
import { A_LEVEL_MATHS_TITLE } from "@/lib/seed";
import type { UserAccessProfile } from "@/types/auth";
import type { DragEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type SidebarProps = {
  onOpenDashboard?: () => void;
  role?: "tutor" | "student";
  viewerProfile?: UserAccessProfile | null;
};

function collectSubtreeIds(
  nodes: ReturnType<typeof useFlowState>["state"]["nodes"],
  id: string,
  visibleIds: Set<string>,
) {
  const node = nodes[id];
  if (!node || visibleIds.has(id)) return;

  visibleIds.add(id);
  for (const childId of node.childrenIds) {
    collectSubtreeIds(nodes, childId, visibleIds);
  }
}

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}

export function Sidebar({
  onOpenDashboard,
  role = "tutor",
  viewerProfile = null,
}: SidebarProps) {
  const {
    state,
    addNode,
    moveNode,
    isHydrated,
    selectNode,
    toggleExpanded,
    collapseAllFolders,
    revealNode,
  } =
    useFlowState();
  const isStudent = role === "student";
  const canManage = !isStudent;
  const [searchQuery, setSearchQuery] = useState("");
  const lastStudentAccessKeyRef = useRef<string | null>(null);

  const { visibleRootIds, visibleNodeIds } = useMemo(() => {
    if (!isStudent) {
      const allVisible = new Set<string>();
      for (const id of Object.keys(state.nodes)) {
        allVisible.add(id);
      }
      return {
        visibleRootIds: state.rootIds,
        visibleNodeIds: allVisible,
      };
    }

    const visibleIds = new Set<string>();
    const mathRootId = state.rootIds.find((id) => {
      const title = state.nodes[id]?.title;
      return title ? normalizeTitle(title) === normalizeTitle(A_LEVEL_MATHS_TITLE) : false;
    });

    if (!mathRootId) {
      return {
        visibleRootIds: [],
        visibleNodeIds: visibleIds,
      };
    }

    visibleIds.add(mathRootId);
    const chapters = state.nodes[mathRootId]?.childrenIds ?? [];
    for (const chapterId of chapters) {
      visibleIds.add(chapterId);
      for (const childId of state.nodes[chapterId]?.childrenIds ?? []) {
        if (!canAccessNode(state, childId, viewerProfile)) continue;
        collectSubtreeIds(state.nodes, childId, visibleIds);
      }
    }

    return {
      visibleRootIds: [mathRootId],
      visibleNodeIds: visibleIds,
    };
  }, [isStudent, state, viewerProfile]);

  useEffect(() => {
    if (!isStudent) return;
    if (!state.selectedId) {
      if (visibleRootIds[0]) selectNode(visibleRootIds[0]);
      return;
    }
    if (!visibleNodeIds.has(state.selectedId) && visibleRootIds[0]) {
      selectNode(visibleRootIds[0]);
    }
  }, [isStudent, selectNode, state.selectedId, visibleNodeIds, visibleRootIds]);

  useEffect(() => {
    if (!isStudent) return;

    const accessKey = JSON.stringify({
      plan: viewerProfile?.plan ?? "basic",
      taggedChapterTitle: viewerProfile?.taggedChapterTitle ?? null,
      customUnlockedChapterTitles: viewerProfile?.customUnlockedChapterTitles ?? [],
    });
    if (lastStudentAccessKeyRef.current === accessKey) return;
    lastStudentAccessKeyRef.current = accessKey;

    const mathRootId = visibleRootIds[0];
    if (mathRootId && !state.nodes[mathRootId]?.isExpanded) {
      toggleExpanded(mathRootId);
    }

    for (const nodeId of visibleNodeIds) {
      const node = state.nodes[nodeId];
      if (!node || node.kind !== "folder") continue;
      if (node.parentId !== mathRootId) continue;
      if (!canAccessNode(state, nodeId, viewerProfile)) continue;
      if (!node.isExpanded) {
        toggleExpanded(nodeId);
      }
    }
  }, [
    isStudent,
    state,
    toggleExpanded,
    visibleNodeIds,
    visibleRootIds,
    viewerProfile,
  ]);

  const handleRootDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!canManage) return;
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("application/x-flowstate-node-id");
    if (!draggedId) return;
    moveNode(draggedId, { type: "root" });
  };

  const matchingPages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const pages = Object.values(state.nodes).filter((node) => {
      if (node.kind !== "page") return false;
      if (isStudent && !visibleNodeIds.has(node.id)) return false;
      return node.title.toLowerCase().includes(normalizedQuery);
    });

    return pages.slice(0, 8).map((node) => {
      const breadcrumb: string[] = [];
      let cursor = node.parentId;
      while (cursor) {
        const parent = state.nodes[cursor];
        if (!parent) break;
        breadcrumb.unshift(parent.title);
        cursor = parent.parentId;
      }
      return {
        id: node.id,
        title: node.title,
        path: breadcrumb.join(" / "),
      };
    });
  }, [isStudent, searchQuery, state.nodes, visibleNodeIds]);

  const handleJumpToNode = (nodeId: string) => {
    revealNode(nodeId);
    setSearchQuery("");
  };

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-zinc-200 bg-[var(--surface-sidebar)]">
      <div className="border-b border-zinc-200 px-3 py-3">
        <div className="flex h-9 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white">
              <FlowLogoIcon className="h-4 w-4" />
            </div>
            <p className="truncate text-[16px] font-semibold leading-none tracking-tight text-zinc-900">
              Excelora
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {canManage ? (
              <>
                <button
                  type="button"
                  onClick={() => addNode("page", null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
                  aria-label="New page"
                  title="New page"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => addNode("folder", null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
                  aria-label="New folder"
                  title="New folder"
                >
                  <FolderIcon className="h-3.5 w-3.5" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className="scroll-slim min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-2"
        onDragOver={(event) => {
          if (!canManage) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDrop={handleRootDrop}
      >
        {onOpenDashboard ? (
          <button
            type="button"
            onClick={onOpenDashboard}
            className="mb-2 flex w-full max-w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            <span>Dashboard</span>
            <span className="text-xs text-zinc-500">Open</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={collapseAllFolders}
          className="mb-2 flex w-full max-w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          <span>Close All Folders</span>
          <span className="text-xs text-zinc-500">Auto</span>
        </button>

        <div className="mb-2 w-full max-w-full rounded-lg border border-zinc-200 bg-white p-2">
          <label htmlFor="sidebar-search" className="mb-1 block text-xs font-medium text-zinc-500">
            Find Page
          </label>
          <input
            id="sidebar-search"
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && matchingPages[0]) {
                event.preventDefault();
                handleJumpToNode(matchingPages[0].id);
              }
            }}
            placeholder="Search by keywords..."
            className="h-8 w-full rounded-md border border-zinc-200 bg-zinc-50 px-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-400"
          />
          {searchQuery.trim() ? (
            <div className="mt-2 space-y-1">
              {matchingPages.length > 0 ? (
                matchingPages.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleJumpToNode(result.id)}
                    className="flex w-full flex-col rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-left hover:bg-zinc-100"
                  >
                    <span className="truncate text-sm font-medium text-zinc-800">{result.title}</span>
                    {result.path ? (
                      <span className="truncate text-xs text-zinc-500">{result.path}</span>
                    ) : null}
                  </button>
                ))
              ) : (
                <p className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-500">
                  No matching pages.
                </p>
              )}
            </div>
          ) : null}
        </div>

        {visibleRootIds.length === 0 ? (
          <div className="mt-2 w-full max-w-full rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-center">
            <p className="text-sm font-medium text-zinc-700">Your workspace is empty</p>
            <p className="mt-1 text-xs text-zinc-500">
              Create a page or folder to get started.
            </p>
          </div>
        ) : (
          visibleRootIds.map((nodeId) => (
            <SidebarNode
              key={nodeId}
              nodeId={nodeId}
              depth={0}
              canManage={canManage}
              canViewNode={(id) => visibleNodeIds.has(id)}
              isLockedNode={(id) =>
                isStudent &&
                visibleNodeIds.has(id) &&
                !canAccessNode(state, id, viewerProfile)
              }
            />
          ))
        )}
      </div>

      <div className="border-t border-zinc-200 px-3 py-3">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{isHydrated ? "Autosaved locally" : "Loading..."}</span>
          <span className="rounded-md border border-zinc-200 bg-white px-2 py-0.5">
            Offline-first
          </span>
        </div>
      </div>
    </aside>
  );
}
