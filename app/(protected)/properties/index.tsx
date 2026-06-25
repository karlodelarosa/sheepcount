"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  DollarSign,
  HandCoins,
  Package,
  Plus,
  Settings2,
} from "lucide-react";
import { OverviewStatCard } from "@/components/overview-stat-card";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isItemEnabled } from "@/lib/subscription/entitlements";
import { useTenant } from "@/app/providers/tenant-provider";
import { useProperties } from "@/lib/properties";
import { AddPropertyDialog } from "./_components/add-property-dialog";
import { EditPropertyDialog } from "./_components/edit-property-dialog";
import { DeletePropertyDialog } from "./_components/delete-property-dialog";
import { PropertiesTable } from "./_components/properties-table";
import { AddBorrowDialog } from "./_components/add-borrow-dialog";
import { BorrowLogTable } from "./_components/borrow-log-table";
import { ManagePropertyTypesTab } from "./_components/manage-property-types-tab";
import { UploadPropertyImageDialog } from "./_components/upload-property-image-dialog";
import type { ChurchProperty } from "@/lib/supabase/properties";

type PropertiesTab = "inventory" | "borrow-log" | "types";

function parseTab(value: string | null, isAdmin: boolean): PropertiesTab {
  if (value === "borrow-log") return "borrow-log";
  if (value === "types" && isAdmin) return "types";
  return "inventory";
}

export function PropertyManagementView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { tenant } = useTenant();
  const isAdmin = tenant?.profile?.role === "admin";
  const { settings: orgSettings } = useOrganizationSettings();
  const currency = orgSettings.currency ?? DEFAULT_CURRENCY;
  const propertiesEnabled = isItemEnabled(entitlements.modules, "properties");

  const {
    properties,
    activePropertyTypes,
    hydrated,
    createProperty,
    updateProperty,
    deleteProperty,
    createBorrow,
    updateBorrow,
    deleteBorrow,
  } = useProperties();

  const activeTab = parseTab(searchParams.get("tab"), isAdmin);
  const setActiveTab = (tab: string) => {
    router.replace(`/properties?tab=${tab}`, { scroll: false });
  };

  const [typeFilter, setTypeFilter] = useState("all");

  const totalValue = useMemo(
    () => properties.reduce((sum, prop) => sum + prop.estimatedValue, 0),
    [properties],
  );

  const ownedCount = useMemo(
    () => properties.filter(p => p.status === "owned").length,
    [properties],
  );

  const borrowedCount = useMemo(
    () => properties.filter(p => p.status === "borrowed").length,
    [properties],
  );

  const lostCount = useMemo(
    () => properties.filter(p => p.status === "lost").length,
    [properties],
  );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [borrowPropertyId, setBorrowPropertyId] = useState<string | undefined>();
  const [editingProperty, setEditingProperty] = useState<ChurchProperty | null>(null);
  const [uploadingImageProperty, setUploadingImageProperty] =
    useState<ChurchProperty | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<ChurchProperty | null>(null);

  const handleMarkLost = async (property: ChurchProperty) => {
    await updateProperty({
      id: property.id,
      name: property.name,
      propertyTypeId: property.propertyTypeId,
      imageUrl: property.imageUrl,
      purchaseDate: property.purchaseDate,
      estimatedValue: property.estimatedValue,
      status: "lost",
      description: property.description,
      notes: property.notes,
    });
  };

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
    propertyId: string,
    returnedAt: string,
  ) => {
    const result = await updateBorrow({
      id: borrow.id,
      propertyId,
      borrowerPersonId: borrow.borrowerPersonId,
      borrowerName: borrow.borrowerName,
      borrowedAt: borrow.borrowedAt,
      dueAt: borrow.dueAt,
      returnedAt,
      notes: borrow.notes,
    });
    return result !== null;
  };

  if (entitlementsLoading || !hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!propertiesEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Properties
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Manage and monitor church-owned assets
          </p>
        </div>

        <Card className="border-slate-200/70 dark:border-zinc-700/70">
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
            <h2 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              Operations is not enabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              Property management is available on the Pro plan. Contact support
              to upgrade your subscription.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Properties
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Manage church assets, track estimated values, and log borrows.
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBorrowPropertyId(undefined);
                setIsBorrowDialogOpen(true);
              }}
              className="rounded-xl"
            >
              <HandCoins className="w-4 h-4 mr-2" />
              Record Borrow
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStatCard
          icon={Package}
          label="Total properties"
          value={properties.length}
          hint="All registered assets"
          variant="blue"
        />
        <OverviewStatCard
          icon={DollarSign}
          label="Total value"
          value={formatCurrency(totalValue, currency)}
          hint="Estimated worth"
          variant="emerald"
        />
        <OverviewStatCard
          icon={HandCoins}
          label="Borrowed"
          value={borrowedCount}
          hint={`${ownedCount} owned`}
          variant="amber"
        />
        <OverviewStatCard
          icon={AlertTriangle}
          label="Lost"
          value={lostCount}
          hint="Marked as lost"
          variant="rose"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className={`grid w-full h-10 p-1 bg-slate-100/80 dark:bg-zinc-800/80 ${
            isAdmin ? "max-w-lg grid-cols-3" : "max-w-md grid-cols-2"
          }`}
        >
          <TabsTrigger value="inventory" className="gap-1.5 text-xs sm:text-sm">
            <Building2 className="w-4 h-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="borrow-log" className="gap-1.5 text-xs sm:text-sm">
            <ClipboardList className="w-4 h-4" />
            Borrow Log
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="types" className="gap-1.5 text-xs sm:text-sm">
              <Settings2 className="w-4 h-4" />
              Types
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          {properties.length === 0 ? (
            <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
              <CardContent className="py-16 text-center text-slate-500 dark:text-zinc-400">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-600" />
                <p>No properties registered yet.</p>
                {isAdmin && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="mt-4 rounded-xl bg-slate-900 hover:bg-slate-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first property
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <PropertiesTable
              properties={properties}
              propertyTypes={activePropertyTypes}
              currency={currency}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              isAdmin={isAdmin}
              onView={property => router.push(`/properties/${property.id}`)}
              onEdit={setEditingProperty}
              onUploadImage={setUploadingImageProperty}
              onDelete={setDeletingProperty}
              onBorrow={property => {
                setBorrowPropertyId(property.id);
                setIsBorrowDialogOpen(true);
              }}
              onMarkLost={property => void handleMarkLost(property)}
            />
          )}
        </TabsContent>

        <TabsContent value="borrow-log" className="mt-4">
          <BorrowLogTable
            properties={properties}
            isAdmin={isAdmin}
            onReturn={handleReturn}
            onDelete={deleteBorrow}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="types" className="mt-4">
            <ManagePropertyTypesTab />
          </TabsContent>
        )}
      </Tabs>

      <AddPropertyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={createProperty}
        isAdmin={isAdmin}
      />

      <AddBorrowDialog
        open={isBorrowDialogOpen}
        onOpenChange={setIsBorrowDialogOpen}
        properties={properties}
        defaultPropertyId={borrowPropertyId}
        onSubmit={createBorrow}
      />

      {editingProperty && (
        <EditPropertyDialog
          open
          onOpenChange={open => {
            if (!open) setEditingProperty(null);
          }}
          property={editingProperty}
          onSubmit={updateProperty}
          isAdmin={isAdmin}
        />
      )}

      {uploadingImageProperty && (
        <UploadPropertyImageDialog
          open
          onOpenChange={open => {
            if (!open) setUploadingImageProperty(null);
          }}
          property={uploadingImageProperty}
          onSubmit={updateProperty}
          isAdmin={isAdmin}
        />
      )}

      {deletingProperty && (
        <DeletePropertyDialog
          open
          onOpenChange={open => {
            if (!open) setDeletingProperty(null);
          }}
          name={deletingProperty.name}
          isAdmin={isAdmin}
          onConfirm={async () => {
            const ok = await deleteProperty(deletingProperty.id);
            if (ok) setDeletingProperty(null);
            return ok;
          }}
        />
      )}
    </div>
  );
}
