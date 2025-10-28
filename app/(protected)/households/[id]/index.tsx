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
  Check,
  Edit2,
} from "lucide-react";
import {
  mockHouseholds,
  mockPeople,
  mockBibleStudyMembers,
  mockBibleStudyGroups,
} from "@/components/mock-data";
import { AddHouseholdMemberDialog } from "../_components/add-household-member-dialog";
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

const mockNonMembers = [
  { id: "nm1", name: "Sarah Connor", relation: "Tenant", householdId: "h1" },
  { id: "nm2", name: "Kyle Reese", relation: "Friend", householdId: "h1" },
];
// --------------------------------------------------------

interface HouseholdDetailsProps {
  householdId: string;
  onBack: () => void;
}

// --- Dialog Component for Setting Role (Dual Mode Applied) ---
interface SetRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: any;
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
          <DialogTitle className="dark:text-white">Set Role for {person.name}</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Define the primary role of this person within the household unit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            {/* Label color */}
            <Label htmlFor="role" className="text-right text-slate-700 dark:text-zinc-300">
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
                <SelectItem value="Member">General Member</SelectItem>
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
          <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700" onClick={handleSave}>
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
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [personToSetRole, setPersonToSetRole] = useState<any>(null);

  const household = mockHouseholds.find(h => h.id === householdId);
  const members = mockPeople.filter(p => p.householdId === householdId); // Filter members by household ID
  const otherResidents = mockNonMembers.filter(
    nm => nm.householdId === householdId,
  );

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
          <h1 className="text-slate-900 dark:text-white">Household Not Found</h1>
        </div>
        <Card className="bg-white border-slate-200 dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className="p-8 text-center text-slate-500 dark:text-zinc-500">
            The requested household could not be found.
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Bible Study Group Logic (Unchanged) ---
  const memberIds = members.map(m => m.id);
  const householdGroups = mockBibleStudyMembers
    .filter(bsm => memberIds.includes(bsm.personId))
    .reduce((acc, bsm) => {
      if (!acc.has(bsm.bibleStudyId)) {
        const group = mockBibleStudyGroups.find(g => g.id === bsm.bibleStudyId);
        if (group) {
          acc.set(bsm.bibleStudyId, {
            name: group.name,
            membersCount: 0,
            memberNames: [] as string[],
          });
        }
      }
      if (acc.has(bsm.bibleStudyId)) {
        acc.get(bsm.bibleStudyId)!.membersCount++;
        const personName =
          mockPeople.find(p => p.id === bsm.personId)?.name || "Unknown";
        acc.get(bsm.bibleStudyId)!.memberNames.push(personName);
      }
      return acc;
    }, new Map<string, { name: string; membersCount: number; memberNames: string[] }>());

  const bibleStudyGroups = Array.from(householdGroups.values());
  // -------------------------------

  const handleOpenRoleDialog = (person: any) => {
    setPersonToSetRole(person);
    setIsRoleDialogOpen(true);
  };

  const handleRoleSet = (personId: string, role: string) => {
    console.log(`Updated role for ${personId} to: ${role}`);
    // Simulate update by refreshing or mutating state if necessary
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
          <p className="text-slate-600 dark:text-zinc-400">Information for {household.name}</p>
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
            {bibleStudyGroups.length > 0 ? (
              <div className="space-y-3">
                {bibleStudyGroups.map((group, index) => (
                  <div
                    key={index}
                    // Dual mode green accent background/border
                    className="p-4 bg-green-100/50 rounded-xl border border-green-300 dark:bg-emerald-900/40 dark:border-emerald-700/60"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-green-700 font-medium dark:text-emerald-300">
                        Group:{" "}
                        <span className="text-green-800 dark:text-emerald-400">{group.name}</span>
                      </p>
                      <Badge className="bg-green-700 text-white dark:bg-emerald-800 dark:text-emerald-300 rounded-lg">
                        <Check className="w-4 h-4 mr-1" /> Active
                      </Badge>
                    </div>
                    <p className="text-green-600 text-sm mt-1 dark:text-emerald-500">
                      {group.membersCount} household member(s) belong to this
                      group: {group.memberNames.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              // Dual mode yellow accent (for unassigned status)
              <div className="p-4 bg-amber-100/50 rounded-xl border border-amber-300 flex items-center justify-between dark:bg-amber-900/40 dark:border-amber-700/60">
                <p className="text-slate-900 font-medium dark:text-white">
                  Not yet assigned to a Bible Study group.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  // Button accent for unassigned status
                  className="rounded-lg border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/60"
                >
                  Assign Group
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Household Info Card (Dual Mode) */}
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500 dark:text-zinc-500" />
              <div>
                <p className="text-slate-500 text-sm dark:text-zinc-500">Address</p>
                <p className="text-slate-900 dark:text-white">{household.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500 dark:text-zinc-500" />
              <div>
                <p className="text-slate-500 text-sm dark:text-zinc-500">Created</p>
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
                    <TableHead className="text-slate-600 dark:text-zinc-300">Name</TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">Role</TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">Age</TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => (
                    <TableRow key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50">
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-purple-600 flex items-center justify-center shadow-sm">
                            <span className="text-white">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          {member.name}
                        </div>
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

      {/* Other Residents Section (Non-Members) (Dual Mode) */}
      <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <CardTitle className="text-lg text-slate-900 dark:text-white">
              Other Residents ({otherResidents.length})
            </CardTitle>
          </div>
          <CardDescription className="text-slate-600 dark:text-zinc-400">
            People living here who are not current church members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {otherResidents.length > 0 ? (
            <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
              <Table>
                <TableHeader>
                  {/* Dual mode table header with yellow accent */}
                  <TableRow className="bg-amber-100/50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/40">
                    <TableHead className="text-slate-600 dark:text-zinc-300">Name</TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">Relation</TableHead>
                    <TableHead className="text-slate-600 dark:text-zinc-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherResidents.map(resident => (
                    <TableRow key={resident.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50">
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {resident.name}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-zinc-400">
                        {resident.relation}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          // Dual mode blue accent for follow-up button
                          className="rounded-lg text-blue-700 border-blue-400 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:border-blue-800 dark:bg-blue-900/40 dark:hover:bg-blue-900/60"
                          onClick={() =>
                            router.push(`/evangelism/prospects/${resident.id}`)
                          }
                        >
                          View/Follow Up
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-xl dark:text-zinc-500 dark:border-zinc-600">
              No other residents listed.
            </div>
          )}
        </CardContent>
      </Card>

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