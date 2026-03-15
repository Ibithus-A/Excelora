"use client";

import {
  clearPortalUrlState,
  getPasswordResetInfoMessage,
} from "@/lib/auth-portal";
import { PASSWORD_POLICY_HINT, validatePassword } from "@/lib/security/password";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type RecoveryStatus = "verifying" | "ready" | "invalid";

function getRecoveryContext() {
  if (typeof window === "undefined") {
    return {
      searchParams: new URLSearchParams(),
      hashParams: new URLSearchParams(),
    };
  }

  const url = new URL(window.location.href);
  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;

  return {
    searchParams: url.searchParams,
    hashParams: new URLSearchParams(hash),
  };
}

function getRecoveryErrorMessage(searchParams: URLSearchParams, hashParams: URLSearchParams) {
  return (
    searchParams.get("error_description") ??
    hashParams.get("error_description") ??
    ""
  ).trim();
}

function cleanRecoveryUrl() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const recovery = url.searchParams.get("recovery");
  url.search = "";
  if (recovery === "1") {
    url.searchParams.set("recovery", "1");
  }
  url.hash = "";
  window.history.replaceState({}, "", url.toString());
}

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<RecoveryStatus>("verifying");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    const prepareRecoverySession = async () => {
      const { searchParams, hashParams } = getRecoveryContext();
      const recoveryError = getRecoveryErrorMessage(searchParams, hashParams);
      if (recoveryError) {
        if (!isMounted) return;
        setError(recoveryError);
        setStatus("invalid");
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const recoveryType = searchParams.get("type") ?? hashParams.get("type");
      const recoveryFlag = searchParams.get("recovery") === "1";

      try {
        if (tokenHash && recoveryType === "recovery") {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (verifyError) {
            throw verifyError;
          }
        } else if (accessToken && refreshToken && recoveryType === "recovery") {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }
        } else if (!recoveryFlag) {
          throw new Error("This password reset link is invalid or has expired.");
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error("This password reset link is invalid or has expired.");
        }

        cleanRecoveryUrl();
        clearPortalUrlState();

        if (!isMounted) return;
        setStatus("ready");
        setInfo("Choose a new password for your account.");
      } catch (recoveryFailure) {
        if (!isMounted) return;
        setStatus("invalid");
        setError(
          recoveryFailure instanceof Error && recoveryFailure.message.trim()
            ? recoveryFailure.message
            : "This password reset link is invalid or has expired.",
        );
      }
    };

    void prepareRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const passwordErrors = validatePassword(password, {
      email: user?.email ?? "",
      displayName: typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "",
    });

    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setInfo("Password updated. You can continue into your account now.");
  };

  return (
    <main className="min-h-dvh bg-[var(--surface-app)] px-3 py-6 md:px-4 md:py-10">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_20px_50px_rgba(9,9,11,0.08)] md:p-6">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Excelora Portal</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Set a new password</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {status === "invalid"
              ? getPasswordResetInfoMessage()
              : "Use a strong password you have not used before."}
          </p>
        </div>

        {status === "verifying" ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
            Verifying your reset link...
          </div>
        ) : status === "invalid" ? (
          <div className="space-y-3">
            {error ? (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </p>
            ) : null}
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                New Password
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
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                  setInfo("");
                }}
                placeholder="••••••••"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
                autoComplete="new-password"
                required
              />
              <p className="mt-1 text-xs text-zinc-500">{PASSWORD_POLICY_HINT}</p>
            </div>

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

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              {isSubmitting ? "Updating password..." : "Update Password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
