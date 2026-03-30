"use client";

import { accountFromUser } from "@/lib/supabase/account";
import { createClient } from "@/lib/supabase/client";
import type { AuthenticatedAccount } from "@/types/auth";
import { useCallback, useEffect, useState } from "react";

function isMissingRefreshTokenError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const normalizedMessage = error.message.toLowerCase();
  return (
    normalizedMessage.includes("invalid refresh token") &&
    normalizedMessage.includes("refresh token not found")
  );
}

export function useAuthSession() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedAccount | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;

        setCurrentUser(data.session?.user ? accountFromUser(data.session.user) : null);
      } catch (error) {
        if (isMissingRefreshTokenError(error)) {
          await supabase.auth.signOut({ scope: "local" });

          if (!isMounted) return;
          setCurrentUser(null);
          return;
        }

        throw error;
      }
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
