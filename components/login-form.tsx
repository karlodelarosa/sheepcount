"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTenant } from "@/app/providers/tenant-provider";

type TenantMembership = {
  id: string;
  user_id: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
  };
};

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setTenant } = useTenant();

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const supabase = createClient();
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     const { error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });
  //     if (error) throw error;
  //     // Update this route to redirect to an authenticated route. The user already has an active session.
  //     router.push("/protected");
  //   } catch (error: unknown) {
  //     setError(error instanceof Error ? error.message : "An error occurred");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Sign in
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user found after login");

      // 2. Fetch tenant member details
      const { data: memberData, error: memberError } = await supabase
        .from("tenant_members")
        .select(
          `
          id,
          user_id,
          tenant:tenant_id (
            id,
            name,
            slug,
            plan,
            status
          )
        `,
        )
        .eq("user_id", authData.user.id)
        .maybeSingle<TenantMembership>();

      if (memberError) throw memberError;
      if (!memberData) throw new Error("No tenant membership found");

      const { data: orgData, error: orgError } = await supabase
        .from("organization")
        .select("*")
        .eq("tenant_id", memberData.tenant.id)
        .maybeSingle();

      if (orgError) throw orgError;

      // 3. Combine into single object
      const result = {
        ...memberData,
        tenant: {
          ...memberData.tenant,
          organization: orgData || null,
        },
      };

      setTenant(result);
      localStorage.setItem("tenantData", JSON.stringify(result));

      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
