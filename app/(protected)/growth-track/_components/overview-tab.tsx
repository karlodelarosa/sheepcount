"use client";

import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Phone,
  Home,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Kanban,
  ChartPie,
  CalendarDays,
  GitBranch,
  ListChecks,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { GrowthTrackOverview } from "@/lib/growth-track/overview";
import type { EvangelismStage } from "@/lib/people";
import type { ActionHubSectionFilter } from "../_lib/action-sections";
import { OverviewStatCard } from "@/components/overview-stat-card";
import { ChartPanel, ChartEmpty } from "./chart-panel";
import { cn } from "@/lib/utils";

interface OverviewTabProps {
  overview: GrowthTrackOverview;
  onNavigateToActions: (section: ActionHubSectionFilter) => void;
  onNavigateToPipeline: (stage?: EvangelismStage) => void;
}

function PieLegend({
  data,
}: {
  data: { name: string; value: number; fill: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
      {data.map(item => (
        <div key={item.name} className="flex items-center gap-1.5 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.fill }}
          />
          <span className="text-slate-600 dark:text-zinc-400">{item.name}</span>
          <span className="font-medium tabular-nums text-slate-900 dark:text-white">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

const ACTION_PRIORITY_MAP: Record<
  string,
  {
    section: ActionHubSectionFilter;
    variant: "rose" | "amber" | "violet" | "blue" | "orange";
  }
> = {
  "Contact first-time visitors": { section: "contact", variant: "rose" },
  "Schedule visitations": { section: "at_risk", variant: "orange" },
  "Place people in cell groups": { section: "assignment", variant: "violet" },
  "Send follow-up messages": { section: "follow_up", variant: "amber" },
  "Enroll in Discipleship 101": { section: "discipleship", variant: "blue" },
};

export function OverviewTab({
  overview,
  onNavigateToActions,
  onNavigateToPipeline,
}: OverviewTabProps) {
  const trendLabel =
    overview.trendDirection === "up"
      ? `Up ${overview.trendPercent}%`
      : overview.trendDirection === "down"
        ? `Down ${Math.abs(overview.trendPercent)}%`
        : "Stable";

  const totalNeedingAction =
    overview.needsContactCount +
    overview.needsFollowUpCount +
    overview.needsVisitationCount +
    overview.pendingAssignmentCount +
    overview.readyForDiscipleshipCount;

  return (
    <div className="space-y-5 [&_.recharts-wrapper]:overflow-hidden">
      {/* Attendance metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewStatCard
          label="In Pipeline"
          value={overview.totalInPipeline}
          hint="Active growth track members"
          icon={Users}
          variant="violet"
          onClick={() => onNavigateToPipeline()}
        />
        <OverviewStatCard
          label="Last Sunday"
          value={overview.lastSundayCount}
          hint={`Avg ${overview.averageSundayCount} per service`}
          icon={TrendingUp}
          variant="emerald"
        />
        <OverviewStatCard
          label="Attendance Trend"
          value={trendLabel}
          hint="Recent attendance compared with the prior period"
          icon={
            overview.trendDirection === "up"
              ? TrendingUp
              : overview.trendDirection === "down"
                ? TrendingDown
                : Minus
          }
        />
        <OverviewStatCard
          label="On Track"
          value={overview.onTrackCount}
          hint={`${overview.needsContactCount} need contact · ${overview.needsVisitationCount} at risk`}
          icon={Home}
          variant="emerald"
        />
      </div>

      {/* Primary charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <ChartPanel
          title="Sunday Attendance"
          icon={TrendingUp}
          description="Week-over-week headcount with rolling average"
        >
          {overview.sundayTrend.length === 0 ? (
            <ChartEmpty message="No Sunday attendance recorded yet." />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview.sundayTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine
                    y={overview.averageSundayCount}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{
                      value: `Avg ${overview.averageSundayCount}`,
                      position: "insideTopRight",
                      fontSize: 10,
                      fill: "#94a3b8",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Attendees"
                    stroke="var(--accent-color)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--accent-color)" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    name="Average"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          title="Pipeline Distribution"
          icon={Kanban}
          description="Current distribution across growth stages"
          action={
            <button
              type="button"
              onClick={() => onNavigateToPipeline()}
              className="text-xs text-[var(--accent-color-strong)] dark:text-[var(--accent-color)] hover:underline flex items-center gap-1 shrink-0"
            >
              <Kanban className="w-3 h-3" />
              Pipeline
            </button>
          }
        >
          {overview.stagePieData.length === 0 ? (
            <ChartEmpty message="No one in the pipeline yet." />
          ) : (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.stagePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {overview.stagePieData.map(entry => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <PieLegend data={overview.stagePieData} />
            </>
          )}
        </ChartPanel>
      </div>

      <div
        className={cn(
          "grid items-start gap-5",
          totalNeedingAction > 0 &&
            overview.recommendedActions.length > 0 &&
            "xl:grid-cols-2",
        )}
      >
        {/* Action priority strip — clickable entry points */}
        {totalNeedingAction > 0 && (
          <div className="min-w-0 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Follow-up Priorities
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Select a category to see people and take action
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToActions("all")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-color-strong)] dark:text-[var(--accent-color)] hover:underline transition-colors shrink-0"
              >
                View all in Action Hub
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {overview.needsContactCount > 0 && (
                <OverviewStatCard
                  label="Needs Contact"
                  value={overview.needsContactCount}
                  icon={Phone}
                  variant="rose"
                  onClick={() => onNavigateToActions("contact")}
                />
              )}
              {overview.needsFollowUpCount > 0 && (
                <OverviewStatCard
                  label="Needs Follow-up"
                  value={overview.needsFollowUpCount}
                  icon={MessageSquare}
                  variant="amber"
                  onClick={() => onNavigateToActions("follow_up")}
                />
              )}
              {overview.pendingAssignmentCount > 0 && (
                <OverviewStatCard
                  label="Pending Placement"
                  value={overview.pendingAssignmentCount}
                  icon={Users}
                  variant="violet"
                  onClick={() => onNavigateToActions("assignment")}
                />
              )}
              {overview.readyForDiscipleshipCount > 0 && (
                <OverviewStatCard
                  label="Ready for D101"
                  value={overview.readyForDiscipleshipCount}
                  icon={BookOpen}
                  variant="blue"
                  onClick={() => onNavigateToActions("discipleship")}
                />
              )}
              {overview.needsVisitationCount > 0 && (
                <OverviewStatCard
                  label="At Risk"
                  value={overview.needsVisitationCount}
                  icon={AlertTriangle}
                  variant="orange"
                  onClick={() => onNavigateToActions("at_risk")}
                />
              )}
            </div>
          </div>
        )}
        {/* Recommended actions */}
        {overview.recommendedActions.length > 0 && (
          <div className="min-w-0 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <p className="mb-4 text-base font-bold tracking-tight">
              Recommended Next Moves
            </p>
            <div className="grid gap-3">
              {overview.recommendedActions.map(action => {
                const mapping = ACTION_PRIORITY_MAP[action.title];
                return (
                  <button
                    key={action.title}
                    type="button"
                    disabled={!mapping}
                    onClick={() =>
                      mapping && onNavigateToActions(mapping.section)
                    }
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]",
                      mapping
                        ? "group border-border/60 bg-background hover:border-[var(--accent-color-border)] hover:bg-[var(--accent-color-soft)]"
                        : "border-border/60 bg-background",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {action.title}
                      </p>
                      <Badge
                        variant={
                          action.priority === "high"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs shrink-0"
                      >
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      {action.description}
                    </p>
                    {mapping && action.count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-color-strong)] dark:text-[var(--accent-color)] mt-2">
                        View {action.count} people
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Funnel + Outreach */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartPanel
          title="Growth Funnel"
          icon={GitBranch}
          description="Tap a stage to filter the pipeline view"
        >
          {overview.totalInPipeline === 0 ? (
            <ChartEmpty message="Pipeline is empty." />
          ) : (
            <div className="space-y-2.5 py-1">
              {overview.funnelData.map(item => (
                <button
                  key={item.stage}
                  type="button"
                  onClick={() =>
                    onNavigateToPipeline(item.stage as EvangelismStage)
                  }
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] min-h-11 w-full text-left group rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-zinc-300 truncate pr-2 group-hover:text-[var(--accent-color-strong)] dark:group-hover:text-[var(--accent-color)]">
                      {item.shortLabel}
                    </span>
                    <span className="tabular-nums text-slate-500 dark:text-zinc-400 shrink-0 flex items-center gap-1">
                      {item.count}
                      <span className="text-slate-400">({item.percent}%)</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent-color)]" />
                    </span>
                  </div>
                  <div className="h-6 rounded-md bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2 min-w-[1.5rem]"
                      style={{
                        width: `${Math.max(item.widthPercent, item.count > 0 ? 8 : 0)}%`,
                        backgroundColor: item.fill,
                      }}
                    >
                      {item.count > 0 && (
                        <span className="text-[10px] font-semibold text-white">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          title="Outreach Priorities"
          icon={Phone}
          description="Tap a segment to see who needs action"
        >
          {overview.outreachPieData.length === 0 ? (
            <ChartEmpty message="No pipeline data to analyze." />
          ) : (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.outreachPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      onClick={(_, index) => {
                        const slice = overview.outreachPieData[index];
                        if (!slice) return;
                        const sectionMap: Record<
                          string,
                          ActionHubSectionFilter
                        > = {
                          "Needs Contact": "contact",
                          "Needs Follow-up": "follow_up",
                          "Needs Visitation": "at_risk",
                        };
                        const section = sectionMap[slice.name];
                        if (section) onNavigateToActions(section);
                      }}
                      className="cursor-pointer"
                    >
                      {overview.outreachPieData.map(entry => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {overview.outreachPieData.map(item => {
                  const sectionMap: Record<string, ActionHubSectionFilter> = {
                    "Needs Contact": "contact",
                    "Needs Follow-up": "follow_up",
                    "Needs Visitation": "at_risk",
                  };
                  const section = sectionMap[item.name];
                  return (
                    <button
                      key={item.name}
                      type="button"
                      disabled={!section}
                      onClick={() => section && onNavigateToActions(section)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border transition-colors",
                        section
                          ? "hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          : "opacity-60 cursor-default",
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      {item.name}
                      <span className="font-medium tabular-nums">
                        {item.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </ChartPanel>
      </div>

      {/* Monthly + Service type */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <ChartPanel
          title="Monthly Attendance"
          icon={CalendarDays}
          description="Sunday vs life group sessions over time"
        >
          {overview.monthlyTrend.length === 0 ? (
            <ChartEmpty message="No attendance sessions recorded yet." />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.monthlyTrend}>
                  <defs>
                    <linearGradient id="sundayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--accent-color)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--accent-color)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="lifeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--accent-color-strong)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--accent-color-strong)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sunday"
                    name="Sunday"
                    stroke="var(--accent-color)"
                    fill="url(#sundayGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="lifeGroup"
                    name="Life Group"
                    stroke="var(--accent-color-strong)"
                    fill="url(#lifeGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          title="By Service Type"
          icon={ChartPie}
          description="Total headcount per service"
        >
          {overview.serviceTypeData.length === 0 ? (
            <ChartEmpty message="No service attendance data." />
          ) : (
            <>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.serviceTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {overview.serviceTypeData.map(entry => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <PieLegend data={overview.serviceTypeData} />
            </>
          )}
        </ChartPanel>
      </div>

      {/* Assignment + Membership */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartPanel
          title="Assignment Status"
          icon={ListChecks}
          description="Tap a status to see people who need action"
        >
          {overview.assignmentBarData.length === 0 ? (
            <ChartEmpty message="No assignment data." />
          ) : (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overview.assignmentBarData}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.3}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      width={100}
                    />
                    <Tooltip />
                    <Bar dataKey="value" name="People" radius={[0, 4, 4, 0]}>
                      {overview.assignmentBarData.map(entry => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {overview.assignmentBarData.map(item => {
                  const sectionMap: Record<string, ActionHubSectionFilter> = {
                    Unassigned: "assignment",
                    "Pending Placement": "assignment",
                    "Needs Leader": "assignment",
                    "Ready for D101": "discipleship",
                  };
                  const section = sectionMap[item.name];
                  return (
                    <button
                      key={item.name}
                      type="button"
                      disabled={!section}
                      onClick={() => section && onNavigateToActions(section)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border transition-colors",
                        section
                          ? "hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          : "opacity-60 cursor-default",
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      {item.name}
                      <span className="font-medium tabular-nums">
                        {item.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </ChartPanel>

        <ChartPanel
          title="Membership Mix"
          icon={Users}
          description="Types in the growth pipeline"
        >
          {overview.membershipPieData.length === 0 ? (
            <ChartEmpty message="No pipeline members." />
          ) : (
            <>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.membershipPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {overview.membershipPieData.map(entry => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <PieLegend data={overview.membershipPieData} />
            </>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}
