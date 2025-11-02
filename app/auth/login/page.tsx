"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/app/providers/tenant-provider";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  const { user } = useTenant();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/"); // redirect if already logged in
    }
  }, [user, router]);

  // Show nothing (or a loader) while checking session
  if (user) return null;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
