"use client";

import Image from "next/image";
import { canAccessNode, getLockedChapterMessage } from "@/lib/access";
import { EditorActionsDrawer } from "@/components/editor-actions-drawer";
import { FolderIcon } from "@/components/icons";
import { useFlowState } from "@/context/flowstate-context";
import { LESSON_PROGRESS_STORAGE_KEY } from "@/lib/constants/storage";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { END_OF_TOPIC_ASSESSMENT_TITLE } from "@/lib/seed";
import { getDocumentProxy } from "unpdf";
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
type LessonSurfaceState = {
  nodeId: string | null;
  view: "notes" | "video";
  pdfZoom: number;
};
type PdfPageImage = {
  src: string;
  width: number;
  height: number;
};

const MAX_TITLE_FONT_SIZE_PX = 36;
const MIN_TITLE_FONT_SIZE_PX = 20;
const LEGACY_PLACEHOLDER_CONTENT = "use this space for notes and examples";
const pdfBufferCache = new Map<string, Uint8Array>();

function resolveSubtopicPdfUrl(title: string): string {
  return `/assets/${encodeURIComponent(title.trim())}.pdf`;
}

function resolveSubtopicVideoUrl(title: string): string {
  return `/assets/videos/${encodeURIComponent(title.trim())}.mp4`;
}

function resolveSubtopicVideoPosterUrl(title: string): string {
  return `/assets/videos/${encodeURIComponent(title.trim())}.jpg`;
}

function resolveAssessmentPdfUrl(chapterTitle: string): string {
  // Chapter titles look like "Chapter 1: Algebra and Functions". We qualify
  // the assessment PDF filename with the chapter number so different chapters
  // don't collide on /assets/Assessment.pdf.
  const match = chapterTitle.match(/chapter\s+(\d+)/i);
  const label = match ? `Chapter ${match[1]} Assessment` : `${chapterTitle} Assessment`;
  return `/assets/${encodeURIComponent(label)}.pdf`;
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
  const [lessonSurface, setLessonSurface] = useState<LessonSurfaceState>({
    nodeId: null,
    view: "notes",
    pdfZoom: 100,
  });
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
  const lessonView =
    lessonSurface.nodeId === selectedId ? lessonSurface.view : "notes";
  const pdfZoom =
    lessonSurface.nodeId === selectedId ? lessonSurface.pdfZoom : 100;

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
            <div
              key={`title-${selectedNode.id}`}
              className={`mx-auto flex w-full max-w-3xl flex-col gap-3 ${surfaceTransitionClass}`}
            >
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
                          setLessonSurface({
                            nodeId: selectedId,
                            view: "notes",
                            pdfZoom,
                          });
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
                                onClick={() =>
                                  setLessonSurface((current) => ({
                                    nodeId: selectedId,
                                    view:
                                      current.nodeId === selectedId ? current.view : lessonView,
                                    pdfZoom: Math.max(50, (current.nodeId === selectedId ? current.pdfZoom : 100) - 10),
                                  }))
                                }
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
                                onClick={() =>
                                  setLessonSurface((current) => ({
                                    nodeId: selectedId,
                                    view:
                                      current.nodeId === selectedId ? current.view : lessonView,
                                    pdfZoom: Math.min(200, (current.nodeId === selectedId ? current.pdfZoom : 100) + 10),
                                  }))
                                }
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
                              onClick={() =>
                                setLessonSurface({
                                  nodeId: selectedId,
                                  view: "video",
                                  pdfZoom,
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                            >
                              <span className="ml-0.5 leading-none">▶</span>
                              Watch the video here
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-5 md:px-5">
                        <div className="overflow-hidden rounded-none bg-white">
                          <PdfCanvasDocument
                            key={`${selectedNode.id}-${pdfZoom}`}
                            pdfUrl={resolveSubtopicPdfUrl(selectedNode.title)}
                            zoom={pdfZoom}
                            emptyTitle="Notes coming soon"
                            emptyBody="The notes for this subtopic will appear here shortly."
                          />
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
                            {isAssessmentPage ? "Assessment PDF" : "Lesson Resources"}
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">
                            {isAssessmentPage
                              ? "PDF workspace placeholder for this assessment"
                              : "Additional premium resources will appear here later"}
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                          {isAssessmentPage ? "PDF" : "Premium"}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-5 md:px-5">
                      {isAssessmentPage ? (
                        <div className="overflow-hidden rounded-none bg-white">
                          <PdfCanvasDocument
                            key={`${selectedNode.id}-${pdfZoom}`}
                            pdfUrl={resolveAssessmentPdfUrl(lessonContext.chapterTitle)}
                            zoom={pdfZoom}
                            emptyTitle={`${END_OF_TOPIC_ASSESSMENT_TITLE} coming soon`}
                            emptyBody="The assessment worksheet will appear here shortly."
                          />
                        </div>
                      ) : (
                        <LessonVideoPlayer
                          key={selectedNode.id}
                          videoUrl={resolveSubtopicVideoUrl(selectedNode.title)}
                          posterUrl={resolveSubtopicVideoPosterUrl(selectedNode.title)}
                          lessonTitle={selectedNode.title}
                          isLessonWatched={isLessonWatched}
                          onVideoComplete={() => {
                            if (isLessonWatched || !selectedNode) return;
                            setLessonProgress((current) => ({
                              ...current,
                              [selectedNode.id]: true,
                            }));
                          }}
                        />
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

function PdfCanvasDocument({
  pdfUrl,
  zoom,
  emptyTitle,
  emptyBody,
}: {
  pdfUrl: string;
  zoom: number;
  emptyTitle: string;
  emptyBody: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [renderWidth, setRenderWidth] = useState(0);
  const [pageImages, setPageImages] = useState<PdfPageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setRenderWidth(containerRef.current?.clientWidth ?? 0);
  }, [pdfUrl, zoom]);

  useEffect(() => {
    let isCancelled = false;

    const renderPdf = async () => {
      if (!renderWidth) return;

      setIsLoading(true);
      setHasError(false);
      setPageImages([]);

      try {
        let buffer = pdfBufferCache.get(pdfUrl);

        if (!buffer) {
          const response = await fetch(pdfUrl);
          if (!response.ok) {
            throw new Error("Unable to load PDF.");
          }

          buffer = new Uint8Array(await response.arrayBuffer());
          pdfBufferCache.set(pdfUrl, buffer);
        }

        const pdf = await getDocumentProxy(buffer.slice());
        const zoomScale = Math.max(0.5, zoom / 100);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const fitScale = renderWidth / baseViewport.width;
          const viewport = page.getViewport({ scale: fitScale * zoomScale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("Canvas unavailable.");
          }

          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          const renderedPage = {
            src: canvas.toDataURL("image/png"),
            width: canvas.width,
            height: canvas.height,
          };
          page.cleanup();

          if (isCancelled) return;

          setPageImages((current) => [...current, renderedPage]);
          if (pageNumber === 1) {
            setIsLoading(false);
          }

          await new Promise<void>((resolve) => {
            window.requestAnimationFrame(() => resolve());
          });
        }
      } catch (error) {
        if (isCancelled) return;
        console.error("[pdf-render] Failed to render PDF:", pdfUrl, error);
        setHasError(true);
        setPageImages([]);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void renderPdf();

    return () => {
      isCancelled = true;
    };
  }, [renderWidth, pdfUrl, zoom]);

  return (
    <div ref={containerRef} className="pdf-canvas-shell">
      {isLoading ? (
        <div className="pdf-loading-state">
          <div className="loading-skeleton h-12 w-40 rounded-xl" />
          <div className="loading-skeleton h-[520px] w-full rounded-[20px]" />
        </div>
      ) : null}

      {!isLoading && !hasError ? (
        <div className="pdf-canvas-stack">
          {pageImages.map((src, index) => (
            <Image
              key={`${pdfUrl}-page-${index + 1}`}
              src={src.src}
              alt={`PDF page ${index + 1}`}
              width={src.width}
              height={src.height}
              className="pdf-canvas-page"
              draggable={false}
              unoptimized
            />
          ))}
        </div>
      ) : null}

      {hasError ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
            <span className="text-xl font-semibold text-zinc-700">PDF</span>
          </div>
          <div>
            <p className="text-base font-medium text-zinc-900">{emptyTitle}</p>
            <p className="mt-1 text-sm text-zinc-500">{emptyBody}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LessonVideoPlayer({
  videoUrl,
  posterUrl,
  lessonTitle,
  isLessonWatched,
  onVideoComplete,
}: {
  videoUrl: string;
  posterUrl: string;
  lessonTitle: string;
  isLessonWatched: boolean;
  onVideoComplete: () => void;
}) {
  const [isVideoAvailable, setIsVideoAvailable] = useState(true);

  if (!isVideoAvailable) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[24px] border border-dashed border-zinc-300 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(244,244,245,0.92))]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
            <span className="ml-1 text-2xl text-zinc-700">▶</span>
          </div>
          <div>
            <span className="inline-flex items-center rounded-full border border-zinc-900 bg-zinc-900 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
              Coming soon
            </span>
            <p className="mt-3 text-base font-medium text-zinc-900">Video walkthrough coming soon</p>
            <p className="mt-1 text-sm text-zinc-500">
              This lesson’s full walkthrough will appear here once the video course is released.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-zinc-200 bg-zinc-950 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(24,24,27,0.96),rgba(39,39,42,0.92))] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
              Lesson Video
            </p>
            <p className="mt-1 text-sm font-medium text-white">{lessonTitle}</p>
          </div>
          <span
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em]",
              isLessonWatched
                ? "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border border-white/15 bg-white/10 text-white/70",
            ].join(" ")}
          >
            {isLessonWatched ? "Watched" : "Premium"}
          </span>
        </div>
      </div>
      <div className="bg-black">
        <video
          key={videoUrl}
          controls
          preload="metadata"
          poster={posterUrl}
          className="block aspect-video w-full bg-black"
          onEnded={onVideoComplete}
          onError={() => setIsVideoAvailable(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support embedded videos.
        </video>
      </div>
    </div>
  );
}
