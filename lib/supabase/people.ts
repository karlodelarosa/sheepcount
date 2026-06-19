import type { SupabaseClient } from "@supabase/supabase-js";
import { formatPersonName } from "@/lib/person-name";
import { evangelismStageForMembershipType, isMembershipPathType } from "@/lib/membership-path";
import type {
  AddPersonInput,
  EvangelismStage,
  Household,
  MembershipType,
  Person,
  PersonStatus,
  UpdatePersonInput,
} from "@/lib/people";

type DbHousehold = {
  id: string;
  organization_id: string;
  name: string;
  address: string | null;
  created_at: string;
  updated_at: string;
};

type DbPersonRow = {
  id: string;
  organization_id: string;
  household_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  phone: string;
  email: string;
  birthdate: string | null;
  role: string;
  status: string;
  membership_type: string;
  evangelism_stage: string;
  is_prospect: boolean;
  join_date: string;
  last_attendance: string | null;
  created_at: string;
  updated_at: string;
  households:
    | { name: string; address: string | null }
    | { name: string; address: string | null }[]
    | null;
};

function getHouseholdName(households: DbPersonRow["households"]): string {
  if (!households) return "";
  const household = Array.isArray(households) ? households[0] : households;
  return household?.name ?? "";
}

function computeAge(birthdate: string | null): number {
  if (!birthdate) return 0;
  const born = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age--;
  }
  return Math.max(age, 0);
}

function toHousehold(row: DbHousehold): Household {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? "",
    createdDate: row.created_at.split("T")[0],
  };
}

function toPerson(row: DbPersonRow): Person {
  const firstName = row.first_name ?? "";
  const middleName = row.middle_name ?? "";
  const lastName = row.last_name ?? "";

  return {
    id: row.id,
    firstName,
    middleName,
    lastName,
    name: formatPersonName({
      firstName,
      middleName: middleName || undefined,
      lastName,
    }),
    phone: row.phone,
    email: row.email,
    birthdate: row.birthdate ?? "",
    isProspect: row.is_prospect,
    role: row.role,
    householdId: row.household_id,
    householdName: getHouseholdName(row.households),
    age: computeAge(row.birthdate),
    joinDate: row.join_date,
    status: row.status as PersonStatus,
    membershipType: row.membership_type as MembershipType,
    evangelismStage: row.evangelism_stage as EvangelismStage,
    lastAttendance: row.last_attendance ?? "",
  };
}

const personSelect = `
  id,
  organization_id,
  household_id,
  first_name,
  middle_name,
  last_name,
  phone,
  email,
  birthdate,
  role,
  status,
  membership_type,
  evangelism_stage,
  is_prospect,
  join_date,
  last_attendance,
  created_at,
  updated_at,
  households ( name, address )
`;

export async function fetchPeople(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{ people: Person[]; households: Household[] }> {
  const [peopleResult, householdsResult] = await Promise.all([
    supabase
      .from("people")
      .select(personSelect)
      .eq("organization_id", organizationId)
      .order("last_name")
      .order("first_name"),
    supabase
      .from("households")
      .select("*")
      .eq("organization_id", organizationId)
      .order("name"),
  ]);

  if (peopleResult.error) throw peopleResult.error;
  if (householdsResult.error) throw householdsResult.error;

  return {
    people: (peopleResult.data as unknown as DbPersonRow[]).map(toPerson),
    households: (householdsResult.data as DbHousehold[]).map(toHousehold),
  };
}

function buildNameFields(input: {
  firstName: string;
  middleName?: string;
  lastName: string;
}) {
  const firstName = input.firstName.trim();
  const middleName = input.middleName?.trim() ?? "";
  const lastName = input.lastName.trim();

  return { firstName, middleName, lastName };
}

export type AddPersonToHouseholdInput = AddPersonInput & {
  householdId: string;
  role?: string;
  email?: string;
};

export async function createPersonInHousehold(
  supabase: SupabaseClient,
  organizationId: string,
  input: AddPersonToHouseholdInput,
): Promise<Person> {
  const { firstName, middleName, lastName } = buildNameFields(input);

  const membershipType = input.membershipType;
  const isProspect = membershipType === "Prospect";
  const evangelismStage = isMembershipPathType(membershipType)
    ? evangelismStageForMembershipType(membershipType)
    : isProspect
      ? "First-time Attendee"
      : "Follow-up";

  const { data: person, error: personError } = await supabase
    .from("people")
    .insert({
      organization_id: organizationId,
      household_id: input.householdId,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      phone: input.phone?.trim() ?? "",
      email: input.email?.trim() ?? "",
      birthdate: input.birthdate?.trim() || null,
      is_prospect: isProspect,
      role: input.role?.trim() || "Single",
      status: "Active",
      membership_type: membershipType,
      evangelism_stage: evangelismStage,
    })
    .select(personSelect)
    .single();

  if (personError) throw personError;

  return toPerson(person as unknown as DbPersonRow);
}

export async function createPerson(
  supabase: SupabaseClient,
  organizationId: string,
  input: AddPersonInput,
): Promise<Person> {
  const { firstName, middleName, lastName } = buildNameFields(input);

  const membershipType = input.membershipType;
  const isProspect = membershipType === "Prospect";
  const evangelismStage = isMembershipPathType(membershipType)
    ? evangelismStageForMembershipType(membershipType)
    : isProspect
      ? "First-time Attendee"
      : "Follow-up";

  const { data: person, error: personError } = await supabase
    .from("people")
    .insert({
      organization_id: organizationId,
      household_id: null,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      phone: input.phone?.trim() ?? "",
      birthdate: input.birthdate?.trim() || null,
      is_prospect: isProspect,
      role: "Single",
      status: "Active",
      membership_type: membershipType,
      evangelism_stage: evangelismStage,
    })
    .select(personSelect)
    .single();

  if (personError) throw personError;

  return toPerson(person as unknown as DbPersonRow);
}

export async function updatePerson(
  supabase: SupabaseClient,
  organizationId: string,
  personId: string,
  input: UpdatePersonInput,
): Promise<Person> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (
    input.firstName !== undefined ||
    input.middleName !== undefined ||
    input.lastName !== undefined
  ) {
    const firstName = input.firstName?.trim() ?? "";
    const middleName = input.middleName?.trim() ?? "";
    const lastName = input.lastName?.trim() ?? "";
    updates.first_name = firstName;
    updates.middle_name = middleName || null;
    updates.last_name = lastName;
  }

  if (input.phone !== undefined) updates.phone = input.phone.trim();
  if (input.email !== undefined) updates.email = input.email.trim();
  if (input.birthdate !== undefined) updates.birthdate = input.birthdate;
  if (input.role !== undefined) updates.role = input.role;
  if (input.status !== undefined) updates.status = input.status;
  if (input.isProspect !== undefined) updates.is_prospect = input.isProspect;
  if (input.householdId !== undefined) updates.household_id = input.householdId;

  if (input.isProspect === true) {
    updates.membership_type = "Prospect";
  } else if (input.isProspect === false && input.membershipType === undefined) {
    updates.membership_type = "Attender";
  }

  if (input.membershipType !== undefined) {
    updates.membership_type = input.membershipType;
  }
  if (input.evangelismStage !== undefined) {
    updates.evangelism_stage = input.evangelismStage;
  }

  const { data, error } = await supabase
    .from("people")
    .update(updates)
    .eq("id", personId)
    .eq("organization_id", organizationId)
    .select(personSelect)
    .single();

  if (error) throw error;

  return toPerson(data as unknown as DbPersonRow);
}

export async function deletePerson(
  supabase: SupabaseClient,
  organizationId: string,
  personId: string,
): Promise<void> {
  const { data: person, error: fetchError } = await supabase
    .from("people")
    .select("id, household_id")
    .eq("id", personId)
    .eq("organization_id", organizationId)
    .single();

  if (fetchError) throw fetchError;

  const { error: deleteError } = await supabase
    .from("people")
    .delete()
    .eq("id", personId)
    .eq("organization_id", organizationId);

  if (deleteError) throw deleteError;

  if (!person.household_id) return;

  const { count, error: countError } = await supabase
    .from("people")
    .select("id", { count: "exact", head: true })
    .eq("household_id", person.household_id);

  if (countError) throw countError;

  if (count === 0) {
    const { error: householdError } = await supabase
      .from("households")
      .delete()
      .eq("id", person.household_id)
      .eq("organization_id", organizationId);

    if (householdError) throw householdError;
  }
}
