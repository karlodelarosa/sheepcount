"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  HeartHandshake,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useDiscipleship } from "@/lib/discipleship";
import {
  accentForIndex,
  discipleshipFlatAccentThemes,
} from "@/app/(protected)/discipleship/_lib/discipleship-themes";
import { MobileShell } from "../_components/mobile-shell";

function todayDateInputValue(): string {
  return new Date().toISOString().split("T")[0];
}

type DetailTab = "meeting" | "prayer";

export function MobileDiscipleship() {
  const {
    groups,
    hydrated,
    isSaving,
    addGroupMeeting,
    getGroupMembers,
    getGroupMeetings,
    addGroupPrayerItem,
    getGroupPrayerItems,
  } = useDiscipleship();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("meeting");
  const [meetingDate, setMeetingDate] = useState(todayDateInputValue());
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [prayerContent, setPrayerContent] = useState("");

  const selectedGroupIndex = useMemo(
    () => groups.findIndex(group => group.id === selectedGroupId),
    [groups, selectedGroupId],
  );
  const selectedGroup =
    selectedGroupIndex >= 0 ? groups[selectedGroupIndex] : null;
  const theme =
    discipleshipFlatAccentThemes[
      accentForIndex(Math.max(selectedGroupIndex, 0))
    ];

  const memberCountByGroup = useMemo(() => {
    const counts = new Map<string, number>();
    for (const group of groups) {
      counts.set(group.id, getGroupMembers(group.id).length);
    }
    return counts;
  }, [groups, getGroupMembers]);

  const meetings = useMemo(
    () => (selectedGroupId ? getGroupMeetings(selectedGroupId) : []),
    [selectedGroupId, getGroupMeetings],
  );

  const prayerItems = useMemo(
    () => (selectedGroupId ? getGroupPrayerItems(selectedGroupId) : []),
    [selectedGroupId, getGroupPrayerItems],
  );

  const openGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setActiveTab("meeting");
    setMeetingDate(todayDateInputValue());
    setTopic("");
    setNotes("");
    setPrayerContent("");
  };

  const closeGroup = () => {
    setSelectedGroupId(null);
  };

  const handleLogMeeting = async () => {
    if (!selectedGroupId || !meetingDate || !topic.trim()) return;
    const result = await addGroupMeeting({
      groupId: selectedGroupId,
      meetingDate,
      topic,
      notes,
    });
    if (result) {
      setMeetingDate(todayDateInputValue());
      setTopic("");
      setNotes("");
    }
  };

  const handleAddPrayerItem = async () => {
    if (!selectedGroupId || !prayerContent.trim()) return;
    const result = await addGroupPrayerItem({
      groupId: selectedGroupId,
      content: prayerContent,
    });
    if (result) setPrayerContent("");
  };

  if (!hydrated) {
    return (
      <MobileShell title="Discipleship" backHref="/mobile">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </MobileShell>
    );
  }

  if (!selectedGroup) {
    return (
      <MobileShell
        title="Discipleship"
        subtitle="Pick a group"
        backHref="/mobile"
      >
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
            <BookOpen className="h-6 w-6" />
            No discipleship groups yet
          </div>
        ) : (
          <ul className="space-y-2">
            {groups.map((group, index) => {
              const rowTheme =
                discipleshipFlatAccentThemes[accentForIndex(index)];
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => openGroup(group.id)}
                    className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-left transition-colors hover:bg-muted/50 active:scale-[0.99]"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        rowTheme.soft,
                      )}
                    >
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {group.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {memberCountByGroup.get(group.id) ?? 0} members
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </MobileShell>
    );
  }

  return (
    <MobileShell
      title={selectedGroup.name}
      subtitle="Discipleship group"
      onBack={closeGroup}
      action={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={closeGroup}
        >
          Change
        </Button>
      }
    >
      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as DetailTab)}
      >
        <TabsList className="grid h-12 w-full grid-cols-2 gap-1 p-1">
          <TabsTrigger
            value="meeting"
            className={cn("gap-1.5", theme.tabActive)}
          >
            <BookOpen className="h-4 w-4" />
            Meeting
          </TabsTrigger>
          <TabsTrigger
            value="prayer"
            className={cn("gap-1.5", theme.tabActive)}
          >
            <HeartHandshake className="h-4 w-4" />
            Prayer Wall
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meeting" className="mt-5">
          <div className="space-y-5">
            <Accordion
              type="single"
              collapsible
              className="rounded-xl border bg-card px-3.5"
            >
              <AccordionItem value="log-meeting" className="border-b-0">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="flex items-center gap-2.5 text-sm font-medium">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        theme.soft,
                      )}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                    Log a meeting
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={meetingDate}
                        onChange={event => setMeetingDate(event.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Topic *</Label>
                      <Input
                        value={topic}
                        onChange={event => setTopic(event.target.value)}
                        placeholder="e.g., Living a life of prayer"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notes</Label>
                      <Textarea
                        value={notes}
                        onChange={event => setNotes(event.target.value)}
                        placeholder="Optional notes"
                      />
                    </div>
                    <Button
                      type="button"
                      className={cn("h-11 w-full gap-1.5", theme.solid)}
                      disabled={!meetingDate || !topic.trim() || isSaving}
                      onClick={() => void handleLogMeeting()}
                    >
                      {isSaving ? "Saving…" : "Log meeting"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-2.5">
              <Label className="text-muted-foreground">
                Meeting history ({meetings.length})
              </Label>
              {meetings.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                  <CalendarDays className="h-5 w-5" />
                  No meetings logged yet
                </div>
              ) : (
                <ul className="divide-y rounded-xl border bg-card">
                  {meetings.map(meeting => (
                    <li key={meeting.id} className="px-3.5 py-3">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-xs",
                          theme.text,
                        )}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(meeting.meetingDate).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {meeting.topic}
                      </p>
                      {meeting.notes && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {meeting.notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prayer" className="mt-5">
          <div className="space-y-5">
            <Accordion
              type="single"
              collapsible
              className="rounded-xl border bg-card px-3.5"
            >
              <AccordionItem value="add-prayer" className="border-b-0">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="flex items-center gap-2.5 text-sm font-medium">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        theme.soft,
                      )}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                    Add a prayer request
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                  <div className="space-y-4">
                    <Textarea
                      value={prayerContent}
                      onChange={event => setPrayerContent(event.target.value)}
                      placeholder="What should the group pray for?"
                    />
                    <Button
                      type="button"
                      className={cn("h-11 w-full gap-1.5", theme.solid)}
                      disabled={!prayerContent.trim() || isSaving}
                      onClick={() => void handleAddPrayerItem()}
                    >
                      {isSaving ? "Saving…" : "Add to prayer wall"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-2.5">
              <Label className="text-muted-foreground">
                Prayer wall ({prayerItems.length})
              </Label>
              {prayerItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                  <HeartHandshake className="h-5 w-5" />
                  No prayer requests yet
                </div>
              ) : (
                <ul className="divide-y rounded-xl border bg-card">
                  {prayerItems.map(item => (
                    <li key={item.id} className="px-3.5 py-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                        {item.isAnswered ? " · Answered" : ""}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-sm",
                          item.isAnswered &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {item.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MobileShell>
  );
}
