"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonSelect } from "@/components/person-select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Info,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from "lucide-react";
import { usePeople } from "@/lib/people";
import { useEvents } from "@/lib/events";
import type {
  AttendanceStatus,
  ChurchEventStatus,
  ChurchEventType,
  EventRole,
} from "@/lib/supabase/events";

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
}

const statusLabels: Record<ChurchEventStatus, string> = {
  draft: "Draft",
  published: "Published",
  completed: "Completed",
  cancelled: "Cancelled",
};

const attendanceLabels: Record<AttendanceStatus, string> = {
  registered: "Registered",
  checked_in: "Checked In",
  attended: "Attended",
  no_show: "No Show",
  cancelled: "Cancelled",
};

export function EventDetails({ eventId, onBack }: EventDetailsProps) {
  const { people } = usePeople();
  const {
    events,
    hydrated,
    isSaving,
    registerPersonForEvent,
    removeRegistration,
    updateRegistration,
    updateEvent,
    getEventRegistrations,
  } = useEvents();

  const [activeTab, setActiveTab] = useState("overview");
  const [personId, setPersonId] = useState("");
  const [parentPersonId, setParentPersonId] = useState("");
  const [roleInEvent, setRoleInEvent] = useState<EventRole>("Attendee");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<ChurchEventType>("VBS");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStatus, setEditStatus] = useState<ChurchEventStatus>("published");
  const [editInitialized, setEditInitialized] = useState(false);

  const event = events.find(e => e.id === eventId);
  const registrations = useMemo(
    () => getEventRegistrations(eventId),
    [getEventRegistrations, eventId],
  );

  const registrationRows = useMemo(
    () =>
      registrations.map(reg => ({
        ...reg,
        person: people.find(p => p.id === reg.personId),
        parent: reg.parentPersonId
          ? people.find(p => p.id === reg.parentPersonId)
          : undefined,
      })),
    [registrations, people],
  );

  const registeredPersonIds = useMemo(
    () => new Set(registrations.map(r => r.personId)),
    [registrations],
  );

  const availablePeople = useMemo(
    () => people.filter(p => !registeredPersonIds.has(p.id)),
    [people, registeredPersonIds],
  );

  const selectedPerson = people.find(p => p.id === personId);
  const isChildRegistration = selectedPerson?.role === "Child";
  const parentCandidates = people.filter(
    p => p.role === "Head" || p.role === "Spouse" || p.role === "Single",
  );

  useEffect(() => {
    if (!event || editInitialized) return;
    setEditTitle(event.title);
    setEditDescription(event.description);
    setEditType(event.type);
    setEditStartDate(event.startDate);
    setEditEndDate(event.endDate);
    setEditStatus(event.status);
    setEditInitialized(true);
  }, [event, editInitialized]);

  const handleRegister = async () => {
    if (!personId) return;
    if (isChildRegistration && !parentPersonId) return;

    const result = await registerPersonForEvent({
      eventId,
      personId,
      parentPersonId: isChildRegistration ? parentPersonId : undefined,
      roleInEvent,
      medicalNotes: isChildRegistration ? medicalNotes : undefined,
      dietaryRestrictions: isChildRegistration ? dietaryRestrictions : undefined,
    });

    if (result) {
      setPersonId("");
      setParentPersonId("");
      setRoleInEvent("Attendee");
      setMedicalNotes("");
      setDietaryRestrictions("");
    }
  };

  const handleSaveEvent = async () => {
    await updateEvent({
      eventId,
      title: editTitle,
      description: editDescription,
      type: editType,
      startDate: editStartDate,
      endDate: editEndDate,
      status: editStatus,
    });
  };

  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";
  const tabTriggerClass =
    "text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-white";

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading event...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-slate-900 dark:text-white">Event Not Found</h1>
        </div>
      </div>
    );
  }

  const dateRange =
    event.endDate !== event.startDate
      ? `${new Date(event.startDate).toLocaleDateString()} – ${new Date(event.endDate).toLocaleDateString()}`
      : new Date(event.startDate).toLocaleDateString();

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/30">
        <Info className="text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-200">
          Event Management
        </AlertTitle>
        <AlertDescription className="text-blue-800/90 dark:text-blue-300/90">
          Manage this church program or event — register participants, assign roles,
          track attendance, and update event details. Child registrations can include
          parent/guardian info and medical notes.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-zinc-700">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-slate-900 dark:text-white">{event.title}</h1>
              <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                {event.type}
              </Badge>
              <Badge
                variant="secondary"
                className={`${DualModeSecondaryBadgeClass} ${
                  event.status === "cancelled"
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : event.status === "completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : ""
                }`}
              >
                {statusLabels[event.status]}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-zinc-400">
              {event.description || "Church event"}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {dateRange} · {registrationRows.length} registered
            </p>
          </div>
        </div>
        <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
          <Users className="w-3 h-3 mr-1 inline" />
          {registrationRows.filter(r => r.attendanceStatus === "attended").length}{" "}
          attended
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Register Participant
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Add a person or child to this event.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Participant</Label>
              <PersonSelect
                people={availablePeople}
                value={personId}
                onValueChange={setPersonId}
                placeholder="Select person"
                triggerClassName={DualModeInputClass}
                formatLabel={person =>
                  `${person.name}${person.role === "Child" ? " (Child)" : ""}`
                }
              />
            </div>

            {isChildRegistration && (
              <>
                <div className="space-y-2">
                  <Label>Parent / Guardian *</Label>
                  <PersonSelect
                    people={parentCandidates}
                    value={parentPersonId}
                    onValueChange={setParentPersonId}
                    placeholder="Select parent profile"
                    triggerClassName={DualModeInputClass}
                    formatLabel={person => person.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medical Notes</Label>
                  <Textarea
                    value={medicalNotes}
                    onChange={e => setMedicalNotes(e.target.value)}
                    placeholder="Allergies, medications, etc."
                    className={DualModeInputClass}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dietary Restrictions</Label>
                  <Input
                    value={dietaryRestrictions}
                    onChange={e => setDietaryRestrictions(e.target.value)}
                    placeholder="e.g., nut allergy, vegetarian"
                    className={DualModeInputClass}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Role in Event</Label>
              <Select
                value={roleInEvent}
                onValueChange={v => setRoleInEvent(v as EventRole)}
              >
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Attendee">Attendee</SelectItem>
                  <SelectItem value="Volunteer">Volunteer</SelectItem>
                  <SelectItem value="Core_Leader">Core Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => void handleRegister()}
              disabled={
                !personId ||
                isSaving ||
                (isChildRegistration && !parentPersonId)
              }
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              Register
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-slate-100/80 dark:bg-zinc-800/80">
              <TabsTrigger value="overview" className={tabTriggerClass}>
                <LayoutDashboard className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="attendance" className={tabTriggerClass}>
                <ClipboardList className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="manage" className={tabTriggerClass}>
                <Settings className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Manage Event
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Registrations
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    Everyone registered for this event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {registrationRows.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
                      No registrations yet. Register a participant to get started.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {registrationRows.map(row => (
                        <div
                          key={row.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                            >
                              <span className="text-white text-sm">
                                {row.person?.name.charAt(0) ?? "?"}
                              </span>
                            </div>
                            <div>
                              <p className="text-slate-900 dark:text-white font-medium">
                                {row.person?.name ?? "Unknown"}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-zinc-500">
                                {row.roleInEvent.replace("_", " ")} ·{" "}
                                {attendanceLabels[row.attendanceStatus]}
                                {row.parent && ` · Parent: ${row.parent.name}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => void removeRegistration(row.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Attendance Tracking
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    Update attendance status and roles for each registration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {registrationRows.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
                      No registrations to track yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {registrationRows.map(row => (
                        <div
                          key={row.id}
                          className="p-4 rounded-lg border border-slate-200 dark:border-zinc-700 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                            >
                              <span className="text-white text-sm">
                                {row.person?.name.charAt(0) ?? "?"}
                              </span>
                            </div>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {row.person?.name ?? "Unknown"}
                            </p>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs">Attendance</Label>
                              <Select
                                value={row.attendanceStatus}
                                onValueChange={v =>
                                  void updateRegistration({
                                    registrationId: row.id,
                                    attendanceStatus: v as AttendanceStatus,
                                  })
                                }
                              >
                                <SelectTrigger className={DualModeInputClass}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(
                                    Object.keys(attendanceLabels) as AttendanceStatus[]
                                  ).map(status => (
                                    <SelectItem key={status} value={status}>
                                      {attendanceLabels[status]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Role</Label>
                              <Select
                                value={row.roleInEvent}
                                onValueChange={v =>
                                  void updateRegistration({
                                    registrationId: row.id,
                                    roleInEvent: v as EventRole,
                                  })
                                }
                              >
                                <SelectTrigger className={DualModeInputClass}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Attendee">Attendee</SelectItem>
                                  <SelectItem value="Volunteer">Volunteer</SelectItem>
                                  <SelectItem value="Core_Leader">Core Leader</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Event Details
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    Update event information and publication status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className={DualModeInputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      className={DualModeInputClass}
                      rows={3}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={editType}
                        onValueChange={v => setEditType(v as ChurchEventType)}
                      >
                        <SelectTrigger className={DualModeInputClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VBS">VBS</SelectItem>
                          <SelectItem value="Camp">Camp</SelectItem>
                          <SelectItem value="Retreat">Retreat</SelectItem>
                          <SelectItem value="Conference">Conference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={editStatus}
                        onValueChange={v => setEditStatus(v as ChurchEventStatus)}
                      >
                        <SelectTrigger className={DualModeInputClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            Object.keys(statusLabels) as ChurchEventStatus[]
                          ).map(status => (
                            <SelectItem key={status} value={status}>
                              {statusLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={editStartDate}
                        onChange={e => setEditStartDate(e.target.value)}
                        className={DualModeInputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={editEndDate}
                        onChange={e => setEditEndDate(e.target.value)}
                        className={DualModeInputClass}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => void handleSaveEvent()}
                    disabled={!editTitle.trim() || isSaving}
                    className={DualModePrimaryButtonClass}
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
