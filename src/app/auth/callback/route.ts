import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function isIgnorableConfirmationError(message: string, next: string) {
  const normalizedMessage = message.toLowerCase();
  const normalizedNext = next.toLowerCase();

  return (
    normalizedNext.includes("confirmed=1") &&
    normalizedMessage.includes("code challenge does not match previously saved code verifier")
  );
}

function buildRedirectUrl(requestUrl: string, targetPath: string, error?: string) {
  const url = new URL(targetPath, requestUrl);
  if (error) {
    url.searchParams.set("error_description", error);
  }
  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      if (isIgnorableConfirmationError(error.message, next)) {
        return NextResponse.redirect(buildRedirectUrl(request.url, next));
      }

      return NextResponse.redirect(
        buildRedirectUrl(request.url, next, error.message),
      );
    }

    return NextResponse.redirect(buildRedirectUrl(request.url, next));
  }

  return NextResponse.redirect(buildRedirectUrl(request.url, next));
}
