import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { mockPeople } from "@/components/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecordAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

export function RecordAttendanceDialog({ open, onOpenChange, selectedDate }: RecordAttendanceDialogProps) {
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [attendanceType, setAttendanceType] = useState<string>("service");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the database
    console.log("Recording attendance:", { selectedPeople, attendanceType, date: selectedDate });
    setSelectedPeople([]);
    onOpenChange(false);
  };

  const togglePerson = (personId: string) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const toggleHousehold = (householdId: string) => {
    const householdMembers = mockPeople.filter(p => p.householdId === householdId).map(p => p.id);
    const allSelected = householdMembers.every(id => selectedPeople.includes(id));
    
    if (allSelected) {
      setSelectedPeople(prev => prev.filter(id => !householdMembers.includes(id)));
    } else {
      setSelectedPeople(prev => [...new Set([...prev, ...householdMembers])]);
    }
  };

  // Group people by household
  const households = mockPeople.reduce((acc, person) => {
    if (!acc[person.householdId]) {
      acc[person.householdId] = {
        name: person.householdName,
        members: []
      };
    }
    acc[person.householdId].members.push(person);
    return acc;
  }, {} as Record<string, { name: string; members: any[] }>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Record Attendance</DialogTitle>
          <DialogDescription>
            {selectedDate ? selectedDate.toLocaleDateString() : "Select date first"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Attendance Type</Label>
              <Select value={attendanceType} onValueChange={setAttendanceType}>
                <SelectTrigger id="type" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Select People</Label>
              <ScrollArea className="h-[300px] border border-slate-200/60 rounded-xl p-4">
                <div className="space-y-4">
                  {Object.entries(households).map(([householdId, household]) => {
                    const allSelected = household.members.every(m => selectedPeople.includes(m.id));
                    const someSelected = household.members.some(m => selectedPeople.includes(m.id));
                    
                    return (
                      <div key={householdId} className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                          <Checkbox
                            id={`household-${householdId}`}
                            checked={allSelected}
                            onCheckedChange={() => toggleHousehold(householdId)}
                            className={someSelected && !allSelected ? "opacity-50" : ""}
                          />
                          <label 
                            htmlFor={`household-${householdId}`}
                            className="flex-1 cursor-pointer text-slate-900"
                          >
                            {household.name}
                          </label>
                        </div>
                        <div className="ml-6 space-y-2">
                          {household.members.map(person => (
                            <div key={person.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                              <Checkbox
                                id={`person-${person.id}`}
                                checked={selectedPeople.includes(person.id)}
                                onCheckedChange={() => togglePerson(person.id)}
                              />
                              <label 
                                htmlFor={`person-${person.id}`}
                                className="flex-1 cursor-pointer text-slate-700"
                              >
                                {person.name} ({person.role})
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <p className="text-slate-600">
                {selectedPeople.length} {selectedPeople.length === 1 ? 'person' : 'people'} selected
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={selectedPeople.length === 0} className="rounded-xl bg-slate-900 hover:bg-slate-800">
              Record Attendance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}