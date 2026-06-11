"use client";

import { Button } from "@/components/ui/button";
import { useTenant } from "@/app/providers/tenant-provider";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const { logout } = useTenant();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
