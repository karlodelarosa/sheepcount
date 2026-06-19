"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Users,
  Plus,
  Calendar,
  ArrowLeft,
  BookOpen,
  UserPlus,
  Edit2,
  Loader2,
  Pencil,
  Trash2,
  Crown,
} from "lucide-react";
import { usePeople, type HouseholdOtherResident, type Person } from "@/lib/people";
import { useBibleStudy } from "@/lib/bible-study";
import { AddBibleStudyGroupDialog } from "@/app/(protected)/bible-study/_components/add-bible-group-dialog";
import type { BibleStudyStatus } from "@/lib/supabase/bible-study";
import { AddHouseholdMemberDialog } from "../_components/add-household-member-dialog";
import { EditHouseholdDialog } from "../_components/edit-household-dialog";
import { OtherResidentDialog } from "../_components/other-resident-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface HouseholdDetailsProps {
  householdId: string;
  onBack: () => void;
}

// --- Dialog Component for Setting Role (Dual Mode Applied) ---
interface SetRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person | null;
  onRoleSet: (personId: string, role: string) => void;
}

function SetRoleDialog({
  open,
  onOpenChange,
  person,
  onRoleSet,
}: SetRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(person?.role || "Member");

  const handleSave = () => {
    if (person) {
      onRoleSet(person.id, selectedRole);
      onOpenChange(false);
    }
  };

  if (!person) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent: Apply dual-mode background and border */}
      <DialogContent className="sm:max-w-[425px] bg-white text-slate-900 border-slate-200 dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Set Role for {person.name}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Define the primary role of this person within the household unit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            {/* Label color */}
            <Label
              htmlFor="role"
              className="text-right text-slate-700 dark:text-zinc-300"
            >
              Role
            </Label>
            {/* Select component styling (assuming SelectTrigger/Content handle light/dark mode internally, using overrides for safety) */}
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger
                id="role"
                // Override select colors for dark mode clarity
                className="col-span-3 bg-white text-slate-900 border-slate-300 focus:ring-indigo-500 dark:bg-zinc-700 dark:text-white dark:border-zinc-600 dark:focus:ring-purple-500"
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              {/* SelectContent component relies on global styling, but here is a reminder for its dark mode look */}
              <SelectContent>
                <SelectItem value="Head">Head</SelectItem>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          {/* Button styling (Dual Mode) */}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700"
            onClick={handleSave}
          >
            Save Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// ---------------------------------------------

export function HouseholdDetails({
  householdId,
  onBack,
}: HouseholdDetailsProps) {
  const router = useRouter();
  const {
    hydrated,
    getHousehold,
    getHouseholdMembers,
    getHouseholdHead,
    getOtherResidents,
    updatePerson,
    deleteOtherResident,
    people,
    isSaving,
  } = usePeople();
  const { groups, getGroupMembers, getHouseholdBibleStudy } = useBibleStudy();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditHouseholdOpen, setIsEditHouseholdOpen] = useState(false);
  const [isOtherResidentOpen, setIsOtherResidentOpen] = useState(false);
  const [editingResident, setEditingResident] =
    useState<HouseholdOtherResident | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [personToSetRole, setPersonToSetRole] = useState<Person | null>(null);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 dark:text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading household...
      </div>
    );
  }

  const household = getHousehold(householdId);
  const members = getHouseholdMembers(householdId);
  const householdHead = getHouseholdHead(householdId);
  const otherResidents = getOtherResidents(householdId);

  // --- Not Found State (Dual Mode) ---
  if (!household) {
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
          <h1 className="text-slate-900 dark:text-white">
            Household Not Found
          </h1>
        </div>
        <Card className="bg-white border-slate-200 dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className="p-8 text-center text-slate-500 dark:text-zinc-500">
            The requested household could not be found.
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Bible Study (host household) ---
  const hostedBibleStudy =
    getHouseholdBibleStudy(householdId) ??
    groups
      .filter(g => g.householdId === householdId)
      .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];

  const bibleStudyMemberRows = hostedBibleStudy
    ? getGroupMembers(hostedBibleStudy.id)
        .map(m => people.find(p => p.id === m.personId))
        .filter((p): p is Person => Boolean(p))
    : [];

  const bibleStudyStatusLabels: Record<BibleStudyStatus, string> = {
    active: "Active",
    completed: "Completed",
    paused: "Paused",
    cancelled: "Cancelled",
  };

  const bibleStudyStatusClass: Record<BibleStudyStatus, string> = {
    active:
      "p-4 bg-green-100/50 rounded-xl border border-green-300 dark:bg-emerald-900/40 dark:border-emerald-700/60",
    completed:
      "p-4 bg-slate-100/50 rounded-xl border border-slate-300 dark:bg-zinc-800/40 dark:border-zinc-600/60",
    paused:
      "p-4 bg-amber-100/50 rounded-xl border border-amber-300 dark:bg-amber-900/40 dark:border-amber-700/60",
    cancelled:
      "p-4 bg-red-100/50 rounded-xl border border-red-300 dark:bg-red-900/40 dark:border-red-700/60",
  };

  const handleOpenRoleDialog = (person: Person) => {
    setPersonToSetRole(person);
    setIsRoleDialogOpen(true);
  };

  const handleRoleSet = async (personId: string, role: string) => {
    await updatePerson(personId, { role });
  };

  const handleOpenOtherResident = (resident?: HouseholdOtherResident) => {
    setEditingResident(resident ?? null);
    setIsOtherResidentOpen(true);
  };

  const handleDeleteResident = async (residentId: string) => {
    await deleteOtherResident(residentId);
  };

  const DualModeButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          // Dual mode button
          className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-slate-900 dark:text-white">Household Details</h1>
          <p className="text-slate-600 dark:text-zinc-400">
            Information for {household.name}
          </p>
        </div>
      </div>

      {/* Bible Study Status & Quick Info Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bible Study Status Card (Dual Mode) */}
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-slate-500 dark:text-zinc-300" />
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                Bible Study Group Status
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {hostedBibleStudy ? (
              <div className={bibleStudyStatusClass[hostedBibleStudy.status]}>
                <div className="flex items-center justify-between">
                  <p className="text-slate-900 font-medium dark:text-white">
                    {hostedBibleStudy.meetingDay} at {hostedBibleStudy.meetingTime}
                  </p>
                  <Badge className="rounded-lg">
                    {bibleStudyStatusLabels[hostedBibleStudy.status]}
                  </Badge>
                </div>
                <p className="text-slate-600 text-sm mt-1 dark:text-zinc-400">
                  {bibleStudyMemberRows.length} participant
                  {bibleStudyMemberRows.length !== 1 ? "s" : ""}:{" "}
                  {bibleStudyMemberRows.map(p => p.name).join(", ") || "None yet"}
                </p>
                {hostedBibleStudy.statusNotes &&
                  (hostedBibleStudy.status === "paused" ||
                    hostedBibleStudy.status === "cancelled") && (
                    <p className="text-sm mt-2 text-slate-600 dark:text-zinc-400">
                      {hostedBibleStudy.statusNotes}
                    </p>
                  )}
              </div>
            ) : (
              <div className="p-4 bg-amber-100/50 rounded-xl border border-amber-300 flex items-center justify-between dark:bg-amber-900/40 dark:border-amber-700/60">
                <p className="text-slate-900 font-medium dark:text-white">
                  This household is not hosting a Bible study yet.
                </p>
                <AddBibleStudyGroupDialog defaultHouseholdId={householdId}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/60"
                  >
                    Start Bible Study
                  </Button>
                </AddBibleStudyGroupDialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Household Info Card (Dual Mode) */}
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                Quick Info
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => setIsEditHouseholdOpen(true)}
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500 dark:text-zinc-500" />
              <div>
                <p className="text-slate-500 text-sm dark:text-zinc-500">
                  Address
                </p>
                <p className="text-slate-900 dark:text-white">
                  {household.address || "No address on file"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Crown className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500 dark:text-zinc-500" />
              <div>
                <p className="text-slate-500 text-sm dark:text-zinc-500">
                  Head of Family
                </p>
                <p className="text-slate-900 dark:text-white">
                  {householdHead?.name ?? "Not assigned"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500 dark:text-zinc-500" />
              <div>
                <p className="text-slate-500 text-sm dark:text-zinc-500">
                  Created
                </p>
                <p className="text-slate-900 dark:text-white">
                  {new Date(household.createdDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Section (Church Members) (Dual Mode) */}
      <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500 dark:text-zinc-300" />
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                Household Members ({members.length})
              </CardTitle>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddMemberOpen(true)}
              className={DualModeButtonClass}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Church Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
              <Table>
                <TableHeader>
                  {/* Dual mode table header row */}
                  <TableRow className="bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-700/50 dark:hover:bg-zinc-700/60">
                    <TableHead className="text-slate-600 dark:text-zinc-300">
                      Name
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">
                      Role
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">
                      Age
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => (
                    <TableRow
                      key={member.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        <button
                          type="button"
                          className="flex items-center gap-3 text-left hover:underline"
                          onClick={() => router.push(`/people/${member.id}`)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-purple-600 flex items-center justify-center shadow-sm">
                            <span className="text-white">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          {member.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        {/* Assuming default/secondary badges are globally styled for dark mode */}
                        <Badge
                          variant={
                            member.role === "Head" ? "default" : "secondary"
                          }
                          className="rounded-lg"
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-zinc-400">
                        {member.age}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-zinc-700/70"
                          onClick={() => handleOpenRoleDialog(member)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" /> Set Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-xl dark:text-zinc-500 dark:border-zinc-600">
              No church members assigned to this household yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Residents */}
      <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <CardTitle className="text-lg text-slate-900 dark:text-white">
                  Other Residents ({otherResidents.length})
                </CardTitle>
              </div>
              <CardDescription className="text-slate-600 dark:text-zinc-400 mt-1">
                People living here who have not attended church yet.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => handleOpenOtherResident()}
              className={DualModeButtonClass}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Resident
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {otherResidents.length > 0 ? (
            <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50/50 dark:bg-amber-900/20">
                    <TableHead className="text-slate-600 dark:text-zinc-300">
                      Name
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">
                      Relation
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">
                      Contact
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherResidents.map(resident => (
                    <TableRow
                      key={resident.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {resident.name}
                        {resident.notes && (
                          <p className="text-xs text-slate-500 dark:text-zinc-500 font-normal mt-0.5">
                            {resident.notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-zinc-400">
                        {resident.relation}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-zinc-400 text-sm">
                        {resident.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg"
                            disabled={isSaving}
                            onClick={() => handleOpenOtherResident(resident)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                            disabled={isSaving}
                            onClick={() => handleDeleteResident(resident.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-xl dark:text-zinc-500 dark:border-zinc-600">
              No other residents listed. Add tenants, relatives, or others who
              live here but haven&apos;t attended yet.
            </div>
          )}
        </CardContent>
      </Card>

      <EditHouseholdDialog
        open={isEditHouseholdOpen}
        onOpenChange={setIsEditHouseholdOpen}
        household={household}
        members={members}
        currentHead={householdHead}
      />

      <OtherResidentDialog
        open={isOtherResidentOpen}
        onOpenChange={open => {
          setIsOtherResidentOpen(open);
          if (!open) setEditingResident(null);
        }}
        householdId={household.id}
        householdName={household.name}
        resident={editingResident}
      />

      <AddHouseholdMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        householdId={household.id}
        householdName={household.name}
      />

      <SetRoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        person={personToSetRole}
        onRoleSet={handleRoleSet}
      />
    </div>
  );
}
