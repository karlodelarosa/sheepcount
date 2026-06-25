"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBrand } from "@/components/app-brand";
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
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/app/providers/tenant-provider";

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshSession } = useTenant();
  const supabase = createClient();
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedName = organizationName.trim();
    if (!trimmedName) {
      setError("Organization name is required.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: setupError } = await supabase.rpc("setup_organization", {
        org_name: trimmedName,
      });

      if (setupError) {
        throw setupError;
      }

      await refreshSession();
      router.replace("/dashboard");
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create organization.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <AppBrand className="justify-center" />
          <div>
            <CardTitle>Set up your church</CardTitle>
            <CardDescription>
              Create your organization to start using Sheepcount.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization-name">Church / organization name</Label>
              <Input
                id="organization-name"
                value={organizationName}
                onChange={event => setOrganizationName(event.target.value)}
                placeholder="Grace Community Church"
                required
                disabled={isLoading}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
