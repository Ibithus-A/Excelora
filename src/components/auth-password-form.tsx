"use client";

import { createClient } from "@/lib/supabase/client";
import { PASSWORD_POLICY_HINT, validatePassword } from "@/lib/security/password";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthPasswordFormProps = {
  title: string;
  description: string;
  successMessage: string;
  redirectPath?: string;
  signOutAfterSuccess?: boolean;
};

export function AuthPasswordForm({
  title,
  description,
  successMessage,
  redirectPath = "/",
  signOutAfterSuccess = false,
}: AuthPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const initializeRecoverySession = async () => {
      const supabase = createClient();

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        const errorDescription = url.searchParams.get("error_description");
        const errorCode = url.searchParams.get("error_code");
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const hashAccessToken = hashParams.get("access_token");
        const hashRefreshToken = hashParams.get("refresh_token");
        const hashType = hashParams.get("type");
        const hashErrorDescription = hashParams.get("error_description");
        const hashErrorCode = hashParams.get("error_code");

        const resolvedErrorDescription = errorDescription ?? hashErrorDescription;
        const resolvedErrorCode = errorCode ?? hashErrorCode;

        if (resolvedErrorDescription) {
          setError(decodeURIComponent(resolvedErrorDescription));
          return;
        }

        if (resolvedErrorCode === "otp_expired") {
          setError("This reset link has expired. Request a new password reset email.");
          return;
        }

        if (tokenHash && type === "recovery") {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (verifyError) {
            setError(verifyError.message);
            return;
          }

          url.searchParams.delete("token_hash");
          url.searchParams.delete("type");
          window.history.replaceState({}, "", url.toString());
        } else if (
          hashAccessToken &&
          hashRefreshToken &&
          hashType === "recovery"
        ) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken,
          });

          if (setSessionError) {
            setError(setSessionError.message);
            return;
          }

          window.history.replaceState({}, "", url.toString());
        } else if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            setError(exchangeError.message);
            return;
          }

          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.toString());
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("This reset link is invalid or expired. Request a new password reset email.");
          return;
        }

        if (!cancelled) {
          setIsSessionReady(true);
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    void initializeRecoverySession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!isSessionReady) {
      setError("This reset link is invalid or expired. Request a new password reset email.");
      return;
    }

    const trimmed = password.trim();

    if (trimmed !== confirmPassword.trim()) {
      setError("Passwords do not match.");
      return;
    }

    const passwordErrors = validatePassword(trimmed);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: trimmed,
    });

    if (updateError) {
      setIsSubmitting(false);
      setError(updateError.message);
      return;
    }

    if (signOutAfterSuccess) {
      await supabase.auth.signOut({ scope: "local" });
    }

    setIsSubmitting(false);
    setInfo(successMessage);
    window.setTimeout(() => {
      router.push(redirectPath);
    }, 900);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-app)] p-4">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
        <p className="mt-1 text-sm text-zinc-600">{description}</p>
        <p className="mt-1 text-xs text-zinc-500">{PASSWORD_POLICY_HINT}</p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
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
              }}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
              autoComplete="new-password"
              required
            />
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
            disabled={isSubmitting || isInitializing || !isSessionReady}
            className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isInitializing ? "Preparing..." : isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </main>
  );
}
