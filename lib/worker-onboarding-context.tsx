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
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { usePeople } from "@/lib/people";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  approveWorkerCandidate as approveWorkerCandidateDb,
  createWorkerCandidate as createWorkerCandidateDb,
  deployWorkerCandidate as deployWorkerCandidateDb,
  fetchWorkerOnboarding,
  removeWorkerCandidate as removeWorkerCandidateDb,
  returnWorkerCandidate as returnWorkerCandidateDb,
  setWorkerOnboardingCourse as setWorkerOnboardingCourseDb,
  submitWorkerCandidate as submitWorkerCandidateDb,
  updateWorkerCandidateTarget as updateWorkerCandidateTargetDb,
} from "@/lib/supabase/worker-onboarding";
import { useTraining } from "@/lib/training";
import type {
  CreateWorkerCandidateInput,
  DeployWorkerCandidateInput,
  WorkerOnboardingCandidate,
  WorkerOnboardingConfig,
} from "@/lib/worker-onboarding";

type WorkerOnboardingContextValue = {
  config: WorkerOnboardingConfig | null;
  candidates: WorkerOnboardingCandidate[];
  hydrated: boolean;
  isSaving: boolean;
  isAdmin: boolean;
  refreshOnboarding: () => Promise<void>;
  setCourse: (courseId: string) => Promise<boolean>;
  addCandidate: (
    input: Omit<CreateWorkerCandidateInput, "organizationId">,
  ) => Promise<boolean>;
  updateTargetMinistry: (
    candidateId: string,
    ministryId: string,
  ) => Promise<boolean>;
  submitCandidate: (candidateId: string) => Promise<boolean>;
  approveCandidate: (candidateId: string) => Promise<boolean>;
  returnCandidate: (
    candidateId: string,
    returnNote: string,
  ) => Promise<boolean>;
  deployCandidate: (input: DeployWorkerCandidateInput) => Promise<boolean>;
  removeCandidate: (candidateId: string) => Promise<boolean>;
};

const WorkerOnboardingContext =
  createContext<WorkerOnboardingContextValue | null>(null);

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Please try again.";
}

export function WorkerOnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { refreshPeople } = usePeople();
  const { refreshTraining } = useTraining();
  const { refreshGroupsMinistry } = useGroupsMinistry();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);
  const isAdmin = tenant?.profile.role === "admin";
  const [config, setConfig] = useState<WorkerOnboardingConfig | null>(null);
  const [candidates, setCandidates] = useState<WorkerOnboardingCandidate[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshOnboarding = useCallback(async () => {
    if (!organizationId) {
      setConfig(null);
      setCandidates([]);
      setHydrated(!tenantLoading);
      return;
    }
    try {
      const data = await fetchWorkerOnboarding(supabase, organizationId);
      setConfig(data.config);
      setCandidates(data.candidates);
    } catch (error) {
      toast.error("Failed to load worker onboarding", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    if (tenantLoading) return;
    void refreshOnboarding();
  }, [refreshOnboarding, tenantLoading]);

  const mutate = useCallback(
    async (
      action: () => Promise<unknown>,
      successMessage: string,
      errorMessage: string,
      options?: { refreshRelated?: boolean },
    ) => {
      setIsSaving(true);
      try {
        await action();
        await refreshOnboarding();
        if (options?.refreshRelated) {
          await Promise.all([
            refreshPeople(),
            refreshTraining(),
            refreshGroupsMinistry(),
          ]);
        }
        toast.success(successMessage);
        return true;
      } catch (error) {
        toast.error(errorMessage, { description: getErrorMessage(error) });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, refreshOnboarding, refreshPeople, refreshTraining],
  );

  const value = useMemo<WorkerOnboardingContextValue>(
    () => ({
      config,
      candidates,
      hydrated,
      isSaving,
      isAdmin,
      refreshOnboarding,
      setCourse: courseId => {
        if (!organizationId) return Promise.resolve(false);
        return mutate(
          () => setWorkerOnboardingCourseDb(supabase, organizationId, courseId),
          "Onboarding course updated",
          "Could not update onboarding course",
        );
      },
      addCandidate: input => {
        if (!organizationId) return Promise.resolve(false);
        return mutate(
          () =>
            createWorkerCandidateDb(supabase, {
              ...input,
              organizationId,
            }),
          "Candidate added",
          "Could not add candidate",
          { refreshRelated: true },
        );
      },
      updateTargetMinistry: (candidateId, ministryId) =>
        mutate(
          () =>
            updateWorkerCandidateTargetDb(supabase, candidateId, ministryId),
          "Target ministry updated",
          "Could not update target ministry",
        ),
      submitCandidate: candidateId =>
        mutate(
          () => submitWorkerCandidateDb(supabase, candidateId),
          "Candidate submitted for approval",
          "Could not submit candidate",
        ),
      approveCandidate: candidateId =>
        mutate(
          () => approveWorkerCandidateDb(supabase, candidateId),
          "Candidate approved",
          "Could not approve candidate",
        ),
      returnCandidate: (candidateId, returnNote) =>
        mutate(
          () => returnWorkerCandidateDb(supabase, candidateId, returnNote),
          "Candidate returned to training",
          "Could not return candidate",
        ),
      deployCandidate: input =>
        mutate(
          () => deployWorkerCandidateDb(supabase, input),
          "Candidate deployed",
          "Could not deploy candidate",
          { refreshRelated: true },
        ),
      removeCandidate: candidateId =>
        mutate(
          () => removeWorkerCandidateDb(supabase, candidateId),
          "Candidate removed",
          "Could not remove candidate",
        ),
    }),
    [
      candidates,
      config,
      hydrated,
      isAdmin,
      isSaving,
      mutate,
      organizationId,
      refreshOnboarding,
      supabase,
    ],
  );

  return (
    <WorkerOnboardingContext.Provider value={value}>
      {children}
    </WorkerOnboardingContext.Provider>
  );
}

export function useWorkerOnboarding() {
  const context = useContext(WorkerOnboardingContext);
  if (!context) {
    throw new Error(
      "useWorkerOnboarding must be used within WorkerOnboardingProvider",
    );
  }
  return context;
}
