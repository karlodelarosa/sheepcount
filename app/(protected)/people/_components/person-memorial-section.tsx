"use client";

import { useState } from "react";
import { Cross, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isMenuItemShownInNavigation } from "@/lib/navigation-visibility";
import { useOrganizationSettings } from "@/lib/organization-settings";
import type { Person } from "@/lib/people";
import { useMemorial } from "@/lib/memorials";
import { MemorialCertificateDialog } from "@/app/(protected)/memorials/_components/memorial-certificate-dialog";
import type { MemorialCertificateData } from "@/app/(protected)/memorials/_components/memorial-certificate";
import { panelCard, SectionHeader } from "./person-detail-ui";
import { cn } from "@/lib/utils";

type PersonMemorialSectionProps = {
  person: Person;
};

export function PersonMemorialSection({ person }: PersonMemorialSectionProps) {
  const { settings } = useTheme();
  const { entitlements } = useEntitlements();
  const { settings: orgSettings } = useOrganizationSettings();
  const { records } = useMemorial();
  const [certificateOpen, setCertificateOpen] = useState(false);

  const memorialsEnabled = isMenuItemShownInNavigation(
    "memorials",
    orgSettings,
    entitlements.modules,
  );

  const record = records.find(r => r.personId === person.id) ?? null;

  if (!memorialsEnabled || !record) {
    return null;
  }

  const certificateData: MemorialCertificateData = {
    deceasedName: record.deceasedName,
    deathDate: record.deathDate,
    organizationName: settings.organizationName,
    organizationLogo: settings.organizationLogo,
    location: record.location,
    officiantName: record.officiantName,
    survivedBy: record.survivedBy,
  };

  return (
    <>
      <div className={cn(panelCard, "p-5")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            icon={Cross}
            title="In Loving Memory"
            description={new Date(record.deathDate).toLocaleDateString(
              undefined,
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          />
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl shrink-0"
            onClick={() => setCertificateOpen(true)}
          >
            <FileText className="w-4 h-4 mr-1" />
            Certificate
          </Button>
        </div>

        <div className="mt-4 p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30">
          <p className="text-xs text-slate-500 dark:text-zinc-500">
            {[
              record.serviceDate
                ? `Service: ${new Date(record.serviceDate).toLocaleDateString()}`
                : null,
              record.location || null,
              record.officiantName
                ? `Officiant: ${record.officiantName}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "No additional details"}
          </p>
          {record.survivedBy && (
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
              Survived by: {record.survivedBy}
            </p>
          )}
          {record.notes && (
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
              {record.notes}
            </p>
          )}
        </div>
      </div>

      <MemorialCertificateDialog
        open={certificateOpen}
        onOpenChange={setCertificateOpen}
        certificateData={certificateData}
      />
    </>
  );
}
