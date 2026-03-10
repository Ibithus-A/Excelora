import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  const { url, key } = getSupabaseEnv();
  browserClient = createBrowserClient(url, key, {
    auth: {
      // Email confirmation and recovery links may open in a different tab or browser context.
      flowType: "implicit",
      storage: window.localStorage,
    },
  });
  return browserClient;
}
