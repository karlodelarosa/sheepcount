"use client";

import { PageSkeleton } from "@/components/page-skeleton";

import { DashboardMetricCard } from "@/components/dashboard-metric-card";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  Church,
  GitBranch,
  Home,
  Layers3,
  Minus,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTenant } from "@/app/providers/tenant-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/context/theme-context";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { useGrowthTrack } from "@/lib/growth-track";
import { GROWTH_TRACK_STAGES } from "@/lib/growth-track/stage-config";
import { usePeople } from "@/lib/people";
import { useServiceAttendance } from "@/lib/service-attendance";
import { buildShepherdWorklist } from "@/lib/shepherding";
import { ActionCenter } from "./_components/action-center";
import {
  getUnassignedNewMembers,
  getUnrecordedSunday,
  getUpcomingBirthdays,
} from "./_lib/dashboard-actions";
import {
  compareAttendancePeriods,
  getLatestAttendanceTrend,
  sliceAttendanceRange,
  type AttendanceTrend,
  type DashboardRangeWeeks,
} from "./_lib/dashboard-metrics";

const cardClass =
  "rounded-2xl border border-border/80 bg-card shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:shadow-none";

const pipelineColors = [
  "var(--accent-chart-1)",
  "var(--accent-chart-2)",
  "var(--accent-chart-3)",
  "var(--accent-chart-4)",
  "var(--accent-chart-5)",
];

function TrendIndicator({ trend }: { trend: AttendanceTrend | null }) {
  if (!trend) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
        <span className="sr-only">No comparison available</span>
      </span>
    );
  }

  const isUp = trend.direction === "up";
  const isDown = trend.direction === "down";
  const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;

  return (
    <span
      className={
        isUp
          ? "inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
          : isDown
            ? "inline-flex items-center gap-0.5 text-xs font-bold text-red-600 dark:text-red-400"
            : "inline-flex items-center gap-0.5 text-xs font-bold text-muted-foreground"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {trend.percent}%
      <span className="sr-only">
        {isUp ? "increase" : isDown ? "decrease" : "no change"}
      </span>
    </span>
  );
}

export default function DashboardPage() {
  const { tenant } = useTenant();
  const { settings } = useTheme();
  const { people, households, hydrated: peopleHydrated } = usePeople();
  const {
    overview,
    growthPeople,
    activities,
    hydrated: growthHydrated,
  } = useGrowthTrack();
  const {
    lifeGroups,
    lifeGroupMembers,
    hydrated: groupsHydrated,
  } = useGroupsMinistry();
  const { attendanceRows, hydrated: attendanceHydrated } =
    useServiceAttendance();
  const [rangeWeeks, setRangeWeeks] = useState<DashboardRangeWeeks>(4);

  const loading =
    !peopleHydrated ||
    !growthHydrated ||
    !groupsHydrated ||
    !attendanceHydrated;

  const actions = useMemo(() => {
    const worklist = buildShepherdWorklist({
      people,
      attendanceRows,
      growthPeople,
      activities,
    });
    const latestSunday = overview.sundayTrend.at(-1)?.rawDate ?? null;
    const unrecordedSundayISO = getUnrecordedSunday(latestSunday);

    return {
      shepherd: worklist.filter(
        item =>
          item.status.level === "needs_visit" ||
          item.status.level === "check_in",
      ),
      assimilateContacts: worklist.filter(
        item => item.status.level === "needs_contact",
      ),
      followUps: worklist.filter(
        item => item.status.level === "needs_follow_up",
      ),
      unassignedNewMembers: getUnassignedNewMembers(people, lifeGroupMembers),
      unrecordedSundayLabel: unrecordedSundayISO
        ? new Date(`${unrecordedSundayISO}T00:00:00`).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" },
          )
        : null,
      upcomingBirthdays: getUpcomingBirthdays(people),
    };
  }, [
    activities,
    attendanceRows,
    growthPeople,
    lifeGroupMembers,
    overview.sundayTrend,
    people,
  ]);

  const stats = useMemo(() => {
    const attendanceTrend = overview.sundayTrend.map(point => ({
      date: new Date(`${point.rawDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      rawDate: point.rawDate,
      count: point.count,
    }));
    const lifeGroupCounts = lifeGroups
      .map(group => ({
        name: group.name,
        count: lifeGroupMembers.filter(
          member => member.lifeGroupId === group.id,
        ).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      activeMembers: people.filter(person => person.status === "Active").length,
      workers: people.filter(
        person =>
          person.membershipType === "Worker" ||
          person.membershipType === "Volunteer Worker",
      ).length,
      visitors: people.filter(
        person => person.membershipType === "For Evangelism",
      ).length,
      households: households.length,
      lastSundayCount: overview.lastSundayCount,
      lastSundayDate: overview.sundayTrend.at(-1)?.rawDate ?? null,
      attendanceTrend,
      pipelineCount: overview.totalInPipeline,
      pipelineStages: GROWTH_TRACK_STAGES.map((stage, index) => ({
        stage: stage.key,
        count: overview.stageCounts[stage.key],
        fill: pipelineColors[index],
      })).filter(entry => entry.count > 0),
      recentPeople: [...people]
        .sort(
          (a, b) =>
            new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
        )
        .slice(0, 3),
      lifeGroupCounts,
    };
  }, [people, households, overview, lifeGroups, lifeGroupMembers]);

  const visibleAttendance = useMemo(
    () => sliceAttendanceRange(stats.attendanceTrend, rangeWeeks),
    [rangeWeeks, stats.attendanceTrend],
  );
  const periodComparison = useMemo(
    () => compareAttendancePeriods(stats.attendanceTrend, rangeWeeks),
    [rangeWeeks, stats.attendanceTrend],
  );
  const latestAttendanceTrend = useMemo(
    () => getLatestAttendanceTrend(stats.attendanceTrend),
    [stats.attendanceTrend],
  );

  if (loading) {
    return <PageSkeleton message="Loading dashboard..." />;
  }

  const metrics = [
    {
      label: "Active Members",
      value: stats.activeMembers,
      icon: Users,
      trend: null,
    },
    {
      label: "Last Sunday",
      value: stats.lastSundayCount,
      icon: CalendarDays,
      trend: latestAttendanceTrend,
    },
    { label: "Workers", value: stats.workers, icon: Award, trend: null },
    { label: "Visitors", value: stats.visitors, icon: UserPlus, trend: null },
    { label: "Households", value: stats.households, icon: Home, trend: null },
    {
      label: "In Pipeline",
      value: stats.pipelineCount,
      icon: GitBranch,
      trend: null,
    },
  ];
  const maxLifeGroupCount = Math.max(
    ...stats.lifeGroupCounts.map(group => group.count),
    1,
  );
  const firstName = tenant?.profile?.first_name?.trim() || "there";

  return (
    <div className="-m-4 min-h-full bg-background text-foreground dark:bg-background">
      <div className="mx-auto max-w-[1600px] space-y-4 p-4 sm:p-5">
        <header className="relative -mx-4 -mt-4 overflow-hidden border-b border-border/70 bg-card px-4 pb-5 pt-6 sm:-mx-5 sm:-mt-5 sm:px-5 lg:pb-6">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-3/4 text-[var(--accent-color)] opacity-[0.11] sm:block"
            viewBox="0 0 900 180"
            preserveAspectRatio="none"
          >
            <path
              d="M0 145C115 142 145 55 265 65c110 10 126 96 245 74 126-24 173-107 390-88v129H0Z"
              fill="currentColor"
              opacity=".5"
            />
            <path
              d="M0 180V122c116-11 189 42 310 21 121-20 179-77 303-52 104 21 152 42 287 12v77Z"
              fill="currentColor"
            />
          </svg>
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Welcome back,
              </p>
              <h1 className="mt-0.5 text-3xl font-bold tracking-[-0.045em] text-foreground sm:text-4xl">
                {firstName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Here&apos;s what&apos;s happening at {settings.organizationName}
                .
              </p>
            </div>
            <Select
              value={String(rangeWeeks)}
              onValueChange={value =>
                setRangeWeeks(Number(value) as DashboardRangeWeeks)
              }
            >
              <SelectTrigger
                size="sm"
                aria-label="Attendance chart date range"
                className="w-40 rounded-xl border-border bg-card shadow-sm"
              >
                <CalendarDays className="h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="4">Last 4 weeks</SelectItem>
                <SelectItem value="8">Last 8 weeks</SelectItem>
                <SelectItem value="12">Last 12 weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <ActionCenter
          shepherd={actions.shepherd}
          assimilateContacts={actions.assimilateContacts}
          unassignedNewMembers={actions.unassignedNewMembers}
          followUps={actions.followUps}
          unrecordedSundayLabel={actions.unrecordedSundayLabel}
          upcomingBirthdays={actions.upcomingBirthdays}
        />

        <section aria-label="Church overview metrics">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {metrics.map(metric => (
              <DashboardMetricCard
                key={metric.label}
                icon={metric.icon}
                label={metric.label}
                value={metric.value}
                hint={<TrendIndicator trend={metric.trend} />}
              />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.9fr)]">
          <section aria-labelledby="attendance-heading" className={cardClass}>
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-[var(--accent-color)]" />
                <div>
                  <h2
                    id="attendance-heading"
                    className="text-base font-bold tracking-[-0.025em]"
                  >
                    Sunday Service Attendance
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stats.lastSundayDate
                      ? `Latest ${new Date(`${stats.lastSundayDate}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                      : "No attendance records yet"}
                  </p>
                  {periodComparison ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {periodComparison.currentAverage} average ·{" "}
                      <span
                        className={
                          periodComparison.direction === "down"
                            ? "text-red-600 dark:text-red-400"
                            : periodComparison.direction === "up"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                        }
                      >
                        {periodComparison.direction === "up"
                          ? "+"
                          : periodComparison.direction === "down"
                            ? "−"
                            : ""}
                        {periodComparison.percent}%
                      </span>{" "}
                      vs previous {rangeWeeks} weeks
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg bg-card shadow-sm"
                asChild
              >
                <Link href="/service-attendance">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Record
                </Link>
              </Button>
            </header>
            <div className="px-2 pb-3 pt-4 sm:px-4">
              {visibleAttendance.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={visibleAttendance}
                    margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--accent-color-soft)" }}
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                        color: "hsl(var(--card-foreground))",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Attendance"
                      fill="var(--accent-color)"
                      radius={[7, 7, 0, 0]}
                      maxBarSize={110}
                    >
                      <LabelList
                        dataKey="count"
                        position="insideTop"
                        offset={10}
                        fill="var(--accent-color-foreground)"
                        fontSize={12}
                        fontWeight={700}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-semibold">
                    No attendance data
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Record a Sunday service to start the attendance trend.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="pipeline-heading" className={cardClass}>
            <header className="flex items-start gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
              <Layers3 className="mt-0.5 h-5 w-5 text-[var(--accent-color)]" />
              <div>
                <h2
                  id="pipeline-heading"
                  className="text-base font-bold tracking-[-0.025em]"
                >
                  Growth Track Pipeline
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  People by journey stage
                </p>
              </div>
            </header>
            {stats.pipelineStages.length > 0 ? (
              <div className="grid items-center gap-3 px-4 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:px-5 lg:grid-cols-1 xl:grid-cols-[13rem_minmax(0,1fr)]">
                <div className="relative mx-auto h-52 w-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.pipelineStages}
                        dataKey="count"
                        nameKey="stage"
                        innerRadius={61}
                        outerRadius={88}
                        paddingAngle={1}
                        stroke="transparent"
                      >
                        {stats.pipelineStages.map(stage => (
                          <Cell key={stage.stage} fill={stage.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          color: "hsl(var(--card-foreground))",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold tracking-[-0.04em] tabular-nums">
                      {stats.pipelineCount}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      People
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <dl className="divide-y divide-border/70">
                    {stats.pipelineStages.map(stage => (
                      <div
                        key={stage.stage}
                        className="flex min-h-9 items-center gap-2 text-xs"
                      >
                        <span
                          aria-hidden="true"
                          className="h-3 w-3 shrink-0 rounded"
                          style={{ backgroundColor: stage.fill }}
                        />
                        <dt className="min-w-0 flex-1 truncate font-medium">
                          {stage.stage}
                        </dt>
                        <dd className="font-bold tabular-nums">
                          {stage.count}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href="/growth-track"
                    className="mt-3 flex items-center justify-end gap-2 text-sm font-semibold text-[var(--accent-color-strong)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] dark:text-[var(--accent-color)]"
                  >
                    View pipeline
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                <GitBranch className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">Pipeline is empty</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  People will appear here as they enter Growth Track.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.35fr)]">
          <section
            aria-labelledby="recent-people-heading"
            className={cardClass}
          >
            <header className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
              <div className="flex items-start gap-3">
                <UserPlus className="mt-0.5 h-5 w-5 text-[var(--accent-color)]" />
                <div>
                  <h2
                    id="recent-people-heading"
                    className="text-base font-bold tracking-[-0.025em]"
                  >
                    Recent People
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Newest in the directory
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                asChild
              >
                <Link href="/people">
                  <UserPlus className="h-3.5 w-3.5" />
                  Add
                </Link>
              </Button>
            </header>
            {stats.recentPeople.length > 0 ? (
              <div className="px-4 sm:px-5">
                <ul className="divide-y divide-border/70" role="list">
                  {stats.recentPeople.map(person => (
                    <li key={person.id}>
                      <Link
                        href={`/people/${person.id}`}
                        className="grid min-h-16 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-1 outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-color)] motion-reduce:transition-none"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-color-soft)] font-bold text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                          {person.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {person.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {person.membershipType}
                          </span>
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {person.joinDate
                            ? new Date(
                                `${person.joinDate}T00:00:00`,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/people"
                  className="flex min-h-11 items-center justify-end gap-2 border-t border-border/70 text-sm font-semibold text-[var(--accent-color-strong)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] dark:text-[var(--accent-color)]"
                >
                  View all people
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
                <Users className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">No people yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add someone to begin building the directory.
                </p>
              </div>
            )}
          </section>

          <section aria-labelledby="life-groups-heading" className={cardClass}>
            <header className="flex items-start gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
              <Users className="mt-0.5 h-5 w-5 text-[var(--accent-color)]" />
              <div>
                <h2
                  id="life-groups-heading"
                  className="text-base font-bold tracking-[-0.025em]"
                >
                  Life Groups
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Member distribution
                </p>
              </div>
            </header>
            {stats.lifeGroupCounts.length > 0 ? (
              <div className="px-4 py-3 sm:px-5">
                <dl className="space-y-3">
                  {stats.lifeGroupCounts.map(group => (
                    <div key={group.name}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <dt className="truncate font-medium">{group.name}</dt>
                        <dd className="font-bold tabular-nums">
                          {group.count}
                        </dd>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[var(--accent-color)]"
                          style={{
                            width: `${Math.round((group.count / maxLifeGroupCount) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </dl>
                <Link
                  href="/life-groups"
                  className="mt-4 flex min-h-10 items-center justify-end gap-2 border-t border-border/70 pt-2 text-sm font-semibold text-[var(--accent-color-strong)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] dark:text-[var(--accent-color)]"
                >
                  View all groups
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
                <Church className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">No life groups yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create a group to see member distribution here.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
