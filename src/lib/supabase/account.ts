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

function toName(user: User, role: UserRole): string {
  const metadataName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const normalizedMetadataName = toFirstName(metadataName);
  if (normalizedMetadataName) return normalizedMetadataName;

  const emailPrefix = user.email?.split("@")[0] ?? "";
  const normalizedEmailPrefix = toFirstName(emailPrefix.replace(/[._-]+/g, " "));
  if (normalizedEmailPrefix) return normalizedEmailPrefix;

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
