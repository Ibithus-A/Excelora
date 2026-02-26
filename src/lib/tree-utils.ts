import type { FlowNode, FlowState, NodeKind } from "@/types/flowstate";

function cloneState(state: FlowState): FlowState {
  const nodes: FlowState["nodes"] = {};

  for (const [id, node] of Object.entries(state.nodes)) {
    nodes[id] = {
      ...node,
      childrenIds: [...node.childrenIds],
    };
  }

  return {
    ...state,
    nodes,
    rootIds: [...state.rootIds],
  };
}

function makeId(prefix: NodeKind): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${prefix}_${random}`;
}

export function getDefaultTitle(kind: NodeKind): string {
  return kind === "folder" ? "New Folder" : "Untitled Page";
}

function toTopicTitleCase(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word
        .split("-")
        .map((part) => {
          if (!part) return part;
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("-");
    })
    .join(" ");
}

function createNode(kind: NodeKind, parentId: string | null): FlowNode {
  const now = Date.now();
  return {
    id: makeId(kind),
    kind,
    title: getDefaultTitle(kind),
    parentId,
    childrenIds: [],
    content: "",
    isLocked: false,
    isUnlockedOverride: false,
    isExpanded: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function addNodeToState(
  state: FlowState,
  kind: NodeKind,
  parentId: string | null,
): FlowState {
  const next = cloneState(state);
  const newNode = createNode(kind, parentId);

  next.nodes[newNode.id] = newNode;

  if (parentId) {
    const parent = next.nodes[parentId];
    if (!parent) return state;

    parent.childrenIds.push(newNode.id);
    parent.isExpanded = true;
    parent.updatedAt = Date.now();
  } else {
    next.rootIds.push(newNode.id);
  }

  next.selectedId = newNode.id;
  return next;
}

export function selectNodeInState(state: FlowState, id: string): FlowState {
  if (!state.nodes[id]) return state;
  return { ...state, selectedId: id };
}

export function toggleExpandedInState(state: FlowState, id: string): FlowState {
  const target = state.nodes[id];
  if (!target) return state;

  const next = cloneState(state);
  next.nodes[id].isExpanded = !next.nodes[id].isExpanded;
  next.nodes[id].updatedAt = Date.now();
  return next;
}

export function updateTitleInState(
  state: FlowState,
  id: string,
  title: string,
): FlowState {
  const target = state.nodes[id];
  if (!target) return state;

  const next = cloneState(state);
  next.nodes[id].title = toTopicTitleCase(title);
  next.nodes[id].updatedAt = Date.now();
  return next;
}

export function hasDuplicatePageTitleInParent(
  state: FlowState,
  id: string,
  title: string,
): boolean {
  const node = state.nodes[id];
  if (!node || node.kind !== "page") return false;

  const normalized = toTopicTitleCase(title).toLocaleLowerCase();
  if (!normalized) return false;

  const siblingIds = node.parentId
    ? state.nodes[node.parentId]?.childrenIds ?? []
    : state.rootIds;

  for (const siblingId of siblingIds) {
    if (siblingId === id) continue;
    const sibling = state.nodes[siblingId];
    if (!sibling || sibling.kind !== "page") continue;
    if (toTopicTitleCase(sibling.title).toLocaleLowerCase() === normalized) {
      return true;
    }
  }

  return false;
}

export function updateContentInState(
  state: FlowState,
  id: string,
  content: string,
): FlowState {
  const target = state.nodes[id];
  if (!target) return state;

  const next = cloneState(state);
  next.nodes[id].content = content;
  next.nodes[id].updatedAt = Date.now();
  return next;
}

export type NodeLockInfo = {
  isEffectivelyLocked: boolean;
  isLockedBySelf: boolean;
  isLockedByAncestorFolder: boolean;
  isLockedByAncestorPage: boolean;
  canToggleLock: boolean;
};

export function getNodeLockInfo(state: FlowState, id: string): NodeLockInfo {
  const node = state.nodes[id];
  if (!node) {
    return {
      isEffectivelyLocked: false,
      isLockedBySelf: false,
      isLockedByAncestorFolder: false,
      isLockedByAncestorPage: false,
      canToggleLock: false,
    };
  }

  if (node.isLocked) {
    return {
      isEffectivelyLocked: true,
      isLockedBySelf: true,
      isLockedByAncestorFolder: false,
      isLockedByAncestorPage: false,
      canToggleLock: true,
    };
  }

  let isLockedByAncestorFolder = false;
  let isLockedByAncestorPage = false;
  let cursor = node.parentId;

  while (cursor) {
    const ancestor = state.nodes[cursor];
    if (!ancestor) break;

    if (ancestor.isLocked) {
      if (ancestor.kind === "folder") {
        isLockedByAncestorFolder = true;
      } else {
        isLockedByAncestorPage = true;
      }
      break;
    }
    cursor = ancestor.parentId;
  }

  const hasPageOverride =
    node.kind === "page" && node.isUnlockedOverride && isLockedByAncestorFolder;

  const isEffectivelyLocked =
    isLockedByAncestorPage || (isLockedByAncestorFolder && !hasPageOverride);

  const canToggleLock =
    !isLockedByAncestorPage &&
    (node.kind === "page" || !isLockedByAncestorFolder);

  return {
    isEffectivelyLocked,
    isLockedBySelf: false,
    isLockedByAncestorFolder,
    isLockedByAncestorPage,
    canToggleLock,
  };
}

export function toggleLockedInState(state: FlowState, id: string): FlowState {
  const node = state.nodes[id];
  if (!node) return state;

  const lockInfo = getNodeLockInfo(state, id);
  if (!lockInfo.canToggleLock) return state;

  const next = cloneState(state);
  const target = next.nodes[id];

  if (target.isLocked) {
    target.isLocked = false;
    target.updatedAt = Date.now();
    return next;
  }

  if (target.kind === "page" && lockInfo.isLockedByAncestorFolder) {
    target.isUnlockedOverride = !target.isUnlockedOverride;
    target.updatedAt = Date.now();
    return next;
  }

  target.isLocked = true;
  target.isUnlockedOverride = false;
  target.updatedAt = Date.now();
  return next;
}

function collectSubtreeIds(state: FlowState, startId: string, set: Set<string>) {
  const node = state.nodes[startId];
  if (!node || set.has(startId)) return;

  set.add(startId);
  for (const childId of node.childrenIds) {
    collectSubtreeIds(state, childId, set);
  }
}

export function removeNodeFromState(state: FlowState, id: string): FlowState {
  const target = state.nodes[id];
  if (!target) return state;

  const next = cloneState(state);

  const idsToDelete = new Set<string>();
  collectSubtreeIds(next, id, idsToDelete);

  // Remove from parent or root
  if (target.parentId) {
    const parent = next.nodes[target.parentId];
    if (parent) {
      parent.childrenIds = parent.childrenIds.filter((childId) => childId !== id);
      parent.updatedAt = Date.now();
    }
  } else {
    next.rootIds = next.rootIds.filter((rootId) => rootId !== id);
  }

  // Delete subtree
  for (const deleteId of idsToDelete) {
    delete next.nodes[deleteId];
  }

  // Repair selection if needed
  if (next.selectedId && idsToDelete.has(next.selectedId)) {
    if (target.parentId && next.nodes[target.parentId]) {
      next.selectedId = target.parentId;
    } else {
      next.selectedId = next.rootIds[0] ?? null;
    }
  }

  return next;
}

function isInSubtree(state: FlowState, rootId: string, targetId: string): boolean {
  if (rootId === targetId) return true;
  const root = state.nodes[rootId];
  if (!root) return false;

  for (const childId of root.childrenIds) {
    if (isInSubtree(state, childId, targetId)) return true;
  }

  return false;
}

export type MoveTarget =
  | { type: "root" }
  | { type: "inside"; targetId: string }
  | { type: "after"; targetId: string };

export function moveNodeInState(
  state: FlowState,
  id: string,
  moveTarget: MoveTarget,
): FlowState {
  const moving = state.nodes[id];
  if (!moving) return state;

  const next = cloneState(state);
  const movingNode = next.nodes[id];

  const currentParentId = movingNode.parentId;
  const currentSiblings = currentParentId
    ? next.nodes[currentParentId]?.childrenIds
    : next.rootIds;

  if (!currentSiblings) return state;

  const currentIndex = currentSiblings.indexOf(id);
  if (currentIndex === -1) return state;

  currentSiblings.splice(currentIndex, 1);
  if (currentParentId && next.nodes[currentParentId]) {
    next.nodes[currentParentId].updatedAt = Date.now();
  }

  if (moveTarget.type === "root") {
    movingNode.parentId = null;
    next.rootIds.push(id);
    movingNode.updatedAt = Date.now();
    return next;
  }

  const target = next.nodes[moveTarget.targetId];
  if (!target || target.id === id) return state;
  if (isInSubtree(next, id, target.id)) return state;

  if (moveTarget.type === "inside") {
    target.childrenIds.push(id);
    target.isExpanded = true;
    target.updatedAt = Date.now();
    movingNode.parentId = target.id;
    movingNode.updatedAt = Date.now();
    return next;
  }

  const targetParentId = target.parentId;
  const targetSiblings = targetParentId
    ? next.nodes[targetParentId]?.childrenIds
    : next.rootIds;
  if (!targetSiblings) return state;

  const targetIndex = targetSiblings.indexOf(target.id);
  if (targetIndex === -1) return state;

  targetSiblings.splice(targetIndex + 1, 0, id);
  movingNode.parentId = targetParentId;
  movingNode.updatedAt = Date.now();

  if (targetParentId && next.nodes[targetParentId]) {
    next.nodes[targetParentId].updatedAt = Date.now();
  }

  return next;
}

export function getNodePath(state: FlowState, id: string): FlowNode[] {
  const path: FlowNode[] = [];
  const seen = new Set<string>();

  let current: FlowNode | undefined = state.nodes[id];

  while (current && !seen.has(current.id)) {
    path.unshift(current);
    seen.add(current.id);
    current = current.parentId ? state.nodes[current.parentId] : undefined;
  }

  return path;
}

export function getDescendantCount(state: FlowState, id: string): number {
  const node = state.nodes[id];
  if (!node) return 0;

  let count = 0;

  const walk = (nodeId: string) => {
    const current = state.nodes[nodeId];
    if (!current) return;

    for (const childId of current.childrenIds) {
      count += 1;
      walk(childId);
    }
  };

  walk(id);
  return count;
}
