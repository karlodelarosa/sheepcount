"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createInitialAuditData } from "./_lib/audit-mock-data";
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
  createAudit: (schedule: NewAuditSchedule) => AuditSchedule;
  addAuditIncome: (entry: NewAuditIncomeEntry) => void;
  addAuditExpense: (entry: NewAuditExpenseEntry) => void;
  getAuditById: (id: string) => AuditSchedule | undefined;
};

const FinancialAuditContext = createContext<FinancialAuditContextValue | null>(
  null,
);

export function FinancialAuditProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initial = useMemo(() => createInitialAuditData(), []);
  const [audits, setAudits] = useState<AuditSchedule[]>(initial.audits);
  const [auditIncome, setAuditIncome] = useState<AuditIncomeEntry[]>(
    initial.income,
  );
  const [auditExpenses, setAuditExpenses] = useState<AuditExpenseEntry[]>(
    initial.expenses,
  );

  const createAudit = useCallback((schedule: NewAuditSchedule): AuditSchedule => {
    const audit: AuditSchedule = {
      ...schedule,
      id: `audit-${Date.now()}`,
    };
    setAudits(prev => [audit, ...prev]);
    return audit;
  }, []);

  const addAuditIncome = useCallback((entry: NewAuditIncomeEntry) => {
    setAuditIncome(prev => [
      ...prev,
      { ...entry, id: `ai-${Date.now()}` },
    ]);
  }, []);

  const addAuditExpense = useCallback((entry: NewAuditExpenseEntry) => {
    setAuditExpenses(prev => [
      ...prev,
      { ...entry, id: `ae-${Date.now()}` },
    ]);
  }, []);

  const getAuditById = useCallback(
    (id: string) => audits.find(a => a.id === id),
    [audits],
  );

  const value = useMemo(
    () => ({
      audits,
      auditIncome,
      auditExpenses,
      createAudit,
      addAuditIncome,
      addAuditExpense,
      getAuditById,
    }),
    [
      audits,
      auditIncome,
      auditExpenses,
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
