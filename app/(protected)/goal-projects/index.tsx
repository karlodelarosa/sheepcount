"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isItemEnabled } from "@/lib/subscription/entitlements";
import { useTenant } from "@/app/providers/tenant-provider";
import { useGoalProjects } from "@/lib/goal-projects";
import { AddGoalProjectDialog } from "./_components/add-goal-project-dialog";
import { FundraisingStatCard } from "./_components/fundraising-stat-card";
import { CampaignCard } from "./_components/campaign-card";

interface GoalProjectsViewProps {
  onViewProject?: (projectId: string) => void;
}

export function GoalProjectsView({ onViewProject }: GoalProjectsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { tenant } = useTenant();
  const isAdmin = tenant?.profile?.role === "admin";
  const { settings: orgSettings } = useOrganizationSettings();
  const currency = orgSettings.currency ?? DEFAULT_CURRENCY;
  const goalProjectsEnabled = isItemEnabled(entitlements.modules, "goal_projects");

  const {
    campaigns,
    hydrated,
    createCampaign,
    getRaisedAmount,
  } = useGoalProjects();

  type GoalProjectsTab = "active" | "completed";
  const activeTab: GoalProjectsTab =
    searchParams.get("tab") === "completed" ? "completed" : "active";
  const setActiveTab = (tab: string) => {
    router.replace(`/goal-projects?tab=${tab}`, { scroll: false });
  };

  const activeCampaigns = useMemo(
    () => campaigns.filter(c => c.status === "active"),
    [campaigns],
  );
  const completedCampaigns = useMemo(
    () => campaigns.filter(c => c.status === "completed"),
    [campaigns],
  );

  const totalRaised = useMemo(
    () =>
      campaigns.reduce(
        (sum, c) => sum + c.contributions.reduce((s, cc) => s + cc.amount, 0),
        0,
      ),
    [campaigns],
  );

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  if (entitlementsLoading || !hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!goalProjectsEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Fundraising Campaigns
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Track fundraising goals and campaign progress
          </p>
        </div>

        <Card className="border-slate-200/70 dark:border-zinc-700/70">
          <CardContent className="py-16 text-center">
            <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
            <h2 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              Finance & Giving is not enabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              Fundraising campaigns are available on the Pro plan. Contact
              support to upgrade your subscription.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Fundraising Campaigns
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Track fundraising goals and campaign progress.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsAddProjectOpen(true)}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FundraisingStatCard
          icon={Target}
          label="Active campaigns"
          value={String(activeCampaigns.length)}
          subtext="In progress"
          accent="purple"
        />
        <FundraisingStatCard
          icon={CheckCircle2}
          label="Completed"
          value={String(completedCampaigns.length)}
          subtext="Goals achieved"
          accent="emerald"
        />
        <FundraisingStatCard
          icon={TrendingUp}
          label="Total raised"
          value={formatCurrency(totalRaised, currency)}
          subtext="All campaigns"
          accent="blue"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-sm grid-cols-2 h-10 p-1 bg-slate-100/80 dark:bg-zinc-800/80">
          <TabsTrigger value="active" className="gap-1.5 text-xs sm:text-sm">
            <Target className="w-4 h-4" />
            Active
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="gap-1.5 text-xs sm:text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeCampaigns.length === 0 ? (
            <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
              <CardContent className="py-16 text-center text-slate-500 dark:text-zinc-400">
                <Target className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-600" />
                <p>No active campaigns yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  raisedAmount={getRaisedAmount(campaign.id)}
                  currency={currency}
                  onClick={() => {
                    if (onViewProject) onViewProject(campaign.id);
                    else router.push(`/goal-projects/${campaign.id}`);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedCampaigns.length === 0 ? (
            <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
              <CardContent className="py-16 text-center text-slate-500 dark:text-zinc-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-600" />
                <p>No completed campaigns yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {completedCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  raisedAmount={getRaisedAmount(campaign.id)}
                  currency={currency}
                  onClick={() => {
                    if (onViewProject) onViewProject(campaign.id);
                    else router.push(`/goal-projects/${campaign.id}`);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddGoalProjectDialog
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
        onSubmit={createCampaign}
        isAdmin={isAdmin}
      />
    </div>
  );
}
