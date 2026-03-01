"use client";

import { createClient } from "@/lib/supabase/client";
import { PASSWORD_POLICY_HINT, validatePassword } from "@/lib/security/password";
import { getUserRole } from "@/lib/supabase/roles";
import type { UserRole } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthPasswordFormProps = {
  title: string;
  description: string;
  successMessage: string;
  redirectPath?: string;
  expectedRole?: UserRole;
  clearExistingSessionFirst?: boolean;
};

export function AuthPasswordForm({
  title,
  description,
  successMessage,
  redirectPath = "/",
  expectedRole,
  clearExistingSessionFirst = false,
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

    const initializeSession = async () => {
      const supabase = createClient();
      try {
        if (clearExistingSessionFirst) {
          await supabase.auth.signOut({ scope: "local" });
        }

        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            if (!cancelled) {
              setError("This setup link is invalid or expired. Request a new email.");
            }
            return;
          }
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.toString());
        } else {
          const hash = window.location.hash.startsWith("#")
            ? window.location.hash.slice(1)
            : window.location.hash;
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          const flowType = hashParams.get("type");
          if (
            accessToken &&
            refreshToken &&
            (flowType === "invite" || flowType === "recovery")
          ) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setSessionError) {
              if (!cancelled) {
                setError("This setup link is invalid or expired. Request a new email.");
              }
              return;
            }
            window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
          }
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (!cancelled) {
            setError("This setup link is invalid or expired. Request a new email.");
          }
          return;
        }

        if (expectedRole && getUserRole(user) !== expectedRole) {
          if (!cancelled) {
            setError("This link is for a different account type. Use your student invite email.");
          }
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

    void initializeSession();
    return () => {
      cancelled = true;
    };
  }, [clearExistingSessionFirst, expectedRole]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");
    if (!isSessionReady) {
      setError("This setup link is invalid or expired. Request a new email.");
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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setIsSubmitting(false);
      setError("Your session has expired. Request a new email and try again.");
      return;
    }
    if (expectedRole && getUserRole(user) !== expectedRole) {
      setIsSubmitting(false);
      setError("This link is for a different account type.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: trimmed,
    });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

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
            className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            {isInitializing ? "Preparing..." : isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </main>
  );
}
