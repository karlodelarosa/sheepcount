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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserX, Check, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePeople } from "@/lib/people";
import { useBibleStudy } from "@/lib/bible-study";
import type { BibleStudyGroup } from "@/lib/supabase/bible-study";

interface ManageMembersDialogProps {
  group: BibleStudyGroup;
  householdName: string;
  leaderName: string;
  children: React.ReactNode;
}

export function ManageMembersDialog({
  group,
  householdName,
  leaderName,
  children,
}: ManageMembersDialogProps) {
  const { people } = usePeople();
  const { members, updateGroupMembers, isSaving } = useBibleStudy();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSelectedMemberIds(
        members
          .filter(
            m =>
              m.bibleStudyGroupId === group.id &&
              m.personId !== group.leaderPersonId,
          )
          .map(m => m.personId),
      );
      setSearchTerm("");
    }
  };

  const filteredPeople = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return people
      .filter(p => p.id !== group.leaderPersonId)
      .filter(
        p =>
          !term ||
          p.name.toLowerCase().includes(term) ||
          p.householdName.toLowerCase().includes(term),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [people, group.leaderPersonId, searchTerm]);

  const isMember = (personId: string) => selectedMemberIds.includes(personId);

  const toggleMember = (personId: string) => {
    setSelectedMemberIds(prev =>
      isMember(personId) ? prev.filter(id => id !== personId) : [...prev, personId],
    );
  };

  const handleSave = async () => {
    const personHouseholdById = new Map(people.map(p => [p.id, p.householdId]));
    const success = await updateGroupMembers(
      group.id,
      selectedMemberIds,
      personHouseholdById,
    );
    if (success) {
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Members for {householdName}</DialogTitle>
          <DialogDescription>
            Add household members or guests from other households who regularly
            attend this Bible study.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-semibold mb-2">Group Leader</p>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-background/50 mb-4">
            <UserPlus className="w-5 h-5 text-green-600" />
            <span className="text-foreground font-medium">{leaderName}</span>
            <span className="ml-auto text-sm text-muted-foreground">
              Current leader
            </span>
          </div>

          <Separator className="mb-4" />

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search people by name or household..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <p className="text-sm font-semibold mb-2">People</p>
          <ScrollArea className="h-72 w-full pr-4">
            <div className="space-y-3">
              {filteredPeople.map(person => {
                const isCurrentlyMember = isMember(person.id);
                const isGuest = person.householdId !== group.householdId;

                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background/50 hover:bg-background transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-muted-foreground text-sm">
                          {person.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-medium truncate">
                          {person.name}
                        </p>
                        <p className="text-muted-foreground text-sm truncate">
                          {person.householdName}
                          {isGuest ? " · Guest" : ""}
                        </p>
                      </div>
                      {isGuest && isCurrentlyMember && (
                        <Badge variant="secondary" className="shrink-0">
                          Guest
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant={isCurrentlyMember ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleMember(person.id)}
                      className="gap-1 shrink-0 ml-2"
                    >
                      {isCurrentlyMember ? (
                        <>
                          <UserX className="w-4 h-4" />
                          Remove
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Check className="w-4 h-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
