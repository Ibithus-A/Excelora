"use client";
import {mapLessonProgress, lessonIdentity} from "@/lib/lesson-progress";
import {useStudyActivity} from "@/lib/hooks/use-study-activity";

import { getStructuredLesson } from "@/lib/lessons/catalogue";
import { StructuredNativeLesson } from "./structured-native-lesson";
import { PracticeQuestions } from "./practice-questions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { canAccessNode, getLockedChapterMessage } from "@/lib/access";
import { GeneratedChapterAssessment } from "@/components/generated-chapter-assessment";
import { FolderIcon, PracticeIcon } from "@/components/icons";
import type { TutorialSurface } from "@/components/tutorial-showcase";
import { getNotionLesson } from "@/content/notion-lessons/registry";
import { useFlowState } from "@/context/flowstate-context";
import {
  END_OF_TOPIC_ASSESSMENT_TITLE,
  INTERACTIVE_ASSESSMENT_TITLE,
  PRACTICE_QUESTIONS_TITLE,
  SYNOPTIC_ASSESSMENT_TITLE,
} from "@/lib/seed";
import { getAssessmentKeyForSubject } from "@/lib/assessment-config";
import {
  getDefaultTitle,
  getLessonChapterContext,
  getNodeLockInfo,
} from "@/lib/tree-utils";
import type { UserAccessProfile } from "@/types/auth";
import type {
  TopicProgressController,
  TopicProgressMetadata,
} from "@/types/topic-progress";
import type { CSSProperties } from "react";
import {
  useCallback,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

const EditorActionsDrawer = dynamic(
  () =>
    import("@/components/editor-actions-drawer").then(
      (mod) => mod.EditorActionsDrawer,
    ),
  { ssr: false, loading: () => null },
);

type EditorPaneProps = {
  role: "tutor" | "student";
  viewerProfile?: UserAccessProfile | null;
  sidebarInsetPx?: number;
  tutorialSurface?: TutorialSurface | null;
  topicProgress?: TopicProgressController;
};

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
const LESSON_VIDEO_ASSET_VERSION = "20260903-video-1-9-graphs-v2";
const pdfBufferCache = new Map<string, Uint8Array>();

function resolveSubjectAssetPath(
  subjectTitle: string | null | undefined,
  fileTitle: string,
): string {
  const subjectPath = subjectTitle
    ? `${encodeURIComponent(subjectTitle.trim())}/`
    : "";
  return `/assets/${subjectPath}${encodeURIComponent(fileTitle.trim())}.pdf`;
}

function resolveSubtopicPdfUrl(
  title: string,
  subjectTitle: string | null | undefined,
): string {
  return resolveSubjectAssetPath(subjectTitle, title);
}

function resolveSubtopicVideoUrl(title: string): string {
  return `/assets/videos/${encodeURIComponent(title.trim())}.mp4?v=${LESSON_VIDEO_ASSET_VERSION}`;
}

function resolveSubtopicVideoPosterUrl(title: string): string {
  return `/assets/videos/${encodeURIComponent(title.trim())}.jpg?v=${LESSON_VIDEO_ASSET_VERSION}`;
}

function resolveAssessmentPdfUrl(
  chapterTitle: string,
  subjectTitle: string | null | undefined,
): string {
  // Chapter titles look like "Chapter 1: Algebra and Functions". We qualify
  // the assessment PDF filename with the chapter number so different chapters
  // don't collide on /assets/Assessment.pdf.
  return resolveSubjectAssetPath(
    subjectTitle,
    resolveAssessmentPdfTitle(chapterTitle),
  );
}

function resolveAssessmentPdfTitle(chapterTitle: string): string {
  return `${chapterTitle.replace(":", " -")} Assessment`;
}

const DEFAULT_LOCK_INFO = {
  isEffectivelyLocked: false,
  isLockedBySelf: false,
  isLockedByAncestorFolder: false,
  isLockedByAncestorPage: false,
  canToggleLock: false,
};

function buildWorkspaceContext(
  state: ReturnType<typeof useFlowState>["state"],
  selectedId: string | null,
) {
  const lines: string[] = [];

  const appendNode = (nodeId: string, depth: number) => {
    const node = state.nodes[nodeId];
    if (!node) return;

    const indent = "  ".repeat(depth);
    const isSelected = node.id === selectedId ? " [current]" : "";

    if (node.kind === "folder") {
      lines.push(`${indent}Folder: ${node.title}${isSelected}`);
      for (const childId of node.childrenIds) {
        appendNode(childId, depth + 1);
      }
      return;
    }

    const trimmedContent = node.content.trim();
    const normalizedContent = trimmedContent.replace(/\s+/g, " ").slice(0, 600);
    const contentLabel = normalizedContent ? ` — ${normalizedContent}` : "";

    lines.push(`${indent}Page: ${node.title}${isSelected}${contentLabel}`);
  };

  for (const rootId of state.rootIds) {
    appendNode(rootId, 0);
  }

  return lines.join("\n");
}

export function EditorPane({
  role,
  viewerProfile = null,
  sidebarInsetPx = 0,
  tutorialSurface = null,
  topicProgress,
}: EditorPaneProps) {
  const { state, revealNode } = useFlowState();
  const titleInputRef = useRef<HTMLDivElement | null>(null);
  const titleMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [titleFontSizePx, setTitleFontSizePx] = useState(
    MAX_TITLE_FONT_SIZE_PX,
  );
  const [reviewTarget, setReviewTarget] = useState<{
    nodeId: string;
    attemptId: string;
  } | null>(null);
  const [practiceTarget, setPracticeTarget] = useState<{
    nodeId: string;
    subtopic: string;
  } | null>(null);
  const [isAssistantHovered, setIsAssistantHovered] = useState(false);
  const [isMathsSidebarOpen, setIsMathsSidebarOpen] = useState(false);
  const [mobileAssistantNodeId, setMobileAssistantNodeId] = useState<
    string | null
  >(null);
  const [surfaceTransitionMode, setSurfaceTransitionMode] =
    useState<SurfaceTransitionMode>("fade");
  const workspaceTopicProgress = role === "student" ? topicProgress : undefined;
  const {lessonProgress,currentSubtopicId,recordsByNode}=useMemo(()=>mapLessonProgress(state,workspaceTopicProgress?.rows??[]),[state,workspaceTopicProgress?.rows]);
  const [lessonSurface, setLessonSurface] = useState<LessonSurfaceState>({
    nodeId: null,
    view: "notes",
    pdfZoom: 100,
  });
  const [lessonSurfaceExit, setLessonSurfaceExit] = useState<{
    nodeId: string;
  } | null>(null);
  const lessonSurfaceExitTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const pdfRef = useRef<PdfCanvasHandle>(null);
  const selectedId = state.selectedId;
  const selectedNode = selectedId ? state.nodes[selectedId] : null;
  const lockInfo = selectedNode
    ? getNodeLockInfo(state, selectedNode.id)
    : DEFAULT_LOCK_INFO;
  const isStudent = role === "student";
  const canChangeTopicProgress = Boolean(workspaceTopicProgress?.canMutate);
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
  const selectedNodeTitle =
    selectedNode?.title ?? getDefaultTitle(selectedNodeKind);
  const titleFitKey = `${selectedNode?.id ?? ""}:${selectedNodeKind}:${selectedNodeTitle}`;
  const visibleFolderChildItems = selectedNode
    ? selectedNode.childrenIds
        .map((childId) => state.nodes[childId])
        .filter((childNode) => {
          if (!childNode) return false;
          if (childNode.kind !== "page" && childNode.kind !== "folder")
            return false;
          if (!isStudent) return true;
          return canAccessNode(state, childNode.id, viewerProfile);
        })
    : [];
  const lessonContext = selectedNode
    ? getLessonChapterContext(state, selectedNode.id)
    : null;
  const isPracticePage =
    selectedNode?.title === PRACTICE_QUESTIONS_TITLE ||
    practiceTarget?.nodeId === selectedId;
  const isLessonPage =
    selectedNode?.kind === "page" && Boolean(lessonContext) && !isPracticePage;
  const isAssessmentPage = Boolean(lessonContext?.isAssessmentPage);
  const isInteractiveAssessment =
    selectedNode?.title === INTERACTIVE_ASSESSMENT_TITLE;
  const isSynopticAssessment =
    selectedNode?.kind === "page" && selectedNode.title === SYNOPTIC_ASSESSMENT_TITLE;
  const synopticSubject = isSynopticAssessment && selectedNode?.parentId
    ? state.nodes[selectedNode.parentId]?.title ?? ""
    : "";
  const structuredLesson = getStructuredLesson(selectedNode?.title ?? "");
  const notionLesson = getNotionLesson(selectedNode?.title);
  const NativeLessonComponent = notionLesson?.Component ?? null;
  const isNativeLessonPreview = Boolean(notionLesson || structuredLesson);
  const lessonAssetTitle =
    notionLesson?.definition.sourceTitle ??
    structuredLesson?.sourceTitle ??
    selectedNodeTitle.replace(/ — Original PDF$/, "");
  const assistantPdfTitle =
    isAssessmentPage && lessonContext
      ? resolveAssessmentPdfTitle(lessonContext.chapterTitle)
      : lessonAssetTitle;
  const parentFolder =
    selectedNode?.parentId &&
    state.nodes[selectedNode.parentId]?.kind === "folder"
      ? state.nodes[selectedNode.parentId]
      : null;
  const progressNodeId =
    selectedNode &&
    / — (?:Native review|Original PDF)$/.test(selectedNode.title)
      ? (parentFolder?.childrenIds.find(
          (id) => state.nodes[id]?.title === lessonAssetTitle,
        ) ?? selectedNode.id)
      : selectedNode?.id;
  const isLessonWatched = progressNodeId
    ? Boolean(lessonProgress[progressNodeId])
    : false;
  const isCurrentSubtopic = selectedNode?.id === currentSubtopicId;
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
    !selectedNode.content
      .trim()
      .toLowerCase()
      .includes(LEGACY_PLACEHOLDER_CONTENT)
      ? selectedNode.content.trim()
      : "";
  const isCourseRoot =
    selectedNode?.kind === "folder" && selectedNode.title === "A Level Maths";
  const workspaceContext = useMemo(
    () => buildWorkspaceContext(state, selectedId),
    [selectedId, state],
  );
  const tutorialLessonId = useMemo(() => {
    let fallbackLessonId: string | null = null;

    for (const rootId of state.rootIds) {
      const stack = [rootId];
      while (stack.length > 0) {
        const nodeId = stack.shift();
        if (!nodeId) continue;
        const node = state.nodes[nodeId];
        if (!node) continue;

        if (
          node.kind === "page" &&
          canAccessNode(state, node.id, viewerProfile)
        ) {
          const context = getLessonChapterContext(state, node.id);
          if (context && !context.isAssessmentPage) {
            if (getNotionLesson(node.title)) return node.id;
            fallbackLessonId ??= node.id;
          }
        }

        stack.unshift(...node.childrenIds);
      }
    }

    return fallbackLessonId;
  }, [state, viewerProfile]);
  const editorShellStyle = {
    paddingLeft:
      sidebarInsetPx > 0 ? `min(${sidebarInsetPx}px, 88vw)` : undefined,
    paddingRight:
      !isPracticePage && (isAssistantHovered || tutorialSurface === "ai")
        ? "min(460px, 46vw)"
        : undefined,
  } satisfies CSSProperties;

  const selectedTopicMetadata = (): TopicProgressMetadata | null => {
    if (!selectedNode || !lessonContext) return null;

    return {
      topicId: recordsByNode[selectedNode.id]?.topic_id ?? `lesson:${lessonIdentity(lessonContext.subjectTitle,lessonContext.chapterTitle,lessonAssetTitle)}`,
      topicTitle: lessonAssetTitle,
      chapterTitle: lessonContext.chapterTitle,
      subjectTitle: lessonContext.subjectTitle,
    };
  };

  const toggleLessonWatched = () => {
    if (!selectedNode || !isLessonPage) return;

    const metadata = selectedTopicMetadata();
    if (!metadata) return;

    if (lessonProgress[selectedNode.id]) {
      void workspaceTopicProgress?.markTopicTodo(metadata);
      return;
    }

    void workspaceTopicProgress?.markTopicCompleted(metadata);
  };

  const setSelectedSubtopicAsCurrent = () => {
    if (!selectedNode || !isLessonPage || isAssessmentPage) return;

    const metadata = selectedTopicMetadata();
    if (!metadata) return;
    void workspaceTopicProgress?.setCurrentTopic(metadata);
  };

  const nextLessonActionId =
    lessonContext?.nextLessonId ?? lessonContext?.assessmentId ?? null;
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
  const isMobileAssistantOpen =
    !!selectedId && mobileAssistantNodeId === selectedId;
  const lessonView =
    lessonSurface.nodeId === selectedId ? lessonSurface.view : "notes";
  useStudyActivity(role === "student" && Boolean(selectedNode), selectedNode?.title ?? "Workspace", selectedNode?.kind !== "page" ? "dashboard" : isPracticePage ? "practice" : isAssessmentPage || isSynopticAssessment ? "assessment" : lessonView === "video" ? "video" : "notes");
  const isLessonSurfaceExiting =
    !!selectedId && lessonSurfaceExit?.nodeId === selectedId;
  const pdfZoom =
    lessonSurface.nodeId === selectedId ? lessonSurface.pdfZoom : 100;
  const shouldFitPdfToPage =
    lessonSurface.nodeId !== selectedId ||
    tutorialSurface === "notes" ||
    tutorialSurface === "ai";

  const showLessonSurface = (
    nodeId: string | null,
    view: LessonSurfaceState["view"],
    zoom: number,
  ) => {
    if (!nodeId) return;

    if (lessonSurfaceExitTimerRef.current) {
      clearTimeout(lessonSurfaceExitTimerRef.current);
      lessonSurfaceExitTimerRef.current = null;
    }

    const currentView =
      lessonSurface.nodeId === nodeId ? lessonSurface.view : "notes";
    const shouldStageVideoEntry = currentView === "notes" && view === "video";

    if (!shouldStageVideoEntry) {
      setLessonSurface({ nodeId, view, pdfZoom: zoom });
      setLessonSurfaceExit(null);
      return;
    }

    setLessonSurfaceExit({ nodeId });
    lessonSurfaceExitTimerRef.current = setTimeout(() => {
      setLessonSurface({ nodeId, view, pdfZoom: zoom });
      setLessonSurfaceExit(null);
      lessonSurfaceExitTimerRef.current = null;
    }, 80);
  };

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

  useEffect(() => {
    return () => {
      if (lessonSurfaceExitTimerRef.current) {
        clearTimeout(lessonSurfaceExitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !tutorialSurface ||
      tutorialSurface === "dashboard" ||
      tutorialSurface === "course-map"
    ) {
      return;
    }
    if (!tutorialLessonId) return;

    revealNode(tutorialLessonId);
    const frame = window.requestAnimationFrame(() => {
      setLessonSurface(() => ({
        nodeId: tutorialLessonId,
        view: tutorialSurface === "video" ? "video" : "notes",
        pdfZoom: 100,
      }));
      if (tutorialSurface === "ai") {
        setMobileAssistantNodeId(tutorialLessonId);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [revealNode, tutorialLessonId, tutorialSurface]);

  if (!selectedNode) {
    return (
      <section className="flex h-full items-center justify-center bg-[var(--surface-panel)] p-5 sm:p-6 md:p-10">
        <div className="w-full max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            Excelora
          </p>
          <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
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
      <section className="flex h-full items-center justify-center bg-[var(--surface-panel)] p-5 sm:p-6 md:p-10">
        <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            Chapter Locked
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
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
          "min-w-0 flex-1 transition-[padding] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isMathsSidebarOpen ? "lg:pr-[390px]" : "lg:pr-0",
        ].join(" ")}
        style={editorShellStyle}
      >
        <div
          className={[
            "grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] transition",
            lockInfo.isEffectivelyLocked
              ? "pointer-events-none select-none"
              : "",
          ].join(" ")}
        >
          <header
            className={[
              "px-4 pt-14 pb-3 sm:pt-16 md:px-6",
              lockInfo.isEffectivelyLocked ? "opacity-65" : "",
            ].join(" ")}
          >
            <div
              key={`title-${selectedNode.id}`}
              className={`mx-auto flex w-full max-w-3xl flex-col gap-3 ${surfaceTransitionClass}`}
            >
              <div className="flex min-w-0 items-start gap-3">
                {isLessonPage && !isAssessmentPage && (
                  <button
                    type="button"
                    title="Practice this subtopic"
                    aria-label="Practice this subtopic"
                    onClick={() =>
                      setPracticeTarget({
                        nodeId: selectedNode.id,
                        subtopic: lessonAssetTitle.replace(/^\d+\.\d+\s+/, ""),
                      })
                    }
                    className="order-last mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <PracticeIcon className="h-5 w-5" />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <div
                    ref={titleInputRef}
                    className="w-full rounded-md border border-transparent bg-transparent px-1 py-1 font-semibold leading-tight tracking-[-0.03em] text-zinc-900 outline-none placeholder:text-zinc-300"
                    style={{ fontSize: `${titleFontSizePx}px` }}
                  >
                    {selectedNode.title || getDefaultTitle(selectedNode.kind)}
                  </div>
                  {isCourseRoot ? (
                    <p className="mt-2 px-1 text-sm leading-7 text-zinc-500">
                      Choose a subject, open a chapter, and move through lessons
                      with notes, video, and progress tracking.
                    </p>
                  ) : null}
                  <span
                    ref={titleMeasureRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute opacity-0 whitespace-nowrap px-1 py-1 font-semibold leading-tight tracking-[-0.03em]"
                  />
                </div>
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
                  {isCourseRoot ? null : (
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

              {isSynopticAssessment ? (
                <>
                  <button
                    type="button"
                    className="group mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2"
                    onClick={() => selectedNode.parentId && revealNode(selectedNode.parentId)}
                  >
                    <span aria-hidden="true" className="text-base leading-none text-zinc-400 transition group-hover:-translate-x-0.5 group-hover:text-zinc-700">←</span>
                    Back to {synopticSubject}
                  </button>
                  <section className="lesson-surface-reveal overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-zinc-200/80 bg-[linear-gradient(135deg,rgba(244,244,245,0.95),rgba(255,255,255,1))] px-4 py-4 md:px-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Timed Synoptic Assessment</p>
                          <p className="mt-1 text-sm text-zinc-600">Twenty questions spanning every {synopticSubject} chapter</p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">90 minutes · Secure</span>
                      </div>
                    </div>
                    <div className="px-4 py-5 md:px-5">
                      <GeneratedChapterAssessment
                        subjectTitle={synopticSubject}
                        chapterTitle=""
                        assessmentKeyOverride={getAssessmentKeyForSubject(synopticSubject) ?? ""}
                        assessmentTitle={`${synopticSubject} Synoptic Assessment`}
                        questionCount={20}
                        role={role}
                        onMathsSidebarOpenChange={setIsMathsSidebarOpen}
                        onReview={(attemptId) => {
                          setReviewTarget(attemptId ? { nodeId: selectedNode.id, attemptId } : null);
                          if (attemptId) setMobileAssistantNodeId(selectedNode.id);
                        }}
                      />
                    </div>
                  </section>
                </>
              ) : null}

              {isPracticePage && lessonContext && (
                <>
                  <button
                    type="button"
                    className="group mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2"
                    onClick={() => {
                      setPracticeTarget(null);
                      if (selectedNode.title === PRACTICE_QUESTIONS_TITLE)
                        revealNode(lessonContext.chapterId);
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="text-base leading-none text-zinc-400 transition group-hover:-translate-x-0.5 group-hover:text-zinc-700"
                    >
                      ←
                    </span>
                    {practiceTarget ? "Back to lesson" : "Back to chapter"}
                  </button>
                  <PracticeQuestions
                    key={`${selectedId}:${practiceTarget?.subtopic ?? "chapter"}`}
                    subjectTitle={lessonContext.subjectTitle ?? ""}
                    chapterTitle={lessonContext.chapterTitle}
                    initialSubtopic={practiceTarget?.subtopic ?? ""}
                    onMathsSidebarOpenChange={setIsMathsSidebarOpen}
                  />
                </>
              )}
              {isLessonPage && lessonContext && (
                <div className="mb-8 space-y-4">
                  {parentFolder ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAssessmentPage && lessonView === "video") {
                          showLessonSurface(selectedId, "notes", pdfZoom);
                          return;
                        }
                        revealWithTransition(parentFolder.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      <span className="text-sm font-semibold leading-none text-zinc-900">
                        -
                      </span>
                      {!isAssessmentPage && lessonView === "video"
                        ? isNativeLessonPreview
                          ? "Back to lesson page"
                          : "Back to notes"
                        : `Back to ${parentFolder.title}`}
                    </button>
                  ) : null}

                  {!isAssessmentPage && lessonView === "notes" ? (
                    <section
                      key={`notes-${selectedNode.id}`}
                      data-tour="lesson-notes"
                      className={[
                        "lesson-surface-reveal overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]",
                        isLessonSurfaceExiting ? "lesson-surface-exit" : "",
                      ].join(" ")}
                    >
                      <div className="border-b border-zinc-200/80 bg-[linear-gradient(135deg,rgba(244,244,245,0.95),rgba(255,255,255,1))] px-4 py-4 md:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                              {isNativeLessonPreview
                                ? "Interactive Lesson"
                                : "Lesson Notes"}
                            </p>
                            <p className="mt-1 text-sm text-zinc-600">
                              {isNativeLessonPreview
                                ? "Work through the page below, or watch the full walkthrough"
                                : "Read the notes below, or watch the full walkthrough"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isNativeLessonPreview ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const zoom =
                                      pdfRef.current?.computeFitToPageZoom();
                                    if (zoom == null) return;
                                    setLessonSurface({
                                      nodeId: selectedId,
                                      view: lessonView,
                                      pdfZoom: zoom,
                                    });
                                  }}
                                  aria-label="Fit page to screen"
                                  title="Fit page to screen"
                                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-3 text-[11px] font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900"
                                >
                                  <svg
                                    viewBox="0 0 20 20"
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M4 7V5a1 1 0 0 1 1-1h2M16 7V5a1 1 0 0 0-1-1h-2M4 13v2a1 1 0 0 0 1 1h2M16 13v2a1 1 0 0 1-1 1h-2"
                                      stroke="currentColor"
                                      strokeWidth="1.6"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  Fit
                                </button>
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
                                          current.nodeId === selectedId
                                            ? current.view
                                            : lessonView,
                                        pdfZoom: Math.max(
                                          50,
                                          (current.nodeId === selectedId
                                            ? current.pdfZoom
                                            : 100) - 10,
                                        ),
                                      }))
                                    }
                                    disabled={pdfZoom <= 50}
                                    aria-label="Zoom out"
                                    title="Zoom out"
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <svg
                                      viewBox="0 0 20 20"
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d="M4.5 10h11"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                      />
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
                                          current.nodeId === selectedId
                                            ? current.view
                                            : lessonView,
                                        pdfZoom: Math.min(
                                          200,
                                          (current.nodeId === selectedId
                                            ? current.pdfZoom
                                            : 100) + 10,
                                        ),
                                      }))
                                    }
                                    disabled={pdfZoom >= 200}
                                    aria-label="Zoom in"
                                    title="Zoom in"
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <svg
                                      viewBox="0 0 20 20"
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d="M10 4.5v11M4.5 10h11"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </>
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                showLessonSurface(selectedId, "video", pdfZoom)
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
                        {structuredLesson && !NativeLessonComponent ? (
                          <StructuredNativeLesson lesson={structuredLesson} />
                        ) : NativeLessonComponent ? (
                          <NativeLessonComponent />
                        ) : (
                          <div className="overflow-hidden rounded-none bg-white">
                            <PdfCanvasDocument
                              ref={pdfRef}
                              key={selectedNode.id}
                              pdfUrl={resolveSubtopicPdfUrl(
                                lessonAssetTitle,
                                lessonContext?.subjectTitle,
                              )}
                              zoom={pdfZoom}
                              autoFitDefault={shouldFitPdfToPage}
                              autoFitKey={`${selectedNode.id}:${tutorialSurface ?? "standard"}`}
                              onAutoFitZoom={(nextZoom) =>
                                setLessonSurface({
                                  nodeId: selectedId,
                                  view: lessonView,
                                  pdfZoom: nextZoom,
                                })
                              }
                              emptyTitle="Notes coming soon"
                              emptyBody="The notes for this subtopic will appear here shortly."
                            />
                          </div>
                        )}

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                          {role === "student" && <button type="button" disabled={workspaceTopicProgress?.isLoading} onClick={()=>{const metadata=selectedTopicMetadata();if(metadata)void (isLessonWatched?workspaceTopicProgress?.markTopicTodo(metadata):workspaceTopicProgress?.markNotesCompleted(metadata));}} className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium disabled:opacity-40">{isLessonWatched?"Lesson complete · Undo":"Mark lesson complete"}</button>}
                          {workspaceTopicProgress?.error && <p role="alert" className="text-sm text-rose-700">{workspaceTopicProgress.error}</p>}
                          <button
                            type="button"
                            onClick={() =>
                              revealWithTransition(
                                lessonContext.previousLessonId,
                                "previous",
                              )
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
                    <section
                      key={`${isAssessmentPage ? "assessment" : "video"}-${selectedNode.id}`}
                      data-tour={!isAssessmentPage ? "lesson-video" : undefined}
                      className={
                        isAssessmentPage
                          ? "lesson-surface-reveal overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
                          : "lesson-surface-reveal space-y-4"
                      }
                    >
                      {isAssessmentPage ? (
                        <div className="border-b border-zinc-200/80 bg-[linear-gradient(135deg,rgba(244,244,245,0.95),rgba(255,255,255,1))] px-4 py-4 md:px-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                                {isInteractiveAssessment
                                  ? "Timed Assessment"
                                  : "Tutor Assessment PDF"}
                              </p>
                              {!isInteractiveAssessment ? (
                                <p className="mt-1 text-sm text-zinc-600">
                                  Original paper and tutor answer-key reference
                                </p>
                              ) : null}
                            </div>
                            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                              {isInteractiveAssessment ? "Secure" : "PDF"}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      <div
                        className={isAssessmentPage ? "px-4 py-5 md:px-5" : ""}
                      >
                        {isAssessmentPage ? (
                          <div className="overflow-hidden rounded-none bg-white">
                            {isInteractiveAssessment && lessonContext ? (
                              <GeneratedChapterAssessment
                                subjectTitle={lessonContext.subjectTitle ?? ""}
                                chapterTitle={lessonContext.chapterTitle}
                                role={role}
                                onMathsSidebarOpenChange={setIsMathsSidebarOpen}
                                onReview={(attemptId) => {
                                  setReviewTarget(
                                    attemptId
                                      ? { nodeId: selectedNode.id, attemptId }
                                      : null,
                                  );
                                  if (attemptId)
                                    setMobileAssistantNodeId(selectedNode.id);
                                }}
                                onPractice={(subtopic) =>
                                  setPracticeTarget({
                                    nodeId: selectedNode.id,
                                    subtopic,
                                  })
                                }
                                onCompleted={() => {
                                  if (!selectedNode || isLessonWatched) return;
                                  const metadata = selectedTopicMetadata();
                                  if (!metadata) return;
                                  void workspaceTopicProgress?.markTopicCompleted(
                                    metadata,
                                  );
                                }}
                              />
                            ) : (
                              <PdfCanvasDocument
                                key={selectedNode.id}
                                pdfUrl={resolveAssessmentPdfUrl(
                                  lessonContext.chapterTitle,
                                  lessonContext.subjectTitle,
                                )}
                                zoom={pdfZoom}
                                autoFitDefault={shouldFitPdfToPage}
                                autoFitKey={`${selectedNode.id}:${tutorialSurface ?? "standard"}`}
                                onAutoFitZoom={(nextZoom) =>
                                  setLessonSurface({
                                    nodeId: selectedId,
                                    view: lessonView,
                                    pdfZoom: nextZoom,
                                  })
                                }
                                emptyTitle={`${END_OF_TOPIC_ASSESSMENT_TITLE} coming soon`}
                                emptyBody="The assessment worksheet will appear here shortly."
                              />
                            )}
                          </div>
                        ) : (
                          <LessonVideoPlayer
                            key={selectedNode.id}
                            videoUrl={resolveSubtopicVideoUrl(lessonAssetTitle)}
                            posterUrl={resolveSubtopicVideoPosterUrl(
                              lessonAssetTitle,
                            )}
                            lessonTitle={selectedNode.title}
                            isLessonWatched={Boolean(recordsByNode[selectedNode.id]?.watched_video)}
                            onVideoComplete={() => {
                              if (!selectedNode || recordsByNode[selectedNode.id]?.watched_video) return;
                              const metadata = selectedTopicMetadata();
                              if (!metadata) return;
                              void workspaceTopicProgress?.markTopicCompleted(
                                metadata,
                              );
                            }}
                          />
                        )}

                        {!isInteractiveAssessment ? (
                          <div
                            className={[
                              "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
                              isAssessmentPage
                                ? "mt-5"
                                : "rounded-[24px] border border-zinc-200 bg-white px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.05)]",
                            ].join(" ")}
                          >
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
                                disabled={!canChangeTopicProgress}
                                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isAssessmentPage
                                  ? isLessonWatched
                                    ? "Mark as not completed"
                                    : "Mark as completed"
                                  : isLessonWatched
                                    ? "Mark as not watched"
                                    : "Mark as watched"}
                              </button>
                              {!isAssessmentPage ? (
                                <button
                                  type="button"
                                  onClick={setSelectedSubtopicAsCurrent}
                                  disabled={
                                    isCurrentSubtopic || !canChangeTopicProgress
                                  }
                                  className={[
                                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                                    isCurrentSubtopic
                                      ? "cursor-default border-amber-200 bg-amber-50 text-amber-700"
                                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
                                  ].join(" ")}
                                >
                                  {isCurrentSubtopic
                                    ? "Current subtopic"
                                    : "Set as current"}
                                </button>
                              ) : null}
                            </div>

                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                              <button
                                type="button"
                                onClick={() =>
                                  revealWithTransition(
                                    lessonContext.previousLessonId,
                                    "previous",
                                  )
                                }
                                disabled={!lessonContext.previousLessonId}
                                className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                              >
                                Previous Lesson
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  revealWithTransition(
                                    nextLessonActionId,
                                    "next",
                                  )
                                }
                                disabled={!nextLessonActionId}
                                className="inline-flex w-full items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-300 sm:w-auto"
                              >
                                {nextLessonActionLabel}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  )}

                  {!isAssessmentPage ? (
                    <section className="rounded-[24px] border border-zinc-200 bg-white px-5 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                            Chapter Progress
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">
                            {completedLessonsCount} of{" "}
                            {lessonContext.lessonIds.length} subtopics completed
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
                  ) : null}
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

      {selectedNode.kind === "page" &&
      !isPracticePage && (!(isAssessmentPage || isSynopticAssessment) || reviewTarget?.nodeId === selectedNode.id) ? (
        <EditorActionsDrawer
          reviewAttemptId={
            reviewTarget?.nodeId === selectedNode.id
              ? reviewTarget.attemptId
              : undefined
          }
          pageTitle={selectedNode.title}
          pdfTitle={assistantPdfTitle}
          pageContent={visiblePageContent}
          pageNodeId={selectedNode.id}
          workspaceContext={workspaceContext}
          canUseAssistant={canUseAssistant}
          forceOpen={
            tutorialSurface === "ai" || reviewTarget?.nodeId === selectedNode.id
          }
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

type PdfCanvasHandle = {
  computeFitToPageZoom: () => number | null;
};

type PdfCanvasDocumentProps = {
  pdfUrl: string;
  zoom: number;
  autoFitDefault?: boolean;
  autoFitKey?: string;
  onAutoFitZoom?: (zoom: number) => void;
  emptyTitle: string;
  emptyBody: string;
};

const PdfCanvasDocument = forwardRef<PdfCanvasHandle, PdfCanvasDocumentProps>(
  function PdfCanvasDocument(
    {
      pdfUrl,
      zoom,
      autoFitDefault = false,
      autoFitKey,
      onAutoFitZoom,
      emptyTitle,
      emptyBody,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [renderWidth, setRenderWidth] = useState(0);
    const [pageImages, setPageImages] = useState<PdfPageImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const firstPageAspectRef = useRef<number | null>(null);
    const [firstPageAspect, setFirstPageAspect] = useState<number | null>(null);
    const panDirectionRef = useRef<"left" | "right" | null>(null);
    const panVelocityRef = useRef(0);
    const panFrameRef = useRef<number | null>(null);

    const computeFitZoom = useCallback(
      (aspect: number) => {
        if (!renderWidth) return null;

        const container = containerRef.current;
        const scrollerShell = container
          ?.closest(".pdf-canvas-shell")
          ?.parentElement?.closest(".scroll-slim") as HTMLElement | null;
        const viewportHeight =
          scrollerShell?.clientHeight ?? window.innerHeight;
        const verticalChrome = 280;
        const availableHeight = Math.max(320, viewportHeight - verticalChrome);

        const fitWidthForHeight = availableHeight * aspect;
        const zoomScale = (fitWidthForHeight / renderWidth) * 100;
        return Math.round(Math.max(50, Math.min(200, zoomScale)));
      },
      [renderWidth],
    );

    useImperativeHandle(
      ref,
      () => ({
        computeFitToPageZoom: () => {
          const aspect = firstPageAspectRef.current;
          if (!aspect) return null;
          return computeFitZoom(aspect);
        },
      }),
      [computeFitZoom],
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let rafId: number | null = null;
      const measure = () => {
        rafId = null;
        const width = container.clientWidth;
        if (width <= 0) return;
        setRenderWidth((current) =>
          Math.abs(current - width) < 2 ? current : width,
        );
      };

      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(() => {
          if (rafId !== null) return;
          rafId = window.requestAnimationFrame(measure);
        });
        observer.observe(container);
        measure();
        return () => {
          observer.disconnect();
          if (rafId !== null) window.cancelAnimationFrame(rafId);
        };
      }

      measure();
      const onWindowResize = () => {
        if (rafId !== null) return;
        rafId = window.requestAnimationFrame(measure);
      };
      window.addEventListener("resize", onWindowResize);
      return () => {
        window.removeEventListener("resize", onWindowResize);
        if (rafId !== null) window.cancelAnimationFrame(rafId);
      };
    }, [pdfUrl, zoom]);

    useEffect(() => {
      if (!autoFitDefault || zoom !== 100 || !firstPageAspect) return;

      const fitZoom = computeFitZoom(firstPageAspect);
      if (!fitZoom || Math.abs(fitZoom - zoom) < 2) return;

      onAutoFitZoom?.(fitZoom);
    }, [
      autoFitDefault,
      autoFitKey,
      computeFitZoom,
      firstPageAspect,
      onAutoFitZoom,
      pdfUrl,
      renderWidth,
      zoom,
    ]);

    useEffect(() => {
      let isCancelled = false;

      const renderPdf = async () => {
        if (!renderWidth) return;

        setIsLoading(true);
        setHasError(false);
        setPageImages([]);
        setFirstPageAspect(null);

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

          const { getDocumentProxy } = await import("unpdf");
          const pdf = await getDocumentProxy(buffer.slice());
          const zoomScale = Math.max(0.5, zoom / 100);
          const devicePixelRatio =
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
          const pixelRatio = Math.min(Math.max(devicePixelRatio, 1), 3);

          for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber += 1
          ) {
            const page = await pdf.getPage(pageNumber);
            const baseViewport = page.getViewport({ scale: 1 });
            if (pageNumber === 1) {
              const firstPageAspect = baseViewport.width / baseViewport.height;
              firstPageAspectRef.current = firstPageAspect;
              setFirstPageAspect(firstPageAspect);
            }
            const fitScale = renderWidth / baseViewport.width;
            const displayScale = fitScale * zoomScale;
            const viewport = page.getViewport({
              scale: displayScale * pixelRatio,
            });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) {
              throw new Error("Canvas unavailable.");
            }

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            await page.render({
              canvas,
              canvasContext: context,
              viewport,
            }).promise;

            const renderedPage = {
              src: canvas.toDataURL("image/png"),
              width: Math.max(1, Math.round(canvas.width / pixelRatio)),
              height: Math.max(1, Math.round(canvas.height / pixelRatio)),
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

    useEffect(() => {
      return () => {
        if (panFrameRef.current !== null) {
          window.cancelAnimationFrame(panFrameRef.current);
        }
      };
    }, []);

    const stopEdgePan = () => {
      panDirectionRef.current = null;
      panVelocityRef.current = 0;
      if (panFrameRef.current !== null) {
        window.cancelAnimationFrame(panFrameRef.current);
        panFrameRef.current = null;
      }
    };

    const startEdgePan = (direction: "left" | "right", velocity: number) => {
      const container = containerRef.current;
      if (!container || container.scrollWidth <= container.clientWidth) return;

      panDirectionRef.current = direction;
      panVelocityRef.current = velocity;
      if (panFrameRef.current !== null) return;

      const step = () => {
        const currentContainer = containerRef.current;
        const currentDirection = panDirectionRef.current;
        if (!currentContainer || !currentDirection) {
          panFrameRef.current = null;
          return;
        }

        currentContainer.scrollLeft +=
          (currentDirection === "right" ? 1 : -1) * panVelocityRef.current;
        panFrameRef.current = window.requestAnimationFrame(step);
      };

      panFrameRef.current = window.requestAnimationFrame(step);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container || container.scrollWidth <= container.clientWidth) {
        stopEdgePan();
        return;
      }

      const bounds = container.getBoundingClientRect();
      const edgeSize = Math.min(160, bounds.width * 0.22);
      const x = event.clientX - bounds.left;

      if (x >= bounds.width - edgeSize) {
        const intensity = (x - (bounds.width - edgeSize)) / edgeSize;
        startEdgePan("right", 2 + intensity * 14);
        return;
      }

      if (x <= edgeSize) {
        const intensity = (edgeSize - x) / edgeSize;
        startEdgePan("left", 2 + intensity * 14);
        return;
      }

      stopEdgePan();
    };

    return (
      <div
        ref={containerRef}
        className="pdf-canvas-shell"
        onPointerMove={handlePointerMove}
        onPointerLeave={stopEdgePan}
      >
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
              <p className="text-base font-medium text-zinc-900">
                {emptyTitle}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{emptyBody}</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

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
  const [videoStatus, setVideoStatus] = useState<
    "checking" | "available" | "unavailable"
  >("checking");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const checkVideo = async () => {
      try {
        const response = await fetch(videoUrl, { method: "HEAD" });
        if (isCancelled) return;
        setVideoStatus(response.ok ? "available" : "unavailable");
      } catch {
        if (!isCancelled) setVideoStatus("unavailable");
      }
    };

    void checkVideo();
    return () => {
      isCancelled = true;
    };
  }, [videoUrl]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
      setIsPlaying(true);
      return;
    }

    video.pause();
    setIsPlaying(false);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const seekTo = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value;
    setCurrentTime(value);
  };

  const enterFullscreen = async () => {
    const video = videoRef.current;
    if (!video || !video.requestFullscreen) return;
    await video.requestFullscreen();
  };

  if (videoStatus !== "available") {
    return (
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-[24px] border border-zinc-200 bg-zinc-950 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-sm">
            <span className="ml-1 text-2xl text-white">▶</span>
          </div>
          <div>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
              {videoStatus === "checking" ? "Loading" : "Coming soon"}
            </span>
            <p className="mt-3 text-base font-medium text-white">
              Video walkthrough coming soon
            </p>
            <p className="mt-1 max-w-md text-sm text-white/55">
              This lesson’s full walkthrough will appear here once the video
              course is released.
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
            {isLessonWatched ? "Watched" : "Not watched"}
          </span>
        </div>
      </div>
      <div className="bg-black">
        <video
          ref={videoRef}
          key={videoUrl}
          preload="metadata"
          poster={posterUrl}
          className={[
            "block aspect-video w-full bg-black transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isVideoReady ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => {
            void togglePlayback();
          }}
          onLoadedMetadata={(event) => {
            setIsVideoReady(true);
            setDuration(event.currentTarget.duration || 0);
            setCurrentTime(event.currentTarget.currentTime || 0);
            setIsMuted(event.currentTarget.muted);
          }}
          onTimeUpdate={(event) =>
            setCurrentTime(event.currentTarget.currentTime || 0)
          }
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            onVideoComplete();
          }}
          onError={() => setVideoStatus("unavailable")}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support embedded videos.
        </video>
        <div className="border-t border-white/10 bg-zinc-950 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void togglePlayback();
              }}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? "II" : "▶"}
            </button>
            <span className="min-w-[84px] text-xs font-medium tabular-nums text-white/70">
              {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || currentTime)}
              onChange={(event) => seekTo(Number(event.target.value))}
              className="h-1.5 min-w-0 flex-1 accent-white"
              aria-label="Video progress"
            />
            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-white transition hover:bg-white/15"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? "M" : "V"}
            </button>
            <button
              type="button"
              onClick={() => {
                void enterFullscreen();
              }}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-white transition hover:bg-white/15"
              aria-label="Enter fullscreen"
            >
              ⛶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatVideoTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
