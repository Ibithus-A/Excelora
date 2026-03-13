"use client";

import {
  addNodeToState,
  type MoveTarget,
  moveNodeInState,
  removeNodeFromState,
  selectNodeInState,
  toggleLockedInState,
  toggleExpandedInState,
  updateContentInState,
  updateTitleInState,
} from "@/lib/tree-utils";
import { FLOWSTATE_STORAGE_KEY } from "@/lib/constants/storage";
import { createSeedState, insertALevelMathsTree } from "@/lib/seed";
import type { FlowNode, FlowState, NodeKind } from "@/types/flowstate";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

type Action =
  | { type: "hydrate"; payload: FlowState }
  | { type: "add"; kind: NodeKind; parentId: string | null }
  | { type: "move"; id: string; target: MoveTarget }
  | { type: "remove"; id: string }
  | { type: "select"; id: string }
  | { type: "toggle"; id: string }
  | { type: "collapseAll" }
  | { type: "reveal"; id: string }
  | { type: "toggleLock"; id: string }
  | { type: "updateTitle"; id: string; title: string }
  | { type: "updateContent"; id: string; content: string };

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "add":
      return addNodeToState(state, action.kind, action.parentId);
    case "move":
      return moveNodeInState(state, action.id, action.target);
    case "remove":
      return removeNodeFromState(state, action.id);
    case "select":
      return selectNodeInState(state, action.id);
    case "toggle":
      return toggleExpandedInState(state, action.id);
    case "collapseAll":
      return {
        ...state,
        nodes: Object.fromEntries(
          Object.entries(state.nodes).map(([id, node]) => [
            id,
            node.kind === "folder" && node.isExpanded ? { ...node, isExpanded: false } : node,
          ]),
        ),
      };
    case "reveal": {
      const targetNode = state.nodes[action.id];
      if (!targetNode) return state;

      const nodes = { ...state.nodes };
      let parentId = targetNode.parentId;

      while (parentId) {
        const parentNode = nodes[parentId];
        if (!parentNode) break;
        if (parentNode.kind === "folder" && !parentNode.isExpanded) {
          nodes[parentId] = { ...parentNode, isExpanded: true };
        }
        parentId = parentNode.parentId;
      }

      return selectNodeInState({ ...state, nodes }, action.id);
    }
    case "toggleLock":
      return toggleLockedInState(state, action.id);
    case "updateTitle":
      return updateTitleInState(state, action.id, action.title);
    case "updateContent":
      return updateContentInState(state, action.id, action.content);
    default:
      return state;
  }
}

function isFlowStateLike(value: unknown): value is FlowState {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<FlowState>;
  return (
    typeof candidate.nodes === "object" &&
    candidate.nodes !== null &&
    Array.isArray(candidate.rootIds) &&
    ("selectedId" in candidate || candidate.selectedId === null)
  );
}

function isNodeKind(value: unknown): value is NodeKind {
  return value === "page" || value === "folder";
}

function isFlowNodeLike(value: unknown): value is FlowNode {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<FlowNode>;

  return (
    typeof candidate.id === "string" &&
    isNodeKind(candidate.kind) &&
    typeof candidate.title === "string" &&
    (typeof candidate.parentId === "string" || candidate.parentId === null) &&
    Array.isArray(candidate.childrenIds) &&
    candidate.childrenIds.every((childId) => typeof childId === "string") &&
    typeof candidate.content === "string" &&
    typeof candidate.isExpanded === "boolean" &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number"
  );
}

function dedupeIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(id);
  }
  return unique;
}

function repairNodeReferences(state: FlowState): FlowState {
  const validNodes = Object.fromEntries(
    Object.entries(state.nodes).filter(([, node]) => isFlowNodeLike(node)),
  );

  const repairedNodes = Object.fromEntries(
    Object.entries(validNodes).map(([id, node]) => [
      id,
      {
        ...node,
        parentId: node.parentId && validNodes[node.parentId] ? node.parentId : null,
        childrenIds: dedupeIds(node.childrenIds).filter((childId) => Boolean(validNodes[childId])),
        isLocked: node.isLocked ?? false,
        isUnlockedOverride: node.isUnlockedOverride ?? false,
      },
    ]),
  );

  for (const node of Object.values(repairedNodes)) {
    for (const childId of node.childrenIds) {
      repairedNodes[childId].parentId = node.id;
    }
  }

  const rootIds = dedupeIds(state.rootIds).filter((id) => {
    const node = repairedNodes[id];
    return Boolean(node && node.parentId === null);
  });

  for (const [id, node] of Object.entries(repairedNodes)) {
    if (node.parentId !== null) continue;
    if (!rootIds.includes(id)) {
      rootIds.push(id);
    }
  }

  const selectedId =
    state.selectedId && repairedNodes[state.selectedId]
      ? state.selectedId
      : rootIds[0] ?? null;

  return { nodes: repairedNodes, rootIds, selectedId };
}

function collectSubtreeIds(state: FlowState, id: string, ids: Set<string>) {
  const node = state.nodes[id];
  if (!node || ids.has(id)) return;

  ids.add(id);
  for (const childId of node.childrenIds) {
    collectSubtreeIds(state, childId, ids);
  }
}

function removeNodesFromState(state: FlowState, idsToRemove: Set<string>): FlowState {
  if (idsToRemove.size === 0) return state;

  const nodes = Object.fromEntries(
    Object.entries(state.nodes)
      .filter(([id]) => !idsToRemove.has(id))
      .map(([id, node]) => [
        id,
        {
          ...node,
          childrenIds: node.childrenIds.filter((childId) => !idsToRemove.has(childId)),
        },
      ]),
  );

  const rootIds = state.rootIds.filter((id) => !idsToRemove.has(id));
  const selectedId = state.selectedId && !idsToRemove.has(state.selectedId)
    ? state.selectedId
    : rootIds[0] ?? null;

  return { ...state, nodes, rootIds, selectedId };
}

function removeDeprecatedALevelMaths(state: FlowState): FlowState {
  const deprecatedRootTitles = new Set([
    "AS Pure Maths (Pure Mathematics Year 1/AS)",
    "AS Applied Maths (Statistics & Mechanics Year 1/AS)",
    "A2 Pure Maths (Pure Mathematics Year 2)",
    "A2 Applied (Statistics & Mechanics Year 2)",
  ]);

  const rootIdsToRemove = state.rootIds.filter((id) => {
    const node = state.nodes[id];
    return node ? deprecatedRootTitles.has(node.title) : false;
  });

  if (rootIdsToRemove.length === 0) return state;

  const idsToRemove = new Set<string>();
  for (const rootId of rootIdsToRemove) {
    collectSubtreeIds(state, rootId, idsToRemove);
  }

  return removeNodesFromState(state, idsToRemove);
}

function stripDuplicatedSeedPageTitle(state: FlowState): FlowState {
  const nodes = Object.fromEntries(
    Object.entries(state.nodes).map(([id, node]) => {
      if (node.kind !== "page") return [id, node];

      const [firstLine = "", secondLine = "", ...rest] = node.content.split("\n");
      const normalizedContent = node.content.trim().toLowerCase();
      const isDuplicatedTitleOnlyContent =
        firstLine.trim() === node.title.trim() &&
        secondLine.trim() === "" &&
        rest.length === 0;
      const isLegacyPlaceholderContent = normalizedContent.includes(
        "use this space for notes and examples",
      );
      if (!isDuplicatedTitleOnlyContent && !isLegacyPlaceholderContent) {
        return [id, node];
      }

      return [
        id,
        {
          ...node,
          content: "",
        },
      ];
    }),
  );

  return { ...state, nodes };
}

const DEFAULT_PAGE_CONTENT = "";
const CHAPTER_ONE_SECTION_TITLES = new Set([
  "1.1 argument and proof",
  "1.2 index laws",
  "1.3 surds",
]);
const INJECTED_SECTION_NOTE_PREFIXES = [
  "## 1.1 Argument and proof",
  "## 1.2 Index laws",
  "## 1.3 Surds",
];

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function stripInjectedSectionNotes(state: FlowState): FlowState {
  const nodes = Object.fromEntries(
    Object.entries(state.nodes).map(([id, node]) => {
      if (node.kind !== "page") return [id, node];
      if (!CHAPTER_ONE_SECTION_TITLES.has(normalizeTitle(node.title))) return [id, node];

      const isInjected = INJECTED_SECTION_NOTE_PREFIXES.some((prefix) =>
        node.content.trimStart().startsWith(prefix),
      );
      if (!isInjected) return [id, node];

      return [
        id,
        {
          ...node,
          content: DEFAULT_PAGE_CONTENT,
        },
      ];
    }),
  );

  return { ...state, nodes };
}

function normalizeFlowState(state: FlowState): FlowState {
  const repairedState = repairNodeReferences(state);

  return insertALevelMathsTree(
    stripInjectedSectionNotes(
      stripDuplicatedSeedPageTitle(
        removeDeprecatedALevelMaths({
          ...repairedState,
        }),
      ),
    ),
  );
}

type FlowStateContextValue = {
  state: FlowState;
  isHydrated: boolean;
  addNode: (kind: NodeKind, parentId?: string | null) => void;
  moveNode: (id: string, target: MoveTarget) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string) => void;
  toggleExpanded: (id: string) => void;
  collapseAllFolders: () => void;
  revealNode: (id: string) => void;
  toggleLock: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  updateContent: (id: string, content: string) => void;
};

const FlowStateContext = createContext<FlowStateContextValue | null>(null);

export function FlowStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, createSeedState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on first client render
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FLOWSTATE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (isFlowStateLike(parsed)) {
          dispatch({ type: "hydrate", payload: normalizeFlowState(parsed) });
        }
      }
    } catch {
      // If parsing fails, we keep the seed state
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist on every state change after hydration
  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(FLOWSTATE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota/private mode failures
    }
  }, [state, isHydrated]);

  const addNode = useCallback(
    (kind: NodeKind, parentId: string | null = null) =>
      dispatch({ type: "add", kind, parentId }),
    [],
  );
  const moveNode = useCallback(
    (id: string, target: MoveTarget) => dispatch({ type: "move", id, target }),
    [],
  );
  const removeNode = useCallback((id: string) => dispatch({ type: "remove", id }), []);
  const selectNode = useCallback((id: string) => dispatch({ type: "select", id }), []);
  const toggleExpanded = useCallback((id: string) => dispatch({ type: "toggle", id }), []);
  const collapseAllFolders = useCallback(() => dispatch({ type: "collapseAll" }), []);
  const revealNode = useCallback((id: string) => dispatch({ type: "reveal", id }), []);
  const toggleLock = useCallback((id: string) => dispatch({ type: "toggleLock", id }), []);
  const updateTitle = useCallback(
    (id: string, title: string) => dispatch({ type: "updateTitle", id, title }),
    [],
  );
  const updateContent = useCallback(
    (id: string, content: string) =>
      dispatch({ type: "updateContent", id, content }),
    [],
  );

  const value = useMemo<FlowStateContextValue>(
    () => ({
      state,
      isHydrated,
      addNode,
      moveNode,
      removeNode,
      selectNode,
      toggleExpanded,
      collapseAllFolders,
      revealNode,
      toggleLock,
      updateTitle,
      updateContent,
    }),
    [
      addNode,
      isHydrated,
      moveNode,
      removeNode,
      revealNode,
      selectNode,
      state,
      toggleExpanded,
      collapseAllFolders,
      toggleLock,
      updateContent,
      updateTitle,
    ],
  );

  return (
    <FlowStateContext.Provider value={value}>
      {children}
    </FlowStateContext.Provider>
  );
}

export function useFlowState() {
  const context = useContext(FlowStateContext);

  if (!context) {
    throw new Error("useFlowState must be used inside FlowStateProvider");
  }

  return context;
}
