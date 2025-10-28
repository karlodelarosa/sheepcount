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

// --- Mock Data Extensions (For demonstration purposes) ---
// NOTE: mockBibleStudyGroups should contain the group names/details if available
// Assuming mockBibleStudyGroups looks like: [{ id: "bsg1", name: "Sons of Thunder" }, ...]
// The groups variable below now correctly uses the imported mockBibleStudyGroups.

const mockNonMembers = [
  { id: "nm1", name: "Sarah Connor", relation: "Tenant", householdId: "h1" },
  { id: "nm2", name: "Kyle Reese", relation: "Friend", householdId: "h1" },
];
// --------------------------------------------------------

interface HouseholdDetailsProps {
  householdId: string;
  onBack: () => void;
}

// --- Dialog Component for Setting Role (Unchanged) ---
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Role for {person.name}</DialogTitle>
          <DialogDescription>
            Define the primary role of this person within the household unit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role" className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Role</Button>
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

  if (!household) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-slate-900">Household Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            The requested household could not be found.
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Bible Study Group Logic ---
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

  // NOTE: In a real app, this function would update the person data in your global state/API
  const handleRoleSet = (personId: string, role: string) => {
    console.log(`Updated role for ${personId} to: ${role}`);
    // Simulate update by refreshing or mutating state if necessary
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-slate-900">Household Details</h1>
          <p className="text-slate-600">Information for {household.name}</p>
        </div>
      </div>

      {/* Bible Study Status & Quick Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200/60 bg-white md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-slate-700" />
              <CardTitle className="text-lg">
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
                    className="p-4 bg-green-50 rounded-xl border border-green-200/60"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-green-800 font-medium">
                        Group:{" "}
                        <span className="text-green-600">{group.name}</span>
                      </p>
                      <Badge className="bg-green-100 text-green-700 rounded-lg">
                        <Check className="w-4 h-4 mr-1" /> Active
                      </Badge>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      {group.membersCount} household member(s) belong to this
                      group: {group.memberNames.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200/60 flex items-center justify-between">
                <p className="text-slate-900 font-medium">
                  Not yet assigned to a Bible Study group.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-yellow-500 text-yellow-700 hover:bg-yellow-100"
                >
                  Assign Group
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Household Info (from original component) */}
        <Card className="border-slate-200/60 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-600" />
              <div>
                <p className="text-slate-500 text-sm">Address</p>
                <p className="text-slate-900">{household.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-600" />
              <div>
                <p className="text-slate-500 text-sm">Created</p>
                <p className="text-slate-900">
                  {new Date(household.createdDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Section (Church Members) */}
      <Card className="border-slate-200/60 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-700" />
              <CardTitle className="text-lg">
                Household Members ({members.length})
              </CardTitle>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddMemberOpen(true)}
              className="rounded-lg bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Church Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="border border-slate-200/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
                            <span className="text-white">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          {member.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.role === "Head" ? "default" : "secondary"
                          }
                          className="rounded-lg"
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {member.age}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg"
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
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-xl">
              No church members assigned to this household yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Residents Section (Non-Members) */}
      <Card className="border-slate-200/60 bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-yellow-700" />
            <CardTitle className="text-lg">
              Other Residents ({otherResidents.length})
            </CardTitle>
          </div>
          <CardDescription>
            People living here who are not current church members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {otherResidents.length > 0 ? (
            <div className="border border-slate-200/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-yellow-50/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Relation</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherResidents.map(resident => (
                    <TableRow key={resident.id}>
                      <TableCell className="font-medium">
                        {resident.name}
                      </TableCell>
                      <TableCell>{resident.relation}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-blue-600 border-blue-200"
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
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-xl">
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
