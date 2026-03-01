import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types/auth";

function normalizeRole(value: unknown): UserRole | null {
  if (value === "tutor" || value === "student") return value;
  return null;
}

// Client-side display role can fall back to user_metadata for compatibility.
export function getUserRole(user: User): UserRole {
  return (
    normalizeRole(user.app_metadata?.role) ??
    normalizeRole(user.user_metadata?.role) ??
    "student"
  );
}

// Server authorization must trust only app_metadata.
export function getServerUserRole(user: User): UserRole {
  return normalizeRole(user.app_metadata?.role) ?? "student";
}
