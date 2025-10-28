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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Home, MapPin } from "lucide-react";
import { mockHouseholds, mockPeople } from "@/components/mock-data";
import { AddHouseholdDialog } from "./_components/add-household-dialog";

export function HouseholdsList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getHouseholdMembers = (householdId: string) => {
    return mockPeople.filter(p => p.householdId === householdId);
  };

  const filteredHouseholds = mockHouseholds.filter(
    household =>
      household.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Households</CardTitle>
              <CardDescription>
                Manage household information and members
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Household
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search households..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHouseholds.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 py-8">
                No households found
              </div>
            ) : (
              filteredHouseholds.map(household => {
                const members = getHouseholdMembers(household.id);
                return (
                  <Card
                    key={household.id}
                    className="border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
                    // Navigation change: use router.push
                    onClick={() => router.push(`/households/${household.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-slate-900">
                              {household.name}
                            </CardTitle>
                            <Badge
                              variant="secondary"
                              className="mt-1 rounded-lg"
                            >
                              {members.length}{" "}
                              {members.length === 1 ? "member" : "members"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>{household.address}</p>
                        </div>
                        <p className="text-slate-500">
                          Created:{" "}
                          {new Date(household.createdDate).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <AddHouseholdDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      {/* HouseholdDetailsDialog removed */}
    </div>
  );
}
