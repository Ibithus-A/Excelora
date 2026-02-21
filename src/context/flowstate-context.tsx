"use client";

import {
  addNodeToState,
  moveNodeInState,
  removeNodeFromState,
  selectNodeInState,
  toggleLockedInState,
  toggleExpandedInState,
  updateContentInState,
  updateTitleInState,
} from "@/lib/tree-utils";
import { createSeedState } from "@/lib/seed";
import type { FlowState, NodeKind } from "@/types/flowstate";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

const STORAGE_KEY = "flowstate:v2";

type Action =
  | { type: "hydrate"; payload: FlowState }
  | { type: "add"; kind: NodeKind; parentId: string | null }
  | {
      type: "move";
      id: string;
      target:
        | { type: "root" }
        | { type: "inside"; targetId: string }
        | { type: "after"; targetId: string };
    }
  | { type: "remove"; id: string }
  | { type: "select"; id: string }
  | { type: "toggle"; id: string }
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

function normalizeFlowState(state: FlowState): FlowState {
  const normalizedNodes = Object.fromEntries(
    Object.entries(state.nodes).map(([id, node]) => [
      id,
      {
        ...node,
        isLocked: node.isLocked ?? false,
        isUnlockedOverride: node.isUnlockedOverride ?? false,
      },
    ]),
  );

  return {
    ...state,
    nodes: normalizedNodes,
  };
}

type FlowStateContextValue = {
  state: FlowState;
  isHydrated: boolean;
  addNode: (kind: NodeKind, parentId?: string | null) => void;
  moveNode: (
    id: string,
    target:
      | { type: "root" }
      | { type: "inside"; targetId: string }
      | { type: "after"; targetId: string },
  ) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string) => void;
  toggleExpanded: (id: string) => void;
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
      const raw = window.localStorage.getItem(STORAGE_KEY);
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota/private mode failures
    }
  }, [state, isHydrated]);

  const value = useMemo<FlowStateContextValue>(
    () => ({
      state,
      isHydrated,
      addNode: (kind, parentId = null) =>
        dispatch({ type: "add", kind, parentId }),
      moveNode: (id, target) => dispatch({ type: "move", id, target }),
      removeNode: (id) => dispatch({ type: "remove", id }),
      selectNode: (id) => dispatch({ type: "select", id }),
      toggleExpanded: (id) => dispatch({ type: "toggle", id }),
      toggleLock: (id) => dispatch({ type: "toggleLock", id }),
      updateTitle: (id, title) => dispatch({ type: "updateTitle", id, title }),
      updateContent: (id, content) =>
        dispatch({ type: "updateContent", id, content }),
    }),
    [state, isHydrated],
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
