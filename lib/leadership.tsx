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
  buildOrgChart,
  createAdminPosition,
  fetchAdminPositions,
  fetchOrganizationLeadership,
  resolveHeadPastorPersonId,
  type AdminPosition,
  type CreateAdminPositionInput,
  type OrgChart,
  type OrganizationLeadership,
} from "@/lib/supabase/leadership";
import {
  fetchWorkMinistries,
  fetchWorkMinistryMembers,
  fetchWorkMinistryTeamRoles,
  fetchWorkMinistryTeams,
  type WorkMinistry,
  type WorkMinistryMember,
  type WorkMinistryTeam,
  type WorkMinistryTeamRole,
} from "@/lib/supabase/work-ministries";

type LeadershipContextValue = {
  adminPositions: AdminPosition[];
  organizationLeadership: OrganizationLeadership;
  orgChart: OrgChart;
  workMinistries: WorkMinistry[];
  workMinistryTeams: WorkMinistryTeam[];
  workMinistryTeamRoles: WorkMinistryTeamRole[];
  workMinistryMembers: WorkMinistryMember[];
  headPastorPersonId: string | null;
  hydrated: boolean;
  isSaving: boolean;
  refreshLeadership: () => Promise<void>;
  assignAdminPosition: (
    input: CreateAdminPositionInput,
  ) => Promise<AdminPosition | null>;
};

const LeadershipContext = createContext<LeadershipContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function LeadershipProvider({ children }: { children: React.ReactNode }) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [adminPositions, setAdminPositions] = useState<AdminPosition[]>([]);
  const [organizationLeadership, setOrganizationLeadership] =
    useState<OrganizationLeadership>({ headPersonId: null });
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
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshLeadership = useCallback(async () => {
    if (!organizationId) {
      setAdminPositions([]);
      setOrganizationLeadership({ headPersonId: null });
      setWorkMinistries([]);
      setWorkMinistryTeams([]);
      setWorkMinistryTeamRoles([]);
      setWorkMinistryMembers([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [
        positionData,
        leadershipData,
        ministryData,
        teamData,
        teamRoleData,
        memberData,
      ] = await Promise.all([
        fetchAdminPositions(supabase, organizationId),
        fetchOrganizationLeadership(supabase, organizationId),
        fetchWorkMinistries(supabase, organizationId),
        fetchWorkMinistryTeams(supabase, organizationId),
        fetchWorkMinistryTeamRoles(supabase, organizationId),
        fetchWorkMinistryMembers(supabase, organizationId),
      ]);

      setAdminPositions(positionData);
      setOrganizationLeadership(leadershipData);
      setWorkMinistries(ministryData);
      setWorkMinistryTeams(teamData);
      setWorkMinistryTeamRoles(teamRoleData);
      setWorkMinistryMembers(memberData);
    } catch (error) {
      toast.error("Failed to load leadership data", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    if (tenantLoading) return;
    void refreshLeadership();
  }, [refreshLeadership, tenantLoading]);

  const headPastorPersonId = useMemo(
    () => resolveHeadPastorPersonId(organizationLeadership, adminPositions),
    [adminPositions, organizationLeadership],
  );

  const orgChart = useMemo(
    () =>
      buildOrgChart({
        headPersonId: headPastorPersonId,
        ministries: workMinistries,
        teams: workMinistryTeams,
        teamRoles: workMinistryTeamRoles,
        members: workMinistryMembers,
      }),
    [
      headPastorPersonId,
      workMinistries,
      workMinistryMembers,
      workMinistryTeamRoles,
      workMinistryTeams,
    ],
  );

  const assignAdminPosition = useCallback(
    async (input: CreateAdminPositionInput): Promise<AdminPosition | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        const position = await createAdminPosition(
          supabase,
          organizationId,
          input,
        );
        setAdminPositions(prev => [position, ...prev]);
        toast.success("Administrative position assigned");
        return position;
      } catch (error) {
        toast.error("Failed to assign position", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const value = useMemo(
    () => ({
      adminPositions,
      organizationLeadership,
      orgChart,
      workMinistries,
      workMinistryTeams,
      workMinistryTeamRoles,
      workMinistryMembers,
      headPastorPersonId,
      hydrated,
      isSaving,
      refreshLeadership,
      assignAdminPosition,
    }),
    [
      adminPositions,
      assignAdminPosition,
      headPastorPersonId,
      hydrated,
      isSaving,
      orgChart,
      organizationLeadership,
      refreshLeadership,
      workMinistries,
      workMinistryMembers,
      workMinistryTeamRoles,
      workMinistryTeams,
    ],
  );

  return (
    <LeadershipContext.Provider value={value}>
      {children}
    </LeadershipContext.Provider>
  );
}

export function useLeadership() {
  const context = useContext(LeadershipContext);
  if (!context) {
    throw new Error("useLeadership must be used within LeadershipProvider");
  }
  return context;
}
