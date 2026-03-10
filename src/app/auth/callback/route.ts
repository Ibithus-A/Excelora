import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        buildRedirectUrl(request.url, next, error.message),
      );
    }

    return NextResponse.redirect(buildRedirectUrl(request.url, next));
  }

  if (tokenHash && type) {
    const nextUrl = buildRedirectUrl(request.url, next);
    nextUrl.searchParams.set("token_hash", tokenHash);
    nextUrl.searchParams.set("type", type);
    return NextResponse.redirect(nextUrl);
  }

  return NextResponse.redirect(buildRedirectUrl(request.url, next));
}
