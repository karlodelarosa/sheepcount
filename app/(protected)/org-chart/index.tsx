"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ChevronRight } from "lucide-react";
import { mockOrgChart, mockPeople } from "@/components/mock-data";

export function OrgChartView() {
  const { admin } = mockOrgChart;
  const headPastor = mockPeople.find(p => p.id === admin.head);

  const getPersonName = (personId: string) => {
    const person = mockPeople.find(p => p.id === personId);
    return person ? person.name : "Unknown";
  };

  // Dual-mode class definitions
  const CardBgClass = "border-slate-200/60 bg-white/50 dark:border-zinc-700/60 dark:bg-zinc-800/50";
  const TextForegroundClass = "text-slate-900 dark:text-white";
  const TextMutedClass = "text-slate-600 dark:text-zinc-400";
  const HeadPastorBg = "from-indigo-500 to-indigo-700 dark:from-purple-600 dark:to-purple-800";
  const DepartmentIconBg = "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800";
  
  // Dual-Mode Neutral Avatar Color (Used for all member icons)
  const MemberAvatarClass = "from-slate-900 to-slate-700 dark:from-zinc-700 dark:to-zinc-500";


  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${TextForegroundClass}`}>Organization Chart</h1>
        <p className={TextMutedClass}>
          Visual representation of church leadership and ministry structure
        </p>
      </div>

      {/* Head Pastor */}
      <Card className={`backdrop-blur-sm ${CardBgClass}`}>
        <CardHeader>
          <div className="flex items-center justify-center">
            <div className="text-center">
              {/* Head Pastor Avatar (Dual Mode Gradient) */}
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${HeadPastorBg} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <span className="text-white text-xl font-semibold">{headPastor?.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <CardTitle className={`mb-2 ${TextForegroundClass}`}>{headPastor?.name}</CardTitle>
              {/* Badge (Thematically Colored) */}
              <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-purple-600 dark:hover:bg-purple-700">Head Pastor</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Departments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {admin.departments.map((department) => {
          const deptHead = mockPeople.find(p => p.id === department.head);
          
          return (
            <Card key={department.id} className={`backdrop-blur-sm ${CardBgClass}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {/* Department Icon (Dual Mode Gradient) */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${DepartmentIconBg} flex items-center justify-center shadow-sm`}>
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className={TextForegroundClass}>{department.name}</CardTitle>
                    <CardDescription className={TextMutedClass}>
                      {deptHead ? `Led by ${deptHead.name}` : 'No leader assigned'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Department Head Card (Dual Mode) */}
                {deptHead && (
                  <div className={`p-3 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40`}>
                    <div className="flex items-center gap-3">
                      {/* Department Head Avatar (Dual Mode Gradient) */}
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${MemberAvatarClass} flex items-center justify-center shadow-sm`}>
                        <span className="text-white">{deptHead.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className={TextForegroundClass}>{deptHead.name}</p>
                        <p className={TextMutedClass}>Department Head</p>
                      </div>
                      <Badge variant="outline" className="border-slate-200 text-slate-700 dark:border-zinc-700 dark:text-zinc-300">Leader</Badge>
                    </div>
                  </div>
                )}

                {/* Sub-departments */}
                {department.subDepartments.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                    <p className={TextMutedClass}>Sub-departments</p>
                    {department.subDepartments.map((subDept) => (
                      <Card key={subDept.id} className={`border-slate-200/60 bg-white/30 dark:border-zinc-700/60 dark:bg-zinc-900/40`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={TextForegroundClass}>{subDept.name}</h4>
                              <p className={TextMutedClass}>
                                {subDept.roles.join(', ')}
                              </p>
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300">{subDept.members.length} members</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {subDept.members.map((memberId) => {
                            const member = mockPeople.find(p => p.id === memberId);
                            return member ? (
                              <div
                                key={memberId}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/50 transition-colors dark:hover:bg-zinc-700/50"
                              >
                                {/* Member Avatar (Dual Mode Gradient) */}
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${MemberAvatarClass} flex items-center justify-center`}>
                                  <span className="text-white">{member.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1">
                                  <p className={TextForegroundClass}>{member.name}</p>
                                </div>
                                <ChevronRight className={TextMutedClass} />
                              </div>
                            ) : null;
                          })}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Outreach has no sub-departments */}
                {department.id === 'outreach' && department.subDepartments.length === 0 && (
                  <div className="p-6 text-center border border-dashed border-slate-300/60 rounded-xl dark:border-zinc-700/60">
                    <p className={TextMutedClass}>
                      Direct department with no sub-divisions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Organization Summary */}
      <Card className={`backdrop-blur-sm ${CardBgClass}`}>
        <CardHeader>
          <CardTitle className={TextForegroundClass}>Organization Summary</CardTitle>
          <CardDescription className={TextMutedClass}>Overview of ministry structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Summary Boxes (Dual Mode) */}
            <div className={`p-4 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40`}>
              <p className={TextMutedClass}>Main Departments</p>
              <p className={TextForegroundClass}>{admin.departments.length}</p>
            </div>
            <div className={`p-4 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40`}>
              <p className={TextMutedClass}>Sub-departments</p>
              <p className={TextForegroundClass}>
                {admin.departments.reduce((sum, d) => sum + d.subDepartments.length, 0)}
              </p>
            </div>
            <div className={`p-4 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40`}>
              <p className={TextMutedClass}>Total Members</p>
              <p className={TextForegroundClass}>
                {admin.departments.reduce(
                  (sum, d) => sum + d.subDepartments.reduce((s, sd) => s + sd.members.length, 0),
                  0
                )}
              </p>
            </div>
            <div className={`p-4 rounded-xl border border-slate-200/60 bg-slate-50 dark:border-zinc-700/60 dark:bg-zinc-900/40`}>
              <p className={TextMutedClass}>Department Heads</p>
              <p className={TextForegroundClass}>{admin.departments.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}