"use client";

import { DashboardHome } from "@/components/dashboard-home";
import { EditorPane } from "@/components/editor-pane";
import { SignInPortal } from "@/components/sign-in-portal";
import { Sidebar } from "@/components/sidebar";
import { FlowStateProvider } from "@/context/flowstate-context";
import { CHAPTER_ONE_TITLE, getLockedChapterMessage } from "@/lib/access";
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
  const { viewerProfile, students, updateStudentAccess } = useStudents(currentUser?.email);
  const effectiveCurrentUser = useMemo(
    () => (currentUser ? viewerProfile ?? currentUser : null),
    [currentUser, viewerProfile],
  );
  const {
    selectedStudentId,
    selectedStudent,
    selectedStudentPlan,
    activeStudentUnlocks,
    currentStudentStats,
    selectedStudentMilestone,
    chapterTagsByTitle,
    selectStudent,
    toggleChapterForSelectedStudent,
    setMilestoneForSelectedStudent,
    setPlanForSelectedStudent,
    chapterTitles,
  } = useStudentProgress(currentUser, viewerProfile, students, updateStudentAccess);
  const { sidebarWidth, startResize, isResizing } = useSidebarResize();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;

    const url = new URL(window.location.href);
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);

    const searchType = url.searchParams.get("type");
    const hashType = hashParams.get("type");
    const errorCode = url.searchParams.get("error_code") ?? hashParams.get("error_code");
    const hasCode = url.searchParams.has("code");
    const hasTokenHash = url.searchParams.has("token_hash");
    const hasRecoverySession =
      (hashParams.has("access_token") && hashParams.has("refresh_token")) ||
      Boolean(hashParams.get("token_hash"));

    const isRecoveryFlow =
      searchType === "recovery" ||
      hashType === "recovery" ||
      hasCode ||
      hasTokenHash ||
      hasRecoverySession ||
      errorCode === "otp_expired";

    if (!isRecoveryFlow) return;

    const destination = new URL("/reset-password", window.location.origin);
    destination.search = url.search;
    destination.hash = window.location.hash;
    window.location.replace(destination.toString());
  }, []);

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
            unlockedChapterTitles={activeStudentUnlocks}
            onSelectStudent={selectStudent}
            onSetStudentPlan={setPlanForSelectedStudent}
            onSetMilestoneChapter={setMilestoneForSelectedStudent}
            onToggleChapter={toggleChapterForSelectedStudent}
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
                  unlockedChapterTitles={viewerProfile?.unlockedChapterTitles ?? [CHAPTER_ONE_TITLE]}
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
                unlockedChapterTitles={viewerProfile?.unlockedChapterTitles ?? [CHAPTER_ONE_TITLE]}
                lockedChapterMessage={getLockedChapterMessage(viewerProfile)}
              />
            </div>
          </div>
        )}
      </main>
    </FlowStateProvider>
  );
}

//
