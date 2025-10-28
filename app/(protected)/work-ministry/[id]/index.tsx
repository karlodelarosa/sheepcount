// app/ministries/[id]/index.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Used for navigation/back button
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, UserPlus, Search, ArrowLeft } from "lucide-react"; // Shield for Ministry icon
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface MinistryDetailPageProps {
  ministryId: string;
}

export function MinistryDetailPage({ ministryId }: MinistryDetailPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [newPersonId, setNewPersonId] = useState("");
  const [newRole, setNewRole] = useState("");

  const ministry = mockMinistries.find(m => m.id === ministryId);

  // Handle Ministry Not Found (Important for dynamic routes)
  if (!ministry) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Ministry Not Found
        </h1>
        <p className="text-slate-600 dark:text-zinc-400">
          The ministry ID "{ministryId}" does not exist.
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  // Data Logic
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
    member.person?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
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

  // Dual-Mode Classes (Kept consistent)
  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";

  // Ministry Icon Color Class (Set to a distinct color)
  const MinistryColorClass =
    "from-teal-500 to-teal-700 dark:from-sky-600 dark:to-cyan-800";

  return (
    // Top-level container spacing corrected to match the LifeGroup example's immediate content wrapping
    <div className="space-y-6">
      {/* HEADER SECTION - REVISED TO MATCH LIFEGROUP HEADER EXACTLY */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-zinc-700">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-slate-900 dark:text-white">
                {ministry.name}
              </h1>
              <p className="text-slate-600 dark:text-zinc-400">
                Manage members and roles for this team
              </p>
            </div>
          </div>
        </div>

        {/* Ministry ID badge */}
        <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
          Ministry ID: {ministryId}
        </Badge>
      </div>

      {/* Main Content: Split layout (Retains the structure and gap from the LifeGroup example) */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Add New Member Card */}
        <Card className="lg:col-span-1 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Add New Member
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Assign a new person and role to this ministry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-zinc-300">
                Select Person
              </Label>
              <Select value={newPersonId} onValueChange={setNewPersonId}>
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
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
              <Label className="text-slate-700 dark:text-zinc-300">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Lead">Team Lead</SelectItem>
                  <SelectItem value="Coordinator">Coordinator</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddMember}
              disabled={!newPersonId || !newRole}
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add to Ministry
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: Current Members List Card */}
        <Card className="lg:col-span-2 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                Current Members ({members.length})
              </CardTitle>
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
          </CardHeader>

          <CardContent className="p-0">
            {/* Member List Container */}
            <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-zinc-500">
                  {searchTerm
                    ? "No members found matching your search."
                    : "No members have been assigned yet."}
                </div>
              ) : (
                <div className="divide-y divide-slate-200/60 dark:divide-zinc-700/60 max-h-[60vh] overflow-y-auto">
                  {filteredMembers.map(member => (
                    <div
                      key={member.id}
                      className="p-4 flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}
                        >
                          <span className="text-white">
                            {member.person?.name?.charAt(0)}
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
                        <Badge
                          variant="secondary"
                          className={DualModeSecondaryBadgeClass}
                        >
                          {member.role}
                        </Badge>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
