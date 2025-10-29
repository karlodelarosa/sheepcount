"use client";

import { useEffect, useState } from "react";
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
import { Plus, Calendar, Search, CheckSquare, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceType {
  id: string;
  name: string;
  color: string;
}

interface Person {
  id: string;
  name: string;
  householdName: string;
  membershipType: string;
}

export interface NewAttendanceRecord {
  id?: string;
  serviceId: string;
  date: string;
  personIds: string[];
}

interface RecordAttendanceDialogProps {
  children?: React.ReactNode;
  serviceTypes: ServiceType[];
  people: Person[];
  onRecordAttendance: (record: NewAttendanceRecord) => void;
  // optional controlled props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RecordAttendanceDialog({
  children,
  serviceTypes,
  people,
  onRecordAttendance,
  open,
  onOpenChange,
}: RecordAttendanceDialogProps) {
  // manage local state but allow controlled open
  const [isOpenLocal, setIsOpenLocal] = useState<boolean>(false);
  const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
  const isOpen = isControlled ? open : isOpenLocal;
  const setIsOpen = isControlled ? onOpenChange! : setIsOpenLocal;

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Auto select first service when loaded
  useEffect(() => {
    if (serviceTypes?.length && !selectedServiceId) {
      setSelectedServiceId(serviceTypes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceTypes]);

  const togglePerson = (personId: string) => {
    setSelectedPersonIds((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !attendanceDate || selectedPersonIds.length === 0) {
      console.error("Missing data");
      return;
    }

    onRecordAttendance({
      id: crypto?.randomUUID ? crypto.randomUUID() : `${selectedServiceId}-${attendanceDate}`,
      serviceId: selectedServiceId,
      date: attendanceDate,
      personIds: selectedPersonIds,
    });

    // Reset + close
    setSelectedPersonIds([]);
    setSearchTerm("");
    setIsOpen(false);
  };

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.householdName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* If children provided, DialogTrigger will wrap it. If none provided, consumer can open via controlled prop */}
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Attendance</DialogTitle>
          <DialogDescription>Fill in the details below</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Service + Date */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Service</Label>
              <Select
                value={selectedServiceId}
                onValueChange={setSelectedServiceId}
                disabled={!serviceTypes?.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes?.length ? (
                    serviceTypes.map((svc) => (
                      <SelectItem key={svc.id} value={svc.id}>
                        <div className="flex items-center gap-2">
                          {svc.name.includes("Worship") ? <Clock /> : <Calendar />}
                          {svc.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">No service types available</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2 py-2 border-t">
            <div className="flex justify-between items-center">
              <Label>Attendees ({selectedPersonIds.length})</Label>
              {selectedPersonIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setSelectedPersonIds([])}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4" />
              <Input
                className="pl-10"
                placeholder="Search people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ScrollArea className="h-64 border p-3 rounded-xl">
              {filteredPeople.map((person) => {
                const isSelected = selectedPersonIds.includes(person.id);
                return (
                  <div
                    key={person.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      isSelected ? "bg-primary/10 border border-primary/40" : "hover:bg-accent/50"
                    }`}
                    onClick={() => togglePerson(person.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-sm">
                        {person.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-xs opacity-60">{person.householdName}</p>
                      </div>
                    </div>

                    {isSelected ? <CheckSquare /> : <div className="w-5 h-5 border rounded-md" />}
                  </div>
                );
              })}

              {filteredPeople.length === 0 && (
                <p className="text-center text-muted-foreground">No results</p>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!selectedPersonIds.length}>
              <Plus className="w-4 h-4 mr-1" /> Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
