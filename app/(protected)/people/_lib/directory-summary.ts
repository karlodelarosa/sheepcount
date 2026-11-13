import type { MembershipType, PersonStatus } from "@/lib/people";

type DirectoryPerson = {
  id: string;
  status: PersonStatus;
  membershipType: MembershipType;
  isProspect: boolean;
};

type DirectoryLifeGroupMember = {
  personId: string;
};

export type PeopleDirectorySummary = {
  total: number;
  active: number;
  inLifeGroups: number;
  prospects: number;
  members: number;
  attenders: number;
  workers: number;
  volunteers: number;
};

export function buildPeopleDirectorySummary(
  people: DirectoryPerson[],
  lifeGroupMembers: DirectoryLifeGroupMember[],
): PeopleDirectorySummary {
  const personIds = new Set(people.map(person => person.id));
  const lifeGroupPersonIds = new Set(
    lifeGroupMembers
      .map(member => member.personId)
      .filter(personId => personIds.has(personId)),
  );

  return {
    total: people.length,
    active: people.filter(person => person.status === "Active").length,
    inLifeGroups: lifeGroupPersonIds.size,
    prospects: people.filter(
      person => person.isProspect || person.membershipType === "Prospect",
    ).length,
    members: people.filter(person => person.membershipType === "Member").length,
    attenders: people.filter(person => person.membershipType === "Attender")
      .length,
    workers: people.filter(person => person.membershipType === "Worker").length,
    volunteers: people.filter(
      person => person.membershipType === "Volunteer Worker",
    ).length,
  };
}

export function formatLastAttended(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return "—";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
