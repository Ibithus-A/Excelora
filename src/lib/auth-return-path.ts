// Auth callbacks may carry recovery tokens. Keep their destination on this app.
export function safeAuthReturnPath(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";
  const origin = "https://auth-return.invalid";
  try {
    const destination = new URL(value, origin);
    return destination.origin === origin
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : "/";
  } catch {
    return "/";
  }
}
