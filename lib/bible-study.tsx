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
  createBibleStudyGroup,
  fetchBibleStudyGroups,
  fetchBibleStudyMembers,
  replaceBibleStudyLeader,
  setBibleStudyGroupMembers,
  updateBibleStudyStatus,
  type BibleStudyGroup,
  type BibleStudyMember,
  type BibleStudyStatus,
  type CreateBibleStudyGroupInput,
} from "@/lib/supabase/bible-study";

type BibleStudyContextValue = {
  groups: BibleStudyGroup[];
  members: BibleStudyMember[];
  hydrated: boolean;
  isSaving: boolean;
  refreshBibleStudy: () => Promise<void>;
  addGroup: (input: CreateBibleStudyGroupInput) => Promise<BibleStudyGroup | null>;
  updateGroupStatus: (
    groupId: string,
    status: BibleStudyStatus,
    statusNotes?: string,
  ) => Promise<BibleStudyGroup | null>;
  updateGroupMembers: (
    groupId: string,
    personIds: string[],
    personHouseholdById: Map<string, string | null>,
  ) => Promise<boolean>;
  replaceGroupLeader: (
    groupId: string,
    newLeaderPersonId: string,
    personHouseholdById: Map<string, string | null>,
  ) => Promise<boolean>;
  getGroupMembers: (groupId: string) => BibleStudyMember[];
  getHouseholdBibleStudy: (householdId: string) => BibleStudyGroup | undefined;
  getActiveHouseholdIds: () => Set<string>;
};

const BibleStudyContext = createContext<BibleStudyContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function BibleStudyProvider({ children }: { children: React.ReactNode }) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [groups, setGroups] = useState<BibleStudyGroup[]>([]);
  const [members, setMembers] = useState<BibleStudyMember[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshBibleStudy = useCallback(async () => {
    if (!organizationId) {
      setGroups([]);
      setMembers([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [groupData, memberData] = await Promise.all([
        fetchBibleStudyGroups(supabase, organizationId),
        fetchBibleStudyMembers(supabase, organizationId),
      ]);

      setGroups(groupData);
      setMembers(memberData);
    } catch (error) {
      toast.error("Failed to load Bible study data", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshBibleStudy();
  }, [refreshBibleStudy]);

  const addGroup = useCallback(
    async (input: CreateBibleStudyGroupInput): Promise<BibleStudyGroup | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        const group = await createBibleStudyGroup(supabase, organizationId, input);
        const memberData = await fetchBibleStudyMembers(supabase, organizationId);
        setGroups(prev => [group, ...prev]);
        setMembers(memberData);
        toast.success("Bible study group created");
        return group;
      } catch (error) {
        toast.error("Failed to create Bible study group", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const updateGroupStatus = useCallback(
    async (
      groupId: string,
      status: BibleStudyStatus,
      statusNotes?: string,
    ): Promise<BibleStudyGroup | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        const updated = await updateBibleStudyStatus(supabase, organizationId, {
          groupId,
          status,
          statusNotes,
        });
        setGroups(prev => prev.map(g => (g.id === groupId ? updated : g)));
        const label =
          status === "completed"
            ? "marked as completed"
            : status === "paused"
              ? "paused"
              : status === "cancelled"
                ? "cancelled"
                : "reactivated";
        toast.success(`Bible study ${label}`);
        return updated;
      } catch (error) {
        toast.error("Failed to update Bible study status", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const updateGroupMembers = useCallback(
    async (
      groupId: string,
      personIds: string[],
      personHouseholdById: Map<string, string | null>,
    ): Promise<boolean> => {
      const group = groups.find(g => g.id === groupId);
      if (!group) return false;

      setIsSaving(true);
      try {
        const updatedMembers = await setBibleStudyGroupMembers(
          supabase,
          group,
          personIds,
          personHouseholdById,
        );
        setMembers(prev => [
          ...prev.filter(m => m.bibleStudyGroupId !== groupId),
          ...updatedMembers,
        ]);
        toast.success("Members updated");
        return true;
      } catch (error) {
        toast.error("Failed to update members", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [groups, supabase],
  );

  const replaceGroupLeader = useCallback(
    async (
      groupId: string,
      newLeaderPersonId: string,
      personHouseholdById: Map<string, string | null>,
    ): Promise<boolean> => {
      const group = groups.find(g => g.id === groupId);
      if (!organizationId || !group) return false;

      setIsSaving(true);
      try {
        const result = await replaceBibleStudyLeader(
          supabase,
          organizationId,
          group,
          newLeaderPersonId,
          personHouseholdById,
        );
        setGroups(prev =>
          prev.map(g => (g.id === groupId ? result.group : g)),
        );
        setMembers(prev => [
          ...prev.filter(m => m.bibleStudyGroupId !== groupId),
          ...result.members,
        ]);
        toast.success("Bible study leader updated");
        return true;
      } catch (error) {
        toast.error("Failed to replace leader", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [groups, organizationId, supabase],
  );

  const getGroupMembers = useCallback(
    (groupId: string) => members.filter(m => m.bibleStudyGroupId === groupId),
    [members],
  );

  const getHouseholdBibleStudy = useCallback(
    (householdId: string) =>
      groups.find(g => g.householdId === householdId && g.status === "active"),
    [groups],
  );

  const getActiveHouseholdIds = useCallback(
    () => new Set(groups.filter(g => g.status === "active").map(g => g.householdId)),
    [groups],
  );

  const value = useMemo(
    () => ({
      groups,
      members,
      hydrated,
      isSaving,
      refreshBibleStudy,
      addGroup,
      updateGroupStatus,
      updateGroupMembers,
      replaceGroupLeader,
      getGroupMembers,
      getHouseholdBibleStudy,
      getActiveHouseholdIds,
    }),
    [
      groups,
      members,
      hydrated,
      isSaving,
      refreshBibleStudy,
      addGroup,
      updateGroupStatus,
      updateGroupMembers,
      replaceGroupLeader,
      getGroupMembers,
      getHouseholdBibleStudy,
      getActiveHouseholdIds,
    ],
  );

  return (
    <BibleStudyContext.Provider value={value}>{children}</BibleStudyContext.Provider>
  );
}

export function useBibleStudy() {
  const context = useContext(BibleStudyContext);
  if (!context) {
    throw new Error("useBibleStudy must be used within a BibleStudyProvider");
  }
  return context;
}
