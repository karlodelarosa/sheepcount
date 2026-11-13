"use client";

import { PageSkeleton } from "@/components/page-skeleton";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  BookOpen,
  MessageSquareText,
  Plus,
  CalendarDays,
  LayoutGrid,
  Search,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePeople } from "@/lib/people";
import { useDiscipleship } from "@/lib/discipleship";
import { EnrollParticipantDialog } from "./_components/enroll-participant-dialog";
import { AddProgramDialog } from "./_components/add-program-dialog";
import { AddGroupDialog } from "./_components/add-group-dialog";
import { DiscipleshipStatCard } from "./_components/discipleship-stat-card";
const accentText =
  "text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]";
const accentSoft = "bg-[var(--accent-color-soft)] " + accentText;
const accentButton =
  "rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] focus-visible:ring-[var(--accent-color)]";
const cardClass =
  "relative flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6";

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold">{value}</dd>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-gradient-to-br from-muted/30 via-background to-muted/20 px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--accent-color-soft)] via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-sm flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function DiscipleshipView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { people } = usePeople();
  const {
    tracks,
    enrollments,
    groups,
    groupMembers,
    groupMeetings,
    hydrated,
    isSaving,
    addTrack,
    addGroup,
    enrollPerson,
    getTrackEnrollments,
    getTrackMilestones,
    getEnrollmentProgress,
  } = useDiscipleship();

  const [search, setSearch] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isAddProgramDialogOpen, setIsAddProgramDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  type DiscipleshipTab = "programs" | "groups";
  const activeTab: DiscipleshipTab =
    searchParams.get("tab") === "groups" ? "groups" : "programs";
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/discipleship?${params.toString()}`, { scroll: false });
  };

  const activeEnrollments = enrollments.filter(e => e.status === "active");

  const getParticipants = (trackId: string) => {
    const trackEnrollments = getTrackEnrollments(trackId);
    return trackEnrollments.map(enrollment => ({
      ...enrollment,
      person: people.find(person => person.id === enrollment.personId),
    }));
  };

  const getGroupMembersWithPeople = (groupId: string) =>
    groupMembers
      .filter(m => m.groupId === groupId)
      .map(member => ({
        ...member,
        person: people.find(person => person.id === member.personId),
      }));

  const getLatestMeeting = (groupId: string) =>
    groupMeetings
      .filter(m => m.groupId === groupId)
      .sort(
        (a, b) =>
          new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime(),
      )[0];

  const handleOpenEnrollDialog = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTrackId(trackId);
    setIsEnrollDialogOpen(true);
  };

  const query = search.trim().toLowerCase();
  const filteredTracks = tracks.filter(track =>
    [
      track.name,
      track.description,
      track.category,
      people.find(p => p.id === track.leaderPersonId)?.name ?? "",
    ].some(value => value.toLowerCase().includes(query)),
  );
  const filteredGroups = groups.filter(group =>
    [group.name, group.description ?? ""].some(value =>
      value.toLowerCase().includes(query),
    ),
  );

  if (!hydrated) {
    return <PageSkeleton message="Loading discipleship data..." />;
  }

  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-3xl border border-[var(--accent-color-border)] bg-card"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent 0%, var(--accent-color-soft) 100%)",
        }}
      >
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-full sm:size-16",
                  accentSoft,
                )}
              >
                <BookOpen className="size-7" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Discipleship
                </h1>
                <p className="mt-3 max-w-4xl text-sm text-muted-foreground sm:text-base">
                  Grow leaders through structured programs and walk alongside
                  small groups as they meet, one topic at a time.
                </p>
              </div>
            </div>

            <Button
              onClick={() =>
                activeTab === "groups"
                  ? setIsAddGroupDialogOpen(true)
                  : setIsAddProgramDialogOpen(true)
              }
              className={cn("min-h-11 shrink-0 px-5", accentButton)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {activeTab === "groups" ? "New Group" : "New Program"}
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DiscipleshipStatCard
              icon={BookOpen}
              label="Active programs"
              value={String(
                tracks.filter(track => track.status === "active").length,
              )}
              subtext="Discipleship tracks"
              accent="blue"
            />
            <DiscipleshipStatCard
              icon={UserPlus}
              label="Participants"
              value={String(activeEnrollments.length)}
              subtext="Enrolled in programs"
              accent="indigo"
            />
            <DiscipleshipStatCard
              icon={Users}
              label="Active groups"
              value={String(groups.length)}
              subtext="Small groups meeting"
              accent="purple"
            />
            <DiscipleshipStatCard
              icon={MessageSquareText}
              label="Meetings logged"
              value={String(groupMeetings.length)}
              subtext="Topics recorded"
              accent="pink"
            />
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {activeTab === "programs"
                ? "Discipleship programs"
                : "Discipleship groups"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeTab === "programs"
                ? "Structured tracks with milestones and enrollment."
                : "Small groups you can add people to and log meeting topics for."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <TabsList>
              <TabsTrigger value="programs">
                <LayoutGrid className="size-4" />
                Programs
              </TabsTrigger>
              <TabsTrigger value="groups">
                <Users className="size-4" />
                Groups
              </TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground"
              />
              <Input
                type="search"
                aria-label={`Search ${activeTab}`}
                placeholder={`Search ${activeTab}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-12 rounded-full bg-background pl-10 sm:w-60"
              />
            </div>
          </div>
        </div>

        <TabsContent value="programs" className="mt-6">
          {filteredTracks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={
                query ? "No matching programs" : "No discipleship programs yet"
              }
              description={
                query
                  ? "Try another program name, category, or leader."
                  : "Create a program to start tracking milestones and enrolling participants."
              }
            />
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredTracks.map(track => {
                const participants = getParticipants(track.id);
                const leader = people.find(p => p.id === track.leaderPersonId);
                const total = getTrackMilestones(track.id).length;
                const percent =
                  participants.length > 0
                    ? Math.round(
                        participants.reduce(
                          (sum, participant) =>
                            sum + getEnrollmentProgress(participant.id).percent,
                          0,
                        ) / participants.length,
                      )
                    : 0;
                return (
                  <article key={track.id} className={cardClass}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-[11px] font-semibold uppercase",
                              accentSoft,
                            )}
                          >
                            {track.category}
                          </span>
                          {track.status !== "active" && (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              {track.status === "finished"
                                ? "Finished"
                                : "Not yet started"}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-xl font-bold tracking-tight">
                          <Link
                            href={`/discipleship/${track.id}`}
                            className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                          >
                            {track.name}
                            <span className="sr-only"> — view program</span>
                          </Link>
                        </h3>
                        {track.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {track.description}
                          </p>
                        )}
                      </div>
                      <span className={cn("rounded-xl p-2.5", accentSoft)}>
                        <BookOpen className="size-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mb-5 mt-auto pt-6">
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="font-medium">
                          {total
                            ? "Participant milestone progress"
                            : "No milestones added"}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {percent}%
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${track.name} average participant progress`}
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-2.5 overflow-hidden rounded-full bg-muted"
                      >
                        <div
                          className="h-full rounded-full bg-[var(--accent-color)]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 border-t border-border/60 pt-5">
                      <dl className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                        <Detail
                          icon={CalendarDays}
                          label="Duration"
                          value={track.duration || "—"}
                        />
                        <Detail
                          icon={CalendarDays}
                          label="Schedule"
                          value={track.schedule || "—"}
                        />
                        <Detail
                          icon={User}
                          label="Leader"
                          value={leader?.name ?? "Unassigned"}
                        />
                        <Detail
                          icon={Users}
                          label="Participants"
                          value={participants.length}
                        />
                      </dl>
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Manage participants for ${track.name}`}
                        onClick={e => handleOpenEnrollDialog(track.id, e)}
                        className={cn(
                          "min-h-10 gap-2 rounded-xl border-[var(--accent-color-border)] hover:bg-[var(--accent-color-soft)]",
                          accentText,
                        )}
                      >
                        <UserPlus className="size-4" />
                        Manage
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="groups" className="mt-6">
          {filteredGroups.length === 0 ? (
            <EmptyState
              icon={Users}
              title={query ? "No matching groups" : "No groups yet"}
              description={
                query
                  ? "Try another group name or description."
                  : "Create a group, add people, and start logging meeting topics."
              }
            />
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredGroups.map(group => {
                const members = getGroupMembersWithPeople(group.id);
                const latestMeeting = getLatestMeeting(group.id);
                return (
                  <article key={group.id} className={cardClass}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium",
                            accentSoft,
                          )}
                        >
                          {members.length}{" "}
                          {members.length === 1 ? "member" : "members"}
                        </span>
                        <h3 className="mt-3 text-xl font-bold tracking-tight">
                          <Link
                            href={`/discipleship/groups/${group.id}`}
                            className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                          >
                            {group.name}
                          </Link>
                        </h3>
                        {group.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {group.description}
                          </p>
                        )}
                      </div>
                      <span className={cn("rounded-xl p-2.5", accentSoft)}>
                        <Users className="size-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-6 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {members.slice(0, 4).map(member => (
                          <span
                            key={member.id}
                            title={member.person?.name}
                            className={cn(
                              "flex size-8 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-card",
                              accentSoft,
                            )}
                          >
                            {member.person?.name.charAt(0) ?? "?"}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {members.length > 4
                          ? `+${members.length - 4} more`
                          : members.length === 0
                            ? "No members yet"
                            : "Group members"}
                      </span>
                    </div>
                    <div className="mt-5 border-t border-border/60 pt-4">
                      <p className="text-xs text-muted-foreground">
                        Last topic
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {latestMeeting?.topic ?? "No meetings logged yet"}
                      </p>
                      {latestMeeting && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(
                            `${latestMeeting.meetingDate.slice(0, 10)}T00:00:00`,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/discipleship/groups/${group.id}`}
                      className={cn(
                        "mt-5 inline-flex min-h-10 items-center gap-1 self-end rounded-lg px-2 text-sm font-medium hover:bg-[var(--accent-color-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]",
                        accentText,
                      )}
                    >
                      View group
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EnrollParticipantDialog
        open={isEnrollDialogOpen}
        onOpenChange={setIsEnrollDialogOpen}
        trackId={selectedTrackId}
        tracks={tracks}
        people={people}
        enrollments={enrollments}
        isSaving={isSaving}
        onEnroll={enrollPerson}
      />

      <AddProgramDialog
        open={isAddProgramDialogOpen}
        onOpenChange={setIsAddProgramDialogOpen}
        people={people}
        isSaving={isSaving}
        onCreate={addTrack}
      />

      <AddGroupDialog
        open={isAddGroupDialogOpen}
        onOpenChange={setIsAddGroupDialogOpen}
        isSaving={isSaving}
        onCreate={addGroup}
      />
    </div>
  );
}
