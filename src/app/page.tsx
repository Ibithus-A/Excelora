"use client";

import { DashboardHome } from "@/components/dashboard-home";
import { EditorPane } from "@/components/editor-pane";
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
      <main className="h-screen w-screen bg-[var(--surface-app)]">
        {!effectiveCurrentUser ? (
          <div className="relative h-full w-full overflow-hidden bg-[var(--surface-panel)]">
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
          <div className="relative h-full w-full overflow-hidden bg-[var(--surface-panel)]">
            <div className="absolute inset-y-0 left-0 z-30">
              <div
                className="absolute inset-y-0 left-0 w-4"
                onMouseEnter={() => setIsSidebarAutoOpen(true)}
                aria-hidden
              />
              <aside
                id="flowstate-sidebar"
                className={[
                  "absolute inset-y-0 left-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isSidebarAutoOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
                style={{ width: `${sidebarWidth}px` }}
                onMouseEnter={() => setIsSidebarAutoOpen(true)}
                onMouseLeave={() => {
                  if (isResizing) return;
                  if (!isSidebarAutoOpen) return;
                  setIsSidebarAutoOpen(false);
                }}
              >
                <Sidebar
                  onOpenDashboard={handleOpenDashboardFromSidebar}
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

            <div className="h-full">
              <EditorPane
                role={effectiveCurrentUser.role}
                viewerProfile={viewerProfile}
              />
            </div>
          </div>
        )}
      </main>
    </FlowStateProvider>
  );
}

//
