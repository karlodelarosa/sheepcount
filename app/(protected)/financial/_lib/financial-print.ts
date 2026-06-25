import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import type { AuditPrintData, ReportSignatory } from "./audit-overview";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildLetterhead(data: AuditPrintData): string {
  const { organization } = data;
  const logoMarkup = organization.logoUrl
    ? `<img src="${escapeHtml(organization.logoUrl)}" alt="" class="logo" />`
    : `<div class="logo-fallback">${escapeHtml(organization.name.charAt(0) || "C")}</div>`;

  const addressLine = organization.address
    ? `<p class="org-detail">${escapeHtml(organization.address)}</p>`
    : "";
  const phoneLine = organization.phone
    ? `<p class="org-detail">${escapeHtml(organization.phone)}</p>`
    : "";

  return `<div class="letterhead">
    ${logoMarkup}
    <div class="org-block">
      <p class="org-name">${escapeHtml(organization.name)}</p>
      ${addressLine}
      ${phoneLine}
    </div>
  </div>
  <hr class="divider" />`;
}

function buildSignatories(signatories: ReportSignatory[]): string {
  const filled = signatories.filter(s => s.label.trim() || s.name.trim());
  const rows =
    filled.length > 0
      ? filled
      : [
          { label: "Prepared by", name: "" },
          { label: "Reviewed by", name: "" },
          { label: "Approved by", name: "" },
        ];

  const cells = rows
    .map(
      sig => `<div class="signatory">
        <div class="signatory-line"></div>
        <p class="signatory-name">${escapeHtml(sig.name || "\u00a0")}</p>
        <p class="signatory-label">${escapeHtml(sig.label)}</p>
      </div>`,
    )
    .join("");

  return `<div class="signatories">
    <p class="signatories-heading">Signatories</p>
    <div class="signatories-grid">${cells}</div>
  </div>`;
}

export function buildFinancialAuditReportHtml(data: AuditPrintData): string {
  const { audit, income, expenses, summary, currency } = data;

  const incomeRows = income
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      line => `<tr>
        <td>${escapeHtml(formatDate(line.date))}</td>
        <td>${escapeHtml(line.type)}</td>
        <td>${escapeHtml(line.source)}</td>
        <td>${escapeHtml(line.paymentMethod)}</td>
        <td class="amount">${escapeHtml(formatCurrency(line.amount, currency))}</td>
        <td>${escapeHtml(line.notes || "—")}</td>
      </tr>`,
    )
    .join("");

  const expenseRows = expenses
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      line => `<tr>
        <td>${escapeHtml(formatDate(line.date))}</td>
        <td>${escapeHtml(line.category)}</td>
        <td>${escapeHtml(line.description)}</td>
        <td>${escapeHtml(line.vendor)}</td>
        <td>${escapeHtml(line.paymentMethod)}</td>
        <td class="amount">${escapeHtml(formatCurrency(line.amount, currency))}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Financial Report — ${escapeHtml(audit.title)}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: system-ui, -apple-system, sans-serif;
        color: #0f172a;
        padding: 32px;
        background: #fff;
      }
      .letterhead {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
      }
      .logo {
        width: 72px;
        height: 72px;
        border-radius: 12px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .logo-fallback {
        width: 72px;
        height: 72px;
        border-radius: 12px;
        background: #0f172a;
        color: #fff;
        font-size: 28px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .org-block { min-width: 0; }
      .org-name {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.2;
      }
      .org-detail {
        font-size: 13px;
        color: #475569;
        margin-top: 4px;
        line-height: 1.4;
      }
      .divider {
        border: none;
        border-top: 2px solid #0f172a;
        margin: 0 0 24px;
      }
      .report-header { margin-bottom: 20px; }
      h1 { font-size: 20px; font-weight: 600; }
      .meta { margin-top: 6px; font-size: 13px; color: #475569; }
      .summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin: 20px 0;
      }
      .summary-card {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 16px;
      }
      .summary-label { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
      .summary-value { font-size: 18px; font-weight: 600; margin-top: 4px; }
      .positive { color: #059669; }
      .negative { color: #dc2626; }
      h2 { font-size: 15px; margin: 20px 0 10px; color: #334155; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
      th, td { border: 1px solid #e2e8f0; padding: 7px 9px; text-align: left; }
      th { background: #f8fafc; font-weight: 600; color: #475569; font-size: 10px; text-transform: uppercase; }
      .amount { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
      .empty { color: #94a3b8; font-style: italic; padding: 16px; text-align: center; }
      .signatories { margin-top: 40px; page-break-inside: avoid; }
      .signatories-heading {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        margin-bottom: 16px;
      }
      .signatories-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
      .signatory { text-align: center; }
      .signatory-line {
        border-top: 1px solid #0f172a;
        margin-bottom: 6px;
        height: 48px;
      }
      .signatory-name {
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        min-height: 1.2em;
      }
      .signatory-label {
        font-size: 11px;
        color: #64748b;
        margin-top: 2px;
      }
      .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: center; }
      @page { margin: 0.75in; }
      @media print {
        body { padding: 0; }
      }
    </style>
  </head>
  <body>
    ${buildLetterhead(data)}

    <div class="report-header">
      <h1>${escapeHtml(audit.title)}</h1>
      <p class="meta">Schedule date: ${escapeHtml(formatDate(audit.scheduleDate))} · Generated ${escapeHtml(formatDate(new Date().toISOString().slice(0, 10)))}</p>
    </div>

    <div class="summary">
      <div class="summary-card">
        <p class="summary-label">Total Receipts</p>
        <p class="summary-value positive">${escapeHtml(formatCurrency(summary.totalIncome, currency))}</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Total Expenses</p>
        <p class="summary-value negative">${escapeHtml(formatCurrency(summary.totalExpenses, currency))}</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Net Balance</p>
        <p class="summary-value ${summary.netBalance >= 0 ? "positive" : "negative"}">${escapeHtml(formatCurrency(summary.netBalance, currency))}</p>
      </div>
    </div>

    <h2>Receipts (${income.length} entries)</h2>
    ${
      income.length === 0
        ? '<p class="empty">No receipt entries recorded.</p>'
        : `<table>
        <thead>
          <tr><th>Date</th><th>Type</th><th>Source</th><th>Received via</th><th>Amount</th><th>Notes</th></tr>
        </thead>
        <tbody>${incomeRows}</tbody>
      </table>`
    }

    <h2>Expenses (${expenses.length} entries)</h2>
    ${
      expenses.length === 0
        ? '<p class="empty">No expense entries recorded.</p>'
        : `<table>
        <thead>
          <tr><th>Date</th><th>Category</th><th>Description</th><th>Vendor</th><th>Paid via</th><th>Amount</th></tr>
        </thead>
        <tbody>${expenseRows}</tbody>
      </table>`
    }

    ${buildSignatories(data.signatories)}

    <p class="footer">Financial audit report · ${escapeHtml(data.organization.name)}</p>
  </body>
</html>`;
}

export function openFinancialAuditReportPrint(data: AuditPrintData): void {
  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(buildFinancialAuditReportHtml(data));
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  printWindow.addEventListener("load", triggerPrint);
  window.setTimeout(triggerPrint, 300);
}
