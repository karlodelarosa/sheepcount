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
import { Plus, Search } from "lucide-react";
import { AddProspectDialog } from "./_components/add-prospect-dialog";
import { mockProspects } from "@/components/mock-data";

export function ProspectDirectory() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredProspects = mockProspects.filter(prospect =>
    prospect.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                Prospect Directory
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Track first-time attenders and newly met persons
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Prospect
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-900 dark:placeholder:text-zinc-400 dark:text-white"
            />
          </div>

          <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-100/50 dark:bg-zinc-700/70 dark:hover:bg-zinc-700/80">
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Name
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Age
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Phone
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Social
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Link
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProspects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-slate-500 dark:text-zinc-500"
                    >
                      No prospects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProspects.map(prospect => (
                    <TableRow
                      key={prospect.id}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-900 dark:text-white transition-colors"
                      onClick={() => router.push(`/prospect/${prospect.id}`)}
                    >
                      <TableCell className="font-medium">{prospect.name}</TableCell>
                      <TableCell>{prospect.age || "N/A"}</TableCell>
                      <TableCell>{prospect.phone || "N/A"}</TableCell>
                      <TableCell>{prospect.social || "N/A"}</TableCell>
                      <TableCell>https://google.com</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/prospects/${prospect.id}`);
                          }}
                          className="rounded-lg text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-zinc-700/70"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddProspectDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
