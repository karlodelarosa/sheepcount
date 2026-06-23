"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, UserPlus, Search, ArrowLeft, Settings2, UserCog } from "lucide-react";
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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { formatMinistryAssignmentLabel } from "@/lib/work-ministry-labels";
import { ManageMinistryTeamsDialog } from "../_components/manage-ministry-teams-dialog";
import { AssignDepartmentHeadDialog } from "../_components/assign-department-head-dialog";

interface MinistryDetailPageProps {
  ministryId: string;
}

const LEADERSHIP_ROLES = [
  "Team Lead",
  "Coordinator",
  "Member",
  "Assistant",
] as const;

export function MinistryDetailPage({ ministryId }: MinistryDetailPageProps) {
  const router = useRouter();
  const { people } = usePeople();
  const {
    workMinistries,
    workMinistryMembers,
    getMinistryTeams,
    getTeamRoleOptions,
    hydrated,
    isSaving,
    assignWorkMinistryMember,
    removeWorkMinistryMemberById,
  } = useGroupsMinistry();
  const [searchTerm, setSearchTerm] = useState("");
  const [newPersonId, setNewPersonId] = useState("");
  const [newTeamId, setNewTeamId] = useState("");
  const [newServiceRole, setNewServiceRole] = useState("");
  const [newRole, setNewRole] = useState("");
  const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);
  const [headDialogOpen, setHeadDialogOpen] = useState(false);

  const ministry = workMinistries.find(m => m.id === ministryId);
  const teams = getMinistryTeams(ministryId);
  const hasTeams = teams.length > 0;
  const teamRoleOptions = newTeamId ? getTeamRoleOptions(newTeamId) : [];

  const assignments = useMemo(
    () => workMinistryMembers.filter(a => a.ministryId === ministryId),
    [workMinistryMembers, ministryId],
  );

  const members = useMemo(
    () =>
      assignments.map(a => ({
        ...a,
        person: people.find(p => p.id === a.personId),
        team: teams.find(t => t.id === a.teamId),
      })),
    [assignments, people, teams],
  );

  const availablePeople = useMemo(
    () =>
      people.filter(
        person => !assignments.some(a => a.personId === person.id),
      ),
    [people, assignments],
  );

  const filteredMembers = members.filter(member =>
    member.person?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const membersByTeam = useMemo(() => {
    const grouped = new Map<string | null, typeof filteredMembers>();
    for (const member of filteredMembers) {
      const key = member.teamId;
      const list = grouped.get(key) ?? [];
      list.push(member);
      grouped.set(key, list);
    }
    return grouped;
  }, [filteredMembers]);

  const teamSections = useMemo(() => {
    const sections = teams.map(team => ({
      id: team.id,
      name: team.name,
      members: membersByTeam.get(team.id) ?? [],
    }));
    const unassigned = membersByTeam.get(null) ?? [];
    if (unassigned.length > 0 || !hasTeams) {
      sections.push({
        id: "unassigned",
        name: hasTeams ? "Unassigned to team" : "All members",
        members: unassigned.length > 0 ? unassigned : filteredMembers,
      });
    }
    return sections.filter(section => section.members.length > 0 || section.id !== "unassigned");
  }, [teams, membersByTeam, hasTeams, filteredMembers]);

  const canAddMember =
    newPersonId &&
    newRole &&
    (!hasTeams || (newTeamId && newServiceRole));

  const handleAddMember = async () => {
    if (!canAddMember) return;
    const result = await assignWorkMinistryMember(
      ministryId,
      newPersonId,
      newRole,
      {
        teamId: hasTeams ? newTeamId : null,
        serviceRole: hasTeams ? newServiceRole : "",
      },
    );
    if (result) {
      setNewPersonId("");
      setNewTeamId("");
      setNewServiceRole("");
      setNewRole("");
    }
  };

  const handleRemoveMember = async (assignmentId: string) => {
    await removeWorkMinistryMemberById(assignmentId);
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
        Loading ministry...
      </div>
    );
  }

  if (!ministry) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Ministry Not Found
        </h1>
        <p className="text-slate-600 dark:text-zinc-400">
          The ministry ID &quot;{ministryId}&quot; does not exist.
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
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
            onClick={() => router.back()}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-slate-900 dark:text-white">{ministry.name}</h1>
            <p className="text-slate-600 dark:text-zinc-400">
              {ministry.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setHeadDialogOpen(true)}
            className="rounded-xl border-slate-200 dark:border-zinc-700"
          >
            <UserCog className="w-4 h-4 mr-2" />
            Department Head
          </Button>
          <Button
            variant="outline"
            onClick={() => setTeamsDialogOpen(true)}
            className="rounded-xl border-slate-200 dark:border-zinc-700"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Manage Teams
          </Button>
        </div>
      </div>

      {hasTeams && (
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 dark:text-white">
              Teams ({teams.length})
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Sub-teams within this ministry. Assign members to a team and
              service role when adding them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {teams.map(team => {
                const count = members.filter(m => m.teamId === team.id).length;
                const roles = getTeamRoleOptions(team.id);
                return (
                  <div
                    key={team.id}
                    className="rounded-xl border border-slate-200/60 px-3 py-2 dark:border-zinc-700/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white text-sm">
                        {team.name}
                      </span>
                      <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                        {count}
                      </Badge>
                    </div>
                    {roles.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                        {roles.map(r => r.name).join(", ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Add New Member
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              {hasTeams
                ? "Assign a person to a team and their service role."
                : "Set up teams first, or assign with a leadership role only."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-zinc-300">
                Select Person
              </Label>
              <PersonSelect
                people={availablePeople}
                value={newPersonId}
                onValueChange={setNewPersonId}
                placeholder="Choose a person"
                triggerClassName={DualModeInputClass}
              />
            </div>

            {hasTeams && (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-zinc-300">Team</Label>
                  <Select
                    value={newTeamId}
                    onValueChange={value => {
                      setNewTeamId(value);
                      setNewServiceRole("");
                    }}
                  >
                    <SelectTrigger className={DualModeInputClass}>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-zinc-300">
                    Service Role
                  </Label>
                  {teamRoleOptions.length > 0 ? (
                    <Select
                      value={newServiceRole}
                      onValueChange={setNewServiceRole}
                    >
                      <SelectTrigger className={DualModeInputClass}>
                        <SelectValue placeholder="Select service role" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamRoleOptions.map(role => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="e.g. Musician"
                      value={newServiceRole}
                      onChange={e => setNewServiceRole(e.target.value)}
                      className={DualModeInputClass}
                      disabled={!newTeamId}
                    />
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-zinc-300">
                Leadership Role
              </Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue placeholder="Select leadership role" />
                </SelectTrigger>
                <SelectContent>
                  {LEADERSHIP_ROLES.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!hasTeams && (
              <p className="text-xs text-slate-500 dark:text-zinc-500">
                Use &quot;Manage Teams&quot; to create sub-teams like Production
                Team or Digital Ministry, then assign specific service roles.
              </p>
            )}

            <Button
              onClick={() => void handleAddMember()}
              disabled={!canAddMember || isSaving}
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add to Ministry
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                Current Members ({members.length})
              </CardTitle>
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
            <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-zinc-500">
                  {searchTerm
                    ? "No members found matching your search."
                    : "No members have been assigned yet."}
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto">
                  {teamSections.map(section => (
                    <div key={section.id}>
                      {hasTeams && (
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/60 dark:bg-zinc-900/40 dark:border-zinc-700/60">
                          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                            {section.name} ({section.members.length})
                          </span>
                        </div>
                      )}
                      <div className="divide-y divide-slate-200/60 dark:divide-zinc-700/60">
                        {section.members.map(member => (
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
                                {formatMinistryAssignmentLabel(member)}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => void handleRemoveMember(member.id)}
                                disabled={isSaving}
                                className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ManageMinistryTeamsDialog
        open={teamsDialogOpen}
        onOpenChange={setTeamsDialogOpen}
        ministryId={ministryId}
        ministryName={ministry.name}
      />

      <AssignDepartmentHeadDialog
        open={headDialogOpen}
        onOpenChange={setHeadDialogOpen}
        ministryId={ministryId}
        ministryName={ministry.name}
        currentHeadPersonId={ministry.headPersonId}
      />
    </div>
  );
}
