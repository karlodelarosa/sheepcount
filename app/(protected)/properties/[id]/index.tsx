"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  HandCoins,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/index";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useTenant } from "@/app/providers/tenant-provider";
import { useProperties } from "@/lib/properties";
import { FundraisingStatCard } from "@/app/(protected)/goal-projects/_components/fundraising-stat-card";
import { Package } from "lucide-react";
import { EditPropertyDialog } from "../_components/edit-property-dialog";
import { DeletePropertyDialog } from "../_components/delete-property-dialog";
import { AddBorrowDialog } from "../_components/add-borrow-dialog";
import { BorrowLogTable } from "../_components/borrow-log-table";
import {
  PropertyImageSection,
  propertyToUpdateInput,
} from "../_components/property-image-section";
import { UploadPropertyImageDialog } from "../_components/upload-property-image-dialog";

function statusBadge(status: "owned" | "borrowed" | "lost") {
  switch (status) {
    case "borrowed":
      return (
        <Badge className="rounded-lg bg-amber-500 hover:bg-amber-500">Borrowed</Badge>
      );
    case "lost":
      return <Badge variant="destructive" className="rounded-lg">Lost</Badge>;
    default:
      return (
        <Badge className="rounded-lg bg-emerald-500 hover:bg-emerald-500">Owned</Badge>
      );
  }
}

export function PropertyDetails({
  propertyId,
  onBack,
}: {
  propertyId: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const { tenant } = useTenant();
  const isAdmin = tenant?.profile?.role === "admin";
  const { settings: orgSettings } = useOrganizationSettings();
  const currency = orgSettings.currency ?? DEFAULT_CURRENCY;

  const {
    hydrated,
    properties,
    getProperty,
    updateProperty,
    deleteProperty,
    createBorrow,
    updateBorrow,
    deleteBorrow,
    isSaving,
  } = useProperties();

  const property = getProperty(propertyId);

  const singlePropertyList = useMemo(
    () => properties.filter(p => p.id === propertyId),
    [properties, propertyId],
  );

  const purchaseLabel = useMemo(() => {
    if (!property?.purchaseDate) return "Not recorded";
    return new Date(property.purchaseDate).toLocaleDateString();
  }, [property?.purchaseDate]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadImageOpen, setIsUploadImageOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBorrowOpen, setIsBorrowOpen] = useState(false);

  const handleReturn = async (
    borrow: {
      id: string;
      propertyId: string;
      borrowerPersonId: string | null;
      borrowerName: string;
      borrowedAt: string;
      dueAt: string | null;
      notes: string;
    },
    propId: string,
    returnedAt: string,
  ) => {
    const result = await updateBorrow({
      id: borrow.id,
      propertyId: propId,
      borrowerPersonId: borrow.borrowerPersonId,
      borrowerName: borrow.borrowerName,
      borrowedAt: borrow.borrowedAt,
      dueAt: borrow.dueAt,
      returnedAt,
      notes: borrow.notes,
    });
    return result !== null;
  };

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8 space-y-4">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-center text-red-500">
          Property not found or you do not have access.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-xl shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {property.name}
            </h1>
            <p className="text-slate-600 dark:text-zinc-400 mt-1">
              {property.typeName} · Borrow history and details
            </p>
          </div>
        </div>

        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsUploadImageOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload image
              </DropdownMenuItem>
              {property.status === "owned" && (
                <DropdownMenuItem onClick={() => setIsBorrowOpen(true)}>
                  <HandCoins className="w-4 h-4 mr-2" />
                  Borrow out
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="border-slate-200/60 dark:border-zinc-700/60 overflow-hidden">
          <PropertyImageSection
            property={property}
            isAdmin={isAdmin}
            isSaving={isSaving}
            className="border-b border-slate-200/60 dark:border-zinc-700/60"
            onUpload={file =>
              updateProperty(propertyToUpdateInput(property), file)
            }
          />
          <CardContent className="p-4 space-y-3">
            <FundraisingStatCard
              icon={Package}
              label={property.typeName}
              value={formatCurrency(property.estimatedValue, currency)}
              subtext={
                property.description.trim() ||
                `Purchased ${purchaseLabel}`
              }
              accent="blue"
              className="border-0 shadow-none p-0 bg-transparent"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-muted-foreground">Status</span>
              {statusBadge(property.status)}
            </div>
            {property.description.trim() && (
              <p className="text-sm text-slate-600 dark:text-zinc-400 border-t border-border/50 pt-3">
                {property.description}
              </p>
            )}
            {property.notes && (
              <p className="text-xs text-slate-500 dark:text-zinc-500 border-t border-border/50 pt-3">
                <span className="font-medium">Notes:</span> {property.notes}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Borrow log
            </h2>
            {isAdmin && property.status === "owned" && (
              <Button
                size="sm"
                onClick={() => setIsBorrowOpen(true)}
                className="rounded-lg bg-slate-900 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Record borrow
              </Button>
            )}
          </div>
          <BorrowLogTable
            properties={singlePropertyList}
            isAdmin={isAdmin}
            onReturn={handleReturn}
            onDelete={deleteBorrow}
          />
        </div>
      </div>

      <EditPropertyDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        property={property}
        onSubmit={updateProperty}
        isAdmin={isAdmin}
      />

      <UploadPropertyImageDialog
        open={isUploadImageOpen}
        onOpenChange={setIsUploadImageOpen}
        property={property}
        onSubmit={updateProperty}
        isAdmin={isAdmin}
      />

      <DeletePropertyDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        name={property.name}
        isAdmin={isAdmin}
        onConfirm={async () => {
          const ok = await deleteProperty(property.id);
          if (ok) router.push("/properties");
          return ok;
        }}
      />

      <AddBorrowDialog
        open={isBorrowOpen}
        onOpenChange={setIsBorrowOpen}
        properties={properties}
        defaultPropertyId={property.id}
        onSubmit={createBorrow}
      />
    </div>
  );
}
