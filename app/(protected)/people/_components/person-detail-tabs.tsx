"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  Home,
  Mail,
  Phone,
  Save,
  Sparkles,
  User,
  Users,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BirthdateField } from "@/components/birthdate-field";
import type { PersonProfileDetails } from "@/lib/supabase/person-profile";
import type { Person, PersonGender } from "@/lib/people";
import type { Household } from "@/lib/people";
import {
  getMembershipDisplayColor,
  getMembershipDisplayLabel,
  getPersonVisitDate,
} from "@/lib/membership-path";
import type {
  WorkMinistry,
  WorkMinistryMember,
  WorkMinistryTeam,
} from "@/lib/supabase/work-ministries";
import { formatMinistryAssignmentLabel } from "@/lib/work-ministry-labels";
import {
  EmptyState,
  InfoTile,
  panelCard,
  SectionHeader,
} from "./person-detail-ui";
import { PersonHouseholdSection } from "./person-household-section";
import { PersonAttendanceSection } from "./person-attendance-section";
import { PersonPastoralAlert } from "./person-pastoral-alert";
import { PersonBaptismSection } from "./person-baptism-section";
import type { PersonAttendanceRow } from "../_lib/person-attendance";
import type { PersonPastoralStatus } from "../_lib/person-pastoral-status";
import { isPastoralAlertLevel } from "../_lib/person-pastoral-status";
import { cn } from "@/lib/utils";

export type PersonDetailTab =
  | "overview"
  | "community"
  | "attendance"
  | "growth";

function parseTab(value: string | null): PersonDetailTab {
  if (
    value === "community" ||
    value === "attendance" ||
    value === "growth"
  ) {
    return value;
  }
  return "overview";
}

type PersonDetailTabsProps = {
  personId: string;
  person: Person;
  isEditing: boolean;
  isSaving: boolean;
  editRole: string;
  editStatus: string;
  editGender: PersonGender | "";
  onEditRoleChange: (value: string) => void;
  onEditStatusChange: (value: string) => void;
  onEditGenderChange: (value: PersonGender | "") => void;
  onUpdate: (e: React.FormEvent<HTMLFormElement>) => void;
  household: Household | undefined;
  householdMembers: Person[];
  hasHousehold: boolean;
  inFamilyHousehold: boolean;
  onHouseholdAssignClick: () => void;
  ministriesList: (WorkMinistryMember & {
    ministry?: WorkMinistry;
    team?: WorkMinistryTeam;
  })[];
  onAssignMinistryClick: () => void;
  lifeGroups: Array<{
    id: string;
    group?: { name: string; description?: string };
  }>;
  cellGroup:
    | {
        group?: { name: string };
        role: "Leader" | "Member";
      }
    | undefined;
  discipleshipRole: string | null;
  discipleshipBadges: Array<{
    enrollmentId: string;
    trackId: string;
    trackName: string;
    category: string;
    color: string;
    earnedAt: string;
  }>;
  trainingBadges: Array<{
    progressId: string;
    courseName: string;
    category: string;
    earnedAt: string;
  }>;
  activeTraining: Array<{
    course?: { name: string };
    progressPercent: number;
    progress: { id: string };
  }>;
  completedTraining: unknown[];
  personEvents: Array<{
    registration: { id: string; roleInEvent: string };
    event?: { title: string; type: string; startDate: string };
  }>;
  profileDetails: PersonProfileDetails;
  trackBadgeColors: Record<string, string>;
  attendanceRows: PersonAttendanceRow[];
  attendanceHydrated: boolean;
  pastoralStatus: PersonPastoralStatus;
  people: Person[];
};

export function PersonDetailTabs(props: PersonDetailTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const setActiveTab = (tab: string) => {
    router.replace(`/people/${props.personId}?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    if (props.isEditing && activeTab !== "overview") {
      setActiveTab("overview");
    }
  }, [props.isEditing, activeTab]);

  const {
    person,
    personId,
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
    ministriesList,
    onAssignMinistryClick,
    lifeGroups,
    cellGroup,
    discipleshipRole,
    discipleshipBadges,
    trainingBadges,
    activeTraining,
    completedTraining,
    personEvents,
    profileDetails,
    trackBadgeColors,
    attendanceRows,
    attendanceHydrated,
    pastoralStatus,
    people,
  } = props;

  const communityCount =
    ministriesList.length + lifeGroups.length + (cellGroup ? 1 : 0);
  const growthCount =
    profileDetails.discipleship.activeEnrollments.length +
    activeTraining.length +
    discipleshipBadges.length +
    personEvents.length +
    profileDetails.baptism.records.length;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1">
        <TabsTrigger
          value="overview"
          className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3"
          disabled={isEditing && activeTab !== "overview"}
        >
          <User className="w-3.5 h-3.5" />
          Overview
          {isPastoralAlertLevel(pastoralStatus.level) && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          )}
        </TabsTrigger>
        <TabsTrigger
          value="community"
          className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3"
          disabled={isEditing}
        >
          <Users className="w-3.5 h-3.5" />
          Community
          {communityCount > 0 && (
            <span className="text-[10px] tabular-nums opacity-70">
              ({communityCount})
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="attendance"
          className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3"
          disabled={isEditing}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          Attendance
        </TabsTrigger>
        <TabsTrigger
          value="growth"
          className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3"
          disabled={isEditing}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Growth
          {growthCount > 0 && (
            <span className="text-[10px] tabular-nums opacity-70">
              ({growthCount})
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 space-y-5">
        <PersonPastoralAlert status={pastoralStatus} />

        <div className={cn(panelCard, "p-5")}>
          <SectionHeader
            icon={Mail}
            title="Contact & Details"
            description={
              isEditing ? "Update profile information" : "How to reach them"
            }
          />
          <div className="mt-4">
            {isEditing ? (
              <form onSubmit={onUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="middleName">
                      Middle Name{" "}
                      <span className="text-muted-foreground font-normal">
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
                  <div className="col-span-2">
                    <BirthdateField
                      key={`${personId}-${isEditing}-birthdate`}
                      name="birthdate"
                      defaultValue={person.birthdate}
                    />
                  </div>
                  <div className="col-span-2">
                    <BirthdateField
                      key={`${personId}-${isEditing}-first-attendance`}
                      name="firstAttendance"
                      label="First attendance"
                      defaultValue={person.firstAttendance || person.joinDate}
                      showLabel
                    />
                  </div>
                  <div className="col-span-2">
                    <BirthdateField
                      key={`${personId}-${isEditing}-member-since`}
                      name="memberSince"
                      label="Member since"
                      defaultValue={person.memberSince}
                      showLabel
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
                  <div className="grid gap-2">
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoTile icon={Mail} label="Email">
                  {person.email || (
                    <span className="text-slate-400 font-normal">
                      Not provided
                    </span>
                  )}
                </InfoTile>
                <InfoTile icon={Phone} label="Phone">
                  {person.phone || (
                    <span className="text-slate-400 font-normal">
                      Not provided
                    </span>
                  )}
                </InfoTile>
                <InfoTile icon={Calendar} label="Birthdate">
                  {person.birthdate
                    ? new Date(person.birthdate).toLocaleDateString()
                    : "Not provided"}
                </InfoTile>
                <InfoTile icon={User} label="Gender">
                  {person.gender || (
                    <span className="text-slate-400 font-normal">
                      Not provided
                    </span>
                  )}
                </InfoTile>
                <InfoTile icon={Sparkles} label="Membership">
                  <Badge
                    className={`rounded-lg font-normal ${getMembershipDisplayColor(
                      person.membershipType,
                      getPersonVisitDate(person),
                    )}`}
                  >
                    {getMembershipDisplayLabel(
                      person.membershipType,
                      getPersonVisitDate(person),
                    )}
                  </Badge>
                </InfoTile>
                <InfoTile icon={Calendar} label="First attendance">
                  {(person.firstAttendance || person.joinDate)
                    ? new Date(
                        person.firstAttendance || person.joinDate,
                      ).toLocaleDateString()
                    : "Not recorded"}
                </InfoTile>
                <InfoTile icon={CalendarCheck} label="Member since">
                  {person.memberSince ? (
                    new Date(person.memberSince).toLocaleDateString()
                  ) : (
                    <span className="text-slate-400 font-normal">
                      Not a member yet
                    </span>
                  )}
                </InfoTile>
                <InfoTile icon={Calendar} label="Directory entry date">
                  {new Date(person.joinDate).toLocaleDateString()}
                </InfoTile>
                <InfoTile
                  icon={Home}
                  label="Household"
                  onClick={
                    hasHousehold
                      ? () => router.push(`/households/${person.householdId}`)
                      : undefined
                  }
                >
                  {hasHousehold ? (
                    <>
                      {person.householdName || household?.name}
                      <span className="block text-xs font-normal text-slate-500 dark:text-zinc-500 mt-0.5">
                        {person.role}
                        {!inFamilyHousehold && " · Solo household"}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-normal">
                      Not assigned
                    </span>
                  )}
                </InfoTile>
              </div>
            )}
          </div>
        </div>

        <PersonHouseholdSection
          person={person}
          household={household}
          householdMembers={householdMembers}
          hasHousehold={hasHousehold}
          inFamilyHousehold={inFamilyHousehold}
          onAssignClick={onHouseholdAssignClick}
        />
      </TabsContent>

      <TabsContent value="community" className="mt-4 space-y-5">
        <div className={cn(panelCard, "p-5")}>
          <SectionHeader
            icon={Award}
            title="Ministry Assignments"
            description={`${ministriesList.length} active assignment${ministriesList.length !== 1 ? "s" : ""}`}
            action={
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg shrink-0"
                onClick={onAssignMinistryClick}
              >
                Assign
              </Button>
            }
          />
          <div className="mt-4">
            {ministriesList.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No ministry assignments"
                description="Assign this person to a work ministry team."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAssignMinistryClick}
                    className="rounded-xl"
                  >
                    Assign to Ministry
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {ministriesList.map(assignment => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {assignment.ministry?.name}
                      </p>
                      {assignment.ministry?.description && (
                        <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5 line-clamp-1">
                          {assignment.ministry.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="rounded-lg shrink-0">
                      {formatMinistryAssignmentLabel(assignment)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={cn(panelCard, "p-5")}>
          <SectionHeader
            icon={Users}
            title="Life Groups"
            description={`${lifeGroups.length} group${lifeGroups.length !== 1 ? "s" : ""}`}
          />
          <div className="mt-4">
            {lifeGroups.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No life groups"
                description="This person isn't enrolled in a life group yet."
              />
            ) : (
              <div className="space-y-2">
                {lifeGroups.map(membership => (
                  <div
                    key={membership.id}
                    className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {membership.group?.name}
                    </p>
                    {membership.group?.description && (
                      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                        {membership.group.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={cn(panelCard, "p-5")}>
          <SectionHeader
            icon={Users}
            title="Cell Group"
            description={
              cellGroup
                ? `${cellGroup.group?.name} · ${cellGroup.role === "Leader" ? "Cell Leader" : "Member"}`
                : "Not assigned to a cell group"
            }
          />
          <div className="mt-4">
            {!cellGroup ? (
              <EmptyState
                icon={Users}
                title="No cell group"
                description="This person is not assigned to a cell group yet."
              />
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30">
                <p className="font-medium text-slate-900 dark:text-white">
                  {cellGroup.group?.name}
                </p>
                <Badge variant="secondary" className="rounded-lg mt-2">
                  {cellGroup.role === "Leader" ? "Cell Leader" : "Member"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="attendance" className="mt-4">
        <PersonAttendanceSection
          personId={personId}
          lastAttendance={person.lastAttendance}
          attendanceRows={attendanceRows}
          hydrated={attendanceHydrated}
        />
      </TabsContent>

      <TabsContent value="growth" className="mt-4 space-y-5">
        <PersonBaptismSection
          person={person}
          people={people}
          baptismRecords={profileDetails.baptism.records}
        />

        <div className={cn(panelCard, "p-5")}>
          <SectionHeader
            icon={BookOpen}
            title="Discipleship Connections"
            description={
              discipleshipRole
                ? `Active as ${discipleshipRole}`
                : "No active discipleship enrollments"
            }
          />
          <div className="mt-4">
            {profileDetails.discipleship.activeEnrollments.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No active enrollments"
                description="Enroll this person in a discipleship track to track mentor connections."
              />
            ) : (
              <div className="space-y-2">
                {profileDetails.discipleship.activeEnrollments.map(
                  (entry, i) => (
                    <div
                      key={`${entry.trackName}-${i}`}
                      className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                    >
                      <p className="font-medium text-slate-900 dark:text-white">
                        {entry.trackName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                        {entry.role}
                        {entry.mentorName
                          ? ` · Mentor: ${entry.mentorName}`
                          : ""}
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        <div className={cn(panelCard, "p-5")}>
          <SectionHeader
            icon={GraduationCap}
            title="Training"
            description={`${activeTraining.length} in progress · ${completedTraining.length} completed`}
          />
          <div className="mt-4 space-y-4">
            {activeTraining.length === 0 && completedTraining.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No training history"
                description="Enroll this person in a training course to track progress."
              />
            ) : (
              <>
                {activeTraining.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">
                      In progress
                    </p>
                    {activeTraining.map(
                      ({ course, progressPercent, progress: p }) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                        >
                          <p className="font-medium text-slate-900 dark:text-white">
                            {course?.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                            {progressPercent}% complete
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}
                {trainingBadges.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">
                      Completed
                    </p>
                    {trainingBadges.map(badge => (
                      <div
                        key={badge.progressId}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                      >
                        <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {badge.courseName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-500">
                            {badge.category} ·{" "}
                            {new Date(badge.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className={cn(panelCard, "p-5")}>
          <SectionHeader
            icon={BookOpen}
            title="Discipleship Badges"
            description={`${discipleshipBadges.length} track${discipleshipBadges.length !== 1 ? "s" : ""} completed`}
          />
          <div className="mt-4">
            {discipleshipBadges.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No badges earned yet"
                description="Complete all milestones in a discipleship track to earn a badge."
              />
            ) : (
              <div className="space-y-2">
                {discipleshipBadges.map(badge => (
                  <button
                    key={badge.enrollmentId}
                    type="button"
                    onClick={() =>
                      router.push(`/discipleship/${badge.trackId}`)
                    }
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 hover:bg-slate-100/60 dark:border-zinc-700/70 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50 transition-colors text-left"
                  >
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${trackBadgeColors[badge.color] ?? trackBadgeColors.blue} flex items-center justify-center shadow-sm`}
                    >
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {badge.trackName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                        {badge.category} · Earned{" "}
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-lg shrink-0">
                      Completed
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={cn(panelCard, "p-5")}>
          <SectionHeader
            icon={CalendarDays}
            title="Programs & Events"
            description={`${personEvents.length} registration${personEvents.length !== 1 ? "s" : ""}`}
          />
          <div className="mt-4">
            {personEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No event history"
                description="Register this person for church events like VBS, camps, or retreats."
              />
            ) : (
              <div className="space-y-2">
                {personEvents.map(({ registration, event }) => (
                  <div
                    key={registration.id}
                    className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {event?.title ?? "Event"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                      {event?.type} · {registration.roleInEvent}
                      {event?.startDate
                        ? ` · ${new Date(event.startDate).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
