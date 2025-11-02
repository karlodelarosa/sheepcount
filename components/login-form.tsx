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

type ProfileRole = "admin" | "member";
type AccountStatus = "active" | "inactive";

type Organization = {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  created_at: string;
  updated_at: string;
};

type Subscription = {
  provider: string;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
};

export type TenantMembership = {
  id: string;
  user_id: string;
  status: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: AccountStatus;
    organizations: Organization[];
  };
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    role: ProfileRole;
    avatar_url: string;
  };
  subscription: Subscription;
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user found after login");

      const { data: memberData, error: memberError } = await supabase
        .from("tenant_members")
        .select(
          `
          id,
          user_id,
          status,
          tenant:tenant_id (
            id,
            name,
            slug,
            plan,
            status
          ),
          profile:profile_id (
            id,
            first_name,
            last_name,
            role,
            avatar_url
          )
        `
        )
        .eq("user_id", authData.user.id)
        .maybeSingle<TenantMembership>();

      if (memberError) throw memberError;
      if (!memberData) throw new Error("No tenant membership found");

      const { data: orgData, error: orgError } = await supabase
        .from("organization")
        .select("*")
        .eq("tenant_id", memberData.tenant.id);
      if (orgError) throw orgError;

      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select("*")
          .eq("tenant_id", memberData.tenant.id)
          .maybeSingle();
      if (subscriptionError) throw subscriptionError;

      const { tenant, ...rest } = memberData;

      const result = {
        ...rest,
        tenant: {
          ...tenant,
          organization: orgData || null,
          subscription: subscriptionData || null,
        },
      };

      setTenant(result);
      localStorage.setItem("tenant-data", JSON.stringify(result));
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        "bg-background text-foreground",
        className
      )}
      {...props}
    >
      <Card className="border border-border bg-card text-card-foreground dark:border-neutral-800 dark:bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Login</CardTitle>
          <CardDescription className="text-muted-foreground">
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4 hover:text-foreground"
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
