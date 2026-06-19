"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePeople } from "@/lib/people";
import { useBibleStudy } from "@/lib/bible-study";

interface AddBibleStudyGroupDialogProps {
  children: React.ReactNode;
  defaultHouseholdId?: string;
}

export function AddBibleStudyGroupDialog({
  children,
  defaultHouseholdId,
}: AddBibleStudyGroupDialogProps) {
  const { people, households } = usePeople();
  const { addGroup, getActiveHouseholdIds, isSaving } = useBibleStudy();
  const [isOpen, setIsOpen] = useState(false);
  const [householdId, setHouseholdId] = useState(defaultHouseholdId ?? "");
  const [leaderPersonId, setLeaderPersonId] = useState("");
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  const activeHouseholdIds = getActiveHouseholdIds();

  const availableHouseholds = useMemo(
    () => households.filter(h => !activeHouseholdIds.has(h.id)),
    [households, activeHouseholdIds],
  );

  const householdMembers = useMemo(
    () => people.filter(p => p.householdId === householdId),
    [people, householdId],
  );

  const leaderOptions = useMemo(
    () =>
      [...people].sort((a, b) => {
        const aInHousehold = a.householdId === householdId ? 0 : 1;
        const bInHousehold = b.householdId === householdId ? 0 : 1;
        if (aInHousehold !== bInHousehold) return aInHousehold - bInHousehold;
        return a.name.localeCompare(b.name);
      }),
    [people, householdId],
  );

  useEffect(() => {
    if (!isOpen) return;
    setHouseholdId(defaultHouseholdId ?? "");
    setLeaderPersonId("");
    setMeetingDay("");
    setMeetingTime("");
  }, [isOpen, defaultHouseholdId]);

  useEffect(() => {
    if (!householdId) {
      setLeaderPersonId("");
      return;
    }
    const head = householdMembers.find(p => p.role === "Head");
    if (head && !leaderPersonId) {
      setLeaderPersonId(head.id);
    }
  }, [householdId, householdMembers, leaderPersonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId || !leaderPersonId || !meetingDay.trim() || !meetingTime.trim()) {
      return;
    }

    const result = await addGroup({
      householdId,
      leaderPersonId,
      meetingDay: meetingDay.trim(),
      meetingTime: meetingTime.trim(),
    });

    if (result) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Bible Study Group</DialogTitle>
          <DialogDescription>
            Start a household-based Bible study. The host household provides the
            meeting location. The leader can be anyone in your church, not only
            household members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="householdId">Host Household</Label>
            <Select
              value={householdId}
              onValueChange={setHouseholdId}
              disabled={Boolean(defaultHouseholdId)}
            >
              <SelectTrigger id="householdId">
                <SelectValue placeholder="Select a household" />
              </SelectTrigger>
              <SelectContent>
                {availableHouseholds.map(household => (
                  <SelectItem key={household.id} value={household.id}>
                    {household.name}
                    {household.address ? ` — ${household.address.split(",")[0]}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="leaderPersonId">Group Leader</Label>
            <Select
              value={leaderPersonId}
              onValueChange={setLeaderPersonId}
              disabled={!householdId}
            >
              <SelectTrigger id="leaderPersonId">
                <SelectValue placeholder="Select a leader" />
              </SelectTrigger>
              <SelectContent>
                {leaderOptions.map(person => {
                  const isFromHostHousehold = person.householdId === householdId;
                  return (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                      {isFromHostHousehold
                        ? ` (${person.role})`
                        : ` — ${person.householdName}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="meetingDay">Meeting Day</Label>
              <Input
                id="meetingDay"
                placeholder="e.g., Wednesday"
                value={meetingDay}
                onChange={e => setMeetingDay(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meetingTime">Meeting Time</Label>
              <Input
                id="meetingTime"
                placeholder="e.g., 7:00 PM"
                value={meetingTime}
                onChange={e => setMeetingTime(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
