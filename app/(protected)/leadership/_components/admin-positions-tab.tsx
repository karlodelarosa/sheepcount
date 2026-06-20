"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Shield } from "lucide-react";
import { usePeople } from "@/lib/people";
import { useLeadership } from "@/lib/leadership";
import { AssignAdminPositionDialog } from "./assign-admin-position-dialog";

export function AdminPositionsTab() {
  const { people } = usePeople();
  const { adminPositions, hydrated, isSaving } = useLeadership();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const positionsWithPeople = useMemo(
    () =>
      adminPositions.map(position => ({
        ...position,
        person: people.find(person => person.id === position.personId),
      })),
    [adminPositions, people],
  );

  const groupedPositions = useMemo(
    () =>
      positionsWithPeople.reduce(
        (acc, position) => {
          if (!acc[position.title]) {
            acc[position.title] = [];
          }
          acc[position.title].push(position);
          return acc;
        },
        {} as Record<string, typeof positionsWithPeople>,
      ),
    [positionsWithPeople],
  );

  const getPositionColor = (title: string) => {
    const colors: Record<string, string> = {
      Secretary:
        "from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800",
      Treasurer:
        "from-green-500 to-green-700 dark:from-green-600 dark:to-green-800",
      Deacon:
        "from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800",
      "Head Pastor":
        "from-indigo-500 to-indigo-700 dark:from-purple-600 dark:to-purple-800",
    };
    return (
      colors[title] ||
      "from-slate-500 to-slate-700 dark:from-zinc-600 dark:to-zinc-800"
    );
  };

  const DualModeButtonClass =
    "rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40";

  const getBadgeClass = (type: "active" | "term" | "inactive") => {
    if (type === "active") {
      return "rounded-lg bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
    }
    if (type === "inactive") {
      return "rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-400";
    }
    return "rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600";
  };

  if (!hydrated) {
    return (
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
        <CardHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                Administrative Positions
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Manage organizational leadership and administrative roles
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAssignDialogOpen(true)}
              className={DualModeButtonClass}
              disabled={isSaving}
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Position
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedPositions).map(([title, positions]) => (
            <div key={title}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getPositionColor(title)} flex items-center justify-center shadow-sm`}
                >
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white text-xl font-semibold">
                    {title}
                  </h3>
                  <p className="text-slate-600 dark:text-zinc-400">
                    {positions.length}{" "}
                    {positions.length === 1 ? "position" : "positions"}
                  </p>
                </div>
              </div>

              <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-700/50 dark:hover:bg-zinc-700/60">
                      <TableHead className="text-slate-600 dark:text-zinc-300">
                        Name
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-zinc-300">
                        Household
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-zinc-300">
                        Appointed Date
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-zinc-300">
                        Term
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-zinc-300">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map(position => (
                      <TableRow
                        key={position.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-500 dark:from-purple-700 dark:to-purple-500 flex items-center justify-center shadow-sm">
                              <span className="text-white">
                                {position.person?.name.charAt(0) ?? "?"}
                              </span>
                            </div>
                            {position.person?.name ?? "Unknown person"}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-zinc-400">
                          {position.person?.householdName || "—"}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-zinc-400">
                          {new Date(
                            position.appointedDate,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getBadgeClass("term")}>
                            {position.term || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getBadgeClass(
                              position.status === "active"
                                ? "active"
                                : "inactive",
                            )}
                          >
                            {position.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}

          {Object.keys(groupedPositions).length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-zinc-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
              <p>No administrative positions assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AssignAdminPositionDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
      />
    </div>
  );
}
