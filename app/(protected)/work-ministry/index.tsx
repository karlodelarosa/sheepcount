"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { formatMinistryAssignmentLabel } from "@/lib/work-ministry-labels";

export function MinistriesView() {
  const router = useRouter();
  const { people } = usePeople();
  const { workMinistries, workMinistryMembers, workMinistryTeams, hydrated } =
    useGroupsMinistry();

  const getMinistryMembers = (ministryId: string) => {
    const assignments = workMinistryMembers.filter(
      a => a.ministryId === ministryId,
    );
    return assignments.map(assignment => ({
      ...assignment,
      person: people.find(p => p.id === assignment.personId),
      team: workMinistryTeams.find(t => t.id === assignment.teamId),
    }));
  };

  const ministries = useMemo(
    () => workMinistries,
    [workMinistries],
  );

  const colorClasses = {
    purple:
      "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
    blue: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    green:
      "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
    orange:
      "from-orange-500 to-orange-700 dark:from-amber-600 dark:to-orange-800",
    red: "from-red-500 to-red-700 dark:from-rose-600 dark:to-red-800",
  };

  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-zinc-700 dark:to-zinc-500";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
  const DualModeOutlineBadgeClass =
    "rounded-lg border-slate-300 text-slate-600 dark:border-zinc-700 dark:text-zinc-400";

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading work ministries...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                Work Ministry Assignments
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Manage ministry teams and member assignments (people can serve
                in multiple ministries)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ministries.map(ministry => {
              const members = getMinistryMembers(ministry.id);
              const colorClass =
                colorClasses[ministry.color as keyof typeof colorClasses] ||
                colorClasses.purple;

              return (
                <Card
                  key={ministry.id}
                  className="border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-white"
                  onClick={() => router.push(`/work-ministry/${ministry.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}
                      >
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <Badge
                        variant="secondary"
                        className={DualModeSecondaryBadgeClass}
                      >
                        View details
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-900 dark:text-white">
                      {ministry.name}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-zinc-400">
                      {ministry.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700/60">
                        <span className="text-slate-600 dark:text-zinc-400">
                          Team Members
                        </span>
                        <Badge
                          variant="secondary"
                          className={DualModeSecondaryBadgeClass}
                        >
                          {members.length}
                        </Badge>
                      </div>

                      {members.length > 0 ? (
                        <div className="space-y-2">
                          {members.slice(0, 3).map(member => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between text-slate-900 dark:text-white"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}
                                >
                                  <span className="text-white">
                                    {member.person?.name.charAt(0)}
                                  </span>
                                </div>
                                <span>{member.person?.name}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={DualModeOutlineBadgeClass}
                              >
                                {formatMinistryAssignmentLabel(member)}
                              </Badge>
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
                          No members assigned
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
