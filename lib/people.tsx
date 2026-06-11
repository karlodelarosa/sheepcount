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
import { mockMinistryAssignments, mockMinistries } from "@/components/mock-data";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  createPerson as createPersonDb,
  deletePerson as deletePersonDb,
  fetchPeople,
  updatePerson as updatePersonDb,
} from "@/lib/supabase/people";

export interface Household {
  id: string;
  name: string;
  address: string;
  createdDate: string;
}

export type PersonStatus = "Active" | "Inactive" | "Exited";
export type MembershipType =
  | "Worker"
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

export interface Person {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  phone: string;
  birthdate: string;
  isProspect: boolean;
  role: string;
  householdId: string;
  householdName: string;
  email: string;
  age: number;
  joinDate: string;
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
  phone: string;
  birthdate: string;
  isProspect: boolean;
};

export type UpdatePersonInput = Partial<
  Pick<
    Person,
    | "firstName"
    | "middleName"
    | "lastName"
    | "phone"
    | "birthdate"
    | "isProspect"
    | "email"
    | "role"
    | "householdId"
    | "householdName"
    | "status"
    | "membershipType"
    | "evangelismStage"
  >
>;

export const PEOPLE_PAGE_SIZE = 10;

type PeopleContextValue = {
  people: Person[];
  households: Household[];
  hydrated: boolean;
  organizationId: string | undefined;
  isSaving: boolean;
  addPerson: (input: AddPersonInput) => Promise<Person | null>;
  updatePerson: (id: string, input: UpdatePersonInput) => Promise<Person | null>;
  deletePerson: (id: string) => Promise<boolean>;
  promoteToMember: (id: string) => Promise<Person | null>;
  assignToMinistry: (
    personId: string,
    ministryId: string,
    role: string,
  ) => MinistryAssignment;
  assignToHousehold: (
    personId: string,
    householdId: string,
    role: string,
  ) => Promise<Person | null>;
  removeFromHousehold: (personId: string) => Promise<Person | null>;
  getPerson: (id: string) => Person | undefined;
  getPersonMinistries: (
    personId: string,
  ) => (MinistryAssignment & { ministry?: (typeof mockMinistries)[number] })[];
  getHousehold: (householdId: string) => Household | undefined;
  getHouseholdMembers: (householdId: string, excludePersonId?: string) => Person[];
  isInFamilyHousehold: (person: Person) => boolean;
  ministries: typeof mockMinistries;
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
  const [ministryAssignments, setMinistryAssignments] = useState<
    MinistryAssignment[]
  >(mockMinistryAssignments.map(a => ({ ...a })));
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshPeople = useCallback(async () => {
    if (!organizationId) {
      setPeople([]);
      setHouseholds([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const data = await fetchPeople(supabase, organizationId);
      setPeople(data.people);
      setHouseholds(data.households);
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
    async (input: AddPersonInput): Promise<Person | null> => {
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
        toast.success("Person added", {
          description: `${person.name} was added to your directory.`,
        });
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
      if (input.isProspect === true) {
        payload.membershipType = "Prospect";
      } else if (
        input.isProspect === false &&
        existing.membershipType === "Prospect"
      ) {
        payload.membershipType = "Attender";
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

  const promoteToMember = useCallback(
    async (id: string): Promise<Person | null> => {
      return updatePerson(id, {
        isProspect: false,
        membershipType: "Member",
        evangelismStage: "Discipleship",
      });
    },
    [updatePerson],
  );

  const assignToMinistry = useCallback(
    (personId: string, ministryId: string, role: string) => {
      const assignment: MinistryAssignment = {
        id: `ma-${Date.now()}`,
        personId,
        ministryId,
        role,
        assignedDate: new Date().toISOString().split("T")[0],
      };
      setMinistryAssignments(prev => [...prev, assignment]);
      toast.success("Assigned to ministry");
      return assignment;
    },
    [],
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

  const removeFromHousehold = useCallback(
    async (personId: string): Promise<Person | null> => {
      const person = people.find(p => p.id === personId);
      if (!person) {
        toast.error("Person not found");
        return null;
      }

      if (!organizationId) {
        toast.error("No organization found");
        return null;
      }

      const lastName = person.lastName.trim() || person.name.trim();

      setIsSaving(true);
      try {
        const { data: household, error: householdError } = await supabase
          .from("households")
          .insert({
            organization_id: organizationId,
            name: `${lastName} Household`,
          })
          .select()
          .single();

        if (householdError) throw householdError;

        return updatePerson(personId, {
          householdId: household.id,
          householdName: household.name,
          role: "Single",
        });
      } catch (error) {
        toast.error("Failed to remove from household", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, people, supabase, updatePerson],
  );

  const getPerson = useCallback(
    (id: string) => people.find(p => p.id === id),
    [people],
  );

  const getPersonMinistries = useCallback(
    (personId: string) =>
      ministryAssignments
        .filter(a => a.personId === personId)
        .map(a => ({
          ...a,
          ministry: mockMinistries.find(m => m.id === a.ministryId),
        })),
    [ministryAssignments],
  );

  const getHousehold = useCallback(
    (householdId: string) => households.find(h => h.id === householdId),
    [households],
  );

  const getHouseholdMembers = useCallback(
    (householdId: string, excludePersonId?: string) =>
      people.filter(
        p => p.householdId === householdId && p.id !== excludePersonId,
      ),
    [people],
  );

  const isInFamilyHousehold = useCallback(
    (person: Person) =>
      people.some(
        p => p.householdId === person.householdId && p.id !== person.id,
      ),
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
        promoteToMember,
        assignToMinistry,
        assignToHousehold,
        removeFromHousehold,
        getPerson,
        getPersonMinistries,
        getHousehold,
        getHouseholdMembers,
        isInFamilyHousehold,
        ministries: mockMinistries,
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
