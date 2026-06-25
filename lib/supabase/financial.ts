import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuditExpenseEntry,
  AuditIncomeEntry,
  AuditSchedule,
  FinancialOption,
  NewAuditExpenseEntry,
  NewAuditIncomeEntry,
  NewAuditSchedule,
  PaymentMethod,
} from "@/app/(protected)/financial/_lib/types";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_RECEIPT_TYPES,
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
  type: string;
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

type DbFinancialOption = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

function toFinancialOption(row: DbFinancialOption): FinancialOption {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export async function fetchFinancialReceiptTypes(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<FinancialOption[]> {
  const { data, error } = await supabase
    .from("financial_receipt_types")
    .select("id, name, sort_order, is_active")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data as DbFinancialOption[]).map(toFinancialOption);
}

export async function fetchFinancialExpenseCategories(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<FinancialOption[]> {
  const { data, error } = await supabase
    .from("financial_expense_categories")
    .select("id, name, sort_order, is_active")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data as DbFinancialOption[]).map(toFinancialOption);
}

export async function seedFinancialDefaults(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  const receiptRows = DEFAULT_RECEIPT_TYPES.map((name, index) => ({
    organization_id: organizationId,
    name,
    sort_order: index + 1,
  }));
  const categoryRows = DEFAULT_EXPENSE_CATEGORIES.map((name, index) => ({
    organization_id: organizationId,
    name,
    sort_order: index + 1,
  }));

  const [receiptError, categoryError] = await Promise.all([
    supabase
      .from("financial_receipt_types")
      .upsert(receiptRows, { onConflict: "organization_id,name", ignoreDuplicates: true }),
    supabase
      .from("financial_expense_categories")
      .upsert(categoryRows, { onConflict: "organization_id,name", ignoreDuplicates: true }),
  ]).then(([receiptResult, categoryResult]) => [
    receiptResult.error,
    categoryResult.error,
  ]);

  if (receiptError) throw receiptError;
  if (categoryError) throw categoryError;
}

export async function createFinancialReceiptType(
  supabase: SupabaseClient,
  organizationId: string,
  name: string,
): Promise<FinancialOption> {
  const trimmed = name.trim();
  const { data: existing } = await supabase
    .from("financial_receipt_types")
    .select("id, name, sort_order, is_active")
    .eq("organization_id", organizationId)
    .eq("name", trimmed)
    .maybeSingle();

  if (existing) {
    if (existing.is_active) {
      throw new Error("This receipt type already exists");
    }

    const { data, error } = await supabase
      .from("financial_receipt_types")
      .update({ is_active: true })
      .eq("id", existing.id)
      .select("id, name, sort_order, is_active")
      .single();

    if (error) throw error;
    return toFinancialOption(data as DbFinancialOption);
  }

  const { count } = await supabase
    .from("financial_receipt_types")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const { data, error } = await supabase
    .from("financial_receipt_types")
    .insert({
      organization_id: organizationId,
      name: trimmed,
      sort_order: (count ?? 0) + 1,
    })
    .select("id, name, sort_order, is_active")
    .single();

  if (error) throw error;
  return toFinancialOption(data as DbFinancialOption);
}

export async function deactivateFinancialReceiptType(
  supabase: SupabaseClient,
  optionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("financial_receipt_types")
    .update({ is_active: false })
    .eq("id", optionId);

  if (error) throw error;
}

export async function createFinancialExpenseCategory(
  supabase: SupabaseClient,
  organizationId: string,
  name: string,
): Promise<FinancialOption> {
  const trimmed = name.trim();
  const { data: existing } = await supabase
    .from("financial_expense_categories")
    .select("id, name, sort_order, is_active")
    .eq("organization_id", organizationId)
    .eq("name", trimmed)
    .maybeSingle();

  if (existing) {
    if (existing.is_active) {
      throw new Error("This expense category already exists");
    }

    const { data, error } = await supabase
      .from("financial_expense_categories")
      .update({ is_active: true })
      .eq("id", existing.id)
      .select("id, name, sort_order, is_active")
      .single();

    if (error) throw error;
    return toFinancialOption(data as DbFinancialOption);
  }

  const { count } = await supabase
    .from("financial_expense_categories")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const { data, error } = await supabase
    .from("financial_expense_categories")
    .insert({
      organization_id: organizationId,
      name: trimmed,
      sort_order: (count ?? 0) + 1,
    })
    .select("id, name, sort_order, is_active")
    .single();

  if (error) throw error;
  return toFinancialOption(data as DbFinancialOption);
}

export async function deactivateFinancialExpenseCategory(
  supabase: SupabaseClient,
  optionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("financial_expense_categories")
    .update({ is_active: false })
    .eq("id", optionId);

  if (error) throw error;
}
