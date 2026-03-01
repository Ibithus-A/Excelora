const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 72;

export const PASSWORD_POLICY_HINT =
  "Use at least 12 characters with upper/lowercase letters, a number, and a symbol.";

type PasswordValidationOptions = {
  email?: string;
  displayName?: string;
};

function containsCaseInsensitive(value: string, segment: string) {
  return value.toLowerCase().includes(segment.toLowerCase());
}

export function validatePassword(
  password: string,
  options: PasswordValidationOptions = {},
): string[] {
  const candidate = password.trim();
  const errors: string[] = [];

  if (candidate.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (candidate.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Password must be at most ${MAX_PASSWORD_LENGTH} characters.`);
  }
  if (!/[a-z]/.test(candidate)) {
    errors.push("Password must include at least one lowercase letter.");
  }
  if (!/[A-Z]/.test(candidate)) {
    errors.push("Password must include at least one uppercase letter.");
  }
  if (!/\d/.test(candidate)) {
    errors.push("Password must include at least one number.");
  }
  if (!/[^A-Za-z0-9]/.test(candidate)) {
    errors.push("Password must include at least one symbol.");
  }
  if (/\s/.test(candidate)) {
    errors.push("Password cannot contain spaces.");
  }

  if (options.email) {
    const localPart = options.email.split("@")[0]?.trim();
    if (localPart && localPart.length >= 3 && containsCaseInsensitive(candidate, localPart)) {
      errors.push("Password cannot include the email username.");
    }
  }

  if (options.displayName) {
    const token = options.displayName.trim().split(/\s+/)[0];
    if (token && token.length >= 3 && containsCaseInsensitive(candidate, token)) {
      errors.push("Password cannot include the account name.");
    }
  }

  return errors;
}
