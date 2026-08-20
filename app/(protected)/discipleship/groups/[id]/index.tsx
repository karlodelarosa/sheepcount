"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonSelect } from "@/components/person-select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  HeartHandshake,
  MessageSquareText,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePeople } from "@/lib/people";
import { useDiscipleship } from "@/lib/discipleship";
import type { DiscipleshipGroupRole } from "@/lib/supabase/discipleship-groups";
import { ConfirmDeleteDialog } from "@/app/(protected)/work-ministry/_components/confirm-delete-dialog";
import { accentForIndex, discipleshipThemes } from "../../_lib/discipleship-themes";

interface GroupDetailsProps {
  groupId: string;
  onBack: () => void;
}

function todayDateInputValue(): string {
  return new Date().toISOString().split("T")[0];
}

export function GroupDetails({ groupId, onBack }: GroupDetailsProps) {
  const { people } = usePeople();
  const {
    groups,
    hydrated,
    isSaving,
    addGroupMember,
    removeGroupMemberById,
    addGroupMeeting,
    removeGroupMeetingById,
    removeGroup,
    getGroupMembers,
    getGroupMeetings,
    addGroupPrayerItem,
    setGroupPrayerItemAnswered,
    removeGroupPrayerItemById,
    getGroupPrayerItems,
  } = useDiscipleship();

  const [searchTerm, setSearchTerm] = useState("");
  const [newPersonId, setNewPersonId] = useState("");
  const [newRole, setNewRole] = useState<DiscipleshipGroupRole>("Member");
  const [meetingDate, setMeetingDate] = useState(todayDateInputValue());
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [prayerContent, setPrayerContent] = useState("");
  const [prayerPersonId, setPrayerPersonId] = useState("");
  const [removeGroupDialogOpen, setRemoveGroupDialogOpen] = useState(false);

  const group = groups.find(g => g.id === groupId);
  const groupIndex = groups.findIndex(g => g.id === groupId);
  const accent = accentForIndex(groupIndex < 0 ? 0 : groupIndex);
  const theme = discipleshipThemes[accent];

  const memberships = useMemo(() => getGroupMembers(groupId), [getGroupMembers, groupId]);
  const meetings = useMemo(() => getGroupMeetings(groupId), [getGroupMeetings, groupId]);
  const prayerItems = useMemo(
    () => getGroupPrayerItems(groupId),
    [getGroupPrayerItems, groupId],
  );

  const members = useMemo(
    () =>
      memberships.map(m => ({
        ...m,
        person: people.find(p => p.id === m.personId),
      })),
    [memberships, people],
  );

  const memberPeople = useMemo(
    () => members.map(m => m.person).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [members],
  );

  const availablePeople = useMemo(
    () => people.filter(person => !memberships.some(m => m.personId === person.id)),
    [people, memberships],
  );

  const filteredMembers = members.filter(member =>
    member.person?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddMember = async () => {
    if (!newPersonId) return;
    const result = await addGroupMember({ groupId, personId: newPersonId, role: newRole });
    if (result) {
      setNewPersonId("");
      setNewRole("Member");
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    await removeGroupMemberById(membershipId);
  };

  const handleLogMeeting = async () => {
    if (!meetingDate || !topic.trim()) return;
    const result = await addGroupMeeting({ groupId, meetingDate, topic, notes });
    if (result) {
      setMeetingDate(todayDateInputValue());
      setTopic("");
      setNotes("");
    }
  };

  const handleRemoveMeeting = async (meetingId: string) => {
    await removeGroupMeetingById(meetingId);
  };

  const handleAddPrayerItem = async () => {
    if (!prayerContent.trim()) return;
    const result = await addGroupPrayerItem({
      groupId,
      personId: prayerPersonId || null,
      content: prayerContent,
    });
    if (result) {
      setPrayerContent("");
      setPrayerPersonId("");
    }
  };

  const handleToggleAnswered = async (prayerItemId: string, isAnswered: boolean) => {
    await setGroupPrayerItemAnswered(prayerItemId, !isAnswered);
  };

  const handleRemovePrayerItem = async (prayerItemId: string) => {
    await removeGroupPrayerItemById(prayerItemId);
  };

  const handleRemoveGroup = async () => {
    const success = await removeGroup(groupId);
    if (success) onBack();
  };

  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading group...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-slate-900 dark:text-white">Group Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border shadow-xl border-violet-200/50 shadow-violet-200/30 dark:border-zinc-700/50 dark:shadow-slate-900/40">
        <div className={cn("relative bg-gradient-to-br px-5 py-6 sm:px-8 sm:py-8 text-white", theme.gradient)}>
          <div
            className={cn(
              "pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl",
              theme.orb,
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full blur-2xl opacity-70",
              theme.orb,
            )}
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <Button
                variant="outline"
                size="icon"
                onClick={onBack}
                className="shrink-0 rounded-xl border-white/25 bg-white/15 text-white hover:bg-white/25 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 space-y-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    theme.badge,
                  )}
                >
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl leading-snug">
                  {group.name}
                </h1>
                {group.description && (
                  <p className="text-sm text-white/75 max-w-2xl leading-relaxed">
                    {group.description}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setRemoveGroupDialogOpen(true)}
              className="shrink-0 rounded-xl border-white/25 bg-white/15 text-white hover:bg-white/25 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Group
            </Button>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Add Member</CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Add anyone to this group. People can belong to more than one
              group at a time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Person</Label>
              <PersonSelect
                people={availablePeople}
                value={newPersonId}
                onValueChange={setNewPersonId}
                placeholder="Choose a person"
                triggerClassName={DualModeInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newRole}
                onValueChange={v => setNewRole(v as DiscipleshipGroupRole)}
              >
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Leader">Leader</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => void handleAddMember()}
              disabled={!newPersonId || isSaving}
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add to Group
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Members ({members.length})
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`pl-9 ${DualModeInputClass}`}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60 mx-6 mb-6">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-zinc-500">
                  No members yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-200/60 dark:divide-zinc-700/60">
                  {filteredMembers.map(member => (
                    <div
                      key={member.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                        >
                          <span className="text-white">{member.person?.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-medium">
                            {member.person?.name}
                          </p>
                          <p className="text-slate-600 dark:text-zinc-400 text-sm">
                            {member.person?.householdName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300">
                          {member.role}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleRemoveMember(member.id)}
                          disabled={isSaving}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Log a Meeting</CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Record what you covered the next time this group meets up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={meetingDate}
                onChange={e => setMeetingDate(e.target.value)}
                className={DualModeInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label>Topic *</Label>
              <Input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g., Living a life of prayer"
                className={DualModeInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes"
                className={DualModeInputClass}
              />
            </div>
            <Button
              onClick={() => void handleLogMeeting()}
              disabled={!meetingDate || !topic.trim() || isSaving}
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Meeting
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareText className="w-5 h-5" />
              Meeting History ({meetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60 mx-6 mb-6">
              {meetings.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-zinc-500">
                  No meetings logged yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-200/60 dark:divide-zinc-700/60">
                  {meetings.map(meeting => (
                    <div
                      key={meeting.id}
                      className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(meeting.meetingDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <p className="text-slate-900 dark:text-white font-medium mt-1">
                          {meeting.topic}
                        </p>
                        {meeting.notes && (
                          <p className="text-slate-600 dark:text-zinc-400 text-sm mt-1">
                            {meeting.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleRemoveMeeting(meeting.id)}
                        disabled={isSaving}
                        className="shrink-0 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Add Prayer Request</CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Share something this group is praying for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prayer Request *</Label>
              <Textarea
                value={prayerContent}
                onChange={e => setPrayerContent(e.target.value)}
                placeholder="What should the group pray for?"
                className={DualModeInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label>For (optional)</Label>
              <PersonSelect
                people={memberPeople}
                value={prayerPersonId}
                onValueChange={setPrayerPersonId}
                placeholder="Attribute to a member"
                triggerClassName={DualModeInputClass}
              />
            </div>
            <Button
              onClick={() => void handleAddPrayerItem()}
              disabled={!prayerContent.trim() || isSaving}
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Prayer Wall
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5" />
              Prayer Wall ({prayerItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60 mx-6 mb-6">
              {prayerItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-zinc-500">
                  No prayer requests yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-200/60 dark:divide-zinc-700/60">
                  {prayerItems.map(item => {
                    const person = item.personId
                      ? people.find(p => p.id === item.personId)
                      : undefined;
                    return (
                      <div
                        key={item.id}
                        className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {person && <span>&middot; {person.name}</span>}
                          </div>
                          <p
                            className={cn(
                              "font-medium mt-1",
                              item.isAnswered
                                ? "text-slate-500 line-through dark:text-zinc-500"
                                : "text-slate-900 dark:text-white",
                            )}
                          >
                            {item.content}
                          </p>
                          {item.isAnswered && (
                            <Badge
                              variant="secondary"
                              className="mt-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            >
                              Answered
                            </Badge>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void handleToggleAnswered(item.id, item.isAnswered)}
                            disabled={isSaving}
                            title={item.isAnswered ? "Mark as unanswered" : "Mark as answered"}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            {item.isAnswered ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void handleRemovePrayerItem(item.id)}
                            disabled={isSaving}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={removeGroupDialogOpen}
        onOpenChange={setRemoveGroupDialogOpen}
        title="Remove Group"
        description={`Are you sure you want to remove "${group.name}"? This will remove all its members and meeting history.`}
        confirmLabel="Remove Group"
        onConfirm={handleRemoveGroup}
        isLoading={isSaving}
      />
    </div>
  );
}
