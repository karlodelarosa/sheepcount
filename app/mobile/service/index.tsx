"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Check, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { usePeople } from "@/lib/people";
import { useServiceAttendance } from "@/lib/service-attendance";
import {
  buildSelectedAttendeesFromSelection,
  classifyArrival,
  computeOverviewStats,
  createGuestKey,
  DEFAULT_SERVICE_START_TIME,
  formatArrivalStatusLabel,
  formatGuestName,
  getToggleTime,
  parseGuestName,
  toNewAttendanceAttendees,
  type ArrivalStatus,
  type GuestName,
  type SelectedAttendee,
} from "@/app/(protected)/service-attendance/_lib/attendance-workflow";
import { MobileShell } from "../_components/mobile-shell";
import { MobileActionBar } from "../_components/mobile-action-bar";
import { MobilePersonList } from "../_components/mobile-person-list";
import { submitServiceAttendance } from "../_lib/submit-attendance";

type Step = 1 | 2 | 3;

const STEP_TITLES: Record<Step, string> = {
  1: "Service details",
  2: "Who's here?",
  3: "Arrival times",
};

function StepDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1.5">
      {([1, 2, 3] as Step[]).map(value => (
        <span
          key={value}
          className={cn(
            "h-1.5 rounded-full transition-all",
            value === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

export function MobileServiceAttendance() {
  const router = useRouter();
  const { people, hydrated: peopleHydrated, addPerson } = usePeople();
  const {
    serviceTypes,
    primarySundayServiceId,
    hydrated,
    isSaving,
    recordAttendance,
  } = useServiceAttendance();

  const [step, setStep] = useState<Step>(1);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [serviceStartTime, setServiceStartTime] = useState(
    DEFAULT_SERVICE_START_TIME,
  );
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [guestNames, setGuestNames] = useState<Map<string, GuestName>>(
    () => new Map(),
  );
  const [guestInput, setGuestInput] = useState("");
  const [attendees, setAttendees] = useState<SelectedAttendee[]>([]);
  const submitInFlight = useRef(false);

  const loading = !hydrated || !peopleHydrated;

  useEffect(() => {
    if (selectedServiceId || !serviceTypes.length) return;
    setSelectedServiceId(primarySundayServiceId ?? serviceTypes[0].id);
  }, [serviceTypes, primarySundayServiceId, selectedServiceId]);

  const peopleById = useMemo(
    () =>
      new Map(
        people.map(person => [
          person.id,
          {
            id: person.id,
            name: person.name,
            householdName: person.householdName,
          },
        ]),
      ),
    [people],
  );

  const guestKeys = useMemo(
    () => selectedKeys.filter(key => key.startsWith("guest-")),
    [selectedKeys],
  );
  const memberKeys = useMemo(
    () => selectedKeys.filter(key => !key.startsWith("guest-")),
    [selectedKeys],
  );

  const overviewStats = useMemo(
    () => computeOverviewStats(attendees, serviceStartTime),
    [attendees, serviceStartTime],
  );

  const selectedServiceName =
    serviceTypes.find(service => service.id === selectedServiceId)?.name ??
    "Service";

  const toggleMember = (personId: string) => {
    setSelectedKeys(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId],
    );
  };

  const addGuest = () => {
    const parsed = parseGuestName(guestInput);
    if (!parsed) return;
    const key = createGuestKey();
    setGuestNames(prev => new Map(prev).set(key, parsed));
    setSelectedKeys(prev => [...prev, key]);
    setGuestInput("");
  };

  const removeGuest = (key: string) => {
    setSelectedKeys(prev => prev.filter(id => id !== key));
    setGuestNames(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  const goToTimes = () => {
    const existingTimes = new Map(
      attendees.map(attendee => [attendee.key, attendee.timeOfArrival]),
    );
    const next = buildSelectedAttendeesFromSelection(
      selectedKeys,
      peopleById,
      guestNames,
      serviceStartTime,
    ).map(attendee => ({
      ...attendee,
      timeOfArrival: existingTimes.get(attendee.key) ?? attendee.timeOfArrival,
    }));
    setAttendees(next);
    setStep(3);
  };

  const updateArrivalTime = (key: string, timeOfArrival: string) => {
    setAttendees(prev =>
      prev.map(attendee =>
        attendee.key === key ? { ...attendee, timeOfArrival } : attendee,
      ),
    );
  };

  const applyToggleToAll = (toggle: ArrivalStatus) => {
    const time = getToggleTime(serviceStartTime, toggle);
    setAttendees(prev =>
      prev.map(attendee => ({ ...attendee, timeOfArrival: time })),
    );
  };

  const handleSubmit = async () => {
    if (
      !selectedServiceId ||
      !attendanceDate ||
      attendees.length === 0 ||
      submitInFlight.current
    ) {
      return;
    }

    submitInFlight.current = true;
    try {
      const sessionId = await submitServiceAttendance({
        serviceId: selectedServiceId,
        date: attendanceDate,
        attendees: toNewAttendanceAttendees(attendees),
        addPerson,
        recordAttendance,
      });

      if (!sessionId) {
        toast.error("Could not save attendance", {
          description: "Please try again.",
        });
        return;
      }

      toast.success("Attendance recorded", {
        description: `${attendees.length} at ${selectedServiceName}`,
      });
      router.push("/mobile");
    } finally {
      submitInFlight.current = false;
    }
  };

  const canContinueDetails = Boolean(
    selectedServiceId && attendanceDate && serviceStartTime,
  );

  if (loading) {
    return (
      <MobileShell title="Service Attendance" backHref="/mobile">
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell
      title="Service Attendance"
      subtitle={`Step ${step} of 3 · ${STEP_TITLES[step]}`}
      backHref={step === 1 ? "/mobile" : undefined}
      action={<StepDots step={step} />}
      withActionBarSpacing
    >
      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Service</Label>
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
              disabled={!serviceTypes.length}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={attendanceDate}
              onChange={event => setAttendanceDate(event.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Service start time</Label>
            <Input
              type="time"
              value={serviceStartTime}
              onChange={event => setServiceStartTime(event.target.value)}
              className="h-11 tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              Used as the baseline for early / on-time / late.
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Add a guest</Label>
            <div className="flex gap-2">
              <Input
                value={guestInput}
                onChange={event => setGuestInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addGuest();
                  }
                }}
                placeholder="First and last name"
                className="h-11"
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0 gap-1.5"
                onClick={addGuest}
                disabled={!guestInput.trim()}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            {guestKeys.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {guestKeys.map(key => {
                  const guest = guestNames.get(key);
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs"
                    >
                      {guest ? formatGuestName(guest) : "Guest"}
                      <button
                        type="button"
                        aria-label="Remove guest"
                        onClick={() => removeGuest(key)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <MobilePersonList
              people={people.map(person => ({
                id: person.id,
                name: person.name,
                householdName: person.householdName,
              }))}
              selectedIds={memberKeys}
              onToggle={toggleMember}
              onClear={() =>
                setSelectedKeys(prev =>
                  prev.filter(key => key.startsWith("guest-")),
                )
              }
              emptyLabel="No members match your search"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Baseline{" "}
              <span className="font-medium tabular-nums">
                {serviceStartTime}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {overviewStats.early}E · {overviewStats.onTime}O ·{" "}
              {overviewStats.late}L
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Set all:</span>
            {(["early", "on-time", "late"] as ArrivalStatus[]).map(toggle => (
              <Button
                key={toggle}
                type="button"
                size="sm"
                variant="outline"
                className="h-8 flex-1 px-2 text-xs"
                onClick={() => applyToggleToAll(toggle)}
              >
                {formatArrivalStatusLabel(toggle)}
              </Button>
            ))}
          </div>

          <ul className="space-y-2">
            {attendees.map(attendee => {
              const arrivalStatus = classifyArrival(
                attendee.timeOfArrival,
                serviceStartTime,
              );
              return (
                <li
                  key={attendee.key}
                  className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {attendee.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {attendee.status === "new"
                        ? "New guest"
                        : attendee.householdName}
                    </p>
                  </div>
                  {arrivalStatus && (
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        arrivalStatus === "early" && "text-emerald-600",
                        arrivalStatus === "on-time" && "text-blue-600",
                        arrivalStatus === "late" && "text-amber-600",
                      )}
                    >
                      {formatArrivalStatusLabel(arrivalStatus)}
                    </span>
                  )}
                  <Input
                    type="time"
                    value={attendee.timeOfArrival}
                    onChange={event =>
                      updateArrivalTime(attendee.key, event.target.value)
                    }
                    className="h-9 w-[6.5rem] shrink-0 tabular-nums"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <MobileActionBar
        hint={
          step === 2
            ? `${selectedKeys.length} selected`
            : step === 3
              ? `${attendees.length} attendee${attendees.length === 1 ? "" : "s"} · ${selectedServiceName}`
              : undefined
        }
      >
        <div className="flex gap-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setStep(prev => (prev - 1) as Step)}
              disabled={isSaving}
            >
              Back
            </Button>
          )}

          {step === 1 && (
            <Button
              type="button"
              className="h-12 flex-1 gap-1.5"
              disabled={!canContinueDetails}
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {step === 2 && (
            <Button
              type="button"
              className="h-12 flex-1 gap-1.5"
              disabled={selectedKeys.length === 0}
              onClick={goToTimes}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {step === 3 && (
            <Button
              type="button"
              className="h-12 flex-1 gap-1.5"
              disabled={attendees.length === 0 || isSaving}
              onClick={() => void handleSubmit()}
            >
              {isSaving ? (
                "Saving…"
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          )}
        </div>
      </MobileActionBar>
    </MobileShell>
  );
}
