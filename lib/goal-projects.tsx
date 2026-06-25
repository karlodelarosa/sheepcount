"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  createContribution,
  createFundraisingCampaign,
  deleteContribution,
  deleteFundraisingCampaign,
  fetchFundraisingCampaignsForOrg,
  markCampaignCompleted,
  reopenCampaign,
  updateContribution,
  updateFundraisingCampaign,
  type CreateContributionInput,
  type CreateFundraisingCampaignInput,
  type FundraisingCampaign,
  type FundraisingContribution,
  type UpdateContributionInput,
  type UpdateFundraisingCampaignInput,
} from "@/lib/supabase/goal-projects";

type GoalProjectsContextValue = {
  campaigns: FundraisingCampaign[];
  hydrated: boolean;
  isSaving: boolean;
  refreshGoalProjects: () => Promise<void>;
  getCampaign: (campaignId: string) => FundraisingCampaign | null;
  getRaisedAmount: (campaignId: string) => number;
  createCampaign: (
    input: CreateFundraisingCampaignInput,
  ) => Promise<FundraisingCampaign | null>;
  updateCampaign: (
    input: UpdateFundraisingCampaignInput,
  ) => Promise<FundraisingCampaign | null>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  markCompleted: (campaignId: string) => Promise<boolean>;
  reopen: (campaignId: string) => Promise<boolean>;
  addContribution: (
    input: CreateContributionInput,
  ) => Promise<FundraisingContribution | null>;
  updateContribution: (
    input: UpdateContributionInput,
  ) => Promise<FundraisingContribution | null>;
  deleteContribution: (contributionId: string) => Promise<boolean>;
};

const GoalProjectsContext = createContext<GoalProjectsContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function GoalProjectsProvider({ children }: { children: React.ReactNode }) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshGoalProjects = useCallback(async () => {
    if (!organizationId) {
      setCampaigns([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const data = await fetchFundraisingCampaignsForOrg(supabase, organizationId);
      setCampaigns(data);
    } catch (error) {
      toast.error("Failed to load fundraising campaigns", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshGoalProjects();
  }, [refreshGoalProjects]);

  const getCampaign = useCallback(
    (campaignId: string) => campaigns.find(c => c.id === campaignId) ?? null,
    [campaigns],
  );

  const getRaisedAmount = useCallback(
    (campaignId: string) => {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) return 0;
      return campaign.contributions.reduce((sum, c) => sum + c.amount, 0);
    },
    [campaigns],
  );

  const createCampaign = useCallback(
    async (input: CreateFundraisingCampaignInput) => {
      if (!organizationId) return null;
      setIsSaving(true);
      try {
        const campaign = await createFundraisingCampaign(
          supabase,
          organizationId,
          input,
        );
        setCampaigns(prev => [campaign, ...prev]);
        return campaign;
      } catch (error) {
        toast.error("Failed to create campaign", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const updateCampaign = useCallback(
    async (input: UpdateFundraisingCampaignInput) => {
      setIsSaving(true);
      try {
        const campaign = await updateFundraisingCampaign(supabase, input);
        setCampaigns(prev => prev.map(c => (c.id === campaign.id ? campaign : c)));
        return campaign;
      } catch (error) {
        toast.error("Failed to update campaign", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const deleteCampaign = useCallback(
    async (campaignId: string) => {
      setIsSaving(true);
      try {
        await deleteFundraisingCampaign(supabase, campaignId);
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        return true;
      } catch (error) {
        toast.error("Failed to delete campaign", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const markCompleted = useCallback(
    async (campaignId: string) => {
      setIsSaving(true);
      try {
        await markCampaignCompleted(supabase, campaignId);
        await refreshGoalProjects();
        return true;
      } catch (error) {
        toast.error("Failed to mark campaign complete", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGoalProjects, supabase],
  );

  const reopen = useCallback(
    async (campaignId: string) => {
      setIsSaving(true);
      try {
        await reopenCampaign(supabase, campaignId);
        await refreshGoalProjects();
        return true;
      } catch (error) {
        toast.error("Failed to reopen campaign", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGoalProjects, supabase],
  );

  const addContribution = useCallback(
    async (input: CreateContributionInput) => {
      setIsSaving(true);
      try {
        const contribution = await createContribution(supabase, input);
        setCampaigns(prev =>
          prev.map(c =>
            c.id === input.campaignId
              ? { ...c, contributions: [contribution, ...c.contributions] }
              : c,
          ),
        );
        return contribution;
      } catch (error) {
        toast.error("Failed to add contribution", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const updateContributionHandler = useCallback(
    async (input: UpdateContributionInput) => {
      setIsSaving(true);
      try {
        const contribution = await updateContribution(supabase, input);
        setCampaigns(prev =>
          prev.map(c => {
            if (c.id !== input.campaignId) return c;
            return {
              ...c,
              contributions: c.contributions.map(existing =>
                existing.id === contribution.id ? contribution : existing,
              ),
            };
          }),
        );
        return contribution;
      } catch (error) {
        toast.error("Failed to update contribution", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const deleteContributionHandler = useCallback(
    async (contributionId: string) => {
      setIsSaving(true);
      try {
        await deleteContribution(supabase, contributionId);
        await refreshGoalProjects();
        return true;
      } catch (error) {
        toast.error("Failed to delete contribution", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGoalProjects, supabase],
  );

  const value = useMemo<GoalProjectsContextValue>(
    () => ({
      campaigns,
      hydrated,
      isSaving,
      refreshGoalProjects,
      getCampaign,
      getRaisedAmount,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      markCompleted,
      reopen,
      addContribution,
      updateContribution: updateContributionHandler,
      deleteContribution: deleteContributionHandler,
    }),
    [
      campaigns,
      hydrated,
      isSaving,
      refreshGoalProjects,
      getCampaign,
      getRaisedAmount,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      markCompleted,
      reopen,
      addContribution,
      updateContributionHandler,
      deleteContributionHandler,
    ],
  );

  return (
    <GoalProjectsContext.Provider value={value}>
      {children}
    </GoalProjectsContext.Provider>
  );
}

export function useGoalProjects(): GoalProjectsContextValue {
  const ctx = useContext(GoalProjectsContext);
  if (!ctx) {
    throw new Error("useGoalProjects must be used within GoalProjectsProvider");
  }
  return ctx;
}

