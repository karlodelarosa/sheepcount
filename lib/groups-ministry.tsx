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
  updateCellGroupLeader,
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
  addWorkMinistryTeamRole,
  createWorkMinistry,
  createWorkMinistryTeam,
  deleteWorkMinistry,
  deleteWorkMinistryTeam,
  fetchWorkMinistries,
  fetchWorkMinistryMembers,
  fetchWorkMinistryTeamRoles,
  fetchWorkMinistryTeams,
  removeWorkMinistryMember,
  removeWorkMinistryTeamRole,
  updateWorkMinistryMember,
  updateWorkMinistryTeam,
  type CreateWorkMinistryInput,
  type CreateWorkMinistryTeamInput,
  type WorkMinistry,
  type WorkMinistryMember,
  type WorkMinistryTeam,
  type WorkMinistryTeamRole,
} from "@/lib/supabase/work-ministries";

type GroupsMinistryContextValue = {
  lifeGroups: LifeGroup[];
  lifeGroupMembers: LifeGroupMember[];
  workMinistries: WorkMinistry[];
  workMinistryTeams: WorkMinistryTeam[];
  workMinistryTeamRoles: WorkMinistryTeamRole[];
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
    options?: { teamId?: string | null; serviceRole?: string },
  ) => Promise<WorkMinistryMember | null>;
  updateWorkMinistryMemberById: (
    membershipId: string,
    updates: {
      role?: string;
      teamId?: string | null;
      serviceRole?: string;
    },
  ) => Promise<WorkMinistryMember | null>;
  removeWorkMinistryMemberById: (membershipId: string) => Promise<boolean>;
  addWorkMinistry: (input: CreateWorkMinistryInput) => Promise<WorkMinistry | null>;
  removeWorkMinistryById: (ministryId: string) => Promise<boolean>;
  addWorkMinistryTeam: (
    ministryId: string,
    input: CreateWorkMinistryTeamInput,
  ) => Promise<WorkMinistryTeam | null>;
  updateWorkMinistryTeamById: (
    teamId: string,
    input: Partial<CreateWorkMinistryTeamInput>,
  ) => Promise<WorkMinistryTeam | null>;
  removeWorkMinistryTeamById: (teamId: string) => Promise<boolean>;
  addTeamRoleOption: (
    teamId: string,
    name: string,
  ) => Promise<WorkMinistryTeamRole | null>;
  removeTeamRoleOption: (roleId: string) => Promise<boolean>;
  getMinistryTeams: (ministryId: string) => WorkMinistryTeam[];
  getTeamRoleOptions: (teamId: string) => WorkMinistryTeamRole[];
  addCellGroup: (input: CreateCellGroupInput) => Promise<CellGroup | null>;
  assignCellGroupMember: (
    cellGroupId: string,
    personId: string,
    role?: "Leader" | "Member",
  ) => Promise<CellGroupMember | null>;
  assignCellGroupLeader: (
    cellGroupId: string,
    leaderPersonId: string,
  ) => Promise<CellGroup | null>;
  removeCellGroupMemberById: (membershipId: string) => Promise<boolean>;
  getPersonMinistries: (
    personId: string,
  ) => (WorkMinistryMember & {
    ministry?: WorkMinistry;
    team?: WorkMinistryTeam;
  })[];
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
  const [workMinistryTeams, setWorkMinistryTeams] = useState<WorkMinistryTeam[]>(
    [],
  );
  const [workMinistryTeamRoles, setWorkMinistryTeamRoles] = useState<
    WorkMinistryTeamRole[]
  >([]);
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
      setWorkMinistryTeams([]);
      setWorkMinistryTeamRoles([]);
      setWorkMinistryMembers([]);
      setCellGroups([]);
      setCellGroupMembers([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [
        groups,
        groupMembers,
        ministries,
        ministryTeams,
        ministryTeamRoles,
        ministryMembers,
        cells,
        cellMembers,
      ] = await Promise.all([
        fetchLifeGroups(supabase, organizationId),
        fetchLifeGroupMembers(supabase, organizationId),
        fetchWorkMinistries(supabase, organizationId),
        fetchWorkMinistryTeams(supabase, organizationId),
        fetchWorkMinistryTeamRoles(supabase, organizationId),
        fetchWorkMinistryMembers(supabase, organizationId),
        fetchCellGroups(supabase, organizationId),
        fetchCellGroupMembers(supabase, organizationId),
      ]);

      setLifeGroups(groups);
      setLifeGroupMembers(groupMembers);
      setWorkMinistries(ministries);
      setWorkMinistryTeams(ministryTeams);
      setWorkMinistryTeamRoles(ministryTeamRoles);
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
      options?: { teamId?: string | null; serviceRole?: string },
    ): Promise<WorkMinistryMember | null> => {
      setIsSaving(true);
      try {
        const member = await addWorkMinistryMember(
          supabase,
          ministryId,
          personId,
          role,
          options,
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

  const updateWorkMinistryMemberById = useCallback(
    async (
      membershipId: string,
      updates: {
        role?: string;
        teamId?: string | null;
        serviceRole?: string;
      },
    ): Promise<WorkMinistryMember | null> => {
      setIsSaving(true);
      try {
        const member = await updateWorkMinistryMember(
          supabase,
          membershipId,
          updates,
        );
        await refreshGroupsMinistry();
        toast.success("Assignment updated");
        return member;
      } catch (error) {
        toast.error("Failed to update assignment", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const addWorkMinistry = useCallback(
    async (input: CreateWorkMinistryInput): Promise<WorkMinistry | null> => {
      if (!organizationId) return null;
      setIsSaving(true);
      try {
        const ministry = await createWorkMinistry(
          supabase,
          organizationId,
          input,
        );
        await refreshGroupsMinistry();
        toast.success("Ministry created", { description: ministry.name });
        return ministry;
      } catch (error) {
        toast.error("Failed to create ministry", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshGroupsMinistry, supabase],
  );

  const removeWorkMinistryById = useCallback(
    async (ministryId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await deleteWorkMinistry(supabase, ministryId);
        await refreshGroupsMinistry();
        toast.success("Ministry removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove ministry", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const addWorkMinistryTeam = useCallback(
    async (
      ministryId: string,
      input: CreateWorkMinistryTeamInput,
    ): Promise<WorkMinistryTeam | null> => {
      setIsSaving(true);
      try {
        const team = await createWorkMinistryTeam(supabase, ministryId, input);
        await refreshGroupsMinistry();
        toast.success("Team created", { description: team.name });
        return team;
      } catch (error) {
        toast.error("Failed to create team", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const updateWorkMinistryTeamById = useCallback(
    async (
      teamId: string,
      input: Partial<CreateWorkMinistryTeamInput>,
    ): Promise<WorkMinistryTeam | null> => {
      setIsSaving(true);
      try {
        const team = await updateWorkMinistryTeam(supabase, teamId, input);
        await refreshGroupsMinistry();
        toast.success("Team updated");
        return team;
      } catch (error) {
        toast.error("Failed to update team", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const removeWorkMinistryTeamById = useCallback(
    async (teamId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await deleteWorkMinistryTeam(supabase, teamId);
        await refreshGroupsMinistry();
        toast.success("Team removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove team", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const addTeamRoleOption = useCallback(
    async (teamId: string, name: string): Promise<WorkMinistryTeamRole | null> => {
      setIsSaving(true);
      try {
        const role = await addWorkMinistryTeamRole(supabase, teamId, name);
        await refreshGroupsMinistry();
        return role;
      } catch (error) {
        toast.error("Failed to add role option", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const removeTeamRoleOption = useCallback(
    async (roleId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await removeWorkMinistryTeamRole(supabase, roleId);
        await refreshGroupsMinistry();
        return true;
      } catch (error) {
        toast.error("Failed to remove role option", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshGroupsMinistry, supabase],
  );

  const getMinistryTeams = useCallback(
    (ministryId: string) =>
      workMinistryTeams.filter(team => team.ministryId === ministryId),
    [workMinistryTeams],
  );

  const getTeamRoleOptions = useCallback(
    (teamId: string) =>
      workMinistryTeamRoles.filter(role => role.teamId === teamId),
    [workMinistryTeamRoles],
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
          organizationId ?? undefined,
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
    [organizationId, refreshGroupsMinistry, supabase],
  );

  const assignCellGroupLeader = useCallback(
    async (
      cellGroupId: string,
      leaderPersonId: string,
    ): Promise<CellGroup | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        const group = await updateCellGroupLeader(
          supabase,
          organizationId,
          cellGroupId,
          leaderPersonId,
        );
        await refreshGroupsMinistry();
        toast.success("Cell group leader assigned");
        return group;
      } catch (error) {
        toast.error("Failed to assign leader", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshGroupsMinistry, supabase],
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
          team: workMinistryTeams.find(t => t.id === a.teamId),
        })),
    [workMinistryMembers, workMinistries, workMinistryTeams],
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
        workMinistryTeams,
        workMinistryTeamRoles,
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
        updateWorkMinistryMemberById,
        removeWorkMinistryMemberById,
        addWorkMinistry,
        removeWorkMinistryById,
        addWorkMinistryTeam,
        updateWorkMinistryTeamById,
        removeWorkMinistryTeamById,
        addTeamRoleOption,
        removeTeamRoleOption,
        getMinistryTeams,
        getTeamRoleOptions,
        addCellGroup,
        assignCellGroupMember,
        assignCellGroupLeader,
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
