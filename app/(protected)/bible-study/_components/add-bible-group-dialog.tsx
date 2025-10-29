// components/add-bible-study-group-dialog.tsx

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
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockHouseholds, mockPeople } from "@/components/mock-data";

// Assuming a structure for the props, e.g., to handle the form submission
interface AddBibleStudyGroupDialogProps {
  children: React.ReactNode;
  onAddGroup: (newGroupData: any) => void; // Replace 'any' with your actual group data type
}

export function AddBibleStudyGroupDialog({ children, onAddGroup }: AddBibleStudyGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    householdId: "",
    leaderId: "",
    meetingDay: "",
    meetingTime: "",
  });

  const availableHouseholds = mockHouseholds.filter(h => h.id); // Simple filter, refine as needed
  const availableLeaders = mockPeople.filter(p => p.role === "Leader"); // Example filter for leaders

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you'd perform validation here

    const selectedHousehold = availableHouseholds.find(h => h.id === formData.householdId);
    const selectedLeader = mockPeople.find(p => p.id === formData.leaderId);

    if (selectedHousehold && selectedLeader) {
      const newGroupData = {
        id: Date.now().toString(), // Mock ID generation
        householdId: formData.householdId,
        householdName: selectedHousehold.name,
        leaderId: formData.leaderId,
        leaderName: selectedLeader.name,
        location: selectedHousehold.address,
        meetingDay: formData.meetingDay,
        meetingTime: formData.meetingTime,
        startDate: new Date().toISOString(),
        status: "Active",
      };
      
      onAddGroup(newGroupData);
      setFormData({ householdId: "", leaderId: "", meetingDay: "", meetingTime: "" }); // Reset form
      setIsOpen(false);
    } else {
        // Handle error/validation feedback
        console.error("Missing household or leader selection.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Bible Study Group</DialogTitle>
          <DialogDescription>
            Enter the details for the new household-based Bible study group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label htmlFor="householdId">Host Household</Label>
            <Select onValueChange={(value) => handleSelectChange("householdId", value)} value={formData.householdId}>
              <SelectTrigger id="householdId">
                <SelectValue placeholder="Select a household" />
              </SelectTrigger>
              <SelectContent>
                {availableHouseholds.map(household => (
                  <SelectItem key={household.id} value={household.id}>
                    {household.name} - {household.address.split(',')[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="leaderId">Group Leader</Label>
            <Select onValueChange={(value) => handleSelectChange("leaderId", value)} value={formData.leaderId}>
              <SelectTrigger id="leaderId">
                <SelectValue placeholder="Select a leader" />
              </SelectTrigger>
              <SelectContent>
                {availableLeaders.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} ({person.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="meetingDay">Meeting Day</Label>
              <Input 
                id="meetingDay" 
                placeholder="e.g., Monday" 
                value={formData.meetingDay} 
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meetingTime">Meeting Time</Label>
              <Input 
                id="meetingTime" 
                placeholder="e.g., 7:00 PM" 
                value={formData.meetingTime} 
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Create Group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}