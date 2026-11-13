"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronRight,
} from "lucide-react";
import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import type { LifeGroup } from "@/lib/supabase/life-groups";
import { cn } from "@/lib/utils";
import { AddLifeGroupDialog } from "./_components/add-life-group-dialog";
import { ManageLifeGroupMembersDialog } from "./_components/manage-life-group-members-dialog";
import { ScheduleDialog } from "./_components/schedule-dialog";
import {
  filterGroups,
  getGroupCounts,
  type QuickFilter,
} from "./_lib/directory";

const accent =
  "bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]";
const softAccent =
  "bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]";

export function LifeGroupsList() {
  const { people } = usePeople();
  const { lifeGroups, lifeGroupMembers, hydrated } = useGroupsMinistry();
  const [addOpen, setAddOpen] = useState(false);
  const [memberGroup, setMemberGroup] = useState<string | null>(null);
  const [scheduleGroup, setScheduleGroup] = useState<LifeGroup | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const counts = getGroupCounts(lifeGroups, lifeGroupMembers);
  const filtered = filterGroups(
    lifeGroups,
    lifeGroupMembers,
    search,
    category,
    quick,
  );
  const active = Boolean(search || category !== "all" || quick !== "all");
  const quickFilters = [
    { key: "all", label: "All Groups", icon: Users },
    { key: "members", label: "With Members", icon: Users },
    { key: "missing", label: "Schedule Missing", icon: Calendar },
  ] as const;
  function reset() {
    setSearch("");
    setCategory("all");
    setQuick("all");
  }
  function actions(group: LifeGroup) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl border-[var(--accent-color-border)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
          onClick={() => setMemberGroup(group.id)}
        >
          <Plus className="size-4" />
          Add Members
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl"
          onClick={() => setScheduleGroup(group)}
        >
          <Calendar className="size-4" />
          {group.schedule.trim() ? "Edit Schedule" : "Set Schedule"}
        </Button>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="ml-auto size-9 shrink-0 rounded-full"
        >
          <Link
            href={`/life-groups/${group.id}`}
            aria-label={`View ${group.name}`}
          >
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <DirectoryTitleCard
        title="Life Groups"
        description="Fellowship groups and their meeting schedules"
        icon={Users}
        action={{
          label: "Add Group",
          icon: Plus,
          onClick: () => setAddOpen(true),
          disabled: !hydrated,
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter life groups"
        >
          {quickFilters.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant="outline"
              aria-pressed={quick === key}
              onClick={() => setQuick(key)}
              className={cn(
                "min-h-11 gap-2 rounded-xl px-4",
                quick === key && accent,
              )}
            >
              <Icon className="size-4" />
              {label}
              <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs text-foreground">
                {hydrated ? counts[key] : "—"}
              </span>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="min-h-11 gap-2 rounded-xl"
            aria-expanded={filtersOpen}
            aria-controls="life-group-filters"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal className="size-4" />
            Filters{category !== "all" ? " (1)" : ""}
          </Button>
          <div
            className={cn("flex rounded-xl p-1", softAccent)}
            role="group"
            aria-label="Display mode"
          >
            {(
              [
                { key: "cards", label: "Cards", icon: LayoutGrid },
                { key: "table", label: "Table", icon: List },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                size="sm"
                variant="ghost"
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={cn(
                  "gap-2 rounded-lg",
                  view === key && "bg-card text-foreground shadow-sm",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {filtersOpen && (
        <div
          id="life-group-filters"
          className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4"
        >
          <div className="w-full space-y-2 sm:w-56">
            <Label htmlFor="life-group-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="life-group-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["all", "Children", "Youth", "Adults"].map(value => (
                  <SelectItem key={value} value={value}>
                    {value === "all" ? "All categories" : value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" onClick={reset}>
            Reset filters
          </Button>
        </div>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search life groups"
          placeholder="Search life groups by name or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-12 rounded-xl bg-muted/40 pl-12"
        />
      </div>
      {active && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span role="status">{filtered.length} groups found</span>
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear all
          </Button>
        </div>
      )}
      {!hydrated ? (
        <div
          role="status"
          aria-label="Loading life groups"
          aria-busy="true"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {[0, 1, 2].map(i => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl border bg-card p-8 text-center"
          role="status"
        >
          <Users
            className={cn("mx-auto mb-3 size-8", "text-muted-foreground")}
          />
          <h2 className="text-lg font-semibold">
            {lifeGroups.length
              ? "No matching life groups"
              : "No life groups yet"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {lifeGroups.length
              ? "Try a different search or clear your filters."
              : "Add your first group to get started."}
          </p>
          <Button
            className={cn("mt-4", accent)}
            onClick={lifeGroups.length ? reset : () => setAddOpen(true)}
          >
            {lifeGroups.length ? "Clear all" : "Add Group"}
          </Button>
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(group => {
            const members = lifeGroupMembers.filter(
              m => m.lifeGroupId === group.id,
            );
            return (
              <article
                key={group.id}
                className="flex min-w-0 flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                      softAccent,
                    )}
                  >
                    <Users className="size-7" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-bold tracking-tight">
                      <Link
                        className="rounded-sm hover:underline focus-visible:outline focus-visible:outline-2"
                        href={`/life-groups/${group.id}`}
                      >
                        {group.name}
                      </Link>
                    </h2>
                    <Badge variant="secondary" className="mt-1 rounded-full">
                      {group.category}
                    </Badge>
                  </div>
                </div>
                <p className="my-4 break-words text-sm text-muted-foreground">
                  {group.description || "No description"}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 border-t py-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Users className="size-4 shrink-0" />
                    {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </span>
                  <span className="flex min-w-0 items-start gap-2">
                    <Calendar className="size-4 shrink-0" />
                    <span className="break-words">
                      {group.schedule.trim() || "No schedule"}
                    </span>
                  </span>
                </div>
                {members.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {members.slice(0, 3).map(member => {
                      const name =
                        people.find(p => p.id === member.personId)?.name ??
                        "Unknown person";
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
                            aria-hidden="true"
                          >
                            {name.charAt(0)}
                          </span>
                          <span className="truncate">{name}</span>
                        </div>
                      );
                    })}
                    {members.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{members.length - 3} more
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-auto pt-3">{actions(group)}</div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(group => (
                <TableRow key={group.id}>
                  <TableCell className="min-w-48 max-w-xs">
                    <Link
                      href={`/life-groups/${group.id}`}
                      className="font-semibold hover:underline"
                    >
                      {group.name}
                    </Link>
                    <p className="mt-1 break-words text-sm text-muted-foreground">
                      {group.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{group.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {
                      lifeGroupMembers.filter(m => m.lifeGroupId === group.id)
                        .length
                    }
                  </TableCell>
                  <TableCell className="min-w-40 max-w-xs break-words">
                    {group.schedule.trim() || "No schedule"}
                  </TableCell>
                  <TableCell className="min-w-80">{actions(group)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <AddLifeGroupDialog open={addOpen} onOpenChange={setAddOpen} />
      {memberGroup && (
        <ManageLifeGroupMembersDialog
          key={memberGroup}
          open
          groupId={memberGroup}
          onOpenChange={open => {
            if (!open) setMemberGroup(null);
          }}
        />
      )}
      {scheduleGroup && (
        <ScheduleDialog
          key={scheduleGroup.id}
          group={scheduleGroup}
          onClose={() => setScheduleGroup(null)}
        />
      )}
    </div>
  );
}
