"use client";

import { CloseIcon, FlowLogoIcon } from "@/components/icons";
import { isValidEmail, normalizeStudentName } from "@/lib/auth";
import { PASSWORD_POLICY_HINT, validatePassword } from "@/lib/security/password";
import { accountFromUser } from "@/lib/supabase/account";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/supabase/env";
import type { AuthenticatedAccount } from "@/types/auth";
import { useEffect, useState } from "react";

type SignInPortalProps = {
  onContinue: (account: AuthenticatedAccount) => void;
  onClose: () => void;
  showCloseButton?: boolean;
};

type AuthView = "sign-in" | "sign-up" | "forgot-password" | "reset-password";

type InitialPortalState = {
  view: AuthView;
  info: string;
  error: string;
  recoveryTokenHash: string | null;
  recoveryAccessToken: string | null;
  recoveryRefreshToken: string | null;
};

function getInitialPortalState(): InitialPortalState {
  if (typeof window === "undefined") {
    return {
      view: "sign-in",
      info: "",
      error: "",
      recoveryTokenHash: null,
      recoveryAccessToken: null,
      recoveryRefreshToken: null,
    };
  }

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const recoveryType = url.searchParams.get("type") ?? hashParams.get("type");
  const recoveryTokenHash = url.searchParams.get("token_hash");
  const recoveryAccessToken = hashParams.get("access_token");
  const recoveryRefreshToken = hashParams.get("refresh_token");
  const errorDescription = url.searchParams.get("error_description") ?? "";

  if (
    recoveryType === "recovery" &&
    (recoveryTokenHash || (recoveryAccessToken && recoveryRefreshToken))
  ) {
    return {
      view: "reset-password",
      info: "Validating your reset link...",
      error: "",
      recoveryTokenHash,
      recoveryAccessToken,
      recoveryRefreshToken,
    };
  }

  if (url.searchParams.get("confirmed") === "1") {
    return {
      view: "sign-in",
      info: "Email confirmed. Sign in with your email and password.",
      error: errorDescription,
      recoveryTokenHash: null,
      recoveryAccessToken: null,
      recoveryRefreshToken: null,
    };
  }

  return {
    view: "sign-in",
    info: "",
    error: errorDescription,
    recoveryTokenHash: null,
    recoveryAccessToken: null,
    recoveryRefreshToken: null,
  };
}

export function SignInPortal({
  onClose,
  onContinue,
  showCloseButton = true,
}: SignInPortalProps) {
  const initialState = getInitialPortalState();
  const [view, setView] = useState<AuthView>(initialState.view);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(initialState.error);
  const [info, setInfo] = useState(initialState.info);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoveryReady, setIsRecoveryReady] = useState(initialState.view !== "reset-password");

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("confirmed") === "1") {
      url.searchParams.delete("confirmed");
    }
    if (url.searchParams.get("error_description")) {
      url.searchParams.delete("error_description");
    }
    window.history.replaceState({}, "", url.toString());
  }, []);

  useEffect(() => {
    if (initialState.view !== "reset-password") return;

    let cancelled = false;
    const supabase = createClient();

    const consumeRecoveryState = async () => {
      setError("");
      setInfo("Validating your reset link...");
      setIsRecoveryReady(false);

      let recoveryError: string | null = null;

      if (initialState.recoveryTokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: initialState.recoveryTokenHash,
          type: "recovery",
        });
        recoveryError = verifyError?.message ?? null;
      } else if (
        initialState.recoveryAccessToken &&
        initialState.recoveryRefreshToken
      ) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: initialState.recoveryAccessToken,
          refresh_token: initialState.recoveryRefreshToken,
        });
        recoveryError = sessionError?.message ?? null;
      } else {
        recoveryError = "This password reset link is invalid or incomplete.";
      }

      if (cancelled) return;

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("token_hash");
      cleanUrl.searchParams.delete("type");
      cleanUrl.searchParams.delete("error_description");
      cleanUrl.hash = "";
      window.history.replaceState({}, "", cleanUrl.toString());

      if (recoveryError) {
        setView("forgot-password");
        setError(recoveryError);
        setInfo("");
        setIsRecoveryReady(true);
        return;
      }

      setView("reset-password");
      setInfo("Choose a new password for your account.");
      setIsRecoveryReady(true);
    };

    void consumeRecoveryState();

    return () => {
      cancelled = true;
    };
    // Intentionally based on the initial callback payload only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildAuthCallbackUrl = (nextPath: string) => {
    const url = new URL("/auth/callback", getSiteUrl());
    url.searchParams.set("next", nextPath);
    return url.toString();
  };

  const formatSignUpError = (message: string) => {
    const normalized = message.trim();
    if (!normalized) {
      return "Unable to create your account. Please try again.";
    }

    const lower = normalized.toLowerCase();
    if (lower.includes("redirect") || lower.includes("redirect_to")) {
      return `${normalized} Check that ${getSiteUrl()} is listed in Supabase Auth redirect URLs.`;
    }

    if (lower.includes("email rate limit")) {
      return "Supabase is rate-limiting confirmation emails right now. Wait a moment, then try again.";
    }

    if (lower.includes("smtp") || lower.includes("email provider")) {
      return `${normalized} Check the Supabase Auth email provider settings.`;
    }

    return normalized;
  };

  const formatResetError = (message: string) => {
    const normalized = message.trim();
    if (!normalized) {
      return "Unable to reset your password. Please try again.";
    }

    const lower = normalized.toLowerCase();
    if (lower.includes("redirect") || lower.includes("redirect_to")) {
      return `${normalized} Check that ${getSiteUrl()} is listed in Supabase Auth redirect URLs.`;
    }

    if (lower.includes("email rate limit")) {
      return "Supabase is rate-limiting reset emails right now. Wait a moment, then try again.";
    }

    return normalized;
  };

  const resetFeedback = () => {
    setError("");
    setInfo("");
  };

  const switchView = (nextView: AuthView) => {
    setView(nextView);
    resetFeedback();
    if (nextView !== "reset-password") {
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = createClient();
    resetFeedback();
    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();
    const needsEmail = view !== "reset-password";

    if (needsEmail && !isValidEmail(normalizedEmail)) {
      setIsSubmitting(false);
      setError("Enter a valid email address.");
      return;
    }

    if (view === "forgot-password") {
      const { error: resetRequestError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: buildAuthCallbackUrl("/"),
        },
      );

      setIsSubmitting(false);

      if (resetRequestError) {
        setError(formatResetError(resetRequestError.message));
        return;
      }

      setInfo(
        `If an account exists for ${normalizedEmail}, a password reset link has been sent.`,
      );
      return;
    }

    if (view === "sign-up") {
      const normalizedName = normalizeStudentName(fullName) || "Student";

      if (password !== confirmPassword) {
        setIsSubmitting(false);
        setError("Passwords do not match.");
        return;
      }

      const passwordErrors = validatePassword(password, {
        email: normalizedEmail,
        displayName: normalizedName,
      });
      if (passwordErrors.length > 0) {
        setIsSubmitting(false);
        setError(passwordErrors[0]);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: buildAuthCallbackUrl("/?confirmed=1"),
          data: {
            full_name: normalizedName,
            role: "student",
          },
        },
      });

      setIsSubmitting(false);

      if (signUpError) {
        setError(formatSignUpError(signUpError.message));
        return;
      }

      if (data.user && data.session) {
        onContinue(accountFromUser(data.user));
        return;
      }

      setInfo(
        `Account created. Check ${normalizedEmail} for a confirmation email. If nothing arrives, verify Supabase email settings and redirect URLs for ${getSiteUrl()}.`,
      );
      setView("sign-in");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    if (view === "reset-password") {
      if (!isRecoveryReady) {
        setIsSubmitting(false);
        setError("Your reset link is still being validated. Please wait.");
        return;
      }

      if (password !== confirmPassword) {
        setIsSubmitting(false);
        setError("Passwords do not match.");
        return;
      }

      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        setIsSubmitting(false);
        setError(passwordErrors[0]);
        return;
      }

      const { data, error: updateError } = await supabase.auth.updateUser({
        password,
      });

      setIsSubmitting(false);

      if (updateError) {
        setError(formatResetError(updateError.message));
        return;
      }

      if (!data.user) {
        setError("Unable to update your password. Please try again.");
        return;
      }

      onContinue(accountFromUser(data.user));
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
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

    onContinue(accountFromUser(data.user));
  };

  return (
    <section className="absolute inset-0 z-50 overflow-y-auto bg-black/30 p-3 backdrop-blur-[1px] md:flex md:items-center md:justify-center md:p-4">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_20px_50px_rgba(9,9,11,0.08)] transition-all duration-200 md:my-0 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white">
              <FlowLogoIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-900">Excelora Portal</p>
              <p className="text-xs text-zinc-500">
                Create your account or sign in
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
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

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
            <button
              type="button"
              onClick={() => switchView("sign-in")}
              className={[
                "rounded-md px-3 py-2 text-sm transition",
                view === "sign-in" || view === "forgot-password" || view === "reset-password"
                  ? "bg-white font-medium text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700",
              ].join(" ")}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchView("sign-up")}
              className={[
                "rounded-md px-3 py-2 text-sm transition",
                view === "sign-up"
                  ? "bg-white font-medium text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700",
              ].join(" ")}
            >
              Create Account
            </button>
          </div>

          {view === "sign-up" ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                First Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  resetFeedback();
                }}
                placeholder="Alex"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
                autoComplete="given-name"
                required
              />
            </div>
          ) : null}

          {view !== "reset-password" ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  resetFeedback();
                }}
                placeholder="you@example.com"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
                autoComplete="email"
                required
              />
              <p className="mt-1 text-xs text-zinc-500">
                {view === "sign-up"
                  ? "You will need to confirm your email before signing in."
                  : view === "forgot-password"
                    ? "We will send a secure reset link to this email."
                    : "Use the email address on your Excelora account."}
              </p>
            </div>
          ) : (
            <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
              Enter your new password below to finish resetting your account.
            </p>
          )}

          {view !== "forgot-password" ? (
            <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              {view === "sign-up" || view === "reset-password"
                ? "Create Password"
                : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                resetFeedback();
              }}
              placeholder="••••••••"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
              autoComplete={
                view === "sign-up" || view === "reset-password"
                  ? "new-password"
                  : "current-password"
              }
              required
              disabled={view === "reset-password" && !isRecoveryReady}
            />
            </div>
          ) : null}

          {view === "sign-up" || view === "reset-password" ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  resetFeedback();
                }}
                placeholder="••••••••"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
                autoComplete="new-password"
                required
                disabled={view === "reset-password" && !isRecoveryReady}
              />
              <p className="mt-1 text-xs text-zinc-500">{PASSWORD_POLICY_HINT}</p>
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

          {view === "sign-in" ? (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => switchView("forgot-password")}
                className="text-xs text-zinc-600 underline-offset-2 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          ) : null}

          {view !== "sign-in" ? (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => switchView("sign-in")}
                className="text-xs text-zinc-600 underline-offset-2 hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            {isSubmitting
              ? "Please wait..."
              : view === "sign-up"
                ? "Create Account"
                : view === "forgot-password"
                  ? "Send Reset Link"
                  : view === "reset-password"
                    ? "Update Password"
                    : "Sign In"}
          </button>
        </form>
      </div>
    </section>
  );
}
