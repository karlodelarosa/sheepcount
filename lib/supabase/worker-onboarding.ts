import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateWorkerCandidateInput,
  DeployWorkerCandidateInput,
  WorkerOnboardingCandidate,
  WorkerOnboardingConfig,
  WorkerOnboardingStatus,
} from "@/lib/worker-onboarding";

type DbWorkerOnboardingConfig = {
  organization_id: string;
  course_id: string;
  updated_at: string;
};

type DbWorkerOnboardingCandidate = {
  id: string;
  organization_id: string;
  person_id: string;
  course_id: string;
  progress_id: string;
  target_ministry_id: string;
  status: WorkerOnboardingStatus;
  return_note: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  deployed_by: string | null;
  deployed_at: string | null;
  deployed_membership_type: "Worker" | "Volunteer Worker" | null;
  deployed_ministry_id: string | null;
  deployed_team_id: string | null;
  deployed_role: string;
  deployed_service_role: string;
  created_at: string;
  updated_at: string;
};

const candidateColumns = `
  id,
  organization_id,
  person_id,
  course_id,
  progress_id,
  target_ministry_id,
  status,
  return_note,
  reviewed_by,
  reviewed_at,
  approved_at,
  deployed_by,
  deployed_at,
  deployed_membership_type,
  deployed_ministry_id,
  deployed_team_id,
  deployed_role,
  deployed_service_role,
  created_at,
  updated_at
`;

function toConfig(row: DbWorkerOnboardingConfig): WorkerOnboardingConfig {
  return {
    organizationId: row.organization_id,
    courseId: row.course_id,
    updatedAt: row.updated_at,
  };
}

function toCandidate(
  row: DbWorkerOnboardingCandidate,
): WorkerOnboardingCandidate {
  return {
    id: row.id,
    organizationId: row.organization_id,
    personId: row.person_id,
    courseId: row.course_id,
    progressId: row.progress_id,
    targetMinistryId: row.target_ministry_id,
    status: row.status,
    returnNote: row.return_note,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    approvedAt: row.approved_at,
    deployedBy: row.deployed_by,
    deployedAt: row.deployed_at,
    deployedMembershipType: row.deployed_membership_type,
    deployedMinistryId: row.deployed_ministry_id,
    deployedTeamId: row.deployed_team_id,
    deployedRole: row.deployed_role,
    deployedServiceRole: row.deployed_service_role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rpcCandidate(data: unknown): WorkerOnboardingCandidate {
  return toCandidate(data as DbWorkerOnboardingCandidate);
}

export async function fetchWorkerOnboarding(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{
  config: WorkerOnboardingConfig | null;
  candidates: WorkerOnboardingCandidate[];
}> {
  const [configResult, candidatesResult] = await Promise.all([
    supabase
      .from("worker_onboarding_config")
      .select("organization_id, course_id, updated_at")
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("worker_onboarding_candidates")
      .select(candidateColumns)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
  ]);

  if (configResult.error) throw configResult.error;
  if (candidatesResult.error) throw candidatesResult.error;

  return {
    config: configResult.data
      ? toConfig(configResult.data as DbWorkerOnboardingConfig)
      : null,
    candidates: (candidatesResult.data as DbWorkerOnboardingCandidate[]).map(
      toCandidate,
    ),
  };
}

export async function setWorkerOnboardingCourse(
  supabase: SupabaseClient,
  organizationId: string,
  courseId: string,
): Promise<WorkerOnboardingConfig> {
  const { data, error } = await supabase.rpc("set_worker_onboarding_course", {
    p_organization_id: organizationId,
    p_course_id: courseId,
  });
  if (error) throw error;
  return toConfig(data as DbWorkerOnboardingConfig);
}

export async function createWorkerCandidate(
  supabase: SupabaseClient,
  input: CreateWorkerCandidateInput,
): Promise<WorkerOnboardingCandidate> {
  const { data, error } = await supabase.rpc(
    "create_worker_onboarding_candidate",
    {
      p_organization_id: input.organizationId,
      p_person_id: input.personId,
      p_target_ministry_id: input.targetMinistryId,
    },
  );
  if (error) throw error;
  return rpcCandidate(data);
}

export async function updateWorkerCandidateTarget(
  supabase: SupabaseClient,
  candidateId: string,
  targetMinistryId: string,
): Promise<WorkerOnboardingCandidate> {
  const { data, error } = await supabase.rpc(
    "update_worker_onboarding_target",
    {
      p_candidate_id: candidateId,
      p_target_ministry_id: targetMinistryId,
    },
  );
  if (error) throw error;
  return rpcCandidate(data);
}

async function runCandidateTransition(
  supabase: SupabaseClient,
  name:
    | "submit_worker_onboarding_candidate"
    | "approve_worker_onboarding_candidate",
  candidateId: string,
): Promise<WorkerOnboardingCandidate> {
  const { data, error } = await supabase.rpc(name, {
    p_candidate_id: candidateId,
  });
  if (error) throw error;
  return rpcCandidate(data);
}

export function submitWorkerCandidate(
  supabase: SupabaseClient,
  candidateId: string,
) {
  return runCandidateTransition(
    supabase,
    "submit_worker_onboarding_candidate",
    candidateId,
  );
}

export function approveWorkerCandidate(
  supabase: SupabaseClient,
  candidateId: string,
) {
  return runCandidateTransition(
    supabase,
    "approve_worker_onboarding_candidate",
    candidateId,
  );
}

export async function returnWorkerCandidate(
  supabase: SupabaseClient,
  candidateId: string,
  returnNote: string,
): Promise<WorkerOnboardingCandidate> {
  const { data, error } = await supabase.rpc(
    "return_worker_onboarding_candidate",
    { p_candidate_id: candidateId, p_return_note: returnNote },
  );
  if (error) throw error;
  return rpcCandidate(data);
}

export async function deployWorkerCandidate(
  supabase: SupabaseClient,
  input: DeployWorkerCandidateInput,
): Promise<WorkerOnboardingCandidate> {
  const { data, error } = await supabase.rpc(
    "deploy_worker_onboarding_candidate",
    {
      p_candidate_id: input.candidateId,
      p_membership_type: input.membershipType,
      p_ministry_id: input.ministryId,
      p_team_id: input.teamId ?? null,
      p_role: input.role?.trim() || "Member",
      p_service_role: input.serviceRole?.trim() ?? "",
    },
  );
  if (error) throw error;
  return rpcCandidate(data);
}

export async function removeWorkerCandidate(
  supabase: SupabaseClient,
  candidateId: string,
): Promise<void> {
  const { error } = await supabase.rpc("remove_worker_onboarding_candidate", {
    p_candidate_id: candidateId,
  });
  if (error) throw error;
}
