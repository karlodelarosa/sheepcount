"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, UserPlus, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/lib/events";
import { usePeople } from "@/lib/people";
import { AddProgramDialog } from "./_components/add-program-dialog";
import { RegisterParticipantDialog } from "./_components/register-participants-dialog";
import { OverviewStatCard } from "@/components/overview-stat-card";

import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import {
  CollectionToolbar,
  CollectionLoading,
} from "@/components/ui/directory-page-header/collection-toolbar";
import { useState } from "react";
export function ProgramsView() {
  const router = useRouter();
  const { events, registrations, hydrated, getEventRegistrations } =
    useEvents();
  const { people } = usePeople();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [view, setView] = useState<"cards" | "list">("cards");
  const DualModeContentCardClass =
    "min-w-0 rounded-2xl border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md flex h-full flex-col";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-muted text-muted-foreground";
  const DualModeMemberAvatarClass =
    "from-[var(--accent-color)] to-[var(--accent-color-muted)]";
  const publishedEvents = events.filter(e => e.status !== "cancelled");

  const filteredEvents = publishedEvents.filter(
    event =>
      (type === "all" || event.type === type) &&
      `${event.title} ${event.description}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  if (!hydrated) return <CollectionLoading />;

  return (
    <div className="space-y-6">
      <DirectoryTitleCard
        title="Programs & Events"
        description="VBS, camps, retreats, and conferences"
        icon={Calendar}
        actionContent={
          <AddProgramDialog>
            <Button className="min-h-11 gap-2 rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]">
              <Plus className="size-4" />
              New Event
            </Button>
          </AddProgramDialog>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <OverviewStatCard
          label="Total Events"
          value={publishedEvents.length}
          hint="Church calendar events"
          icon={Calendar}
          variant="violet"
        />
        <OverviewStatCard
          label="Registrations"
          value={registrations.length}
          hint="Total sign-ups"
          icon={Users}
          variant="blue"
        />
        <OverviewStatCard
          label="Upcoming"
          value={
            publishedEvents.filter(
              e => new Date(e.startDate) >= new Date(new Date().toDateString()),
            ).length
          }
          hint="Events ahead"
          icon={Calendar}
          variant="emerald"
        />
      </div>

      <CollectionToolbar
        label="programs"
        search={search}
        onSearch={setSearch}
        filter={type}
        onFilter={setType}
        options={[
          { value: "all", label: "All event types" },
          ...Array.from(new Set(publishedEvents.map(event => event.type))).map(
            value => ({ value, label: value }),
          ),
        ]}
        count={filteredEvents.length}
        view={view}
        onView={setView}
      />
      <div
        className={
          view === "cards"
            ? "grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3"
            : "grid grid-cols-1 gap-5"
        }
      >
        {filteredEvents.map(event => {
          const eventRegs = getEventRegistrations(event.id);

          return (
            <Card key={event.id} className={DualModeContentCardClass}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="size-12 shrink-0 rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)] flex items-center justify-center">
                    <Calendar className="size-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={DualModeSecondaryBadgeClass}
                    >
                      {event.type}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <CardTitle className="break-words text-foreground">
                  <button
                    className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                    onClick={() => router.push(`/program/${event.id}`)}
                  >
                    {event.title}
                  </button>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-zinc-400">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span className="break-words text-foreground">
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
                    <p className="text-slate-500 dark:text-zinc-500 mb-2">
                      Participants
                    </p>
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
                              <span className="break-words text-foreground">
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

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-zinc-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
          <p>
            {publishedEvents.length
              ? "No programs match your filters."
              : "No events yet. Create your first VBS, camp, or retreat."}
          </p>
        </div>
      )}
    </div>
  );
}
