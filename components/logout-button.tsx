"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("tenant-data");
    window.location.replace("/auth/login");
  };

  return <Button onClick={logout}>Logoutxx</Button>;
}
