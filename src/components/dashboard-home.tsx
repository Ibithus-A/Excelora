"use client";

import { FlowLogoIcon } from "@/components/icons";
import { CHAPTER_ONE_TITLE } from "@/lib/access";
import type { UserAccessProfile, UserPlan, UserRole } from "@/types/auth";
import type { StudentDailyStats } from "@/types/dashboard";
import { useMemo, useState } from "react";

type MetricTab = "reviewed" | "due";

type DashboardHomeProps = {
  name: string;
  role: UserRole;
  onOpenWorkspace: () => void;
  onSignOut: () => void;
  onSwitchAccount: () => void;
  stats: StudentDailyStats;
  currentPlan?: UserPlan;
  chapterTitles?: string[];
  students?: UserAccessProfile[];
  selectedStudent?: UserAccessProfile | null;
  selectedStudentId?: string;
  selectedStudentPlan?: UserPlan;
  selectedStudentMilestone?: string | null;
  chapterTagsByTitle?: Record<string, Array<{ id: string; name: string; email: string }>>;
  unlockedChapterTitles?: string[];
  onSelectStudent?: (studentId: string) => void;
  onSetStudentPlan?: (plan: UserPlan) => Promise<void>;
  onSetMilestoneChapter?: (chapterTitle: string) => Promise<void>;
  onToggleChapter?: (chapterTitle: string) => Promise<void>;
  onDeleteStudent?: () => Promise<{ ok: boolean; error?: string }>;
};

export function DashboardHome({
  name,
  role,
  onOpenWorkspace,
  onSignOut,
  onSwitchAccount,
  stats,
  currentPlan = "basic",
  chapterTitles = [],
  students = [],
  selectedStudent,
  selectedStudentId,
  selectedStudentPlan = "basic",
  selectedStudentMilestone,
  chapterTagsByTitle = {},
  unlockedChapterTitles = [],
  onSelectStudent,
  onSetStudentPlan,
  onSetMilestoneChapter,
  onToggleChapter,
  onDeleteStudent,
}: DashboardHomeProps) {
  const [activeTab, setActiveTab] = useState<MetricTab>("reviewed");
  const [studentSearch, setStudentSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const activeMetric = useMemo(
    () =>
      activeTab === "reviewed"
        ? {
            title: "Modules Reviewed Today",
            value: stats.reviewedToday,
            detail: "Strong momentum. Keep your streak alive.",
          }
        : {
            title: "Modules to Review Today",
            value: stats.dueToday,
            detail: "Focus on these first for best retention.",
          },
    [activeTab, stats.dueToday, stats.reviewedToday],
  );

  const visibleStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) => student.name.toLowerCase().includes(query));
  }, [studentSearch, students]);
  const searchValue = isSearchOpen ? studentSearch : (selectedStudent?.name ?? studentSearch);

  const handleDeleteStudent = async () => {
    if (!selectedStudent || !onDeleteStudent || isDeletingStudent) return;
    const confirmed = window.confirm(
      `Delete ${selectedStudent.name}? This permanently removes their account and access.`,
    );
    if (!confirmed) return;

    setDeleteError("");
    setIsDeletingStudent(true);
    const result = await onDeleteStudent();
    setIsDeletingStudent(false);

    if (!result.ok) {
      setDeleteError(result.error ?? "Unable to delete student.");
      return;
    }

    setStudentSearch("");
    setIsSearchOpen(false);
  };

  return (
    <main className="h-screen w-screen overflow-y-auto bg-[var(--surface-app)] px-3 py-4 md:px-8 md:py-7">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] px-4 py-4 shadow-sm transition-all duration-200 md:px-7 md:py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white">
                <FlowLogoIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Welcome Page</p>
                <h1 className="text-xl font-semibold text-zinc-900 md:text-2xl">
                  Welcome back
                </h1>
                <p className="text-sm text-zinc-600">{name}</p>
                {role === "student" ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-600">
                      {currentPlan} plan
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenWorkspace}
                className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
              >
                Open Workspace
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={onSwitchAccount}
                className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
              >
                Switch Account
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <article className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] p-4 shadow-sm transition-all duration-200 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Habit Tracker
              </h2>
              <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-600">
                Coming Soon
              </span>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
              <p className="text-lg font-semibold text-zinc-800">Coming Soon</p>
              <p className="mt-2 text-sm text-zinc-600">
                Habit tracking is planned for a future update.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] p-4 shadow-sm transition-all duration-200 md:p-6">
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("reviewed")}
                className={[
                  "flex-1 rounded-md px-3 py-2 text-sm transition",
                  activeTab === "reviewed"
                    ? "bg-white font-medium text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700",
                ].join(" ")}
              >
                Modules Reviewed
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("due")}
                className={[
                  "flex-1 rounded-md px-3 py-2 text-sm transition",
                  activeTab === "due"
                    ? "bg-white font-medium text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700",
                ].join(" ")}
              >
                Modules to Review
              </button>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-zinc-500">{activeMetric.title}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900">
                {activeMetric.value}
              </p>
              <p className="mt-2 text-sm text-zinc-600">{activeMetric.detail}</p>
            </div>
          </article>
        </div>

        {role === "tutor" && chapterTitles.length > 0 ? (
          <article className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] p-4 shadow-sm transition-all duration-200 md:p-6">
            <div className="mb-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-800">
                    Student Chapter Access
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-zinc-600">
                    Every new user starts on Basic with Chapter 1 only. Upgrade a student to Premium before unlocking any additional chapters.
                  </p>
                </div>
                {students.length > 0 ? (
                  <div className="relative w-full max-w-[320px]">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                      Find A User
                    </label>
                    <input
                      type="search"
                      value={searchValue}
                      onFocus={() => setIsSearchOpen(true)}
                      onChange={(event) => {
                        setStudentSearch(event.target.value);
                        setIsSearchOpen(true);
                      }}
                      placeholder="Start typing a name..."
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-400"
                    />
                    {isSearchOpen && studentSearch.trim() ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                        {visibleStudents.length > 0 ? (
                          visibleStudents.slice(0, 6).map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => {
                                onSelectStudent?.(student.id);
                                setStudentSearch(student.name);
                                setIsSearchOpen(false);
                              }}
                              className="flex w-full items-center justify-between border-b border-zinc-100 px-3 py-2.5 text-left text-sm text-zinc-700 transition last:border-b-0 hover:bg-zinc-50"
                            >
                              <span>{student.name}</span>
                              {student.id === selectedStudentId ? (
                                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                                  Selected
                                </span>
                              ) : null}
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-2.5 text-sm text-zinc-500">No matching users found.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Selected Student
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {selectedStudent?.name ?? "No student selected"}
                  </p>
                </div>

                <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      void onSetStudentPlan?.("basic");
                    }}
                    className={[
                      "rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition",
                      selectedStudentPlan === "basic"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800",
                    ].join(" ")}
                  >
                    Basic
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void onSetStudentPlan?.("premium");
                    }}
                    className={[
                      "rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition",
                      selectedStudentPlan === "premium"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800",
                    ].join(" ")}
                  >
                    Premium
                  </button>
                </div>
              </div>

              {selectedStudent ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-rose-600">
                      Danger Zone
                    </p>
                    <p className="mt-1 text-sm text-rose-700">
                      Delete this student account permanently from Excelora.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDeleteStudent();
                    }}
                    disabled={isDeletingStudent}
                    className="inline-flex items-center justify-center rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDeletingStudent ? "Deleting..." : "Delete Student"}
                  </button>
                </div>
              ) : null}

              {deleteError ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  {deleteError}
                </div>
              ) : null}

              {selectedStudentPlan === "basic" ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
                  Basic users are restricted to Chapter 1. Upgrade to Premium before unlocking any additional chapters.
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">
                  Milestone: {selectedStudentMilestone ?? "Not tagged"}
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">
                  Unlocked: {unlockedChapterTitles.length} / {chapterTitles.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {chapterTitles.map((chapterTitle) => {
                const isAlwaysUnlocked = chapterTitle === CHAPTER_ONE_TITLE;
                const canUseCustomUnlock = selectedStudentPlan === "premium";
                const isUnlocked =
                  isAlwaysUnlocked || unlockedChapterTitles.includes(chapterTitle);
                const isMilestone = selectedStudentMilestone === chapterTitle;
                const chapterTags = chapterTagsByTitle[chapterTitle] ?? [];

                return (
                  <div
                    key={chapterTitle}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 transition"
                  >
                    {isMilestone ? (
                      <div
                        className="mb-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-700"
                      >
                        Current Student Chapter
                      </div>
                    ) : null}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-zinc-700">{chapterTitle}</p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            void onSetMilestoneChapter?.(chapterTitle);
                          }}
                          disabled={!canUseCustomUnlock}
                          className={[
                            "rounded-md border px-2.5 py-1 text-xs font-medium transition",
                            canUseCustomUnlock
                              ? "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                              : "cursor-not-allowed border-zinc-200 bg-white text-zinc-400",
                          ].join(" ")}
                        >
                          {isMilestone ? "Tagged" : "Tag"}
                        </button>
                        {isMilestone ? (
                          <button
                            type="button"
                            onClick={() => {
                              void onSetMilestoneChapter?.(chapterTitle);
                            }}
                            className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-600 transition hover:bg-zinc-100"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {chapterTags.length > 0 ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {chapterTags.map((taggedStudent) => {
                          const isCurrentStudent =
                            taggedStudent.id === selectedStudentId;
                          return (
                          <span
                            key={`${chapterTitle}-${taggedStudent.email}`}
                            className={[
                              "rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium",
                              isCurrentStudent ? "text-emerald-600" : "text-zinc-700",
                            ].join(" ")}
                          >
                            {taggedStudent.name}
                          </span>
                          );
                        })}
                      </div>
                    ) : null}

                    <div className="mt-2.5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          void onToggleChapter?.(chapterTitle);
                        }}
                        disabled={isAlwaysUnlocked || !canUseCustomUnlock}
                        className={[
                          "rounded-md border px-2.5 py-1 text-xs",
                          isUnlocked
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-white text-zinc-600",
                          isAlwaysUnlocked || !canUseCustomUnlock
                            ? "cursor-not-allowed opacity-70"
                            : "",
                        ].join(" ")}
                      >
                        {isAlwaysUnlocked
                          ? "Always Unlocked"
                          : !canUseCustomUnlock
                            ? "Premium Only"
                            : isUnlocked
                              ? "Unlocked"
                              : "Locked"}
                      </button>
                    </div>
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
