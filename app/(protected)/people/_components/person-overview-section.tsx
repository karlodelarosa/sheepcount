"use client";

import { useRouter } from "next/navigation";
import {
  AtSign,
  Calendar,
  CalendarCheck,
  Home,
  Mail,
  Network,
  Phone,
  Save,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { BirthdateField } from "@/components/birthdate-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMembershipDisplayColor,
  getMembershipDisplayLabel,
  getPersonVisitDate,
} from "@/lib/membership-path";
import type { Household, Person, PersonGender } from "@/lib/people";
import { cn } from "@/lib/utils";

import type { PersonPastoralStatus } from "../_lib/person-pastoral-status";
import { DetailRow, panelCard, SectionHeader } from "./person-detail-ui";
import { PersonHouseholdSection } from "./person-household-section";
import { PersonPastoralAlert } from "./person-pastoral-alert";

type PersonOverviewSectionProps = {
  personId: string;
  person: Person;
  pastoralStatus: PersonPastoralStatus;
  isEditing: boolean;
  isSaving: boolean;
  editRole: string;
  editStatus: string;
  editGender: PersonGender | "";
  onEditRoleChange: (value: string) => void;
  onEditStatusChange: (value: string) => void;
  onEditGenderChange: (value: PersonGender | "") => void;
  onUpdate: (event: React.FormEvent<HTMLFormElement>) => void;
  household?: Household;
  householdMembers: Person[];
  hasHousehold: boolean;
  inFamilyHousehold: boolean;
  onHouseholdAssignClick: () => void;
  lifeGroups: Array<{
    id: string;
    group?: { name: string; description?: string };
  }>;
  cellGroup?: {
    group?: { name: string };
    role: "Leader" | "Member";
  };
};

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : null;
}

function MissingValue({ children = "Not provided" }: { children?: string }) {
  return <span className="font-normal text-muted-foreground">{children}</span>;
}

export function PersonOverviewSection({
  personId,
  person,
  pastoralStatus,
  isEditing,
  isSaving,
  editRole,
  editStatus,
  editGender,
  onEditRoleChange,
  onEditStatusChange,
  onEditGenderChange,
  onUpdate,
  household,
  householdMembers,
  hasHousehold,
  inFamilyHousehold,
  onHouseholdAssignClick,
  lifeGroups,
  cellGroup,
}: PersonOverviewSectionProps) {
  const router = useRouter();
  const firstAttendance = person.firstAttendance || person.joinDate;
  const groupName = cellGroup?.group?.name ?? lifeGroups[0]?.group?.name;

  return (
    <div className="space-y-4">
      <PersonPastoralAlert status={pastoralStatus} />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section
          className={cn(panelCard, "p-5", isEditing && "lg:col-span-2")}
          aria-label="Contact and personal details"
        >
          <SectionHeader
            icon={User}
            title="Contact & Personal Details"
            description={
              isEditing ? "Update profile information" : "How to reach them"
            }
          />

          <div className="mt-4">
            {isEditing ? (
              <form onSubmit={onUpdate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={person.firstName}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={person.lastName}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="middleName">
                      Middle Name{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="middleName"
                      name="middleName"
                      defaultValue={person.middleName}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={person.phone}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={person.email}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="socialContact">Social media contact</Label>
                    <Input
                      id="socialContact"
                      name="socialContact"
                      defaultValue={person.socialContact}
                      placeholder="Name, @handle, or profile link"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <BirthdateField
                      key={`${personId}-${isEditing}-birthdate`}
                      name="birthdate"
                      defaultValue={person.birthdate}
                    />
                  </div>
                  <div>
                    <BirthdateField
                      key={`${personId}-${isEditing}-first-attendance`}
                      name="firstAttendance"
                      label="First attendance"
                      defaultValue={firstAttendance}
                      showLabel
                    />
                  </div>
                  <div>
                    <BirthdateField
                      key={`${personId}-${isEditing}-member-since`}
                      name="memberSince"
                      label="Member since"
                      defaultValue={person.memberSince}
                      showLabel
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={editGender || "unset"}
                      onValueChange={value =>
                        onEditGenderChange(
                          value === "unset" ? "" : (value as PersonGender),
                        )
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Not specified" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unset">Not specified</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Household role</Label>
                    <Select value={editRole} onValueChange={onEditRoleChange}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Head">Head of Household</SelectItem>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editStatus}
                      onValueChange={onEditStatusChange}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Exited">Exited</SelectItem>
                        <SelectItem value="Deceased">Deceased</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end border-t border-border/60 pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]"
                  >
                    <Save className="mr-2 size-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <DetailRow icon={Phone} label="Phone">
                  {person.phone || <MissingValue />}
                </DetailRow>
                <DetailRow icon={Mail} label="Email">
                  {person.email || <MissingValue />}
                </DetailRow>
                <DetailRow icon={AtSign} label="Social media">
                  {person.socialContact || <MissingValue />}
                </DetailRow>
                <DetailRow icon={Calendar} label="Birthdate">
                  {formatDate(person.birthdate) || <MissingValue />}
                </DetailRow>
                <DetailRow icon={User} label="Gender">
                  {person.gender || <MissingValue />}
                </DetailRow>
              </div>
            )}
          </div>
        </section>

        {!isEditing && (
          <section
            className={cn(panelCard, "p-5")}
            aria-label="Ministry information"
          >
            <SectionHeader
              icon={Network}
              title="Ministry Information"
              description="Membership and church connections"
            />
            <div className="mt-4">
              <DetailRow icon={Sparkles} label="Membership">
                <Badge
                  className={cn(
                    "rounded-full font-normal",
                    getMembershipDisplayColor(
                      person.membershipType,
                      getPersonVisitDate(person),
                    ),
                  )}
                >
                  {getMembershipDisplayLabel(
                    person.membershipType,
                    getPersonVisitDate(person),
                  )}
                </Badge>
              </DetailRow>
              <DetailRow icon={Users} label="Group">
                {groupName ? (
                  <span>
                    {groupName}
                    {cellGroup?.role ? (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {cellGroup.role}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <MissingValue>Unassigned</MissingValue>
                )}
              </DetailRow>
              <DetailRow
                icon={Home}
                label="Household"
                onClick={
                  hasHousehold
                    ? () => router.push(`/households/${person.householdId}`)
                    : undefined
                }
              >
                {hasHousehold ? (
                  <span>
                    {person.householdName || household?.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {person.role}
                      {!inFamilyHousehold && " · Solo household"}
                    </span>
                  </span>
                ) : (
                  <MissingValue>Not assigned</MissingValue>
                )}
              </DetailRow>
              <DetailRow icon={CalendarCheck} label="Member since">
                {formatDate(person.memberSince) || (
                  <MissingValue>Not a member yet</MissingValue>
                )}
              </DetailRow>
              <DetailRow icon={Calendar} label="First attendance">
                {formatDate(firstAttendance) || (
                  <MissingValue>Not recorded</MissingValue>
                )}
              </DetailRow>
              <DetailRow icon={Calendar} label="Directory entry">
                {formatDate(person.joinDate)}
              </DetailRow>
            </div>
          </section>
        )}
      </div>

      <PersonHouseholdSection
        person={person}
        household={household}
        householdMembers={householdMembers}
        hasHousehold={hasHousehold}
        inFamilyHousehold={inFamilyHousehold}
        onAssignClick={onHouseholdAssignClick}
      />
    </div>
  );
}
