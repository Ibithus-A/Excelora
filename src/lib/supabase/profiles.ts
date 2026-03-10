import { normalizeEmail, normalizeFirstName } from "@/lib/auth";
import {
  CHAPTER_ONE_TITLE,
  normalizeUserPlan,
  sanitizeUnlockedChapterTitles,
} from "@/lib/access";
import type { UserAccessProfile, UserRole } from "@/types/auth";
import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole | null;
  plan: string | null;
  unlocked_chapters: string[] | null;
};

export const PROFILE_SELECT =
  "id, email, full_name, role, plan, unlocked_chapters";

function normalizeRole(value: unknown): UserRole {
  return value === "tutor" ? "tutor" : "student";
}

export function profileFromRow(row: ProfileRow): UserAccessProfile {
  const role = normalizeRole(row.role);
  const email = normalizeEmail(row.email ?? "");
  const name =
    normalizeFirstName(row.full_name ?? "") ||
    normalizeFirstName(email) ||
    (role === "tutor" ? "Tutor" : "Student");
  const plan = normalizeUserPlan(row.plan) ?? "basic";

  return {
    id: row.id,
    email,
    name,
    role,
    plan,
    unlockedChapterTitles: sanitizeUnlockedChapterTitles(row.unlocked_chapters ?? [], plan),
  };
}

export async function getViewerProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserAccessProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (error) throw new Error(error.message);
  return data ? profileFromRow(data) : null;
}

export async function listStudentProfiles(
  supabase: SupabaseClient,
): Promise<UserAccessProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("role", "student")
    .order("full_name", { ascending: true })
    .returns<ProfileRow[]>();

  if (error) throw new Error(error.message);
  return (data ?? []).map(profileFromRow);
}

export async function updateStudentProfileAccess(
  supabase: SupabaseClient,
  userId: string,
  plan: "basic" | "premium",
  unlockedChapterTitles: string[],
): Promise<UserAccessProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      plan,
      unlocked_chapters: sanitizeUnlockedChapterTitles(unlockedChapterTitles, plan),
    })
    .eq("id", userId)
    .eq("role", "student")
    .select(PROFILE_SELECT)
    .maybeSingle<ProfileRow>();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error("Student profile not found.");
  }

  return profileFromRow(data);
}

export function defaultUnlockedChaptersForPlan(plan: "basic" | "premium") {
  return sanitizeUnlockedChapterTitles([CHAPTER_ONE_TITLE], plan);
}
