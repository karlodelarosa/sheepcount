"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  BookOpen,
  MessageSquareText,
  Plus,
  Sparkles,
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
import {
  accentForIndex,
  discipleshipThemes,
  type DiscipleshipAccent,
} from "./_lib/discipleship-themes";

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-sm flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-inner dark:from-violet-950/60 dark:to-indigo-950/40 dark:text-violet-300">
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
  } = useDiscipleship();

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isAddProgramDialogOpen, setIsAddProgramDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  type DiscipleshipTab = "programs" | "groups";
  const activeTab: DiscipleshipTab =
    searchParams.get("tab") === "groups" ? "groups" : "programs";
  const setActiveTab = (tab: string) => {
    router.replace(`/discipleship?tab=${tab}`, { scroll: false });
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
        (a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime(),
      )[0];

  const handleOpenEnrollDialog = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTrackId(trackId);
    setIsEnrollDialogOpen(true);
  };

  const trackAccent = (color: string, index: number): DiscipleshipAccent => {
    const accents = Object.keys(discipleshipThemes) as DiscipleshipAccent[];
    return accents.includes(color as DiscipleshipAccent)
      ? (color as DiscipleshipAccent)
      : accentForIndex(index);
  };

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading discipleship data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-violet-200/60 bg-gradient-to-br from-violet-50/95 via-white to-sky-50/90 shadow-[0_24px_80px_-28px_rgba(99,102,241,0.45)] dark:border-zinc-700/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 dark:shadow-slate-900/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_12%_-10%,rgba(167,139,250,0.35),transparent),radial-gradient(ellipse_60%_50%_at_95%_15%,rgba(56,189,248,0.28),transparent),radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(52,211,153,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(139,92,246,0.45),transparent),radial-gradient(ellipse_60%_50%_at_90%_20%,rgba(59,130,246,0.35),transparent),radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(16,185,129,0.25),transparent)]" />
        <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-500/20" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl dark:bg-blue-500/20" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-100/70 px-3 py-1 text-xs font-medium text-violet-700 backdrop-blur-sm dark:border-white/15 dark:bg-white/10 dark:text-white/80">
                <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-amber-300" />
                Spiritual growth
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Discipleship
              </h1>
              <p className="text-sm text-slate-600 sm:text-base dark:text-white/65">
                Grow leaders through structured programs and walk alongside
                small groups as they meet, one topic at a time.
              </p>
            </div>

            <Button
              onClick={() =>
                activeTab === "groups"
                  ? setIsAddGroupDialogOpen(true)
                  : setIsAddProgramDialogOpen(true)
              }
              className="shrink-0 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:border dark:border-white/20 dark:bg-white dark:text-slate-900 dark:shadow-black/20 dark:hover:bg-white/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {activeTab === "groups" ? "New Group" : "New Program"}
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DiscipleshipStatCard
              icon={BookOpen}
              label="Active programs"
              value={String(tracks.length)}
              subtext="Discipleship tracks"
              accent="blue"
              featured
              className="sm:col-span-2 lg:col-span-1"
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
            <h2 className="text-lg font-semibold text-foreground">
              {activeTab === "programs" ? "Discipleship programs" : "Discipleship groups"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeTab === "programs"
                ? "Structured tracks with milestones and enrollment."
                : "Small groups you can add people to and log meeting topics for."}
            </p>
          </div>
          <TabsList className="h-11 w-full max-w-xs grid-cols-2 rounded-xl border border-border/60 bg-muted/50 p-1 backdrop-blur-sm sm:w-auto">
            <TabsTrigger
              value="programs"
              className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              Programs
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm"
            >
              <Users className="w-4 h-4" />
              Groups
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="programs" className="mt-6">
          {tracks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No discipleship programs yet"
              description="Create one to start tracking milestones and enrolling participants."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {tracks.map((track, index) => {
                const participants = getParticipants(track.id);
                const accent = trackAccent(track.color, index);
                const theme = discipleshipThemes[accent];
                const leader = people.find(p => p.id === track.leaderPersonId);

                return (
                  <article
                    key={track.id}
                    className={cn(
                      "group relative cursor-pointer overflow-hidden rounded-2xl border border-border/40 bg-card shadow-md transition-all duration-500",
                      "hover:-translate-y-1 hover:shadow-2xl",
                      "shadow-slate-200/60 dark:shadow-none",
                      theme.glow,
                    )}
                    onClick={() => router.push(`/discipleship/${track.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ")
                        router.push(`/discipleship/${track.id}`);
                    }}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden bg-gradient-to-br px-5 pb-5 pt-5 text-white",
                        theme.gradient,
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-3xl",
                          theme.orb,
                        )}
                      />
                      <div
                        className={cn(
                          "pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full blur-2xl opacity-70",
                          theme.orb,
                        )}
                      />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                theme.badge,
                              )}
                            >
                              {track.category}
                            </span>
                            {track.status === "not_started" && (
                              <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                                Not yet started
                              </span>
                            )}
                            {track.status === "finished" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-50 backdrop-blur-sm">
                                Finished
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold leading-snug tracking-tight line-clamp-2">
                            {track.name}
                          </h3>
                          {track.description && (
                            <p className="text-sm text-white/75 line-clamp-2 leading-relaxed">
                              {track.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 rounded-xl bg-white/15 p-2.5 ring-1 ring-white/20">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="relative space-y-4 px-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Duration
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {track.duration || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Schedule
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {track.schedule || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60">
                        <p className="text-xs text-muted-foreground mb-2">
                          Leader:{" "}
                          <span className="font-medium text-foreground">
                            {leader?.name ?? "Unassigned"}
                          </span>
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {participants.length} participants
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={e => handleOpenEnrollDialog(track.id, e)}
                            className="rounded-lg"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Enroll
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          View program
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          {groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No groups yet"
              description="Create a group, add people to it, and start logging what you cover each time you meet."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {groups.map((group, index) => {
                const members = getGroupMembersWithPeople(group.id);
                const latestMeeting = getLatestMeeting(group.id);
                const accent = accentForIndex(index);
                const theme = discipleshipThemes[accent];

                return (
                  <article
                    key={group.id}
                    className={cn(
                      "group relative cursor-pointer overflow-hidden rounded-2xl border border-border/40 bg-card shadow-md transition-all duration-500",
                      "hover:-translate-y-1 hover:shadow-2xl",
                      "shadow-slate-200/60 dark:shadow-none",
                      theme.glow,
                    )}
                    onClick={() => router.push(`/discipleship/groups/${group.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ")
                        router.push(`/discipleship/groups/${group.id}`);
                    }}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden bg-gradient-to-br px-5 pb-5 pt-5 text-white",
                        theme.gradient,
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-3xl",
                          theme.orb,
                        )}
                      />
                      <div
                        className={cn(
                          "pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full blur-2xl opacity-70",
                          theme.orb,
                        )}
                      />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                              theme.badge,
                            )}
                          >
                            {members.length} {members.length === 1 ? "member" : "members"}
                          </span>
                          <h3 className="text-lg font-semibold leading-snug tracking-tight line-clamp-2">
                            {group.name}
                          </h3>
                          {group.description && (
                            <p className="text-sm text-white/75 line-clamp-2 leading-relaxed">
                              {group.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 rounded-xl bg-white/15 p-2.5 ring-1 ring-white/20">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="relative space-y-4 px-5 py-4">
                      {members.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {members.slice(0, 4).map(member => (
                              <div
                                key={member.id}
                                className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500 flex items-center justify-center ring-2 ring-card"
                                title={member.person?.name}
                              >
                                <span className="text-white text-xs">
                                  {member.person?.name.charAt(0) ?? "?"}
                                </span>
                              </div>
                            ))}
                          </div>
                          {members.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{members.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No members yet</p>
                      )}

                      <div className="pt-3 border-t border-border/60">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                          Last topic
                        </p>
                        {latestMeeting ? (
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {latestMeeting.topic}
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              &middot;{" "}
                              {new Date(latestMeeting.meetingDate).toLocaleDateString()}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No meetings logged yet</p>
                        )}
                      </div>

                      <div className="flex items-center justify-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          View group
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
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
