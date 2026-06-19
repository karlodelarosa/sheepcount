"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  Home,
  Calendar,
  Award,
  UserCheck,
  Pencil,
  X,
  Save,
  Users,
  Trash2,
  MoreHorizontal,
  UserX,
  BookOpen,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/index";
import { useRouter } from "next/navigation";
import { mockAttendance } from "@/components/mock-data";
import { usePeople, type UpdatePersonInput } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { useDiscipleship } from "@/lib/discipleship";
import { useTraining } from "@/lib/training";
import { useEvents } from "@/lib/events";
import { buildPersonProfileDetails } from "@/lib/supabase/person-profile";
import {
  getMembershipDisplayColor,
  getMembershipDisplayLabel,
  getNextMembershipPathType,
  MEMBERSHIP_PATH_LABELS,
} from "@/lib/membership-path";
import { PromoteMemberDialog } from "../_components/promote-member-dialog";
import { AssignMinistryDialog } from "../_components/assign-ministry-dialog";
import { formatMinistryAssignmentLabel } from "@/lib/work-ministry-labels";
import { AssignHouseholdDialog } from "../_components/assign-household-dialog";
import { ConfirmPersonDialog } from "../_components/confirm-person-dialog";
import { BirthdateField } from "@/components/birthdate-field";
import {
  EmptyState,
  InfoTile,
  panelCard,
  PersonAvatar,
  SectionHeader,
  StatTile,
} from "../_components/person-detail-ui";
import { PersonHouseholdSection } from "../_components/person-household-section";
import { cn } from "@/lib/utils";

interface PersonDetailsProps {
  personId: string;
  onBack: () => void;
}

export function PersonDetails({ personId, onBack }: PersonDetailsProps) {
  const router = useRouter();
  const {
    hydrated,
    getPerson,
    getHousehold,
    getHouseholdMembers,
    isInFamilyHousehold,
    updatePerson,
    deletePerson,
    promoteAlongPath,
    assignToHousehold,
    removeFromHousehold,
    isSaving,
    households,
    people,
  } = usePeople();
  const {
    getPersonMinistries,
    getPersonLifeGroups,
    getPersonCellGroup,
    workMinistries,
    workMinistryTeams,
    workMinistryTeamRoles,
    assignWorkMinistryMember,
    cellGroups,
    cellGroupMembers,
  } = useGroupsMinistry();
  const {
    getPersonBadges,
    getPersonDiscipleshipRoles,
    tracks,
    enrollments,
  } = useDiscipleship();
  const {
    courses,
    modules,
    progress,
    getPersonTrainingBadges,
    getPersonActiveCourses,
    getPersonCompletedCourses,
  } = useTraining();
  const { events, registrations, getPersonEvents } = useEvents();

  const [isEditing, setIsEditing] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmInactiveOpen, setConfirmInactiveOpen] = useState(false);
  const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<UpdatePersonInput | null>(
    null,
  );
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editIsProspect, setEditIsProspect] = useState(false);

  const person = getPerson(personId);
  const ministriesList = getPersonMinistries(personId);
  const household = person?.householdId
    ? getHousehold(person.householdId)
    : undefined;
  const householdMembers = person?.householdId
    ? getHouseholdMembers(person.householdId, personId)
    : [];
  const inFamilyHousehold = person ? isInFamilyHousehold(person) : false;
  const hasHousehold = !!(person?.householdId && household);

  const lifeGroups = getPersonLifeGroups(personId);
  const cellGroup = getPersonCellGroup(personId);
  const discipleshipBadges = getPersonBadges(personId);
  const discipleshipRole = getPersonDiscipleshipRoles(personId);
  const trainingBadges = getPersonTrainingBadges(personId);
  const activeTraining = getPersonActiveCourses(personId);
  const completedTraining = getPersonCompletedCourses(personId);
  const personEvents = getPersonEvents(personId);

  const profileDetails = buildPersonProfileDetails({
    personId,
    people,
    cellGroups,
    cellGroupMembers,
    discipleshipTracks: tracks,
    discipleshipEnrollments: enrollments,
    trainingCourses: courses,
    courseModules: modules,
    courseProgress: progress,
    churchEvents: events,
    eventRegistrations: registrations,
  });

  const trackBadgeColors: Record<string, string> = {
    blue: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    green: "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
    purple: "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
    pink: "from-pink-500 to-pink-700 dark:from-rose-600 dark:to-pink-800",
    indigo: "from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800",
  };

  const attendanceRecords = mockAttendance.filter(r => r.personId === personId);
  const totalAttended = attendanceRecords.length;
  const attendanceRate = Math.round((totalAttended / 52) * 100);

  if (!hydrated) return null;

  if (!person) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-slate-900 dark:text-white">Person Not Found</h1>
        </div>
        <Card className="bg-white border-slate-200 dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className="p-8 text-center text-slate-500 dark:text-zinc-500">
            The requested person could not be found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
      case "Inactive":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300";
      case "Exited":
        return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
    }
  };

  const startEditing = () => {
    setEditRole(person.role);
    setEditStatus(person.status);
    setEditIsProspect(person.isProspect);
    setIsEditing(true);
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPendingUpdate({
      firstName: formData.get("firstName") as string,
      middleName: (formData.get("middleName") as string) || "",
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      birthdate: formData.get("birthdate") as string,
      email: (formData.get("email") as string) || "",
      role: editRole,
      status: editStatus as "Active" | "Inactive" | "Exited",
      isProspect: editIsProspect,
    });
    setConfirmEditOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!pendingUpdate) return;
    const updated = await updatePerson(personId, pendingUpdate);
    if (updated) {
      setConfirmEditOpen(false);
      setPendingUpdate(null);
      setIsEditing(false);
    }
  };

  const handleConfirmDelete = async () => {
    const deleted = await deletePerson(personId);
    if (deleted) {
      setConfirmDeleteOpen(false);
      onBack();
    }
  };

  const handleConfirmInactive = async () => {
    const updated = await updatePerson(personId, { status: "Inactive" });
    if (updated) setConfirmInactiveOpen(false);
  };

  const handleConfirmActivate = async () => {
    const updated = await updatePerson(personId, { status: "Active" });
    if (updated) setConfirmActivateOpen(false);
  };

  const nextMembershipStep = getNextMembershipPathType(person.membershipType);
  const canPromote = nextMembershipStep !== null;

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="shrink-0 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">
              Person Profile
            </p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              {person.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => (isEditing ? setIsEditing(false) : startEditing())}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </>
            )}
          </Button>

          {!isEditing && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-slate-200 dark:border-zinc-700"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border-slate-200/60 dark:border-zinc-700/60"
              >
                {canPromote && nextMembershipStep && (
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => setPromoteOpen(true)}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Promote to {MEMBERSHIP_PATH_LABELS[nextMembershipStep]}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg"
                  onClick={() => setHouseholdOpen(true)}
                >
                  <Home className="w-4 h-4 mr-2" />
                  {inFamilyHousehold
                    ? "Change Household"
                    : hasHousehold
                      ? "Join Family Household"
                      : "Assign to Household"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg"
                  onClick={() => setAssignOpen(true)}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Assign to Ministry
                </DropdownMenuItem>

                {(person.status === "Active" || person.status === "Inactive") && (
                  <>
                    <DropdownMenuSeparator />
                    {person.status === "Active" && (
                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg"
                        onClick={() => setConfirmInactiveOpen(true)}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Mark as Inactive
                      </DropdownMenuItem>
                    )}
                    {person.status === "Inactive" && (
                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg"
                        onClick={() => setConfirmActivateOpen(true)}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Mark as Active
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 rounded-lg"
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Person
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Profile hero */}
      <div className={cn(panelCard, "overflow-hidden")}>
        <div className="h-1.5 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-400 dark:from-purple-700 dark:via-purple-600 dark:to-purple-500" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <PersonAvatar name={person.name} size="lg" />
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {person.name}
                </h2>
                <p className="text-slate-600 dark:text-zinc-400 mt-0.5">
                  {person.role} · {person.age} years old
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={`rounded-lg ${getStatusColor(person.status)}`}
                >
                  {person.status}
                </Badge>
                <Badge
                  className={`rounded-lg ${getMembershipDisplayColor(person.membershipType, person.joinDate)}`}
                >
                  {getMembershipDisplayLabel(
                    person.membershipType,
                    person.joinDate,
                  )}
                </Badge>
                {person.isProspect && (
                  <Badge className="rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                    Prospect
                  </Badge>
                )}
                {discipleshipBadges.map(badge => (
                  <Badge
                    key={badge.enrollmentId}
                    className={`rounded-lg border-0 bg-gradient-to-r ${trackBadgeColors[badge.color] ?? trackBadgeColors.blue} text-white`}
                  >
                    <Award className="w-3 h-3 mr-1 inline" />
                    {badge.trackName}
                  </Badge>
                ))}
              </div>
            </div>
            {!isEditing && (
              <div className="grid grid-cols-2 gap-2 sm:w-48 shrink-0">
                <StatTile label="Ministries" value={ministriesList.length} />
                <StatTile label="Life groups" value={lifeGroups.length} />
                <StatTile label="Badges" value={discipleshipBadges.length + trainingBadges.length} />
                <StatTile label="Services" value={totalAttended} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-5">
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
                <form onSubmit={handleUpdate} className="space-y-4">
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
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="col-span-2">
                      <BirthdateField
                        key={`${personId}-${isEditing}`}
                        name="birthdate"
                        defaultValue={person.birthdate}
                        required
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
                      <Label htmlFor="role">Role</Label>
                      <Select value={editRole} onValueChange={setEditRole}>
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
                      <Select value={editStatus} onValueChange={setEditStatus}>
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
                    <div className="flex items-center justify-between rounded-xl border border-slate-200/60 p-4 dark:border-zinc-700/60">
                      <Label htmlFor="isProspect">Prospect</Label>
                      <Switch
                        id="isProspect"
                        checked={editIsProspect}
                        onCheckedChange={setEditIsProspect}
                      />
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
                  <InfoTile icon={Calendar} label="Join date">
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

          {/* Ministry */}
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
                  onClick={() => setAssignOpen(true)}
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
                      onClick={() => setAssignOpen(true)}
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
        </div>

        <div className="lg:col-span-2 space-y-5">
          <PersonHouseholdSection
            person={person}
            household={household}
            householdMembers={householdMembers}
            hasHousehold={hasHousehold}
            inFamilyHousehold={inFamilyHousehold}
            onAssignClick={() => setHouseholdOpen(true)}
          />

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
                  {profileDetails.discipleship.activeEnrollments.map((entry, i) => (
                    <div
                      key={`${entry.trackName}-${i}`}
                      className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                    >
                      <p className="font-medium text-slate-900 dark:text-white">
                        {entry.trackName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                        {entry.role}
                        {entry.mentorName ? ` · Mentor: ${entry.mentorName}` : ""}
                      </p>
                    </div>
                  ))}
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
                      {activeTraining.map(({ course, progressPercent, progress: p }) => (
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
                      ))}
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

          <div className={cn(panelCard, "p-5")}>
            <SectionHeader
              icon={CalendarDays}
              title="Spiritual Footprint Timeline"
              description="Chronological history across cell, discipleship, training, and events"
            />
            <div className="mt-4">
              {profileDetails.timeline.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="No history yet"
                  description="Activity will appear here as this person participates in church life."
                />
              ) : (
                <div className="space-y-2">
                  {profileDetails.timeline.map((entry, i) => (
                    <div
                      key={`${entry.kind}-${entry.date}-${i}`}
                      className="flex gap-3 p-3 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                    >
                      <div className="text-xs text-slate-500 dark:text-zinc-500 shrink-0 w-20 pt-0.5">
                        {new Date(entry.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {entry.label}
                        </p>
                        {entry.detail && (
                          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                            {entry.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                      onClick={() => router.push(`/discipleship/${badge.trackId}`)}
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
        </div>
      </div>

      <PromoteMemberDialog
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        personName={person.name}
        nextStepLabel={
          nextMembershipStep
            ? MEMBERSHIP_PATH_LABELS[nextMembershipStep]
            : "Next step"
        }
        onConfirm={() => {
          void promoteAlongPath(personId).then(() => setPromoteOpen(false));
        }}
      />

      <ConfirmPersonDialog
        open={confirmEditOpen}
        onOpenChange={open => {
          setConfirmEditOpen(open);
          if (!open) setPendingUpdate(null);
        }}
        variant="edit"
        personName={person.name}
        onConfirm={handleConfirmEdit}
        isLoading={isSaving}
      />

      <ConfirmPersonDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        variant="delete"
        personName={person.name}
        onConfirm={handleConfirmDelete}
        isLoading={isSaving}
      />

      <ConfirmPersonDialog
        open={confirmInactiveOpen}
        onOpenChange={setConfirmInactiveOpen}
        variant="inactive"
        personName={person.name}
        onConfirm={handleConfirmInactive}
        isLoading={isSaving}
      />

      <ConfirmPersonDialog
        open={confirmActivateOpen}
        onOpenChange={setConfirmActivateOpen}
        variant="activate"
        personName={person.name}
        onConfirm={handleConfirmActivate}
        isLoading={isSaving}
      />

      <AssignMinistryDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        personName={person.name}
        ministries={workMinistries}
        teams={workMinistryTeams}
        teamRoles={workMinistryTeamRoles}
        assignedMinistryIds={ministriesList.map(a => a.ministryId)}
        onAssign={(ministryId, role, options) =>
          void assignWorkMinistryMember(personId, ministryId, role, options)
        }
      />

      <AssignHouseholdDialog
        open={householdOpen}
        onOpenChange={setHouseholdOpen}
        personName={person.name}
        households={households.filter(
          h =>
            h.id !== person.householdId ||
            inFamilyHousehold,
        )}
        currentHouseholdId={person.householdId ?? undefined}
        canRemoveFromHousehold={hasHousehold}
        onAssign={async (householdId, role) => {
          await assignToHousehold(personId, householdId, role);
        }}
        onRemove={async () => {
          await removeFromHousehold(personId);
        }}
      />
    </div>
  );
}
