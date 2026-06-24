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
import { Plus, UserCircle, Calendar, Clock } from "lucide-react";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { AddLifeGroupDialog } from "./_components/add-life-group-dialog";

export function LifeGroupsList() {
  const router = useRouter();
  const { people } = usePeople();
  const { lifeGroups, lifeGroupMembers, hydrated } = useGroupsMinistry();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const DualModePrimaryButtonClass =
    "rounded-xl text-white shadow-lg \
    bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 \
    dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40";

  const getGroupMembers = (groupId: string) => {
    const memberships = lifeGroupMembers.filter(m => m.lifeGroupId === groupId);
    return memberships.map(membership => ({
      ...membership,
      person: people.find(p => p.id === membership.personId),
    }));
  };

  const colorClasses = {
    blue: "from-blue-500 to-blue-700",
    green:
      "from-green-500 to-green-700 dark:from-emerald-500 dark:to-emerald-700",
    purple:
      "from-purple-500 to-purple-700 dark:from-indigo-500 dark:to-indigo-700",
    pink: "from-pink-500 to-pink-700",
    indigo:
      "from-indigo-500 to-indigo-700 dark:from-violet-500 dark:to-fuchsia-700",
  };

  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-zinc-700 dark:to-zinc-500";

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading life groups...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white">Life Groups</h1>
          <p className="text-slate-600 dark:text-zinc-400">
            Fellowship groups and their meeting schedules
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className={DualModePrimaryButtonClass}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Group
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {lifeGroups.length === 0 ? (
            <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
              <CardContent className="p-8 text-center text-slate-500 dark:text-zinc-400">
                No life groups yet. Add your first group to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lifeGroups.map(group => {
                const members = getGroupMembers(group.id);
                const colorClass =
                  colorClasses[group.color as keyof typeof colorClasses] ||
                  colorClasses.purple;

                return (
                  <Card
                    key={group.id}
                    className="border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-white"
                    onClick={() => router.push(`/life-groups/${group.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}
                        >
                          <UserCircle className="w-6 h-6 text-white" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300"
                        >
                          {group.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-slate-900 dark:text-white">
                        {group.name}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-zinc-400 line-clamp-2">
                        {group.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {group.schedule && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{group.schedule}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-slate-600 dark:text-zinc-400">
                            Members
                          </span>
                          <Badge
                            variant="secondary"
                            className="rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300"
                          >
                            {members.length}
                          </Badge>
                        </div>

                        {members.length > 0 ? (
                          <div className="space-y-2">
                            {members.slice(0, 3).map(member => (
                              <div
                                key={member.id}
                                className="flex items-center gap-2 text-slate-900 dark:text-white"
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}
                                >
                                  <span className="text-white">
                                    {member.person?.name.charAt(0)}
                                  </span>
                                </div>
                                <span className="truncate">
                                  {member.person?.name}
                                </span>
                              </div>
                            ))}
                            {members.length > 3 && (
                              <p className="text-slate-500 dark:text-zinc-500">
                                +{members.length - 3} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-center py-2 dark:text-zinc-500">
                            No members yet
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Card className="lg:col-span-1 border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 h-fit sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Group Schedules
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Meeting times for each life group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lifeGroups.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-zinc-500">
                No schedules to display.
              </p>
            ) : (
              lifeGroups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => router.push(`/life-groups/${group.id}`)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-colors dark:border-zinc-700/60 dark:hover:bg-zinc-700/50"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {group.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 shrink-0" />
                    {group.schedule || "Schedule not set"}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <AddLifeGroupDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
