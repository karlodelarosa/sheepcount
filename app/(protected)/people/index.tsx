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

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>People Directory</CardTitle>
              <CardDescription>
                Manage members and their household information
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Person
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or household..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="border border-slate-200/60 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Household</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-slate-500"
                    >
                      No people found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPeople.map(person => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "Active":
                          return "bg-green-100 text-green-700";
                        case "Inactive":
                          return "bg-yellow-100 text-yellow-700";
                        case "Exited":
                          return "bg-red-100 text-red-700";
                        default:
                          return "bg-slate-100 text-slate-700";
                      }
                    };

                    const getMembershipColor = (type: string) => {
                      switch (type) {
                        case "Worker":
                          return "bg-purple-100 text-purple-700";
                        case "Member":
                          return "bg-blue-100 text-blue-700";
                        case "Attender":
                          return "bg-green-100 text-green-700";
                        default:
                          return "bg-slate-100 text-slate-700";
                      }
                    };

                    return (
                      <TableRow
                        key={person.id}
                        className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => router.push(`/people/${person.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-sm">
                              <span className="text-white">
                                {person.name.charAt(0)}
                              </span>
                            </div>
                            {person.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            {person.householdName}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
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
                            className="rounded-lg"
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
