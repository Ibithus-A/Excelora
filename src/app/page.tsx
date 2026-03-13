"use client";

import { DashboardHome } from "@/components/dashboard-home";
import { EditorPane } from "@/components/editor-pane";
import { MenuIcon } from "@/components/icons";
import { SignInPortal } from "@/components/sign-in-portal";
import { Sidebar } from "@/components/sidebar";
import { FlowStateProvider } from "@/context/flowstate-context";
import { useStudentProgress } from "@/lib/hooks/use-student-progress";
import { useStudents } from "@/lib/hooks/use-students";
import { accountFromUser } from "@/lib/supabase/account";
import { createClient } from "@/lib/supabase/client";
import { useSidebarResize } from "@/lib/hooks/use-sidebar-resize";
import type { AuthenticatedAccount } from "@/types/auth";
import { useEffect, useMemo, useState } from "react";

type AppView = "workspace" | "dashboard";
const PORTAL_CONTAINER_CLASS = "relative min-h-dvh w-full overflow-hidden bg-[var(--surface-panel)]";

export default function HomePage() {
  const [view, setView] = useState<AppView>("workspace");
  const [isSidebarAutoOpen, setIsSidebarAutoOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthenticatedAccount | null>(null);
  const { viewerProfile, students, updateStudentAccess, deleteStudent } = useStudents(currentUser?.email);
  const effectiveCurrentUser = useMemo(
    () => (currentUser ? viewerProfile ?? currentUser : null),
    [currentUser, viewerProfile],
  );
  const {
    selectedStudentId,
    selectedStudent,
    selectedStudentPlan,
    activeStudentUnlocks,
    selectedStudentCustomUnlocks,
    currentStudentStats,
    selectedStudentMilestone,
    chapterTagsByTitle,
    selectStudent,
    toggleChapterForSelectedStudent,
    setMilestoneForSelectedStudent,
    setPlanForSelectedStudent,
    deleteSelectedStudent,
    chapterTitles,
  } = useStudentProgress(currentUser, viewerProfile, students, updateStudentAccess, deleteStudent);
  const { sidebarWidth, startResize, isResizing } = useSidebarResize();

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const hydrateSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (data.session?.user) {
        setCurrentUser(accountFromUser(data.session.user));
        setView("dashboard");
      }
    };

    void hydrateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(accountFromUser(session.user));
        return;
      }
      setCurrentUser(null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleContinueFromSignIn = (account: AuthenticatedAccount) => {
    setCurrentUser(account);
    setView("dashboard");
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
    setView("dashboard");
  };

  const handleOpenDashboardFromSidebar = () => {
    setIsSidebarAutoOpen(false);
    setView("dashboard");
  };

  const handleOpenWorkspaceFromDashboard = () => {
    setIsSidebarAutoOpen(true);
    setView("workspace");
  };

  return (
    <FlowStateProvider>
      <main className="min-h-dvh w-full bg-[var(--surface-app)]">
        {!effectiveCurrentUser ? (
          <div className={PORTAL_CONTAINER_CLASS}>
            <SignInPortal
              onClose={() => {}}
              onContinue={handleContinueFromSignIn}
              showCloseButton={false}
            />
          </div>
        ) : view === "dashboard" ? (
          <DashboardHome
            name={effectiveCurrentUser.name}
            role={effectiveCurrentUser.role}
            stats={currentStudentStats}
            onOpenWorkspace={handleOpenWorkspaceFromDashboard}
            onSignOut={handleSignOut}
            onSwitchAccount={handleSignOut}
            currentPlan={viewerProfile?.plan ?? "basic"}
            chapterTitles={chapterTitles}
            students={students}
            selectedStudent={selectedStudent}
            selectedStudentId={selectedStudentId}
            selectedStudentPlan={selectedStudentPlan}
            selectedStudentMilestone={selectedStudentMilestone}
            chapterTagsByTitle={chapterTagsByTitle}
            accessibleChapterTitles={activeStudentUnlocks}
            customUnlockedChapterTitles={selectedStudentCustomUnlocks}
            onSelectStudent={selectStudent}
            onSetStudentPlan={setPlanForSelectedStudent}
            onSetMilestoneChapter={setMilestoneForSelectedStudent}
            onToggleChapter={toggleChapterForSelectedStudent}
            onDeleteStudent={deleteSelectedStudent}
          />
        ) : (
          <div className={PORTAL_CONTAINER_CLASS}>
            <button
              type="button"
              onClick={() => setIsSidebarAutoOpen(true)}
              className={[
                "absolute left-3 top-3 z-40 h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 md:hidden",
                isSidebarAutoOpen ? "hidden" : "inline-flex",
              ].join(" ")}
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-4 w-4" />
            </button>
            {isSidebarAutoOpen ? (
              <button
                type="button"
                onClick={() => setIsSidebarAutoOpen(false)}
                className="absolute inset-0 z-20 bg-black/20 md:hidden"
                aria-label="Close sidebar overlay"
              />
            ) : null}
            <div className="absolute inset-y-0 left-0 z-30">
              <div
                className="absolute inset-y-0 left-0 hidden w-4 md:block"
                onMouseEnter={() => setIsSidebarAutoOpen(true)}
                aria-hidden
              />
              <aside
                id="flowstate-sidebar"
                className={[
                  "absolute inset-y-0 left-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isSidebarAutoOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
                style={{ width: `min(${sidebarWidth}px, 88vw)` }}
                onMouseEnter={() => setIsSidebarAutoOpen(true)}
                onMouseLeave={() => {
                  if (isResizing) return;
                  if (window.innerWidth < 768) return;
                  if (!isSidebarAutoOpen) return;
                  setIsSidebarAutoOpen(false);
                }}
              >
                <Sidebar
                  onOpenDashboard={handleOpenDashboardFromSidebar}
                  onRequestClose={() => setIsSidebarAutoOpen(false)}
                  role={effectiveCurrentUser.role}
                  viewerProfile={viewerProfile}
                />
                <div
                  className="absolute inset-y-0 right-0 hidden w-2 cursor-col-resize lg:block"
                  onMouseDown={startResize}
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize sidebar"
                />
              </aside>
            </div>

            <div className="h-full min-h-dvh">
              <EditorPane
                role={effectiveCurrentUser.role}
                viewerProfile={viewerProfile}
                sidebarInsetPx={isSidebarAutoOpen ? sidebarWidth : 0}
              />
            </div>
          </div>
        )}
      </main>
    </FlowStateProvider>
  );
}

//
