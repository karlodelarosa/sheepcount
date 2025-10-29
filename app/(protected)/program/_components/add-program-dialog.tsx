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
import { Plus, Calendar, Clock, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockPeople } from "@/components/mock-data";

// Type definitions (assuming your types)
type ProgramType = "Event" | "Recurring";
type ProgramColor = "blue" | "green" | "purple" | "pink" | "orange" | "indigo";

interface ProgramFormData {
  name: string;
  description: string;
  type: ProgramType;
  category: string;
  coordinator: string;
  startDate: string;
  endDate: string;
  color: ProgramColor;
}

interface AddProgramDialogProps {
  children: React.ReactNode;
  initialType?: ProgramType;
  onAddProgram: (newProgramData: ProgramFormData) => void; 
}

const colorOptions: ProgramColor[] = ["blue", "green", "purple", "pink", "orange", "indigo"];
const categoryOptions = ["Worship", "Fellowship", "Service", "Study", "Outreach"];

export function AddProgramDialog({ children, initialType = "Event", onAddProgram }: AddProgramDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ProgramFormData>(() => ({
    name: "",
    description: "",
    type: initialType,
    category: categoryOptions[0],
    coordinator: mockPeople[0]?.id || "", // Default to first person
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    color: colorOptions[0],
  }));

  const handleChange = (id: keyof ProgramFormData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (!formData.name || !formData.coordinator || !formData.startDate) {
        console.error("Missing required fields.");
        return;
    }

    // In a real app, you would generate a proper ID and save to database
    onAddProgram({ 
        ...formData,
        // Ensure Recurring programs don't pass an empty string for endDate if not used
        endDate: formData.type === 'Recurring' ? '' : formData.endDate 
    } as ProgramFormData);
    
    // Reset form and close
    setFormData(prev => ({ 
        ...prev, 
        name: "", 
        description: "", 
        endDate: "", 
        startDate: new Date().toISOString().split('T')[0] 
    }));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New {formData.type} Program</DialogTitle>
          <DialogDescription>
            Enter the details for the new church program or activity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange("description", e.target.value)} 
              className="col-span-3"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleChange("type", value as ProgramType)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Event">Event (One-time)</SelectItem>
                <SelectItem value="Recurring">Recurring (Ongoing)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Coordinator</Label>
            <Select 
              value={formData.coordinator} 
              onValueChange={(value) => handleChange("coordinator", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select coordinator" />
              </SelectTrigger>
              <SelectContent>
                {mockPeople.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {person.name} ({person.role})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">Start Date</Label>
            <Input 
              id="startDate" 
              type="date" 
              value={formData.startDate} 
              onChange={(e) => handleChange("startDate", e.target.value)} 
              className="col-span-3"
              required
            />
          </div>

          {formData.type === "Event" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">End Date</Label>
              <Input 
                id="endDate" 
                type="date" 
                value={formData.endDate} 
                onChange={(e) => handleChange("endDate", e.target.value)} 
                className="col-span-3"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Color Theme</Label>
            <Select 
              value={formData.color} 
              onValueChange={(value) => handleChange("color", value as ProgramColor)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map(color => (
                    <SelectItem key={color} value={color} className={`capitalize`}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Program
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
