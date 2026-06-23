"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Users, UserPlus, ChevronRight, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePeople } from "@/lib/people";
import { useDiscipleship } from "@/lib/discipleship";
import { EnrollParticipantDialog } from "./_components/enroll-participant-dialog";
import { AddProgramDialog } from "./_components/add-program-dialog";

export function DiscipleshipView() {
  const router = useRouter();
  const { people } = usePeople();
  const {
    tracks,
    enrollments,
    hydrated,
    isSaving,
    addTrack,
    enrollPerson,
    getTrackEnrollments,
  } = useDiscipleship();

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isAddProgramDialogOpen, setIsAddProgramDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  const DualModePrimaryButtonClass = "rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40 text-white";
  const DualModeHeaderCardClass = "border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50";
  const DualModeContentCardClass = "border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer group dark:border-zinc-700/60 dark:bg-zinc-800/70";
  const DualModeSecondaryBadgeClass = "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
  const DualModeMemberAvatarClass = "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";
  const DualModeIconColor = "h-5 w-5 text-slate-600 dark:text-zinc-400";

  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    green: "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
    purple: "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
    pink: "from-pink-500 to-pink-700 dark:from-rose-600 dark:to-pink-800",
    indigo: "from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800",
  };

  const activeEnrollments = enrollments.filter(e => e.status === "active");

  const getParticipants = (trackId: string) => {
    const trackEnrollments = getTrackEnrollments(trackId);
    return trackEnrollments.map(enrollment => ({
      ...enrollment,
      person: people.find(person => person.id === enrollment.personId),
    }));
  };

  const handleOpenEnrollDialog = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTrackId(trackId);
    setIsEnrollDialogOpen(true);
  };

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading discipleship tracks...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/30">
        <Info className="text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-200">
          Discipleship Programs
        </AlertTitle>
        <AlertDescription className="text-blue-800/90 dark:text-blue-300/90">
          Spiritual growth and leadership development tracks. Click a program to
          manage milestones, enroll participants, and track individual progress.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Active Programs</CardTitle>
            <BookOpen className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{tracks.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">Discipleship tracks</p>
          </CardContent>
        </Card>

        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Total Participants</CardTitle>
            <Users className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{activeEnrollments.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">People enrolled</p>
          </CardContent>
        </Card>

        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Categories</CardTitle>
            <BookOpen className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">
              {new Set(tracks.map(p => p.category)).size}
            </div>
            <p className="text-slate-600 dark:text-zinc-400">Different tracks</p>
          </CardContent>
        </Card>

        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Avg. Enrollment</CardTitle>
            <UserPlus className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">
              {tracks.length > 0 ? Math.round(activeEnrollments.length / tracks.length) : 0}
            </div>
            <p className="text-slate-600 dark:text-zinc-400">Per program</p>
          </CardContent>
        </Card>
      </div>

      <Card className={DualModeHeaderCardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Discipleship Programs</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Spiritual growth and leadership development programs
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddProgramDialogOpen(true)}
              className={DualModePrimaryButtonClass}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Program
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tracks.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-zinc-400 py-12">
              No discipleship tracks yet. Create one to get started.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {tracks.map(track => {
                const participants = getParticipants(track.id);
                const colorClass = colorClasses[track.color] || colorClasses.blue;
                const leader = people.find(p => p.id === track.leaderPersonId);

                return (
                  <Card
                    key={track.id}
                    className={DualModeContentCardClass}
                    onClick={() => router.push(`/discipleship/${track.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                            {track.category}
                          </Badge>
                          {track.status === "finished" && (
                            <Badge className="rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-0">
                              Finished
                            </Badge>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <CardTitle className="text-slate-900 dark:text-white">{track.name}</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-zinc-400">
                        {track.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-500 dark:text-zinc-500">Duration</p>
                          <p className="text-slate-900 dark:text-white">{track.duration || "—"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-zinc-500">Schedule</p>
                          <p className="text-slate-900 dark:text-white">{track.schedule || "—"}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                        <p className="text-slate-500 mb-2">
                          Leader:{" "}
                          <span className="text-slate-900 dark:text-white">
                            {leader?.name ?? "Unassigned"}
                          </span>
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                            <span className="text-slate-600 dark:text-zinc-400">
                              {participants.length} participants
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={e => handleOpenEnrollDialog(track.id, e)}
                            className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Enroll
                          </Button>
                        </div>
                      </div>

                      {participants.length > 0 && (
                        <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                          <p className="text-slate-500 dark:text-zinc-500 mb-2">Recent Participants</p>
                          <div className="space-y-2">
                            {participants.slice(0, 3).map(participant => (
                              <div key={participant.id} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}>
                                  <span className="text-white text-sm">
                                    {participant.person?.name.charAt(0) ?? "?"}
                                  </span>
                                </div>
                                <span className="text-slate-900 dark:text-white">
                                  {participant.person?.name ?? "Unknown"}
                                </span>
                              </div>
                            ))}
                            {participants.length > 3 && (
                              <p className="text-slate-500 dark:text-zinc-500">
                                +{participants.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
