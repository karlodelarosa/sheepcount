"use client";

import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, HeartHandshake, MapPin, UserRoundPlus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AssignLeadersDialog } from "./assign-leaders-dialog";
import { useTenant } from "@/app/providers/tenant-provider";

export function CellGroupsList() {
  const router = useRouter();
  const { tenant } = useTenant();
  const isAdmin = tenant?.profile.role === "admin";
  const { people } = usePeople();
  const {
    cellGroups,
    cellGroupMembers,
    cellGroupLeaders,
    hydrated,
    isSaving,
    addCellGroup,
    assignCellGroupLeaders,
    revokeCellGroupLeader,
    searchCellGroupLeaderCandidates,
  } = useGroupsMinistry();
  const [showCreate, setShowCreate] = useState(false);
  const [showAssignLeaders, setShowAssignLeaders] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const getGroupMembers = (groupId: string) => {
    const memberships = cellGroupMembers.filter(m => m.cellGroupId === groupId);
    return memberships.map(membership => ({
      ...membership,
      person: people.find(p => p.id === membership.personId),
    }));
  };

  const activeGroups = useMemo(
    () => cellGroups.filter(g => g.status === "active"),
    [cellGroups],
  );
  const ungroupedLeaders = useMemo(
    () => cellGroupLeaders.filter(leader => leader.activeGroupCount === 0),
    [cellGroupLeaders],
  );

  const handleCreate = async () => {
    if (!name.trim()) return;
    const group = await addCellGroup({ name, description, location });
    if (group) {
      setName("");
      setDescription("");
      setLocation("");
      setShowCreate(false);
      router.push(`/cell-groups/${group.id}`);
    }
  };

  const DualModePrimaryButtonClass =
    "rounded-xl text-white shadow-lg bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40";
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-zinc-700 dark:to-zinc-500";

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading cell groups...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                Cell Groups
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400 max-w-2xl">
                Open feeder-course communities where people build relationships,
                study Scripture, and prepare for intentional discipleship.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setShowAssignLeaders(true)}
                >
                  <UserRoundPlus className="mr-2 h-4 w-4" />
                  Assign Leaders
                </Button>
              )}
              <Button
                onClick={() => setShowCreate(v => !v)}
                className={DualModePrimaryButtonClass}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Cell Group
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showCreate && (
            <Card className="border-slate-200/60 dark:border-zinc-700/60">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 dark:text-white">
                  Create Cell Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Group Name</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Cell Group Alpha"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Location</Label>
                  <Input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g., Santos residence"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Meeting schedule, focus area, etc."
                  />
                </div>
                <Button
                  onClick={() => void handleCreate()}
                  disabled={!name.trim() || isSaving}
                  className={DualModePrimaryButtonClass}
                >
                  Create
                </Button>
              </CardContent>
            </Card>
          )}

          {isAdmin && ungroupedLeaders.length > 0 && (
            <section
              aria-labelledby="ungrouped-leaders-heading"
              className="space-y-3"
            >
              <div>
                <h2
                  id="ungrouped-leaders-heading"
                  className="font-semibold text-slate-900 dark:text-white"
                >
                  Leaders without a group
                </h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  Approved to set up their first Circle when they are ready.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {ungroupedLeaders.map(leader => (
                  <div
                    key={leader.personId}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/70"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass}`}
                    >
                      <span className="text-sm font-medium text-white">
                        {leader.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {leader.fullName}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-xs">
                          Leader
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {leader.accountStatus === "active"
                            ? "Circles account active"
                            : "No Circles account yet"}
                        </Badge>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isSaving}
                        >
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove leader status?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {leader.fullName} will lose leader-only Circles
                            access. Their stored credentials will be kept.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              void revokeCellGroupLeader(leader.personId)
                            }
                          >
                            Remove leader status
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeGroups.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-zinc-400 py-12">
              No cell groups yet. Create one to start tracking small group
              discipleship.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeGroups.map(group => {
                const members = getGroupMembers(group.id);
                return (
                  <Card
                    key={group.id}
                    className="border-slate-200/60 bg-white hover:shadow-lg transition-all cursor-pointer dark:border-zinc-700/60 dark:bg-zinc-800/70"
                    onClick={() => router.push(`/cell-groups/${group.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-sm">
                          <HeartHandshake className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="rounded-lg">
                          {members.length} members
                        </Badge>
                      </div>
                      <CardTitle className="text-slate-900 dark:text-white">
                        {group.name}
                      </CardTitle>
                      {group.description && (
                        <CardDescription>{group.description}</CardDescription>
                      )}
                      {group.location && (
                        <CardDescription className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {group.location}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {members.length > 0 ? (
                        <div className="space-y-2">
                          {members.map(member => (
                            <div
                              key={member.id}
                              className="flex items-center gap-2 text-slate-900 dark:text-white"
                            >
                              <div
                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                              >
                                <span className="text-white text-sm">
                                  {member.person?.name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm">
                                {member.person?.name}
                              </span>
                              {member.role === "Leader" && (
                                <Badge variant="outline" className="text-xs">
                                  Leader
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm text-center py-2 dark:text-zinc-500">
                          No members yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {isAdmin && (
        <AssignLeadersDialog
          open={showAssignLeaders}
          onOpenChange={setShowAssignLeaders}
          isSaving={isSaving}
          onAssign={assignCellGroupLeaders}
          onSearch={searchCellGroupLeaderCandidates}
        />
      )}
    </div>
  );
}
