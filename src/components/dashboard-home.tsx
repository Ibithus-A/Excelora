"use client";

import { FlowLogoIcon } from "@/components/icons";
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

type ComingSoonCardProps = {
  title: string;
  description: string;
};

function ComingSoonCard({ title, description }: ComingSoonCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] p-4 shadow-sm transition-all duration-200 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-500">
          {title}
        </h2>
        <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-600">
          Coming Soon
        </span>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
        <p className="text-lg font-semibold text-zinc-800">Coming Soon</p>
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
      </div>
    </article>
  );
}

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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <ComingSoonCard
            title="Habit Tracker"
            description="Habit tracking is planned for a future update."
          />
          <ComingSoonCard
            title="Module Review"
            description="Module review tracking is planned for a future update."
          />
        </div>

        {role === "tutor" && chapterTitles.length > 0 ? (
          <article className="rounded-2xl border border-zinc-200 bg-[var(--surface-panel)] p-4 shadow-sm transition-all duration-200 md:p-6">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Student Management
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-col items-stretch justify-start gap-4 sm:flex-row sm:flex-wrap sm:items-start">
                {students.length > 0 ? (
                  <div className="relative w-full sm:max-w-[320px]">
                    <div className="relative">
                      <input
                        type="text"
                        value={studentSearch}
                        onFocus={() => setIsSearchOpen(true)}
                        onChange={(event) => {
                          setStudentSearch(event.target.value);
                          setIsSearchOpen(true);
                        }}
                        placeholder="Search student by name or email..."
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 pr-16 text-sm text-zinc-800 outline-none focus:border-zinc-400"
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
                    </div>
                    {isSearchOpen ? (
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
                {students.length > 0 ? (
                  <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-600">
                    {students.length} student{students.length === 1 ? "" : "s"}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Selected Student
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {selectedStudent?.name ?? "No student selected"}
                  </p>
                  {selectedStudent ? (
                    <p className="mt-1 text-xs text-zinc-500">{selectedStudent.email}</p>
                  ) : null}
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="relative grid w-full grid-cols-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1 sm:w-auto">
                    <span
                      aria-hidden="true"
                      className={[
                        "pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        selectedStudentPlan === "premium" ? "translate-x-full" : "translate-x-0",
                      ].join(" ")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void onSetStudentPlan?.("basic");
                      }}
                      className={[
                        "relative z-10 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-300",
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
                        "relative z-10 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-300",
                        selectedStudentPlan === "premium"
                          ? "text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-800",
                      ].join(" ")}
                    >
                      Premium
                    </button>
                  </div>
                  {selectedStudent ? (
                    isDeleteConfirming ? (
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            void handleDeleteStudent();
                          }}
                          disabled={isDeletingStudent}
                          className="inline-flex w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                          {isDeletingStudent ? "Deleting..." : `Confirm Delete ${selectedStudent.name}`}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmationStudentId(null);
                            setDeleteError("");
                          }}
                          disabled={isDeletingStudent}
                          className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmationStudentId(selectedStudent.id);
                          setDeleteError("");
                        }}
                        disabled={isDeletingStudent}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                      >
                        Delete Student
                      </button>
                    )
                  ) : null}
                </div>
              </div>

              {isDeleteConfirming && selectedStudent ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                  Deleting {selectedStudent.name} will permanently remove their account and access.
                </div>
              ) : null}

              {deleteError ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  {deleteError}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">
                  Milestone: {selectedStudentMilestone ?? "Not tagged"}
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">
                  Unlocked: {accessibleChapterTitles.length} / {chapterTitles.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
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
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <p className="break-words text-sm text-zinc-700">{chapterTitle}</p>
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            void onSetMilestoneChapter?.(chapterTitle);
                          }}
                          className={[
                            "rounded-md border px-2.5 py-1 text-xs font-medium transition",
                            "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100",
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
                                "inline-flex items-center gap-2 rounded-full border px-2 py-1 pr-2.5 text-[11px] font-medium transition hover:bg-zinc-100",
                                isCurrentStudent
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-zinc-200 bg-white text-zinc-700",
                              ].join(" ")}
                              title={`${taggedStudent.name} (${taggedStudent.email})`}
                            >
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
                                {studentInitial}
                              </span>
                              <span>{taggedStudent.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    <div className="mt-2.5 flex items-center justify-start sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          void onToggleChapter?.(chapterTitle);
                        }}
                        disabled={isAlwaysUnlocked || isManagedByTag}
                        className={[
                          "rounded-md border px-2.5 py-1 text-xs",
                          isUnlocked
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-white text-zinc-600",
                          isAlwaysUnlocked || isManagedByTag
                            ? "cursor-not-allowed opacity-70"
                            : "",
                        ].join(" ")}
                      >
                        {isAlwaysUnlocked
                          ? "Always Unlocked"
                          : isManagedByTag
                            ? "Tagged Access"
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
