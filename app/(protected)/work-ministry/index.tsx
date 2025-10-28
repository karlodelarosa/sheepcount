"use client";

import { useState } from "react";
// 🔑 Import useRouter
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
import {
  mockMinistries,
  mockMinistryAssignments,
  mockPeople,
} from "@/components/mock-data";
import { ManageMinistryMembersDialog } from "./_components/manage-ministry-members-dialog";

export function MinistriesView() {
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  // 🔑 Initialize the router
  const router = useRouter();

  const getMinistryMembers = (ministryId: string) => {
    const assignments = mockMinistryAssignments.filter(
      a => a.ministryId === ministryId,
    );
    return assignments.map(assignment => ({
      ...assignment,
      person: mockPeople.find(p => p.id === assignment.personId),
    }));
  };

  // Dual-mode Colors for Ministry Icons/Avatars
  const colorClasses = {
    // Light -> Dark
    purple:
      "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
    blue: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    green:
      "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
    orange:
      "from-orange-500 to-orange-700 dark:from-amber-600 dark:to-orange-800",
    red: "from-red-500 to-red-700 dark:from-rose-600 dark:to-red-800",
  };

  // Dual-Mode Neutral Avatar Color (Used for member icons)
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-zinc-700 dark:to-zinc-500";

  // Dual-Mode Secondary Badge Class
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";

  // Dual-Mode Outline Badge Class
  const DualModeOutlineBadgeClass =
    "rounded-lg border-slate-300 text-slate-600 dark:border-zinc-700 dark:text-zinc-400";

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
            {mockMinistries.map(ministry => {
              const members = getMinistryMembers(ministry.id);
              const colorClass =
                colorClasses[ministry.color as keyof typeof colorClasses] ||
                colorClasses.purple;

              return (
                // Individual Ministry Card (Dual Mode)
                <Card
                  key={ministry.id}
                  className="border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-white"
                  // 🔑 Updated onClick to redirect to the child page using router.push()
                  onClick={() => {
                    // Assuming the current route is /ministries, the path is /ministries/[id]
                    router.push(`./work-ministry/${ministry.id}`);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      {/* Ministry Icon (Dual Mode Gradient) */}
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
                                {/* Member Avatar (Dual Mode Gradient) */}
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
                                {member.role}
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

      {/* The ManageMinistryMembersDialog and its related state are no longer necessary for the page redirect, 
          but are kept here to prevent runtime errors if they are used elsewhere. The Card's onClick 
          now bypasses the dialog opening state. You might consider removing them if they are unused. */}
      <ManageMinistryMembersDialog
        open={isManageDialogOpen}
        onOpenChange={setIsManageDialogOpen}
        ministryId={selectedMinistry}
      />
    </div>
  );
}
