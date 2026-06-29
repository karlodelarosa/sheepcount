"use client";

import { useEffect, useMemo, useState } from "react";
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
import { PersonSelect } from "@/components/person-select";
import { PersonMultiSelect } from "@/components/person-multi-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
  Settings,
  TrendingUp,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { usePeople } from "@/lib/people";
import { useDiscipleship } from "@/lib/discipleship";
import type {
  DiscipleshipCategory,
  DiscipleshipRole,
  DiscipleshipTrackStatus,
} from "@/lib/supabase/discipleship";
import { ConfirmDeleteDialog } from "@/app/(protected)/work-ministry/_components/confirm-delete-dialog";
import { getCurrentMilestone } from "@/app/(protected)/discipleship/_lib/milestone-progress";

const CATEGORIES: DiscipleshipCategory[] = [
  "Foundation",
  "Growth",
  "Leadership",
  "Mentorship",
];

const TRACK_STATUS_LABELS: Record<DiscipleshipTrackStatus, string> = {
  not_started: "Not yet started",
  active: "In Progress",
  finished: "Finished",
};

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
    updateTrack,
    removeTrack,
    enrollPeople,
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
  const [newPersonIds, setNewPersonIds] = useState<string[]>([]);
  const [newRole, setNewRole] = useState<DiscipleshipRole>("Learner");
  const [newMentorId, setNewMentorId] = useState("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [milestoneName, setMilestoneName] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<DiscipleshipCategory>("Foundation");
  const [editDuration, setEditDuration] = useState("");
  const [editSchedule, setEditSchedule] = useState("");
  const [editStatus, setEditStatus] = useState<DiscipleshipTrackStatus>("active");
  const [editInitialized, setEditInitialized] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
        currentMilestone: getCurrentMilestone(
          enrollment.id,
          trackMilestones,
          milestoneCompletions,
        ),
      })),
    [
      trackEnrollments,
      people,
      getEnrollmentProgress,
      trackMilestones,
      milestoneCompletions,
    ],
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

  const selectedPersonIdSet = useMemo(
    () => new Set(newPersonIds),
    [newPersonIds],
  );

  const mentorCandidates = useMemo(
    () => people.filter(p => !selectedPersonIdSet.has(p.id)),
    [people, selectedPersonIdSet],
  );

  useEffect(() => {
    if (newMentorId && selectedPersonIdSet.has(newMentorId)) {
      setNewMentorId("");
    }
  }, [newMentorId, selectedPersonIdSet]);

  const leader = people.find(p => p.id === track?.leaderPersonId);

  const openProgressForEnrollment = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    setActiveTab("progress");
  };

  const handleEnroll = async () => {
    if (newPersonIds.length === 0) return;
    if (track?.category === "Mentorship" && newRole === "Learner" && !newMentorId) {
      return;
    }

    const results = await enrollPeople(
      trackId,
      newPersonIds,
      newRole,
      newRole === "Learner" && newMentorId ? newMentorId : undefined,
    );

    if (results.length > 0) {
      setNewPersonIds([]);
      setNewRole("Learner");
      setNewMentorId("");
      setSelectedEnrollmentId(results[0].id);
      setActiveTab("progress");
    }
  };

  const handleToggleMilestone = async (
    enrollmentId: string,
    milestoneId: string,
    personId: string | null,
  ) => {
    await toggleMilestone(enrollmentId, milestoneId, personId);
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

  useEffect(() => {
    if (!track || editInitialized) return;
    setEditName(track.name);
    setEditDescription(track.description);
    setEditCategory(track.category);
    setEditDuration(track.duration);
    setEditSchedule(track.schedule);
    setEditStatus(track.status);
    setEditInitialized(true);
  }, [track, editInitialized]);

  const handleSaveTrack = async () => {
    if (!editName.trim()) return;
    await updateTrack({
      trackId,
      name: editName,
      description: editDescription,
      category: editCategory,
      duration: editDuration,
      schedule: editSchedule,
      status: editStatus,
    });
  };

  const handleDeleteTrack = async () => {
    const success = await removeTrack(trackId);
    if (success) {
      setIsDeleteDialogOpen(false);
      onBack();
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
              {track.status === "not_started" && (
                <Badge className="rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300 border-0">
                  Not yet started
                </Badge>
              )}
              {track.status === "finished" && (
                <Badge className="rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-0">
                  Finished
                </Badge>
              )}
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
              Enroll Participants
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Select one or more learners or guides. Learners can share the same
              mentor for 1-on-1 discipleship.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PersonMultiSelect
              people={availablePeople}
              selectedIds={newPersonIds}
              onSelectedIdsChange={setNewPersonIds}
              inputClassName={DualModeInputClass}
              listClassName="border-slate-200 dark:border-zinc-700"
            />
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
                <PersonSelect
                  people={mentorCandidates}
                  value={newMentorId}
                  onValueChange={setNewMentorId}
                  placeholder="Select mentor"
                  triggerClassName={DualModeInputClass}
                  formatLabel={person => person.name}
                />
              </div>
            )}
            <Button
              onClick={() => void handleEnroll()}
              disabled={
                newPersonIds.length === 0 ||
                isSaving ||
                (newRole === "Learner" &&
                  track.category === "Mentorship" &&
                  !newMentorId)
              }
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              {newPersonIds.length > 1
                ? `Enroll ${newPersonIds.length} People`
                : "Enroll"}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-10 p-1 bg-slate-100/80 dark:bg-zinc-800/80">
              <TabsTrigger value="overview" className={tabTriggerClass}>
                <LayoutDashboard className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="manage" className={tabTriggerClass}>
                <ListChecks className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="progress" className={tabTriggerClass}>
                <TrendingUp className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="settings" className={tabTriggerClass}>
                <Settings className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-0">
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

              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Enrollments
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    New participants start on the first milestone — check off
                    their current step here or click a row for full progress
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
                          <div className="flex items-center gap-3 min-w-0">
                            {row.status !== "completed" && row.currentMilestone && (
                              <Checkbox
                                checked={false}
                                disabled={isSaving}
                                onClick={e => e.stopPropagation()}
                                onCheckedChange={() =>
                                  void handleToggleMilestone(
                                    row.id,
                                    row.currentMilestone!.id,
                                    row.personId,
                                  )
                                }
                                className="shrink-0"
                                aria-label={`Complete ${row.currentMilestone.name} for ${row.person?.name ?? "participant"}`}
                              />
                            )}
                            <div
                              className={`w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                            >
                              <span className="text-white text-sm">
                                {row.person?.name.charAt(0) ?? "?"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-slate-900 dark:text-white font-medium">
                                {row.person?.name ?? "Unknown"}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-zinc-500">
                                {row.role}
                                {row.mentor && ` · Mentor: ${row.mentor.name}`}
                              </p>
                              {row.status !== "completed" && row.currentMilestone && (
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                                  Current: {row.currentMilestone.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
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
                      <SearchableSelect
                        value={activeEnrollmentId}
                        onValueChange={setSelectedEnrollmentId}
                        placeholder="Select person"
                        triggerClassName={`w-full sm:w-56 ${DualModeInputClass}`}
                        options={enrollmentRows.map(row => ({
                          value: row.id,
                          label: row.person?.name ?? "Unknown",
                          keywords: row.person?.name,
                        }))}
                        searchPlaceholder="Search people..."
                      />
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
                                    void handleToggleMilestone(
                                      activeEnrollmentId,
                                      milestone.id,
                                      activeEnrollment?.personId ?? null,
                                    )
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

            <TabsContent value="settings" className="mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Program Details
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    Update program information or remove this discipleship track
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className={DualModeInputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        className={DualModeInputClass}
                        rows={3}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={editCategory}
                          onValueChange={v =>
                            setEditCategory(v as DiscipleshipCategory)
                          }
                        >
                          <SelectTrigger className={DualModeInputClass}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                          value={editDuration}
                          onChange={e => setEditDuration(e.target.value)}
                          placeholder="e.g., 8 weeks"
                          className={DualModeInputClass}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Schedule</Label>
                        <Input
                          value={editSchedule}
                          onChange={e => setEditSchedule(e.target.value)}
                          placeholder="e.g., Sundays, 9:00 AM"
                          className={DualModeInputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Program Status</Label>
                        <Select
                          value={editStatus}
                          onValueChange={v =>
                            setEditStatus(v as DiscipleshipTrackStatus)
                          }
                        >
                          <SelectTrigger className={DualModeInputClass}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(TRACK_STATUS_LABELS) as DiscipleshipTrackStatus[]).map(
                              status => (
                                <SelectItem key={status} value={status}>
                                  {TRACK_STATUS_LABELS[status]}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">
                      Use Not yet started for upcoming cohorts, In Progress while
                      running, and Finished when the session has wrapped up.
                    </p>
                    <Button
                      onClick={() => void handleSaveTrack()}
                      disabled={!editName.trim() || isSaving}
                      className={DualModePrimaryButtonClass}
                    >
                      Save Changes
                    </Button>
                  </div>

                  <div className="border-t border-slate-200 dark:border-zinc-700 pt-6 space-y-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Danger zone
                    </p>
                    <p className="text-sm text-slate-500 dark:text-zinc-500">
                      {track.isDefault
                        ? "Built-in programs cannot be removed."
                        : "Removing this program will hide it from the discipleship list and remove it from participant profiles."}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      disabled={track.isDefault || isSaving}
                      className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Program
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete discipleship program?"
        description={`"${track.name}" will be removed from the discipleship list and hidden from participant profiles.`}
        confirmLabel="Delete Program"
        onConfirm={handleDeleteTrack}
        isLoading={isSaving}
      />
    </div>
  );
}
