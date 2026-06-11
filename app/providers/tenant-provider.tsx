"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { TenantMembership } from "@/components/login-form";
import {
  clearLocalSession,
  mockTenantMembership,
  mockUser,
  seedLocalSession,
} from "@/lib/mock-auth";

type TenantContextType = {
  user: typeof mockUser | null;
  tenant: TenantMembership | null;
  setTenant: (tenant: TenantMembership) => void;
  setUser: (user: typeof mockUser) => void;
  logout: () => void;
};

const TenantContext = createContext<TenantContextType>({
  user: null,
  tenant: null,
  setTenant: () => {},
  setUser: () => {},
  logout: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<typeof mockUser | null>(null);
  const [tenant, setTenant] = useState<TenantMembership | null>(null);

  useEffect(() => {
    const storedTenant = localStorage.getItem("tenant-data");
    const storedUser = localStorage.getItem("mock-user");

    if (storedTenant && storedUser) {
      setTenant(JSON.parse(storedTenant));
      setUser(JSON.parse(storedUser));
      return;
    }

    const session = seedLocalSession();
    setUser(session.user);
    setTenant(session.tenant);
  }, []);

  const logout = () => {
    clearLocalSession();
    setUser(null);
    setTenant(null);
    const session = seedLocalSession();
    setUser(session.user);
    setTenant(session.tenant);
  };

  return (
    <TenantContext.Provider
      value={{ user, tenant, setTenant, setUser, logout }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
