"use client";

import { DashboardHome } from "@/components/dashboard-home";
import { EditorPane } from "@/components/editor-pane";
import { MenuIcon } from "@/components/icons";
import { LandingPage } from "@/components/landing-page";
import { SignInPortal } from "@/components/sign-in-portal";
import { Sidebar } from "@/components/sidebar";
import { TutorialShowcase, type TutorialSurface } from "@/components/tutorial-showcase";
import { FlowStateProvider } from "@/context/flowstate-context";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useAssessmentAccess } from "@/lib/hooks/use-assessment-access";
import { useStudentProgress } from "@/lib/hooks/use-student-progress";
import { useStudents } from "@/lib/hooks/use-students";
import { useSidebarResize } from "@/lib/hooks/use-sidebar-resize";
import { useTopicProgress } from "@/lib/hooks/use-topic-progress";
import type { AuthenticatedAccount } from "@/types/auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AppView = "workspace" | "dashboard";
const PORTAL_CONTAINER_CLASS = "relative min-h-dvh w-full overflow-hidden bg-[var(--surface-panel)]";

export default function HomePage() {
  const [view, setView] = useState<AppView>("dashboard");
  const [isSidebarAutoOpen, setIsSidebarAutoOpen] = useState(false);
  const [signInView, setSignInView] = useState<"sign-in" | "sign-up" | null>(null);
  const [isPublicViewTransitioning, setIsPublicViewTransitioning] = useState(false);
  const publicViewTransitionTimerRef = useRef<number | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialSurface, setTutorialSurface] = useState<TutorialSurface>("dashboard");
  const { currentUser, setAuthenticatedUser, signOut } = useAuthSession();
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
    activeStudentMilestone,
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
  const progressStudentId =
    effectiveCurrentUser?.role === "student"
      ? effectiveCurrentUser.id
      : selectedStudentId || null;
  const topicProgress = useTopicProgress({
    currentUser: effectiveCurrentUser,
    targetStudentId: progressStudentId,
  });
  const workspaceTopicProgress =
    effectiveCurrentUser?.role === "student" ? topicProgress : undefined;
  const assessmentProgressVersion = topicProgress.rows
    .map((row) => `${row.topic_id}:${row.status}:${row.watched_video}:${row.updated_at}`)
    .join("|");
  const assessmentAccess = useAssessmentAccess(
    effectiveCurrentUser?.role === "tutor"
      ? selectedStudentId || null
      : effectiveCurrentUser?.id ?? null,
    assessmentProgressVersion,
  );

  const transitionToPublicView = useCallback((nextView: "sign-in" | "sign-up" | null) => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (publicViewTransitionTimerRef.current !== null) {
      window.clearTimeout(publicViewTransitionTimerRef.current);
    }

    if (prefersReducedMotion) {
      setSignInView(nextView);
      window.scrollTo({ top: 0 });
      return;
    }

    setIsPublicViewTransitioning(true);
    publicViewTransitionTimerRef.current = window.setTimeout(() => {
      setSignInView(nextView);
      window.scrollTo({ top: 0 });
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setIsPublicViewTransitioning(false));
      });
    }, 200);
  }, []);

  useEffect(() => () => {
    if (publicViewTransitionTimerRef.current !== null) {
      window.clearTimeout(publicViewTransitionTimerRef.current);
    }
  }, []);

  const handleContinueFromSignIn = (account: AuthenticatedAccount) => {
    setAuthenticatedUser(account);
    setSignInView(null);
    setView("dashboard");
  };

  const handleSignOut = async () => {
    await signOut();
    setView("dashboard");
  };

  const handleOpenDashboardFromSidebar = () => {
    setIsSidebarAutoOpen(false);
    setView("dashboard");
    void assessmentAccess.refresh();
  };

  const handleOpenWorkspaceFromDashboard = () => {
    setIsSidebarAutoOpen(true);
    setView("workspace");
  };

  const handleStartTutorial = useCallback(() => {
    setTutorialSurface("dashboard");
    setIsTutorialOpen(true);
    setIsSidebarAutoOpen(false);
    setView("dashboard");
  }, []);

  const handleCloseTutorial = useCallback(() => {
    setIsTutorialOpen(false);
    setTutorialSurface("dashboard");
  }, []);

  const handleTutorialSurfaceChange = useCallback((surface: TutorialSurface) => {
    setTutorialSurface(surface);
    if (
      surface === "dashboard" ||
      surface === "learning-profile" ||
      surface === "review" ||
      surface === "homework" ||
      surface === "assessment" ||
      surface === "reports" ||
      surface === "tutor-student" ||
      surface === "tutor-activity" ||
      surface === "tutor-assessment"
    ) {
      setView("dashboard");
      setIsSidebarAutoOpen(false);
      return;
    }

    setView("workspace");
    setIsSidebarAutoOpen(true);
  }, []);

  return (
    <FlowStateProvider>
      <main className="min-h-dvh w-full bg-[var(--surface-app)]">
        {!effectiveCurrentUser ? (
          signInView ? (
            <div className={`${PORTAL_CONTAINER_CLASS} public-view-transition ${isPublicViewTransitioning ? "is-switching" : ""}`}>
              <SignInPortal
                onClose={() => transitionToPublicView(null)}
                onContinue={handleContinueFromSignIn}
                showCloseButton
                initialView={signInView}
              />
            </div>
          ) : (
            <div className={`public-view-transition min-h-dvh ${isPublicViewTransitioning ? "is-switching" : ""}`}>
              <LandingPage
                onSignIn={() => transitionToPublicView("sign-in")}
                onGetStarted={() => transitionToPublicView("sign-up")}
              />
            </div>
          )
        ) : view === "dashboard" ? (
          <DashboardHome
            name={effectiveCurrentUser.name}
            role={effectiveCurrentUser?.role ?? "student"}
            onOpenWorkspace={handleOpenWorkspaceFromDashboard}
            onStartTutorial={handleStartTutorial}
            onSignOut={handleSignOut}
            onSwitchAccount={handleSignOut}
            currentPlan={viewerProfile?.plan ?? "basic"}
            chapterTitles={chapterTitles}
            students={students}
            selectedStudent={selectedStudent}
            selectedStudentId={selectedStudentId}
            selectedStudentPlan={selectedStudentPlan}
            activeStudentMilestone={activeStudentMilestone}
            selectedStudentMilestone={selectedStudentMilestone}
            chapterTagsByTitle={chapterTagsByTitle}
            accessibleChapterTitles={activeStudentUnlocks}
            onSelectStudent={selectStudent}
            onSetStudentPlan={setPlanForSelectedStudent}
            onSetMilestoneChapter={setMilestoneForSelectedStudent}
            onToggleChapter={toggleChapterForSelectedStudent}
            isChapterOneAssessmentUnlocked={assessmentAccess.isUnlocked}
            assessmentRequiresPremium={assessmentAccess.requiresPremium}
            isAssessmentAccessLoading={assessmentAccess.isLoading}
            assessmentAccessError={assessmentAccess.error}
            chapterOneAssessmentAttempt={assessmentAccess.attempt}
            chapterOneAssessmentPrerequisite={assessmentAccess.prerequisite}
            onToggleChapterOneAssessment={assessmentAccess.toggle}
            onAssessmentAttemptCleared={() => void assessmentAccess.refresh()}
            onDeleteStudent={deleteSelectedStudent}
            topicProgress={topicProgress}
            tutorialSurface={isTutorialOpen ? tutorialSurface : null}
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
                  "absolute inset-y-0 left-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
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
                  topicProgress={workspaceTopicProgress}
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

            <div
              className={["h-dvh", isSidebarAutoOpen ? "hidden md:block" : ""].join(" ")}
              onClick={() => {
                if (!isSidebarAutoOpen) return;
                setIsSidebarAutoOpen(false);
              }}
            >
              <EditorPane
                role={effectiveCurrentUser.role}
                viewerProfile={viewerProfile}
                sidebarInsetPx={isSidebarAutoOpen ? sidebarWidth : 0}
                tutorialSurface={isTutorialOpen ? tutorialSurface : null}
                topicProgress={workspaceTopicProgress}
              />
            </div>
          </div>
        )}
        {isTutorialOpen ? (
          <TutorialShowcase
            isOpen={isTutorialOpen}
            role={effectiveCurrentUser?.role ?? "student"}
            onClose={handleCloseTutorial}
            onSurfaceChange={handleTutorialSurfaceChange}
          />
        ) : null}
      </main>
    </FlowStateProvider>
  );
}
