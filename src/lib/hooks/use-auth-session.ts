"use client";

import { accountFromUser } from "@/lib/supabase/account";
import { createClient } from "@/lib/supabase/client";
import type { AuthenticatedAccount } from "@/types/auth";
import { useCallback, useEffect, useState } from "react";

export function useAuthSession() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedAccount | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const hydrateSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      setCurrentUser(data.session?.user ? accountFromUser(data.session.user) : null);
    };

    void hydrateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ? accountFromUser(session.user) : null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthenticated = useCallback((account: AuthenticatedAccount) => {
    setCurrentUser(account);
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  return {
    currentUser,
    setAuthenticatedUser: handleAuthenticated,
    signOut,
  };
}
