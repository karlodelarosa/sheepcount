import type { SupportedCurrency } from "@/lib/currency";
import type {
  AuditExpenseEntry,
  AuditIncomeEntry,
  AuditSchedule,
} from "./types";

export type AuditSummary = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
};

export type AuditChartPoint = {
  name: string;
  income: number;
  expenses: number;
};

export type AuditExpenseBreakdown = {
  name: string;
  value: number;
  fill: string;
};

const EXPENSE_COLORS: Record<string, string> = {
  Electricity: "#f59e0b",
  Rent: "#ef4444",
  "Resources (Food, Water)": "#10b981",
  Salaries: "#6366f1",
  "Building Maintenance": "#8b5cf6",
  "Ministry Supplies": "#ec4899",
  "Missions Support": "#14b8a6",
  Insurance: "#64748b",
  Technology: "#0ea5e9",
  Other: "#94a3b8",
};

export function getAuditEntries(
  auditId: string,
  income: AuditIncomeEntry[],
  expenses: AuditExpenseEntry[],
) {
  return {
    income: income.filter(i => i.auditId === auditId),
    expenses: expenses.filter(e => e.auditId === auditId),
  };
}

export function computeAuditSummary(
  auditIncome: AuditIncomeEntry[],
  auditExpenses: AuditExpenseEntry[],
): AuditSummary {
  const totalIncome = auditIncome.reduce((s, l) => s + l.amount, 0);
  const totalExpenses = auditExpenses.reduce((s, l) => s + l.amount, 0);
  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    incomeCount: auditIncome.length,
    expenseCount: auditExpenses.length,
  };
}

/** Side-by-side totals plus per-category expense bars for the detail chart. */
export function computeAuditChartData(
  auditIncome: AuditIncomeEntry[],
  auditExpenses: AuditExpenseEntry[],
): {
  comparison: AuditChartPoint[];
  expenseBreakdown: AuditExpenseBreakdown[];
  incomeByType: { name: string; value: number; fill: string }[];
} {
  const totalIncome = auditIncome.reduce((s, l) => s + l.amount, 0);
  const totalExpenses = auditExpenses.reduce((s, l) => s + l.amount, 0);

  const comparison: AuditChartPoint[] = [
    { name: "Totals", income: totalIncome, expenses: totalExpenses },
  ];

  const expenseMap = new Map<string, number>();
  for (const line of auditExpenses) {
    expenseMap.set(line.category, (expenseMap.get(line.category) ?? 0) + line.amount);
  }

  const expenseBreakdown: AuditExpenseBreakdown[] = Array.from(
    expenseMap.entries(),
  ).map(([name, value]) => ({
    name,
    value,
    fill: EXPENSE_COLORS[name] ?? "#94a3b8",
  }));

  const incomeTypeMap = new Map<string, number>();
  for (const line of auditIncome) {
    incomeTypeMap.set(line.type, (incomeTypeMap.get(line.type) ?? 0) + line.amount);
  }

  const incomeColors: Record<string, string> = {
    Tithes: "#3b82f6",
    Offering: "#10b981",
    Donation: "#8b5cf6",
  };

  const incomeByType = Array.from(incomeTypeMap.entries()).map(([name, value]) => ({
    name,
    value,
    fill: incomeColors[name] ?? "#94a3b8",
  }));

  return { comparison, expenseBreakdown, incomeByType };
}

export function auditsToLegacyIncome(
  income: AuditIncomeEntry[],
): import("./types").IncomeLine[] {
  return income.map(line => ({
    id: line.id,
    date: line.date,
    type: line.type,
    amount: line.amount,
    category: line.source,
    notes: line.notes,
  }));
}

export function auditsToLegacyExpenses(
  expenses: AuditExpenseEntry[],
): import("./types").ExpenseLine[] {
  return expenses.map(line => ({
    id: line.id,
    date: line.date,
    category: line.category,
    amount: line.amount,
    description: line.description,
    vendor: line.vendor,
  }));
}

export type ReportSignatory = {
  label: string;
  name: string;
};

export type AuditPrintOrganization = {
  name: string;
  address: string;
  phone: string;
  logoUrl?: string | null;
};

export type AuditPrintData = {
  audit: AuditSchedule;
  income: AuditIncomeEntry[];
  expenses: AuditExpenseEntry[];
  summary: AuditSummary;
  organization: AuditPrintOrganization;
  currency: SupportedCurrency;
  signatories: ReportSignatory[];
};
