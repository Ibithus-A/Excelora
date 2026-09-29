import type { UserPlan } from "../types/auth";

export function normalizeUserPlan(value: unknown): UserPlan | null {
  if (value === "premium") return "plus";
  if (value === "basic" || value === "plus" || value === "pro") return value;
  return null;
}

export function hasPlusAccess(plan: unknown): boolean {
  const normalized = normalizeUserPlan(plan);
  return normalized === "plus" || normalized === "pro";
}

export function hasProAccess(plan: unknown): boolean {
  return normalizeUserPlan(plan) === "pro";
}
