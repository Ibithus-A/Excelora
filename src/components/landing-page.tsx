"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ChevronRightIcon,
  AssistantIcon,
  FolderIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
} from "@/components/icons";
import { WorkspaceLearningDemo } from "@/components/workspace-learning-demo";
import { LearningLoopDemo } from "@/components/learning-loop-demo";

type LandingPageProps = {
  onSignIn: () => void;
  onGetStarted: () => void;
};

type WorkspaceShowcaseItem = {
  sidebarLabel: string;
  videoTitle: string;
  videoLength: string;
  onScreenText: React.ReactNode;
  userQuestion: React.ReactNode;
  assistantReply: React.ReactNode;
};

const WORKSPACE_SHOWCASE_ITEMS: WorkspaceShowcaseItem[] = [
  {
    sidebarLabel: "Algebra",
    videoTitle: "Algebra · Laws of indices",
    videoLength: "05:18",
    onScreenText: (
      <>
        Rewrite each term with a common base, then use{" "}
        <span className="font-serif italic">a^m × a^n = a^{"{m+n}"}</span>.
      </>
    ),
    userQuestion: (
      <>
        Why does <span className="font-serif italic">a^m × a^n</span> become{" "}
        <span className="font-serif italic">a^{"{m+n}"}</span>?
      </>
    ),
    assistantReply: (
      <>
        Because the base stays the same and the powers combine, so{" "}
        <span className="font-serif italic">a^m × a^n = a^{"{m+n}"}</span>.
      </>
    ),
  },
  {
    sidebarLabel: "Functions",
    videoTitle: "Functions · Composite functions",
    videoLength: "06:04",
    onScreenText: (
      <>
        Find the inner function first, then substitute its output into the outer:
        <span className="font-serif italic"> f(g(x))</span>.
      </>
    ),
    userQuestion: (
      <>
        How do I start <span className="font-serif italic">f(g(x))</span> here?
      </>
    ),
    assistantReply: (
      <>
        Begin with <span className="font-serif italic">g(x)</span>, then place that full result
        into <span className="font-serif italic">f</span>.
      </>
    ),
  },
  {
    sidebarLabel: "Differentiation",
    videoTitle: "Differentiation · First principles",
    videoLength: "06:12",
    onScreenText: (
      <>
        Expand <span className="font-serif italic">(x+h)²</span>, cancel the{" "}
        <span className="font-serif italic">x²</span> terms, divide through by{" "}
        <span className="font-serif italic">h</span>.
      </>
    ),
    userQuestion: (
      <>
        Why does the <span className="font-serif italic">x²</span> cancel here?
      </>
    ),
    assistantReply: (
      <>
        Expanding <span className="font-serif italic">(x+h)²</span> gives{" "}
        <span className="font-serif italic">x² + 2xh + h²</span>. Subtracting the original{" "}
        <span className="font-serif italic">x²</span> cancels it out.
      </>
    ),
  },
  {
    sidebarLabel: "Integration",
    videoTitle: "Integration · By substitution",
    videoLength: "07:09",
    onScreenText: (
      <>
        Let <span className="font-serif italic">u = 2x + 1</span> so the integral becomes a
        simpler standard form.
      </>
    ),
    userQuestion: (
      <>
        Why do we let <span className="font-serif italic">u = 2x + 1</span>?
      </>
    ),
    assistantReply: (
      <>
        Because <span className="font-serif italic">2x + 1</span> is the inner expression, so
        substituting <span className="font-serif italic">u</span> makes the integral much cleaner.
      </>
    ),
  },
  {
    sidebarLabel: "Vectors",
    videoTitle: "Vectors · Position vectors",
    videoLength: "04:56",
    onScreenText: (
      <>
        Use position vectors from <span className="font-serif italic">O</span>, then find{" "}
        <span className="font-serif italic">AB = OB - OA</span>.
      </>
    ),
    userQuestion: (
      <>
        How do I get the vector <span className="font-serif italic">AB</span>?
      </>
    ),
    assistantReply: (
      <>
        Take the position vector of <span className="font-serif italic">B</span> and subtract the
        position vector of <span className="font-serif italic">A</span>, so{" "}
        <span className="font-serif italic">AB = OB - OA</span>.
      </>
    ),
  },
];

const FOOTER_SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61593092605844&locale=en_GB",
    icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/_excelora?igsi=MWRnMHR4YzRieXJhdA%3D%3D&utm_source=qr",
    icon: InstagramIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ibrahim-ahmed-394b472b6",
    icon: LinkedInIcon,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@excelora.tutors",
    icon: TikTokIcon,
  },
] as const;

export function LandingPage({ onSignIn, onGetStarted }: LandingPageProps) {
  const copyrightYear = new Date().getFullYear();
  const [isIntroVisible, setIsIntroVisible] = useState(false);
  const [isScrollCueVisible, setIsScrollCueVisible] = useState(true);
  const [revealCycle, setRevealCycle] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsIntroVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const updateScrollCue = () => setIsScrollCueVisible(window.scrollY < 80);

    updateScrollCue();
    window.addEventListener("scroll", updateScrollCue, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollCue);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  };

  const activeWorkspaceShowcase = WORKSPACE_SHOWCASE_ITEMS[0];

  const handleFooterLogoClick = () => {
    if (typeof window === "undefined") return;

    setIsIntroVisible(false);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    const finalizeReset = () => {
      setRevealCycle((current) => current + 1);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setIsIntroVisible(true);
        });
      });
    };

    if (prefersReducedMotion || window.scrollY <= 8) {
      finalizeReset();
      return;
    }

    let attempts = 0;

    const waitForTop = () => {
      attempts += 1;

      if (window.scrollY <= 8 || attempts > 180) {
        finalizeReset();
        return;
      }

      window.requestAnimationFrame(waitForTop);
    };

    window.requestAnimationFrame(waitForTop);
  };

  return (
    <div className="landing-page relative min-h-dvh w-full overflow-hidden bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_at_top,rgba(24,119,242,0.07),transparent_65%)]"
      />

      <header
        className={[
          "landing-intro landing-intro-delay-1 relative z-50 mx-auto w-full px-4 py-4 sm:px-6 sm:py-5",
          isIntroVisible ? "is-visible" : "",
        ].join(" ")}
      >
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 py-1">
          <button type="button" onClick={() => scrollToSection("top")} aria-label="Back to top">
            <Image
              src="/assets/excelora-logo.svg"
              alt="Excelora"
              width={120}
              height={32}
              className="h-8 w-auto select-none sm:h-9"
              draggable={false}
            />
          </button>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-2 text-xs font-semibold text-zinc-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-200 hover:bg-white hover:text-zinc-950 hover:shadow-sm active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
            >
              Sign in
            </button>
            <button type="button" onClick={onGetStarted} className="landing-cta inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 sm:px-5 sm:py-2.5 sm:text-sm">
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Start learning</span>
              <ChevronRightIcon className="landing-cta-icon h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        className={[
          "landing-intro landing-intro-delay-2 relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pt-20",
          isIntroVisible ? "is-visible" : "",
        ].join(" ")}
      >
        <div className="grid min-w-0 items-center gap-12 xl:grid-cols-[minmax(380px,0.76fr)_minmax(0,1.24fr)] xl:gap-9 2xl:grid-cols-[470px_minmax(0,1fr)] 2xl:gap-10">
          <div className="relative z-10 max-w-2xl lg:py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              GCSE & A-Level Maths, all in one place
            </span>
            <h1 className="mt-6 text-[clamp(2.5rem,11vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-zinc-950">
              <span className="block">The maths</span>
              <span className="block">workspace</span>
              <span className="block">built for your</span>
              <span className="relative block w-fit whitespace-nowrap">
                next grade.
                <svg aria-hidden viewBox="0 0 240 14" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full overflow-visible">
                  <path d="M3 9 C 48 2, 104 3, 132 7 C 166 11, 204 8, 237 4" fill="none" stroke="#22c55e" strokeLinecap="round" strokeWidth="4" opacity="0.75" />
                </svg>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
              Learn from structured notes, watch clear walkthroughs, practise exam-style questions and ask Arthur whenever a step does not click.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={onGetStarted} className="landing-cta inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(24,24,27,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_16px_36px_rgba(24,24,27,0.24)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2">
                Start learning free
                <ChevronRightIcon className="landing-cta-icon h-4 w-4" />
              </button>
              <button type="button" onClick={() => scrollToSection("product")} className="group inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2">
                See how it works
                <ChevronRightIcon className="h-4 w-4 rotate-90 transition-transform duration-200 group-hover:translate-y-0.5" />
              </button>
            </div>
            <p className="mt-4 text-xs text-zinc-500">Chapter 1 is free · No card required</p>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
              <span className="inline-flex items-center gap-2"><CheckDotIcon className="h-4 w-4 text-emerald-500" /> Built by UK tutors</span>
              <span className="inline-flex items-center gap-2"><CheckDotIcon className="h-4 w-4 text-emerald-500" /> Aligned to the course</span>
              <span className="inline-flex items-center gap-2"><CheckDotIcon className="h-4 w-4 text-emerald-500" /> Progress that stays visible</span>
            </div>
          </div>

          {/* Workspace preview */}
          <div className="relative min-w-0">
            <div aria-hidden className="absolute -inset-12 -z-10 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_68%)] blur-2xl" />
            <div className="overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_44px_120px_rgba(15,23,42,0.16)] sm:rounded-[28px]">
            <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-[var(--surface-sidebar)] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              <span className="ml-3 truncate text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                excelora · workspace
              </span>
            </div>
            <div className="grid min-w-0 grid-cols-1 md:grid-cols-[170px_minmax(0,1fr)] 2xl:grid-cols-[180px_minmax(0,1fr)_280px]">
              <WorkspaceSidebarMock activeIndex={0} />
              <HeroVideoPane showcaseItem={activeWorkspaceShowcase} />
              <div className="hidden min-w-0 2xl:block">
                <HeroArthurPane showcaseItem={activeWorkspaceShowcase} />
              </div>
            </div>
            </div>
          </div>
        </div>

      </section>

      <button
        type="button"
        onClick={() => scrollToSection("product")}
        className={[
          "fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 transition-[opacity,color,transform] duration-500 hover:text-zinc-950 focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-4 sm:bottom-7",
          isScrollCueVisible
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        ].join(" ")}
        aria-label="Scroll to explore how Excelora works"
        aria-hidden={!isScrollCueVisible}
        tabIndex={isScrollCueVisible ? 0 : -1}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.22em]">
          Explore
        </span>
        <span aria-hidden className="relative h-8 w-[2px] overflow-hidden rounded-full bg-zinc-200/90">
          <span className="landing-scroll-cue absolute inset-x-0 top-0 h-2.5 rounded-full bg-zinc-800" />
        </span>
      </button>

      {/* Immersive product chapter */}
      <section id="product" className="relative z-10 scroll-mt-24 overflow-hidden bg-[#111315] px-4 py-24 text-white sm:px-6 sm:py-32 lg:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_10%_85%,rgba(34,197,94,0.12),transparent_30%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent)]" />
        <div className="relative mx-auto w-full max-w-[1320px]">
        <RevealOnScroll resetKey={revealCycle}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              One connected study loop
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
              Everything you need to understand maths, in one place.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">No bouncing between disconnected tools. Lessons, practice, Arthur and progress all share the same learning context.</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={120} resetKey={revealCycle}>
          <div className="mt-14 sm:mt-20">
            <WorkspaceLearningDemo />
          </div>
        </RevealOnScroll>
        </div>
      </section>

      {/* How it works — three connected steps with workspace surfaces */}
      <section id="how-it-works" className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <RevealOnScroll resetKey={revealCycle}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-zinc-900 sm:text-4xl md:text-5xl">
              Turn every study session into progress.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-600 md:text-base">
              Work through the lesson, ask Arthur, practise the topic and review every answer in one connected flow.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={120} resetKey={revealCycle}>
          <div className="mt-10 sm:mt-14">
            <LearningLoopDemo />
          </div>
        </RevealOnScroll>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <RevealOnScroll resetKey={revealCycle}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              Pricing
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-zinc-900 sm:text-4xl md:text-5xl">
              One workspace. A clearer path to better grades.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-600 md:text-base">
              Experience the learning loop for free. Choose Plus to identify and close gaps automatically, or Premium for the complete guided experience with video walkthroughs.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={120} resetKey={revealCycle}>
          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 items-stretch gap-5 sm:mt-14 lg:grid-cols-3 lg:gap-6">
            <PricingCard
              tone="light"
              name="Basic"
              price="£0"
              cadence="free forever"
              audience="Experience the learning loop"
              tagline="See how Excelora turns a complete chapter into structured learning, focused practice and visible progress."
              perks={BASIC_PERKS}
              ctaLabel="Create free account"
              onCtaClick={onGetStarted}
              footnote="No credit card required."
            />
            <PricingCard
              tone="light"
              name="Plus"
              price="£30"
              cadence="per month"
              audience="Personalised progress, every week"
              tagline="Excelora identifies gaps, brings them back at the right time and builds the next piece of work around your results."
              perks={PLUS_PERKS}
              ctaLabel="Choose Plus"
              onCtaClick={onGetStarted}
              highlight="Most popular"
              footnote="The complete workspace. Cancel at any time."
            />
            <PricingCard
              tone="dark"
              name="Premium"
              price="£50"
              cadence="per month"
              audience="See every method worked through"
              tagline="Everything in Plus, with clear lesson-by-lesson video walkthroughs whenever written explanations are not enough."
              perks={PREMIUM_PERKS}
              ctaLabel="Choose Premium"
              onCtaClick={onGetStarted}
              featured
              highlight="Complete experience"
              footnote="Maximum support and flexibility. Cancel at any time."
            />
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={200} resetKey={revealCycle}>
          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckDotIcon className="h-3.5 w-3.5 text-emerald-500" />
              Cancel anytime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckDotIcon className="h-3.5 w-3.5 text-emerald-500" />
              Built by UK tutors
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckDotIcon className="h-3.5 w-3.5 text-emerald-500" />
              GCSE & A-Level ready
            </span>
          </div>
        </RevealOnScroll>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <RevealOnScroll resetKey={revealCycle}>
          <div className="relative overflow-hidden rounded-[28px] border border-zinc-800 bg-[#111315] px-6 py-14 text-center shadow-[0_35px_100px_rgba(15,23,42,0.18)] sm:rounded-[36px] sm:px-10 sm:py-20 md:px-14">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.28),transparent_48%),radial-gradient(circle_at_100%_100%,rgba(34,197,94,0.14),transparent_35%)]" />
            <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Your next chapter</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl md:text-5xl">
              Better maths starts with one focused lesson.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/60 md:text-base">
              Open Chapter 1 free, work at your own pace and bring Arthur in whenever you need another explanation.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="landing-cta mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_14px_35px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-zinc-100"
            >
              Start learning free
              <ChevronRightIcon className="landing-cta-icon h-3.5 w-3.5" />
            </button>
            <p className="mt-4 text-xs text-white/40">No card required</p>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <RevealOnScroll delay={80} resetKey={revealCycle}>
        <footer className="relative z-10 border-t border-zinc-200 bg-[#fafaf9]">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
              <div className="flex flex-col gap-9">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-xl">
                    <button
                      type="button"
                      aria-label="Scroll to top"
                      onClick={handleFooterLogoClick}
                      className="inline-flex origin-left transition duration-200 ease-out hover:scale-[1.035]"
                    >
                      <Image
                        src="/assets/excelora-logo.svg"
                        alt="Excelora"
                        width={148}
                        height={34}
                        className="h-9 w-auto select-none"
                        draggable={false}
                      />
                    </button>
                    <p className="mt-5 max-w-md text-sm leading-5 text-zinc-500">
                      Premium Maths tuition for GCSE & A-Level learners — structured,
                      exam-focused, and built for measurable progress.
                    </p>
                  </div>
                  <nav aria-label="Social links" className="flex items-center gap-2.5 text-black">
                    {FOOTER_SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-black/92 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-black/[0.035] hover:text-black"
                      >
                        <Icon className="h-[24px] w-[24px]" />
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="h-px w-full bg-zinc-200" />
                <p className="text-sm text-zinc-500">© {copyrightYear} Excelora. All Rights Reserved.</p>
              </div>
          </div>
        </footer>
      </RevealOnScroll>
    </div>
  );
}

function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  resetKey = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  resetKey?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setIsVisible(false);
  }

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [resetKey]);

  return (
    <div
      ref={containerRef}
      className={["scroll-reveal", isVisible ? "is-visible" : "", className].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------- Workspace surface mocks ---------- */

function HeroVideoPane({ showcaseItem }: { showcaseItem: WorkspaceShowcaseItem }) {
  return (
    <div className="border-b border-zinc-200 p-5 sm:p-6 md:border-b-0 md:p-7 xl:border-r">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            Lesson Video
          </p>
          <h3 className="mt-1 text-[17px] font-semibold leading-snug tracking-tight text-zinc-900">
            {showcaseItem.videoTitle}
          </h3>
        </div>
        <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-600">
          {showcaseItem.videoLength}
        </span>
      </div>
      <div className="relative mt-5 overflow-hidden rounded-[16px] border border-zinc-200 bg-zinc-950 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
        <div className="relative aspect-[16/10] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_48%),linear-gradient(135deg,#0f172a,#1f2937_55%,#374151)]">
          <div className="absolute inset-x-4 bottom-14 top-4 overflow-hidden rounded-[12px] border border-white/10 bg-white/10 p-3 backdrop-blur-sm sm:inset-x-5 sm:top-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
              On screen
            </p>
            <p className="mt-1.5 text-[12px] leading-[1.55] text-white/90 sm:text-[13px]">
              {showcaseItem.onScreenText}
            </p>
          </div>
          <div className="absolute inset-x-3 bottom-3 rounded-[12px] border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-sm sm:inset-x-4 sm:bottom-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[9px] text-white/90">▶</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[42%] rounded-full bg-white" />
              </div>
              <span className="text-[10px] text-white/70">
                2:34 / {showcaseItem.videoLength}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white">
          <span className="leading-none">▶</span>
          Watch the video
        </span>
      </div>
    </div>
  );
}

function HeroArthurPane({ showcaseItem }: { showcaseItem: WorkspaceShowcaseItem }) {
  return (
    <div className="flex flex-col bg-[var(--surface-sidebar)]">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white">
            <AssistantIcon className="h-4 w-4 text-zinc-800" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Arthur</p>
            <p className="text-[11px] text-zinc-500">Open beside your lesson</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-700">
          Live
        </span>
      </div>
      <div className="flex-1 space-y-2.5 px-4 py-4">
        <div className="rounded-[12px] border border-zinc-200 bg-white px-3 py-2 text-[12px] leading-5 text-zinc-600 shadow-sm">
          Pause anywhere and ask Arthur about the step on screen.
        </div>
        <div className="ml-auto max-w-[88%] rounded-[12px] bg-zinc-900 px-3 py-2 text-[12px] leading-5 text-white">
          {showcaseItem.userQuestion}
        </div>
        <div className="rounded-[12px] border border-zinc-200 bg-white px-3 py-2 text-[12px] leading-[1.55] text-zinc-700 shadow-sm">
          {showcaseItem.assistantReply}
        </div>
      </div>
      <div className="border-t border-zinc-200 px-4 py-3">
        <div className="rounded-full border border-dashed border-zinc-300 bg-white/70 px-3 py-2 text-[11px] text-zinc-500">
          Ask Arthur…
        </div>
      </div>
    </div>
  );
}

function WorkspaceSidebarMock({ activeIndex }: { activeIndex: number }) {
  const items = ["Algebra", "Functions", "Differentiation", "Integration", "Vectors"];
  return (
    <aside className="hidden border-r border-zinc-200 bg-[var(--surface-sidebar)] p-4 md:block">
      <p className="px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        A Level Maths
      </p>
      <ul className="mt-3 space-y-1 text-sm text-zinc-700">
        {items.map((item, index) => (
          <li
            key={item}
            className={[
              "flex items-center gap-2 truncate rounded-lg px-2 py-1.5 transition",
              index === activeIndex ? "bg-white text-zinc-900 shadow-sm" : "hover:bg-white/60",
            ].join(" ")}
          >
            <FolderIcon className="h-3.5 w-3.5 text-zinc-500" />
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}

const BASIC_PERKS = [
  "Complete Chapter 1 interactive lessons",
  "Exam-style practice and chapter assessment",
  "Saved answers, worked solutions and progress tracking",
  "Review heatmap and mistake flashcards",
  "Automated gap-filling quizzes from your results",
  "Works across phone, tablet and laptop",
];

const PLUS_PERKS = [
  "Everything in Basic",
  "Interactive course access beyond Chapter 1",
  "Arthur AI beside every supported lesson and question",
  "Targeted practice, tutor-set quizzes and timed assessments",
  "Spaced review that retains every learning gap",
  "Adaptive homework generated from real performance",
  "Weekly and monthly learning reports",
  "Tutor visibility across progress, practice and review",
];

const PREMIUM_PERKS = [
  "Everything in Plus",
  "Guided video walkthroughs for supported lessons",
  "Step-by-step explanations aligned to the workspace",
  "Switch seamlessly between lesson, video and Arthur",
  "Rewatch difficult methods whenever you need them",
  "The most complete Excelora learning experience",
];

type PricingCardProps = {
  tone: "light" | "dark";
  name: string;
  price: string;
  cadence: string;
  audience: string;
  tagline: string;
  perks: readonly string[];
  ctaLabel: string;
  onCtaClick: () => void;
  featured?: boolean;
  highlight?: string;
  footnote?: string;
};

function PricingCard({
  tone,
  name,
  price,
  cadence,
  audience,
  tagline,
  perks,
  ctaLabel,
  onCtaClick,
  featured,
  highlight,
  footnote,
}: PricingCardProps) {
  const isDark = tone === "dark";

  return (
    <article
      className={[
        "landing-card relative flex h-full flex-col overflow-hidden rounded-[28px] border p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] sm:p-8",
        isDark
          ? "border-zinc-900 bg-[linear-gradient(155deg,#121214_0%,#18181b_55%,#1f1f23_100%)] text-white shadow-[0_40px_100px_rgba(15,23,42,0.22)]"
          : "border-zinc-200 bg-white text-zinc-900",
        featured ? "landing-card-featured" : "",
      ].join(" ")}
    >
      {isDark ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_65%)]"
        />
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <h3
          className={[
            "text-lg font-semibold tracking-tight",
            isDark ? "text-white" : "text-zinc-900",
          ].join(" ")}
        >
          {name}
        </h3>
        {highlight ? (
          <span
            className={[
              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
              isDark
                ? "border border-white/20 bg-white/10 text-white"
                : "border border-zinc-200 bg-[var(--surface-sidebar)] text-zinc-600",
            ].join(" ")}
          >
            {highlight}
          </span>
        ) : null}
      </div>

      <p className={["mt-4 text-[11px] font-semibold uppercase tracking-[0.15em]", isDark ? "text-emerald-300" : "text-emerald-700"].join(" ")}>
        {audience}
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className={[
            "text-4xl font-semibold leading-none tracking-[-0.03em] sm:text-[44px]",
            isDark ? "text-white" : "text-zinc-900",
          ].join(" ")}
        >
          {price}
        </span>
        <span
          className={[
            "text-sm",
            isDark ? "text-white/60" : "text-zinc-500",
          ].join(" ")}
        >
          {cadence}
        </span>
      </div>

      <p
        className={[
          "mt-3 text-sm leading-6",
          isDark ? "text-white/75" : "text-zinc-600",
        ].join(" ")}
      >
        {tagline}
      </p>

      <div
        className={[
          "my-6 h-px w-full",
          isDark ? "bg-white/10" : "bg-zinc-100",
        ].join(" ")}
      />

      <ul className="flex-1 space-y-3 text-sm">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5">
            <CheckDotIcon
              className={[
                "mt-[2px] h-4 w-4 shrink-0",
                isDark ? "text-emerald-300" : "text-emerald-500",
              ].join(" ")}
            />
            <span className={isDark ? "text-white/90" : "text-zinc-700"}>{perk}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onCtaClick}
        className={[
          "landing-cta",
          "mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-medium transition",
          isDark
            ? "bg-white text-zinc-900 hover:bg-zinc-100"
            : "border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800",
        ].join(" ")}
      >
        {ctaLabel}
        <ChevronRightIcon className="landing-cta-icon h-3.5 w-3.5" />
      </button>

      {footnote ? (
        <p
          className={[
            "mt-3 text-center text-[11px]",
            isDark ? "text-white/50" : "text-zinc-500",
          ].join(" ")}
        >
          {footnote}
        </p>
      ) : null}
    </article>
  );
}

function CheckDotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="m6.5 10.3 2.4 2.4 4.6-4.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
