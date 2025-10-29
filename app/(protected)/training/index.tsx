"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GraduationCap, Calendar, Clock, User } from "lucide-react";
import { mockTrainingEvents, mockTrainingCompletions, mockPeople } from "@/components/mock-data";
import { AddTrainingEventDialog } from "./_components/add-training-event-dialog";
import { RecordTrainingCompletionDialog } from "./_components/record-training-complete-dialog";

export function TrainingView() {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);

  const getCompletionCount = (trainingId: string) => {
    return mockTrainingCompletions.filter(c => c.trainingId === trainingId).length;
  };

  // Dual-mode Colors for Training Categories
  const categoryColors: Record<string, string> = {
    // Light -> Dark
    Leadership: "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
    Safety: "from-red-500 to-red-700 dark:from-rose-600 dark:to-red-800",
    Administration: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    Worship: "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
  };
  
  // Dual-Mode Primary Button (using purple/slate for contrast)
  const DualModePrimaryButtonClass = "rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40";
  
  // Dual-Mode Card Background
  const DualModeCardClass = "border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-white";
  
  // Dual-Mode Secondary Badge Class
  const DualModeSecondaryBadgeClass = "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";


  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Training Events</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">Manage training programs and track completions</CardDescription>
            </div>
            <Button onClick={() => setIsAddEventOpen(true)} className={DualModePrimaryButtonClass}>
              <Plus className="w-4 h-4 mr-2" />
              Add Training Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {mockTrainingEvents.map((training) => {
              const completions = getCompletionCount(training.id);
              const colorClass = categoryColors[training.category] || categoryColors.Leadership;
              
              return (
                <Card key={training.id} className={`${DualModeCardClass} hover:shadow-lg transition-all duration-200`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      {/* Icon (Dual Mode Gradient) */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}>
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                        {training.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-900 dark:text-white">{training.name}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-zinc-400">{training.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Event Details (Dual Mode) */}
                    <div className="grid grid-cols-2 gap-3 text-slate-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(training.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{training.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <User className="w-4 h-4" />
                        <span>{training.instructor}</span>
                      </div>
                    </div>

                    {/* Completion Tracker (Dual Mode) */}
                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 dark:text-zinc-500">Completions</p>
                        <p className="text-slate-900 dark:text-white">{completions} people</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedTraining(training.id);
                          setIsCompletionDialogOpen(true);
                        }}
                        className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white"
                      >
                        Record Completion
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {mockTrainingEvents.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-zinc-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
              <p>No training events scheduled yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTrainingEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
      />
      
      <RecordTrainingCompletionDialog
        open={isCompletionDialogOpen}
        onOpenChange={setIsCompletionDialogOpen}
        trainingId={selectedTraining}
      />
    </div>
  );
}