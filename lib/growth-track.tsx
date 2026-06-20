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
  fetchGrowthTrackActivities,
  logGrowthTrackActivity,
  updatePersonEvangelismStage,
  type GrowthTrackActivity,
} from "@/lib/supabase/growth-track";
import { removeCellGroupMember } from "@/lib/supabase/cell-groups";
import { buildGrowthTrackPeople } from "@/lib/growth-track/build-people";
import {
  buildGrowthTrackOverview,
  type GrowthTrackOverview,
} from "@/lib/growth-track/overview";
import type { GrowthTrackPerson, FollowUpMethod } from "@/lib/growth-track/types";
import type { EvangelismStage } from "@/lib/people";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { useDiscipleship } from "@/lib/discipleship";
import { useServiceAttendance } from "@/lib/service-attendance";

export type GrowthTrackActionType =
  | "complete_follow_up"
  | "move_to_follow_up"
  | "assign_cell_group"
  | "assign_life_group"
  | "enroll_discipleship"
  | "log_visitation"
  | "log_contact"
  | "advance_to_worker";

type GrowthTrackContextValue = {
  growthPeople: GrowthTrackPerson[];
  activities: GrowthTrackActivity[];
  overview: GrowthTrackOverview;
  hydrated: boolean;
  isSaving: boolean;
  refreshGrowthTrack: () => Promise<void>;
  completeFollowUp: (
    personId: string,
    method: FollowUpMethod,
    notes?: string,
  ) => Promise<boolean>;
  moveToFollowUp: (personId: string) => Promise<boolean>;
  assignToCellGroup: (
    personId: string,
    cellGroupId: string,
  ) => Promise<boolean>;
  assignToLifeGroup: (
    personId: string,
    lifeGroupId: string,
  ) => Promise<boolean>;
  enrollInDiscipleship: (
    personId: string,
    trackId: string,
  ) => Promise<boolean>;
  logOutreach: (
    personId: string,
    type: "contact" | "visitation" | "follow_up_call",
    notes?: string,
  ) => Promise<boolean>;
  advanceStage: (
    personId: string,
    stage: EvangelismStage,
    notes?: string,
  ) => Promise<boolean>;
};

const GrowthTrackContext = createContext<GrowthTrackContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function GrowthTrackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const { people, updatePerson, refreshPeople, hydrated: peopleHydrated } =
    usePeople();
  const {
    cellGroups,
    cellGroupMembers,
    lifeGroups,
    lifeGroupMembers,
    assignCellGroupMember,
    assignLifeGroupMember,
    refreshGroupsMinistry,
    hydrated: groupsHydrated,
  } = useGroupsMinistry();
  const {
    tracks,
    enrollments,
    enrollPerson,
    refreshDiscipleship,
    hydrated: discipleshipHydrated,
  } = useDiscipleship();
  const {
    attendanceRows,
    refreshAttendance,
    hydrated: attendanceHydrated,
  } = useServiceAttendance();

  const [activities, setActivities] = useState<GrowthTrackActivity[]>([]);
  const [localHydrated, setLocalHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getPersonCellGroup = useCallback(
    (personId: string) => {
      const membership = cellGroupMembers.find(m => m.personId === personId);
      if (!membership) return undefined;
      const group = cellGroups.find(g => g.id === membership.cellGroupId);
      return { ...membership, group };
    },
    [cellGroupMembers, cellGroups],
  );

  const growthPeople = useMemo(
    () =>
      buildGrowthTrackPeople({
        people,
        activities,
        cellGroupMembers,
        cellGroups,
        lifeGroupMembers,
        discipleshipEnrollments: enrollments,
        getPersonCellGroup,
      }),
    [
      people,
      activities,
      cellGroupMembers,
      cellGroups,
      lifeGroupMembers,
      enrollments,
      getPersonCellGroup,
    ],
  );

  const overview = useMemo(
    () => buildGrowthTrackOverview(growthPeople, attendanceRows),
    [growthPeople, attendanceRows],
  );

  const hydrated =
    localHydrated &&
    peopleHydrated &&
    groupsHydrated &&
    discipleshipHydrated &&
    attendanceHydrated;

  const refreshGrowthTrack = useCallback(async () => {
    if (!organizationId) {
      setActivities([]);
      setLocalHydrated(!tenantLoading);
      return;
    }

    try {
      const activityData = await fetchGrowthTrackActivities(
        supabase,
        organizationId,
      );
      setActivities(activityData);
    } catch (error) {
      toast.error("Failed to load growth track", {
        description: getErrorMessage(error),
      });
    } finally {
      setLocalHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshGrowthTrack();
  }, [refreshGrowthTrack]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshGrowthTrack(),
      refreshPeople(),
      refreshGroupsMinistry(),
      refreshDiscipleship(),
      refreshAttendance(),
    ]);
  }, [
    refreshGrowthTrack,
    refreshPeople,
    refreshGroupsMinistry,
    refreshDiscipleship,
    refreshAttendance,
  ]);

  const advanceStage = useCallback(
    async (personId: string, stage: EvangelismStage, notes?: string) => {
      if (!organizationId) return false;

      const person = people.find(p => p.id === personId);
      if (!person) return false;

      setIsSaving(true);
      try {
        await updatePersonEvangelismStage(
          supabase,
          organizationId,
          personId,
          stage,
        );
        await logGrowthTrackActivity(supabase, organizationId, {
          personId,
          activityType: "stage_advance",
          notes,
          fromStage: person.evangelismStage,
          toStage: stage,
        });
        await refreshAll();
        return true;
      } catch (error) {
        toast.error("Failed to update stage", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, people, supabase, refreshAll],
  );

  const completeFollowUp = useCallback(
    async (personId: string, method: FollowUpMethod, notes?: string) => {
      if (!organizationId) return false;

      const person = people.find(p => p.id === personId);
      if (!person) return false;

      const methodLabels: Record<FollowUpMethod, string> = {
        text_message: "Text message",
        phone_call: "Phone call",
        in_person: "In person",
        social_media: "Social media",
        other: "Other",
      };

      const activityType =
        method === "phone_call" || method === "in_person"
          ? "follow_up_call"
          : "follow_up_message";

      const noteParts = [methodLabels[method]];
      if (notes?.trim()) noteParts.push(notes.trim());
      const noteText = noteParts.join(" — ");

      setIsSaving(true);
      try {
        let nextStage: EvangelismStage = person.evangelismStage;

        if (person.evangelismStage === "First-time Attendee") {
          nextStage = "Follow-up";
        } else if (person.evangelismStage === "Follow-up") {
          nextStage = "Small Group";
        }

        await logGrowthTrackActivity(supabase, organizationId, {
          personId,
          activityType,
          notes: noteText,
          fromStage: person.evangelismStage,
          toStage: nextStage,
        });

        if (nextStage !== person.evangelismStage) {
          await updatePersonEvangelismStage(
            supabase,
            organizationId,
            personId,
            nextStage,
          );
        }

        if (
          person.evangelismStage === "First-time Attendee" &&
          (person.membershipType === "For Evangelism" ||
            person.membershipType === "Prospect")
        ) {
          await updatePerson(personId, { membershipType: "Attender" });
        }

        const stageMessages: Partial<Record<EvangelismStage, string>> = {
          "Follow-up": `${person.name} moved to Follow-up.`,
          "Small Group": `${person.name} graduated from Follow-up to Small Group.`,
        };

        toast.success("Follow-up logged", {
          description:
            stageMessages[nextStage] ?? `${person.name} follow-up recorded.`,
        });
        await refreshAll();
        return true;
      } catch (error) {
        toast.error("Failed to log follow-up", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, people, supabase, updatePerson, refreshAll],
  );

  const moveToFollowUp = useCallback(
    async (personId: string) => {
      return advanceStage(personId, "Follow-up", "Moved to follow-up stage");
    },
    [advanceStage],
  );

  const assignToCellGroup = useCallback(
    async (personId: string, cellGroupId: string) => {
      const person = people.find(p => p.id === personId);
      if (!person || !organizationId) return false;

      setIsSaving(true);
      try {
        const existingMembership = cellGroupMembers.find(
          m => m.personId === personId,
        );

        if (existingMembership?.cellGroupId === cellGroupId) {
          await logGrowthTrackActivity(supabase, organizationId, {
            personId,
            activityType: "group_placement",
            notes: "Already assigned to this cell group",
            fromStage: person.evangelismStage,
            toStage: "Small Group",
            cellGroupId,
          });

          if (person.evangelismStage !== "Small Group") {
            await updatePersonEvangelismStage(
              supabase,
              organizationId,
              personId,
              "Small Group",
            );
          }

          toast.success("Already in this cell group");
          await refreshAll();
          return true;
        }

        if (existingMembership) {
          await removeCellGroupMember(supabase, existingMembership.id);
        }

        const membership = await assignCellGroupMember(
          cellGroupId,
          personId,
          "Member",
        );
        if (!membership) return false;

        await logGrowthTrackActivity(supabase, organizationId, {
          personId,
          activityType: "group_placement",
          notes: `Assigned to cell group`,
          fromStage: person.evangelismStage,
          toStage: "Small Group",
          cellGroupId,
        });

        await updatePersonEvangelismStage(
          supabase,
          organizationId,
          personId,
          "Small Group",
        );

        toast.success("Assigned to cell group");
        await refreshAll();
        return true;
      } catch (error) {
        toast.error("Failed to assign cell group", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [
      people,
      organizationId,
      cellGroupMembers,
      assignCellGroupMember,
      supabase,
      refreshAll,
    ],
  );

  const assignToLifeGroup = useCallback(
    async (personId: string, lifeGroupId: string) => {
      if (!organizationId) return false;

      setIsSaving(true);
      try {
        const membership = await assignLifeGroupMember(lifeGroupId, personId);
        if (!membership) return false;

        await logGrowthTrackActivity(supabase, organizationId, {
          personId,
          activityType: "group_placement",
          notes: "Assigned to life group",
          lifeGroupId,
        });

        toast.success("Assigned to life group");
        await refreshAll();
        return true;
      } catch (error) {
        toast.error("Failed to assign life group", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, assignLifeGroupMember, supabase, refreshAll],
  );

  const enrollInDiscipleship = useCallback(
    async (personId: string, trackId: string) => {
      if (!organizationId) return false;

      const person = people.find(p => p.id === personId);
      if (!person) return false;

      setIsSaving(true);
      try {
        const enrollment = await enrollPerson({
          trackId,
          personId,
          role: "Learner",
        });
        if (!enrollment) return false;

        await logGrowthTrackActivity(supabase, organizationId, {
          personId,
          activityType: "stage_advance",
          notes: "Enrolled in discipleship track",
          fromStage: person.evangelismStage,
          toStage: "Discipleship",
        });

        await updatePersonEvangelismStage(
          supabase,
          organizationId,
          personId,
          "Discipleship",
        );

        toast.success("Enrolled in discipleship");
        await refreshAll();
        return true;
      } catch (error) {
        toast.error("Failed to enroll", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, people, enrollPerson, supabase, refreshAll],
  );

  const logOutreach = useCallback(
    async (
      personId: string,
      type: "contact" | "visitation" | "follow_up_call",
      notes?: string,
    ) => {
      if (!organizationId) return false;

      setIsSaving(true);
      try {
        await logGrowthTrackActivity(supabase, organizationId, {
          personId,
          activityType: type,
          notes,
        });
        toast.success("Outreach logged");
        await refreshGrowthTrack();
        return true;
      } catch (error) {
        toast.error("Failed to log outreach", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase, refreshGrowthTrack],
  );

  const value = useMemo(
    () => ({
      growthPeople,
      activities,
      overview,
      hydrated,
      isSaving,
      refreshGrowthTrack,
      completeFollowUp,
      moveToFollowUp,
      assignToCellGroup,
      assignToLifeGroup,
      enrollInDiscipleship,
      logOutreach,
      advanceStage,
    }),
    [
      growthPeople,
      activities,
      overview,
      hydrated,
      isSaving,
      refreshGrowthTrack,
      completeFollowUp,
      moveToFollowUp,
      assignToCellGroup,
      assignToLifeGroup,
      enrollInDiscipleship,
      logOutreach,
      advanceStage,
    ],
  );

  return (
    <GrowthTrackContext.Provider value={value}>
      {children}
    </GrowthTrackContext.Provider>
  );
}

export function useGrowthTrack() {
  const context = useContext(GrowthTrackContext);
  if (!context) {
    throw new Error("useGrowthTrack must be used within GrowthTrackProvider");
  }
  return context;
}

export function useGrowthTrackOptional() {
  return useContext(GrowthTrackContext);
}
