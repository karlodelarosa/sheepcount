"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, UserPlus, Clock } from "lucide-react";
// Import Mock Data
import { mockPrograms as initialPrograms, mockProgramParticipants as initialParticipants, mockPeople } from "@/components/mock-data";
// Import New Components
import { AddProgramDialog } from "./_components/add-program-dialog";
import { RegisterParticipantDialog } from "./_components/register-participants-dialog";

// Define mock types from data (replace with actual imports if possible)
type Program = typeof initialPrograms[0] & { coordinatorName?: string };
type Participant = typeof initialParticipants[0];
type ProgramFormData = any;

export function ProgramsView() {
  
  // Use state to allow adding/modifying data through dialogs
  const [programs, setPrograms] = useState<Program[]>(initialPrograms.map(p => {
    // Inject coordinator name for display convenience
    const coordinator = mockPeople.find(person => person.id === p.coordinator);
    return { ...p, coordinatorName: coordinator?.name || 'Unknown' };
  }));
  const [programParticipants, setProgramParticipants] = useState<Participant[]>(initialParticipants);


  // --- Dual-Mode Class Definitions ---
  const DualModePrimaryButtonClass = "rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40 text-white";
  const DualModeHeaderCardClass = "border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50";
  const DualModeContentCardClass = "border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer dark:border-zinc-700/60 dark:bg-zinc-800/70";
  const DualModeSecondaryBadgeClass = "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
  const DualModeMemberAvatarClass = "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";
  const DualModeIconColor = "h-5 w-5 text-slate-600 dark:text-zinc-400";

  // Dual-mode Colors for Program Icons
  const colorClasses: Record<string, string> = {
    // Light -> Dark
    blue: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    green: "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
    purple: "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
    pink: "from-pink-500 to-pink-700 dark:from-rose-600 dark:to-pink-800",
    orange: "from-orange-500 to-orange-700 dark:from-amber-600 dark:to-orange-800",
    indigo: "from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800",
  };
  // ------------------------------------

  // --- Handlers ---

  const handleAddProgram = (newProgramData: ProgramFormData) => {
    const coordinator = mockPeople.find(p => p.id === newProgramData.coordinator);
    const newProgram: Program = {
      id: Date.now().toString(), // Mock ID
      ...newProgramData,
      coordinatorName: coordinator?.name || 'Unknown',
    };
    setPrograms(prev => [...prev, newProgram]);
  };

  const handleUpdateParticipants = (programId: string, newParticipantIds: string[]) => {
    // 1. Filter out all existing participants for this program
    const otherProgramParticipants = programParticipants.filter(p => p.programId !== programId);
    
    // 2. Create new participant objects based on the new IDs
    const newParticipants: Participant[] = newParticipantIds.map(personId => ({
        id: `${programId}-${personId}`, // Simple unique ID
        programId: programId,
        personId: personId,
        registrationDate: new Date().toISOString(), // Mock date
    }));

    // 3. Update the state
    setProgramParticipants([...otherProgramParticipants, ...newParticipants]);
  };


  // --- Data Calculations ---

  const getParticipants = (programId: string) => {
    const participants = programParticipants.filter(p => p.programId === programId);
    return participants.map(p => ({
      ...p,
      person: mockPeople.find(person => person.id === p.personId)
    }));
  };

  const eventPrograms = programs.filter(p => p.type === "Event");
  const recurringPrograms = programs.filter(p => p.type === "Recurring");

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        
        {/* Total Programs Card */}
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Total Programs</CardTitle>
            <Calendar className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{programs.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">Active programs</p>
          </CardContent>
        </Card>

        {/* Events Card */}
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Events</CardTitle>
            <Clock className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{eventPrograms.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">Special events</p>
          </CardContent>
        </Card>

        {/* Recurring Card */}
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Recurring</CardTitle>
            <Calendar className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{recurringPrograms.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">Ongoing programs</p>
          </CardContent>
        </Card>

        {/* Participants Card */}
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Participants</CardTitle>
            <Users className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{programParticipants.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">Total registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Events */}
      <Card className={DualModeHeaderCardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Special Events</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">One-time events and activities</CardDescription>
            </div>
            {/* === INTEGRATION: ADD PROGRAM DIALOG FOR EVENT === */}
            <AddProgramDialog onAddProgram={handleAddProgram} initialType="Event">
              <Button className={DualModePrimaryButtonClass}>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </AddProgramDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {eventPrograms.map((program) => {
              const participants = getParticipants(program.id);
              const participantIds = participants.map(p => p.person?.id || '').filter(Boolean) as string[];
              const colorClass = colorClasses[program.color as keyof typeof colorClasses] || colorClasses.blue;

              return (
                <Card key={program.id} className={DualModeContentCardClass}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      {/* Program Icon (Dual Mode Gradient) */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}>
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                        {program.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-900 dark:text-white">{program.name}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-zinc-400">{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                        <span className="text-slate-900 dark:text-white">
                          {new Date(program.startDate).toLocaleDateString()} 
                          {program.endDate && ` - ${new Date(program.endDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-zinc-500">Coordinator: <span className="text-slate-900 dark:text-white">{program.coordinatorName}</span></p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                          <span className="text-slate-600 dark:text-zinc-400">{participants.length} registered</span>
                        </div>
                        {/* === INTEGRATION: REGISTER PARTICIPANT DIALOG === */}
                        <RegisterParticipantDialog 
                          program={program} 
                          currentParticipantIds={participantIds}
                          onUpdateParticipants={handleUpdateParticipants}
                        >
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Register
                          </Button>
                        </RegisterParticipantDialog>
                      </div>
                    </div>

                    {/* Participant Avatars */}
                    {participants.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                        <p className="text-slate-500 dark:text-zinc-500 mb-2">Participants</p>
                        <div className="space-y-2">
                          {participants.slice(0, 3).map((participant) => (
                            <div key={participant.id} className="flex items-center gap-2">
                              {/* Member Avatar (Dual Mode Gradient) */}
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}>
                                <span className="text-white">{participant.person?.name.charAt(0)}</span>
                              </div>
                              <span className="text-slate-900 dark:text-white">{participant.person?.name}</span>
                            </div>
                          ))}
                          {participants.length > 3 && (
                            <p className="text-slate-500 dark:text-zinc-500">+{participants.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recurring Programs */}
      <Card className={DualModeHeaderCardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Recurring Programs</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">Ongoing activities and fellowships</CardDescription>
            </div>
            {/* === INTEGRATION: ADD PROGRAM DIALOG FOR RECURRING === */}
            <AddProgramDialog onAddProgram={handleAddProgram} initialType="Recurring">
              <Button className={DualModePrimaryButtonClass}>
                <Plus className="w-4 h-4 mr-2" />
                New Recurring Program
              </Button>
            </AddProgramDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {recurringPrograms.map((program) => {
              const participants = getParticipants(program.id);
              const participantIds = participants.map(p => p.person?.id || '').filter(Boolean) as string[];
              const colorClass = colorClasses[program.color as keyof typeof colorClasses] || colorClasses.blue;

              return (
                <Card key={program.id} className={DualModeContentCardClass}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      {/* Program Icon (Dual Mode Gradient) */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}>
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                        {program.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-900 dark:text-white">{program.name}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-zinc-400">{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-slate-500 dark:text-zinc-500">Coordinator: <span className="text-slate-900 dark:text-white">{program.coordinatorName}</span></p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                          <span className="text-slate-600 dark:text-zinc-400">{participants.length} members</span>
                        </div>
                        {/* === INTEGRATION: REGISTER PARTICIPANT DIALOG === */}
                        <RegisterParticipantDialog 
                          program={program} 
                          currentParticipantIds={participantIds}
                          onUpdateParticipants={handleUpdateParticipants}
                        >
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        </RegisterParticipantDialog>
                      </div>
                    </div>

                    {/* Member Avatars */}
                    {participants.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                        <p className="text-slate-500 dark:text-zinc-500 mb-2">Members</p>
                        <div className="space-y-2">
                          {participants.slice(0, 3).map((participant) => (
                            <div key={participant.id} className="flex items-center gap-2">
                              {/* Member Avatar (Dual Mode Gradient) */}
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center shadow-sm`}>
                                <span className="text-white">{participant.person?.name.charAt(0)}</span>
                              </div>
                              <span className="text-slate-900 dark:text-white">{participant.person?.name}</span>
                            </div>
                          ))}
                          {participants.length > 3 && (
                            <p className="text-slate-500 dark:text-zinc-500">+{participants.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
