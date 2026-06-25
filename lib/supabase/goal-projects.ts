import type { SupabaseClient } from "@supabase/supabase-js";

export type CampaignStatus = "active" | "completed";

export type CampaignCategory =
  | "Building"
  | "Missions"
  | "Youth"
  | "Equipment"
  | "Other";

export type PaymentMethod = "Cash" | "Online Bank" | "E-wallet";

export type FundraisingContribution = {
  id: string;
  campaignId: string;
  personId: string | null;
  amount: number;
  contributedOn: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type FundraisingCampaign = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  category: CampaignCategory;
  goalAmount: number;
  targetDate: string | null; // YYYY-MM-DD
  status: CampaignStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contributions: FundraisingContribution[];
};

export type CreateFundraisingCampaignInput = {
  title: string;
  description: string;
  category: CampaignCategory;
  goalAmount: number;
  targetDate: string | null;
};

export type UpdateFundraisingCampaignInput = CreateFundraisingCampaignInput & {
  id: string;
  status?: CampaignStatus;
};

export type CreateContributionInput = {
  campaignId: string;
  personId: string | null;
  amount: number;
  contributedOn: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes: string;
};

export type UpdateContributionInput = CreateContributionInput & { id: string };

type DbCampaignRow = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category: string;
  goal_amount: number | string;
  target_date: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type DbContributionRow = {
  id: string;
  campaign_id: string;
  person_id: string | null;
  amount: number | string;
  contributed_on: string;
  payment_method: PaymentMethod;
  notes: string;
  created_at: string;
  updated_at: string;
};

function toAmount(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

function toCategory(value: string): CampaignCategory {
  if (
    value === "Building" ||
    value === "Missions" ||
    value === "Youth" ||
    value === "Equipment" ||
    value === "Other"
  ) {
    return value;
  }
  return "Other";
}

function toStatus(value: string): CampaignStatus {
  return value === "completed" ? "completed" : "active";
}

function toContribution(row: DbContributionRow): FundraisingContribution {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    personId: row.person_id,
    amount: toAmount(row.amount),
    contributedOn: row.contributed_on,
    paymentMethod: row.payment_method,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toCampaign(
  row: DbCampaignRow,
  contributions: FundraisingContribution[],
): FundraisingCampaign {
  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title,
    description: row.description,
    category: toCategory(row.category),
    goalAmount: toAmount(row.goal_amount),
    targetDate: row.target_date,
    status: toStatus(row.status),
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contributions,
  };
}

const CAMPAIGN_SELECT =
  "id, organization_id, title, description, category, goal_amount, target_date, status, completed_at, created_at, updated_at";

const CONTRIBUTION_SELECT =
  "id, campaign_id, person_id, amount, contributed_on, payment_method, notes, created_at, updated_at";

async function loadContributionsByCampaign(
  supabase: SupabaseClient,
  campaignIds: string[],
): Promise<Map<string, FundraisingContribution[]>> {
  const byCampaign = new Map<string, FundraisingContribution[]>();
  if (campaignIds.length === 0) return byCampaign;

  const { data, error } = await supabase
    .from("fundraising_contributions")
    .select(CONTRIBUTION_SELECT)
    .in("campaign_id", campaignIds)
    .order("contributed_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  for (const row of (data ?? []) as DbContributionRow[]) {
    const contribution = toContribution(row);
    const list = byCampaign.get(contribution.campaignId) ?? [];
    list.push(contribution);
    byCampaign.set(contribution.campaignId, list);
  }

  return byCampaign;
}

export async function fetchFundraisingCampaignsForOrg(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<FundraisingCampaign[]> {
  const { data, error } = await supabase
    .from("fundraising_campaigns")
    .select(CAMPAIGN_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const campaignRows = (data ?? []) as DbCampaignRow[];
  const campaignIds = campaignRows.map(c => c.id);
  const contributionsByCampaign = await loadContributionsByCampaign(
    supabase,
    campaignIds,
  );

  return campaignRows.map(row =>
    toCampaign(row, contributionsByCampaign.get(row.id) ?? []),
  );
}

export async function fetchFundraisingCampaignById(
  supabase: SupabaseClient,
  campaignId: string,
): Promise<FundraisingCampaign | null> {
  const { data, error } = await supabase
    .from("fundraising_campaigns")
    .select(CAMPAIGN_SELECT)
    .eq("id", campaignId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const contributionsByCampaign = await loadContributionsByCampaign(supabase, [
    campaignId,
  ]);
  return toCampaign(data as DbCampaignRow, contributionsByCampaign.get(campaignId) ?? []);
}

export async function createFundraisingCampaign(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateFundraisingCampaignInput,
): Promise<FundraisingCampaign> {
  const { data, error } = await supabase
    .from("fundraising_campaigns")
    .insert({
      organization_id: organizationId,
      title: input.title,
      description: input.description,
      category: input.category,
      goal_amount: input.goalAmount,
      target_date: input.targetDate,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select(CAMPAIGN_SELECT)
    .single();

  if (error) throw error;
  return toCampaign(data as DbCampaignRow, []);
}

export async function updateFundraisingCampaign(
  supabase: SupabaseClient,
  input: UpdateFundraisingCampaignInput,
): Promise<FundraisingCampaign> {
  const { data, error } = await supabase
    .from("fundraising_campaigns")
    .update({
      title: input.title,
      description: input.description,
      category: input.category,
      goal_amount: input.goalAmount,
      target_date: input.targetDate,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select(CAMPAIGN_SELECT)
    .single();

  if (error) throw error;

  const contributionsByCampaign = await loadContributionsByCampaign(supabase, [
    input.id,
  ]);
  return toCampaign(data as DbCampaignRow, contributionsByCampaign.get(input.id) ?? []);
}

export async function deleteFundraisingCampaign(
  supabase: SupabaseClient,
  campaignId: string,
): Promise<void> {
  const { error } = await supabase
    .from("fundraising_campaigns")
    .delete()
    .eq("id", campaignId);
  if (error) throw error;
}

export async function markCampaignCompleted(
  supabase: SupabaseClient,
  campaignId: string,
): Promise<void> {
  const { error } = await supabase
    .from("fundraising_campaigns")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);
  if (error) throw error;
}

export async function reopenCampaign(
  supabase: SupabaseClient,
  campaignId: string,
): Promise<void> {
  const { error } = await supabase
    .from("fundraising_campaigns")
    .update({
      status: "active",
      completed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);
  if (error) throw error;
}

export async function createContribution(
  supabase: SupabaseClient,
  input: CreateContributionInput,
): Promise<FundraisingContribution> {
  const { data, error } = await supabase
    .from("fundraising_contributions")
    .insert({
      campaign_id: input.campaignId,
      person_id: input.personId,
      amount: input.amount,
      contributed_on: input.contributedOn,
      payment_method: input.paymentMethod,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .select(CONTRIBUTION_SELECT)
    .single();

  if (error) throw error;
  return toContribution(data as DbContributionRow);
}

export async function updateContribution(
  supabase: SupabaseClient,
  input: UpdateContributionInput,
): Promise<FundraisingContribution> {
  const { data, error } = await supabase
    .from("fundraising_contributions")
    .update({
      campaign_id: input.campaignId,
      person_id: input.personId,
      amount: input.amount,
      contributed_on: input.contributedOn,
      payment_method: input.paymentMethod,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select(CONTRIBUTION_SELECT)
    .single();

  if (error) throw error;
  return toContribution(data as DbContributionRow);
}

export async function deleteContribution(
  supabase: SupabaseClient,
  contributionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("fundraising_contributions")
    .delete()
    .eq("id", contributionId);
  if (error) throw error;
}

