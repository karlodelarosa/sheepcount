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
import {
  getMembershipDisplayColor,
  getMembershipDisplayLabel,
  getNextMembershipPathType,
  MEMBERSHIP_PATH_LABELS,
} from "@/lib/membership-path";
import { PromoteMemberDialog } from "../_components/promote-member-dialog";
import { AssignMinistryDialog } from "../_components/assign-ministry-dialog";
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
  } = usePeople();
  const {
    getPersonMinistries,
    getPersonLifeGroups,
    workMinistries,
    assignWorkMinistryMember,
  } = useGroupsMinistry();

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
  const household = person ? getHousehold(person.householdId) : undefined;
  const householdMembers = person
    ? getHouseholdMembers(person.householdId, personId)
    : [];
  const inFamilyHousehold = person ? isInFamilyHousehold(person) : false;
  const hasHousehold = !!(person?.householdId && household);

  const lifeGroups = getPersonLifeGroups(personId);

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
              </div>
            </div>
            {!isEditing && (
              <div className="grid grid-cols-2 gap-2 sm:w-48 shrink-0">
                <StatTile label="Ministries" value={ministriesList.length} />
                <StatTile label="Life groups" value={lifeGroups.length} />
                <StatTile label="Attendance" value={`${attendanceRate}%`} />
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
                        {assignment.role}
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
        assignedMinistryIds={ministriesList.map(a => a.ministryId)}
        onAssign={(ministryId, role) =>
          void assignWorkMinistryMember(personId, ministryId, role)
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
        currentHouseholdId={hasHousehold ? person.householdId : undefined}
        canRemoveFromHousehold={inFamilyHousehold}
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
