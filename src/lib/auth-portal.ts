import { getSiteUrl } from "@/lib/supabase/env";

export type AuthView = "sign-in" | "sign-up" | "forgot-password";

export type InitialPortalState = {
  view: AuthView;
  info: string;
  error: string;
};

const EMAIL_CONFIRMED_QUERY_PARAM = "confirmed";
const PASSWORD_RESET_QUERY_PARAM = "password_reset";
const ERROR_DESCRIPTION_QUERY_PARAM = "error_description";
const CONFIRMED_INFO_MESSAGE = "Email confirmed. Sign in with your email and password.";
const PASSWORD_RESET_INFO_MESSAGE =
  "Check your inbox for a password reset link if that email is registered.";
const PASSWORD_RESET_COMPLETE_MESSAGE =
  "Password updated. Sign in with your new password.";
const DEFAULT_SIGN_UP_ERROR_MESSAGE = "Unable to create your account. Please try again.";
const SIGN_UP_RATE_LIMIT_ERROR_MESSAGE =
  "Supabase is rate-limiting confirmation emails right now. Wait a moment, then try again.";
const IGNORABLE_CONFIRMATION_ERROR = "code challenge does not match previously saved code verifier";

export function isIgnorableConfirmationError(message: string): boolean {
  return message.toLowerCase().includes(IGNORABLE_CONFIRMATION_ERROR);
}

export function getInitialPortalState(): InitialPortalState {
  if (typeof window === "undefined") {
    return {
      view: "sign-in",
      info: "",
      error: "",
    };
  }

  const url = new URL(window.location.href);
  const errorDescription = url.searchParams.get(ERROR_DESCRIPTION_QUERY_PARAM) ?? "";

  if (url.searchParams.get(EMAIL_CONFIRMED_QUERY_PARAM) === "1") {
    return {
      view: "sign-in",
      info: CONFIRMED_INFO_MESSAGE,
      error: "",
    };
  }

  if (url.searchParams.get(PASSWORD_RESET_QUERY_PARAM) === "1") {
    return {
      view: "sign-in",
      info: PASSWORD_RESET_COMPLETE_MESSAGE,
      error: "",
    };
  }

  return {
    view: "sign-in",
    info: "",
    error: isIgnorableConfirmationError(errorDescription) ? "" : errorDescription,
  };
}

export function clearPortalUrlState() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete(EMAIL_CONFIRMED_QUERY_PARAM);
  url.searchParams.delete(PASSWORD_RESET_QUERY_PARAM);
  url.searchParams.delete(ERROR_DESCRIPTION_QUERY_PARAM);
  window.history.replaceState({}, "", url.toString());
}

export function buildAuthCallbackUrl(nextPath: string) {
  const url = new URL("/auth/callback", getSiteUrl());
  url.searchParams.set("next", nextPath);
  return url.toString();
}

export function buildPasswordResetCallbackUrl() {
  const url = new URL("/reset-password", getSiteUrl());
  url.searchParams.set("recovery", "1");
  return url.toString();
}

export function getPasswordResetInfoMessage() {
  return PASSWORD_RESET_INFO_MESSAGE;
}

export function formatSignUpError(message: string) {
  const normalized = message.trim();
  if (!normalized) {
    return DEFAULT_SIGN_UP_ERROR_MESSAGE;
  }

  const lower = normalized.toLowerCase();
  if (lower.includes("redirect") || lower.includes("redirect_to")) {
    return `${normalized} Check that ${getSiteUrl()} is listed in Supabase Auth redirect URLs.`;
  }

  if (lower.includes("email rate limit")) {
    return SIGN_UP_RATE_LIMIT_ERROR_MESSAGE;
  }

  if (lower.includes("smtp") || lower.includes("email provider")) {
    return `${normalized} Check the Supabase Auth email provider settings.`;
  }

  return normalized;
}
