"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users } from "lucide-react";
import { mockPeople, mockAttendance } from "@/components/mock-data";
import { AddPersonDialog } from "./_components/add-person-dialog";

export function PeopleList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getLastAttendance = (personId: string) => {
    const personAttendance = mockAttendance
      .filter(a => a.personId === personId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return personAttendance[0]?.date;
  };

  const filteredPeople = mockPeople.filter(
    person =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.householdName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const households = filteredPeople.reduce(
    (acc, person) => {
      if (!acc[person.householdId]) {
        acc[person.householdId] = {
          name: person.householdName,
          members: [],
        };
      }
      acc[person.householdId].members.push(person);
      return acc;
    },
    {} as Record<string, { name: string; members: any[] }>,
  );

  // --- Dark Mode Badge Colors (Using dark: prefix in returned JSX) ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
      case "Inactive":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300";
      case "Exited":
        return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case "Worker":
        return "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300";
      case "Member":
        return "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300";
      case "Attender":
        return "bg-green-100 text-green-700 dark:bg-emerald-800 dark:text-emerald-300"; // Used emerald for distinction in dark mode
      default:
        return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
    }
  };
  // -------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <Card
        // Card Background/Border
        className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                People Directory
              </CardTitle>
              {/* CardDescription Text Color */}
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Manage members and their household information
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              // Button Background/Shadow
              className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Person
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input Container */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
            <Input
              placeholder="Search by name or household..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              // Input Styling
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-900 dark:placeholder:text-zinc-400 dark:text-white"
            />
          </div>

          {/* Table Container */}
          <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
            <Table>
              <TableHeader>
                {/* Table Header Row */}
                <TableRow className="bg-slate-50/50 hover:bg-slate-100/50 dark:bg-zinc-700/70 dark:hover:bg-zinc-700/80">
                  {/* Table Headers Text Color */}
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Name
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Role
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Status
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Type
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Household
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Contact
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-slate-500 dark:text-zinc-500"
                    >
                      No people found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPeople.map(person => {
                    return (
                      <TableRow
                        key={person.id}
                        // Table Row Hover/Text Color
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-900 dark:text-white transition-colors"
                        onClick={() => router.push(`/people/${person.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500 flex items-center justify-center shadow-sm">
                              <span className="text-white">
                                {person.name.charAt(0)}
                              </span>
                            </div>
                            {person.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            // Assuming default/secondary badges are globally styled for dark mode
                            variant={
                              person.role === "Head" ? "default" : "secondary"
                            }
                            className="rounded-lg"
                          >
                            {person.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-lg ${getStatusColor(person.status)}`}
                          >
                            {person.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-lg ${getMembershipColor(person.membershipType)}`}
                          >
                            {person.membershipType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-zinc-400">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
                            {person.householdName}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-zinc-400">
                          {person.email || person.phone || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              router.push(`/people/${person.id}`);
                            }}
                            // Button Text/Hover
                            className="rounded-lg text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-zinc-700/70"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddPersonDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
