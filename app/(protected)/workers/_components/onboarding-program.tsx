"use client";

import {
  BadgeCheck,
  BookOpen,
  Handshake,
  Settings,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTraining } from "@/lib/training";
import { useWorkerOnboarding } from "@/lib/worker-onboarding-context";

export function OnboardingProgramPanels({
  onConfigure,
}: {
  onConfigure: () => void;
}) {
  const { courses, modules } = useTraining();
  const { config, isAdmin } = useWorkerOnboarding();
  const course = courses.find(item => item.id === config?.courseId);
  const courseModules = modules
    .filter(module => module.courseId === config?.courseId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!config) {
    return (
      <Card className="border-dashed border-[var(--accent-color-border)] bg-[var(--accent-color-soft)]">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <BookOpen className="size-9 text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]" />
          <div>
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Onboarding program is not configured
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              {isAdmin
                ? "Choose a Training Academy course to begin onboarding workers."
                : "An administrator needs to choose a Training Academy course."}
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={onConfigure}
              className="bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] focus-visible:ring-[var(--accent-color)]"
            >
              <Settings className="mr-2 size-4" />
              Configure program
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.15fr]">
      <Card className="border-slate-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Worker onboarding program</CardTitle>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              {course?.name ?? "Configured Training Academy course"}
            </p>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={onConfigure}>
              <Settings className="mr-2 size-4" />
              Change
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {courseModules.length === 0 ? (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              This course no longer has modules. Add modules in Training
              Academy.
            </p>
          ) : (
            <ol className="divide-y divide-slate-100 dark:divide-zinc-800">
              {courseModules.map((module, index) => (
                <li
                  key={module.id}
                  className="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-color-soft)] text-sm font-semibold text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-950 dark:text-white">
                      {module.name}
                    </p>
                    {module.description && (
                      <p className="truncate text-sm text-slate-500 dark:text-zinc-400">
                        {module.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">Onboarding flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                icon: UserPlus,
                label: "Candidate",
                detail: "Identified to serve",
              },
              { icon: BookOpen, label: "Training", detail: "Complete modules" },
              {
                icon: BadgeCheck,
                label: "Approval",
                detail: "Leadership review",
              },
              {
                icon: Handshake,
                label: "Deployment",
                detail: "Assigned to ministry",
              },
            ].map((step, index) => (
              <div key={step.label} className="text-center">
                <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                  <step.icon className="size-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {step.detail}
                </p>
                <span className="sr-only">Step {index + 1} of 4</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-[var(--accent-color-border)] bg-[var(--accent-color-soft)] p-4">
            <h3 className="font-semibold text-slate-950 dark:text-white">
              Requirements for deployment
            </h3>
            <ul className="mt-2 grid gap-2 text-sm text-slate-700 dark:text-zinc-300 sm:grid-cols-2">
              <li>✓ Complete every onboarding module</li>
              <li>✓ Meet with a ministry leader</li>
              <li>✓ Receive administrator approval</li>
              <li>✓ Select a ministry and role</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
