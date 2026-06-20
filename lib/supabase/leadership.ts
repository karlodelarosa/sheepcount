import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkMinistry } from "@/lib/supabase/work-ministries";
import type { WorkMinistryMember } from "@/lib/supabase/work-ministries";
import type { WorkMinistryTeam } from "@/lib/supabase/work-ministries";
import type { WorkMinistryTeamRole } from "@/lib/supabase/work-ministries";

export type AdminPositionStatus = "active" | "inactive";

export type AdminPosition = {
  id: string;
  title: string;
  personId: string;
  appointedDate: string;
  term: string;
  status: AdminPositionStatus;
};

export type OrganizationLeadership = {
  headPersonId: string | null;
};

export type OrgChartSubDepartment = {
  id: string;
  name: string;
  roles: string[];
  memberIds: string[];
};

export type OrgChartDepartment = {
  id: string;
  name: string;
  headPersonId: string | null;
  subDepartments: OrgChartSubDepartment[];
  directMemberIds: string[];
};

export type OrgChart = {
  headPersonId: string | null;
  departments: OrgChartDepartment[];
};

type DbAdminPosition = {
  id: string;
  title: string;
  person_id: string;
  appointed_date: string;
  term: string;
  status: AdminPositionStatus;
};

type DbOrganizationLeadership = {
  head_person_id: string | null;
};

function toAdminPosition(row: DbAdminPosition): AdminPosition {
  return {
    id: row.id,
    title: row.title,
    personId: row.person_id,
    appointedDate: row.appointed_date,
    term: row.term,
    status: row.status,
  };
}

export async function fetchAdminPositions(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AdminPosition[]> {
  const { data, error } = await supabase
    .from("admin_positions")
    .select("id, title, person_id, appointed_date, term, status")
    .eq("organization_id", organizationId)
    .order("title")
    .order("appointed_date", { ascending: false });

  if (error) throw error;
  return (data as DbAdminPosition[]).map(toAdminPosition);
}

export type CreateAdminPositionInput = {
  title: string;
  personId: string;
  appointedDate?: string;
  term: string;
};

export async function createAdminPosition(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateAdminPositionInput,
): Promise<AdminPosition> {
  const { data, error } = await supabase
    .from("admin_positions")
    .insert({
      organization_id: organizationId,
      title: input.title,
      person_id: input.personId,
      appointed_date: input.appointedDate ?? new Date().toISOString().slice(0, 10),
      term: input.term,
      status: "active",
    })
    .select("id, title, person_id, appointed_date, term, status")
    .single();

  if (error) throw error;
  return toAdminPosition(data as DbAdminPosition);
}

export async function fetchOrganizationLeadership(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationLeadership> {
  const { data, error } = await supabase
    .from("organization_leadership")
    .select("head_person_id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return { headPersonId: null };
  }

  return {
    headPersonId: (data as DbOrganizationLeadership).head_person_id,
  };
}

export async function setOrganizationHead(
  supabase: SupabaseClient,
  organizationId: string,
  headPersonId: string | null,
): Promise<OrganizationLeadership> {
  const { data, error } = await supabase
    .from("organization_leadership")
    .upsert(
      {
        organization_id: organizationId,
        head_person_id: headPersonId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id" },
    )
    .select("head_person_id")
    .single();

  if (error) throw error;
  return {
    headPersonId: (data as DbOrganizationLeadership).head_person_id,
  };
}

export function resolveHeadPastorPersonId(
  leadership: OrganizationLeadership,
  adminPositions: AdminPosition[],
): string | null {
  if (leadership.headPersonId) {
    return leadership.headPersonId;
  }

  const headPastorPosition = adminPositions.find(
    position =>
      position.status === "active" &&
      position.title.toLowerCase() === "head pastor",
  );

  return headPastorPosition?.personId ?? null;
}

export function buildOrgChart({
  headPersonId,
  ministries,
  teams,
  teamRoles,
  members,
}: {
  headPersonId: string | null;
  ministries: WorkMinistry[];
  teams: WorkMinistryTeam[];
  teamRoles: WorkMinistryTeamRole[];
  members: WorkMinistryMember[];
}): OrgChart {
  return {
    headPersonId,
    departments: ministries.map(ministry => {
      const ministryTeams = teams.filter(team => team.ministryId === ministry.id);

      return {
        id: ministry.id,
        name: ministry.name,
        headPersonId: ministry.headPersonId,
        subDepartments: ministryTeams.map(team => ({
          id: team.id,
          name: team.name,
          roles: teamRoles
            .filter(role => role.teamId === team.id)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(role => role.name),
          memberIds: members
            .filter(member => member.teamId === team.id)
            .map(member => member.personId),
        })),
        directMemberIds: members
          .filter(
            member => member.ministryId === ministry.id && member.teamId === null,
          )
          .map(member => member.personId),
      };
    }),
  };
}

export function getOrgChartSummary(orgChart: OrgChart) {
  const subDepartmentCount = orgChart.departments.reduce(
    (sum, department) => sum + department.subDepartments.length,
    0,
  );

  const totalMembers = orgChart.departments.reduce((sum, department) => {
    const teamMembers = department.subDepartments.reduce(
      (teamSum, subDepartment) => teamSum + subDepartment.memberIds.length,
      0,
    );
    return sum + teamMembers + department.directMemberIds.length;
  }, 0);

  const departmentHeadCount = orgChart.departments.filter(
    department => department.headPersonId,
  ).length;

  return {
    mainDepartments: orgChart.departments.length,
    subDepartments: subDepartmentCount,
    totalMembers,
    departmentHeads: departmentHeadCount,
  };
}
