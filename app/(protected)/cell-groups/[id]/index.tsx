"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, UserPlus, Search, ArrowLeft, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonSelect } from "@/components/person-select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";

interface CellGroupDetailsProps {
  groupId: string;
  onBack: () => void;
}

const MAX_CELL_SIZE = 4;

export function CellGroupDetails({ groupId, onBack }: CellGroupDetailsProps) {
  const { people } = usePeople();
  const {
    cellGroups,
    cellGroupMembers,
    hydrated,
    isSaving,
    assignCellGroupMember,
    removeCellGroupMemberById,
  } = useGroupsMinistry();
  const [searchTerm, setSearchTerm] = useState("");
  const [newPersonId, setNewPersonId] = useState("");
  const [newRole, setNewRole] = useState<"Leader" | "Member">("Member");

  const group = cellGroups.find(g => g.id === groupId);

  const memberships = useMemo(
    () => cellGroupMembers.filter(m => m.cellGroupId === groupId),
    [cellGroupMembers, groupId],
  );

  const members = useMemo(
    () =>
      memberships.map(m => ({
        ...m,
        person: people.find(p => p.id === m.personId),
      })),
    [memberships, people],
  );

  const peopleInOtherCells = useMemo(
    () => new Set(cellGroupMembers.map(m => m.personId)),
    [cellGroupMembers],
  );

  const availablePeople = useMemo(
    () =>
      people.filter(
        person =>
          !memberships.some(m => m.personId === person.id) &&
          !peopleInOtherCells.has(person.id),
      ),
    [people, memberships, peopleInOtherCells],
  );

  const filteredMembers = members.filter(member =>
    member.person?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const atCapacity = members.length >= MAX_CELL_SIZE;

  const handleAddMember = async () => {
    if (!newPersonId || atCapacity) return;
    const result = await assignCellGroupMember(groupId, newPersonId, newRole);
    if (result) {
      setNewPersonId("");
      setNewRole("Member");
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    await removeCellGroupMemberById(membershipId);
  };

  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading cell group...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-slate-900 dark:text-white">Group Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-zinc-700">
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
            <h1 className="text-slate-900 dark:text-white">{group.name}</h1>
            <p className="text-slate-600 dark:text-zinc-400">
              {group.description || "Small group Bible study and accountability"}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
          {members.length}/{MAX_CELL_SIZE} members
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Add Member
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Cell groups are kept small (3–4 people). A person can only belong
              to one cell group at a time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Person</Label>
              <PersonSelect
                people={availablePeople}
                value={newPersonId}
                onValueChange={setNewPersonId}
                placeholder="Choose a person"
                triggerClassName={DualModeInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newRole}
                onValueChange={v => setNewRole(v as "Leader" | "Member")}
              >
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Leader">Leader</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => void handleAddMember()}
              disabled={!newPersonId || atCapacity || isSaving}
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {atCapacity ? "Group Full" : "Add to Cell Group"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Members ({members.length})
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`pl-9 ${DualModeInputClass}`}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-zinc-500">
                  No members yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-200/60 dark:divide-zinc-700/60">
                  {filteredMembers.map(member => (
                    <div
                      key={member.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                        >
                          <span className="text-white">
                            {member.person?.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-medium">
                            {member.person?.name}
                          </p>
                          <p className="text-slate-600 dark:text-zinc-400 text-sm">
                            {member.person?.householdName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                          {member.role}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleRemoveMember(member.id)}
                          disabled={isSaving}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
