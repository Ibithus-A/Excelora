"use client";

import { DashboardHome } from "@/components/dashboard-home";
import { EditorPane } from "@/components/editor-pane";
import { SignInPortal } from "@/components/sign-in-portal";
import { Sidebar } from "@/components/sidebar";
import { FlowStateProvider } from "@/context/flowstate-context";
import { useStudentProgress } from "@/lib/hooks/use-student-progress";
import { useSidebarResize } from "@/lib/hooks/use-sidebar-resize";
import { useTheme } from "@/lib/hooks/use-theme";
import type { AuthenticatedAccount } from "@/types/auth";
import { useState } from "react";

type AppView = "workspace" | "dashboard";

export default function HomePage() {
  const [view, setView] = useState<AppView>("workspace");
  const [isSidebarAutoOpen, setIsSidebarAutoOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthenticatedAccount | null>(null);
  const {
    selectedStudentEmail,
    selectedStudent,
    activeStudentUnlocks,
    currentStudentStats,
    selectedStudentMilestone,
    chapterTagsByTitle,
    selectStudent,
    toggleChapterForSelectedStudent,
    setMilestoneForSelectedStudent,
    chapterTitles,
    students,
  } = useStudentProgress(currentUser);
  const { sidebarWidth, startResize } = useSidebarResize();
  const { isDarkMode, setIsDarkMode } = useTheme();

  const handleContinueFromSignIn = (account: AuthenticatedAccount) => {
    setCurrentUser(account);
    setView("dashboard");
  };

  const handleSignOut = () => {
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
      <main
        className={`h-screen w-screen bg-[var(--surface-app)] ${isDarkMode ? "theme-dark" : ""}`}
      >
        {!currentUser ? (
          <div className="relative h-full w-full overflow-hidden bg-[var(--surface-panel)]">
            <SignInPortal
              onClose={() => {}}
              onContinue={handleContinueFromSignIn}
              showCloseButton={false}
            />
          </div>
        ) : view === "dashboard" ? (
          <DashboardHome
            name={currentUser.name}
            role={currentUser.role}
            stats={currentStudentStats}
            activeStudentName={selectedStudent?.name}
            onOpenWorkspace={handleOpenWorkspaceFromDashboard}
            onSignOut={handleSignOut}
            onSwitchAccount={handleSignOut}
            chapterTitles={chapterTitles}
            students={students}
            selectedStudentEmail={selectedStudentEmail}
            selectedStudentMilestone={selectedStudentMilestone}
            chapterTagsByTitle={chapterTagsByTitle}
            unlockedChapterTitles={activeStudentUnlocks}
            onSelectStudent={selectStudent}
            onSetMilestoneChapter={setMilestoneForSelectedStudent}
            onToggleChapter={toggleChapterForSelectedStudent}
          />
        ) : (
          <div className="relative h-full w-full overflow-hidden bg-[var(--surface-panel)]">
            <div className="group/sidebar absolute inset-y-0 left-0 z-30 w-2">
              <aside
                id="flowstate-sidebar"
                className={[
                  "absolute inset-y-0 left-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/sidebar:translate-x-0",
                  isSidebarAutoOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
                style={{ width: `${sidebarWidth}px` }}
                onMouseLeave={() => {
                  if (!isSidebarAutoOpen) return;
                  setIsSidebarAutoOpen(false);
                }}
              >
                <Sidebar
                  onOpenDashboard={handleOpenDashboardFromSidebar}
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={() => setIsDarkMode((value) => !value)}
                  role={currentUser.role}
                  unlockedChapterTitles={activeStudentUnlocks}
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
              <EditorPane role={currentUser.role} />
            </div>
          </div>
        )}
      </main>
    </FlowStateProvider>
  );
}
