"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search } from "lucide-react";
import { formatPersonName } from "@/lib/person-name";
import { usePeople, PEOPLE_PAGE_SIZE, type AddPersonInput } from "@/lib/people";
import { AddPersonDialog } from "./add-person-dialog";
import { ConfirmPersonDialog } from "./confirm-person-dialog";

export function PeopleDirectory() {
  const router = useRouter();
  const { people, hydrated, isSaving, addPerson } = usePeople();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [confirmAddOpen, setConfirmAddOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<AddPersonInput | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPeople = useMemo(
    () =>
      people.filter(
        person =>
          person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.phone.includes(searchTerm) ||
          person.householdName.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [people, searchTerm],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPeople.length / PEOPLE_PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPeople = filteredPeople.slice(
    (safePage - 1) * PEOPLE_PAGE_SIZE,
    safePage * PEOPLE_PAGE_SIZE,
  );

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
        return "bg-green-100 text-green-700 dark:bg-emerald-800 dark:text-emerald-300";
      case "Prospect":
        return "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
    }
  };

  const handleAddRequest = (input: AddPersonInput) => {
    setPendingAdd(input);
    setIsAddDialogOpen(false);
    // Defer confirm dialog until add dialog teardown completes (Radix layer bug).
    requestAnimationFrame(() => setConfirmAddOpen(true));
  };

  const handleConfirmAdd = async () => {
    if (!pendingAdd) return;
    const person = await addPerson(pendingAdd);
    if (person) {
      setConfirmAddOpen(false);
      setPendingAdd(null);
      setIsAddDialogOpen(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                People
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Manage everyone in your organization — members, attenders, and
                prospects
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add People
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
            <Input
              placeholder="Search by name, phone, or household..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
                    Phone
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Birthdate
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Status
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Type
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPeople.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-slate-500 dark:text-zinc-500"
                    >
                      No people found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPeople.map(person => (
                    <TableRow
                      key={person.id}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-900 dark:text-white transition-colors"
                      onClick={() => router.push(`/people/${person.id}`)}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/people/${person.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`View ${person.name}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500 flex items-center justify-center shadow-sm">
                            <span className="text-white">
                              {person.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {person.name}
                            {person.isProspect && (
                              <Badge className="rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                                Prospect
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-zinc-400">
                        {person.phone || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-zinc-400">
                        {person.birthdate
                          ? new Date(person.birthdate).toLocaleDateString()
                          : "—"}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="rounded-lg text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-zinc-700/70"
                        >
                          <Link
                            href={`/people/${person.id}`}
                            onClick={e => e.stopPropagation()}
                          >
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredPeople.length > PEOPLE_PAGE_SIZE && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(safePage - 1) * PEOPLE_PAGE_SIZE + 1}–
                {Math.min(safePage * PEOPLE_PAGE_SIZE, filteredPeople.length)}{" "}
                of {filteredPeople.length}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setCurrentPage(p => Math.max(1, p - 1));
                      }}
                      className={
                        safePage <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === safePage}
                          onClick={e => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                      }}
                      className={
                        safePage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPersonDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddRequest}
      />

      <ConfirmPersonDialog
        open={confirmAddOpen}
        onOpenChange={open => {
          setConfirmAddOpen(open);
          if (!open) setPendingAdd(null);
        }}
        variant="add"
        personName={
          pendingAdd
            ? formatPersonName({
                firstName: pendingAdd.firstName,
                middleName: pendingAdd.middleName,
                lastName: pendingAdd.lastName,
              })
            : ""
        }
        onConfirm={handleConfirmAdd}
        isLoading={isSaving}
      />
    </div>
  );
}
