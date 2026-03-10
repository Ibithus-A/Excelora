export type UserRole = "tutor" | "student";
export type UserPlan = "basic" | "premium";

export type AuthenticatedAccount = {
  id: string;
  role: UserRole;
  name: string;
  email: string;
};

export type UserAccessProfile = AuthenticatedAccount & {
  plan: UserPlan;
  unlockedChapterTitles: string[];
};
