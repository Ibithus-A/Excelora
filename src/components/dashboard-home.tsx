"use client";
import {mapLessonProgress} from "@/lib/lesson-progress";

import {
  BookmarkIcon,
  FlowLogoIcon,
  LockIcon,
  TrashIcon,
  UnlockIcon,
} from "@/components/icons";
import { useFlowState } from "@/context/flowstate-context";
import { canAccessNode, CHAPTER_ONE_TITLE } from "@/lib/access";
import { A_LEVEL_MATHS_SUBJECTS } from "@/lib/seed";
import { getLessonChapterContext } from "@/lib/tree-utils";
import type { UserAccessProfile, UserPlan, UserRole } from "@/types/auth";
import {StudentActivityPanel} from "./student-activity-panel";
import { StudentPracticeHistory } from "./student-practice-history";
import { QuizPanel } from "./quiz-panel";
import {useStudyActivity} from "@/lib/hooks/use-study-activity";
import type { FlowNode } from "@/types/flowstate";
import type { TopicProgressController } from "@/types/topic-progress";
import type {
  AssessmentAttemptSummary,
  AssessmentPrerequisiteSummary,
} from "@/lib/hooks/use-assessment-access";
import { useMemo, useState } from "react";

type DashboardHomeProps = {
  name: string;
  role: UserRole;
  onOpenWorkspace: () => void;
  onStartTutorial: () => void;
  onSignOut: () => void;
  onSwitchAccount: () => void;
  currentPlan?: UserPlan;
  chapterTitles?: string[];
  students?: UserAccessProfile[];
  selectedStudent?: UserAccessProfile | null;
  selectedStudentId?: string;
  selectedStudentPlan?: UserPlan;
  activeStudentMilestone?: string | null;
  selectedStudentMilestone?: string | null;
  chapterTagsByTitle?: Record<string, Array<{ id: string; name: string; email: string }>>;
  accessibleChapterTitles?: string[];
  onSelectStudent?: (studentId: string) => void;
  onSetStudentPlan?: (plan: UserPlan) => Promise<void>;
  onSetMilestoneChapter?: (chapterTitle: string) => Promise<void>;
  onToggleChapter?: (chapterTitle: string) => Promise<void>;
  isChapterOneAssessmentUnlocked?: boolean;
  assessmentRequiresPremium?: boolean;
  isAssessmentAccessLoading?: boolean;
  assessmentAccessError?: string;
  chapterOneAssessmentAttempt?: AssessmentAttemptSummary | null;
  chapterOneAssessmentPrerequisite?: AssessmentPrerequisiteSummary;
  onToggleChapterOneAssessment?: () => Promise<void>;
  onAssessmentAttemptCleared?: () => void;
  onDeleteStudent?: () => Promise<{ ok: boolean; error?: string }>;
  topicProgress?: TopicProgressController;
};

type DashboardTopicItem = {
  id: string | null;
  title: string;
  meta: string;
  isCurrent?: boolean;
  isComplete?: boolean;
};

type DashboardLessonTopicItem = {
  id: string;
  title: string;
  meta: string;
  isComplete: boolean;
  isCurrent: boolean;
};


export function DashboardHome({
  name,
  role,
  onOpenWorkspace,
  onStartTutorial,
  onSignOut,
  onSwitchAccount,
  currentPlan = "basic",
  chapterTitles = [],
  students = [],
  selectedStudent,
  selectedStudentId,
  selectedStudentPlan = "basic",
  activeStudentMilestone,
  selectedStudentMilestone,
  chapterTagsByTitle = {},
  accessibleChapterTitles = [],
  onSelectStudent,
  onSetStudentPlan,
  onSetMilestoneChapter,
  onToggleChapter,
  isChapterOneAssessmentUnlocked = false,
  assessmentRequiresPremium = false,
  isAssessmentAccessLoading = false,
  assessmentAccessError = "",
  chapterOneAssessmentAttempt = null,
  chapterOneAssessmentPrerequisite = { isComplete: false, completedCount: 0, totalCount: 0 },
  onToggleChapterOneAssessment,
  onAssessmentAttemptCleared,
  onDeleteStudent,
  topicProgress,
}: DashboardHomeProps) {
  const { state, revealNode } = useFlowState();
  const {lessonProgress,currentSubtopicId}=useMemo(()=>mapLessonProgress(state,topicProgress?.rows??[]),[state,topicProgress?.rows]);
  const [studentSearch, setStudentSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [deleteConfirmationStudentId, setDeleteConfirmationStudentId] = useState<string | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState("");
  const [activeSubjectTitle, setActiveSubjectTitle] = useState(
    A_LEVEL_MATHS_SUBJECTS[0]?.title ?? "",
  );

  const visibleStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) => {
      const haystacks = [student.name, student.email].map((value) => value.toLowerCase());
      return haystacks.some((value) => value.includes(query));
    });
  }, [studentSearch, students]);

  const isDeleteConfirming =
    !!selectedStudent && deleteConfirmationStudentId === selectedStudent.id;
  const chapterTitleSet = useMemo(() => new Set(chapterTitles), [chapterTitles]);
  const subjectChapterGroups = useMemo(
    () =>
      A_LEVEL_MATHS_SUBJECTS.map((subject) => ({
        title: subject.title,
        chapterTitles: subject.chapters
          .map((chapter) => chapter.title)
          .filter((chapterTitle) => chapterTitleSet.has(chapterTitle)),
      })).filter((subject) => subject.chapterTitles.length > 0),
    [chapterTitleSet],
  );
  const activeSubject =
    subjectChapterGroups.find((subject) => subject.title === activeSubjectTitle) ??
    subjectChapterGroups[0] ??
    null;
  const activeSubjectUnlockedCount = activeSubject
    ? activeSubject.chapterTitles.filter(
        (chapterTitle) =>
          chapterTitle === CHAPTER_ONE_TITLE || accessibleChapterTitles.includes(chapterTitle),
      ).length
    : 0;
  const activeAccessPlan = role === "tutor" ? selectedStudentPlan : currentPlan;
  const assessmentNeedsPremium = assessmentRequiresPremium;
  const assessmentModulesIncomplete = !chapterOneAssessmentPrerequisite.isComplete;
  const accessibleChapterSet = useMemo(
    () => new Set(accessibleChapterTitles),
    [accessibleChapterTitles],
  );
  const milestoneTitle =
    activeStudentMilestone && chapterTitleSet.has(activeStudentMilestone)
      ? activeStudentMilestone
      : accessibleChapterTitles[0] ?? CHAPTER_ONE_TITLE;
  const milestoneIndex = chapterTitles.findIndex((title) => title === milestoneTitle);
  const progressGroups = useMemo(() => {
    const completed = chapterTitles.filter(
      (chapterTitle, index) =>
        accessibleChapterSet.has(chapterTitle) && milestoneIndex > 0 && index < milestoneIndex,
    );
    const ongoing =
      milestoneTitle && accessibleChapterSet.has(milestoneTitle) ? [milestoneTitle] : [];
    const occupiedTitles = new Set([...completed, ...ongoing]);
    const toDo = chapterTitles.filter(
      (chapterTitle) => accessibleChapterSet.has(chapterTitle) && !occupiedTitles.has(chapterTitle),
    );

    return { completed, ongoing, toDo };
  }, [accessibleChapterSet, chapterTitles, milestoneIndex, milestoneTitle]);
  const chapterProgressItems = useMemo(
    () => ({
      completed: progressGroups.completed.map((chapterTitle) => ({
        id: null,
        title: chapterTitle,
        meta:
          A_LEVEL_MATHS_SUBJECTS.find((subject) =>
            subject.chapters.some((chapter) => chapter.title === chapterTitle),
          )?.title ?? "A Level Maths",
        isComplete: false,
        isCurrent: false,
      })),
      ongoing: progressGroups.ongoing.map((chapterTitle) => ({
        id: null,
        title: chapterTitle,
        meta:
          A_LEVEL_MATHS_SUBJECTS.find((subject) =>
            subject.chapters.some((chapter) => chapter.title === chapterTitle),
          )?.title ?? "A Level Maths",
        isComplete: false,
        isCurrent: false,
      })),
      toDo: progressGroups.toDo.map((chapterTitle) => ({
        id: null,
        title: chapterTitle,
        meta:
          A_LEVEL_MATHS_SUBJECTS.find((subject) =>
            subject.chapters.some((chapter) => chapter.title === chapterTitle),
          )?.title ?? "A Level Maths",
        isComplete: false,
        isCurrent: false,
      })),
    }),
    [progressGroups.completed, progressGroups.ongoing, progressGroups.toDo],
  );
  const studentLessonItems = useMemo(() => {
    const orderedPages: FlowNode[] = [];
    const activeAccess = {
      plan: activeAccessPlan,
      taggedChapterTitle: activeStudentMilestone ?? null,
      customUnlockedChapterTitles: accessibleChapterTitles.filter(
        (chapterTitle) => chapterTitle !== CHAPTER_ONE_TITLE,
      ),
    };

    const walk = (nodeId: string) => {
      const node = state.nodes[nodeId];
      if (!node) return;

      if (
        node.kind === "page" &&
        canAccessNode(state, node.id, activeAccess) &&
        getLessonChapterContext(state, node.id)
      ) {
        orderedPages.push(node);
      }

      for (const childId of node.childrenIds) {
        walk(childId);
      }
    };

    for (const rootId of state.rootIds) {
      walk(rootId);
    }

    const items = orderedPages
      .map((node) => {
        const context = getLessonChapterContext(state, node.id);
        if (!context || context.isAssessmentPage || node.title === "Practice Questions") return null;

        return {
          id: node.id,
          title: node.title,
          meta: [context.chapterTitle, context.subjectTitle].filter(Boolean).join(" · "),
          isComplete: Boolean(lessonProgress[node.id]),
          isCurrent: currentSubtopicId === node.id,
        };
      })
      .filter((item): item is DashboardLessonTopicItem => Boolean(item));

    const completed = items.filter((item) => item.isComplete);
    const incomplete = items.filter((item) => !item.isComplete);
    const selectedCurrent = incomplete.find((item) => item.isCurrent) ?? null;
    const ongoing = selectedCurrent ? [selectedCurrent] : [];
    const ongoingIds = new Set(ongoing.map((item) => item.id));
    const toDo = incomplete.filter((item) => !ongoingIds.has(item.id));

    return { completed, ongoing, toDo };
  }, [
    accessibleChapterTitles,
    activeStudentMilestone,
    activeAccessPlan,
    currentSubtopicId,
    lessonProgress,
    state,
  ]);
  const visibleProgressItems =
    role === "student" || selectedStudent ? studentLessonItems : chapterProgressItems;
  useStudyActivity(role === "student", "Dashboard", "dashboard");
  const accessibleTopicCount = Math.max(
    role === "student" || selectedStudent
      ? visibleProgressItems.completed.length +
          visibleProgressItems.ongoing.length +
          visibleProgressItems.toDo.length
      : accessibleChapterTitles.length,
    1,
  );
  const completedPercentage = Math.round(
    (visibleProgressItems.completed.length / accessibleTopicCount) * 100,
  );
  const submittedAssessmentScore =
    chapterOneAssessmentAttempt?.status === "submitted" &&
    typeof chapterOneAssessmentAttempt.score === "number"
      ? chapterOneAssessmentAttempt.score
      : null;
  const submittedAssessmentMaximum =
    chapterOneAssessmentAttempt?.status === "submitted"
      ? chapterOneAssessmentAttempt.automated_total_marks ??
        chapterOneAssessmentAttempt.total_marks
      : null;
  const submittedAssessmentPercentage =
    submittedAssessmentScore !== null &&
    submittedAssessmentMaximum !== null &&
    submittedAssessmentMaximum > 0
      ? Math.round((submittedAssessmentScore / submittedAssessmentMaximum) * 100)
      : null;
  const progressCards = [
    {
      title: "Topics Complete",
      count: visibleProgressItems.completed.length,
      items: visibleProgressItems.completed,
      empty: "Completed topics will appear here as the current chapter moves forward.",
      dotClassName: "bg-emerald-500",
    },
    {
      title: "Topics Ongoing",
      count: visibleProgressItems.ongoing.length,
      items: visibleProgressItems.ongoing,
      empty: "No current topic is tagged yet.",
      dotClassName: "bg-amber-500",
    },
    {
      title: "Topics To Do",
      count: visibleProgressItems.toDo.length,
      items: visibleProgressItems.toDo,
      empty: "No unlocked topics are waiting.",
      dotClassName: "bg-zinc-400",
    },
  ];

  const openTopic = (item: DashboardTopicItem) => {
    if (!item.id) return;
    revealNode(item.id);
    onOpenWorkspace();
  };

  const setTopicAsCurrent = (item: DashboardTopicItem) => {
    if (!item.id || item.isComplete) return;
    void topicProgress?.setCurrentTopic({
      topicId: item.id,
      topicTitle: item.title,
      chapterTitle: item.meta.split(" · ")[0] ?? "",
      subjectTitle: item.meta.split(" · ")[1] ?? null,
    });
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent || !onDeleteStudent || isDeletingStudent) return;

    setDeleteError("");
    setIsDeletingStudent(true);
    const result = await onDeleteStudent();
    setIsDeletingStudent(false);

    if (!result.ok) {
      setDeleteError(result.error ?? "Unable to delete student.");
      return;
    }

    setDeleteConfirmationStudentId(null);
    setStudentSearch("");
    setIsSearchOpen(false);
  };

  return (
    <main className="min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-[var(--surface-app)] px-3 py-4 sm:px-5 sm:py-5 md:px-8 md:py-7">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-5">
        <header className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] px-4 py-4 shadow-sm transition-all duration-200 sm:px-5 md:px-7 md:py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white">
                <FlowLogoIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Welcome Page</p>
                <h1 className="text-xl font-medium text-zinc-900 md:text-2xl">
                  Welcome back
                </h1>
                <p className="text-sm text-zinc-600">{name}</p>
                {role === "student" ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-600">
                      {currentPlan} plan
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={onOpenWorkspace}
                className="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 sm:w-auto"
              >
                Open Workspace
              </button>
              <button
                type="button"
                onClick={onStartTutorial}
                className="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 sm:w-auto"
              >
                Replay Tutorial
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 sm:w-auto"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={onSwitchAccount}
                className="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 sm:w-auto"
              >
                Switch Account
              </button>
            </div>
          </div>
        </header>

        {role === "tutor" ? (
          <section className="relative z-30 rounded-[24px] border border-zinc-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)] lg:items-center">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">Student workspace</p>
                <h2 className="mt-1 text-lg font-medium tracking-tight text-zinc-950">Choose who you’re working with</h2>
                <p className="mt-1 text-xs leading-5 text-zinc-500">Your quizzes, activity, progress and access controls will all follow this selection.</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isSearchOpen}
                  onClick={() => setIsSearchOpen((open) => !open)}
                  className={[
                    "flex w-full items-center gap-3 rounded-2xl border bg-zinc-50/70 p-3 text-left outline-none transition",
                    isSearchOpen ? "border-zinc-400 ring-4 ring-zinc-950/5" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium uppercase text-white">
                    {selectedStudent ? selectedStudent.name.slice(0, 2) : "—"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">{selectedStudent?.name ?? "Select a student"}</span>
                    <span className="mt-0.5 block truncate text-xs text-zinc-500">{selectedStudent?.email ?? `${students.length} students available`}</span>
                  </span>
                  <svg viewBox="0 0 20 20" className={["h-4 w-4 shrink-0 text-zinc-400 transition-transform", isSearchOpen ? "rotate-180" : ""].join(" ")} aria-hidden="true">
                    <path d="m5.5 7.5 4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isSearchOpen ? (
                  <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                    <div className="relative mb-2">
                      <svg viewBox="0 0 20 20" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <input
                        autoFocus
                        type="search"
                        value={studentSearch}
                        onChange={(event) => setStudentSearch(event.target.value)}
                        placeholder="Search by name or email"
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none focus:border-zinc-400 focus:bg-white"
                      />
                    </div>
                    <div role="listbox" className="max-h-64 overflow-y-auto">
                      {visibleStudents.length ? visibleStudents.map((student) => (
                        <button
                          type="button"
                          role="option"
                          aria-selected={student.id === selectedStudentId}
                          key={student.id}
                          onClick={() => {
                            onSelectStudent?.(student.id);
                            setStudentSearch("");
                            setIsSearchOpen(false);
                          }}
                          className={[
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                            student.id === selectedStudentId ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
                          ].join(" ")}
                        >
                          <span className={["flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium uppercase", student.id === selectedStudentId ? "bg-white/15 text-white" : "bg-zinc-200 text-zinc-700"].join(" ")}>{student.name.slice(0, 2)}</span>
                          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{student.name}</span><span className={["block truncate text-xs", student.id === selectedStudentId ? "text-white/60" : "text-zinc-400"].join(" ")}>{student.email}</span></span>
                          {student.id === selectedStudentId ? <span className="text-xs">✓</span> : null}
                        </button>
                      )) : <p className="px-3 py-5 text-center text-sm text-zinc-500">No matching students.</p>}
                    </div>
                  </div>
                ) : null}
                {selectedStudent ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                      <span><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />{selectedStudentMilestone ?? "No current chapter"}</span>
                      <span>{accessibleChapterTitles.length} of {chapterTitles.length} chapters unlocked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative grid grid-cols-2 rounded-full border border-zinc-200 bg-zinc-50 p-0.5" aria-label="Student plan">
                        <span aria-hidden="true" className={["pointer-events-none absolute bottom-0.5 left-0.5 top-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm transition-transform duration-200", selectedStudentPlan === "premium" ? "translate-x-full" : "translate-x-0"].join(" ")} />
                        {(["basic", "premium"] as const).map((plan) => (
                          <button key={plan} type="button" onClick={() => void onSetStudentPlan?.(plan)} className={["relative z-10 rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] transition", selectedStudentPlan === plan ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"].join(" ")}>{plan}</button>
                        ))}
                      </div>
                      <button type="button" onClick={() => { setDeleteConfirmationStudentId(selectedStudent.id); setDeleteError(""); }} disabled={isDeletingStudent || isDeleteConfirming} aria-label={`Delete ${selectedStudent.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"><TrashIcon className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            {isDeleteConfirming && selectedStudent ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                <span>Permanently delete <span className="font-medium">{selectedStudent.name}</span>? This cannot be undone.</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setDeleteConfirmationStudentId(null); setDeleteError(""); }} disabled={isDeletingStudent} className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700">Cancel</button>
                  <button type="button" onClick={() => void handleDeleteStudent()} disabled={isDeletingStudent} className="rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white disabled:opacity-60">{isDeletingStudent ? "Deleting…" : "Delete"}</button>
                </div>
              </div>
            ) : null}
            {deleteError ? <p className="mt-3 text-sm text-rose-700">{deleteError}</p> : null}
          </section>
        ) : null}

        <QuizPanel
          role={role}
          selectedStudentId={selectedStudentId ?? ""}
        />
        {role === "student" ? <StudentPracticeHistory /> : null}
        {role === "tutor" && (
          <StudentActivityPanel
            students={students}
            studentId={selectedStudentId ?? ""}
            onAssessmentAttemptCleared={onAssessmentAttemptCleared}
          />
        )}
        <article
          data-tour="dashboard-progress"
          className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] p-4 shadow-sm transition-all duration-200 md:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                Course Progress
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-medium tracking-tight text-zinc-950 md:text-2xl">
                  A Level Maths
                </h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                {role === "tutor"
                  ? selectedStudent
                    ? "Completed, current and available subtopics for the selected student."
                    : "Select a student to view their current course position."
                  : "Your current course position and available topics are shown here."}
              </p>
              {topicProgress?.isLoading ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                  Loading progress
                </div>
              ) : null}
              {topicProgress?.error ? (
                <div className="mt-3 max-w-2xl rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  Progress could not be loaded. {topicProgress.error}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {progressCards.map((card) => (
              <section
                key={card.title}
                className="min-h-48 rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${card.dotClassName}`} />
                    <h3 className="truncate text-sm font-medium text-zinc-900">
                      {card.title}
                    </h3>
                  </div>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600">
                    {card.count}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {card.items.length > 0 ? (
                    card.items.slice(0, 5).map((item) => {
                      const content = (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800">
                              {item.title}
                            </p>
                            {item.isCurrent ? (
                              <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-amber-700">
                                Current
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-zinc-500">
                            {item.meta}
                          </p>
                        </>
                      );

                      return item.id ? (
                        <div
                          key={`${card.title}-${item.id}`}
                          className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 transition hover:border-zinc-300 hover:bg-white hover:shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() => openTopic(item)}
                            className="min-w-0 flex-1 text-left"
                          >
                            {content}
                          </button>
                          {role === "student" && !item.isComplete ? (
                            <button
                              type="button"
                              onClick={() => setTopicAsCurrent(item)}
                              disabled={item.isCurrent}
                              className={[
                                "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                                item.isCurrent
                                  ? "cursor-default border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900",
                              ].join(" ")}
                            >
                              {item.isCurrent ? "Current" : "Set current"}
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <div
                          key={`${card.title}-${item.title}`}
                          className="w-full rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-left transition"
                        >
                          {content}
                        </div>
                      );
                    })
                  ) : (
                    <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-3 text-sm leading-6 text-zinc-500">
                      {card.empty}
                    </p>
                  )}
                  {card.items.length > 5 ? (
                    <p className="px-1 text-xs text-zinc-500">
                      +{card.items.length - 5} more
                    </p>
                  ) : null}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-zinc-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3 text-xs font-medium text-zinc-600">
              <span>{visibleProgressItems.completed.length} complete</span>
              <span>
                {role === "student"
                  ? `${accessibleTopicCount} available topics`
                  : selectedStudent
                    ? `${accessibleTopicCount} available topics`
                    : `${accessibleChapterTitles.length} unlocked topics`}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-zinc-900 transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: `${completedPercentage}%` }}
              />
            </div>
          </div>
        </article>

        {role === "student" ? (
          <article className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] p-4 shadow-sm transition-all duration-200 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Assessment Result
                </p>
                <h2 className="mt-2 text-xl font-medium tracking-tight text-zinc-950 md:text-2xl">
                  Chapter 1: Algebra and Functions
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Your saved assessment status and final automatically marked score.
                </p>
              </div>

              {submittedAssessmentScore !== null && submittedAssessmentMaximum !== null ? (
                <div className="min-w-36 rounded-xl border border-zinc-200 bg-white px-5 py-4 text-right">
                  <p className="text-3xl font-medium tabular-nums tracking-tight text-zinc-950">
                    {submittedAssessmentScore}
                    <span className="text-lg font-medium text-zinc-400">
                      {` / ${submittedAssessmentMaximum}`}
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    {submittedAssessmentPercentage}%
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-xl border border-zinc-200 bg-white px-4 py-3.5">
              {isAssessmentAccessLoading ? (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                  Loading assessment result
                </div>
              ) : assessmentAccessError ? (
                <p className="text-sm text-rose-700">
                  Assessment result could not be loaded. {assessmentAccessError}
                </p>
              ) : chapterOneAssessmentAttempt?.status === "submitted" ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Submitted</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {chapterOneAssessmentAttempt.submitted_at
                        ? `Completed ${new Date(chapterOneAssessmentAttempt.submitted_at).toLocaleDateString()}`
                        : "Your completed attempt has been saved."}
                      {(chapterOneAssessmentAttempt.pending_review_marks ?? 0) > 0
                        ? ` · ${chapterOneAssessmentAttempt.pending_review_marks} marks pending review`
                        : ""}
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                    Final result
                  </span>
                </div>
              ) : chapterOneAssessmentAttempt?.status === "active" ? (
                <div>
                  <p className="text-sm font-medium text-zinc-900">Attempt in progress</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {chapterOneAssessmentAttempt.locked_questions.length} of 15 questions locked in.
                    Your final score will appear here after submission.
                  </p>
                </div>
              ) : assessmentRequiresPremium ? (
                <div>
                  <p className="text-sm font-medium text-zinc-900">Premium required</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Upgrade your plan to access this assessment.
                  </p>
                </div>
              ) : assessmentModulesIncomplete ? (
                <div>
                  <p className="text-sm font-medium text-zinc-900">Assessment locked</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Complete all Chapter 1 modules first
                    {chapterOneAssessmentPrerequisite.totalCount > 0
                      ? ` · ${chapterOneAssessmentPrerequisite.completedCount}/${chapterOneAssessmentPrerequisite.totalCount} complete`
                      : ""}
                    .
                  </p>
                </div>
              ) : isChapterOneAssessmentUnlocked ? (
                <div>
                  <p className="text-sm font-medium text-zinc-900">Ready to begin</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Your Chapter 1 assessment is unlocked in the workspace.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-zinc-900">Awaiting unlock</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    You have completed the chapter. Your tutor can now unlock the assessment.
                  </p>
                </div>
              )}
            </div>
          </article>
        ) : null}

        {role === "tutor" && chapterTitles.length > 0 ? (
          <article id="student-access" className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] p-4 shadow-sm transition-all duration-200 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-zinc-500">Access &amp; Curriculum</h2>
                <p className="mt-1 text-xs text-zinc-500">Set the current chapter and control which course material is available.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">
                  Chapter Access
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Tag the current chapter or toggle locks within each subject.
                </p>
              </div>
              <p className="text-xs font-medium text-zinc-600">
                {accessibleChapterTitles.length}
                <span className="text-zinc-400"> / {chapterTitles.length} unlocked</span>
              </p>
            </div>

            {subjectChapterGroups.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {subjectChapterGroups.map((subject) => {
                  const isActive = activeSubject?.title === subject.title;
                  const unlockedCount = subject.chapterTitles.filter(
                    (chapterTitle) =>
                      chapterTitle === CHAPTER_ONE_TITLE ||
                      accessibleChapterTitles.includes(chapterTitle),
                  ).length;

                  return (
                    <button
                      key={subject.title}
                      type="button"
                      onClick={() => setActiveSubjectTitle(subject.title)}
                      aria-pressed={isActive}
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        isActive
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900",
                      ].join(" ")}
                    >
                      <span>{subject.title}</span>
                      <span
                        className={[
                          "rounded-full px-1.5 py-0.5 text-[10px]",
                          isActive ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-500",
                        ].join(" ")}
                      >
                        {unlockedCount}/{subject.chapterTitles.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {activeSubject ? (
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-500">
                <span>{activeSubject.title}</span>
                <span>
                  {activeSubjectUnlockedCount} of {activeSubject.chapterTitles.length} chapters
                  unlocked
                </span>
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {(activeSubject?.chapterTitles ?? chapterTitles).map((chapterTitle) => {
                const isAlwaysUnlocked = chapterTitle === CHAPTER_ONE_TITLE;
                const isUnlocked =
                  isAlwaysUnlocked || accessibleChapterTitles.includes(chapterTitle);
                const isMilestone = selectedStudentMilestone === chapterTitle;
                const chapterTags = chapterTagsByTitle[chapterTitle] ?? [];

                const lockDisabled = isAlwaysUnlocked;
                const lockLabel = isAlwaysUnlocked
                  ? "Always unlocked"
                  : isUnlocked
                    ? "Unlocked · click to lock"
                    : "Locked · click to unlock";

                return (
                  <div
                    key={chapterTitle}
                    className={[
                      "group rounded-xl border bg-white px-3.5 py-2.5 transition",
                      isMilestone
                        ? "border-emerald-200 shadow-[0_1px_0_rgba(16,185,129,0.08)]"
                        : "border-zinc-200 hover:border-zinc-300",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={[
                          "h-1.5 w-1.5 shrink-0 rounded-full transition",
                          isMilestone
                            ? "bg-emerald-500"
                            : isUnlocked
                              ? "bg-zinc-300"
                              : "bg-zinc-200",
                        ].join(" ")}
                      />
                      <p className="min-w-0 flex-1 truncate text-sm text-zinc-800">
                        {chapterTitle}
                      </p>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            void onSetMilestoneChapter?.(chapterTitle);
                          }}
                          aria-label={isMilestone ? "Remove current chapter tag" : "Tag as current chapter"}
                          aria-pressed={isMilestone}
                          title={isMilestone ? "Current chapter · click to remove" : "Tag as current chapter"}
                          className={[
                            "inline-flex h-7 w-7 items-center justify-center rounded-full border transition",
                            isMilestone
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-transparent text-zinc-400 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-700",
                          ].join(" ")}
                        >
                          <BookmarkIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void onToggleChapter?.(chapterTitle);
                          }}
                          disabled={lockDisabled}
                          aria-label={lockLabel}
                          aria-pressed={isUnlocked}
                          title={lockLabel}
                          className={[
                            "inline-flex h-7 w-7 items-center justify-center rounded-full border transition",
                            isUnlocked
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700",
                            lockDisabled ? "cursor-not-allowed opacity-60" : "",
                          ].join(" ")}
                        >
                          {isUnlocked ? (
                            <UnlockIcon className="h-3.5 w-3.5" />
                          ) : (
                            <LockIcon className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {chapterTags.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5 pl-[18px]">
                        {chapterTags.map((taggedStudent) => {
                          const isCurrentStudent = taggedStudent.id === selectedStudentId;
                          const studentInitial = taggedStudent.name.charAt(0).toUpperCase();
                          return (
                            <button
                              key={`${chapterTitle}-${taggedStudent.email}`}
                              type="button"
                              onClick={() => {
                                onSelectStudent?.(taggedStudent.id);
                                setStudentSearch(taggedStudent.name);
                                setIsSearchOpen(false);
                              }}
                              className={[
                                "inline-flex items-center gap-1.5 rounded-full border px-1 py-0.5 pr-2 text-[11px] font-medium transition",
                                isCurrentStudent
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                              ].join(" ")}
                              title={`${taggedStudent.name} (${taggedStudent.email})`}
                            >
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-medium text-white">
                                {studentInitial}
                              </span>
                              <span className="truncate">{taggedStudent.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                    {role === "tutor" && selectedStudent && chapterTitle === CHAPTER_ONE_TITLE ? (
                      <div className="mt-2 border-t border-zinc-100 pt-2 pl-[18px]">
                        <button
                          type="button"
                          onClick={() => { void onToggleChapterOneAssessment?.(); }}
                          disabled={isAssessmentAccessLoading || assessmentNeedsPremium || assessmentModulesIncomplete}
                          className={[
                            "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium transition disabled:cursor-wait disabled:opacity-60",
                            isChapterOneAssessmentUnlocked && !assessmentNeedsPremium
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100",
                          ].join(" ")}
                          aria-pressed={isChapterOneAssessmentUnlocked && !assessmentNeedsPremium}
                          title={assessmentNeedsPremium ? "Upgrade this student to Premium before unlocking the assessment" : assessmentModulesIncomplete ? "All chapter modules must be completed before this assessment can be unlocked" : isChapterOneAssessmentUnlocked ? "Click to lock assessment" : "Click to unlock assessment"}
                        >
                          {isChapterOneAssessmentUnlocked && !assessmentNeedsPremium ? <UnlockIcon className="h-3 w-3" /> : <LockIcon className="h-3 w-3" />}
                          {assessmentNeedsPremium
                            ? "Assessment · Premium required"
                            : assessmentModulesIncomplete
                              ? chapterOneAssessmentPrerequisite.totalCount > 0
                                ? `Assessment · ${chapterOneAssessmentPrerequisite.completedCount}/${chapterOneAssessmentPrerequisite.totalCount} modules`
                                : "Assessment · Checking modules"
                            : `Assessment ${isChapterOneAssessmentUnlocked ? "unlocked" : "locked"}`}
                        </button>
                        {assessmentAccessError ? <p className="mt-1 text-[11px] text-red-600">{assessmentAccessError}</p> : null}
                        <p className="mt-1 text-[11px] text-zinc-500">
                          {assessmentNeedsPremium
                            ? "Upgrade this student to Premium before unlocking."
                            : assessmentModulesIncomplete
                              ? chapterOneAssessmentPrerequisite.totalCount > 0
                                ? `Complete all ${chapterOneAssessmentPrerequisite.totalCount} chapter modules before unlocking.`
                                : "Checking chapter completion before unlocking."
                            : chapterOneAssessmentAttempt?.status === "submitted"
                            ? `Submitted · ${chapterOneAssessmentAttempt.score ?? 0}/${chapterOneAssessmentAttempt.automated_total_marks ?? chapterOneAssessmentAttempt.total_marks} automatically marked${(chapterOneAssessmentAttempt.pending_review_marks ?? 0) > 0 ? ` · ${chapterOneAssessmentAttempt.pending_review_marks} sketch marks pending` : ""}${chapterOneAssessmentAttempt.submitted_at ? ` · ${new Date(chapterOneAssessmentAttempt.submitted_at).toLocaleDateString()}` : ""}`
                            : chapterOneAssessmentAttempt?.status === "active"
                              ? `Attempt in progress · ${chapterOneAssessmentAttempt.score ?? 0}/${chapterOneAssessmentAttempt.automated_total_marks ?? chapterOneAssessmentAttempt.total_marks} currently marked · ${chapterOneAssessmentAttempt.locked_questions.length} locked`
                              : "No attempt started"}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}
