"use client";

import {
  BookmarkIcon,
  FlowLogoIcon,
  LockIcon,
  TrashIcon,
  UnlockIcon,
} from "@/components/icons";
import { CHAPTER_ONE_TITLE } from "@/lib/access";
import type { UserAccessProfile, UserPlan, UserRole } from "@/types/auth";
import type { StudentDailyStats } from "@/types/dashboard";
import { useMemo, useState } from "react";

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
  accessibleChapterTitles?: string[];
  customUnlockedChapterTitles?: string[];
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
  currentPlan = "basic",
  chapterTitles = [],
  students = [],
  selectedStudent,
  selectedStudentId,
  selectedStudentPlan = "basic",
  selectedStudentMilestone,
  chapterTagsByTitle = {},
  accessibleChapterTitles = [],
  customUnlockedChapterTitles = [],
  onSelectStudent,
  onSetStudentPlan,
  onSetMilestoneChapter,
  onToggleChapter,
  onDeleteStudent,
}: DashboardHomeProps) {
  const [studentSearch, setStudentSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [deleteConfirmationStudentId, setDeleteConfirmationStudentId] = useState<string | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState("");

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
    <main className="min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-[var(--surface-app)] px-3 py-4 md:px-8 md:py-7">
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

        {role === "tutor" && chapterTitles.length > 0 ? (
          <article className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] p-4 shadow-sm transition-all duration-200 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Student Management
              </h2>
              {students.length > 0 ? (
                <span className="text-xs text-zinc-500">
                  {students.length} student{students.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>

            {students.length > 0 ? (
              <div className="relative mt-4 w-full sm:max-w-[360px]">
                <input
                  type="text"
                  value={studentSearch}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(event) => {
                    setStudentSearch(event.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Search student by name or email..."
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 pr-16 text-sm text-zinc-800 outline-none transition focus:border-zinc-400"
                />
                {studentSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSearch("");
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                  >
                    Clear
                  </button>
                ) : null}
                {isSearchOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
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
                          <span className="min-w-0">
                            <span className="block truncate">{student.name}</span>
                            <span className="block truncate text-xs text-zinc-500">
                              {student.email}
                            </span>
                          </span>
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

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {selectedStudent ? selectedStudent.name.charAt(0).toUpperCase() : "—"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-zinc-900">
                      {selectedStudent?.name ?? "No student selected"}
                    </p>
                    {selectedStudent ? (
                      <p className="truncate text-xs text-zinc-500">{selectedStudent.email}</p>
                    ) : (
                      <p className="text-xs text-zinc-500">
                        Search above to load a student's workspace.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="relative grid grid-cols-2 rounded-full border border-zinc-200 bg-zinc-50 p-0.5">
                    <span
                      aria-hidden="true"
                      className={[
                        "pointer-events-none absolute bottom-0.5 left-0.5 top-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        selectedStudentPlan === "premium" ? "translate-x-full" : "translate-x-0",
                      ].join(" ")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void onSetStudentPlan?.("basic");
                      }}
                      className={[
                        "relative z-10 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300",
                        selectedStudentPlan === "basic"
                          ? "text-zinc-900"
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
                        "relative z-10 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300",
                        selectedStudentPlan === "premium"
                          ? "text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-800",
                      ].join(" ")}
                    >
                      Premium
                    </button>
                  </div>
                  {selectedStudent ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmationStudentId(selectedStudent.id);
                        setDeleteError("");
                      }}
                      disabled={isDeletingStudent || isDeleteConfirming}
                      aria-label={`Delete ${selectedStudent.name}`}
                      title="Delete student"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              {selectedStudent ? (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        selectedStudentMilestone ? "bg-emerald-500" : "bg-zinc-300",
                      ].join(" ")}
                    />
                    Current chapter:{" "}
                    <span className="text-zinc-800">
                      {selectedStudentMilestone ?? "Not tagged"}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    {accessibleChapterTitles.length} of {chapterTitles.length} chapters unlocked
                  </span>
                </div>
              ) : null}

              {isDeleteConfirming && selectedStudent ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                  <span>
                    Permanently delete{" "}
                    <span className="font-semibold">{selectedStudent.name}</span>? This cannot be
                    undone.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmationStudentId(null);
                        setDeleteError("");
                      }}
                      disabled={isDeletingStudent}
                      className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeleteStudent();
                      }}
                      disabled={isDeletingStudent}
                      className="inline-flex items-center justify-center rounded-full border border-rose-600 bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isDeletingStudent ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ) : null}

              {deleteError ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  {deleteError}
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex items-end justify-between border-b border-zinc-200 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                  Chapter Access
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Tag the current chapter or toggle locks for any subtopic.
                </p>
              </div>
              <p className="text-xs font-medium text-zinc-600">
                {accessibleChapterTitles.length}
                <span className="text-zinc-400"> / {chapterTitles.length} unlocked</span>
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {chapterTitles.map((chapterTitle) => {
                const isAlwaysUnlocked = chapterTitle === CHAPTER_ONE_TITLE;
                const isUnlocked =
                  isAlwaysUnlocked || accessibleChapterTitles.includes(chapterTitle);
                const isMilestone = selectedStudentMilestone === chapterTitle;
                const isCustomUnlocked = customUnlockedChapterTitles.includes(chapterTitle);
                const milestoneIndex = selectedStudentMilestone
                  ? chapterTitles.indexOf(selectedStudentMilestone)
                  : -1;
                const chapterIndex = chapterTitles.indexOf(chapterTitle);
                const isManagedByTag =
                  milestoneIndex >= 0 &&
                  chapterIndex >= 0 &&
                  chapterIndex <= milestoneIndex &&
                  !isCustomUnlocked;
                const chapterTags = chapterTagsByTitle[chapterTitle] ?? [];

                const lockDisabled = isAlwaysUnlocked || isManagedByTag;
                const lockLabel = isAlwaysUnlocked
                  ? "Always unlocked"
                  : isManagedByTag
                    ? "Unlocked via current chapter tag"
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
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-semibold text-white">
                                {studentInitial}
                              </span>
                              <span className="truncate">{taggedStudent.name}</span>
                            </button>
                          );
                        })}
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
