export type IncomeType = "Tithes" | "Offering" | "Donation";

export type PaymentMethod = "Cash" | "Online Bank" | "E-wallet";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "Online Bank",
  "E-wallet",
];

export type IncomeLine = {
  id: string;
  date: string;
  type: IncomeType;
  amount: number;
  category: string;
  notes: string;
};

export type ExpenseLine = {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  vendor: string;
};

export type FinancialDayGroup = {
  date: string;
  income: IncomeLine[];
  expenses: ExpenseLine[];
};

export type FinancialEntryType = "income" | "expense";

export type NewIncomeEntry = Omit<IncomeLine, "id">;
export type NewExpenseEntry = Omit<ExpenseLine, "id">;

/** A scheduled financial audit period (e.g. "June 2026 - Audit"). */
export type AuditSchedule = {
  id: string;
  title: string;
  /** When the audit schedule was created or recorded. */
  scheduleDate: string;
};

export type AuditIncomeEntry = {
  id: string;
  auditId: string;
  date: string;
  type: IncomeType;
  source: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes: string;
};

export type AuditExpenseEntry = {
  id: string;
  auditId: string;
  date: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  vendor: string;
};

export type NewAuditSchedule = Omit<AuditSchedule, "id">;
export type NewAuditIncomeEntry = Omit<AuditIncomeEntry, "id">;
export type NewAuditExpenseEntry = Omit<AuditExpenseEntry, "id">;

export const EXPENSE_CATEGORIES = [
  "Electricity",
  "Rent",
  "Resources (Food, Water)",
  "Salaries",
  "Building Maintenance",
  "Ministry Supplies",
  "Missions Support",
  "Insurance",
  "Technology",
  "Other",
] as const;
