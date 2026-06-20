"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ChevronRight } from "lucide-react";
import { usePeople } from "@/lib/people";
import { useLeadership } from "@/lib/leadership";
import { getOrgChartSummary } from "@/lib/supabase/leadership";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .slice(0, 2);
}

export function OrgChartTab() {
  const { people } = usePeople();
  const { orgChart, hydrated } = useLeadership();

  const summary = useMemo(() => getOrgChartSummary(orgChart), [orgChart]);

  const getPersonName = (personId: string) =>
    people.find(person => person.id === personId)?.name ?? "Unknown";

  const CardBgClass =
    "border-slate-200/60 bg-white/50 dark:border-zinc-700/60 dark:bg-zinc-800/50";
  const TextForegroundClass = "text-slate-900 dark:text-white";
  const TextMutedClass = "text-slate-600 dark:text-zinc-400";
  const HeadPastorBg =
    "from-indigo-500 to-indigo-700 dark:from-purple-600 dark:to-purple-800";
  const DepartmentIconBg =
    "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800";
  const MemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-zinc-700 dark:to-zinc-500";

  const headPastor = orgChart.headPersonId
    ? people.find(person => person.id === orgChart.headPersonId)
    : undefined;

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className={`backdrop-blur-sm ${CardBgClass}`}>
        <CardHeader>
          <div className="flex items-center justify-center">
            {headPastor ? (
              <div className="text-center">
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-br ${HeadPastorBg} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <span className="text-white text-xl font-semibold">
                    {getInitials(headPastor.name)}
                  </span>
                </div>
                <CardTitle className={`mb-2 ${TextForegroundClass}`}>
                  {headPastor.name}
                </CardTitle>
                <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-purple-600 dark:hover:bg-purple-700">
                  Head Pastor
                </Badge>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className={TextMutedClass}>
                  No head pastor assigned yet. Set one in organization
                  leadership or assign a Head Pastor admin position.
                </p>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {orgChart.departments.length === 0 ? (
        <Card className={`backdrop-blur-sm ${CardBgClass}`}>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
            <p className={TextMutedClass}>
              No ministry departments yet. Work ministries appear here as
              organization departments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {orgChart.departments.map(department => {
            const deptHead = department.headPersonId
              ? people.find(person => person.id === department.headPersonId)
              : undefined;

            return (
              <Card
                key={department.id}
                className={`backdrop-blur-sm ${CardBgClass}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${DepartmentIconBg} flex items-center justify-center shadow-sm`}
                    >
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className={TextForegroundClass}>
                        {department.name}
                      </CardTitle>
                      <CardDescription className={TextMutedClass}>
                        {deptHead
                          ? `Led by ${deptHead.name}`
                          : "No leader assigned"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deptHead && (
                    <div className="p-3 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${MemberAvatarClass} flex items-center justify-center shadow-sm`}
                        >
                          <span className="text-white">
                            {deptHead.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className={TextForegroundClass}>{deptHead.name}</p>
                          <p className={TextMutedClass}>Department Head</p>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-slate-200 text-slate-700 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          Leader
                        </Badge>
                      </div>
                    </div>
                  )}

                  {department.subDepartments.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                      <p className={TextMutedClass}>Sub-departments</p>
                      {department.subDepartments.map(subDept => (
                        <Card
                          key={subDept.id}
                          className="border-slate-200/60 bg-white/30 dark:border-zinc-700/60 dark:bg-zinc-900/40"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className={TextForegroundClass}>
                                  {subDept.name}
                                </h4>
                                <p className={TextMutedClass}>
                                  {subDept.roles.length > 0
                                    ? subDept.roles.join(", ")
                                    : "Team members"}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300"
                              >
                                {subDept.memberIds.length} members
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {subDept.memberIds.length === 0 ? (
                              <p className={`text-sm ${TextMutedClass} px-2`}>
                                No members assigned to this team yet
                              </p>
                            ) : (
                              subDept.memberIds.map(memberId => (
                                <div
                                  key={memberId}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/50 transition-colors dark:hover:bg-zinc-700/50"
                                >
                                  <div
                                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${MemberAvatarClass} flex items-center justify-center`}
                                  >
                                    <span className="text-white text-sm">
                                      {getPersonName(memberId).charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className={TextForegroundClass}>
                                      {getPersonName(memberId)}
                                    </p>
                                  </div>
                                  <ChevronRight className={TextMutedClass} />
                                </div>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {department.subDepartments.length === 0 &&
                    department.directMemberIds.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                        <p className={TextMutedClass}>Members</p>
                        {department.directMemberIds.map(memberId => (
                          <div
                            key={memberId}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/50 transition-colors dark:hover:bg-zinc-700/50"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${MemberAvatarClass} flex items-center justify-center`}
                            >
                              <span className="text-white text-sm">
                                {getPersonName(memberId).charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className={TextForegroundClass}>
                                {getPersonName(memberId)}
                              </p>
                            </div>
                            <ChevronRight className={TextMutedClass} />
                          </div>
                        ))}
                      </div>
                    )}

                  {department.subDepartments.length === 0 &&
                    department.directMemberIds.length === 0 && (
                      <div className="p-6 text-center border border-dashed border-slate-300/60 rounded-xl dark:border-zinc-700/60">
                        <p className={TextMutedClass}>
                          No teams or members assigned yet
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className={`backdrop-blur-sm ${CardBgClass}`}>
        <CardHeader>
          <CardTitle className={TextForegroundClass}>
            Organization Summary
          </CardTitle>
          <CardDescription className={TextMutedClass}>
            Overview of ministry structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40">
              <p className={TextMutedClass}>Main Departments</p>
              <p className={TextForegroundClass}>{summary.mainDepartments}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40">
              <p className={TextMutedClass}>Sub-departments</p>
              <p className={TextForegroundClass}>{summary.subDepartments}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40">
              <p className={TextMutedClass}>Total Members</p>
              <p className={TextForegroundClass}>{summary.totalMembers}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40">
              <p className={TextMutedClass}>Department Heads</p>
              <p className={TextForegroundClass}>{summary.departmentHeads}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
