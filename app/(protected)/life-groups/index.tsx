// app/life-groups/index.tsx
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
import { Plus, Users, UserCircle } from "lucide-react";
import {
  mockLifeGroups,
  mockLifeGroupMembers,
  mockPeople,
} from "@/components/mock-data";
import { AddLifeGroupDialog } from "./_components/add-life-group-dialog";

export function LifeGroupsList() {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // 🔑 NEW: Define the Dual-Mode Class for Primary Buttons
  const DualModePrimaryButtonClass =
    "rounded-xl text-white shadow-lg \
    bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 \
    dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40";

  const getGroupMembers = (groupId: string) => {
    // ... (logic remains the same)
    const memberships = mockLifeGroupMembers.filter(
      m => m.lifeGroupId === groupId,
    );
    return memberships.map(membership => ({
      ...membership,
      person: mockPeople.find(p => p.id === membership.personId),
    }));
  };

  const groupedByCategory = mockLifeGroups.reduce(
    (acc, group) => {
      // ... (logic remains the same)
      if (!acc[group.category]) {
        acc[group.category] = [];
      }
      acc[group.category].push(group);
      return acc;
    },
    {} as Record<string, typeof mockLifeGroups>,
  );

  const colorClasses = {
    // Light -> Dark
    blue: "from-blue-500 to-blue-700",
    green:
      "from-green-500 to-green-700 dark:from-emerald-500 dark:to-emerald-700",
    purple:
      "from-purple-500 to-purple-700 dark:from-indigo-500 dark:to-indigo-700",
    pink: "from-pink-500 to-pink-700",
    indigo:
      "from-indigo-500 to-indigo-700 dark:from-violet-500 dark:to-fuchsia-700",
  };

  const categoryColors = {
    // Light -> Dark
    Children: "from-blue-500 to-cyan-600 dark:from-sky-500 dark:to-cyan-700",
    Youth: "from-green-500 to-emerald-600 dark:from-lime-500 dark:to-green-700",
    Adults:
      "from-purple-500 to-indigo-600 dark:from-violet-500 dark:to-fuchsia-700",
  };

  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-zinc-700 dark:to-zinc-500";

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                Life Groups
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Fellowship groups and program attendance tracking
              </CardDescription>
            </div>
            {/* 🔑 BUTTON CHANGE: Use the new DualModePrimaryButtonClass */}
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className={DualModePrimaryButtonClass}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* ... (rest of the content remains the same) ... */}
          {Object.entries(groupedByCategory).map(([category, groups]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[category as keyof typeof categoryColors]} flex items-center justify-center shadow-sm`}
                >
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white">{category}</h3>
                  <p className="text-slate-600 dark:text-zinc-400">
                    {groups.length} {groups.length === 1 ? "group" : "groups"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map(group => {
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
                            View/Manage
                          </Badge>
                        </div>
                        <CardTitle className="text-slate-900 dark:text-white">
                          {group.name}
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-zinc-400">
                          {group.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
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
                                  <span>{member.person?.name}</span>
                                </div>
                              ))}
                              {members.length > 3 && (
                                <p className="text-slate-500 dark:text-zinc-500">
                                  +{members.length - 3} more
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-slate-500 text-center py-4 dark:text-zinc-500">
                              No members yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AddLifeGroupDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
