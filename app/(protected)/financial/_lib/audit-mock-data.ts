import type {
  AuditExpenseEntry,
  AuditIncomeEntry,
  AuditSchedule,
} from "./types";

export const MOCK_AUDIT_SCHEDULES: AuditSchedule[] = [
  {
    id: "audit-1",
    title: "June 2026 - Audit",
    scheduleDate: "2026-06-01",
  },
  {
    id: "audit-2",
    title: "May 2026 - Audit",
    scheduleDate: "2026-05-01",
  },
  {
    id: "audit-3",
    title: "October 2024 - Audit",
    scheduleDate: "2024-10-01",
  },
];

export const MOCK_AUDIT_INCOME: AuditIncomeEntry[] = [
  {
    id: "ai-1",
    auditId: "audit-3",
    date: "2024-10-13",
    type: "Tithes",
    source: "Sunday morning service",
    amount: 125000,
    paymentMethod: "Cash",
    notes: "Weekly collection",
  },
  {
    id: "ai-2",
    auditId: "audit-3",
    date: "2024-10-13",
    type: "Offering",
    source: "Building fund offering",
    amount: 32000,
    paymentMethod: "E-wallet",
    notes: "",
  },
  {
    id: "ai-3",
    auditId: "audit-3",
    date: "2024-10-06",
    type: "Tithes",
    source: "Sunday morning service",
    amount: 118000,
    paymentMethod: "Cash",
    notes: "",
  },
  {
    id: "ai-4",
    auditId: "audit-2",
    date: "2026-05-11",
    type: "Tithes",
    source: "Sunday services (combined)",
    amount: 142000,
    paymentMethod: "Cash",
    notes: "",
  },
  {
    id: "ai-5",
    auditId: "audit-2",
    date: "2026-05-18",
    type: "Donation",
    source: "Anonymous donor",
    amount: 75000,
    paymentMethod: "Online Bank",
    notes: "Building fund",
  },
  {
    id: "ai-6",
    auditId: "audit-1",
    date: "2026-06-08",
    type: "Tithes",
    source: "Sunday morning service",
    amount: 130000,
    paymentMethod: "Cash",
    notes: "",
  },
  {
    id: "ai-7",
    auditId: "audit-1",
    date: "2026-06-15",
    type: "Offering",
    source: "Missions offering",
    amount: 45000,
    paymentMethod: "Online Bank",
    notes: "",
  },
];

export const MOCK_AUDIT_EXPENSES: AuditExpenseEntry[] = [
  {
    id: "ae-1",
    auditId: "audit-3",
    date: "2024-10-15",
    category: "Electricity",
    amount: 18500,
    paymentMethod: "Online Bank",
    description: "Meralco bill — October",
    vendor: "Meralco",
  },
  {
    id: "ae-2",
    auditId: "audit-3",
    date: "2024-10-10",
    category: "Salaries",
    amount: 150000,
    paymentMethod: "Online Bank",
    description: "Staff salaries",
    vendor: "Payroll",
  },
  {
    id: "ae-3",
    auditId: "audit-3",
    date: "2024-10-08",
    category: "Rent",
    amount: 45000,
    paymentMethod: "Online Bank",
    description: "Monthly facility rent",
    vendor: "Property Management Co",
  },
  {
    id: "ae-4",
    auditId: "audit-3",
    date: "2024-10-05",
    category: "Resources (Food, Water)",
    amount: 8500,
    paymentMethod: "Cash",
    description: "Fellowship refreshments and water delivery",
    vendor: "Local Supplier",
  },
  {
    id: "ae-5",
    auditId: "audit-2",
    date: "2026-05-12",
    category: "Electricity",
    amount: 19200,
    paymentMethod: "Online Bank",
    description: "Meralco bill — May",
    vendor: "Meralco",
  },
  {
    id: "ae-6",
    auditId: "audit-2",
    date: "2026-05-10",
    category: "Rent",
    amount: 45000,
    paymentMethod: "Online Bank",
    description: "Monthly facility rent",
    vendor: "Property Management Co",
  },
  {
    id: "ae-7",
    auditId: "audit-1",
    date: "2026-06-10",
    category: "Electricity",
    amount: 20100,
    paymentMethod: "E-wallet",
    description: "Meralco bill — June",
    vendor: "Meralco",
  },
  {
    id: "ae-8",
    auditId: "audit-1",
    date: "2026-06-12",
    category: "Resources (Food, Water)",
    amount: 12000,
    paymentMethod: "Cash",
    description: "Youth event food and water",
    vendor: "Local Supplier",
  },
];

export function createInitialAuditData() {
  return {
    audits: MOCK_AUDIT_SCHEDULES.map(a => ({ ...a })),
    income: MOCK_AUDIT_INCOME.map(i => ({ ...i })),
    expenses: MOCK_AUDIT_EXPENSES.map(e => ({ ...e })),
  };
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}
