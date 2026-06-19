"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  LayoutDashboard,
  ListChecks,
  Plus,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { usePeople } from "@/lib/people";
import { useDiscipleship } from "@/lib/discipleship";
import type { DiscipleshipRole } from "@/lib/supabase/discipleship";

interface TrackDetailsProps {
  trackId: string;
  onBack: () => void;
}

export function TrackDetails({ trackId, onBack }: TrackDetailsProps) {
  const { people } = usePeople();
  const {
    tracks,
    milestoneCompletions,
    hydrated,
    isSaving,
    enrollPerson,
    removeEnrollmentById,
    toggleMilestone,
    addMilestone,
    removeMilestoneById,
    moveMilestone,
    getTrackEnrollments,
    getTrackMilestones,
    getEnrollmentProgress,
  } = useDiscipleship();

  const [activeTab, setActiveTab] = useState("overview");
  const [newPersonId, setNewPersonId] = useState("");
  const [newRole, setNewRole] = useState<DiscipleshipRole>("Learner");
  const [newMentorId, setNewMentorId] = useState("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [milestoneName, setMilestoneName] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");

  const track = tracks.find(t => t.id === trackId);
  const trackEnrollments = useMemo(
    () => getTrackEnrollments(trackId),
    [getTrackEnrollments, trackId],
  );
  const trackMilestones = useMemo(
    () => getTrackMilestones(trackId),
    [getTrackMilestones, trackId],
  );

  const enrollmentRows = useMemo(
    () =>
      trackEnrollments.map(enrollment => ({
        ...enrollment,
        person: people.find(p => p.id === enrollment.personId),
        mentor: people.find(p => p.id === enrollment.mentorPersonId),
        progress: getEnrollmentProgress(enrollment.id),
      })),
    [trackEnrollments, people, getEnrollmentProgress],
  );

  const activeEnrollmentId =
    selectedEnrollmentId ||
    enrollmentRows.find(e => e.role === "Learner")?.id ||
    enrollmentRows[0]?.id ||
    "";

  const activeEnrollment = enrollmentRows.find(e => e.id === activeEnrollmentId);

  const enrolledPersonIds = useMemo(
    () => new Set(trackEnrollments.map(e => e.personId)),
    [trackEnrollments],
  );

  const availablePeople = useMemo(
    () => people.filter(p => !enrolledPersonIds.has(p.id)),
    [people, enrolledPersonIds],
  );

  const mentorCandidates = useMemo(
    () => people.filter(p => p.id !== newPersonId),
    [people, newPersonId],
  );

  const leader = people.find(p => p.id === track?.leaderPersonId);

  const openProgressForEnrollment = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    setActiveTab("progress");
  };

  const handleEnroll = async () => {
    if (!newPersonId) return;
    if (track?.category === "Mentorship" && newRole === "Learner" && !newMentorId) {
      return;
    }

    const result = await enrollPerson({
      trackId,
      personId: newPersonId,
      role: newRole,
      mentorPersonId:
        newRole === "Learner" && newMentorId ? newMentorId : undefined,
    });

    if (result) {
      setNewPersonId("");
      setNewRole("Learner");
      setNewMentorId("");
      setSelectedEnrollmentId(result.id);
      setActiveTab("progress");
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!activeEnrollmentId) return;

    await toggleMilestone(
      activeEnrollmentId,
      milestoneId,
      activeEnrollment?.personId ?? null,
    );
  };

  const handleAddMilestone = async () => {
    if (!milestoneName.trim()) return;

    const result = await addMilestone({
      trackId,
      name: milestoneName,
      description: milestoneDescription,
    });

    if (result) {
      setMilestoneName("");
      setMilestoneDescription("");
    }
  };

  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";
  const tabTriggerClass =
    "text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-white";

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading track...
      </div>
    );
  }

  if (!track) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-slate-900 dark:text-white">Track Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/30">
        <Info className="text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-200">
          Track Management
        </AlertTitle>
        <AlertDescription className="text-blue-800/90 dark:text-blue-300/90">
          Manage this discipleship track — define milestones, enroll learners and
          guides, assign mentors, and track milestone progress. Completing all
          milestones earns a badge on the person&apos;s profile.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-zinc-700">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-slate-900 dark:text-white">{track.name}</h1>
              <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                {track.category}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-zinc-400">
              {track.description || "Discipleship track"}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
              {track.duration && `${track.duration}`}
              {track.duration && track.schedule && " · "}
              {track.schedule && track.schedule}
              {(track.duration || track.schedule) && leader && " · "}
              {leader && `Leader: ${leader.name}`}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
          <Users className="w-3 h-3 mr-1 inline" />
          {enrollmentRows.length} enrolled
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Enroll Participant
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Add a learner or guide to this track. Learners can be assigned a
              mentor for 1-on-1 discipleship.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Person</Label>
              <Select value={newPersonId} onValueChange={setNewPersonId}>
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} - {person.householdName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newRole}
                onValueChange={v => setNewRole(v as DiscipleshipRole)}
              >
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Learner">Learner</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newRole === "Learner" && (
              <div className="space-y-2">
                <Label>
                  Mentor {track.category === "Mentorship" ? "*" : "(optional)"}
                </Label>
                <Select value={newMentorId} onValueChange={setNewMentorId}>
                  <SelectTrigger className={DualModeInputClass}>
                    <SelectValue placeholder="Select mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentorCandidates.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              onClick={() => void handleEnroll()}
              disabled={
                !newPersonId ||
                isSaving ||
                (newRole === "Learner" &&
                  track.category === "Mentorship" &&
                  !newMentorId)
              }
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              Enroll
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-slate-100/80 dark:bg-zinc-800/80">
              <TabsTrigger value="overview" className={tabTriggerClass}>
                <LayoutDashboard className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="manage" className={tabTriggerClass}>
                <ListChecks className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Manage Milestones
              </TabsTrigger>
              <TabsTrigger value="progress" className={tabTriggerClass}>
                <TrendingUp className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Enrollments
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    People on this track — click to open their progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enrollmentRows.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
                      No enrollments yet. Add a participant to get started.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {enrollmentRows.map(row => (
                        <div
                          key={row.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
                          onClick={() => openProgressForEnrollment(row.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                            >
                              <span className="text-white text-sm">
                                {row.person?.name.charAt(0) ?? "?"}
                              </span>
                            </div>
                            <div>
                              <p className="text-slate-900 dark:text-white font-medium">
                                {row.person?.name ?? "Unknown"}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-zinc-500">
                                {row.role}
                                {row.mentor && ` · Mentor: ${row.mentor.name}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              {row.status === "completed" ? (
                                <>
                                  <Badge className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 mb-1">
                                    <Award className="w-3 h-3 mr-1 inline" />
                                    Badge earned
                                  </Badge>
                                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                                    {row.completedAt
                                      ? new Date(row.completedAt).toLocaleDateString()
                                      : "Completed"}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm text-slate-900 dark:text-white font-medium">
                                    {row.progress.percent}%
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                                    {row.progress.completed}/{row.progress.total} milestones
                                  </p>
                                </>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-500"
                              onClick={e => {
                                e.stopPropagation();
                                void removeEnrollmentById(row.id);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                        <ListChecks className="w-5 h-5" />
                        Milestone Summary
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-zinc-400">
                        Checklist defined for this track
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("manage")}
                      className="rounded-lg"
                    >
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {trackMilestones.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-6">
                      No milestones defined yet.{" "}
                      <button
                        type="button"
                        className="text-purple-600 dark:text-purple-400 underline"
                        onClick={() => setActiveTab("manage")}
                      >
                        Add milestones
                      </button>{" "}
                      to set up this track.
                    </p>
                  ) : (
                    <ol className="space-y-2">
                      {trackMilestones.map((milestone, index) => (
                        <li
                          key={milestone.id}
                          className="flex gap-3 p-3 rounded-lg border border-slate-200 dark:border-zinc-700"
                        >
                          <span className="text-sm text-slate-400 dark:text-zinc-500 w-6 shrink-0">
                            {index + 1}.
                          </span>
                          <div>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {milestone.name}
                            </p>
                            {milestone.description && (
                              <p className="text-sm text-slate-500 dark:text-zinc-500 mt-0.5">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <ListChecks className="w-5 h-5" />
                    Manage Milestones
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    Add, reorder, or remove checklist items for this track
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 p-4 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/30">
                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Add new milestone
                    </p>
                    <div className="space-y-2">
                      <Label>Milestone name *</Label>
                      <Input
                        value={milestoneName}
                        onChange={e => setMilestoneName(e.target.value)}
                        placeholder="e.g., Complete intro reading"
                        className={DualModeInputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        value={milestoneDescription}
                        onChange={e => setMilestoneDescription(e.target.value)}
                        placeholder="What does completing this milestone involve?"
                        className={DualModeInputClass}
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={() => void handleAddMilestone()}
                      disabled={!milestoneName.trim() || isSaving}
                      className={DualModePrimaryButtonClass}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>

                  {trackMilestones.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
                      No milestones yet. Add your first one above.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                        Track milestones ({trackMilestones.length})
                      </p>
                      {trackMilestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 dark:border-zinc-700"
                        >
                          <span className="text-sm text-slate-400 dark:text-zinc-500 w-6 pt-0.5 shrink-0">
                            {index + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 dark:text-white font-medium">
                              {milestone.name}
                            </p>
                            {milestone.description && (
                              <p className="text-sm text-slate-500 dark:text-zinc-500 mt-0.5">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isSaving || index === 0}
                              onClick={() =>
                                void moveMilestone(trackId, milestone.id, "up")
                              }
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={
                                isSaving || index === trackMilestones.length - 1
                              }
                              onClick={() =>
                                void moveMilestone(trackId, milestone.id, "down")
                              }
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-500"
                              disabled={isSaving}
                              onClick={() => void removeMilestoneById(milestone.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Individual Progress
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-zinc-400">
                        Check off milestones for a specific learner
                      </CardDescription>
                    </div>
                    {enrollmentRows.length > 0 && (
                      <Select
                        value={activeEnrollmentId}
                        onValueChange={setSelectedEnrollmentId}
                      >
                        <SelectTrigger className={`w-full sm:w-56 ${DualModeInputClass}`}>
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                        <SelectContent>
                          {enrollmentRows.map(row => (
                            <SelectItem key={row.id} value={row.id}>
                              {row.person?.name ?? "Unknown"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!activeEnrollment ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
                      Enroll someone to track their milestone progress.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {activeEnrollment.status === "completed" && (
                        <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-900 dark:text-amber-200">
                              Badge earned
                            </p>
                            <p className="text-sm text-amber-800/80 dark:text-amber-300/80">
                              {track.name} completed
                              {activeEnrollment.completedAt &&
                                ` on ${new Date(activeEnrollment.completedAt).toLocaleDateString()}`}
                              . This badge appears on their person profile.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                          >
                            <span className="text-white">
                              {activeEnrollment.person?.name.charAt(0) ?? "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {activeEnrollment.person?.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-zinc-500">
                              {activeEnrollment.role}
                              {activeEnrollment.mentor &&
                                ` · Mentor: ${activeEnrollment.mentor.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-zinc-400">
                              Overall progress
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium">
                              {activeEnrollment.progress.completed}/
                              {activeEnrollment.progress.total} ·{" "}
                              {activeEnrollment.progress.percent}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all"
                              style={{
                                width: `${activeEnrollment.progress.percent}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {trackMilestones.length === 0 ? (
                        <p className="text-slate-500 dark:text-zinc-400 text-center py-4">
                          No milestones defined yet.{" "}
                          <button
                            type="button"
                            className="text-purple-600 dark:text-purple-400 underline"
                            onClick={() => setActiveTab("manage")}
                          >
                            Add milestones
                          </button>{" "}
                          in the Manage tab first.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {trackMilestones.map(milestone => {
                            const completion = milestoneCompletions.find(
                              c =>
                                c.enrollmentId === activeEnrollmentId &&
                                c.milestoneId === milestone.id,
                            );
                            const isComplete = Boolean(completion);

                            return (
                              <div
                                key={milestone.id}
                                className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-zinc-700"
                              >
                                <Checkbox
                                  checked={isComplete}
                                  disabled={isSaving}
                                  onCheckedChange={() =>
                                    void handleToggleMilestone(milestone.id)
                                  }
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <p
                                    className={
                                      isComplete
                                        ? "text-slate-500 line-through dark:text-zinc-500"
                                        : "text-slate-900 dark:text-white"
                                    }
                                  >
                                    {milestone.name}
                                  </p>
                                  {milestone.description && (
                                    <p className="text-sm text-slate-500 dark:text-zinc-500 mt-0.5">
                                      {milestone.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
