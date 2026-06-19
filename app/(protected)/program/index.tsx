"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Calendar, Users, UserPlus, ChevronRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/lib/events";
import { usePeople } from "@/lib/people";
import { AddProgramDialog } from "./_components/add-program-dialog";
import { RegisterParticipantDialog } from "./_components/register-participants-dialog";

export function ProgramsView() {
  const router = useRouter();
  const { events, registrations, hydrated, getEventRegistrations } = useEvents();
  const { people } = usePeople();

  const DualModePrimaryButtonClass =
    "rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40 text-white";
  const DualModeHeaderCardClass =
    "border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50";
  const DualModeContentCardClass =
    "border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer group dark:border-zinc-700/60 dark:bg-zinc-800/70";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
  const DualModeIconColor = "h-5 w-5 text-slate-600 dark:text-zinc-400";
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";

  const typeColors: Record<string, string> = {
    VBS: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    Camp: "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
    Retreat: "from-pink-500 to-pink-700 dark:from-rose-600 dark:to-pink-800",
    Conference: "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
  };

  const publishedEvents = events.filter(e => e.status !== "cancelled");

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/30">
        <Info className="text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-200">
          Programs & Events
        </AlertTitle>
        <AlertDescription className="text-blue-800/90 dark:text-blue-300/90">
          Manage VBS, camps, retreats, and conferences. Click an event to register
          participants, track attendance, and update event details.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Total Events</CardTitle>
            <Calendar className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{publishedEvents.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">Church calendar events</p>
          </CardContent>
        </Card>

        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Registrations</CardTitle>
            <Users className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{registrations.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">Total sign-ups</p>
          </CardContent>
        </Card>

        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Upcoming</CardTitle>
            <Calendar className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">
              {
                publishedEvents.filter(
                  e => new Date(e.startDate) >= new Date(new Date().toDateString()),
                ).length
              }
            </div>
            <p className="text-slate-600 dark:text-zinc-400">Events ahead</p>
          </CardContent>
        </Card>
      </div>

      <Card className={DualModeHeaderCardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Programs & Events</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                VBS, camps, retreats, and conferences
              </CardDescription>
            </div>
            <AddProgramDialog>
              <Button className={DualModePrimaryButtonClass}>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </AddProgramDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {publishedEvents.map(event => {
              const eventRegs = getEventRegistrations(event.id);
              const colorClass = typeColors[event.type] || typeColors.VBS;

              return (
                <Card
                  key={event.id}
                  className={DualModeContentCardClass}
                  onClick={() => router.push(`/program/${event.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}
                      >
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                          {event.type}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <CardTitle className="text-slate-900 dark:text-white">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-zinc-400">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-slate-900 dark:text-white">
                        {new Date(event.startDate).toLocaleDateString()}
                        {event.endDate !== event.startDate &&
                          ` – ${new Date(event.endDate).toLocaleDateString()}`}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                          <span className="text-slate-600 dark:text-zinc-400">
                            {eventRegs.length} registered
                          </span>
                        </div>
                        <RegisterParticipantDialog event={event}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={e => e.stopPropagation()}
                            className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Register
                          </Button>
                        </RegisterParticipantDialog>
                      </div>
                    </div>

                    {eventRegs.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                        <p className="text-slate-500 dark:text-zinc-500 mb-2">Participants</p>
                        <div className="space-y-2">
                          {eventRegs.slice(0, 3).map(reg => {
                            const person = people.find(p => p.id === reg.personId);
                            return (
                              <div key={reg.id} className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}
                                >
                                  <span className="text-white text-sm">
                                    {person?.name.charAt(0) ?? "?"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-900 dark:text-white">
                                    {person?.name ?? "Unknown"}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-zinc-500 ml-2">
                                    {reg.roleInEvent}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {eventRegs.length > 3 && (
                            <p className="text-slate-500 dark:text-zinc-500">
                              +{eventRegs.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {publishedEvents.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-zinc-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
              <p>No events yet. Create your first VBS, camp, or retreat.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
