"use client";

import { PageSkeleton } from "@/components/page-skeleton";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Plus, Search, Target, TrendingUp } from "lucide-react";
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--accent-color-soft)] via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-sm flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
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
  const goalProjectsEnabled = isItemEnabled(
    entitlements.modules,
    "goal_projects",
  );

  const { campaigns, hydrated, createCampaign, getRaisedAmount } =
    useGoalProjects();

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

  const [search, setSearch] = useState("");
  const matchesSearch = (campaign: (typeof campaigns)[number]) =>
    `${campaign.title} ${campaign.description} ${campaign.category}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  if (entitlementsLoading || !hydrated) {
    return <PageSkeleton message="Loading..." />;
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
            Fundraising campaigns are available on the Pro plan. Contact support
            to upgrade your subscription.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DirectoryTitleCard
        title="Fundraising Campaigns"
        description="Track goals, celebrate milestones, and follow your community’s giving."
        icon={Target}
        action={
          isAdmin
            ? {
                label: "New Campaign",
                icon: Plus,
                onClick: () => setIsAddProjectOpen(true),
              }
            : undefined
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FundraisingStatCard
          icon={TrendingUp}
          label="Total raised"
          value={formatCurrency(totalRaised, currency)}
          subtext="Across all campaigns"
          accent="blue"
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {activeTab === "active"
                ? "Active campaigns"
                : "Completed campaigns"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeTab === "active"
                ? "Campaigns your community is rallying behind right now."
                : "Milestones your church has already reached."}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Search campaigns"
              placeholder="Search campaigns…"
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="h-11 rounded-xl bg-card pl-10"
            />
          </div>
        </div>

        <TabsList>
          <TabsTrigger value="active">
            <Target className="w-4 h-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeCampaigns.filter(matchesSearch).length === 0 ? (
            <EmptyCampaigns
              icon={Target}
              title={
                search.trim()
                  ? "No matching active campaigns"
                  : "No active campaigns yet"
              }
              description={
                search.trim()
                  ? "Try another name or category."
                  : "Start a campaign to rally your community around a shared goal."
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
              {activeCampaigns.filter(matchesSearch).map(campaign => (
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
          {completedCampaigns.filter(matchesSearch).length === 0 ? (
            <EmptyCampaigns
              icon={CheckCircle2}
              title={
                search.trim()
                  ? "No matching completed campaigns"
                  : "No completed campaigns yet"
              }
              description={
                search.trim()
                  ? "Try another name or category."
                  : "Completed campaigns will appear here."
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
              {completedCampaigns.filter(matchesSearch).map(campaign => (
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
