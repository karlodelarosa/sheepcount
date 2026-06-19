"use client";

import { useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown } from "lucide-react";
import { usePeople } from "@/lib/people";
import { useBibleStudy } from "@/lib/bible-study";
import type { BibleStudyGroup } from "@/lib/supabase/bible-study";

interface ChangeLeaderDialogProps {
  group: BibleStudyGroup;
  householdName: string;
  currentLeaderName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function ChangeLeaderDialog({
  group,
  householdName,
  currentLeaderName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}: ChangeLeaderDialogProps) {
  const { people } = usePeople();
  const { replaceGroupLeader, isSaving } = useBibleStudy();
  const [internalOpen, setInternalOpen] = useState(false);
  const [leaderPersonId, setLeaderPersonId] = useState(group.leaderPersonId);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (open: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(open);
    } else {
      setInternalOpen(open);
    }
    if (open) {
      setLeaderPersonId(group.leaderPersonId);
    }
  };

  const leaderOptions = useMemo(
    () =>
      [...people].sort((a, b) => {
        const aInHousehold = a.householdId === group.householdId ? 0 : 1;
        const bInHousehold = b.householdId === group.householdId ? 0 : 1;
        if (aInHousehold !== bInHousehold) return aInHousehold - bInHousehold;
        return a.name.localeCompare(b.name);
      }),
    [people, group.householdId],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderPersonId || leaderPersonId === group.leaderPersonId) {
      handleOpenChange(false);
      return;
    }

    const personHouseholdById = new Map(people.map(p => [p.id, p.householdId]));
    const success = await replaceGroupLeader(
      group.id,
      leaderPersonId,
      personHouseholdById,
    );
    if (success) {
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Group Leader</DialogTitle>
          <DialogDescription>
            Replace the leader for {householdName}&apos;s Bible study. The
            previous leader stays in the group as a member or guest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm">
            <span className="text-muted-foreground">Current leader: </span>
            <span className="font-medium">{currentLeaderName}</span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="leaderPersonId">New Leader</Label>
            <Select value={leaderPersonId} onValueChange={setLeaderPersonId}>
              <SelectTrigger id="leaderPersonId">
                <SelectValue placeholder="Select a leader" />
              </SelectTrigger>
              <SelectContent>
                {leaderOptions.map(person => {
                  const isFromHostHousehold =
                    person.householdId === group.householdId;
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Crown className="w-4 h-4" />
              Save Leader
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
