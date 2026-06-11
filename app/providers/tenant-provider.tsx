"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchTenantMembership,
  toAuthUser,
} from "@/lib/supabase/tenant";
import type { AuthUser, TenantMembership } from "@/lib/types/tenant";

type TenantContextType = {
  user: AuthUser | null;
  tenant: TenantMembership | null;
  isLoading: boolean;
  refreshSession: () => Promise<TenantMembership | null>;
  logout: () => Promise<void>;
};

const TenantContext = createContext<TenantContextType>({
  user: null,
  tenant: null,
  isLoading: true,
  refreshSession: async () => null,
  logout: async () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<TenantMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const loadSession = useCallback(async (): Promise<TenantMembership | null> => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setTenant(null);
      return null;
    }

    setUser(toAuthUser(authUser));

    let membership = await fetchTenantMembership(supabase, authUser.id);

    if (!membership) {
      const organizationName = authUser.user_metadata?.organization_name as
        | string
        | undefined;

      if (organizationName) {
        const { error } = await supabase.rpc("setup_organization", {
          org_name: organizationName,
        });

        if (!error) {
          membership = await fetchTenantMembership(supabase, authUser.id);
        }
      }
    }

    setTenant(membership);
    return membership;
  }, [supabase]);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      return await loadSession();
    } finally {
      setIsLoading(false);
    }
  }, [loadSession]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoading(true);
      try {
        await loadSession();
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === "INITIAL_SESSION") return;

      // Defer to avoid Supabase auth deadlocks when calling getUser inside the handler.
      setTimeout(() => {
        void loadSession();
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadSession, supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTenant(null);
  }, [supabase]);

  return (
    <TenantContext.Provider
      value={{ user, tenant, isLoading, refreshSession, logout }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
