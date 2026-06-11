"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/app/providers/tenant-provider";
import { LoginForm } from "@/components/login-form";
import { PageLoader } from "@/components/page-loader";

export default function Page() {
  const { user, isLoading } = useTenant();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

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
