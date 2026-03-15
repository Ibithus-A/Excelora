import {
  sanitizeCustomUnlockedChapterTitles,
  sanitizeTaggedChapterTitle,
} from "@/lib/access";
import { normalizeEmail, resolveDisplayFirstName } from "@/lib/auth";
import type { UserAccessProfile, UserPlan, UserRole } from "@/types/auth";

export type UserAccessProfilePayload = {
  id?: unknown;
  name?: unknown;
  email?: unknown;
  role?: unknown;
  plan?: unknown;
  taggedChapterTitle?: unknown;
  customUnlockedChapterTitles?: unknown;
};

export type ErrorPayload = {
  error?: unknown;
};

function sanitizeRole(value: unknown): UserRole {
  return value === "tutor" ? "tutor" : "student";
}

function sanitizePlan(value: unknown): UserPlan {
  return value === "premium" ? "premium" : "basic";
}

export function sortProfiles(students: UserAccessProfile[]) {
  return [...students].sort((left, right) => left.name.localeCompare(right.name));
}

export function sanitizeProfile(value: unknown): UserAccessProfile | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as UserAccessProfilePayload;
  if (typeof candidate.id !== "string" || typeof candidate.email !== "string") return null;
  if (typeof candidate.name !== "string") return null;

  const role = sanitizeRole(candidate.role);
  const email = normalizeEmail(candidate.email);
  const plan = sanitizePlan(candidate.plan);

  return {
    id: candidate.id,
    name: resolveDisplayFirstName(candidate.name, email, role),
    email,
    role,
    plan,
    taggedChapterTitle: sanitizeTaggedChapterTitle(candidate.taggedChapterTitle),
    customUnlockedChapterTitles: sanitizeCustomUnlockedChapterTitles(
      candidate.customUnlockedChapterTitles,
    ),
  };
}

export function sanitizeStudents(value: unknown): UserAccessProfile[] {
  if (!Array.isArray(value)) return [];

  const unique = new Map<string, UserAccessProfile>();
  for (const entry of value) {
    const profile = sanitizeProfile(entry);
    if (!profile || profile.role !== "student") continue;
    unique.set(profile.id, profile);
  }

  return sortProfiles(Array.from(unique.values()));
}

export function toErrorMessage(payload: ErrorPayload, fallback: string) {
  return typeof payload.error === "string" && payload.error.trim() ? payload.error : fallback;
}
