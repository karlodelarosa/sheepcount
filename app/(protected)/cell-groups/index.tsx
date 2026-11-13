"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { accentSurfaceVariants } from "@/components/ui/accent-surface";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  HeartHandshake,
  MapPin,
  UserRoundPlus,
  Users,
  UserRoundCheck,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronRight,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AssignLeadersDialog } from "./assign-leaders-dialog";
import { useTenant } from "@/app/providers/tenant-provider";

export function CellGroupsList() {
  const router = useRouter();
  const { tenant } = useTenant();
  const isAdmin = tenant?.profile.role === "admin";
  const { people } = usePeople();
  const {
    cellGroups,
    cellGroupMembers,
    cellGroupLeaders,
    hydrated,
    isSaving,
    addCellGroup,
    assignCellGroupLeader,
    assignCellGroupLeaders,
    revokeCellGroupLeader,
    searchCellGroupLeaderCandidates,
  } = useGroupsMinistry();
  const [showCreate, setShowCreate] = useState(false);
  const [showAssignLeaders, setShowAssignLeaders] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const getGroupMembers = (groupId: string) => {
    const memberships = cellGroupMembers.filter(m => m.cellGroupId === groupId);
    return memberships.map(membership => ({
      ...membership,
      person: people.find(p => p.id === membership.personId),
    }));
  };

  const activeGroups = useMemo(
    () => cellGroups.filter(g => g.status === "active"),
    [cellGroups],
  );
  const ungroupedLeaders = useMemo(
    () => cellGroupLeaders.filter(leader => leader.activeGroupCount === 0),
    [cellGroupLeaders],
  );

  const handleCreate = async () => {
    if (!name.trim()) return;
    const group = await addCellGroup({ name, description, location });
    if (group) {
      setName("");
      setDescription("");
      setLocation("");
      setShowCreate(false);
      router.push(`/cell-groups/${group.id}`);
    }
  };

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [leadersVisible, setLeadersVisible] = useState(true);
  const [assignPersonId, setAssignPersonId] = useState<string | null>(null);
  const [assignGroupId, setAssignGroupId] = useState("");
  const DualModePrimaryButtonClass =
    "rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]";
  const hasLeader = (group: (typeof activeGroups)[number]) =>
    Boolean(
      group.leaderPersonId ||
        getGroupMembers(group.id).some(member => member.role === "Leader"),
    );
  const filters = [
    { id: "all", label: "All Groups", icon: Users, count: activeGroups.length },
    {
      id: "leaders",
      label: "With Leaders",
      icon: UserRoundCheck,
      count: activeGroups.filter(hasLeader).length,
    },
    {
      id: "no-leader",
      label: "No Leader",
      icon: UserRoundPlus,
      count: activeGroups.filter(group => !hasLeader(group)).length,
    },
    {
      id: "empty",
      label: "No Members",
      icon: Users,
      count: activeGroups.filter(group => !getGroupMembers(group.id).length)
        .length,
    },
  ];
  const visibleGroups = activeGroups.filter(group => {
    const members = getGroupMembers(group.id);
    const matchesFilter =
      filter === "all" ||
      (filter === "leaders" && hasLeader(group)) ||
      (filter === "no-leader" && !hasLeader(group)) ||
      (filter === "empty" && !members.length);
    const leaderName =
      people.find(person => person.id === group.leaderPersonId)?.name ?? "";
    return (
      matchesFilter &&
      [
        group.name,
        group.location,
        leaderName,
        ...members
          .filter(member => member.role === "Leader")
          .map(member => member.person?.name ?? ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    );
  });

  if (!hydrated)
    return (
      <div role="status" aria-busy="true" className="space-y-4">
        <div className="h-28 animate-pulse rounded-xl bg-muted" />
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
        <span className="sr-only">Loading cell groups</span>
      </div>
    );

  return (
    <div className="space-y-5">
      <DirectoryTitleCard
        title="Cell Groups"
        description="Open feeder-course communities where people build relationships, study Scripture, and prepare for intentional discipleship."
        icon={HeartHandshake}
        secondaryAction={
          isAdmin
            ? {
                label: "Assign Leaders",
                icon: UserRoundPlus,
                onClick: () => setShowAssignLeaders(true),
              }
            : undefined
        }
        action={{
          label: "New Cell Group",
          icon: Plus,
          onClick: () => setShowCreate(value => !value),
        }}
      />
      <div className="flex flex-wrap gap-2" aria-label="Filter cell groups">
        {filters.map(item => (
          <Button
            key={item.id}
            variant="outline"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "h-11 gap-2 rounded-xl bg-card px-4 shadow-sm",
              filter === item.id && DualModePrimaryButtonClass,
            )}
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs tabular-nums">
              {item.count}
            </span>
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Search cell groups by name, leader, or location"
            placeholder="Search cell groups by name, leader, or location…"
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="h-11 rounded-xl bg-muted/40 pl-10"
          />
        </div>
        <div
          className="flex shrink-0 rounded-xl border bg-card p-1"
          aria-label="Group view"
        >
          {(["grid", "list"] as const).map(mode => (
            <Button
              key={mode}
              variant="ghost"
              size="icon"
              aria-label={`${mode === "grid" ? "Grid" : "List"} view`}
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={cn(
                "size-9 rounded-lg",
                view === mode && DualModePrimaryButtonClass,
              )}
            >
              {mode === "grid" ? (
                <LayoutGrid className="size-4" />
              ) : (
                <List className="size-4" />
              )}
            </Button>
          ))}
        </div>
      </div>
      {showCreate && (
        <Card className="border-slate-200/60 dark:border-zinc-700/60">
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-white">
              Create Cell Group
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Cell Group Alpha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-location">Default Location</Label>
              <Input
                id="group-location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g., Santos residence"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">Description (optional)</Label>
              <Textarea
                id="group-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Meeting schedule, focus area, etc."
              />
            </div>
            <Button
              onClick={() => void handleCreate()}
              disabled={!name.trim() || isSaving}
              className={DualModePrimaryButtonClass}
            >
              Create
            </Button>
          </CardContent>
        </Card>
      )}

      {isAdmin && ungroupedLeaders.length > 0 && (
        <section
          aria-labelledby="ungrouped-leaders-heading"
          className="rounded-2xl border border-[var(--accent-color-border)] bg-[var(--accent-color-soft)] p-4"
        >
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
            <div className="flex gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)]">
                <Users className="size-6" />
              </span>
              <div>
                <h2 id="ungrouped-leaders-heading" className="font-bold">
                  Leaders without a group ({ungroupedLeaders.length})
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Approved to set up their first Circle when they are ready.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={leadersVisible}
              aria-controls="ungrouped-leaders"
              onClick={() => setLeadersVisible(value => !value)}
            >
              <ChevronDown
                className={cn("mr-2 size-4", leadersVisible && "rotate-180")}
              />
              {leadersVisible ? "Hide" : "Show"}
            </Button>
          </div>
          {leadersVisible && (
            <div
              id="ungrouped-leaders"
              className="mt-4 overflow-x-auto rounded-xl bg-card"
            >
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Leader</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Circles account</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {ungroupedLeaders.map(leader => (
                    <tr key={leader.personId}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-white">
                            {leader.fullName.charAt(0)}
                          </span>
                          <span className="font-medium">{leader.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Badge className="border-0 bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)]">
                          Approved
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        {leader.accountStatus === "active"
                          ? "Active"
                          : "Not set up"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSaving || !activeGroups.length}
                            onClick={() => {
                              setAssignPersonId(leader.personId);
                              setAssignGroupId("");
                            }}
                          >
                            <UserRoundPlus className="mr-2 size-4" />
                            Assign to Group
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isSaving}
                              >
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remove leader status?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {leader.fullName} will lose leader-only
                                  Circles access. Their stored credentials will
                                  be kept.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    void revokeCellGroupLeader(leader.personId)
                                  }
                                >
                                  Remove leader status
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      {visibleGroups.length === 0 ? (
        <div
          role="status"
          className="rounded-2xl border bg-card px-6 py-14 text-center"
        >
          <HeartHandshake className="mx-auto mb-3 size-10 text-muted-foreground" />
          <h2 className="font-semibold">
            {activeGroups.length ? "No matching groups" : "No cell groups yet"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeGroups.length
              ? "Try another name, location, or status filter."
              : "Create a cell group to start building community."}
          </p>
          {activeGroups.length > 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            view === "grid" && "md:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {visibleGroups.map(group => {
            const members = getGroupMembers(group.id);
            const leader =
              people.find(person => person.id === group.leaderPersonId) ??
              members.find(member => member.role === "Leader")?.person;
            return (
              <article
                key={group.id}
                className="flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-[border-color,box-shadow] duration-150 hover:border-[var(--accent-color-border)] hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-xl",
                      accentSurfaceVariants({ tone: "gradient" }),
                    )}
                  >
                    <HeartHandshake className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/cell-groups/${group.id}`}
                      className="rounded font-bold text-lg tracking-tight hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {group.name}
                    </Link>
                    {group.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    )}
                    {group.location && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        {group.location}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "shrink-0 rounded-full text-xs",
                      members.length > 0 &&
                        accentSurfaceVariants({ tone: "soft" }),
                    )}
                  >
                    {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </Badge>
                </div>
                <div className="flex min-h-20 flex-1 items-center pt-5">
                  {members.length ? (
                    <div
                      className="flex -space-x-2"
                      aria-label={`${members.length} members`}
                    >
                      {members.slice(0, 5).map(member => (
                        <span
                          key={member.id}
                          title={member.person?.name ?? "Member"}
                          className="flex size-11 items-center justify-center rounded-full border-2 border-card bg-[var(--accent-color-soft)] font-semibold text-[var(--accent-color-strong)]"
                        >
                          {member.person?.name.charAt(0) ?? "?"}
                        </span>
                      ))}
                      {members.length > 5 && (
                        <span className="flex size-11 items-center justify-center rounded-full border-2 border-card bg-muted text-xs">
                          +{members.length - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full text-center text-sm text-muted-foreground">
                      <Users className="mx-auto mb-1 size-6" />
                      No members yet
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                  {leader ? (
                    <div className="flex min-w-0 items-center gap-2 text-sm">
                      <Crown className="size-4 shrink-0 text-[var(--accent-color-strong)]" />
                      <span className="truncate">{leader.name}</span>
                      <Badge
                        variant="secondary"
                        className="bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)]"
                      >
                        Leader
                      </Badge>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="px-0 text-[var(--accent-color-strong)]"
                      onClick={() => router.push(`/cell-groups/${group.id}`)}
                    >
                      <UserRoundPlus className="mr-2 size-4" />
                      {members.length ? "Assign Leader" : "Add Members"}
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 rounded-full border-[var(--accent-color-border)] bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] hover:bg-[var(--accent-color)] hover:text-[var(--accent-color-foreground)] dark:text-[var(--accent-color)] dark:hover:text-[var(--accent-color-foreground)]"
                  >
                    <Link
                      href={`/cell-groups/${group.id}`}
                      aria-label={`Open ${group.name}`}
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Dialog
        open={Boolean(assignPersonId)}
        onOpenChange={open => {
          if (!open) setAssignPersonId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Group</DialogTitle>
            <DialogDescription>
              Choose a cell group for{" "}
              {
                ungroupedLeaders.find(
                  leader => leader.personId === assignPersonId,
                )?.fullName
              }
              .
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="leader-group">Cell group</Label>
          <select
            id="leader-group"
            value={assignGroupId}
            onChange={event => setAssignGroupId(event.target.value)}
            className="h-11 w-full rounded-lg border bg-background px-3"
          >
            <option value="">Select a group</option>
            {activeGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
                {hasLeader(group) ? " (replace current leader)" : ""}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignPersonId(null)}>
              Cancel
            </Button>
            <Button
              disabled={!assignGroupId || isSaving}
              onClick={async () => {
                if (
                  assignPersonId &&
                  (await assignCellGroupLeader(assignGroupId, assignPersonId))
                )
                  setAssignPersonId(null);
              }}
            >
              {isSaving ? "Assigning…" : "Assign Leader"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isAdmin && (
        <AssignLeadersDialog
          open={showAssignLeaders}
          onOpenChange={setShowAssignLeaders}
          isSaving={isSaving}
          onAssign={assignCellGroupLeaders}
          onSearch={searchCellGroupLeaderCandidates}
        />
      )}
    </div>
  );
}
