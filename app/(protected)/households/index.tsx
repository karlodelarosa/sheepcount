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

  // Dual-Mode Button Style (Light: Slate, Dark: Purple)
  const DualModeButtonClass =
    "rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40";

  return (
    <div className="space-y-6">
      {/* Main Card Container (Dual Mode) */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Households</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Manage household information and members
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className={DualModeButtonClass}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Household
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input (Dual Mode) */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
            <Input
              placeholder="Search households..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-900 dark:placeholder:text-zinc-400 dark:text-white"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHouseholds.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 dark:text-zinc-500 py-8">
                No households found
              </div>
            ) : (
              filteredHouseholds.map(household => {
                const members = getHouseholdMembers(household.id);
                return (
                  // Individual Household Card (Dual Mode)
                  <Card
                    key={household.id}
                    className="border-slate-200/60 bg-white hover:bg-slate-50/70 hover:shadow-lg transition-all duration-200 cursor-pointer dark:border-zinc-700/60 dark:bg-zinc-800 dark:hover:bg-zinc-700/70"
                    onClick={() => router.push(`/households/${household.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {/* Avatar/Icon (Dual Mode Gradient) */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-purple-500 dark:to-purple-700 flex items-center justify-center shadow-sm">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-slate-900 dark:text-white">
                              {household.name}
                            </CardTitle>
                            {/* Badge (Dual Mode Secondary) */}
                            <Badge
                              variant="secondary"
                              className="mt-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                            >
                              {members.length}{" "}
                              {members.length === 1 ? "member" : "members"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-slate-600 dark:text-zinc-400">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500 dark:text-zinc-500" />
                          <p>{household.address}</p>
                        </div>
                        <p className="text-slate-500 dark:text-zinc-500 text-sm">
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
    </div>
  );
}