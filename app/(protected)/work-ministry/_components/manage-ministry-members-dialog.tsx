"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, UserPlus, Search } from "lucide-react";
import {
  mockMinistryAssignments,
  mockPeople,
  mockMinistries,
} from "@/components/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ManageMinistryMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ministryId: string | null;
}

export function ManageMinistryMembersDialog({
  open,
  onOpenChange,
  ministryId,
}: ManageMinistryMembersDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newPersonId, setNewPersonId] = useState("");
  const [newRole, setNewRole] = useState("");

  const ministry = mockMinistries.find(m => m.id === ministryId);
  const assignments = mockMinistryAssignments.filter(
    a => a.ministryId === ministryId,
  );
  const members = assignments.map(a => ({
    ...a,
    person: mockPeople.find(p => p.id === a.personId),
  }));

  const availablePeople = mockPeople.filter(
    person => !assignments.some(a => a.personId === person.id),
  );

  const filteredMembers = members.filter(member =>
    member.person?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddMember = () => {
    if (newPersonId && newRole) {
      console.log("Adding member to ministry:", {
        ministryId,
        personId: newPersonId,
        role: newRole,
      });
      setNewPersonId("");
      setNewRole("");
    }
  };

  const handleRemoveMember = (assignmentId: string) => {
    console.log("Removing member from ministry:", assignmentId);
  };

  // Dual-Mode Primary Button Class
  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";

  // Dual-Mode Input/Select Class
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";

  // Dual-Mode Neutral Avatar Color (Used for member icons)
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";

  // Dual-Mode Secondary Badge Class
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent: Dual Mode Styling */}
      <DialogContent className="sm:max-w-[700px] bg-white border-slate-200/60 dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Manage Ministry Members
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            {ministry
              ? `Managing members for ${ministry.name}`
              : "Manage ministry team members"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Member (Dual Mode) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-4 dark:bg-zinc-900/40 dark:border-zinc-700">
            <h3 className="text-slate-900 dark:text-white">Add New Member</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-zinc-300">
                  Select Person
                </Label>
                <Select value={newPersonId} onValueChange={setNewPersonId}>
                  <SelectTrigger className={DualModeInputClass}>
                    <SelectValue placeholder="Choose a person" />
                  </SelectTrigger>
                  {/* SelectContent component relies on global styling */}
                  <SelectContent>
                    {availablePeople.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} - {person.householdName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-zinc-300">
                  Role
                </Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className={DualModeInputClass}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  {/* SelectContent component relies on global styling */}
                  <SelectContent>
                    <SelectItem value="Team Lead">Team Lead</SelectItem>
                    <SelectItem value="Coordinator">Coordinator</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Assistant">Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleAddMember}
              disabled={!newPersonId || !newRole}
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add to Ministry
            </Button>
          </div>

          {/* Current Members (Dual Mode) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 dark:text-white">
                Current Members ({members.length})
              </h3>
              {/* Search Input (Dual Mode) */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`pl-9 ${DualModeInputClass}`}
                />
              </div>
            </div>

            {/* Member List Container (Dual Mode) */}
            <div className="border border-slate-200/60 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto dark:border-zinc-700/60">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-zinc-500">
                  {searchTerm ? "No members found" : "No members yet"}
                </div>
              ) : (
                <div className="divide-y divide-slate-200/60 dark:divide-zinc-700/60">
                  {filteredMembers.map(member => (
                    <div
                      key={member.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-3">
                        {/* Member Avatar (Dual Mode Gradient) */}
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}
                        >
                          <span className="text-white">
                            {member.person?.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white">
                            {member.person?.name}
                          </p>
                          <p className="text-slate-600 dark:text-zinc-400">
                            {member.person?.householdName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Role Badge (Dual Mode) */}
                        <Badge
                          variant="secondary"
                          className={DualModeSecondaryBadgeClass}
                        >
                          {member.role}
                        </Badge>
                        {/* Remove Button (Dual Mode) */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(member.id)}
                          className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
