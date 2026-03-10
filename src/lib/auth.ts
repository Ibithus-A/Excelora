function toDisplayName(value: string): string {
  const token = value.trim().split(/\s+/)[0].replace(/[^a-z0-9]/gi, "");
  if (!token) return "";
  return `${token[0].toUpperCase()}${token.slice(1)}`;
}

export function normalizeStudentName(value: string): string {
  return toDisplayName(value);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}
