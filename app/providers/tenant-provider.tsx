// app/providers/tenant-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TenantMembership } from "@/components/login-form";


type TenantContextType = {
  user: any | null;
  tenant: TenantMembership | null;
  setTenant: (tenant: any) => void;
};

const TenantContext = createContext<TenantContextType>({
  user: null,
  tenant: null,
  setTenant: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<any | null>(null);
  const [tenant, setTenant] = useState<TenantMembership | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const storedTenant = localStorage.getItem("tenant-data");
    if (storedTenant) {
      setTenant(JSON.parse(storedTenant));
    }
  }, []);

  return (
    <TenantContext.Provider value={{ user, tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
