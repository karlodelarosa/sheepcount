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
import { UserPlus, UserX, Check, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { mockPeople } from "@/components/mock-data";

// Type definitions (assuming your types)
type Program = any;
type Person = typeof mockPeople[0];

interface RegisterParticipantDialogProps {
  program: Program; // The specific program being managed
  currentParticipantIds: string[]; // IDs of people currently in the program
  onUpdateParticipants: (programId: string, newParticipantIds: string[]) => void; // Handler to update members
  children: React.ReactNode;
}

const DualModeMemberAvatarClass = "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";

export function RegisterParticipantDialog({ program, currentParticipantIds, onUpdateParticipants, children }: RegisterParticipantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(currentParticipantIds);
  const [searchTerm, setSearchTerm] = useState("");
  
  // All people available to be participants
  const availablePeople = mockPeople; 

  const isParticipant = (personId: string) => selectedIds.includes(personId);

  const toggleParticipant = (personId: string) => {
    setSelectedIds(prev =>
      isParticipant(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleSave = () => {
    onUpdateParticipants(program.id, selectedIds);
    setIsOpen(false);
  };

  const filteredPeople = availablePeople.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.householdName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Participants for {program.name}</DialogTitle>
          <DialogDescription>
            Add or remove people from this {program.type} program.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search people..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

          <Separator className="mb-4" />

          <p className="text-sm font-semibold mb-2">People List ({filteredPeople.length} results):</p>
          <ScrollArea className="h-72 w-full pr-4">
            <div className="space-y-3">
              {filteredPeople.map((person) => {
                const isCurrentlyParticipant = isParticipant(person.id);
                
                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/60 bg-white/50 dark:border-zinc-700/60 dark:bg-zinc-800/70 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}>
                        <span className="text-white text-sm">{person.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-medium">{person.name}</p>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm">{person.householdName}</p>
                      </div>
                    </div>
                    <Button
                      variant={isCurrentlyParticipant ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleParticipant(person.id)}
                      className="gap-1 rounded-lg"
                    >
                      {isCurrentlyParticipant ? (
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
