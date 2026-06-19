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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserCheck,
  UserPlus,
  UserCog,
  Search,
  Loader2,
  Briefcase,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { usePeople, type Person } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { formatMinistryAssignmentLabel } from "@/lib/work-ministry-labels";
import {
  getMembershipDisplayColor,
  getMembershipDisplayLabel,
  isAttenderNewComer,
} from "@/lib/membership-path";
import { cn } from "@/lib/utils";

const panelCard =
  "rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:border-zinc-700/90 dark:bg-zinc-900/95 dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)]";

const statCard =
  "rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:border-zinc-700/90 dark:bg-zinc-900/95 dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-shadow hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.35)]";

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

function PersonAvatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-lg bg-slate-800 dark:bg-zinc-700 flex items-center justify-center shadow-sm shrink-0">
      <span className="text-white text-sm font-medium">{name.charAt(0)}</span>
    </div>
  );
}

function StatSummaryCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className={statCard}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {label}
            </p>
            <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-white leading-none">
              {value}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">
              {hint}
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-slate-200/80 bg-slate-50 p-2 dark:border-zinc-600/80 dark:bg-zinc-800/80">
            <Icon className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MinistryInvolvement({ personId }: { personId: string }) {
  const { getPersonMinistries } = useGroupsMinistry();
  const assignments = getPersonMinistries(personId);

  if (assignments.length === 0) {
    return (
      <span className="text-sm text-slate-400 dark:text-zinc-500 italic">
        Not assigned
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {assignments.map(a => (
        <Badge
          key={a.id}
          variant="secondary"
          className="rounded-md text-xs font-normal bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
          title={formatMinistryAssignmentLabel(a)}
        >
          {a.ministry?.name ?? "Ministry"}
          {(() => {
            const detail = formatMinistryAssignmentLabel(a);
            return detail && detail !== "Member" ? ` · ${detail}` : "";
          })()}
        </Badge>
      ))}
    </div>
  );
}

function WorkersTable({
  people,
  search,
  onSearchChange,
}: {
  people: Person[];
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const router = useRouter();
  const filtered = useMemo(
    () =>
      people.filter(
        p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.householdName.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [people, search],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 dark:bg-zinc-800/50 dark:border-zinc-700/80">
        <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 shrink-0" />
        <Input
          placeholder="Search workers by name, household, or email..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="border border-slate-200/80 rounded-xl overflow-hidden dark:border-zinc-700/80">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-zinc-800/60">
              <TableHead>Name</TableHead>
              <TableHead>Household</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="min-w-[200px]">Ministry Involvement</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-slate-500 dark:text-zinc-500 py-10"
                >
                  No workers found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(person => (
                <TableRow
                  key={person.id}
                  className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
                  onClick={() => router.push(`/people/${person.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <PersonAvatar name={person.name} />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {person.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-zinc-400">
                    {person.householdName || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-zinc-400 text-sm">
                    {person.email || person.phone || "—"}
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <MinistryInvolvement personId={person.id} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-lg ${getMembershipDisplayColor(person.membershipType, person.joinDate)}`}
                    >
                      {getMembershipDisplayLabel(
                        person.membershipType,
                        person.joinDate,
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function MembershipTable({
  people,
  search,
  onSearchChange,
  showNewComer = false,
  emptyMessage,
}: {
  people: Person[];
  search: string;
  onSearchChange: (v: string) => void;
  showNewComer?: boolean;
  emptyMessage: string;
}) {
  const router = useRouter();
  const filtered = useMemo(
    () =>
      people.filter(
        p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.householdName.toLowerCase().includes(search.toLowerCase()),
      ),
    [people, search],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 dark:bg-zinc-800/50 dark:border-zinc-700/80">
        <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 shrink-0" />
        <Input
          placeholder="Search by name or household..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="border border-slate-200/80 rounded-xl overflow-hidden dark:border-zinc-700/80">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-zinc-800/60">
              <TableHead>Name</TableHead>
              <TableHead>Household</TableHead>
              <TableHead>Joined</TableHead>
              {showNewComer && <TableHead>Status</TableHead>}
              <TableHead>Contact</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showNewComer ? 6 : 5}
                  className="text-center text-slate-500 dark:text-zinc-500 py-10"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(person => (
                <TableRow
                  key={person.id}
                  className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
                  onClick={() => router.push(`/people/${person.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <PersonAvatar name={person.name} />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {person.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-zinc-400">
                    {person.householdName || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-zinc-400 text-sm">
                    {formatDate(person.joinDate)}
                  </TableCell>
                  {showNewComer && (
                    <TableCell>
                      <Badge
                        className={`rounded-lg ${getMembershipDisplayColor(person.membershipType, person.joinDate)}`}
                      >
                        {getMembershipDisplayLabel(
                          person.membershipType,
                          person.joinDate,
                        )}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-slate-600 dark:text-zinc-400 text-sm">
                    {person.email || person.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function OverviewPersonRow({
  person,
  subtitle,
  onClick,
}: {
  person: Person;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 hover:bg-slate-100/80 dark:border-zinc-700/70 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70 transition-colors text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <PersonAvatar name={person.name} />
        <div className="min-w-0">
          <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
            {person.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">
            {subtitle}
          </p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </button>
  );
}

function TabCount({ count }: { count: number }) {
  return (
    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-slate-200/80 px-1.5 text-[10px] font-medium text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
      {count}
    </span>
  );
}

export function WorkersView() {
  const router = useRouter();
  const { people, hydrated } = usePeople();
  const { getPersonMinistries } = useGroupsMinistry();
  const [activeTab, setActiveTab] = useState("overview");
  const [workerSearch, setWorkerSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [attenderSearch, setAttenderSearch] = useState("");

  const workers = useMemo(
    () =>
      people.filter(
        p =>
          (p.membershipType === "Worker" ||
            p.membershipType === "Volunteer Worker") &&
          p.status === "Active",
      ),
    [people],
  );
  const members = useMemo(
    () =>
      people.filter(
        p => p.membershipType === "Member" && p.status === "Active",
      ),
    [people],
  );
  const attenders = useMemo(
    () =>
      people.filter(
        p => p.membershipType === "Attender" && p.status === "Active",
      ),
    [people],
  );
  const newComers = useMemo(
    () =>
      [...attenders.filter(p => isAttenderNewComer(p.joinDate))].sort(
        (a, b) =>
          new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
      ),
    [attenders],
  );
  const workersWithMinistry = useMemo(
    () => workers.filter(p => getPersonMinistries(p.id).length > 0),
    [workers, getPersonMinistries],
  );
  const workersWithoutMinistry = useMemo(
    () => workers.filter(p => getPersonMinistries(p.id).length === 0),
    [workers, getPersonMinistries],
  );

  const ministryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const worker of workers) {
      for (const a of getPersonMinistries(worker.id)) {
        const name = a.ministry?.name ?? "Unnamed ministry";
        map.set(name, (map.get(name) ?? 0) + 1);
      }
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [workers, getPersonMinistries]);

  const totalActive = workers.length + members.length + attenders.length;
  const composition = useMemo(
    () => [
      { label: "Workers", count: workers.length, pct: totalActive ? (workers.length / totalActive) * 100 : 0 },
      { label: "Members", count: members.length, pct: totalActive ? (members.length / totalActive) * 100 : 0 },
      { label: "Attenders", count: attenders.length, pct: totalActive ? (attenders.length / totalActive) * 100 : 0 },
    ],
    [workers.length, members.length, attenders.length, totalActive],
  );

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 dark:text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading membership data...
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
      <TabsList className="grid w-full max-w-2xl grid-cols-4 h-10 p-1 bg-slate-100/80 dark:bg-zinc-800/80">
        <TabsTrigger value="overview" className="text-xs sm:text-sm rounded-lg">
          Overview
        </TabsTrigger>
        <TabsTrigger value="workers" className="text-xs sm:text-sm rounded-lg">
          Workers
          <TabCount count={workers.length} />
        </TabsTrigger>
        <TabsTrigger value="members" className="text-xs sm:text-sm rounded-lg">
          Members
          <TabCount count={members.length} />
        </TabsTrigger>
        <TabsTrigger value="attenders" className="text-xs sm:text-sm rounded-lg">
          Attenders
          <TabCount count={attenders.length} />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatSummaryCard
            label="Total active"
            value={totalActive}
            hint="Workers, members & attenders"
            icon={Users}
          />
          <StatSummaryCard
            label="Workers"
            value={workers.length}
            hint={`${workersWithMinistry.length} in ministries`}
            icon={UserCog}
          />
          <StatSummaryCard
            label="Members"
            value={members.length}
            hint="Official church members"
            icon={UserCheck}
          />
          <StatSummaryCard
            label="Attenders"
            value={attenders.length}
            hint={`${newComers.length} new comer${newComers.length !== 1 ? "s" : ""}`}
            icon={UserPlus}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className={cn(panelCard, "lg:col-span-2")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900 dark:text-white">
                Needs attention
              </CardTitle>
              <CardDescription>
                People worth a follow-up or assignment this week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                    New comers
                    {newComers.length > 0 && (
                      <span className="ml-2 text-slate-500 dark:text-zinc-500 font-normal">
                        ({newComers.length})
                      </span>
                    )}
                  </h3>
                </div>
                {newComers.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-zinc-500 py-3 px-1">
                    No new comers in the last 30 days.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {newComers.slice(0, 4).map(person => (
                      <OverviewPersonRow
                        key={person.id}
                        person={person}
                        subtitle={`Joined ${formatDate(person.joinDate)} · ${person.householdName || "No household"}`}
                        onClick={() => router.push(`/people/${person.id}`)}
                      />
                    ))}
                    {newComers.length > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-slate-600 dark:text-zinc-400"
                        onClick={() => setActiveTab("attenders")}
                      >
                        View all {newComers.length} new comers
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200/80 dark:border-zinc-700/80 pt-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <AlertCircle className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                    Workers without ministry
                    {workersWithoutMinistry.length > 0 && (
                      <span className="ml-2 text-slate-500 dark:text-zinc-500 font-normal">
                        ({workersWithoutMinistry.length})
                      </span>
                    )}
                  </h3>
                </div>
                {workersWithoutMinistry.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-zinc-500 py-3 px-1">
                    All workers have at least one ministry assignment.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {workersWithoutMinistry.slice(0, 4).map(person => (
                      <OverviewPersonRow
                        key={person.id}
                        person={person}
                        subtitle={person.householdName || "No household"}
                        onClick={() => router.push(`/people/${person.id}`)}
                      />
                    ))}
                    {workersWithoutMinistry.length > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-slate-600 dark:text-zinc-400"
                        onClick={() => setActiveTab("workers")}
                      >
                        View all workers
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={panelCard}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900 dark:text-white">
                Ministry coverage
              </CardTitle>
              <CardDescription>
                {workersWithMinistry.length} of {workers.length} workers
                assigned
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                  {composition.map((seg, i) => (
                    <div
                      key={seg.label}
                      className={cn(
                        "h-full",
                        i === 0 && "bg-slate-700 dark:bg-zinc-400",
                        i === 1 && "bg-slate-500 dark:bg-zinc-500",
                        i === 2 && "bg-slate-300 dark:bg-zinc-600",
                      )}
                      style={{ width: `${seg.pct}%` }}
                      title={`${seg.label}: ${seg.count}`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-zinc-400">
                  {composition.map(seg => (
                    <span key={seg.label}>
                      {seg.label}{" "}
                      <span className="font-medium text-slate-900 dark:text-white">
                        {seg.count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {ministryBreakdown.length > 0 ? (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                    By ministry
                  </p>
                  {ministryBreakdown.map(([name, count]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 dark:border-zinc-800 last:border-0"
                    >
                      <span className="text-slate-700 dark:text-zinc-300 truncate pr-2">
                        {name}
                      </span>
                      <span className="tabular-nums font-medium text-slate-900 dark:text-white shrink-0">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-zinc-500">
                  No ministry assignments recorded yet.
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-lg border-slate-200 dark:border-zinc-700"
                onClick={() => setActiveTab("workers")}
              >
                <Briefcase className="w-3.5 h-3.5 mr-2" />
                Open workers list
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              { tab: "workers", label: "Browse workers", count: workers.length, desc: "Ministry involvement" },
              { tab: "members", label: "Browse members", count: members.length, desc: "Official members" },
              { tab: "attenders", label: "Browse attenders", count: attenders.length, desc: "Visitors & new comers" },
            ] as const
          ).map(item => (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className={cn(
                panelCard,
                "p-4 text-left hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-shadow",
              )}
            >
              <p className="font-medium text-sm text-slate-900 dark:text-white">
                {item.label}
              </p>
              <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-white mt-1">
                {item.count}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="workers" className="mt-0">
        <Card className={panelCard}>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Workers & Ministry Involvement
            </CardTitle>
            <CardDescription>
              {workers.length} active worker
              {workers.length !== 1 ? "s" : ""} — {workersWithMinistry.length}{" "}
              with ministry assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkersTable
              people={workers}
              search={workerSearch}
              onSearchChange={setWorkerSearch}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="members" className="mt-0">
        <Card className={panelCard}>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Members
            </CardTitle>
            <CardDescription>
              {members.length} official church member
              {members.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MembershipTable
              people={members}
              search={memberSearch}
              onSearchChange={setMemberSearch}
              emptyMessage="No members found"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="attenders" className="mt-0">
        <Card className={panelCard}>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Attenders
            </CardTitle>
            <CardDescription>
              {attenders.length} active attender
              {attenders.length !== 1 ? "s" : ""} — {newComers.length} shown as
              New Comer (first 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MembershipTable
              people={attenders}
              search={attenderSearch}
              onSearchChange={setAttenderSearch}
              showNewComer
              emptyMessage="No attenders found"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
