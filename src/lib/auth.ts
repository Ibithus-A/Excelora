function toDisplayName(value: string): string {
  const token = value.trim().split(/\s+/)[0].replace(/[^a-z0-9]/gi, "");
  if (!token) return "";
  return `${token[0].toUpperCase()}${token.slice(1)}`;
}

export function resolveDisplayFirstName(
  name: string,
  email: string,
  role: "tutor" | "student",
): string {
  const normalizedName = normalizeFirstName(name);
  if (normalizedName) return normalizedName;

  const emailName = normalizeFirstName(email);
  if (emailName) return emailName;

  return role === "tutor" ? "Tutor" : "Student";
}

export function normalizeStudentName(value: string): string {
  return toDisplayName(value);
}

export function normalizeFirstName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const source = trimmed.includes("@") ? (trimmed.split("@")[0] ?? "") : trimmed;
  const firstToken = source
    .replace(/[._+-]+/g, " ")
    .split(/\s+/)
    .find(Boolean);

  return toDisplayName(firstToken ?? "");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}
