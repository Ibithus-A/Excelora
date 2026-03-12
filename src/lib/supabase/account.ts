import type { User } from "@supabase/supabase-js";
import { normalizeFirstName, resolveDisplayFirstName } from "@/lib/auth";
import { getUserRole } from "@/lib/supabase/roles";
import type { AuthenticatedAccount, UserRole } from "@/types/auth";

function resolveMetadataName(user: User): string {
  const candidates = [
    user.user_metadata?.full_name,
    user.user_metadata?.name,
    user.user_metadata?.display_name,
    user.user_metadata?.preferred_username,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const firstName = normalizeFirstName(value);
    if (firstName) return firstName;
  }

  return "";
}

function toName(user: User, role: UserRole): string {
  const normalizedMetadataName = resolveMetadataName(user);
  return resolveDisplayFirstName(normalizedMetadataName, user.email ?? "", role);
}

export function accountFromUser(user: User): AuthenticatedAccount {
  const role = getUserRole(user);
  return {
    id: user.id,
    role,
    name: toName(user, role),
    email: user.email ?? "",
  };
}
