"use client";

import { CloseIcon, FlowLogoIcon } from "@/components/icons";
import { MoonIcon, SunIcon } from "@/components/icons";
import { accountFromUser } from "@/lib/supabase/account";
import { createClient } from "@/lib/supabase/client";
import type { AuthenticatedAccount } from "@/types/auth";
import { useState } from "react";

type SignInPortalProps = {
  onContinue: (account: AuthenticatedAccount) => void;
  onClose: () => void;
  showCloseButton?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
};

type SignInRole = "student" | "tutor";
type AuthView = "sign-in" | "forgot-password";

export function SignInPortal({
  onClose,
  onContinue,
  showCloseButton = true,
  isDarkMode = false,
  onToggleDarkMode,
}: SignInPortalProps) {
  const [view, setView] = useState<AuthView>("sign-in");
  const [role, setRole] = useState<SignInRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = createClient();
    setError("");
    setInfo("");
    setIsSubmitting(true);

    if (view === "forgot-password") {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      setIsSubmitting(false);

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setInfo("Password reset email sent. Check your inbox.");
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    if (!data.user) {
      setError("Unable to sign in. Please try again.");
      return;
    }

    const account = accountFromUser(data.user);
    if (account.role !== role) {
      setError(`This account is not a ${role}. Choose the correct sign-in option.`);
      await supabase.auth.signOut();
      return;
    }

    onContinue(account);
  };

  return (
    <section className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 p-3 backdrop-blur-[1px] md:p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_20px_50px_rgba(9,9,11,0.08)] transition-all duration-200 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white">
              <FlowLogoIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-900">QuickLearn Portal</p>
              <p className="text-xs text-zinc-500">Tutor-managed secure sign in</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onToggleDarkMode ? (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
              </button>
            ) : null}
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                aria-label="Close sign in portal"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <form
          className="space-y-3"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
            <button
              type="button"
              onClick={() => {
                setView("sign-in");
                setRole("student");
                setError("");
                setInfo("");
              }}
              className={[
                "rounded-md px-3 py-2 text-sm transition",
                role === "student"
                  ? "bg-white font-medium text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700",
              ].join(" ")}
            >
              Student Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setView("sign-in");
                setRole("tutor");
                setError("");
                setInfo("");
              }}
              className={[
                "rounded-md px-3 py-2 text-sm transition",
                role === "tutor"
                  ? "bg-white font-medium text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700",
              ].join(" ")}
            >
              Tutor Sign In
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setInfo("");
              }}
              placeholder="you@example.com"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
              autoComplete="email"
              required
            />
            <p className="mt-1 text-xs text-zinc-500">
              {view === "forgot-password"
                ? "Enter your account email to receive reset instructions."
                : role === "tutor"
                ? "Use your tutor account email."
                : "Use the student credentials created by your tutor."}
            </p>
          </div>

          {view === "sign-in" ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                  setInfo("");
                }}
                placeholder="••••••••"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
                autoComplete="current-password"
                required
              />
            </div>
          ) : null}

          {error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {info}
            </p>
          ) : null}

          <div className="flex items-center justify-between">
            {view === "sign-in" ? (
              <button
                type="button"
                onClick={() => {
                  setView("forgot-password");
                  setError("");
                  setInfo("");
                }}
                className="text-xs text-zinc-600 underline-offset-2 hover:underline"
              >
                Forgot password?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setView("sign-in");
                  setError("");
                  setInfo("");
                }}
                className="text-xs text-zinc-600 underline-offset-2 hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            {isSubmitting
              ? "Please wait..."
              : view === "forgot-password"
                ? "Send Reset Email"
                : "Continue to Workspace"}
          </button>
        </form>
      </div>
    </section>
  );
}
