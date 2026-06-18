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
import { Plus, HeartHandshake, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";

export function CellGroupsList() {
  const router = useRouter();
  const { people } = usePeople();
  const {
    cellGroups,
    cellGroupMembers,
    hydrated,
    isSaving,
    addCellGroup,
  } = useGroupsMinistry();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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

  const handleCreate = async () => {
    if (!name.trim()) return;
    const group = await addCellGroup({ name, description });
    if (group) {
      setName("");
      setDescription("");
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                Cell Groups
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400 max-w-2xl">
                Small groups of 3–4 people for Bible study and mutual
                accountability. Members can also serve in work ministry. When a
                group is ready, they can multiply and start a new cell group.
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreate(v => !v)}
              className={DualModePrimaryButtonClass}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Cell Group
            </Button>
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
                          {members.length}/4
                        </Badge>
                      </div>
                      <CardTitle className="text-slate-900 dark:text-white">
                        {group.name}
                      </CardTitle>
                      {group.description && (
                        <CardDescription>{group.description}</CardDescription>
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
                              <span className="text-sm">{member.person?.name}</span>
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
    </div>
  );
}
