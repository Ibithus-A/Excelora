import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  const { url, key } = getSupabaseEnv();
  browserClient = createBrowserClient(url, key, {
    auth: {
      // PKCE email flows may complete in a different tab, so keep auth state in localStorage.
      storage: window.localStorage,
    },
  });
  return browserClient;
}
