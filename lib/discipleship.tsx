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
  createDiscipleshipTrack,
  createMilestone,
  deleteDiscipleshipTrack,
  deleteMilestone,
  enrollInTrack,
  fetchDiscipleshipEnrollments,
  fetchDiscipleshipMilestoneCompletions,
  fetchDiscipleshipMilestones,
  fetchDiscipleshipTracks,
  removeEnrollment,
  syncEnrollmentCompletion,
  toggleMilestoneCompletion,
  updateDiscipleshipTrack,
  updateMilestoneSortOrder,
  type CreateDiscipleshipTrackInput,
  type UpdateDiscipleshipTrackInput,
  type CreateMilestoneInput,
  type DiscipleshipBadge,
  type DiscipleshipEnrollment,
  type DiscipleshipMilestone,
  type DiscipleshipMilestoneCompletion,
  type DiscipleshipRole,
  type DiscipleshipTrack,
  type DiscipleshipTrackStatus,
  type EnrollInTrackInput,
} from "@/lib/supabase/discipleship";

export type PersonDiscipleshipRole = "Learner" | "Guide" | "Both" | null;

type DiscipleshipContextValue = {
  tracks: DiscipleshipTrack[];
  enrollments: DiscipleshipEnrollment[];
  milestones: DiscipleshipMilestone[];
  milestoneCompletions: DiscipleshipMilestoneCompletion[];
  hydrated: boolean;
  isSaving: boolean;
  refreshDiscipleship: () => Promise<void>;
  addTrack: (input: CreateDiscipleshipTrackInput) => Promise<DiscipleshipTrack | null>;
  updateTrack: (
    input: UpdateDiscipleshipTrackInput,
  ) => Promise<DiscipleshipTrack | null>;
  removeTrack: (trackId: string) => Promise<boolean>;
  enrollPerson: (input: EnrollInTrackInput) => Promise<DiscipleshipEnrollment | null>;
  removeEnrollmentById: (enrollmentId: string) => Promise<boolean>;
  toggleMilestone: (
    enrollmentId: string,
    milestoneId: string,
    completedByPersonId: string | null,
  ) => Promise<boolean>;
  addMilestone: (input: CreateMilestoneInput) => Promise<DiscipleshipMilestone | null>;
  removeMilestoneById: (milestoneId: string) => Promise<boolean>;
  moveMilestone: (trackId: string, milestoneId: string, direction: "up" | "down") => Promise<boolean>;
  getTrackEnrollments: (trackId: string) => DiscipleshipEnrollment[];
  getTrackMilestones: (trackId: string) => DiscipleshipMilestone[];
  getEnrollmentProgress: (enrollmentId: string) => {
    completed: number;
    total: number;
    percent: number;
  };
  getPersonDiscipleshipRoles: (personId: string) => PersonDiscipleshipRole;
  getPersonBadges: (personId: string) => DiscipleshipBadge[];
};

const DiscipleshipContext = createContext<DiscipleshipContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function DiscipleshipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [tracks, setTracks] = useState<DiscipleshipTrack[]>([]);
  const [enrollments, setEnrollments] = useState<DiscipleshipEnrollment[]>([]);
  const [milestones, setMilestones] = useState<DiscipleshipMilestone[]>([]);
  const [milestoneCompletions, setMilestoneCompletions] = useState<
    DiscipleshipMilestoneCompletion[]
  >([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshDiscipleship = useCallback(async () => {
    if (!organizationId) {
      setTracks([]);
      setEnrollments([]);
      setMilestones([]);
      setMilestoneCompletions([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [trackData, enrollmentData, milestoneData, completionData] =
        await Promise.all([
          fetchDiscipleshipTracks(supabase, organizationId),
          fetchDiscipleshipEnrollments(supabase, organizationId),
          fetchDiscipleshipMilestones(supabase, organizationId),
          fetchDiscipleshipMilestoneCompletions(supabase, organizationId),
        ]);

      setTracks(trackData);
      setEnrollments(enrollmentData);
      setMilestones(milestoneData);
      setMilestoneCompletions(completionData);
    } catch (error) {
      toast.error("Failed to load discipleship data", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    if (tenantLoading) return;
    void refreshDiscipleship();
  }, [refreshDiscipleship, tenantLoading]);

  const addTrack = useCallback(
    async (input: CreateDiscipleshipTrackInput): Promise<DiscipleshipTrack | null> => {
      if (!organizationId) {
        toast.error("No organization found");
        return null;
      }

      setIsSaving(true);
      try {
        const track = await createDiscipleshipTrack(supabase, organizationId, input);
        await refreshDiscipleship();
        toast.success("Discipleship track created", {
          description: `${track.name} was added.`,
        });
        return track;
      } catch (error) {
        toast.error("Failed to create track", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshDiscipleship, supabase],
  );

  const updateTrack = useCallback(
    async (input: UpdateDiscipleshipTrackInput): Promise<DiscipleshipTrack | null> => {
      setIsSaving(true);
      try {
        const track = await updateDiscipleshipTrack(supabase, input);
        await refreshDiscipleship();
        toast.success("Program updated");
        return track;
      } catch (error) {
        toast.error("Failed to update program", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshDiscipleship, supabase],
  );

  const removeTrack = useCallback(
    async (trackId: string): Promise<boolean> => {
      const track = tracks.find(t => t.id === trackId);
      if (track?.isDefault) {
        toast.error("Cannot delete default program", {
          description: "Built-in discipleship programs cannot be removed.",
        });
        return false;
      }

      setIsSaving(true);
      try {
        await deleteDiscipleshipTrack(supabase, trackId);
        await refreshDiscipleship();
        toast.success("Program removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove program", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshDiscipleship, supabase, tracks],
  );

  const enrollPerson = useCallback(
    async (input: EnrollInTrackInput): Promise<DiscipleshipEnrollment | null> => {
      setIsSaving(true);
      try {
        const enrollment = await enrollInTrack(supabase, input);
        await refreshDiscipleship();
        toast.success("Person enrolled in track");
        return enrollment;
      } catch (error) {
        toast.error("Failed to enroll person", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshDiscipleship, supabase],
  );

  const removeEnrollmentById = useCallback(
    async (enrollmentId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await removeEnrollment(supabase, enrollmentId);
        await refreshDiscipleship();
        toast.success("Enrollment removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove enrollment", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshDiscipleship, supabase],
  );

  const toggleMilestone = useCallback(
    async (
      enrollmentId: string,
      milestoneId: string,
      completedByPersonId: string | null,
    ): Promise<boolean> => {
      const enrollment = enrollments.find(e => e.id === enrollmentId);
      const existing = milestoneCompletions.find(
        c => c.enrollmentId === enrollmentId && c.milestoneId === milestoneId,
      );

      setIsSaving(true);
      try {
        await toggleMilestoneCompletion(
          supabase,
          enrollmentId,
          milestoneId,
          completedByPersonId,
          existing?.id,
        );

        if (enrollment) {
          const trackMilestoneIds = milestones
            .filter(m => m.trackId === enrollment.trackId)
            .map(m => m.id);
          const completedMilestoneIds = milestoneCompletions
            .filter(c => c.enrollmentId === enrollmentId)
            .map(c => c.milestoneId)
            .filter(id => !(existing && id === milestoneId));

          if (!existing) {
            completedMilestoneIds.push(milestoneId);
          }

          const wasComplete = enrollment.status === "completed";
          const updated = await syncEnrollmentCompletion(
            supabase,
            enrollmentId,
            trackMilestoneIds,
            completedMilestoneIds,
          );

          await refreshDiscipleship();

          if (
            updated?.status === "completed" &&
            !wasComplete &&
            trackMilestoneIds.length > 0
          ) {
            const track = tracks.find(t => t.id === enrollment.trackId);
            toast.success("Badge earned!", {
              description: `${track?.name ?? "Track"} completed.`,
            });
          }
        } else {
          await refreshDiscipleship();
        }

        return true;
      } catch (error) {
        toast.error("Failed to update milestone", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [
      enrollments,
      milestoneCompletions,
      milestones,
      refreshDiscipleship,
      supabase,
      tracks,
    ],
  );

  const addMilestone = useCallback(
    async (input: CreateMilestoneInput): Promise<DiscipleshipMilestone | null> => {
      const trackMilestones = milestones.filter(m => m.trackId === input.trackId);
      const nextSortOrder =
        input.sortOrder ??
        (trackMilestones.length > 0
          ? Math.max(...trackMilestones.map(m => m.sortOrder)) + 1
          : 1);

      setIsSaving(true);
      try {
        const milestone = await createMilestone(supabase, {
          ...input,
          sortOrder: nextSortOrder,
        });
        await refreshDiscipleship();
        toast.success("Milestone added");
        return milestone;
      } catch (error) {
        toast.error("Failed to add milestone", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [milestones, refreshDiscipleship, supabase],
  );

  const removeMilestoneById = useCallback(
    async (milestoneId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await deleteMilestone(supabase, milestoneId);
        await refreshDiscipleship();
        toast.success("Milestone removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove milestone", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshDiscipleship, supabase],
  );

  const moveMilestone = useCallback(
    async (
      trackId: string,
      milestoneId: string,
      direction: "up" | "down",
    ): Promise<boolean> => {
      const trackMilestones = milestones
        .filter(m => m.trackId === trackId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const index = trackMilestones.findIndex(m => m.id === milestoneId);
      const swapIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || swapIndex < 0 || swapIndex >= trackMilestones.length) {
        return false;
      }

      const current = trackMilestones[index];
      const adjacent = trackMilestones[swapIndex];

      setIsSaving(true);
      try {
        await Promise.all([
          updateMilestoneSortOrder(supabase, current.id, adjacent.sortOrder),
          updateMilestoneSortOrder(supabase, adjacent.id, current.sortOrder),
        ]);
        await refreshDiscipleship();
        return true;
      } catch (error) {
        toast.error("Failed to reorder milestone", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [milestones, refreshDiscipleship, supabase],
  );

  const getTrackEnrollments = useCallback(
    (trackId: string) =>
      enrollments.filter(
        e => e.trackId === trackId && e.status !== "paused",
      ),
    [enrollments],
  );

  const getTrackMilestones = useCallback(
    (trackId: string) =>
      milestones
        .filter(m => m.trackId === trackId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [milestones],
  );

  const getEnrollmentProgress = useCallback(
    (enrollmentId: string) => {
      const enrollment = enrollments.find(e => e.id === enrollmentId);
      if (!enrollment) {
        return { completed: 0, total: 0, percent: 0 };
      }

      const trackMilestones = milestones.filter(
        m => m.trackId === enrollment.trackId,
      );
      const completed = milestoneCompletions.filter(
        c => c.enrollmentId === enrollmentId,
      ).length;
      const total = trackMilestones.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percent };
    },
    [enrollments, milestones, milestoneCompletions],
  );

  const getPersonDiscipleshipRoles = useCallback(
    (personId: string): PersonDiscipleshipRole => {
      const active = enrollments.filter(
        e => e.personId === personId && e.status === "active",
      );
      const isLearner = active.some(e => e.role === "Learner");
      const isGuide = active.some(e => e.role === "Guide");

      if (isLearner && isGuide) return "Both";
      if (isLearner) return "Learner";
      if (isGuide) return "Guide";
      return null;
    },
    [enrollments],
  );

  const getPersonBadges = useCallback(
    (personId: string): DiscipleshipBadge[] =>
      enrollments
        .filter(
          e =>
            e.personId === personId &&
            e.role === "Learner" &&
            e.status === "completed" &&
            e.completedAt,
        )
        .map(e => {
          const track = tracks.find(t => t.id === e.trackId);
          return {
            enrollmentId: e.id,
            trackId: e.trackId,
            trackName: track?.name ?? "Discipleship Track",
            category: track?.category ?? "Foundation",
            color: track?.color ?? "blue",
            earnedAt: e.completedAt!,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime(),
        ),
    [enrollments, tracks],
  );

  return (
    <DiscipleshipContext.Provider
      value={{
        tracks,
        enrollments,
        milestones,
        milestoneCompletions,
        hydrated,
        isSaving,
        refreshDiscipleship,
        addTrack,
        updateTrack,
        removeTrack,
        enrollPerson,
        removeEnrollmentById,
        toggleMilestone,
        addMilestone,
        removeMilestoneById,
        moveMilestone,
        getTrackEnrollments,
        getTrackMilestones,
        getEnrollmentProgress,
        getPersonDiscipleshipRoles,
        getPersonBadges,
      }}
    >
      {children}
    </DiscipleshipContext.Provider>
  );
}

export function useDiscipleship() {
  const ctx = useContext(DiscipleshipContext);
  if (!ctx) {
    throw new Error(
      "useDiscipleship must be used within a DiscipleshipProvider",
    );
  }
  return ctx;
}

export type { DiscipleshipRole, DiscipleshipTrack, DiscipleshipEnrollment, DiscipleshipBadge, DiscipleshipTrackStatus };
