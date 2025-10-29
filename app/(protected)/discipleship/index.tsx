"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Users, Calendar, UserPlus } from "lucide-react";
import { mockDiscipleshipPrograms, mockDiscipleshipParticipants, mockPeople } from "@/components/mock-data";

// --- Import the new dialog components (You need to create these files) ---
import { EnrollParticipantDialog } from "./_components/enroll-participant-dialog";
import { AddProgramDialog } from "./_components/add-program-dialog";
// --------------------------------------------------------------------------

export function DiscipleshipView() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null); // Use Id for enrollment
  const [isAddProgramDialogOpen, setIsAddProgramDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  
  // --- Dual-Mode Class Definitions ---
  const DualModePrimaryButtonClass = "rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40 text-white";
  const DualModeHeaderCardClass = "border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50";
  const DualModeContentCardClass = "border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer dark:border-zinc-700/60 dark:bg-zinc-800/70";
  const DualModeSecondaryBadgeClass = "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
  const DualModeMemberAvatarClass = "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";
  
  // Dual-mode Icon Color for Summary Cards
  const DualModeIconColor = "h-5 w-5 text-slate-600 dark:text-zinc-400";
  
  // Dual-mode Colors for Program Icons
  const colorClasses: Record<string, string> = {
    // Light -> Dark
    blue: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    green: "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
    purple: "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
    pink: "from-pink-500 to-pink-700 dark:from-rose-600 dark:to-pink-800",
    indigo: "from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800",
  };
  // ------------------------------------

  const getParticipants = (programId: string) => {
    const participants = mockDiscipleshipParticipants.filter(p => p.programId === programId);
    return participants.map(p => ({
      ...p,
      person: mockPeople.find(person => person.id === p.personId)
    }));
  };

  const handleOpenEnrollDialog = (programId: string) => {
    setSelectedProgramId(programId);
    setIsEnrollDialogOpen(true);
  };

  // The rest of the component's structure remains the same

  return (
    <div className="space-y-6">
      
      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Active Programs Card */}
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Active Programs</CardTitle>
            <BookOpen className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{mockDiscipleshipPrograms.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">Discipleship tracks</p>
          </CardContent>
        </Card>

        {/* Total Participants Card */}
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Total Participants</CardTitle>
            <Users className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">{mockDiscipleshipParticipants.length}</div>
            <p className="text-slate-600 dark:text-zinc-400">People enrolled</p>
          </CardContent>
        </Card>

        {/* Categories Card */}
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Categories</CardTitle>
            <BookOpen className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">
              {new Set(mockDiscipleshipPrograms.map(p => p.category)).size}
            </div>
            <p className="text-slate-600 dark:text-zinc-400">Different tracks</p>
          </CardContent>
        </Card>

        {/* Avg. Enrollment Card */}
        <Card className={DualModeHeaderCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-900 dark:text-white">Avg. Enrollment</CardTitle>
            <UserPlus className={DualModeIconColor} />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white">
              {mockDiscipleshipPrograms.length > 0 ? Math.round(mockDiscipleshipParticipants.length / mockDiscipleshipPrograms.length) : 0}
            </div>
            <p className="text-slate-600 dark:text-zinc-400">Per program</p>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      <Card className={DualModeHeaderCardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Discipleship Programs</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">Spiritual growth and leadership development programs</CardDescription>
            </div>
            {/* New Program Button opens the AddProgramDialog */}
            <Button 
                onClick={() => setIsAddProgramDialogOpen(true)}
                className={DualModePrimaryButtonClass}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Program
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {mockDiscipleshipPrograms.map((program) => {
              const participants = getParticipants(program.id);
              const colorClass = colorClasses[program.color as keyof typeof colorClasses] || colorClasses.blue;

              return (
                <Card key={program.id} className={DualModeContentCardClass}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      {/* Program Icon (Dual Mode Gradient) */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                        {program.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-900 dark:text-white">{program.name}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-zinc-400">{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Program Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-500 dark:text-zinc-500">Duration</p>
                        <p className="text-slate-900 dark:text-white">{program.duration}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-zinc-500">Schedule</p>
                        <p className="text-slate-900 dark:text-white">{program.schedule}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                      <p className="text-slate-500 mb-2">Leader: <span className="text-slate-900 dark:text-white">{program.leader}</span></p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                          <span className="text-slate-600 dark:text-zinc-400">{participants.length} participants</span>
                        </div>
                        {/* Enroll Button opens the EnrollParticipantDialog */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOpenEnrollDialog(program.id)}
                          className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Enroll
                        </Button>
                      </div>
                    </div>

                    {/* Participant Avatars */}
                    {participants.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                        <p className="text-slate-500 dark:text-zinc-500 mb-2">Recent Participants</p>
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

      {/* --- DIALOG COMPONENTS (Placeholders) --- */}
      <EnrollParticipantDialog
        open={isEnrollDialogOpen}
        onOpenChange={setIsEnrollDialogOpen}
        programId={selectedProgramId}
        programs={mockDiscipleshipPrograms}
        people={mockPeople}
      />

      <AddProgramDialog
        open={isAddProgramDialogOpen}
        onOpenChange={setIsAddProgramDialogOpen}
      />
      {/* ------------------------------------------ */}
    </div>
  );
}