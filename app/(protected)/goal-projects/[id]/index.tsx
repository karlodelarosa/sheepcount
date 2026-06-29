"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/index";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useTenant } from "@/app/providers/tenant-provider";
import { useGoalProjects } from "@/lib/goal-projects";
import { usePeople } from "@/lib/people";
import { FundraisingStatCard } from "../_components/fundraising-stat-card";
import { CampaignDetailHero } from "../_components/campaign-detail-hero";
import { AddProjectContributionDialog } from "../_components/add-project-contribution-dialog";
import { EditGoalProjectDialog } from "../_components/edit-goal-project-dialog";
import { DeleteCampaignDialog } from "../_components/delete-campaign-dialog";
import { DeleteContributionDialog } from "../_components/delete-contribution-dialog";

export function GoalProjectDetails({
  campaignId,
  onBack,
}: {
  campaignId: string;
  onBack: () => void;
}) {
  const { tenant } = useTenant();
  const isAdmin = tenant?.profile?.role === "admin";
  const { settings: orgSettings } = useOrganizationSettings();
  const currency = orgSettings.currency ?? DEFAULT_CURRENCY;
  const { people } = usePeople();

  const {
    hydrated,
    isSaving,
    getCampaign,
    getRaisedAmount,
    markCompleted,
    reopen,
    deleteCampaign,
    updateCampaign,
    deleteContribution,
  } = useGoalProjects();

  const campaign = getCampaign(campaignId);
  const raisedAmount = getRaisedAmount(campaignId);

  const progress = useMemo(() => {
    if (!campaign) return 0;
    return campaign.goalAmount > 0
      ? Math.min((raisedAmount / campaign.goalAmount) * 100, 100)
      : 0;
  }, [campaign, raisedAmount]);

  const remaining = campaign ? Math.max(campaign.goalAmount - raisedAmount, 0) : 0;

  const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
  const [isEditCampaignOpen, setIsEditCampaignOpen] = useState(false);
  const [isDeleteCampaignOpen, setIsDeleteCampaignOpen] = useState(false);
  const [editingContributionId, setEditingContributionId] = useState<string | null>(
    null,
  );
  const [deleteContributionId, setDeleteContributionId] = useState<string | null>(
    null,
  );

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 space-y-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-center text-red-500">
          Campaign not found or you do not have access.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CampaignDetailHero
        campaign={campaign}
        raisedAmount={raisedAmount}
        currency={currency}
        progress={progress}
        remaining={remaining}
        onBack={onBack}
        actions={
          <>
            <Button
              onClick={() => setIsAddContributionOpen(true)}
              className="rounded-xl border border-white/25 bg-white/15 text-white hover:bg-white/25 hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contribution
            </Button>

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-white/25 bg-white/15 text-white hover:bg-white/25 hover:text-white"
                    disabled={isSaving}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    <span className="sr-only">Campaign actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl border-slate-200/60 dark:border-zinc-700/60"
                >
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => setIsEditCampaignOpen(true)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit campaign
                  </DropdownMenuItem>
                  {campaign.status === "active" ? (
                    <DropdownMenuItem
                      className="cursor-pointer rounded-lg"
                      onClick={() => void markCompleted(campaign.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark complete
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="cursor-pointer rounded-lg"
                      onClick={() => void reopen(campaign.id)}
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Reopen campaign
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg text-red-600 focus:text-red-600"
                    onClick={() => setIsDeleteCampaignOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete campaign
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <FundraisingStatCard
          icon={CheckCircle2}
          label="Progress"
          value={`${progress.toFixed(1)}%`}
          subtext={`${formatCurrency(raisedAmount, currency)} raised`}
          accent="emerald"
          progress={progress}
        />
        <FundraisingStatCard
          icon={TrendingUp}
          label="Remaining"
          value={formatCurrency(remaining, currency)}
          subtext={`Goal: ${formatCurrency(campaign.goalAmount, currency)}`}
          accent="purple"
        />
        <FundraisingStatCard
          icon={CalendarDays}
          label="Target date"
          value={
            campaign.targetDate
              ? new Date(campaign.targetDate).toLocaleDateString()
              : "Not set"
          }
          subtext={campaign.category}
          accent="orange"
        />
      </div>

      <Card className="overflow-hidden rounded-2xl border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-900/50">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border/60">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Contributions
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Recorded contributions for this campaign.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.contributions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No contributions yet.
                  </TableCell>
                </TableRow>
              ) : (
                campaign.contributions.map(contribution => {
                  const person = contribution.personId
                    ? people.find(p => p.id === contribution.personId)
                    : undefined;
                  return (
                    <TableRow key={contribution.id}>
                      <TableCell>
                        {new Date(contribution.contributedOn).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(contribution.amount, currency)}
                      </TableCell>
                      <TableCell>{person?.name ?? "—"}</TableCell>
                      <TableCell>{contribution.paymentMethod}</TableCell>
                      <TableCell className="max-w-[340px] truncate">
                        {contribution.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() =>
                              setEditingContributionId(contribution.id)
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                              onClick={() =>
                                setDeleteContributionId(contribution.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddProjectContributionDialog
        open={isAddContributionOpen}
        onOpenChange={setIsAddContributionOpen}
        campaignId={campaign.id}
      />

      <AddProjectContributionDialog
        open={Boolean(editingContributionId)}
        onOpenChange={(next) => {
          if (!next) setEditingContributionId(null);
        }}
        campaignId={campaign.id}
        contribution={
          editingContributionId
            ? campaign.contributions.find(c => c.id === editingContributionId) ??
              null
            : null
        }
      />

      {isAdmin && (
        <>
          <EditGoalProjectDialog
            open={isEditCampaignOpen}
            onOpenChange={setIsEditCampaignOpen}
            campaign={campaign}
            onSubmit={updateCampaign}
            isAdmin={isAdmin}
          />
          <DeleteCampaignDialog
            open={isDeleteCampaignOpen}
            onOpenChange={setIsDeleteCampaignOpen}
            title={campaign.title.trim() || "this campaign"}
            onConfirm={() => deleteCampaign(campaign.id)}
            isAdmin={isAdmin}
          />
          <DeleteContributionDialog
            open={Boolean(deleteContributionId)}
            onOpenChange={(next) => {
              if (!next) setDeleteContributionId(null);
            }}
            onConfirm={() =>
              deleteContributionId
                ? deleteContribution(deleteContributionId)
                : Promise.resolve(false)
            }
            isAdmin={isAdmin}
          />
        </>
      )}
    </div>
  );
}

