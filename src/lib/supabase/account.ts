import type { User } from "@supabase/supabase-js";
import { getUserRole } from "@/lib/supabase/roles";
import type { AuthenticatedAccount, UserRole } from "@/types/auth";

function toDisplayName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\s+/)
    .map((segment) => `${segment[0].toUpperCase()}${segment.slice(1).toLowerCase()}`)
    .join(" ");
}

function toFirstName(value: string): string {
  const parts = toDisplayName(value).split(/\s+/).filter(Boolean);
  return parts[0] ?? "";
}

function resolveMetadataName(user: User): string {
  const candidates = [
    user.user_metadata?.full_name,
    user.user_metadata?.name,
    user.user_metadata?.display_name,
    user.user_metadata?.preferred_username,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const firstName = toFirstName(value);
    if (firstName) return firstName;
  }

  return "";
}

function toName(user: User, role: UserRole): string {
  const normalizedMetadataName = resolveMetadataName(user);
  if (normalizedMetadataName) return normalizedMetadataName;

  return role === "tutor" ? "Tutor" : "Student";
}

export function accountFromUser(user: User): AuthenticatedAccount {
  const role = getUserRole(user);
  return {
    role,
    name: toName(user, role),
    email: user.email ?? "",
  };
}
