"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  HandCoins,
  AlertTriangle,
  Package,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/index";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type {
  ChurchProperty,
  PropertyTypeOption,
} from "@/lib/supabase/properties";

function statusBadge(status: ChurchProperty["status"]) {
  switch (status) {
    case "borrowed":
      return (
        <Badge className="rounded-lg bg-amber-500 hover:bg-amber-500">
          Borrowed
        </Badge>
      );
    case "lost":
      return (
        <Badge variant="destructive" className="rounded-lg">
          Lost
        </Badge>
      );
    default:
      return (
        <Badge className="rounded-lg bg-emerald-500 hover:bg-emerald-500">
          Owned
        </Badge>
      );
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
}

export function PropertiesTable({
  properties,
  propertyTypes,
  currency,
  typeFilter,
  onTypeFilterChange,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onUploadImage,
  onBorrow,
  onMarkLost,
}: {
  properties: ChurchProperty[];
  propertyTypes: PropertyTypeOption[];
  currency: SupportedCurrency;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  isAdmin: boolean;
  onView: (property: ChurchProperty) => void;
  onEdit: (property: ChurchProperty) => void;
  onDelete: (property: ChurchProperty) => void;
  onUploadImage: (property: ChurchProperty) => void;
  onBorrow: (property: ChurchProperty) => void;
  onMarkLost: (property: ChurchProperty) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      properties.filter(
        property =>
          (typeFilter === "all" || property.propertyTypeId === typeFilter) &&
          `${property.name} ${property.description ?? ""}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [properties, typeFilter, search],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
          />
          <Input
            aria-label="Search properties"
            type="search"
            placeholder="Search properties…"
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="h-11 rounded-xl bg-background pl-10"
          />
        </div>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {filtered.length} {filtered.length === 1 ? "property" : "properties"}
        </p>
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger
            aria-label="Filter by property type"
            className="h-11 w-full rounded-xl sm:w-[220px]"
          >
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {propertyTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-14" />
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purchase date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-slate-500"
                >
                  No properties match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(property => (
                <TableRow
                  key={property.id}
                  className="cursor-pointer"
                  onClick={() => onView(property)}
                >
                  <TableCell>
                    <button
                      type="button"
                      className={cn(
                        "h-10 w-10 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 overflow-hidden bg-slate-50 dark:bg-zinc-900 flex items-center justify-center",
                        isAdmin &&
                          "hover:ring-2 hover:ring-slate-300 dark:hover:ring-zinc-600 transition-shadow",
                      )}
                      onClick={e => {
                        e.stopPropagation();
                        if (isAdmin) onUploadImage(property);
                      }}
                      title={isAdmin ? "Upload image" : undefined}
                    >
                      {property.imageUrl ? (
                        <Image
                          src={property.imageUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {property.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-zinc-300 max-w-[220px]">
                    <p className="line-clamp-2 text-sm">
                      {property.description.trim() || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-zinc-300">
                    {property.typeName}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-zinc-300">
                    {formatDate(property.purchaseDate)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(property.estimatedValue, currency)}
                  </TableCell>
                  <TableCell>{statusBadge(property.status)}</TableCell>
                  <TableCell className="text-right">
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              onEdit(property);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              onUploadImage(property);
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload image
                          </DropdownMenuItem>
                          {property.status === "owned" && (
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                onBorrow(property);
                              }}
                            >
                              <HandCoins className="w-4 h-4 mr-2" />
                              Borrow out
                            </DropdownMenuItem>
                          )}
                          {property.status !== "lost" && (
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                onMarkLost(property);
                              }}
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Mark as lost
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              onDelete(property);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
