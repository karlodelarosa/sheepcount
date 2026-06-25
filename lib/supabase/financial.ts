import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuditExpenseEntry,
  AuditIncomeEntry,
  AuditSchedule,
  IncomeType,
  NewAuditExpenseEntry,
  NewAuditIncomeEntry,
  NewAuditSchedule,
  PaymentMethod,
} from "@/app/(protected)/financial/_lib/types";

type DbFinancialAudit = {
  id: string;
  title: string;
  schedule_date: string;
};

type DbFinancialAuditIncomeEntry = {
  id: string;
  audit_id: string;
  date: string;
  type: IncomeType;
  source: string;
  amount: number | string;
  payment_method: PaymentMethod;
  notes: string;
};

type DbFinancialAuditExpenseEntry = {
  id: string;
  audit_id: string;
  date: string;
  category: string;
  amount: number | string;
  payment_method: PaymentMethod;
  description: string;
  vendor: string;
};

function toAmount(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

function toAudit(row: DbFinancialAudit): AuditSchedule {
  return {
    id: row.id,
    title: row.title,
    scheduleDate: row.schedule_date,
  };
}

function toIncomeEntry(row: DbFinancialAuditIncomeEntry): AuditIncomeEntry {
  return {
    id: row.id,
    auditId: row.audit_id,
    date: row.date,
    type: row.type,
    source: row.source,
    amount: toAmount(row.amount),
    paymentMethod: row.payment_method,
    notes: row.notes,
  };
}

function toExpenseEntry(
  row: DbFinancialAuditExpenseEntry,
): AuditExpenseEntry {
  return {
    id: row.id,
    auditId: row.audit_id,
    date: row.date,
    category: row.category,
    amount: toAmount(row.amount),
    paymentMethod: row.payment_method,
    description: row.description,
    vendor: row.vendor,
  };
}

export async function fetchFinancialAudits(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AuditSchedule[]> {
  const { data, error } = await supabase
    .from("financial_audits")
    .select("id, title, schedule_date")
    .eq("organization_id", organizationId)
    .order("schedule_date", { ascending: false });

  if (error) throw error;
  return (data as DbFinancialAudit[]).map(toAudit);
}

export async function fetchFinancialAuditIncomeEntries(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AuditIncomeEntry[]> {
  const { data, error } = await supabase
    .from("financial_audit_income_entries")
    .select(
      "id, audit_id, date, type, source, amount, payment_method, notes, financial_audits!inner(organization_id)",
    )
    .eq("financial_audits.organization_id", organizationId)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data as DbFinancialAuditIncomeEntry[]).map(toIncomeEntry);
}

export async function fetchFinancialAuditExpenseEntries(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AuditExpenseEntry[]> {
  const { data, error } = await supabase
    .from("financial_audit_expense_entries")
    .select(
      "id, audit_id, date, category, amount, payment_method, description, vendor, financial_audits!inner(organization_id)",
    )
    .eq("financial_audits.organization_id", organizationId)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data as DbFinancialAuditExpenseEntry[]).map(toExpenseEntry);
}

export async function createFinancialAudit(
  supabase: SupabaseClient,
  organizationId: string,
  input: NewAuditSchedule,
): Promise<AuditSchedule> {
  const { data, error } = await supabase
    .from("financial_audits")
    .insert({
      organization_id: organizationId,
      title: input.title,
      schedule_date: input.scheduleDate,
    })
    .select("id, title, schedule_date")
    .single();

  if (error) throw error;
  return toAudit(data as DbFinancialAudit);
}

export async function createFinancialAuditIncomeEntry(
  supabase: SupabaseClient,
  input: NewAuditIncomeEntry,
): Promise<AuditIncomeEntry> {
  const { data, error } = await supabase
    .from("financial_audit_income_entries")
    .insert({
      audit_id: input.auditId,
      date: input.date,
      type: input.type,
      source: input.source,
      amount: input.amount,
      payment_method: input.paymentMethod,
      notes: input.notes,
    })
    .select("id, audit_id, date, type, source, amount, payment_method, notes")
    .single();

  if (error) throw error;
  return toIncomeEntry(data as DbFinancialAuditIncomeEntry);
}

export async function createFinancialAuditExpenseEntry(
  supabase: SupabaseClient,
  input: NewAuditExpenseEntry,
): Promise<AuditExpenseEntry> {
  const { data, error } = await supabase
    .from("financial_audit_expense_entries")
    .insert({
      audit_id: input.auditId,
      date: input.date,
      category: input.category,
      amount: input.amount,
      payment_method: input.paymentMethod,
      description: input.description,
      vendor: input.vendor,
    })
    .select(
      "id, audit_id, date, category, amount, payment_method, description, vendor",
    )
    .single();

  if (error) throw error;
  return toExpenseEntry(data as DbFinancialAuditExpenseEntry);
}
