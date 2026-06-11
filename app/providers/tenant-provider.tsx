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
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const TenantContext = createContext<TenantContextType>({
  user: null,
  tenant: null,
  isLoading: true,
  refreshSession: async () => {},
  logout: async () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<TenantMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const loadSession = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setTenant(null);
      return;
    }

    setUser(toAuthUser(authUser));

    let membership = await fetchTenantMembership(supabase, authUser.id);

    if (!membership) {
      const organizationName = authUser.user_metadata?.organization_name as
        | string
        | undefined;

      if (organizationName) {
        await supabase.rpc("setup_organization", {
          org_name: organizationName,
        });
        membership = await fetchTenantMembership(supabase, authUser.id);
      }
    }

    setTenant(membership);
  }, [supabase]);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadSession();
    } finally {
      setIsLoading(false);
    }
  }, [loadSession]);

  useEffect(() => {
    refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshSession();
    });

    return () => subscription.unsubscribe();
  }, [refreshSession, supabase]);

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
