"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function BibleStudyGroupsView() {
  const { people, households } = usePeople();
  const {
    groups,
    members,
    hydrated,
    getGroupMembers,
    getActiveHouseholdIds,
  } = useBibleStudy();
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

  const selectedGroup = enrichedGroups.find(g => g.id === selectedGroupId) ?? null;

  const selectedGroupMembers = useMemo(() => {
    if (!selectedGroup) return [];
    return getGroupMembers(selectedGroup.id)
      .map(m => ({
        membership: m,
        person: people.find(p => p.id === m.personId),
      }))
      .filter((row): row is { membership: (typeof row)["membership"]; person: NonNullable<(typeof row)["person"]> } =>
        Boolean(row.person),
      );
  }, [selectedGroup, getGroupMembers, people]);

  const householdsWithoutStudy = useMemo(
    () => households.filter(h => !activeHouseholdIds.has(h.id)),
    [households, activeHouseholdIds],
  );

  const activeGroups = groups.filter(g => g.status === "active");
  const avgGroupSize =
    groups.length > 0 ? Math.round(members.length / groups.length) : 0;

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Bible Study Groups</h1>
          <p className="text-muted-foreground">
            Household-based Bible study groups and their members
          </p>
        </div>

        <AddBibleStudyGroupDialog>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Bible Study Group
          </Button>
        </AddBibleStudyGroupDialog>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3>Bible Study Groups</h3>
          <div className="space-y-3">
            {enrichedGroups.length === 0 ? (
              <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No Bible study groups yet. Start one from a host household below.
                </CardContent>
              </Card>
            ) : (
              enrichedGroups.map(group => (
                <Card
                  key={group.id}
                  className={`
                    border-border/60 bg-card/50 backdrop-blur-sm cursor-pointer transition-all duration-200
                    ${
                      selectedGroupId === group.id
                        ? "ring-2 ring-foreground shadow-lg"
                        : "hover:shadow-lg hover:border-border"
                    }
                  `}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                          <Book className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>{group.householdName}</CardTitle>
                          <CardDescription>Led by {group.leaderName}</CardDescription>
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
                        <Badge variant="outline">{group.memberCount} members</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3>Group Details</h3>
          {selectedGroup ? (
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle>{selectedGroup.householdName}</CardTitle>
                    <CardDescription>Bible Study Group Members</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={STATUS_VARIANT[selectedGroup.status]}>
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
                        <DropdownMenuItem onSelect={() => setUpdateStatusOpen(true)}>
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
                  {selectedGroupMembers.map(({ membership, person }) => {
                    const isGuest = person.householdId !== selectedGroup.householdId;
                    return (
                      <div
                        key={person.id}
                        className="flex items-center gap-4 p-3 rounded-xl border border-border/60 bg-background/50"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center shadow-sm">
                          <span className="text-white dark:text-slate-900">
                            {person.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground">{person.name}</p>
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
                  })}
                </div>

                <div className="pt-3 border-t border-border/60">
                  {selectedGroup.status === "active" ? (
                    <ManageMembersDialog
                      group={selectedGroup}
                      householdName={selectedGroup.householdName}
                      leaderName={selectedGroup.leaderName}
                    >
                      <Button className="w-full gap-2">
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
          ) : (
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Book className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a Bible study group to view details and members
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Households Without Bible Studies</CardTitle>
          <CardDescription>
            Consider starting Bible study groups in these households
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
                  <div className="flex items-center gap-3">
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
                  <AddBibleStudyGroupDialog defaultHouseholdId={household.id}>
                    <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
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
    </div>
  );
}
