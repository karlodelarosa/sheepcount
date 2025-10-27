"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    console.info("test");
    // const supabase = createClient();
    // await supabase.auth.signOut();
    // localStorage.removeItem("tenantData");
    // window.location.replace("/auth/login");
  };

  return <Button onClick={logout}>Logoutxx</Button>;
}
