"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Home,
  Award,
  UserCheck,
  Pencil,
  X,
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
import { usePeople, type PersonGender, type UpdatePersonInput } from "@/lib/people";
import { useServiceAttendance } from "@/lib/service-attendance";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { useDiscipleship } from "@/lib/discipleship";
import { useTraining } from "@/lib/training";
import { useEvents } from "@/lib/events";
import { useGrowthTrackOptional } from "@/lib/growth-track";
import { buildPersonProfileDetails } from "@/lib/supabase/person-profile";
import {
  getMembershipDisplayColor,
  getMembershipDisplayLabel,
  getPersonVisitDate,
  getNextMembershipPathType,
  MEMBERSHIP_PATH_LABELS,
} from "@/lib/membership-path";
import { PromoteMemberDialog } from "../_components/promote-member-dialog";
import { AssignMinistryDialog } from "../_components/assign-ministry-dialog";
import { AssignHouseholdDialog } from "../_components/assign-household-dialog";
import { ConfirmPersonDialog } from "../_components/confirm-person-dialog";
import { PersonProfileHero } from "../_components/person-profile-hero";
import { PersonDetailTabs } from "../_components/person-detail-tabs";
import { SpiritualFootprintTimeline } from "../_components/spiritual-footprint-timeline";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useBaptism } from "@/lib/baptism";
import { buildPersonAttendanceStats } from "../_lib/person-attendance";
import { getPersonPastoralStatus } from "../_lib/person-pastoral-status";

interface PersonDetailsProps {
  personId: string;
  onBack: () => void;
}

export function PersonDetails({ personId, onBack }: PersonDetailsProps) {
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
  const { attendanceRows, hydrated: attendanceHydrated } =
    useServiceAttendance();
  const growthTrack = useGrowthTrackOptional();
  const { settings: orgSettings } = useOrganizationSettings();
  const { records: baptismRecords } = useBaptism();

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
  const [editGender, setEditGender] = useState<PersonGender | "">("");
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
    baptismRecords,
  });

  const trackBadgeColors: Record<string, string> = {
    blue: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    green: "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
    purple: "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
    pink: "from-pink-500 to-pink-700 dark:from-rose-600 dark:to-pink-800",
    indigo: "from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800",
  };

  const attendanceStats = buildPersonAttendanceStats(
    attendanceRows,
    personId,
    person?.lastAttendance,
  );

  const growthTrackPerson = growthTrack?.growthPeople.find(p => p.id === personId);
  const pastoralStatus = person
    ? getPersonPastoralStatus(
        person,
        attendanceRows,
        growthTrackPerson?.outreachPriority,
      )
    : null;

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
    setEditGender(person.gender ?? "");
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
      firstAttendance: (formData.get("firstAttendance") as string) || "",
      memberSince: (formData.get("memberSince") as string) || "",
      email: (formData.get("email") as string) || "",
      gender: editGender || null,
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
  const visitDate = getPersonVisitDate(person);
  const profileAchievement =
    discipleshipBadges.length > 0 && trainingBadges.length > 0
      ? "both"
      : discipleshipBadges.length > 0
        ? "discipleship"
        : trainingBadges.length > 0
          ? "training"
          : null;

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

      <div className="flex flex-col xl:flex-row gap-5 items-start">
        <div className="flex-1 min-w-0 space-y-5 w-full">
          <PersonProfileHero
            name={person.name}
            role={person.role}
            age={person.age}
            status={person.status}
            statusColorClass={getStatusColor(person.status)}
            membershipLabel={getMembershipDisplayLabel(
              person.membershipType,
              visitDate,
            )}
            membershipColorClass={getMembershipDisplayColor(
              person.membershipType,
              visitDate,
            )}
            isProspect={person.isProspect}
            isEditing={isEditing}
            discipleshipBadges={discipleshipBadges}
            trackBadgeColors={trackBadgeColors}
            quickStats={[
              { label: "Ministries", value: ministriesList.length },
              { label: "Life groups", value: lifeGroups.length },
              {
                label: "Badges",
                value: discipleshipBadges.length + trainingBadges.length,
              },
              {
                label: "Services",
                value: attendanceStats.totalAttended,
                hint:
                  attendanceStats.sundayRate > 0
                    ? `${attendanceStats.sundayRate}% Sun`
                    : undefined,
              },
            ]}
            pastoralStatus={pastoralStatus!}
            achievement={profileAchievement}
            showBaptismBadge={orgSettings.waterBaptismEnabled ?? false}
            baptizedAt={profileDetails.baptism.latestBaptizedAt}
          />

          <PersonDetailTabs
            personId={personId}
            person={person}
            pastoralStatus={pastoralStatus!}
            isEditing={isEditing}
            isSaving={isSaving}
            editRole={editRole}
            editStatus={editStatus}
            editGender={editGender}
            editIsProspect={editIsProspect}
            onEditRoleChange={setEditRole}
            onEditStatusChange={setEditStatus}
            onEditGenderChange={setEditGender}
            onEditIsProspectChange={setEditIsProspect}
            onUpdate={handleUpdate}
            household={household}
            householdMembers={householdMembers}
            hasHousehold={hasHousehold}
            inFamilyHousehold={inFamilyHousehold}
            onHouseholdAssignClick={() => setHouseholdOpen(true)}
            ministriesList={ministriesList}
            onAssignMinistryClick={() => setAssignOpen(true)}
            lifeGroups={lifeGroups}
            cellGroup={cellGroup}
            discipleshipRole={discipleshipRole}
            discipleshipBadges={discipleshipBadges}
            trainingBadges={trainingBadges}
            activeTraining={activeTraining}
            completedTraining={completedTraining}
            personEvents={personEvents}
            profileDetails={profileDetails}
            trackBadgeColors={trackBadgeColors}
            attendanceRows={attendanceRows}
            attendanceHydrated={attendanceHydrated}
            people={people}
          />
        </div>

        <aside className="w-full xl:w-72 shrink-0 xl:sticky xl:top-4 self-start">
          <SpiritualFootprintTimeline timeline={profileDetails.timeline} />
        </aside>
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
