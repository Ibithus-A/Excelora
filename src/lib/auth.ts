import type { AuthenticatedAccount, UserRole } from "@/types/auth";

export type StudentAccount = {
  name: string;
  email: string;
};

const DEFAULT_STUDENT_NAMES = [
  "Alex",
  "Blake",
  "Casey",
  "Drew",
  "Eden",
  "Harper",
  "Jordan",
  "Logan",
  "Parker",
  "Riley",
] as const;

type AccountProfile = {
  name: string;
  email: string;
  password: string;
};

export const TUTOR_ACCOUNT: AccountProfile = {
  name: "Tutor",
  email: "Tutor@QuickLearn.com",
  password: "Tutor",
};

function toCredentialToken(value: string): string {
  return value.trim().split(/\s+/)[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function toDisplayName(value: string): string {
  const token = value.trim().split(/\s+/)[0].replace(/[^a-z0-9]/gi, "");
  if (!token) return "";
  return `${token[0].toUpperCase()}${token.slice(1)}`;
}

export function getDefaultStudentName(index: number): string {
  if (index < 0) return "Learner";
  return DEFAULT_STUDENT_NAMES[index] ?? `Learner${index + 1}`;
}

export function normalizeStudentName(value: string): string {
  return toDisplayName(value);
}

export function buildStudentEmail(studentName: string): string {
  const normalizedName = normalizeStudentName(studentName);
  if (!normalizedName) return "";
  return `${normalizedName}@QuickLearn.com`;
}

export function buildStudentPassword(studentName: string): string {
  return normalizeStudentName(studentName);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const DEFAULT_STUDENT_ACCOUNTS: StudentAccount[] = DEFAULT_STUDENT_NAMES.map((name) => ({
  name,
  email: buildStudentEmail(name),
}));

function getStudentFromCredentials(
  students: StudentAccount[],
  email: string,
  password: string,
): AuthenticatedAccount | null {
  const normalizedEmail = normalizeEmail(email);
  const studentAccount = students.find(
    (student) => normalizeEmail(student.email) === normalizedEmail,
  );
  if (!studentAccount) return null;

  // Default test credentials reference:
  // Alex@QuickLearn.com -> Alex
  // Blake@QuickLearn.com -> Blake
  // Casey@QuickLearn.com -> Casey
  // Drew@QuickLearn.com -> Drew
  // Eden@QuickLearn.com -> Eden
  // Harper@QuickLearn.com -> Harper
  // Jordan@QuickLearn.com -> Jordan
  // Logan@QuickLearn.com -> Logan
  // Parker@QuickLearn.com -> Parker
  // Riley@QuickLearn.com -> Riley
  const expectedPassword = toCredentialToken(buildStudentPassword(studentAccount.name));
  if (toCredentialToken(password) !== expectedPassword) return null;

  return {
    role: "student",
    name: studentAccount.name,
    email: studentAccount.email,
  };
}

export function authenticateCredentials(
  role: UserRole,
  email: string,
  password: string,
  students: StudentAccount[] = DEFAULT_STUDENT_ACCOUNTS,
): AuthenticatedAccount | null {
  if (role === "tutor") {
    const isTutorMatch =
      normalizeEmail(email) === normalizeEmail(TUTOR_ACCOUNT.email) &&
      toCredentialToken(password) === toCredentialToken(TUTOR_ACCOUNT.password);

    return isTutorMatch
      ? { role: "tutor", name: TUTOR_ACCOUNT.name, email: TUTOR_ACCOUNT.email }
      : null;
  }

  return getStudentFromCredentials(students, email, password);
}
