"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import {
  createFinancialAudit,
  createFinancialAuditExpenseEntry,
  createFinancialAuditIncomeEntry,
  fetchFinancialAuditExpenseEntries,
  fetchFinancialAuditIncomeEntries,
  fetchFinancialAudits,
} from "@/lib/supabase/financial";
import { getOrganizationId } from "@/lib/supabase/tenant";
import type {
  AuditExpenseEntry,
  AuditIncomeEntry,
  AuditSchedule,
  NewAuditExpenseEntry,
  NewAuditIncomeEntry,
  NewAuditSchedule,
} from "./_lib/types";

type FinancialAuditContextValue = {
  audits: AuditSchedule[];
  auditIncome: AuditIncomeEntry[];
  auditExpenses: AuditExpenseEntry[];
  hydrated: boolean;
  isSaving: boolean;
  refreshFinancial: () => Promise<void>;
  createAudit: (schedule: NewAuditSchedule) => Promise<AuditSchedule | null>;
  addAuditIncome: (entry: NewAuditIncomeEntry) => Promise<void>;
  addAuditExpense: (entry: NewAuditExpenseEntry) => Promise<void>;
  getAuditById: (id: string) => AuditSchedule | undefined;
};

const FinancialAuditContext = createContext<FinancialAuditContextValue | null>(
  null,
);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function FinancialAuditProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [audits, setAudits] = useState<AuditSchedule[]>([]);
  const [auditIncome, setAuditIncome] = useState<AuditIncomeEntry[]>([]);
  const [auditExpenses, setAuditExpenses] = useState<AuditExpenseEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshFinancial = useCallback(async () => {
    if (!organizationId) {
      setAudits([]);
      setAuditIncome([]);
      setAuditExpenses([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [auditData, incomeData, expenseData] = await Promise.all([
        fetchFinancialAudits(supabase, organizationId),
        fetchFinancialAuditIncomeEntries(supabase, organizationId),
        fetchFinancialAuditExpenseEntries(supabase, organizationId),
      ]);

      setAudits(auditData);
      setAuditIncome(incomeData);
      setAuditExpenses(expenseData);
    } catch (error) {
      toast.error("Failed to load financial data", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    if (tenantLoading) return;
    void refreshFinancial();
  }, [refreshFinancial, tenantLoading]);

  const createAudit = useCallback(
    async (schedule: NewAuditSchedule): Promise<AuditSchedule | null> => {
      if (!organizationId) {
        toast.error("No organization found");
        return null;
      }

      setIsSaving(true);
      try {
        const audit = await createFinancialAudit(
          supabase,
          organizationId,
          schedule,
        );
        await refreshFinancial();
        toast.success("Audit schedule created", {
          description: `${audit.title} was added.`,
        });
        return audit;
      } catch (error) {
        toast.error("Failed to create audit schedule", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshFinancial, supabase],
  );

  const addAuditIncome = useCallback(
    async (entry: NewAuditIncomeEntry) => {
      setIsSaving(true);
      try {
        await createFinancialAuditIncomeEntry(supabase, entry);
        await refreshFinancial();
        toast.success("Receipt entry added");
      } catch (error) {
        toast.error("Failed to add receipt entry", {
          description: getErrorMessage(error),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [refreshFinancial, supabase],
  );

  const addAuditExpense = useCallback(
    async (entry: NewAuditExpenseEntry) => {
      setIsSaving(true);
      try {
        await createFinancialAuditExpenseEntry(supabase, entry);
        await refreshFinancial();
        toast.success("Expense entry added");
      } catch (error) {
        toast.error("Failed to add expense entry", {
          description: getErrorMessage(error),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [refreshFinancial, supabase],
  );

  const getAuditById = useCallback(
    (id: string) => audits.find(a => a.id === id),
    [audits],
  );

  const value = useMemo(
    () => ({
      audits,
      auditIncome,
      auditExpenses,
      hydrated,
      isSaving,
      refreshFinancial,
      createAudit,
      addAuditIncome,
      addAuditExpense,
      getAuditById,
    }),
    [
      audits,
      auditIncome,
      auditExpenses,
      hydrated,
      isSaving,
      refreshFinancial,
      createAudit,
      addAuditIncome,
      addAuditExpense,
      getAuditById,
    ],
  );

  return (
    <FinancialAuditContext.Provider value={value}>
      {children}
    </FinancialAuditContext.Provider>
  );
}

export function useFinancialAudits() {
  const context = useContext(FinancialAuditContext);
  if (!context) {
    throw new Error(
      "useFinancialAudits must be used within FinancialAuditProvider",
    );
  }
  return context;
}
