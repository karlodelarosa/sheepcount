"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Book,
  MapPin,
  Calendar,
  Clock,
  Users,
  Home,
  Plus,
  Settings2,
  Crown,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/index";
import { usePeople } from "@/lib/people";
import { useBibleStudy } from "@/lib/bible-study";
import type { BibleStudyStatus } from "@/lib/supabase/bible-study";
import { AddBibleStudyGroupDialog } from "./_components/add-bible-group-dialog";
import { ManageMembersDialog } from "./_components/manage-member-dialog";
import { UpdateBibleStudyStatusDialog } from "./_components/update-status-dialog";
import { ChangeLeaderDialog } from "./_components/change-leader-dialog";
import { OverviewStatCard } from "@/components/overview-stat-card";

const STATUS_LABELS: Record<BibleStudyStatus, string> = {
  active: "Active",
  completed: "Completed",
  paused: "Paused",
  cancelled: "Cancelled",
};

const STATUS_VARIANT: Record<
  BibleStudyStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  completed: "secondary",
  paused: "outline",
  cancelled: "destructive",
};

import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import {
  CollectionToolbar,
  CollectionLoading,
} from "@/components/ui/directory-page-header/collection-toolbar";

export function BibleStudyGroupsView() {
  const { people, households } = usePeople();
  const { groups, members, hydrated, getGroupMembers, getActiveHouseholdIds } =
    useBibleStudy();
  const groupTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [changeLeaderOpen, setChangeLeaderOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);

  useEffect(() => {
    setChangeLeaderOpen(false);
    setUpdateStatusOpen(false);
  }, [selectedGroupId]);

  const activeHouseholdIds = getActiveHouseholdIds();

  const enrichedGroups = useMemo(
    () =>
      groups.map(group => {
        const household = households.find(h => h.id === group.householdId);
        const leader = people.find(p => p.id === group.leaderPersonId);
        const groupMembers = getGroupMembers(group.id);
        return {
          ...group,
          householdName: household?.name ?? "Unknown household",
          location: household?.address ?? "",
          leaderName: leader?.name ?? "Unknown",
          memberCount: groupMembers.length,
        };
      }),
    [groups, households, people, getGroupMembers],
  );

  const selectedGroup =
    enrichedGroups.find(g => g.id === selectedGroupId) ?? null;

  const selectedGroupMembers = useMemo(() => {
    if (!selectedGroup) return [];
    return getGroupMembers(selectedGroup.id)
      .map(m => ({
        membership: m,
        person: people.find(p => p.id === m.personId),
      }))
      .filter(
        (
          row,
        ): row is {
          membership: (typeof row)["membership"];
          person: NonNullable<(typeof row)["person"]>;
        } => Boolean(row.person),
      );
  }, [selectedGroup, getGroupMembers, people]);

  const householdsWithoutStudy = useMemo(
    () => households.filter(h => !activeHouseholdIds.has(h.id)),
    [households, activeHouseholdIds],
  );

  const activeGroups = groups.filter(g => g.status === "active");
  const avgGroupSize =
    groups.length > 0 ? Math.round(members.length / groups.length) : 0;

  const filteredGroups = enrichedGroups.filter(
    group =>
      (statusFilter === "all" || group.status === statusFilter) &&
      `${group.householdName} ${group.leaderName} ${group.location}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  if (!hydrated) return <CollectionLoading />;

  return (
    <div className="space-y-6">
      <DirectoryTitleCard
        title="Bible Study Groups"
        description="Household-based Bible study groups and their members"
        icon={Book}
        actionContent={
          <AddBibleStudyGroupDialog>
            <Button className="min-h-11 gap-2 rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]">
              <Plus className="size-4" />
              Add Bible Study Group
            </Button>
          </AddBibleStudyGroupDialog>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStatCard
          label="Active Groups"
          value={activeGroups.length}
          hint="Currently meeting"
          icon={Book}
          variant="violet"
        />
        <OverviewStatCard
          label="Total Participants"
          value={members.length}
          hint="Across all groups"
          icon={Users}
          variant="blue"
        />
        <OverviewStatCard
          label="Host Households"
          value={activeHouseholdIds.size}
          hint="Hosting Bible studies"
          icon={Home}
          variant="emerald"
        />
        <OverviewStatCard
          label="Avg Group Size"
          value={avgGroupSize}
          hint="Members per group"
          icon={Users}
          variant="amber"
        />
      </div>

      <Tabs defaultValue="groups" className="gap-5">
        <TabsList aria-label="Bible study directories">
          <TabsTrigger value="groups">Bible Study Groups</TabsTrigger>
          <TabsTrigger value="households">Households to Reach</TabsTrigger>
        </TabsList>
        <TabsContent value="groups" className="space-y-5">
          <CollectionToolbar
            label="Bible study groups"
            search={search}
            onSearch={setSearch}
            filter={statusFilter}
            onFilter={setStatusFilter}
            options={[
              { value: "all", label: "All statuses" },
              ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            count={filteredGroups.length}
          />
          <div className="space-y-5">
            <div className="space-y-4">
              <h2 className="text-base font-bold">Bible Study Groups</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {filteredGroups.length === 0 ? (
                  <Card className="min-w-0 rounded-2xl border-border/60 bg-card shadow-sm">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      {enrichedGroups.length
                        ? "No Bible study groups match your filters."
                        : "No Bible study groups yet. Open Households to Reach to start one."}
                    </CardContent>
                  </Card>
                ) : (
                  filteredGroups.map(group => (
                    <Card
                      key={group.id}
                      className={`
                    relative min-w-0 rounded-2xl border-border/60 bg-card shadow-sm transition-all duration-200
                    ${
                      selectedGroupId === group.id
                        ? "ring-2 ring-[var(--accent-color)] shadow-sm"
                        : "hover:shadow-lg hover:border-border"
                    }
                  `}
                    >
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="size-12 shrink-0 rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)] flex items-center justify-center">
                              <Book className="size-6" />
                            </div>
                            <div>
                              <CardTitle className="break-words text-lg font-bold">
                                <button
                                  type="button"
                                  className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2"
                                  aria-label={`View ${group.householdName} Bible study details`}
                                  aria-pressed={selectedGroupId === group.id}
                                  aria-haspopup="dialog"
                                  onClick={event => {
                                    groupTriggerRef.current =
                                      event.currentTarget;
                                    setSelectedGroupId(group.id);
                                  }}
                                />
                                {group.householdName}
                              </CardTitle>
                              <CardDescription>
                                Led by {group.leaderName}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={STATUS_VARIANT[group.status]}>
                            {STATUS_LABELS[group.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {group.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{group.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{group.meetingDay || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{group.meetingTime || "—"}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border/60">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Started:{" "}
                              {new Date(group.startDate).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">
                              {group.memberCount} members
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <Sheet
              open={Boolean(selectedGroup)}
              onOpenChange={open => {
                if (!open) setSelectedGroupId(null);
              }}
            >
              <SheetContent
                className="w-full gap-0 overflow-y-auto border-border bg-card p-0 sm:max-w-xl"
                onCloseAutoFocus={() => groupTriggerRef.current?.focus()}
              >
                {selectedGroup && (
                  <>
                    <SheetHeader className="border-b border-border/60 bg-[var(--accent-color-soft)] p-6 pr-12">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-card text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                        <Book className="size-6" />
                      </div>
                      <SheetTitle className="text-xl">
                        {selectedGroup.householdName}
                      </SheetTitle>
                      <SheetDescription>
                        Led by {selectedGroup.leaderName} · Bible study group
                      </SheetDescription>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="size-4" />
                          {selectedGroup.meetingDay || "Day not set"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="size-4" />
                          {selectedGroup.meetingTime || "Time not set"}
                        </span>
                      </div>
                      {selectedGroup.location && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="size-4 shrink-0" />
                          {selectedGroup.location}
                        </p>
                      )}
                    </SheetHeader>
                    <Card className="min-w-0 rounded-none border-0 bg-card shadow-none">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle>Members</CardTitle>
                            <CardDescription>
                              {selectedGroupMembers.length}{" "}
                              {selectedGroupMembers.length === 1
                                ? "participant"
                                : "participants"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={STATUS_VARIANT[selectedGroup.status]}
                            >
                              {STATUS_LABELS[selectedGroup.status]}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground"
                                  aria-label="Group options"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  disabled={selectedGroup.status !== "active"}
                                  onSelect={() => setChangeLeaderOpen(true)}
                                >
                                  <Crown className="h-4 w-4" />
                                  Change Leader
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => setUpdateStatusOpen(true)}
                                >
                                  <Settings2 className="h-4 w-4" />
                                  Update Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {selectedGroup.statusNotes &&
                          (selectedGroup.status === "paused" ||
                            selectedGroup.status === "cancelled") && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {selectedGroup.statusNotes}
                            </p>
                          )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {selectedGroupMembers.length === 0 && (
                            <p className="py-4 text-sm text-muted-foreground">
                              No members have been added to this group yet.
                            </p>
                          )}
                          {selectedGroupMembers.map(
                            ({ membership, person }) => {
                              const isGuest =
                                person.householdId !==
                                selectedGroup.householdId;
                              return (
                                <div
                                  key={person.id}
                                  className="flex items-center gap-4 p-3 rounded-xl border border-border/60 bg-background/50"
                                >
                                  <div className="size-12 shrink-0 rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)] flex items-center justify-center">
                                    <span className="font-semibold">
                                      {person.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-foreground">
                                      {person.name}
                                    </p>
                                    <p className="text-muted-foreground truncate">
                                      {person.role} — {person.householdName}
                                    </p>
                                  </div>
                                  <Badge variant="outline">
                                    {membership.role === "Guest" || isGuest
                                      ? "Guest"
                                      : membership.role}
                                  </Badge>
                                </div>
                              );
                            },
                          )}
                        </div>

                        <div className="pt-3 border-t border-border/60">
                          {selectedGroup.status === "active" ? (
                            <ManageMembersDialog
                              group={selectedGroup}
                              householdName={selectedGroup.householdName}
                              leaderName={selectedGroup.leaderName}
                            >
                              <Button className="w-full gap-2 bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]">
                                <Users className="w-4 h-4" />
                                Manage Members
                              </Button>
                            </ManageMembersDialog>
                          ) : (
                            <Button className="w-full gap-2" disabled>
                              <Users className="w-4 h-4" />
                              Manage Members
                            </Button>
                          )}
                        </div>
                      </CardContent>

                      <ChangeLeaderDialog
                        group={selectedGroup}
                        householdName={selectedGroup.householdName}
                        currentLeaderName={selectedGroup.leaderName}
                        open={changeLeaderOpen}
                        onOpenChange={setChangeLeaderOpen}
                      />
                      <UpdateBibleStudyStatusDialog
                        group={selectedGroup}
                        householdName={selectedGroup.householdName}
                        open={updateStatusOpen}
                        onOpenChange={setUpdateStatusOpen}
                      />
                    </Card>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </TabsContent>
        <TabsContent value="households">
          <Card className="min-w-0 rounded-2xl border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Households to Reach</CardTitle>
              <CardDescription>
                Households without an active Bible study. Start a group to help
                them connect.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {householdsWithoutStudy.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  Every household already has an active Bible study.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {householdsWithoutStudy.map(household => (
                    <div
                      key={household.id}
                      className="p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-background transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Home className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground">{household.name}</p>
                          <p className="text-muted-foreground truncate">
                            {household.address?.split(",")[0] ?? "No address"}
                          </p>
                        </div>
                      </div>
                      <AddBibleStudyGroupDialog
                        defaultHouseholdId={household.id}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 gap-2"
                        >
                          <Plus className="w-3 h-3" />
                          Start Bible Study
                        </Button>
                      </AddBibleStudyGroupDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
