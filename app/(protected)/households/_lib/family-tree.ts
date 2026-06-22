import type { HouseholdOtherResident, Person } from "@/lib/people";

export type TreeNode = {
  id: string;
  name: string;
  role: string;
  age: number | null;
  kind: "member" | "resident";
  personId?: string;
};

export type FamilyTreeLayout = {
  parents: TreeNode[];
  children: TreeNode[];
  others: TreeNode[];
  residents: TreeNode[];
  isEmpty: boolean;
};

function toMember(person: Person): TreeNode {
  return {
    id: person.id,
    name: person.name,
    role: person.role,
    age: person.age > 0 ? person.age : null,
    kind: "member",
    personId: person.id,
  };
}

function toResident(resident: HouseholdOtherResident): TreeNode {
  return {
    id: resident.id,
    name: resident.name,
    role: resident.relation,
    age: null,
    kind: "resident",
  };
}

function sortByAge(nodes: TreeNode[]) {
  return [...nodes].sort((a, b) => {
    if (a.age == null && b.age == null) return a.name.localeCompare(b.name);
    if (a.age == null) return 1;
    if (b.age == null) return -1;
    return b.age - a.age;
  });
}

export function buildFamilyTreeLayout(
  members: Person[],
  residents: HouseholdOtherResident[],
): FamilyTreeLayout {
  const parents = sortByAge(
    members
      .filter(person => person.role === "Head" || person.role === "Spouse")
      .map(toMember),
  );
  const children = sortByAge(
    members.filter(person => person.role === "Child").map(toMember),
  );
  const others = sortByAge(
    members
      .filter(person => !["Head", "Spouse", "Child"].includes(person.role))
      .map(toMember),
  );
  const residentNodes = residents.map(toResident);

  return {
    parents,
    children,
    others,
    residents: residentNodes,
    isEmpty:
      parents.length === 0 &&
      children.length === 0 &&
      others.length === 0 &&
      residentNodes.length === 0,
  };
}
