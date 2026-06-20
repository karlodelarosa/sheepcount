"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AttendanceSelectionStep } from "./attendance-selection-step";
import { AttendanceTimestampStep } from "./attendance-timestamp-step";
import { AttendanceOverviewStep } from "./attendance-overview-step";
import {
  buildSelectedAttendeesFromSelection,
  computeOverviewStats,
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
  serviceId: string;
  date: string;
  serviceStartTime: string;
  attendees: NewAttendanceAttendee[];
}

interface RecordAttendanceDialogProps {
  children?: React.ReactNode;
  serviceTypes: ServiceType[];
  people: Person[];
  onRecordAttendance: (
    record: NewAttendanceRecord,
  ) => void | Promise<void> | Promise<boolean>;
  defaultServiceId?: string;
  isSaving?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const STEP_LABELS: Record<WorkflowStep, string> = {
  1: "Select",
  2: "Times",
  3: "Review",
};

function WorkflowStepper({ currentStep }: { currentStep: WorkflowStep }) {
  const steps: WorkflowStep[] = [1, 2, 3];

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

export function RecordAttendanceDialog({
  children,
  serviceTypes,
  people,
  onRecordAttendance,
  defaultServiceId,
  isSaving = false,
  open,
  onOpenChange,
}: RecordAttendanceDialogProps) {
  const [isOpenLocal, setIsOpenLocal] = useState<boolean>(false);
  const isControlled =
    typeof open === "boolean" && typeof onOpenChange === "function";
  const isOpen = isControlled ? open : isOpenLocal;
  const setIsOpen = isControlled ? onOpenChange! : setIsOpenLocal;

  const [step, setStep] = useState<WorkflowStep>(1);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [serviceStartTime, setServiceStartTime] = useState(
    DEFAULT_SERVICE_START_TIME,
  );
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [guestNames, setGuestNames] = useState<Map<string, GuestName>>(
    () => new Map(),
  );
  const [guestInput, setGuestInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendees, setAttendees] = useState<SelectedAttendee[]>([]);

  const resetWorkflow = () => {
    setStep(1);
    setSelectedKeys([]);
    setGuestNames(new Map());
    setGuestInput("");
    setSearchTerm("");
    setAttendees([]);
    setServiceStartTime(DEFAULT_SERVICE_START_TIME);
  };

  useEffect(() => {
    if (!isOpen) {
      resetWorkflow();
      return;
    }

    if (!serviceTypes?.length) return;

    const preferred =
      defaultServiceId && serviceTypes.some((s) => s.id === defaultServiceId)
        ? defaultServiceId
        : serviceTypes[0].id;

    setSelectedServiceId(preferred);
  }, [serviceTypes, defaultServiceId, isOpen]);

  const peopleById = useMemo(
    () =>
      new Map(
        people.map((person) => [
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

  const selectedServiceName =
    serviceTypes.find((service) => service.id === selectedServiceId)?.name ??
    "Service";

  const overviewStats = useMemo(
    () => computeOverviewStats(attendees, serviceStartTime),
    [attendees, serviceStartTime],
  );

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
    if (!selectedServiceId || !attendanceDate || attendees.length === 0) {
      return;
    }

    const result = await onRecordAttendance({
      serviceId: selectedServiceId,
      date: attendanceDate,
      serviceStartTime,
      attendees: toNewAttendanceAttendees(attendees),
    });

    if (result === false) return;

    resetWorkflow();
    setIsOpen(false);
  };

  const canProceedFromStep1 =
    Boolean(selectedServiceId && attendanceDate && selectedKeys.length > 0);

  const dialogWidth =
    step === 1 ? "sm:max-w-xl" : "sm:max-w-4xl";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}

      <DialogContent
        className={cn(
          dialogWidth,
          "max-h-[90vh] overflow-y-auto",
        )}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle>Record Attendance</DialogTitle>
          <DialogDescription>
            {step === 1 && "Select members and add any guests."}
            {step === 2 && "Set or adjust arrival times for each person."}
            {step === 3 && "Review headcount before saving."}
          </DialogDescription>
          <WorkflowStepper currentStep={step} />
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Service</Label>
              <Select
                value={selectedServiceId}
                onValueChange={setSelectedServiceId}
                disabled={!serviceTypes?.length || step > 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes?.length ? (
                    serviceTypes.map((svc) => (
                      <SelectItem key={svc.id} value={svc.id}>
                        <div className="flex items-center gap-2">
                          {svc.name.includes("Worship") ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <Calendar className="h-4 w-4" />
                          )}
                          {svc.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No service types available
                    </div>
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
                disabled={step > 1}
              />
            </div>

            <div>
              <Label>Service start time</Label>
              <Input
                type="time"
                value={serviceStartTime}
                onChange={(e) => setServiceStartTime(e.target.value)}
                disabled={step === 3}
              />
            </div>
          </div>

          {step === 1 && (
            <AttendanceSelectionStep
              people={people}
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

          {step === 3 && (
            <AttendanceOverviewStep
              attendees={attendees}
              serviceStartTime={serviceStartTime}
              stats={overviewStats}
              serviceName={selectedServiceName}
              attendanceDate={attendanceDate}
            />
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              disabled={isSaving}
              onClick={() => setStep((prev) => (prev - 1) as WorkflowStep)}
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
              disabled={attendees.length === 0}
              onClick={() => setStep(3)}
            >
              Review
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {step === 3 && (
            <Button
              type="button"
              className="gap-1.5"
              disabled={attendees.length === 0 || isSaving}
              onClick={() => void handleSubmit()}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
