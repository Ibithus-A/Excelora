export function subtopicIdentity(title: string): string {
  return title
    .replace(/^\d+\.\d+\s+/, "")
    .replace(/\s*[—–]\s*Native review$/i, "")
    .toLowerCase()
    .replace(/μ/g, "mu")
    .replace(/σ/g, "sigma")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}
export function resolvePracticeSubtopic(
  title: string,
  available: readonly string[],
): string | null {
  if (!title) return "";
  const aliases: Record<string,string> = { thercosform: "thercosthetaalphaform" };
  const identity = aliases[subtopicIdentity(title)] ?? subtopicIdentity(title);
  return (
    available.find(
      (value) => subtopicIdentity(value) === identity,
    ) ?? null
  );
}
