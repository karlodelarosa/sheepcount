"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AttendanceSelectionStep } from "./attendance-selection-step";
import { AttendanceTimestampStep } from "./attendance-timestamp-step";
import {
  buildSelectedAttendeesFromSelection,
  createGuestKey,
  DEFAULT_SERVICE_START_TIME,
  getToggleTime,
  parseGuestName,
  toNewAttendanceAttendees,
  type ArrivalStatus,
  type GuestName,
  type NewAttendanceAttendee,
  type SelectedAttendee,
  type WorkflowStep,
} from "../_lib/attendance-workflow";

interface PersonOption {
  id: string;
  name: string;
  householdName: string;
}

interface AddAttendeesDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  serviceType: string;
  date: string;
  serviceStartTime?: string;
  existingAttendeeIds: string[];
  people: PersonOption[];
  isSaving?: boolean;
  onAddAttendees: (attendees: NewAttendanceAttendee[]) => Promise<boolean>;
}

const STEP_LABELS: Record<WorkflowStep, string> = {
  1: "Select",
  2: "Times",
  3: "Review",
};

function WorkflowStepper({ currentStep }: { currentStep: WorkflowStep }) {
  const steps: WorkflowStep[] = [1, 2];

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
              currentStep === step
                ? "bg-primary text-primary-foreground"
                : currentStep > step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {step}
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              currentStep === step
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            {STEP_LABELS[step]}
          </span>
          {index < steps.length - 1 && (
            <div className="mx-1 h-px w-6 bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}

export function AddAttendeesDialog({
  children,
  open,
  onOpenChange,
  serviceType,
  date,
  serviceStartTime: sessionServiceStartTime = DEFAULT_SERVICE_START_TIME,
  existingAttendeeIds,
  people,
  isSaving = false,
  onAddAttendees,
}: AddAttendeesDialogProps) {
  const [isOpenLocal, setIsOpenLocal] = useState(false);
  const isControlled =
    typeof open === "boolean" && typeof onOpenChange === "function";
  const isOpen = isControlled ? open : isOpenLocal;
  const setIsOpen = isControlled ? onOpenChange! : setIsOpenLocal;

  const [step, setStep] = useState<WorkflowStep>(1);
  const [serviceStartTime, setServiceStartTime] = useState(
    sessionServiceStartTime,
  );
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [guestNames, setGuestNames] = useState<Map<string, GuestName>>(
    () => new Map(),
  );
  const [guestInput, setGuestInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendees, setAttendees] = useState<SelectedAttendee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlight = useRef(false);

  const existingIds = useMemo(
    () => new Set(existingAttendeeIds),
    [existingAttendeeIds],
  );

  const availablePeople = useMemo(
    () => people.filter((person) => !existingIds.has(person.id)),
    [people, existingIds],
  );

  const peopleById = useMemo(
    () =>
      new Map(
        availablePeople.map((person) => [
          person.id,
          {
            id: person.id,
            name: person.name,
            householdName: person.householdName,
          },
        ]),
      ),
    [availablePeople],
  );

  const resetWorkflow = () => {
    setStep(1);
    setSelectedKeys([]);
    setGuestNames(new Map());
    setGuestInput("");
    setSearchTerm("");
    setAttendees([]);
    setServiceStartTime(sessionServiceStartTime);
  };

  useEffect(() => {
    if (!isOpen) {
      resetWorkflow();
      return;
    }

    setServiceStartTime(sessionServiceStartTime);
  }, [isOpen, sessionServiceStartTime]);

  const togglePerson = (personId: string) => {
    setSelectedKeys((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId],
    );
  };

  const handleAddGuest = () => {
    const parsed = parseGuestName(guestInput);
    if (!parsed) return;

    const guestKey = createGuestKey();
    setGuestNames((prev) => {
      const next = new Map(prev);
      next.set(guestKey, parsed);
      return next;
    });
    setSelectedKeys((prev) => [...prev, guestKey]);
    setGuestInput("");
  };

  const handleRemoveGuest = (guestKey: string) => {
    setSelectedKeys((prev) => prev.filter((key) => key !== guestKey));
    setGuestNames((prev) => {
      const next = new Map(prev);
      next.delete(guestKey);
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedKeys([]);
    setGuestNames(new Map());
  };

  const goToTimestampStep = () => {
    const existingTimes = new Map(
      attendees.map((attendee) => [attendee.key, attendee.timeOfArrival]),
    );
    const nextAttendees = buildSelectedAttendeesFromSelection(
      selectedKeys,
      peopleById,
      guestNames,
      serviceStartTime,
    ).map((attendee) => ({
      ...attendee,
      timeOfArrival: existingTimes.get(attendee.key) ?? attendee.timeOfArrival,
    }));
    setAttendees(nextAttendees);
    setStep(2);
  };

  const updateArrivalTime = (key: string, timeOfArrival: string) => {
    setAttendees((prev) =>
      prev.map((attendee) =>
        attendee.key === key ? { ...attendee, timeOfArrival } : attendee,
      ),
    );
  };

  const applyToggleToAll = (toggle: ArrivalStatus) => {
    const time = getToggleTime(serviceStartTime, toggle);
    setAttendees((prev) =>
      prev.map((attendee) => ({ ...attendee, timeOfArrival: time })),
    );
  };

  const handleSubmit = async () => {
    if (attendees.length === 0 || submitInFlight.current) return;

    submitInFlight.current = true;
    setIsSubmitting(true);
    try {
      const ok = await onAddAttendees(toNewAttendanceAttendees(attendees));
      if (!ok) return;

      resetWorkflow();
      setIsOpen(false);
    } finally {
      submitInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isBusy = isSaving || isSubmitting;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const canProceedFromStep1 = selectedKeys.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}

      <DialogContent
        className={cn(
          step === 1 ? "sm:max-w-xl" : "sm:max-w-4xl",
          "max-h-[90vh] overflow-y-auto",
        )}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Attendees
          </DialogTitle>
          <DialogDescription>
            {step === 1 &&
              `Add people to ${serviceType} on ${formattedDate}. Already recorded attendees are hidden.`}
            {step === 2 && "Set arrival times for the new attendees."}
          </DialogDescription>
          <WorkflowStepper currentStep={step} />
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div>
            <Label>Service start time</Label>
            <Input
              type="time"
              value={serviceStartTime}
              onChange={(e) => setServiceStartTime(e.target.value)}
              disabled={step === 2}
            />
          </div>

          {step === 1 && (
            <AttendanceSelectionStep
              people={availablePeople}
              selectedKeys={selectedKeys}
              guestNames={guestNames}
              guestInput={guestInput}
              searchTerm={searchTerm}
              onGuestInputChange={setGuestInput}
              onAddGuest={handleAddGuest}
              onSearchTermChange={setSearchTerm}
              onTogglePerson={togglePerson}
              onRemoveGuest={handleRemoveGuest}
              onClearSelection={handleClearSelection}
            />
          )}

          {step === 2 && (
            <AttendanceTimestampStep
              attendees={attendees}
              serviceStartTime={serviceStartTime}
              onUpdateArrivalTime={updateArrivalTime}
              onApplyToggleToAll={applyToggleToAll}
            />
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              disabled={isBusy}
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {step === 1 && (
            <Button
              type="button"
              className="gap-1.5"
              disabled={!canProceedFromStep1}
              onClick={goToTimestampStep}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {step === 2 && (
            <Button
              type="button"
              className="gap-1.5"
              disabled={attendees.length === 0 || isBusy}
              onClick={() => void handleSubmit()}
            >
              {isBusy ? (
                "Saving…"
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Add {attendees.length} attendee
                  {attendees.length === 1 ? "" : "s"}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
