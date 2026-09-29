export type UserRole = "tutor" | "student";
export type UserPlan = "basic" | "plus" | "pro";

export type AuthenticatedAccount = {
  id: string;
  role: UserRole;
  name: string;
  email: string;
};

export type UserAccessProfile = AuthenticatedAccount & {
  plan: UserPlan;
  taggedChapterTitle: string | null;
  customUnlockedChapterTitles: string[];
};
