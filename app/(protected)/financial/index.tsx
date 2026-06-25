"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BarChart3, ClipboardList, DollarSign, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isItemEnabled } from "@/lib/subscription/entitlements";
import {
  auditsToLegacyExpenses,
  auditsToLegacyIncome,
} from "./_lib/audit-overview";
import { useFinancialAudits } from "./financial-context";
import { OverviewTab } from "./_components/overview-tab";
import { AuditsTab } from "./_components/audits-tab";
import { ManageTab } from "./_components/manage-tab";
import { CreateAuditDialog } from "./_components/create-audit-dialog";

type FinancialTab = "overview" | "audits" | "manage";

function parseTab(value: string | null): FinancialTab {
  if (value === "audits") return "audits";
  if (value === "manage") return "manage";
  return "overview";
}

export function FinancialView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = parseTab(searchParams.get("tab"));
  const { entitlements, isLoading } = useEntitlements();
  const { settings: orgSettings } = useOrganizationSettings();
  const financialEnabled = isItemEnabled(entitlements.modules, "financial");
  const currency = orgSettings.currency ?? DEFAULT_CURRENCY;

  const { audits, auditIncome, auditExpenses, createAudit, hydrated } =
    useFinancialAudits();
  const [isCreateAuditOpen, setIsCreateAuditOpen] = useState(false);

  const legacyIncome = useMemo(
    () => auditsToLegacyIncome(auditIncome),
    [auditIncome],
  );
  const legacyExpenses = useMemo(
    () => auditsToLegacyExpenses(auditExpenses),
    [auditExpenses],
  );

  const setActiveTab = (tab: string) => {
    router.replace(`/financial?tab=${tab}`, { scroll: false });
  };

  const handleCreateAudit = async (
    schedule: Parameters<typeof createAudit>[0],
  ) => {
    const audit = await createAudit(schedule);
    if (audit) router.push(`/financial/${audit.id}`);
  };

  if (isLoading || !hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!financialEnabled) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Financial
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Track tithes, offerings, donations, and expenses
          </p>
        </div>

        <Card className="border-slate-200/70 dark:border-zinc-700/70">
          <CardContent className="py-16 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
            <h2 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              Finance & Projects is not enabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              Financial management is available on the Pro plan. Contact support
              to upgrade your subscription.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Financial
        </h1>
        <p className="text-slate-600 dark:text-zinc-400">
          Overview, audit schedules, and detailed financial records
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xl grid-cols-3 h-10 p-1 bg-slate-100/80 dark:bg-zinc-800/80">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="audits" className="gap-1.5 text-xs sm:text-sm">
            <ClipboardList className="w-4 h-4" />
            Audits
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-1.5 text-xs sm:text-sm">
            <Settings2 className="w-4 h-4" />
            Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab
            income={legacyIncome}
            expenses={legacyExpenses}
            audits={audits}
            auditIncome={auditIncome}
            auditExpenses={auditExpenses}
            currency={currency}
          />
        </TabsContent>

        <TabsContent value="audits" className="mt-4">
          <AuditsTab
            audits={audits}
            auditIncome={auditIncome}
            auditExpenses={auditExpenses}
            currency={currency}
            onCreateAudit={() => setIsCreateAuditOpen(true)}
          />
        </TabsContent>

        <TabsContent value="manage" className="mt-4">
          <ManageTab currency={currency} />
        </TabsContent>
      </Tabs>

      <CreateAuditDialog
        open={isCreateAuditOpen}
        onOpenChange={setIsCreateAuditOpen}
        onSubmit={handleCreateAudit}
      />
    </div>
  );
}
