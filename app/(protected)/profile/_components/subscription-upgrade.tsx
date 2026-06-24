"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  fetchSubscriptionPlans,
  upgradeOrganizationSubscription,
  type SubscriptionPlan,
} from "@/lib/supabase/subscription";
import {
  formatPlanLimit,
  getPlanHighlights,
} from "@/lib/subscription/plan-highlights";
import { getPlanTier, normalizePlanKey } from "@/lib/subscription/plans";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

type SubscriptionUpgradeProps = {
  organizationId: string;
  currentPlanKey: string;
  onUpgraded: () => Promise<unknown>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function SubscriptionUpgrade({
  organizationId,
  currentPlanKey,
  onUpgraded,
}: SubscriptionUpgradeProps) {
  const supabase = useMemo(() => createClient(), []);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [upgradingPlanKey, setUpgradingPlanKey] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPlans = async () => {
      setIsLoadingPlans(true);
      try {
        const data = await fetchSubscriptionPlans(supabase);
        if (mounted) setPlans(data);
      } catch (error) {
        if (mounted) {
          toast.error("Failed to load plans", {
            description: getErrorMessage(error),
          });
        }
      } finally {
        if (mounted) setIsLoadingPlans(false);
      }
    };

    void loadPlans();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const normalizedCurrentKey = normalizePlanKey(currentPlanKey);
  const currentTier = getPlanTier(
    normalizedCurrentKey,
    plans.find(plan => plan.key === normalizedCurrentKey)?.sort_order,
  );
  const upgradePlans = plans.filter(
    plan => getPlanTier(plan.key, plan.sort_order) > currentTier,
  );
  const isOnHighestPlan =
    plans.length > 0 &&
    upgradePlans.length === 0 &&
    currentTier >=
      Math.max(...plans.map(plan => getPlanTier(plan.key, plan.sort_order)));

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (
      !window.confirm(
        `Upgrade to the ${plan.name} plan? Your organization will get access to additional features immediately.`,
      )
    ) {
      return;
    }

    setUpgradingPlanKey(plan.key);
    try {
      await upgradeOrganizationSubscription(supabase, organizationId, plan.key);
      await onUpgraded();
      toast.success(`Upgraded to ${plan.name}`);
    } catch (error) {
      toast.error("Failed to upgrade subscription", {
        description: getErrorMessage(error),
      });
    } finally {
      setUpgradingPlanKey(null);
    }
  };

  if (isLoadingPlans) {
    return (
      <p className="text-sm text-muted-foreground">Loading available plans...</p>
    );
  }

  if (upgradePlans.length === 0 && !isOnHighestPlan) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load available plans. Please refresh and try again.
      </p>
    );
  }

  if (isOnHighestPlan) {
    return (
      <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-4 w-4" />
          You are on the highest available plan.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Upgrade your plan</h3>
        <p className="text-sm text-muted-foreground">
          Unlock more modules and features for your organization.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map(plan => {
          const isCurrent = plan.key === normalizedCurrentKey;
          const canUpgrade =
            getPlanTier(plan.key, plan.sort_order) > currentTier;
          const highlights = getPlanHighlights(plan);

          return (
            <Card
              key={plan.key}
              className={
                isCurrent
                  ? "border-indigo-300/80 shadow-sm dark:border-indigo-700/60"
                  : canUpgrade
                    ? "border-border"
                    : "opacity-70"
              }
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {isCurrent ? (
                    <Badge variant="secondary">Current plan</Badge>
                  ) : canUpgrade ? (
                    <Badge>Upgrade</Badge>
                  ) : null}
                </div>
                <CardDescription>
                  {formatPlanLimit(plan.max_people, "people")} ·{" "}
                  {formatPlanLimit(plan.max_attendance_sessions, "attendance sessions")}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {highlights.map(feature => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              {canUpgrade && (
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan)}
                    disabled={upgradingPlanKey !== null}
                  >
                    {upgradingPlanKey === plan.key
                      ? "Upgrading..."
                      : `Upgrade to ${plan.name}`}
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
