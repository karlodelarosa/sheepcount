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
          <div className="flex flex-col items-center gap-3 rounded-[20px] bg-card py-14 text-center text-[15px] text-muted-foreground">
            <BookOpen className="size-6" strokeWidth={1.8} />
            No discipleship groups yet
          </div>
        ) : (
          <ul className="overflow-hidden rounded-[20px] bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
            {groups.map(group => {
              return (
                <li key={group.id} className="border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={() => openGroup(group.id)}
                    className="flex min-h-[72px] w-full items-center gap-3.5 px-4 text-left transition-colors duration-200 hover:bg-muted/50 active:bg-muted motion-reduce:transition-none"
                  >
                    <span className="flex w-7 shrink-0 items-center justify-center text-foreground">
                      <BookOpen className="size-6" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-medium">
                        {group.name}
                      </span>
                      <span className="mt-1 block truncate text-[13px] text-muted-foreground">
                        {memberCountByGroup.get(group.id) ?? 0} members
                      </span>
                    </span>
                    <ChevronRight
                      className="size-5 shrink-0 text-muted-foreground/70"
                      strokeWidth={1.8}
                    />
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
          className="h-11 rounded-xl px-3 text-[13px]"
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
        <TabsList className="grid h-[52px] w-full grid-cols-2 gap-1 rounded-[16px] p-1">
          <TabsTrigger value="meeting" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            Meeting
          </TabsTrigger>
          <TabsTrigger value="prayer" className="gap-1.5">
            <HeartHandshake className="h-4 w-4" />
            Prayer Wall
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meeting" className="mt-5">
          <div className="space-y-5">
            <Accordion
              type="single"
              collapsible
              className="rounded-[20px] bg-card px-4 ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
            >
              <AccordionItem value="log-meeting" className="border-b-0">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="flex items-center gap-2.5 text-sm font-medium">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
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
                      className="h-[52px] w-full gap-1.5 rounded-xl"
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
                <div className="flex flex-col items-center gap-3 rounded-[20px] bg-card py-12 text-center text-[15px] text-muted-foreground">
                  <CalendarDays className="size-6" strokeWidth={1.8} />
                  No meetings logged yet
                </div>
              ) : (
                <ul className="divide-y overflow-hidden rounded-[20px] bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
                  {meetings.map(meeting => (
                    <li key={meeting.id} className="px-3.5 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
              className="rounded-[20px] bg-card px-4 ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
            >
              <AccordionItem value="add-prayer" className="border-b-0">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="flex items-center gap-2.5 text-sm font-medium">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
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
                      className="h-[52px] w-full gap-1.5 rounded-xl"
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
                <div className="flex flex-col items-center gap-3 rounded-[20px] bg-card py-12 text-center text-[15px] text-muted-foreground">
                  <HeartHandshake className="size-6" strokeWidth={1.8} />
                  No prayer requests yet
                </div>
              ) : (
                <ul className="divide-y overflow-hidden rounded-[20px] bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
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
