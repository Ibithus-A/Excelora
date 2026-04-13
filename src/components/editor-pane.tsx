"use client";

import { canAccessNode, getLockedChapterMessage } from "@/lib/access";
import { EditorActionsDrawer } from "@/components/editor-actions-drawer";
import { FolderIcon } from "@/components/icons";
import { useFlowState } from "@/context/flowstate-context";
import { LESSON_PROGRESS_STORAGE_KEY } from "@/lib/constants/storage";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { END_OF_TOPIC_ASSESSMENT_TITLE } from "@/lib/seed";
import {
  getDefaultTitle,
  getLessonChapterContext,
  getNodeLockInfo,
} from "@/lib/tree-utils";
import type { UserAccessProfile } from "@/types/auth";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type EditorPaneProps = {
  role: "tutor" | "student";
  viewerProfile?: UserAccessProfile | null;
  sidebarInsetPx?: number;
};

type LessonProgressMap = Record<string, boolean>;
type SurfaceTransitionMode = "fade" | "next" | "previous";

const MAX_TITLE_FONT_SIZE_PX = 36;
const MIN_TITLE_FONT_SIZE_PX = 20;
const LEGACY_PLACEHOLDER_CONTENT = "use this space for notes and examples";

function resolveSubtopicPdfUrl(title: string): string {
  return `/assets/${encodeURIComponent(title.trim())}.pdf`;
}

const DEFAULT_LOCK_INFO = {
  isEffectivelyLocked: false,
  isLockedBySelf: false,
  isLockedByAncestorFolder: false,
  isLockedByAncestorPage: false,
  canToggleLock: false,
};

export function EditorPane({
  role,
  viewerProfile = null,
  sidebarInsetPx = 0,
}: EditorPaneProps) {
  const { state, revealNode } = useFlowState();
  const titleInputRef = useRef<HTMLDivElement | null>(null);
  const titleMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [titleFontSizePx, setTitleFontSizePx] = useState(MAX_TITLE_FONT_SIZE_PX);
  const [isAssistantHovered, setIsAssistantHovered] = useState(false);
  const [mobileAssistantNodeId, setMobileAssistantNodeId] = useState<string | null>(null);
  const [surfaceTransitionMode, setSurfaceTransitionMode] =
    useState<SurfaceTransitionMode>("fade");
  const [lessonProgress, setLessonProgress] = usePersistedState<LessonProgressMap>({
    key: LESSON_PROGRESS_STORAGE_KEY,
    defaultValue: {},
  });
  const [lessonView, setLessonView] = useState<"notes" | "video">("notes");
  const [pdfZoom, setPdfZoom] = useState(100);
  const selectedId = state.selectedId;
  const selectedNode = selectedId ? state.nodes[selectedId] : null;
  const lockInfo = selectedNode
    ? getNodeLockInfo(state, selectedNode.id)
    : DEFAULT_LOCK_INFO;
  const isStudent = role === "student";
  const canUseAssistant = role === "tutor" || viewerProfile?.plan === "premium";
  const isAccessBlocked =
    isStudent && selectedNode
      ? !canAccessNode(state, selectedNode.id, viewerProfile)
      : false;
  const lockedChapterMessage =
    isAccessBlocked && selectedNode
      ? getLockedChapterMessage(viewerProfile, state, selectedNode.id)
      : "This chapter is locked.";
  const selectedNodeKind = selectedNode?.kind ?? "page";
  const selectedNodeTitle = selectedNode?.title ?? getDefaultTitle(selectedNodeKind);
  const titleFitKey = `${selectedNode?.id ?? ""}:${selectedNodeKind}:${selectedNodeTitle}`;
  const visibleFolderChildItems = selectedNode
    ? selectedNode.childrenIds
        .map((childId) => state.nodes[childId])
        .filter((childNode) => {
          if (!childNode) return false;
          if (childNode.kind !== "page" && childNode.kind !== "folder") return false;
          if (!isStudent) return true;
          return canAccessNode(state, childNode.id, viewerProfile);
        })
    : [];
  const lessonContext = selectedNode ? getLessonChapterContext(state, selectedNode.id) : null;
  const isLessonPage = selectedNode?.kind === "page" && Boolean(lessonContext);
  const isAssessmentPage = Boolean(lessonContext?.isAssessmentPage);
  const parentFolder =
    selectedNode?.parentId && state.nodes[selectedNode.parentId]?.kind === "folder"
      ? state.nodes[selectedNode.parentId]
      : null;
  const isLessonWatched = selectedNode ? Boolean(lessonProgress[selectedNode.id]) : false;
  const completedLessonsCount = lessonContext
    ? lessonContext.lessonIds.reduce(
        (count, lessonId) => count + (lessonProgress[lessonId] ? 1 : 0),
        0,
      )
    : 0;
  const chapterProgressPercentage = lessonContext
    ? Math.round((completedLessonsCount / lessonContext.lessonIds.length) * 100)
    : 0;
  const visiblePageContent =
    selectedNode &&
    !selectedNode.content.trim().toLowerCase().includes(LEGACY_PLACEHOLDER_CONTENT)
      ? selectedNode.content.trim()
      : "";
  const editorShellStyle = {
    paddingLeft: sidebarInsetPx > 0 ? `min(${sidebarInsetPx}px, 88vw)` : undefined,
    paddingRight: isAssistantHovered ? "min(390px, 42vw)" : undefined,
  } satisfies CSSProperties;

  const toggleLessonWatched = () => {
    if (!selectedNode || !isLessonPage) return;

    setLessonProgress((current) => ({
      ...current,
      [selectedNode.id]: !current[selectedNode.id],
    }));
  };

  const nextLessonActionId = lessonContext?.nextLessonId ?? lessonContext?.assessmentId ?? null;
  const nextLessonActionLabel = isAssessmentPage
    ? "Submit Assessment"
    : lessonContext?.nextLessonId
      ? "Next Lesson"
      : lessonContext?.assessmentId
        ? "Take Assessment"
        : "Next Lesson";
  const surfaceTransitionClass =
    surfaceTransitionMode === "next"
      ? "surface-transition-next"
      : surfaceTransitionMode === "previous"
        ? "surface-transition-previous"
        : "surface-transition-fade";
  const isMobileAssistantOpen = !!selectedId && mobileAssistantNodeId === selectedId;

  useEffect(() => {
    const titleInput = titleInputRef.current;
    const titleMeasure = titleMeasureRef.current;
    if (!titleInput || !titleMeasure) return;

    const fitTitle = () => {
      const availableWidth = titleInput.clientWidth;
      if (!availableWidth) return;

      let nextFontSize = MAX_TITLE_FONT_SIZE_PX;
      titleMeasure.textContent = selectedNodeTitle;

      while (nextFontSize > MIN_TITLE_FONT_SIZE_PX) {
        titleMeasure.style.fontSize = `${nextFontSize}px`;
        if (titleMeasure.scrollWidth <= availableWidth) break;
        nextFontSize -= 1;
      }

      setTitleFontSizePx(nextFontSize);
    };

    fitTitle();
    window.addEventListener("resize", fitTitle);
    return () => window.removeEventListener("resize", fitTitle);
  }, [selectedNodeTitle, titleFitKey]);

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

  if (isAccessBlocked) {
    return (
      <section className="flex h-full items-center justify-center bg-[var(--surface-panel)] p-6 md:p-10">
        <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            Chapter Locked
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            You do not have access to this chapter
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            {lockedChapterMessage}
          </p>
        </div>
      </section>
    );
  }

  useEffect(() => {
    setLessonView("notes");
    setPdfZoom(100);
  }, [selectedId]);

  const revealWithTransition = (
    nodeId: string | null,
    mode: SurfaceTransitionMode = "fade",
  ) => {
    if (!nodeId) return;
    setSurfaceTransitionMode(mode);
    revealNode(nodeId);
  };

  return (
    <section className="relative flex h-full min-h-0 overflow-hidden bg-[var(--surface-panel)]">
      <div
        className={[
          "min-w-0 flex-1 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        ].join(" ")}
        style={editorShellStyle}
      >
        <div
          className={[
            "grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] transition",
            lockInfo.isEffectivelyLocked ? "pointer-events-none select-none" : "",
          ].join(" ")}
        >
          <header
            className={[
              "px-4 pt-16 pb-3 md:px-6 md:pt-16",
              lockInfo.isEffectivelyLocked ? "opacity-65" : "",
            ].join(" ")}
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
              <div className="min-w-0">
                <div
                  ref={titleInputRef}
                  className="w-full rounded-md border border-transparent bg-transparent px-1 py-1 font-semibold leading-tight tracking-[-0.03em] text-zinc-900 outline-none placeholder:text-zinc-300"
                  style={{ fontSize: `${titleFontSizePx}px` }}
                >
                  {selectedNode.title || getDefaultTitle(selectedNode.kind)}
                </div>
                {selectedNode.kind === "folder" && selectedNode.title === "A Level Maths" ? (
                  <p className="mt-2 px-1 text-sm leading-7 text-zinc-500">
                    Start the course from the sidebar to open a chapter and continue through the lessons.
                  </p>
                ) : null}
                <span
                  ref={titleMeasureRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute opacity-0 whitespace-nowrap px-1 py-1 font-semibold leading-tight tracking-[-0.03em]"
                />
              </div>
            </div>
          </header>

          <div
            className={[
              "scroll-slim min-h-0 overflow-y-auto px-4 py-5 transition md:px-6 md:py-6",
              lockInfo.isEffectivelyLocked ? "opacity-30 blur-md" : "",
            ].join(" ")}
          >
            <div
              key={selectedNode.id}
              className={`relative mx-auto w-full max-w-3xl ${surfaceTransitionClass}`}
            >
              {selectedNode.kind === "folder" ? (
                <section className="mb-8">
                  {selectedNode.title === "A Level Maths" ? null : (
                    <div className="space-y-1">
                      {visibleFolderChildItems.length > 0 ? (
                        visibleFolderChildItems.map((childNode) => (
                          <button
                            key={childNode.id}
                            type="button"
                            onClick={() => revealWithTransition(childNode.id)}
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-zinc-100"
                          >
                            {childNode.kind === "folder" ? (
                              <FolderIcon className="h-4 w-4 shrink-0 text-zinc-500" />
                            ) : (
                              <span className="shrink-0 text-base font-semibold leading-none text-zinc-900">
                                -
                              </span>
                            )}
                            <span className="truncate text-[15px] text-zinc-800">
                              {childNode.title}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="flex min-h-[240px] items-center justify-center px-2 py-2 text-center">
                          <p className="text-sm text-zinc-500">
                            No pages available in this folder.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              ) : null}

              {isLessonPage && lessonContext && (
                <div className="mb-8 space-y-4">
                  {parentFolder ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAssessmentPage && lessonView === "video") {
                          setLessonView("notes");
                          return;
                        }
                        revealWithTransition(parentFolder.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      <span className="text-sm font-semibold leading-none text-zinc-900">-</span>
                      {!isAssessmentPage && lessonView === "video"
                        ? "Back to notes"
                        : `Back to ${parentFolder.title}`}
                    </button>
                  ) : null}

                  {!isAssessmentPage && lessonView === "notes" ? (
                    <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                      <div className="border-b border-zinc-200/80 bg-[linear-gradient(135deg,rgba(244,244,245,0.95),rgba(255,255,255,1))] px-4 py-4 md:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                              Lesson Notes
                            </p>
                            <p className="mt-1 text-sm text-zinc-600">
                              Read the notes below, or watch the full walkthrough
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              role="group"
                              aria-label="Zoom PDF"
                              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 p-1 shadow-sm"
                            >
                              <button
                                type="button"
                                onClick={() => setPdfZoom((z) => Math.max(50, z - 10))}
                                disabled={pdfZoom <= 50}
                                aria-label="Zoom out"
                                title="Zoom out"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                                  <path d="M4.5 10h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                              </button>
                              <span className="min-w-[3ch] text-center text-[11px] font-medium tabular-nums text-zinc-600">
                                {pdfZoom}%
                              </span>
                              <button
                                type="button"
                                onClick={() => setPdfZoom((z) => Math.min(200, z + 10))}
                                disabled={pdfZoom >= 200}
                                aria-label="Zoom in"
                                title="Zoom in"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                                  <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLessonView("video")}
                              className="inline-flex items-center gap-2 rounded-full border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                            >
                              <span className="ml-0.5 leading-none">▶</span>
                              Watch the video here
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-5 md:px-5">
                        <div className="overflow-hidden rounded-[24px] border border-zinc-200 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(244,244,245,0.92))]">
                          <object
                            key={`${selectedNode.id}-${pdfZoom}`}
                            data={`${resolveSubtopicPdfUrl(selectedNode.title)}#toolbar=0&navpanes=0&view=FitH&zoom=${pdfZoom}`}
                            type="application/pdf"
                            className="block h-[720px] w-full bg-white"
                          >
                            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 p-6 text-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                                <span className="text-xl font-semibold text-zinc-700">PDF</span>
                              </div>
                              <div>
                                <p className="text-base font-medium text-zinc-900">
                                  Notes coming soon
                                </p>
                                <p className="mt-1 text-sm text-zinc-500">
                                  The notes for this subtopic will appear here shortly.
                                </p>
                              </div>
                            </div>
                          </object>
                        </div>

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              revealWithTransition(lessonContext.previousLessonId, "previous")
                            }
                            disabled={!lessonContext.previousLessonId}
                            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                          >
                            Previous Lesson
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              revealWithTransition(nextLessonActionId, "next")
                            }
                            disabled={!nextLessonActionId}
                            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-300 sm:w-auto"
                          >
                            {nextLessonActionLabel}
                          </button>
                        </div>
                      </div>
                    </section>
                  ) : (
                  <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-zinc-200/80 bg-[linear-gradient(135deg,rgba(244,244,245,0.95),rgba(255,255,255,1))] px-4 py-4 md:px-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                            {isAssessmentPage ? "Assessment PDF" : "Lesson Video"}
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">
                            {isAssessmentPage
                              ? "PDF workspace placeholder for this assessment"
                              : "Video module placeholder for this page"}
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                          {isAssessmentPage ? "PDF" : "Coming Soon"}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-5 md:px-5">
                      {isAssessmentPage ? (
                        <div className="rounded-[24px] border border-dashed border-zinc-300 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(244,244,245,0.92))] p-4">
                          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[18px] border border-zinc-200 bg-white/80 px-5 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                              <span className="text-xl font-semibold text-zinc-700">PDF</span>
                            </div>
                            <div>
                              <p className="text-base font-medium text-zinc-900">
                                Assessment PDF placeholder
                              </p>
                              <p className="mt-1 text-sm text-zinc-500">
                                Attach the assessment worksheet here when it is ready
                              </p>
                            </div>
                            <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
                              {END_OF_TOPIC_ASSESSMENT_TITLE}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center rounded-[24px] border border-dashed border-zinc-300 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(244,244,245,0.92))]">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                              <span className="ml-1 text-2xl text-zinc-700">▶</span>
                            </div>
                            <div>
                              <span className="inline-flex items-center rounded-full border border-zinc-900 bg-zinc-900 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                                Coming Soon
                              </span>
                              <p className="mt-3 text-base font-medium text-zinc-900">
                                Video walkthrough in the works
                              </p>
                              <p className="mt-1 text-sm text-zinc-500">
                                Premium lesson recordings will appear here shortly.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                              isLessonWatched
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border border-zinc-200 bg-zinc-100 text-zinc-600",
                            ].join(" ")}
                          >
                            {isAssessmentPage
                              ? isLessonWatched
                                ? "Completed"
                                : "Not completed yet"
                              : isLessonWatched
                                ? "Watched"
                                : "Not watched yet"}
                          </span>
                          <button
                            type="button"
                            onClick={toggleLessonWatched}
                            className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                          >
                            {isAssessmentPage
                              ? isLessonWatched
                                ? "Mark as not completed"
                                : "Mark as completed"
                              : isLessonWatched
                                ? "Mark as not watched"
                                : "Mark as watched"}
                          </button>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={() =>
                              revealWithTransition(lessonContext.previousLessonId, "previous")
                            }
                            disabled={!lessonContext.previousLessonId}
                            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                          >
                            Previous Lesson
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              revealWithTransition(nextLessonActionId, "next")
                            }
                            disabled={!nextLessonActionId}
                            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-300 sm:w-auto"
                          >
                            {nextLessonActionLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                  )}

                  <section className="rounded-[24px] border border-zinc-200 bg-white px-5 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                          Chapter Progress
                        </p>
                        <p className="mt-1 text-sm text-zinc-600">
                          {completedLessonsCount} of {lessonContext.lessonIds.length} subtopics
                          completed
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-800">
                        {chapterProgressPercentage}%
                      </p>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={[
                          "h-full rounded-full transition-[width] duration-300",
                          completedLessonsCount > 0
                            ? "bg-[linear-gradient(90deg,#16a34a,#22c55e)]"
                            : "bg-[linear-gradient(90deg,#111827,#3f3f46)]",
                        ].join(" ")}
                        style={{ width: `${chapterProgressPercentage}%` }}
                      />
                    </div>
                  </section>
                </div>
              )}

              {visiblePageContent ? (
                <div className="notion-editor whitespace-pre-wrap py-1 text-[15px] leading-7 text-zinc-800">
                  {visiblePageContent}
                </div>
              ) : null}
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

      {selectedNode.kind === "page" && canUseAssistant ? (
        <EditorActionsDrawer
          pageTitle={selectedNode.title}
          pageContent={visiblePageContent}
          pageNodeId={selectedNode.id}
          onHoverChange={setIsAssistantHovered}
          isMobileOpen={isMobileAssistantOpen}
          onMobileOpenChange={(isOpen) => {
            setMobileAssistantNodeId(isOpen ? selectedNode.id : null);
          }}
        />
      ) : null}
    </section>
  );
}
