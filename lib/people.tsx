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
  defaultsForMembershipType,
  evangelismStageForMembershipType,
  getNextMembershipPathType,
} from "@/lib/membership-path";
import {
  createPerson as createPersonDb,
  createPersonInHousehold as createPersonInHouseholdDb,
  deletePerson as deletePersonDb,
  fetchPeople,
  updatePerson as updatePersonDb,
} from "@/lib/supabase/people";
import {
  createHousehold as createHouseholdDb,
  setHouseholdHead as setHouseholdHeadDb,
  updateHousehold as updateHouseholdDb,
  type CreateHouseholdInput,
  type UpdateHouseholdInput,
} from "@/lib/supabase/households";
import {
  createOtherResident as createOtherResidentDb,
  deleteOtherResident as deleteOtherResidentDb,
  fetchOtherResidents,
  updateOtherResident as updateOtherResidentDb,
  type HouseholdOtherResident,
  type OtherResidentInput,
  type OtherResidentRelation,
} from "@/lib/supabase/household-residents";

export type { HouseholdOtherResident, OtherResidentRelation };

export interface Household {
  id: string;
  name: string;
  address: string;
  createdDate: string;
}

export type PersonStatus = "Active" | "Inactive" | "Exited";
export type MembershipType =
  | "Worker"
  | "Volunteer Worker"
  | "Member"
  | "Attender"
  | "For Evangelism"
  | "Prospect";

export type EvangelismStage =
  | "First-time Attendee"
  | "Follow-up"
  | "Small Group"
  | "Discipleship"
  | "Worker";

export type PersonGender = "Male" | "Female";

export interface Person {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  phone: string;
  birthdate: string;
  gender: PersonGender | null;
  isProspect: boolean;
  role: string;
  householdId: string | null;
  householdName: string;
  email: string;
  age: number;
  joinDate: string;
  firstAttendance: string;
  memberSince: string;
  status: PersonStatus;
  membershipType: MembershipType;
  evangelismStage: EvangelismStage;
  lastAttendance: string;
}

export interface MinistryAssignment {
  id: string;
  personId: string;
  ministryId: string;
  role: string;
  assignedDate: string;
}

export type AddPersonInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  birthdate?: string;
  gender?: PersonGender | null;
  membershipType: MembershipType;
  firstAttendance?: string;
  memberSince?: string;
};

export type UpdatePersonInput = Partial<
  Pick<
    Person,
    | "firstName"
    | "middleName"
    | "lastName"
    | "phone"
    | "birthdate"
    | "gender"
    | "isProspect"
    | "email"
    | "role"
    | "householdId"
    | "householdName"
    | "status"
    | "membershipType"
    | "evangelismStage"
    | "firstAttendance"
    | "memberSince"
    | "joinDate"
  >
>;

export const PEOPLE_PAGE_SIZE = 10;

type PeopleContextValue = {
  people: Person[];
  households: Household[];
  hydrated: boolean;
  organizationId: string | undefined;
  isSaving: boolean;
  addPerson: (
    input: AddPersonInput,
    options?: { quiet?: boolean },
  ) => Promise<Person | null>;
  updatePerson: (id: string, input: UpdatePersonInput) => Promise<Person | null>;
  deletePerson: (id: string) => Promise<boolean>;
  promoteAlongPath: (id: string) => Promise<Person | null>;
  assignToHousehold: (
    personId: string,
    householdId: string,
    role: string,
  ) => Promise<Person | null>;
  addHousehold: (input: CreateHouseholdInput) => Promise<Household | null>;
  addPersonToHousehold: (
    householdId: string,
    input: AddPersonInput & { role?: string; email?: string },
  ) => Promise<Person | null>;
  updateHouseholdDetails: (
    householdId: string,
    input: UpdateHouseholdInput & { headPersonId?: string | null },
  ) => Promise<Household | null>;
  addOtherResident: (
    householdId: string,
    input: OtherResidentInput,
  ) => Promise<HouseholdOtherResident | null>;
  updateOtherResident: (
    residentId: string,
    input: Partial<OtherResidentInput>,
  ) => Promise<HouseholdOtherResident | null>;
  deleteOtherResident: (residentId: string) => Promise<boolean>;
  removeFromHousehold: (personId: string) => Promise<Person | null>;
  getPerson: (id: string) => Person | undefined;
  getHousehold: (householdId: string) => Household | undefined;
  getHouseholdMembers: (householdId: string, excludePersonId?: string) => Person[];
  getOtherResidents: (householdId: string) => HouseholdOtherResident[];
  getHouseholdHead: (householdId: string) => Person | undefined;
  isInFamilyHousehold: (person: Person) => boolean;
  refreshPeople: () => Promise<void>;
};

const PeopleContext = createContext<PeopleContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function PeopleProvider({ children }: { children: React.ReactNode }) {
  const { tenant, isLoading: tenantLoading, refreshSession } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [people, setPeople] = useState<Person[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [otherResidents, setOtherResidents] = useState<HouseholdOtherResident[]>(
    [],
  );
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshPeople = useCallback(async () => {
    if (!organizationId) {
      setPeople([]);
      setHouseholds([]);
      setOtherResidents([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [data, residents] = await Promise.all([
        fetchPeople(supabase, organizationId),
        fetchOtherResidents(supabase, organizationId),
      ]);
      setPeople(data.people);
      setHouseholds(data.households);
      setOtherResidents(residents);
    } catch (error) {
      toast.error("Failed to load people", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    if (tenantLoading) return;
    void refreshPeople();
  }, [refreshPeople, tenantLoading]);

  const addPerson = useCallback(
    async (
      input: AddPersonInput,
      options?: { quiet?: boolean },
    ): Promise<Person | null> => {
      let orgId = organizationId;
      if (!orgId) {
        const membership = await refreshSession();
        orgId = getOrganizationId(membership);
      }
      if (!orgId) {
        toast.error("No organization found", {
          description: "Your account is not linked to an organization yet.",
        });
        return null;
      }

      setIsSaving(true);
      try {
        const person = await createPersonDb(supabase, orgId, input);
        await refreshPeople();
        if (!options?.quiet) {
          toast.success("Person added", {
            description: `${person.name} was added to your directory.`,
          });
        }
        return person;
      } catch (error) {
        toast.error("Failed to add person", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshPeople, refreshSession, supabase],
  );

  const updatePerson = useCallback(
    async (id: string, input: UpdatePersonInput): Promise<Person | null> => {
      let orgId = organizationId;
      if (!orgId) {
        const membership = await refreshSession();
        orgId = getOrganizationId(membership);
      }
      if (!orgId) {
        toast.error("No organization found", {
          description: "Your account is not linked to an organization yet.",
        });
        return null;
      }

      const existing = people.find(p => p.id === id);
      if (!existing) {
        toast.error("Person not found");
        return null;
      }

      const payload = { ...input };

      if (input.membershipType !== undefined) {
        const defaults = defaultsForMembershipType(input.membershipType);
        payload.membershipType = input.membershipType;
        payload.isProspect = defaults.isProspect;
        if (input.evangelismStage === undefined) {
          payload.evangelismStage = defaults.evangelismStage;
        }

        const isMemberType =
          input.membershipType === "Member" ||
          input.membershipType === "Volunteer Worker" ||
          input.membershipType === "Worker";
        if (
          isMemberType &&
          !existing.memberSince &&
          input.memberSince === undefined
        ) {
          payload.memberSince = new Date().toISOString().split("T")[0];
        }
      } else if (input.isProspect === true) {
        payload.membershipType = "Prospect";
        payload.isProspect = true;
      } else if (
        input.isProspect === false &&
        existing.membershipType === "Prospect"
      ) {
        payload.membershipType = "Attender";
        payload.isProspect = false;
        if (input.evangelismStage === undefined) {
          payload.evangelismStage = evangelismStageForMembershipType("Attender");
        }
      }

      setIsSaving(true);
      try {
        const person = await updatePersonDb(supabase, orgId, id, payload);
        await refreshPeople();
        toast.success("Changes saved", {
          description: `${person.name}'s profile was updated.`,
        });
        return person;
      } catch (error) {
        toast.error("Failed to save changes", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, people, refreshPeople, refreshSession, supabase],
  );

  const deletePerson = useCallback(
    async (id: string): Promise<boolean> => {
      let orgId = organizationId;
      if (!orgId) {
        const membership = await refreshSession();
        orgId = getOrganizationId(membership);
      }
      if (!orgId) {
        toast.error("No organization found", {
          description: "Your account is not linked to an organization yet.",
        });
        return false;
      }

      const existing = people.find(p => p.id === id);
      if (!existing) {
        toast.error("Person not found");
        return false;
      }

      setIsSaving(true);
      try {
        await deletePersonDb(supabase, orgId, id);
        await refreshPeople();
        toast.success("Person deleted", {
          description: `${existing.name} was removed from your directory.`,
        });
        return true;
      } catch (error) {
        toast.error("Failed to delete person", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, people, refreshPeople, refreshSession, supabase],
  );

  const promoteAlongPath = useCallback(
    async (id: string): Promise<Person | null> => {
      const person = people.find(p => p.id === id);
      if (!person) {
        toast.error("Person not found");
        return null;
      }

      const nextType = getNextMembershipPathType(person.membershipType);
      if (!nextType) {
        toast.error("Already at the highest step on the journey");
        return null;
      }

      return updatePerson(id, {
        isProspect: false,
        membershipType: nextType,
        evangelismStage: evangelismStageForMembershipType(nextType),
        ...(nextType === "Member" && !person.memberSince
          ? { memberSince: new Date().toISOString().split("T")[0] }
          : {}),
      });
    },
    [people, updatePerson],
  );

  const assignToHousehold = useCallback(
    async (
      personId: string,
      householdId: string,
      role: string,
    ): Promise<Person | null> => {
      const household = households.find(h => h.id === householdId);
      if (!household) {
        toast.error("Household not found");
        return null;
      }

      return updatePerson(personId, {
        householdId,
        householdName: household.name,
        role,
      });
    },
    [households, updatePerson],
  );

  const addHousehold = useCallback(
    async (input: CreateHouseholdInput): Promise<Household | null> => {
      let orgId = organizationId;
      if (!orgId) {
        const membership = await refreshSession();
        orgId = getOrganizationId(membership);
      }
      if (!orgId) {
        toast.error("No organization found", {
          description: "Your account is not linked to an organization yet.",
        });
        return null;
      }

      setIsSaving(true);
      try {
        const household = await createHouseholdDb(supabase, orgId, input);
        await refreshPeople();
        toast.success("Household created", {
          description: `${household.name} was added.`,
        });
        return household;
      } catch (error) {
        toast.error("Failed to create household", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshPeople, refreshSession, supabase],
  );

  const addPersonToHousehold = useCallback(
    async (
      householdId: string,
      input: AddPersonInput & { role?: string; email?: string },
    ): Promise<Person | null> => {
      let orgId = organizationId;
      if (!orgId) {
        const membership = await refreshSession();
        orgId = getOrganizationId(membership);
      }
      if (!orgId) {
        toast.error("No organization found", {
          description: "Your account is not linked to an organization yet.",
        });
        return null;
      }

      const household = households.find(h => h.id === householdId);
      if (!household) {
        toast.error("Household not found");
        return null;
      }

      setIsSaving(true);
      try {
        const person = await createPersonInHouseholdDb(supabase, orgId, {
          ...input,
          householdId,
        });
        await refreshPeople();
        toast.success("Member added", {
          description: `${person.name} was added to ${household.name}.`,
        });
        return person;
      } catch (error) {
        toast.error("Failed to add member", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [households, organizationId, refreshPeople, refreshSession, supabase],
  );

  const updateHouseholdDetails = useCallback(
    async (
      householdId: string,
      input: UpdateHouseholdInput & { headPersonId?: string | null },
    ): Promise<Household | null> => {
      let orgId = organizationId;
      if (!orgId) {
        const membership = await refreshSession();
        orgId = getOrganizationId(membership);
      }
      if (!orgId) {
        toast.error("No organization found");
        return null;
      }

      setIsSaving(true);
      try {
        let household: Household | null =
          households.find(h => h.id === householdId) ?? null;

        if (input.name !== undefined || input.address !== undefined) {
          const { headPersonId: _, ...householdInput } = input;
          household = await updateHouseholdDb(
            supabase,
            orgId,
            householdId,
            householdInput,
          );
        }

        if (input.headPersonId) {
          await setHouseholdHeadDb(
            supabase,
            orgId,
            householdId,
            input.headPersonId,
          );
        }

        await refreshPeople();
        toast.success("Household updated");
        return (
          household ??
          households.find(h => h.id === householdId) ??
          null
        );
      } catch (error) {
        toast.error("Failed to update household", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [
      households,
      organizationId,
      refreshPeople,
      refreshSession,
      supabase,
    ],
  );

  const addOtherResident = useCallback(
    async (
      householdId: string,
      input: OtherResidentInput,
    ): Promise<HouseholdOtherResident | null> => {
      let orgId = organizationId;
      if (!orgId) {
        const membership = await refreshSession();
        orgId = getOrganizationId(membership);
      }
      if (!orgId) {
        toast.error("No organization found");
        return null;
      }

      setIsSaving(true);
      try {
        const resident = await createOtherResidentDb(
          supabase,
          orgId,
          householdId,
          input,
        );
        await refreshPeople();
        toast.success("Resident added");
        return resident;
      } catch (error) {
        toast.error("Failed to add resident", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshPeople, refreshSession, supabase],
  );

  const updateOtherResident = useCallback(
    async (
      residentId: string,
      input: Partial<OtherResidentInput>,
    ): Promise<HouseholdOtherResident | null> => {
      let orgId = organizationId;
      if (!orgId) {
        const membership = await refreshSession();
        orgId = getOrganizationId(membership);
      }
      if (!orgId) {
        toast.error("No organization found");
        return null;
      }

      setIsSaving(true);
      try {
        const resident = await updateOtherResidentDb(
          supabase,
          orgId,
          residentId,
          input,
        );
        await refreshPeople();
        toast.success("Resident updated");
        return resident;
      } catch (error) {
        toast.error("Failed to update resident", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshPeople, refreshSession, supabase],
  );

  const deleteOtherResident = useCallback(
    async (residentId: string): Promise<boolean> => {
      let orgId = organizationId;
      if (!orgId) {
        const membership = await refreshSession();
        orgId = getOrganizationId(membership);
      }
      if (!orgId) {
        toast.error("No organization found");
        return false;
      }

      setIsSaving(true);
      try {
        await deleteOtherResidentDb(supabase, orgId, residentId);
        await refreshPeople();
        toast.success("Resident removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove resident", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshPeople, refreshSession, supabase],
  );

  const removeFromHousehold = useCallback(
    async (personId: string): Promise<Person | null> => {
      const person = people.find(p => p.id === personId);
      if (!person) {
        toast.error("Person not found");
        return null;
      }

      if (!person.householdId) {
        toast.error("Person is not in a household");
        return null;
      }

      return updatePerson(personId, {
        householdId: null,
        role: "Single",
      });
    },
    [people, updatePerson],
  );

  const getPerson = useCallback(
    (id: string) => people.find(p => p.id === id),
    [people],
  );

  const getHousehold = useCallback(
    (householdId: string) => households.find(h => h.id === householdId),
    [households],
  );

  const getHouseholdMembers = useCallback(
    (householdId: string, excludePersonId?: string) => {
      if (!householdId) return [];
      return people.filter(
        p => p.householdId === householdId && p.id !== excludePersonId,
      );
    },
    [people],
  );

  const getOtherResidents = useCallback(
    (householdId: string) =>
      otherResidents.filter(r => r.householdId === householdId),
    [otherResidents],
  );

  const getHouseholdHead = useCallback(
    (householdId: string) =>
      people.find(p => p.householdId === householdId && p.role === "Head"),
    [people],
  );

  const isInFamilyHousehold = useCallback(
    (person: Person) => {
      if (!person.householdId) return false;
      return people.some(
        p => p.householdId === person.householdId && p.id !== person.id,
      );
    },
    [people],
  );

  return (
    <PeopleContext.Provider
      value={{
        people,
        households,
        hydrated,
        organizationId,
        isSaving,
        addPerson,
        updatePerson,
        deletePerson,
        promoteAlongPath,
        assignToHousehold,
        addHousehold,
        addPersonToHousehold,
        updateHouseholdDetails,
        addOtherResident,
        updateOtherResident,
        deleteOtherResident,
        removeFromHousehold,
        getPerson,
        getHousehold,
        getHouseholdMembers,
        getOtherResidents,
        getHouseholdHead,
        isInFamilyHousehold,
        refreshPeople,
      }}
    >
      {children}
    </PeopleContext.Provider>
  );
}

export function usePeople() {
  const ctx = useContext(PeopleContext);
  if (!ctx) {
    throw new Error("usePeople must be used within a PeopleProvider");
  }
  return ctx;
}
