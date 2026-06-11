"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  mockPeople,
  mockMinistryAssignments,
  mockMinistries,
  mockHouseholds,
} from "@/components/mock-data";

export type Household = (typeof mockHouseholds)[number];

export type PersonStatus = "Active" | "Inactive" | "Exited";
export type MembershipType =
  | "Worker"
  | "Member"
  | "Attender"
  | "For Evangelism"
  | "Prospect";

export interface Person {
  id: string;
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
  membershipType: string;
  evangelismStage: string;
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
  name: string;
  phone: string;
  birthdate: string;
  isProspect: boolean;
};

export type UpdatePersonInput = Partial<
  Pick<
    Person,
    | "name"
    | "phone"
    | "birthdate"
    | "isProspect"
    | "email"
    | "role"
    | "householdId"
    | "householdName"
    | "status"
    | "membershipType"
  >
>;

const STORAGE_KEY = "church-people-data-v2";
export const PEOPLE_PAGE_SIZE = 10;

type StoredData = {
  people: Person[];
  ministryAssignments: MinistryAssignment[];
};

function computeAge(birthdate: string): number {
  const born = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age--;
  }
  return Math.max(age, 0);
}

function seedFromMock(): StoredData {
  const people: Person[] = mockPeople.map(p => {
    const isProspect =
      p.membershipType === "Prospect" ||
      p.membershipType === "For Evangelism" ||
      (p.membershipType === "Attender" &&
        ["First-time Attendee", "Follow-up"].includes(p.evangelismStage));
    const birthYear = new Date().getFullYear() - p.age;
    const birthdate = `${birthYear}-${String(new Date(p.joinDate).getMonth() + 1).padStart(2, "0")}-${String(new Date(p.joinDate).getDate()).padStart(2, "0")}`;

    return {
      ...p,
      birthdate,
      isProspect,
      status: p.status as PersonStatus,
    };
  });

  return {
    people,
    ministryAssignments: mockMinistryAssignments.map(a => ({ ...a })),
  };
}

function loadData(): StoredData {
  if (typeof window === "undefined") return seedFromMock();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return seedFromMock();
}

function saveData(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type PeopleContextValue = {
  people: Person[];
  hydrated: boolean;
  addPerson: (input: AddPersonInput) => Person;
  updatePerson: (id: string, input: UpdatePersonInput) => void;
  promoteToMember: (id: string) => void;
  assignToMinistry: (personId: string, ministryId: string, role: string) => MinistryAssignment;
  assignToHousehold: (personId: string, householdId: string, role: string) => void;
  removeFromHousehold: (personId: string) => void;
  getPerson: (id: string) => Person | undefined;
  getPersonMinistries: (personId: string) => (MinistryAssignment & { ministry?: (typeof mockMinistries)[number] })[];
  getHousehold: (householdId: string) => Household | undefined;
  getHouseholdMembers: (householdId: string, excludePersonId?: string) => Person[];
  isInFamilyHousehold: (person: Person) => boolean;
  ministries: typeof mockMinistries;
  households: Household[];
};

const PeopleContext = createContext<PeopleContextValue | null>(null);

export function PeopleProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [ministryAssignments, setMinistryAssignments] = useState<
    MinistryAssignment[]
  >([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadData();
    setPeople(data.people);
    setMinistryAssignments(data.ministryAssignments);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveData({ people, ministryAssignments });
  }, [people, ministryAssignments, hydrated]);

  const addPerson = useCallback((input: AddPersonInput) => {
    const id = `p-${Date.now()}`;
    const person: Person = {
      id,
      name: input.name.trim(),
      phone: input.phone.trim(),
      birthdate: input.birthdate,
      isProspect: input.isProspect,
      role: "Single",
      householdId: `h-${id}`,
      householdName: input.name.trim().split(" ").pop() ?? input.name.trim(),
      email: "",
      age: computeAge(input.birthdate),
      joinDate: new Date().toISOString().split("T")[0],
      status: "Active",
      membershipType: input.isProspect ? "Prospect" : "Attender",
      evangelismStage: input.isProspect ? "First-time Attendee" : "Follow-up",
      lastAttendance: "",
    };
    setPeople(prev => [person, ...prev]);
    return person;
  }, []);

  const updatePerson = useCallback((id: string, input: UpdatePersonInput) => {
    setPeople(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...input };
        if (input.birthdate) {
          updated.age = computeAge(input.birthdate);
        }
        if (input.isProspect === true) {
          updated.membershipType = "Prospect";
        } else if (input.isProspect === false && p.membershipType === "Prospect") {
          updated.membershipType = "Attender";
        }
        return updated;
      }),
    );
  }, []);

  const promoteToMember = useCallback((id: string) => {
    setPeople(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              isProspect: false,
              membershipType: "Member",
              evangelismStage: "Discipleship",
            }
          : p,
      ),
    );
  }, []);

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
      return assignment;
    },
    [],
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
    (householdId: string) => mockHouseholds.find(h => h.id === householdId),
    [],
  );

  const getHouseholdMembers = useCallback(
    (householdId: string, excludePersonId?: string) =>
      people.filter(
        p => p.householdId === householdId && p.id !== excludePersonId,
      ),
    [people],
  );

  const isInFamilyHousehold = useCallback(
    (person: Person) => {
      const isKnownHousehold = mockHouseholds.some(
        h => h.id === person.householdId,
      );
      const hasOtherMembers = people.some(
        p => p.householdId === person.householdId && p.id !== person.id,
      );
      return isKnownHousehold || hasOtherMembers;
    },
    [people],
  );

  const assignToHousehold = useCallback(
    (personId: string, householdId: string, role: string) => {
      const household = mockHouseholds.find(h => h.id === householdId);
      if (!household) return;
      setPeople(prev =>
        prev.map(p =>
          p.id === personId
            ? {
                ...p,
                householdId,
                householdName: household.name,
                role,
              }
            : p,
        ),
      );
    },
    [],
  );

  const removeFromHousehold = useCallback((personId: string) => {
    setPeople(prev =>
      prev.map(p => {
        if (p.id !== personId) return p;
        return {
          ...p,
          householdId: `h-${personId}`,
          householdName: p.name.trim().split(" ").pop() ?? p.name.trim(),
          role: "Single",
        };
      }),
    );
  }, []);

  return (
    <PeopleContext.Provider
      value={{
        people,
        hydrated,
        addPerson,
        updatePerson,
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
        households: mockHouseholds,
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
