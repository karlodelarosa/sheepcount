"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  mockLifeGroupMembers,
  mockLifeGroups,
  mockAttendance,
} from "@/components/mock-data";
import { usePeople } from "@/lib/people";
import { PromoteMemberDialog } from "../_components/promote-member-dialog";
import { AssignMinistryDialog } from "../_components/assign-ministry-dialog";
import { AssignHouseholdDialog } from "../_components/assign-household-dialog";
import { BirthdateField } from "@/components/birthdate-field";

interface PersonDetailsProps {
  personId: string;
  onBack: () => void;
}

export function PersonDetails({ personId, onBack }: PersonDetailsProps) {
  const router = useRouter();
  const {
    hydrated,
    getPerson,
    getPersonMinistries,
    getHousehold,
    getHouseholdMembers,
    isInFamilyHousehold,
    updatePerson,
    promoteToMember,
    assignToMinistry,
    assignToHousehold,
    removeFromHousehold,
    ministries,
    households,
  } = usePeople();

  const [isEditing, setIsEditing] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(false);
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

  const lifeGroups = mockLifeGroupMembers
    .filter(m => m.personId === personId)
    .map(m => ({
      ...m,
      group: mockLifeGroups.find(g => g.id === m.lifeGroupId),
    }));

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

  const getMembershipColor = (type: string) => {
    switch (type) {
      case "Worker":
        return "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300";
      case "Member":
        return "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300";
      case "Attender":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300";
      case "Prospect":
        return "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300";
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
    updatePerson(personId, {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      birthdate: formData.get("birthdate") as string,
      email: (formData.get("email") as string) || "",
      role: editRole,
      status: editStatus as "Active" | "Inactive" | "Exited",
      isProspect: editIsProspect,
    });
    setIsEditing(false);
  };

  const canPromote =
    person.isProspect ||
    person.membershipType === "Attender" ||
    person.membershipType === "Prospect" ||
    person.membershipType === "For Evangelism";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-slate-900 dark:text-white">Person Details</h1>
            <p className="text-slate-600 dark:text-zinc-400">
              View and manage person information
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canPromote && person.membershipType !== "Member" && (
            <Button
              variant="outline"
              onClick={() => setPromoteOpen(true)}
              className="rounded-xl"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Promote to Member
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setHouseholdOpen(true)}
            className="rounded-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            {inFamilyHousehold ? "Change Household" : "Assign to Household"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setAssignOpen(true)}
            className="rounded-xl"
          >
            <Award className="w-4 h-4 mr-2" />
            Assign to Ministry
          </Button>
          <Button
            onClick={() => (isEditing ? setIsEditing(false) : startEditing())}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel Edit
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Details
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-500 dark:from-purple-700 dark:to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl">
                    {person.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900 dark:text-white">
                    {person.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    {person.role} • {person.age} years old
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      className={`rounded-lg ${getStatusColor(person.status)}`}
                    >
                      {person.status}
                    </Badge>
                    <Badge
                      className={`rounded-lg ${getMembershipColor(person.membershipType)}`}
                    >
                      {person.membershipType}
                    </Badge>
                    {person.isProspect && (
                      <Badge className="rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                        Prospect
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={person.name}
                      required
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
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                    <div>
                      <p className="text-slate-500 dark:text-zinc-500">Email</p>
                      <p className="text-slate-900 dark:text-white">
                        {person.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                    <div>
                      <p className="text-slate-500 dark:text-zinc-500">Phone</p>
                      <p className="text-slate-900 dark:text-white">
                        {person.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                    <div>
                      <p className="text-slate-500 dark:text-zinc-500">
                        Birthdate
                      </p>
                      <p className="text-slate-900 dark:text-white">
                        {person.birthdate
                          ? new Date(person.birthdate).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                    <div>
                      <p className="text-slate-500 dark:text-zinc-500">
                        Household
                      </p>
                      {inFamilyHousehold ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/households/${person.householdId}`)
                          }
                          className="text-slate-900 dark:text-white hover:underline text-left"
                        >
                          {person.householdName}
                        </button>
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          Not assigned
                        </p>
                      )}
                      {inFamilyHousehold && (
                        <p className="text-sm text-slate-500 dark:text-zinc-500">
                          Role: {person.role}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                    <div>
                      <p className="text-slate-500 dark:text-zinc-500">
                        Join Date
                      </p>
                      <p className="text-slate-900 dark:text-white">
                        {new Date(person.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-500">
                Ministries
              </span>
              <span className="text-slate-900 dark:text-white">
                {ministriesList.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-500">
                Life Groups
              </span>
              <span className="text-slate-900 dark:text-white">
                {lifeGroups.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-500">
                Attendance Rate
              </span>
              <span className="text-slate-900 dark:text-white">
                {attendanceRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-500">
                Total Attended
              </span>
              <span className="text-slate-900 dark:text-white">
                {totalAttended}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white">
                Household
              </CardTitle>
              <Users className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
            </div>
          </CardHeader>
          <CardContent>
            {!inFamilyHousehold ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-zinc-500 mb-4">
                  Not part of a family household
                </p>
                <Button
                  variant="outline"
                  onClick={() => setHouseholdOpen(true)}
                  className="rounded-xl"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Assign to Household
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/households/${person.householdId}`)
                      }
                      className="text-slate-900 dark:text-white font-medium hover:underline"
                    >
                      {person.householdName}
                    </button>
                    <Badge variant="secondary" className="rounded-lg">
                      {person.role}
                    </Badge>
                  </div>
                  {household?.address && (
                    <p className="text-slate-600 dark:text-zinc-400 mt-2 text-sm flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {household.address}
                    </p>
                  )}
                </div>

                {householdMembers.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-zinc-500 mb-2">
                      Family Members
                    </p>
                    <div className="space-y-2">
                      {householdMembers.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => router.push(`/people/${member.id}`)}
                          className="w-full p-3 flex items-center justify-between bg-slate-50 rounded-xl border border-slate-200/60 hover:bg-slate-100 dark:bg-zinc-700 dark:border-zinc-600/60 dark:hover:bg-zinc-600/60 transition-colors text-left"
                        >
                          <span className="text-slate-900 dark:text-white">
                            {member.name}
                          </span>
                          <Badge variant="secondary" className="rounded-lg">
                            {member.role}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHouseholdOpen(true)}
                  className="rounded-xl"
                >
                  Change Household
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white">
                Ministry Assignments
              </CardTitle>
              <Award className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
            </div>
          </CardHeader>
          <CardContent>
            {ministriesList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-zinc-500 mb-4">
                  Not assigned to any ministries
                </p>
                <Button
                  variant="outline"
                  onClick={() => setAssignOpen(true)}
                  className="rounded-xl"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Assign to Ministry
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {ministriesList.map(assignment => (
                  <div
                    key={assignment.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-slate-900 dark:text-white">
                        {assignment.ministry?.name}
                      </p>
                      <Badge variant="secondary" className="rounded-lg">
                        {assignment.role}
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 mt-1 text-sm">
                      {assignment.ministry?.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Life Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lifeGroups.length === 0 ? (
              <p className="text-slate-500 dark:text-zinc-500 text-center py-8">
                Not part of any life groups
              </p>
            ) : (
              <div className="space-y-3">
                {lifeGroups.map(membership => (
                  <div
                    key={membership.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60"
                  >
                    <p className="text-slate-900 dark:text-white">
                      {membership.group?.name}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400 mt-1 text-sm">
                      {membership.group?.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PromoteMemberDialog
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        personName={person.name}
        onConfirm={() => {
          promoteToMember(personId);
          setPromoteOpen(false);
        }}
      />

      <AssignMinistryDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        personName={person.name}
        ministries={ministries}
        assignedMinistryIds={ministriesList.map(a => a.ministryId)}
        onAssign={(ministryId, role) =>
          assignToMinistry(personId, ministryId, role)
        }
      />

      <AssignHouseholdDialog
        open={householdOpen}
        onOpenChange={setHouseholdOpen}
        personName={person.name}
        households={households}
        currentHouseholdId={
          inFamilyHousehold ? person.householdId : undefined
        }
        onAssign={(householdId, role) =>
          assignToHousehold(personId, householdId, role)
        }
        onRemove={() => removeFromHousehold(personId)}
      />
    </div>
  );
}
