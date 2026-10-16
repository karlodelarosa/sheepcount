"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  MapPin,
  Plus,
  Search,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { cn } from "@/lib/utils";
import { MobileShell } from "../_components/mobile-shell";
import { MobileActionBar } from "../_components/mobile-action-bar";
import {
  submitCellGroupAttendance,
  isValidNewCellGroupAttendee,
  type NewCellGroupAttendee,
} from "../_lib/submit-attendance";

type Step = 1 | 2;

const emptyGuest = {
  firstName: "",
  lastName: "",
  phone: "",
  socialContact: "",
  birthdate: "",
};

export function MobileCellGroupAttendance() {
  const router = useRouter();
  const { people, hydrated: peopleHydrated, addPerson } = usePeople();
  const {
    cellGroups,
    cellGroupMembers,
    hydrated,
    isSaving,
    assignCellGroupMember,
    recordCellGroupAttendance,
  } = useGroupsMinistry();
  const [step, setStep] = useState<Step>(1);
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [leaderPersonId, setLeaderPersonId] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [enrollPersonIds, setEnrollPersonIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [guest, setGuest] = useState(emptyGuest);
  const [newAttendees, setNewAttendees] = useState<NewCellGroupAttendee[]>([]);
  const submitInFlight = useRef(false);

  const activeGroups = useMemo(
    () => cellGroups.filter(group => group.status === "active"),
    [cellGroups],
  );
  const selectedGroup = cellGroups.find(group => group.id === groupId);
  const membershipByPersonId = useMemo(
    () => new Map(cellGroupMembers.map(member => [member.personId, member])),
    [cellGroupMembers],
  );
  const peopleById = useMemo(
    () => new Map(people.map(person => [person.id, person])),
    [people],
  );

  useEffect(() => {
    if (!selectedGroup) return;
    const fallbackLeader = cellGroupMembers.find(
      member =>
        member.cellGroupId === selectedGroup.id && member.role === "Leader",
    )?.personId;
    setLeaderPersonId(selectedGroup.leaderPersonId ?? fallbackLeader ?? "");
    setLocation(selectedGroup.location);
    setSelectedPersonIds([]);
    setEnrollPersonIds([]);
    setNewAttendees([]);
  }, [selectedGroup, cellGroupMembers]);

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...people]
      .sort((a, b) => {
        const aMember = membershipByPersonId.get(a.id)?.cellGroupId === groupId;
        const bMember = membershipByPersonId.get(b.id)?.cellGroupId === groupId;
        if (aMember !== bMember) return aMember ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .filter(person =>
        query
          ? [person.name, person.phone, person.socialContact]
              .join(" ")
              .toLowerCase()
              .includes(query)
          : true,
      );
  }, [groupId, membershipByPersonId, people, search]);

  const togglePerson = (personId: string) => {
    const selected = selectedPersonIds.includes(personId);
    setSelectedPersonIds(current =>
      selected ? current.filter(id => id !== personId) : [...current, personId],
    );
    const membership = membershipByPersonId.get(personId);
    if (selected) {
      setEnrollPersonIds(current => current.filter(id => id !== personId));
    } else if (!membership) {
      setEnrollPersonIds(current => [...current, personId]);
    }
  };

  const addNewAttendee = () => {
    if (!guest.firstName.trim() || !guest.lastName.trim()) {
      toast.error("Enter a first and last name");
      return;
    }
    if (!isValidNewCellGroupAttendee(guest)) {
      toast.error("Add a phone number or social media contact");
      return;
    }
    setNewAttendees(current => [
      ...current,
      {
        key: `new-${crypto.randomUUID()}`,
        firstName: guest.firstName.trim(),
        lastName: guest.lastName.trim(),
        phone: guest.phone.trim(),
        socialContact: guest.socialContact.trim(),
        birthdate: guest.birthdate,
      },
    ]);
    setGuest(emptyGuest);
    setShowNewPerson(false);
  };

  const handleSave = async () => {
    if (!selectedGroup || submitInFlight.current) return;
    const leader = peopleById.get(leaderPersonId);
    if (!leader) {
      toast.error("Choose a meeting leader");
      return;
    }
    submitInFlight.current = true;
    try {
      const ok = await submitCellGroupAttendance({
        cellGroupId: selectedGroup.id,
        date,
        leaderPersonId,
        leaderName: leader.name,
        location,
        existingPersonIds: selectedPersonIds,
        enrollExistingPersonIds: enrollPersonIds,
        newAttendees,
        addPerson,
        assignCellGroupMember,
        recordCellGroupAttendance,
      });
      if (!ok) return;
      toast.success("Cell Group attendance recorded", {
        description: `${selectedPersonIds.length + newAttendees.length} at ${selectedGroup.name}`,
      });
      router.push("/mobile");
    } finally {
      submitInFlight.current = false;
    }
  };

  if (!hydrated || !peopleHydrated) {
    return (
      <MobileShell title="Cell Group" backHref="/mobile">
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </MobileShell>
    );
  }

  const attendeeCount = selectedPersonIds.length + newAttendees.length;
  const canContinue = Boolean(
    groupId && date && leaderPersonId && location.trim(),
  );

  return (
    <MobileShell
      title="Cell Group"
      subtitle={`Step ${step} of 2 · ${step === 1 ? "Meeting details" : "Who's here?"}`}
      backHref={step === 1 ? "/mobile" : undefined}
      withActionBarSpacing
      action={
        <div className="flex gap-1.5" aria-label={`Step ${step} of 2`}>
          {[1, 2].map(value => (
            <span
              key={value}
              className={cn(
                "h-1.5 rounded-full",
                value === step
                  ? "w-6 bg-foreground"
                  : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      }
    >
      {step === 1 ? (
        <div className="space-y-5">
          {activeGroups.length === 0 ? (
            <div className="rounded-[20px] bg-card p-10 text-center text-[15px] text-muted-foreground">
              <UsersRound className="mx-auto mb-2 h-6 w-6" />
              Create a Cell Group on desktop before recording attendance.
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Cell Group</Label>
                <Select value={groupId} onValueChange={setGroupId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a Cell Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={event => setDate(event.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Meeting leader</Label>
                <Select
                  value={leaderPersonId}
                  onValueChange={setLeaderPersonId}
                  disabled={!groupId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a leader" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  A substitute applies only to this meeting.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={location}
                    onChange={event => setLocation(event.target.value)}
                    placeholder="Home, campus, or address"
                    className="h-11 pl-9"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="h-[52px] w-full justify-start gap-2 rounded-xl border-0 bg-card text-foreground shadow-none ring-1 ring-black/[0.04] hover:bg-muted dark:ring-white/[0.08]"
            onClick={() => setShowNewPerson(value => !value)}
          >
            <UserRoundPlus className="h-4 w-4" /> Add a new person
          </Button>

          {showNewPerson && (
            <div className="space-y-4 rounded-[20px] bg-card p-4 ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={guest.firstName}
                  onChange={event =>
                    setGuest(current => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                  placeholder="First name"
                />
                <Input
                  value={guest.lastName}
                  onChange={event =>
                    setGuest(current => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                  placeholder="Last name"
                />
              </div>
              <Input
                type="tel"
                value={guest.phone}
                onChange={event =>
                  setGuest(current => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="Phone number"
              />
              <Input
                value={guest.socialContact}
                onChange={event =>
                  setGuest(current => ({
                    ...current,
                    socialContact: event.target.value,
                  }))
                }
                placeholder="Social media name, @handle, or link"
              />
              <div className="space-y-1">
                <Label className="text-xs">Birthday (optional)</Label>
                <Input
                  type="date"
                  value={guest.birthdate}
                  onChange={event =>
                    setGuest(current => ({
                      ...current,
                      birthdate: event.target.value,
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                className="h-[52px] w-full rounded-xl"
                onClick={addNewAttendee}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add to attendance
              </Button>
            </div>
          )}

          {newAttendees.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newAttendees.map(attendee => (
                <span
                  key={attendee.key}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[13px] text-foreground"
                >
                  {attendee.firstName} {attendee.lastName}
                  <button
                    type="button"
                    aria-label={`Remove ${attendee.firstName}`}
                    onClick={() =>
                      setNewAttendees(current =>
                        current.filter(item => item.key !== attendee.key),
                      )
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search people"
              className="h-11 pl-9"
            />
          </div>
          <ul className="overflow-hidden rounded-[20px] bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
            {filteredPeople.map(person => {
              const selected = selectedPersonIds.includes(person.id);
              const membership = membershipByPersonId.get(person.id);
              const isThisGroupMember = membership?.cellGroupId === groupId;
              const belongsElsewhere = Boolean(
                membership && !isThisGroupMember,
              );
              return (
                <li
                  key={person.id}
                  className={cn(
                    "border-b last:border-b-0",
                    selected && "bg-muted/70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => togglePerson(person.id)}
                    className="flex min-h-[64px] w-full items-center gap-3 px-4 text-left transition-colors duration-200 hover:bg-muted/50 active:bg-muted motion-reduce:transition-none"
                  >
                    <Checkbox checked={selected} tabIndex={-1} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-medium">
                        {person.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
                        {isThisGroupMember
                          ? "Cell Group Member"
                          : belongsElsewhere
                            ? "Member of another Cell Group · attends as guest"
                            : person.phone ||
                              person.socialContact ||
                              "Not assigned"}
                      </span>
                    </span>
                  </button>
                  {selected && !membership && (
                    <label className="flex min-h-11 items-center gap-2 border-t bg-muted/30 px-4 text-[13px] text-muted-foreground">
                      <Checkbox
                        checked={enrollPersonIds.includes(person.id)}
                        onCheckedChange={checked =>
                          setEnrollPersonIds(current =>
                            checked
                              ? [...new Set([...current, person.id])]
                              : current.filter(id => id !== person.id),
                          )
                        }
                      />
                      Add as Cell Group member
                    </label>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <MobileActionBar
        hint={step === 2 ? `${attendeeCount} selected` : undefined}
      >
        <div className="flex gap-2">
          {step === 2 && (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setStep(1)}
              disabled={isSaving}
            >
              Back
            </Button>
          )}
          {step === 1 ? (
            <Button
              type="button"
              className="h-12 flex-1 gap-1.5"
              disabled={!canContinue}
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              className="h-12 flex-1 gap-1.5"
              disabled={attendeeCount === 0 || isSaving}
              onClick={() => void handleSave()}
            >
              {isSaving ? (
                "Saving…"
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save attendance
                </>
              )}
            </Button>
          )}
        </div>
      </MobileActionBar>
    </MobileShell>
  );
}
