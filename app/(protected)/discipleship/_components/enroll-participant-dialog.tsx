"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { mockPeople, mockDiscipleshipPrograms, mockDiscipleshipParticipants } from "@/components/mock-data";
import { UserPlus } from "lucide-react";

// Assuming types based on mock-data structure
interface Person { id: string; name: string; householdName: string; }
interface Program { id: string; name: string; }

interface EnrollParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string | null;
  programs: Program[];
  people: Person[];
}

export function EnrollParticipantDialog({ open, onOpenChange, programId, programs, people }: EnrollParticipantDialogProps) {
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [role, setRole] = useState("");

  const program = programs.find(p => p.id === programId);

  // Filter out people already in this program (simple check)
  const availablePeople = useMemo(() => {
    const participantIds = mockDiscipleshipParticipants
      .filter(p => p.programId === programId)
      .map(p => p.personId);
      
    return people.filter(p => !participantIds.includes(p.id));
  }, [people, programId]);

  const handleEnroll = () => {
    if (selectedPersonId && role && programId) {
      console.log(`Enrolling person ${selectedPersonId} into program ${programId} with role: ${role}`);
      // In a real application, you would make an API call here.
      
      // Reset state and close
      setSelectedPersonId("");
      setRole("");
      onOpenChange(false);
    }
  };

  // Dual-Mode Classes
  const DualModePrimaryButtonClass = "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass = "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeLabelClass = "text-slate-700 dark:text-zinc-300";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-zinc-800 dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5"/> Enroll Participant
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Assign a person to the **{program?.name || "selected"}** program.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="person" className={DualModeLabelClass}>Select Person</Label>
            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
              <SelectTrigger id="person" className={DualModeInputClass}>
                <SelectValue placeholder="Choose a person to enroll" />
              </SelectTrigger>
              <SelectContent>
                {availablePeople.length === 0 ? (
                  <SelectItem value="" disabled>No available people</SelectItem>
                ) : (
                  availablePeople.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} - {person.householdName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className={DualModeLabelClass}>Role in Program</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className={DualModeInputClass}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Participant">Participant</SelectItem>
                <SelectItem value="Facilitator">Facilitator</SelectItem>
                <SelectItem value="Assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleEnroll}
            disabled={!selectedPersonId || !role}
            className={DualModePrimaryButtonClass}
          >
            Enroll in Program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}