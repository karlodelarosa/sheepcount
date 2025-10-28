"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Home, MapPin, Users, Plus, Calendar } from "lucide-react";
import { mockPeople } from "@/components/mock-data";
import { AddHouseholdMemberDialog } from "./add-household-member-dialog";

interface HouseholdDetailsDialogProps {
  household: any;
  onClose: () => void;
}

export function HouseholdDetailsDialog({
  household,
  onClose,
}: HouseholdDetailsDialogProps) {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  if (!household) return null;

  const members = mockPeople.filter(p => p.householdId === household.id);

  return (
    <>
      <Dialog open={!!household} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[700px] border-slate-200/60 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-slate-900">
                  {household.name}
                </DialogTitle>
                <DialogDescription>
                  Household information and members
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Household Info */}
            <div className="grid gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-600" />
                <div>
                  <p className="text-slate-500">Address</p>
                  <p className="text-slate-900">{household.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-slate-600" />
                <div>
                  <p className="text-slate-500">Created</p>
                  <p className="text-slate-900">
                    {new Date(household.createdDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-700" />
                  <h3 className="text-slate-900">
                    Household Members ({members.length})
                  </h3>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddMemberOpen(true)}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>

              {members.length > 0 ? (
                <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Contact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map(member => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-sm">
                                <span className="text-white">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                              {member.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                member.role === "Head" ? "default" : "secondary"
                              }
                              className="rounded-lg"
                            >
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {member.age}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {member.email || member.phone || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No members in this household yet
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddHouseholdMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        householdId={household.id}
        householdName={household.name}
      />
    </>
  );
}
