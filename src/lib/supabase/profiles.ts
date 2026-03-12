import { normalizeEmail, resolveDisplayFirstName } from "@/lib/auth";
import {
  normalizeUserPlan,
  sanitizeCustomUnlockedChapterTitles,
  sanitizeTaggedChapterTitle,
} from "@/lib/access";
import type { UserAccessProfile, UserRole } from "@/types/auth";
import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole | null;
  plan: string | null;
  tagged_chapter: string | null;
  unlocked_chapters: string[] | null;
};

export const PROFILE_SELECT =
  "id, email, full_name, role, plan, tagged_chapter, unlocked_chapters";

function normalizeRole(value: unknown): UserRole {
  return value === "tutor" ? "tutor" : "student";
}

export function profileFromRow(row: ProfileRow): UserAccessProfile {
  const role = normalizeRole(row.role);
  const email = normalizeEmail(row.email ?? "");
  const name = resolveDisplayFirstName(row.full_name ?? "", email, role);
  const plan = normalizeUserPlan(row.plan) ?? "basic";

  return {
    id: row.id,
    email,
    name,
    role,
    plan,
    taggedChapterTitle: sanitizeTaggedChapterTitle(row.tagged_chapter),
    customUnlockedChapterTitles: sanitizeCustomUnlockedChapterTitles(row.unlocked_chapters ?? []),
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
  taggedChapterTitle: string | null,
  customUnlockedChapterTitles: string[],
): Promise<UserAccessProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      plan,
      tagged_chapter: sanitizeTaggedChapterTitle(taggedChapterTitle),
      unlocked_chapters: sanitizeCustomUnlockedChapterTitles(customUnlockedChapterTitles),
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

export async function getStudentProfileById(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserAccessProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .eq("role", "student")
    .maybeSingle<ProfileRow>();

  if (error) throw new Error(error.message);
  return data ? profileFromRow(data) : null;
}
