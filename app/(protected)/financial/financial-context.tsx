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
  createFinancialExpenseCategory,
  createFinancialReceiptType,
  deactivateFinancialExpenseCategory,
  deactivateFinancialReceiptType,
  fetchFinancialAuditExpenseEntries,
  fetchFinancialAuditIncomeEntries,
  fetchFinancialAudits,
  fetchFinancialExpenseCategories,
  fetchFinancialReceiptTypes,
  seedFinancialDefaults,
} from "@/lib/supabase/financial";
import { getOrganizationId } from "@/lib/supabase/tenant";
import type {
  AuditExpenseEntry,
  AuditIncomeEntry,
  AuditSchedule,
  FinancialOption,
  NewAuditExpenseEntry,
  NewAuditIncomeEntry,
  NewAuditSchedule,
} from "./_lib/types";

type FinancialAuditContextValue = {
  audits: AuditSchedule[];
  auditIncome: AuditIncomeEntry[];
  auditExpenses: AuditExpenseEntry[];
  receiptTypes: FinancialOption[];
  expenseCategories: FinancialOption[];
  activeReceiptTypes: FinancialOption[];
  activeExpenseCategories: FinancialOption[];
  hydrated: boolean;
  isSaving: boolean;
  refreshFinancial: () => Promise<void>;
  createAudit: (schedule: NewAuditSchedule) => Promise<AuditSchedule | null>;
  addAuditIncome: (entry: NewAuditIncomeEntry) => Promise<void>;
  addAuditExpense: (entry: NewAuditExpenseEntry) => Promise<void>;
  addReceiptType: (name: string) => Promise<boolean>;
  removeReceiptType: (id: string) => Promise<boolean>;
  addExpenseCategory: (name: string) => Promise<boolean>;
  removeExpenseCategory: (id: string) => Promise<boolean>;
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
  const [receiptTypes, setReceiptTypes] = useState<FinancialOption[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<FinancialOption[]>(
    [],
  );
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    if (!organizationId) {
      setReceiptTypes([]);
      setExpenseCategories([]);
      return;
    }

    let [receiptData, categoryData] = await Promise.all([
      fetchFinancialReceiptTypes(supabase, organizationId),
      fetchFinancialExpenseCategories(supabase, organizationId),
    ]);

    if (receiptData.length === 0 && categoryData.length === 0) {
      await seedFinancialDefaults(supabase, organizationId);
      [receiptData, categoryData] = await Promise.all([
        fetchFinancialReceiptTypes(supabase, organizationId),
        fetchFinancialExpenseCategories(supabase, organizationId),
      ]);
    }

    setReceiptTypes(receiptData);
    setExpenseCategories(categoryData);
  }, [organizationId, supabase]);

  const refreshFinancial = useCallback(async () => {
    if (!organizationId) {
      setAudits([]);
      setAuditIncome([]);
      setAuditExpenses([]);
      setReceiptTypes([]);
      setExpenseCategories([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [auditData, incomeData, expenseData] = await Promise.all([
        fetchFinancialAudits(supabase, organizationId),
        fetchFinancialAuditIncomeEntries(supabase, organizationId),
        fetchFinancialAuditExpenseEntries(supabase, organizationId),
      ]);
      await loadOptions();

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
  }, [organizationId, loadOptions, supabase, tenantLoading]);

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

  const addReceiptType = useCallback(
    async (name: string): Promise<boolean> => {
      if (!organizationId) return false;

      setIsSaving(true);
      try {
        await createFinancialReceiptType(supabase, organizationId, name);
        await loadOptions();
        toast.success("Receipt type added");
        return true;
      } catch (error) {
        toast.error("Failed to add receipt type", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadOptions, organizationId, supabase],
  );

  const removeReceiptType = useCallback(
    async (id: string): Promise<boolean> => {
      const activeCount = receiptTypes.filter(type => type.isActive).length;
      if (activeCount <= 1) {
        toast.error("At least one receipt type is required");
        return false;
      }

      setIsSaving(true);
      try {
        await deactivateFinancialReceiptType(supabase, id);
        await loadOptions();
        toast.success("Receipt type removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove receipt type", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadOptions, receiptTypes, supabase],
  );

  const addExpenseCategory = useCallback(
    async (name: string): Promise<boolean> => {
      if (!organizationId) return false;

      setIsSaving(true);
      try {
        await createFinancialExpenseCategory(supabase, organizationId, name);
        await loadOptions();
        toast.success("Expense category added");
        return true;
      } catch (error) {
        toast.error("Failed to add expense category", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadOptions, organizationId, supabase],
  );

  const removeExpenseCategory = useCallback(
    async (id: string): Promise<boolean> => {
      const activeCount = expenseCategories.filter(cat => cat.isActive).length;
      if (activeCount <= 1) {
        toast.error("At least one expense category is required");
        return false;
      }

      setIsSaving(true);
      try {
        await deactivateFinancialExpenseCategory(supabase, id);
        await loadOptions();
        toast.success("Expense category removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove expense category", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [expenseCategories, loadOptions, supabase],
  );

  const getAuditById = useCallback(
    (id: string) => audits.find(a => a.id === id),
    [audits],
  );

  const activeReceiptTypes = useMemo(
    () => receiptTypes.filter(type => type.isActive),
    [receiptTypes],
  );

  const activeExpenseCategories = useMemo(
    () => expenseCategories.filter(category => category.isActive),
    [expenseCategories],
  );

  const value = useMemo(
    () => ({
      audits,
      auditIncome,
      auditExpenses,
      receiptTypes,
      expenseCategories,
      activeReceiptTypes,
      activeExpenseCategories,
      hydrated,
      isSaving,
      refreshFinancial,
      createAudit,
      addAuditIncome,
      addAuditExpense,
      addReceiptType,
      removeReceiptType,
      addExpenseCategory,
      removeExpenseCategory,
      getAuditById,
    }),
    [
      audits,
      auditIncome,
      auditExpenses,
      receiptTypes,
      expenseCategories,
      activeReceiptTypes,
      activeExpenseCategories,
      hydrated,
      isSaving,
      refreshFinancial,
      createAudit,
      addAuditIncome,
      addAuditExpense,
      addReceiptType,
      removeReceiptType,
      addExpenseCategory,
      removeExpenseCategory,
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
