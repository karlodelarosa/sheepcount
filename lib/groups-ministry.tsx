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
  addCellGroupMember,
  createCellGroup,
  fetchCellGroupMembers,
  fetchCellGroups,
  removeCellGroupMember,
  type CellGroup,
  type CellGroupMember,
  type CreateCellGroupInput,
} from "@/lib/supabase/cell-groups";
import {
  addLifeGroupMember,
  createLifeGroup,
  fetchLifeGroupMembers,
  fetchLifeGroups,
  removeLifeGroupMember,
  type CreateLifeGroupInput,
  type LifeGroup,
  type LifeGroupMember,
} from "@/lib/supabase/life-groups";
import {
  addWorkMinistryMember,
  fetchWorkMinistries,
  fetchWorkMinistryMembers,
  removeWorkMinistryMember,
  type WorkMinistry,
  type WorkMinistryMember,
} from "@/lib/supabase/work-ministries";

type GroupsMinistryContextValue = {
  lifeGroups: LifeGroup[];
  lifeGroupMembers: LifeGroupMember[];
  workMinistries: WorkMinistry[];
  workMinistryMembers: WorkMinistryMember[];
  cellGroups: CellGroup[];
  cellGroupMembers: CellGroupMember[];
  hydrated: boolean;
  isSaving: boolean;
  refreshGroupsMinistry: () => Promise<void>;
  addLifeGroup: (input: CreateLifeGroupInput) => Promise<LifeGroup | null>;
  assignLifeGroupMember: (
    lifeGroupId: string,
    personId: string,
  ) => Promise<LifeGroupMember | null>;
  removeLifeGroupMemberById: (membershipId: string) => Promise<boolean>;
  assignWorkMinistryMember: (
    ministryId: string,
    personId: string,
    role: string,
  ) => Promise<WorkMinistryMember | null>;
  removeWorkMinistryMemberById: (membershipId: string) => Promise<boolean>;
  addCellGroup: (input: CreateCellGroupInput) => Promise<CellGroup | null>;
  assignCellGroupMember: (
    cellGroupId: string,
    personId: string,
    role?: "Leader" | "Member",
  ) => Promise<CellGroupMember | null>;
  removeCellGroupMemberById: (membershipId: string) => Promise<boolean>;
  getPersonMinistries: (
    personId: string,
  ) => (WorkMinistryMember & { ministry?: WorkMinistry })[];
  getPersonLifeGroups: (
    personId: string,
  ) => (LifeGroupMember & { group?: LifeGroup })[];
  getPersonCellGroup: (
    personId: string,
  ) => (CellGroupMember & { group?: CellGroup }) | undefined;
};

const GroupsMinistryContext = createContext<GroupsMinistryContextValue | null>(
  null,
);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function GroupsMinistryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [lifeGroups, setLifeGroups] = useState<LifeGroup[]>([]);
  const [lifeGroupMembers, setLifeGroupMembers] = useState<LifeGroupMember[]>(
    [],
  );
  const [workMinistries, setWorkMinistries] = useState<WorkMinistry[]>([]);
  const [workMinistryMembers, setWorkMinistryMembers] = useState<
    WorkMinistryMember[]
  >([]);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [cellGroupMembers, setCellGroupMembers] = useState<CellGroupMember[]>(
    [],
  );
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshGroupsMinistry = useCallback(async () => {
    if (!organizationId) {
      setLifeGroups([]);
      setLifeGroupMembers([]);
      setWorkMinistries([]);
      setWorkMinistryMembers([]);
      setCellGroups([]);
      setCellGroupMembers([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [groups, groupMembers, ministries, ministryMembers, cells, cellMembers] =
        await Promise.all([
          fetchLifeGroups(supabase, organizationId),
          fetchLifeGroupMembers(supabase, organizationId),
          fetchWorkMinistries(supabase, organizationId),
          fetchWorkMinistryMembers(supabase, organizationId),
          fetchCellGroups(supabase, organizationId),
          fetchCellGroupMembers(supabase, organizationId),
        ]);

      setLifeGroups(groups);
      setLifeGroupMembers(groupMembers);
      setWorkMinistries(ministries);
      setWorkMinistryMembers(ministryMembers);
      setCellGroups(cells);
      setCellGroupMembers(cellMembers);
    } catch (error) {
      toast.error("Failed to load groups and ministries", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    if (tenantLoading) return;
    void refreshGroupsMinistry();
  }, [refreshGroupsMinistry, tenantLoading]);

  const addLifeGroup = useCallback(
    async (input: CreateLifeGroupInput): Promise<LifeGroup | null> => {
      if (!organizationId) {
        toast.error("No organization found");
        return null;
      }

      setIsSaving(true);
      try {
        const group = await createLifeGroup(supabase, organizationId, input);
        await refreshGroupsMinistry();
        toast.success("Life group created", {
          description: `${group.name} was added.`,
        });
        return group;
      } catch (error) {
        toast.error("Failed to create life group", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshGroupsMinistry, supabase],
  );

  const assignLifeGroupMember = useCallback(
    async (
      lifeGroupId: string,
      personId: string,
    ): Promise<LifeGroupMember | null> => {
      setIsSaving(true);
      try {
        const member = await addLifeGroupMember(supabase, lifeGroupId, personId);
        await refreshGroupsMinistry();
        toast.success("Member added to life group");
        return member;
      } catch (error) {
        toast.error("Failed to add member", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const removeLifeGroupMemberById = useCallback(
    async (membershipId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await removeLifeGroupMember(supabase, membershipId);
        await refreshGroupsMinistry();
        toast.success("Member removed from life group");
        return true;
      } catch (error) {
        toast.error("Failed to remove member", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const assignWorkMinistryMember = useCallback(
    async (
      ministryId: string,
      personId: string,
      role: string,
    ): Promise<WorkMinistryMember | null> => {
      setIsSaving(true);
      try {
        const member = await addWorkMinistryMember(
          supabase,
          ministryId,
          personId,
          role,
        );
        await refreshGroupsMinistry();
        toast.success("Assigned to ministry");
        return member;
      } catch (error) {
        toast.error("Failed to assign to ministry", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const removeWorkMinistryMemberById = useCallback(
    async (membershipId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await removeWorkMinistryMember(supabase, membershipId);
        await refreshGroupsMinistry();
        toast.success("Removed from ministry");
        return true;
      } catch (error) {
        toast.error("Failed to remove from ministry", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const addCellGroup = useCallback(
    async (input: CreateCellGroupInput): Promise<CellGroup | null> => {
      if (!organizationId) {
        toast.error("No organization found");
        return null;
      }

      setIsSaving(true);
      try {
        const group = await createCellGroup(supabase, organizationId, input);
        await refreshGroupsMinistry();
        toast.success("Cell group created", {
          description: `${group.name} was added.`,
        });
        return group;
      } catch (error) {
        toast.error("Failed to create cell group", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshGroupsMinistry, supabase],
  );

  const assignCellGroupMember = useCallback(
    async (
      cellGroupId: string,
      personId: string,
      role: "Leader" | "Member" = "Member",
    ): Promise<CellGroupMember | null> => {
      setIsSaving(true);
      try {
        const member = await addCellGroupMember(
          supabase,
          cellGroupId,
          personId,
          role,
        );
        await refreshGroupsMinistry();
        toast.success("Member added to cell group");
        return member;
      } catch (error) {
        toast.error("Failed to add member", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const removeCellGroupMemberById = useCallback(
    async (membershipId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await removeCellGroupMember(supabase, membershipId);
        await refreshGroupsMinistry();
        toast.success("Member removed from cell group");
        return true;
      } catch (error) {
        toast.error("Failed to remove member", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const getPersonMinistries = useCallback(
    (personId: string) =>
      workMinistryMembers
        .filter(a => a.personId === personId)
        .map(a => ({
          ...a,
          ministry: workMinistries.find(m => m.id === a.ministryId),
        })),
    [workMinistryMembers, workMinistries],
  );

  const getPersonLifeGroups = useCallback(
    (personId: string) =>
      lifeGroupMembers
        .filter(m => m.personId === personId)
        .map(m => ({
          ...m,
          group: lifeGroups.find(g => g.id === m.lifeGroupId),
        })),
    [lifeGroupMembers, lifeGroups],
  );

  const getPersonCellGroup = useCallback(
    (personId: string) => {
      const membership = cellGroupMembers.find(m => m.personId === personId);
      if (!membership) return undefined;
      return {
        ...membership,
        group: cellGroups.find(g => g.id === membership.cellGroupId),
      };
    },
    [cellGroupMembers, cellGroups],
  );

  return (
    <GroupsMinistryContext.Provider
      value={{
        lifeGroups,
        lifeGroupMembers,
        workMinistries,
        workMinistryMembers,
        cellGroups,
        cellGroupMembers,
        hydrated,
        isSaving,
        refreshGroupsMinistry,
        addLifeGroup,
        assignLifeGroupMember,
        removeLifeGroupMemberById,
        assignWorkMinistryMember,
        removeWorkMinistryMemberById,
        addCellGroup,
        assignCellGroupMember,
        removeCellGroupMemberById,
        getPersonMinistries,
        getPersonLifeGroups,
        getPersonCellGroup,
      }}
    >
      {children}
    </GroupsMinistryContext.Provider>
  );
}

export function useGroupsMinistry() {
  const ctx = useContext(GroupsMinistryContext);
  if (!ctx) {
    throw new Error(
      "useGroupsMinistry must be used within a GroupsMinistryProvider",
    );
  }
  return ctx;
}
