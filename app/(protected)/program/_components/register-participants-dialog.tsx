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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePeople } from "@/lib/people";
import { useEvents } from "@/lib/events";
import type { ChurchEvent } from "@/lib/supabase/events";
import type { EventRole } from "@/lib/supabase/events";

interface RegisterParticipantDialogProps {
  event: ChurchEvent;
  children: React.ReactNode;
}

export function RegisterParticipantDialog({
  event,
  children,
}: RegisterParticipantDialogProps) {
  const { people } = usePeople();
  const { registerPersonForEvent, getEventRegistrations } = useEvents();
  const [isOpen, setIsOpen] = useState(false);
  const [personId, setPersonId] = useState("");
  const [parentPersonId, setParentPersonId] = useState("");
  const [roleInEvent, setRoleInEvent] = useState<EventRole>("Attendee");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");

  const existingRegistrations = getEventRegistrations(event.id);
  const registeredPersonIds = new Set(existingRegistrations.map(r => r.personId));

  const selectedPerson = people.find(p => p.id === personId);
  const isChildRegistration = selectedPerson?.role === "Child";

  useEffect(() => {
    if (!isOpen) {
      setPersonId("");
      setParentPersonId("");
      setRoleInEvent("Attendee");
      setMedicalNotes("");
      setDietaryRestrictions("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId) return;
    if (isChildRegistration && !parentPersonId) return;

    const result = await registerPersonForEvent({
      eventId: event.id,
      personId,
      parentPersonId: isChildRegistration ? parentPersonId : undefined,
      roleInEvent,
      medicalNotes: isChildRegistration ? medicalNotes : undefined,
      dietaryRestrictions: isChildRegistration ? dietaryRestrictions : undefined,
    });

    if (result) {
      setIsOpen(false);
    }
  };

  const availablePeople = people.filter(p => !registeredPersonIds.has(p.id));
  const parentCandidates = people.filter(
    p => p.role === "Head" || p.role === "Spouse" || p.role === "Single",
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Register for {event.title}</DialogTitle>
          <DialogDescription>
            Register a person or child for this {event.type} event.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Participant</Label>
            <Select value={personId} onValueChange={setPersonId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {availablePeople.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                    {person.role === "Child" ? " (Child)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isChildRegistration && (
            <>
              <div className="space-y-2">
                <Label>Parent / Guardian</Label>
                <Select
                  value={parentPersonId}
                  onValueChange={setParentPersonId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentCandidates.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical">Medical Notes</Label>
                <Textarea
                  id="medical"
                  value={medicalNotes}
                  onChange={e => setMedicalNotes(e.target.value)}
                  placeholder="Allergies, medications, etc."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary">Dietary Restrictions</Label>
                <Input
                  id="dietary"
                  value={dietaryRestrictions}
                  onChange={e => setDietaryRestrictions(e.target.value)}
                  placeholder="e.g., nut allergy, vegetarian"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Role in Event</Label>
            <Select
              value={roleInEvent}
              onValueChange={value => setRoleInEvent(value as EventRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Attendee">Attendee</SelectItem>
                <SelectItem value="Volunteer">Volunteer</SelectItem>
                <SelectItem value="Core_Leader">Core Leader</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Register</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
