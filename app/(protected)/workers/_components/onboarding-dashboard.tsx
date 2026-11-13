"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { usePeople } from "@/lib/people";
import { useTraining } from "@/lib/training";
import { cn } from "@/lib/utils";
import {
  filterOnboardingCandidates,
  getCandidateNextAction,
  getCandidateProgress,
  getOnboardingStageCounts,
  type WorkerOnboardingCandidate,
  type WorkerOnboardingStatus,
} from "@/lib/worker-onboarding";
import { useWorkerOnboarding } from "@/lib/worker-onboarding-context";
import {
  DeployCandidateDialog,
  EditTargetMinistryDialog,
  RemoveCandidateDialog,
  ReviewCandidateDialog,
  SubmitCandidateDialog,
} from "./onboarding-action-dialogs";
import { ConfigureOnboardingCourseDialog } from "./onboarding-setup-dialogs";
import { OnboardingProgramPanels } from "./onboarding-program";

const PAGE_SIZE = 50;
const stageOptions: Array<{
  value: WorkerOnboardingStatus;
  label: string;
}> = [
  { value: "in_progress", label: "In progress" },
  { value: "for_approval", label: "For approval" },
  { value: "ready_for_deployment", label: "Ready for deployment" },
  { value: "completed", label: "Completed" },
];

const statusClass: Record<WorkerOnboardingStatus, string> = {
  in_progress:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  for_approval:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  ready_for_deployment:
    "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

type ActionDialog = "submit" | "review" | "deploy" | "target" | "remove";

export function WorkerOnboardingDashboard() {
  const router = useRouter();
  const { people } = usePeople();
  const { modules, progress } = useTraining();
  const { workMinistries } = useGroupsMinistry();
  const { candidates, config, hydrated, isAdmin } = useWorkerOnboarding();
  const [stage, setStage] = useState<WorkerOnboardingStatus>("in_progress");
  const [query, setQuery] = useState("");
  const [ministryId, setMinistryId] = useState("all");
  const [page, setPage] = useState(1);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<WorkerOnboardingCandidate | null>(null);
  const [actionDialog, setActionDialog] = useState<ActionDialog | null>(null);

  const stageCounts = useMemo(
    () => getOnboardingStageCounts(candidates),
    [candidates],
  );
  const rows = useMemo(
    () =>
      candidates.flatMap(candidate => {
        const person = people.find(item => item.id === candidate.personId);
        if (!person) return [];
        return [
          {
            candidate,
            person,
            ministryName:
              workMinistries.find(
                ministry => ministry.id === candidate.targetMinistryId,
              )?.name ?? "Unavailable ministry",
          },
        ];
      }),
    [candidates, people, workMinistries],
  );
  const filteredRows = useMemo(
    () =>
      filterOnboardingCandidates(rows, {
        stage,
        ministryId,
        query,
      }),
    [ministryId, query, rows, stage],
  );
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = filteredRows.slice(
    (Math.min(page, totalPages) - 1) * PAGE_SIZE,
    Math.min(page, totalPages) * PAGE_SIZE,
  );

  const openAction = (
    candidate: WorkerOnboardingCandidate,
    dialog: ActionDialog,
  ) => {
    setSelectedCandidate(candidate);
    setActionDialog(dialog);
  };
  const selectedPerson = people.find(
    person => person.id === selectedCandidate?.personId,
  );

  const progressFor = (candidate: WorkerOnboardingCandidate) => {
    const courseModules = modules.filter(
      module => module.courseId === candidate.courseId,
    );
    const enrollment = progress.find(item => item.id === candidate.progressId);
    return getCandidateProgress(
      courseModules.map(module => module.id),
      enrollment?.completedModuleIds ?? [],
    );
  };

  const handlePrimaryAction = (candidate: WorkerOnboardingCandidate) => {
    const summary = progressFor(candidate);
    const action = getCandidateNextAction(candidate, summary.isComplete);
    if (action === "continue_training") {
      router.push(
        `/training/${candidate.courseId}?tab=progress&person=${candidate.personId}`,
      );
    } else if (action === "submit_for_approval") {
      openAction(candidate, "submit");
    } else if (action === "review" && isAdmin) {
      openAction(candidate, "review");
    } else if (action === "deploy" && isAdmin) {
      openAction(candidate, "deploy");
    } else if (action === "view_profile") {
      router.push(`/people/${candidate.personId}`);
    }
  };

  const actionLabel = (candidate: WorkerOnboardingCandidate) => {
    const action = getCandidateNextAction(
      candidate,
      progressFor(candidate).isComplete,
    );
    if (action === "continue_training") return "Continue training";
    if (action === "submit_for_approval") return "Submit for approval";
    if (action === "review") return isAdmin ? "Review" : "Awaiting review";
    if (action === "deploy") return isAdmin ? "Deploy" : "Awaiting deployment";
    return "View profile";
  };

  if (!hydrated) {
    return (
      <div
        className="grid gap-4"
        role="status"
        aria-label="Loading worker onboarding"
      >
        <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-900" />
        <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-900" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <OnboardingProgramPanels onConfigure={() => setConfigureOpen(true)} />

      {config && (
        <Card className="border-slate-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-0">
            <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-3 dark:border-zinc-800">
              {stageOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setStage(option.value);
                    setPage(1);
                  }}
                  className={cn(
                    "shrink-0 border-b-2 px-3 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-color)]",
                    stage === option.value
                      ? "border-[var(--accent-color)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                  <span
                    className={cn(
                      "ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground",
                      stage === option.value &&
                        "bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]",
                    )}
                  >
                    {stageCounts[option.value]}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  aria-label="Search onboarding candidates"
                  value={query}
                  onChange={event => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search candidates..."
                  className="pl-9"
                />
              </div>
              <Select
                value={ministryId}
                onValueChange={value => {
                  setMinistryId(value);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  className="sm:w-56"
                  aria-label="Filter by target ministry"
                >
                  <SlidersHorizontal className="mr-2 size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ministries</SelectItem>
                  {workMinistries.map(ministry => (
                    <SelectItem key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {visibleRows.length === 0 ? (
              <div className="px-6 py-14 text-center" role="status">
                <p className="font-medium text-slate-900 dark:text-white">
                  No candidates in this stage
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  Adjust the search or ministry filter, or add a new candidate.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 dark:bg-zinc-900/60">
                        <TableHead className="pl-6">Person</TableHead>
                        <TableHead>Ministry target</TableHead>
                        <TableHead className="min-w-56">
                          Onboarding progress
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Next step</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleRows.map(
                        ({ candidate, person, ministryName }) => {
                          const summary = progressFor(candidate);
                          return (
                            <TableRow key={candidate.id}>
                              <TableCell className="pl-6 font-medium">
                                <div>
                                  <p>{person.name}</p>
                                  {candidate.status === "in_progress" &&
                                    candidate.returnNote && (
                                      <p className="mt-1 max-w-64 text-xs font-normal text-amber-700 dark:text-amber-300">
                                        Returned: {candidate.returnNote}
                                      </p>
                                    )}
                                </div>
                              </TableCell>
                              <TableCell>{ministryName}</TableCell>
                              <TableCell>
                                <div className="space-y-1.5">
                                  <span className="text-xs text-slate-600 dark:text-zinc-400">
                                    {summary.completed} of {summary.total}{" "}
                                    modules ({summary.percent}%)
                                  </span>
                                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                                    <div
                                      className="h-full rounded-full bg-[var(--accent-color)]"
                                      style={{ width: `${summary.percent}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={statusClass[candidate.status]}
                                >
                                  {
                                    stageOptions.find(
                                      option =>
                                        option.value === candidate.status,
                                    )?.label
                                  }
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    (candidate.status === "for_approval" ||
                                      candidate.status ===
                                        "ready_for_deployment") &&
                                    !isAdmin
                                  }
                                  onClick={() => handlePrimaryAction(candidate)}
                                >
                                  {actionLabel(candidate)}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <CandidateMenu
                                  candidate={candidate}
                                  isAdmin={isAdmin}
                                  onAction={dialog =>
                                    openAction(candidate, dialog)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        },
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-3 p-4 md:hidden">
                  {visibleRows.map(({ candidate, person, ministryName }) => {
                    const summary = progressFor(candidate);
                    return (
                      <article
                        key={candidate.id}
                        className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-950 dark:text-white">
                              {person.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">
                              {ministryName}
                            </p>
                            {candidate.status === "in_progress" &&
                              candidate.returnNote && (
                                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                                  Returned: {candidate.returnNote}
                                </p>
                              )}
                          </div>
                          <CandidateMenu
                            candidate={candidate}
                            isAdmin={isAdmin}
                            onAction={dialog => openAction(candidate, dialog)}
                          />
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                          <Badge className={statusClass[candidate.status]}>
                            {
                              stageOptions.find(
                                option => option.value === candidate.status,
                              )?.label
                            }
                          </Badge>
                          <span>{summary.percent}% complete</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                          <div
                            className="h-full bg-[var(--accent-color)]"
                            style={{ width: `${summary.percent}%` }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="mt-4 w-full"
                          disabled={
                            (candidate.status === "for_approval" ||
                              candidate.status === "ready_for_deployment") &&
                            !isAdmin
                          }
                          onClick={() => handlePrimaryAction(candidate)}
                        >
                          {actionLabel(candidate)}
                        </Button>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
              <span>
                Showing {visibleRows.length} of {filteredRows.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">50 per page</span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() => setPage(current => Math.max(1, current - 1))}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next page"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage(current => Math.min(totalPages, current + 1))
                  }
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfigureOnboardingCourseDialog
        open={configureOpen}
        onOpenChange={setConfigureOpen}
      />
      <SubmitCandidateDialog
        candidate={selectedCandidate}
        personName={selectedPerson?.name ?? "this candidate"}
        open={actionDialog === "submit"}
        onOpenChange={open => !open && setActionDialog(null)}
      />
      <ReviewCandidateDialog
        candidate={selectedCandidate}
        personName={selectedPerson?.name ?? "this candidate"}
        open={actionDialog === "review"}
        onOpenChange={open => !open && setActionDialog(null)}
      />
      <DeployCandidateDialog
        candidate={selectedCandidate}
        personName={selectedPerson?.name ?? "this candidate"}
        open={actionDialog === "deploy"}
        onOpenChange={open => !open && setActionDialog(null)}
      />
      <EditTargetMinistryDialog
        candidate={selectedCandidate}
        personName={selectedPerson?.name ?? "this candidate"}
        open={actionDialog === "target"}
        onOpenChange={open => !open && setActionDialog(null)}
      />
      <RemoveCandidateDialog
        candidate={selectedCandidate}
        personName={selectedPerson?.name ?? "this candidate"}
        open={actionDialog === "remove"}
        onOpenChange={open => !open && setActionDialog(null)}
      />
    </div>
  );
}

function CandidateMenu({
  candidate,
  isAdmin,
  onAction,
}: {
  candidate: WorkerOnboardingCandidate;
  isAdmin: boolean;
  onAction: (dialog: ActionDialog) => void;
}) {
  const canEditTarget = candidate.status === "in_progress";
  const canRemove = isAdmin && candidate.status !== "completed";
  if (!canEditTarget && !canRemove) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Candidate actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEditTarget && (
          <DropdownMenuItem onSelect={() => onAction("target")}>
            <Settings /> Change target ministry
          </DropdownMenuItem>
        )}
        {canRemove && (
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onAction("remove")}
          >
            Remove candidate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
