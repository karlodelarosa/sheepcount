"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, TrendingUp, CheckCircle2, Calendar } from "lucide-react";
import { mockGoalProjects } from "@/components/mock-data";
import { AddGoalProjectDialog } from "./_components/add-goal-project-dialog";
import { AddProjectContributionDialog } from "./_components/add-project-contribution-dialog";

interface GoalProjectsViewProps {
  onViewProject?: (projectId: string) => void;
}

export function GoalProjectsView({ onViewProject }: GoalProjectsViewProps) {
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);

  const activeProjects = mockGoalProjects.filter(p => p.status === "Active");
  const completedProjects = mockGoalProjects.filter(p => p.status === "Completed");

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const categoryColors: Record<string, string> = {
    Building: "from-blue-500 to-blue-700",
    Missions: "from-green-500 to-green-700",
    Youth: "from-purple-500 to-purple-700",
    Equipment: "from-orange-500 to-orange-700",
  };

  const ProjectCard = ({ project }: { project: typeof mockGoalProjects[0] }) => {
    const progress = getProgressPercentage(project.raisedAmount, project.goalAmount);
    const colorClass = categoryColors[project.category] || categoryColors.Building;
    const isCompleted = project.status === "Completed";

    return (
      <Card 
        className="border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
        onClick={() => onViewProject?.(project.id)}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}>
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : (
                <Target className="w-6 h-6 text-white" />
              )}
            </div>
            <Badge variant={isCompleted ? "default" : "secondary"} className={`rounded-lg ${isCompleted ? 'bg-green-500' : ''}`}>
              {project.status}
            </Badge>
          </div>
          <CardTitle className="text-slate-900">{project.name}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Progress</span>
              <span className="text-slate-900">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-slate-900">${project.raisedAmount.toLocaleString()}</span>
              <span className="text-slate-600">of ${project.goalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>Target: {new Date(project.targetDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="w-4 h-4" />
              <span>Remaining: ${(project.goalAmount - project.raisedAmount).toLocaleString()}</span>
            </div>
          </div>

          {!isCompleted && (
            <Button 
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProject(project.id);
                setIsAddContributionOpen(true);
              }}
            >
              Add Contribution
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Active Projects</CardTitle>
            <Target className="h-5 w-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{activeProjects.length}</div>
            <p className="text-slate-600">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{completedProjects.length}</div>
            <p className="text-slate-600">Goals achieved</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Raised</CardTitle>
            <TrendingUp className="h-5 w-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">
              ${mockGoalProjects.reduce((sum, p) => sum + p.raisedAmount, 0).toLocaleString()}
            </div>
            <p className="text-slate-600">All projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Goal Projects</CardTitle>
              <CardDescription>Track fundraising goals and progress</CardDescription>
            </div>
            <Button onClick={() => setIsAddProjectOpen(true)} className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {activeProjects.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No active projects yet</p>
              </div>
            ) : (
              activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Completed Projects</CardTitle>
            <CardDescription>Successfully achieved goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AddGoalProjectDialog
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
      />

      <AddProjectContributionDialog
        open={isAddContributionOpen}
        onOpenChange={setIsAddContributionOpen}
        projectId={selectedProject}
      />
    </div>
  );
}
