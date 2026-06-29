"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Plus,
  Sparkles,
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

function EmptyCampaigns({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-gradient-to-br from-muted/30 via-background to-muted/20 px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-sm flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-inner dark:from-violet-950/60 dark:to-indigo-950/40 dark:text-violet-300">
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
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

        <div className="rounded-2xl border border-slate-200/70 bg-white/50 py-16 text-center backdrop-blur-sm dark:border-zinc-700/70 dark:bg-zinc-800/50">
          <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
          <h2 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
            Finance & Giving is not enabled
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            Fundraising campaigns are available on the Pro plan. Contact
            support to upgrade your subscription.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-3xl border border-violet-200/60 bg-gradient-to-br from-violet-50/95 via-white to-sky-50/90 shadow-[0_24px_80px_-28px_rgba(99,102,241,0.45)] dark:border-zinc-700/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 dark:shadow-slate-900/40"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_12%_-10%,rgba(167,139,250,0.35),transparent),radial-gradient(ellipse_60%_50%_at_95%_15%,rgba(56,189,248,0.28),transparent),radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(52,211,153,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(139,92,246,0.45),transparent),radial-gradient(ellipse_60%_50%_at_90%_20%,rgba(59,130,246,0.35),transparent),radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(16,185,129,0.25),transparent)]" />
        <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-500/20" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl dark:bg-blue-500/20" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-100/70 px-3 py-1 text-xs font-medium text-violet-700 backdrop-blur-sm dark:border-white/15 dark:bg-white/10 dark:text-white/80">
                <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-amber-300" />
                Giving & impact
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Fundraising Campaigns
              </h1>
              <p className="text-sm text-slate-600 sm:text-base dark:text-white/65">
                Track goals, celebrate milestones, and see your community&apos;s
                generosity come to life.
              </p>
            </div>

            {isAdmin && (
              <Button
                onClick={() => setIsAddProjectOpen(true)}
                className="shrink-0 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:border dark:border-white/20 dark:bg-white dark:text-slate-900 dark:shadow-black/20 dark:hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            )}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FundraisingStatCard
              icon={TrendingUp}
              label="Total raised"
              value={formatCurrency(totalRaised, currency)}
              subtext="Across all campaigns"
              accent="blue"
              featured
              className="sm:col-span-2 lg:col-span-2"
            />
            <FundraisingStatCard
              icon={Target}
              label="Active"
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
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {activeTab === "active" ? "Active campaigns" : "Completed campaigns"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeTab === "active"
                ? "Campaigns your community is rallying behind right now."
                : "Milestones your church has already reached."}
            </p>
          </div>
          <TabsList className="h-11 w-full max-w-xs grid-cols-2 rounded-xl border border-border/60 bg-muted/50 p-1 backdrop-blur-sm sm:w-auto">
            <TabsTrigger
              value="active"
              className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm"
            >
              <Target className="w-4 h-4" />
              Active
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-6">
          {activeCampaigns.length === 0 ? (
            <EmptyCampaigns
              icon={Target}
              title="No active campaigns yet"
              description="Start a campaign to rally your community around a shared goal."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
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

        <TabsContent value="completed" className="mt-6">
          {completedCampaigns.length === 0 ? (
            <EmptyCampaigns
              icon={CheckCircle2}
              title="No completed campaigns yet"
              description="When a campaign reaches its goal, it will appear here as a celebration."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
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
