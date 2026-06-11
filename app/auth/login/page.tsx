"use client";
import { useEffect } from "react";
import { useTenant } from "@/app/providers/tenant-provider";
import { LoginForm } from "@/components/login-form";
import { PageLoader } from "@/components/page-loader";

export default function Page() {
  const { user, isLoading } = useTenant();

  useEffect(() => {
    if (!isLoading && user) {
      window.location.replace("/dashboard");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <PageLoader message="Checking session..." fullScreen />;
  }

  if (user) return null;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
