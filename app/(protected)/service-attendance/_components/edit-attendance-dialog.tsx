"use client";

import { useState, useEffect } from "react";
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
import { Search, Users, CheckSquare, Edit, X, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// --- Assuming these types and mock data from your environment ---
interface Person {
    id: string;
    name: string;
    householdName: string;
    membershipType: string;
}

// NOTE: The 'record' received now includes the 'prospects' property from the ServiceAttendanceView enhancement
interface GroupedAttendanceRecord {
    serviceId: string;
    serviceType: string;
    date: string;
    attendees: string[]; // array of member personIds
    prospects?: string[]; // array of prospect names (new addition)
}
// ------------------------------------------------------------------

interface EditAttendanceDialogProps {
  children: React.ReactNode;
  record: GroupedAttendanceRecord; // The specific record being edited
  people: Person[];
  // UPDATED HANDLER: Now includes a newProspects array
  onEditAttendance: (
    serviceId: string, 
    date: string, 
    memberIds: string[], 
    prospects: string[]
  ) => void; 
}

const DualModeMemberAvatarClass = "from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300";


export function EditAttendanceDialog({ children, record, people, onEditAttendance }: EditAttendanceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  // State for member IDs
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(record.attendees);
  // NEW State for prospect names
  const [newProspects, setNewProspects] = useState<string[]>(record.prospects || []);
  const [prospectInput, setProspectInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Sync state when a new record is selected outside the dialog or when it first opens
  useEffect(() => {
    setSelectedMemberIds(record.attendees);
    setNewProspects(record.prospects || []);
  }, [record.attendees, record.prospects, record.serviceId, record.date]);

  // --- Handlers for Members ---
  const toggleMember = (personId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };
  
  // --- Handlers for Prospects ---
  const handleAddProspect = () => {
    const name = prospectInput.trim();
    if (name && !newProspects.includes(name)) {
        setNewProspects(prev => [...prev, name]);
        setProspectInput("");
    }
  };

  const handleRemoveProspect = (name: string) => {
    setNewProspects(prev => prev.filter(p => p !== name));
  };
  
  // --- Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Call the updated parent handler with both member IDs and prospect names
    onEditAttendance(
        record.serviceId, 
        record.date, 
        selectedMemberIds, 
        newProspects
    );
    
    // Reset search and close
    setIsOpen(false);
    setSearchTerm("");
  };

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.householdName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Attendance for {record.serviceType}</DialogTitle>
          <DialogDescription>
            {new Date(record.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* --- Prospect Management --- */}
          <div className="space-y-2 border-b pb-4 border-border/60">
            <Label>Add New Visitor (Prospect)</Label>
            <div className="flex gap-2">
                <Input
                    placeholder="Enter visitor's name..."
                    value={prospectInput}
                    onChange={(e) => setProspectInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProspect(); } }}
                />
                <Button type="button" onClick={handleAddProspect} className="shrink-0 gap-1">
                    <UserPlus className="w-4 h-4" />
                    Add
                </Button>
            </div>
            
            {newProspects.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {newProspects.map((name) => (
                        <Badge 
                            key={name} 
                            variant="secondary" 
                            className="text-xs flex items-center gap-1 bg-green-500 text-white cursor-pointer hover:bg-green-600"
                            onClick={() => handleRemoveProspect(name)}
                        >
                            {name}
                            <X className="w-3 h-3 ml-1" />
                        </Badge>
                    ))}
                </div>
            )}
            
          </div>

          {/* --- Member Selection --- */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label>Registered Members ({selectedMemberIds.length} Selected)</Label>
                <Badge variant="secondary">{people.length} total members</Badge>
            </div>
            
            <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search registered members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            
            <ScrollArea className="h-64 w-full border border-border/60 rounded-xl p-3">
              <div className="space-y-2">
                {filteredPeople.map((person) => {
                  const isSelected = selectedMemberIds.includes(person.id);
                  
                  return (
                    <div
                      key={person.id}
                      className={`
                        flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                        ${isSelected 
                            ? 'bg-primary/10 border border-primary/40' 
                            : 'hover:bg-accent/50 border border-transparent'
                        }
                      `}
                      onClick={() => toggleMember(person.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}>
                          <span className="text-white dark:text-slate-900 text-sm">{person.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{person.name}</p>
                          <p className="text-muted-foreground text-xs">{person.householdName}</p>
                        </div>
                      </div>
                      
                      {isSelected ? (
                         <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <div className="w-5 h-5 border border-border rounded-md" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            {filteredPeople.length === 0 && (
                <p className="text-center text-muted-foreground p-4">No people found matching your search.</p>
            )}
          </div>


          <DialogFooter className="mt-4">
            <Button type="submit" className="gap-2">
              <Edit className="w-4 h-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
