// components/manage-members-dialog.tsx

"use client";

import { useState } from "react";
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
import { Users, UserPlus, UserX, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockBibleStudyMembers, mockPeople } from "@/components/mock-data";

// Type definitions (replace 'any' with actual types from your project)
type BibleStudyGroup = any;
type Person = any;
type BibleStudyMember = any;

interface ManageMembersDialogProps {
  group: BibleStudyGroup; // The specific group being managed
  currentMembers: Person[]; // The current members of the group
  onUpdateMembers: (groupId: string, newMembers: string[]) => void; // Handler to update members
  children: React.ReactNode;
}

export function ManageMembersDialog({ group, currentMembers, onUpdateMembers, children }: ManageMembersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Using an array of IDs for simplicity in mock example
  const initialMemberIds = currentMembers.map(m => m.id);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(initialMemberIds);
  
  // All people available to be members (excluding the leader, for example)
  const availablePeople = mockPeople.filter(p => p.id !== group.leaderId); 

  const isMember = (personId: string) => selectedMemberIds.includes(personId);

  const toggleMember = (personId: string) => {
    setSelectedMemberIds(prev =>
      isMember(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleSave = () => {
    onUpdateMembers(group.id, selectedMemberIds);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Members for {group.householdName}</DialogTitle>
          <DialogDescription>
            Add or remove people from this Bible study group.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm font-semibold mb-2">Group Leader:</p>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-background/50 mb-4">
            <UserPlus className="w-5 h-5 text-green-600" />
            <span className="text-foreground font-medium">{group.leaderName}</span>
            <span className="ml-auto text-sm text-muted-foreground">(Leader - Cannot be removed)</span>
          </div>

          <Separator className="mb-4" />

          <p className="text-sm font-semibold mb-2">Available Members:</p>
          <ScrollArea className="h-72 w-full pr-4">
            <div className="space-y-3">
              {availablePeople.map((person) => {
                const isCurrentlyMember = isMember(person.id);
                
                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background/50 hover:bg-background transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">{person.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{person.name}</p>
                        <p className="text-muted-foreground text-sm">{person.householdName}</p>
                      </div>
                    </div>
                    <Button
                      variant={isCurrentlyMember ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleMember(person.id)}
                      className="gap-1"
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Check className="w-4 h-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}