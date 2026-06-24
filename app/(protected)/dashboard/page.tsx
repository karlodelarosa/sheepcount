"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTenant } from "@/app/providers/tenant-provider";
import { useTheme } from "@/context/theme-context";
import { usePeople } from "@/lib/people";
import { useGrowthTrack } from "@/lib/growth-track";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { GROWTH_TRACK_STAGES } from "@/lib/growth-track/stage-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Church,
  Home,
  UserPlus,
  ClipboardList,
  TrendingUp,
  DollarSign,
  UserCircle,
  Award,
  Settings,
  ArrowRight,
  CalendarDays,
  GitBranch,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const shortcuts = [
  {
    href: "/people",
    label: "People",
    icon: Users,
    description: "Directory",
    color: "border-blue-200/80 bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-300",
    iconBg: "bg-blue-500 text-white dark:bg-blue-600",
  },
  {
    href: "/service-attendance",
    label: "Service",
    icon: Church,
    description: "Sunday worship",
    color: "border-violet-200/80 bg-violet-50/80 hover:bg-violet-100/80 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 dark:text-violet-300",
    iconBg: "bg-violet-500 text-white dark:bg-violet-600",
  },
  {
    href: "/event-attendance",
    label: "Events",
    icon: CalendarDays,
    description: "Camps & retreats",
    color: "border-orange-200/80 bg-orange-50/80 hover:bg-orange-100/80 text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 dark:text-orange-300",
    iconBg: "bg-orange-500 text-white dark:bg-orange-600",
  },
  {
    href: "/households",
    label: "Households",
    icon: Home,
    description: "Families",
    color: "border-emerald-200/80 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300",
    iconBg: "bg-emerald-500 text-white dark:bg-emerald-600",
  },
  {
    href: "/life-groups",
    label: "Life Groups",
    icon: UserCircle,
    description: "Groups",
    color: "border-cyan-200/80 bg-cyan-50/80 hover:bg-cyan-100/80 text-cyan-700 dark:border-cyan-800/60 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 dark:text-cyan-300",
    iconBg: "bg-cyan-500 text-white dark:bg-cyan-600",
  },
  {
    href: "/work-ministry",
    label: "Work Ministry",
    icon: Award,
    description: "Teams",
    color: "border-purple-200/80 bg-purple-50/80 hover:bg-purple-100/80 text-purple-700 dark:border-purple-800/60 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-300",
    iconBg: "bg-purple-500 text-white dark:bg-purple-600",
  },
  {
    href: "/growth-track",
    label: "Growth Track",
    icon: TrendingUp,
    description: "Pipeline",
    color: "border-rose-200/80 bg-rose-50/80 hover:bg-rose-100/80 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300",
    iconBg: "bg-rose-500 text-white dark:bg-rose-600",
  },
  {
    href: "/financial",
    label: "Financial",
    icon: DollarSign,
    description: "Coming soon",
    disabled: true,
    color: "border-amber-200/80 bg-amber-50/80 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 opacity-50 cursor-not-allowed",
    iconBg: "bg-amber-500 text-white dark:bg-amber-600",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "Org setup",
    color: "border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/80 text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/40 dark:hover:bg-slate-800/50 dark:text-slate-300",
    iconBg: "bg-slate-600 text-white dark:bg-slate-500",
  },
];

const kpiColors = [
  {
    icon: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/50",
    border: "border-blue-200/60 dark:border-blue-800/40",
    value: "text-blue-700 dark:text-blue-300",
  },
  {
    icon: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/50",
    border: "border-violet-200/60 dark:border-violet-800/40",
    value: "text-violet-700 dark:text-violet-300",
  },
  {
    icon: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/50",
    border: "border-purple-200/60 dark:border-purple-800/40",
    value: "text-purple-700 dark:text-purple-300",
  },
  {
    icon: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-900/50",
    border: "border-rose-200/60 dark:border-rose-800/40",
    value: "text-rose-700 dark:text-rose-300",
  },
  {
    icon: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  {
    icon: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/50",
    border: "border-amber-200/60 dark:border-amber-800/40",
    value: "text-amber-700 dark:text-amber-300",
  },
];

const lifeGroupBarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const avatarGradients = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
];

export default function DashboardPage() {
  const { tenant } = useTenant();
  const { settings } = useTheme();
  const { people, households, hydrated: peopleHydrated } = usePeople();
  const { overview, hydrated: growthHydrated } = useGrowthTrack();
  const { lifeGroups, lifeGroupMembers, hydrated: groupsHydrated } =
    useGroupsMinistry();

  const loading = !peopleHydrated || !growthHydrated || !groupsHydrated;

  const stats = useMemo(() => {
    const activeMembers = people.filter(p => p.status === "Active").length;
    const workers = people.filter(
      p =>
        p.membershipType === "Worker" ||
        p.membershipType === "Volunteer Worker",
    ).length;
    const visitors = people.filter(
      p => p.membershipType === "For Evangelism",
    ).length;

    const sundayTrend = overview.sundayTrend.slice(-6).map(point => ({
      date: new Date(point.rawDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: point.count,
    }));

    const lastSundayRawDate = overview.sundayTrend.at(-1)?.rawDate ?? null;

    const evangelismStages = GROWTH_TRACK_STAGES.map(stage => ({
      stage: stage.key,
      count: overview.stageCounts[stage.key],
    })).filter(entry => entry.count > 0);

    const recentPeople = [...people]
      .sort(
        (a, b) =>
          new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
      )
      .slice(0, 5);

    const lifeGroupCounts = lifeGroups
      .map(group => ({
        name: group.name,
        count: lifeGroupMembers.filter(m => m.lifeGroupId === group.id).length,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      activeMembers,
      workers,
      visitors,
      households: households.length,
      lastSundayCount: overview.lastSundayCount,
      lastSundayDate: lastSundayRawDate,
      attendanceTrend: sundayTrend,
      pipelineCount: overview.totalInPipeline,
      evangelismStages,
      recentPeople,
      lifeGroupCounts,
    };
  }, [people, households, overview, lifeGroups, lifeGroupMembers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Shortcut buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {shortcuts.map(item =>
          item.disabled ? (
            <Button
              key={item.href}
              variant="outline"
              size="sm"
              disabled
              className={`h-auto flex-col gap-1.5 py-2.5 px-2 rounded-xl border transition-colors ${item.color}`}
            >
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-lg ${item.iconBg}`}
              >
                <item.icon className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-medium">{item.label}</span>
              <span className="text-[10px] opacity-70">{item.description}</span>
            </Button>
          ) : (
            <Button
              key={item.href}
              variant="outline"
              size="sm"
              className={`h-auto flex-col gap-1.5 py-2.5 px-2 rounded-xl border transition-colors ${item.color}`}
              asChild
            >
              <Link href={item.href}>
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-lg ${item.iconBg}`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-medium">{item.label}</span>
                <span className="text-[10px] opacity-70">{item.description}</span>
              </Link>
            </Button>
          ),
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: "Active Members", value: stats.activeMembers, icon: Users },
          {
            label: "Last Sunday",
            value: stats.lastSundayCount,
            icon: Church,
          },
          { label: "Workers", value: stats.workers, icon: Award },
          { label: "Visitors", value: stats.visitors, icon: TrendingUp },
          { label: "Households", value: stats.households, icon: Home },
          {
            label: "In Pipeline",
            value: stats.pipelineCount,
            icon: GitBranch,
          },
        ].map((stat, i) => {
          const colors = kpiColors[i % kpiColors.length];
          return (
            <Card
              key={stat.label}
              className={`border ${colors.border} bg-gradient-to-br from-white to-transparent dark:from-zinc-900/80`}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-md ${colors.bg}`}
                  >
                    <stat.icon className={`w-3.5 h-3.5 ${colors.icon}`} />
                  </span>
                </div>
                <p className={`text-lg font-semibold mt-1 ${colors.value}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Attendance chart */}
        <Card className="lg:col-span-2 border-violet-200/60 dark:border-violet-800/40 bg-gradient-to-br from-violet-50/30 to-transparent dark:from-violet-950/20">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  Sunday Service Attendance
                </CardTitle>
                <CardDescription className="text-xs">
                  {stats.lastSundayDate
                    ? `Latest: ${new Date(stats.lastSundayDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    : "No records yet"}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <Link href="/service-attendance">
                  <ClipboardList className="w-3 h-3 mr-1" />
                  Record
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {stats.attendanceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.attendanceTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#8b5cf6"
                    className="dark:fill-violet-400"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No attendance data.{" "}
                <Link
                  href="/service-attendance"
                  className="underline text-foreground"
                >
                  Record a session
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Growth Track pipeline */}
        <Card className="border-rose-200/60 dark:border-rose-800/40 bg-gradient-to-br from-rose-50/30 to-transparent dark:from-rose-950/20">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Growth Track Pipeline
            </CardTitle>
            <CardDescription className="text-xs">
              People by journey stage
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-1.5">
            {stats.evangelismStages.length > 0 ? (
              stats.evangelismStages.map(({ stage, count }) => {
                const stageConfig = GROWTH_TRACK_STAGES.find(
                  s => s.key === stage,
                );
                return (
                  <div
                    key={stage}
                    className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg ${
                      stageConfig?.headerBg ??
                      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <span className="truncate font-medium">{stage}</span>
                    <Badge
                      variant="secondary"
                      className="text-xs h-5 bg-white/60 dark:bg-black/20"
                    >
                      {count}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No people in the pipeline yet.
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs mt-1"
              asChild
            >
              <Link href="/growth-track">
                View pipeline
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Recent people */}
        <Card className="border-blue-200/60 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/20">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Recent People
                </CardTitle>
                <CardDescription className="text-xs">
                  Newest in the directory
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <Link href="/people">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Add
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-1">
            {stats.recentPeople.length > 0 ? (
              stats.recentPeople.map((person, i) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors text-xs"
                >
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center shrink-0`}
                  >
                    <span className="text-white text-[10px] font-semibold">
                      {person.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{person.name}</p>
                    <p className="text-muted-foreground truncate">
                      {person.membershipType}
                      {person.householdName
                        ? ` · ${person.householdName}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-muted-foreground shrink-0">
                    {person.joinDate
                      ? new Date(person.joinDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No people yet.{" "}
                <Link href="/people" className="underline text-foreground">
                  Add someone
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Life groups + org summary */}
        <Card className="border-cyan-200/60 dark:border-cyan-800/40 bg-gradient-to-br from-cyan-50/30 to-transparent dark:from-cyan-950/20">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              Life Groups
            </CardTitle>
            <CardDescription className="text-xs">
              Member distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-1">
            {stats.lifeGroupCounts.length > 0 ? (
              stats.lifeGroupCounts.slice(0, 5).map((group, i) => {
                const maxCount = Math.max(
                  ...stats.lifeGroupCounts.map(g => g.count),
                  1,
                );
                const width = `${Math.round((group.count / maxCount) * 100)}%`;
                const barColor =
                  lifeGroupBarColors[i % lifeGroupBarColors.length];

                return (
                  <div key={group.name} className="py-1.5 px-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="truncate font-medium">{group.name}</span>
                      <Badge
                        variant="outline"
                        className="text-xs h-5 border-cyan-200 text-cyan-700 dark:border-cyan-800 dark:text-cyan-300"
                      >
                        {group.count}
                      </Badge>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all`}
                        style={{ width }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No life group members yet.
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs mt-1"
              asChild
            >
              <Link href="/life-groups">
                All life groups
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Org footer strip */}
      <Card className="border-indigo-200/60 dark:border-indigo-800/40 bg-gradient-to-r from-indigo-50/50 via-violet-50/30 to-blue-50/50 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-blue-950/30">
        <CardContent className="p-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium">
            <CalendarDays className="w-3.5 h-3.5" />
            {settings.organizationName}
          </span>
          <span className="text-border">·</span>
          <span>
            Plan:{" "}
            <span className="text-violet-700 dark:text-violet-300 font-medium capitalize">
              {(tenant?.subscription?.plan ?? "basic").replace(/^./, c => c.toUpperCase())}
            </span>
          </span>
          <span className="text-border">·</span>
          <span>
            Total people:{" "}
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
              {people.length}
            </span>
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
