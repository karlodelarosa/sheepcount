import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import type { ChurchProperty, PropertyBorrow } from "@/lib/supabase/properties";

export type BorrowFormOrganization = {
  name: string;
  address: string;
  phone: string;
  logoUrl: string | null;
};

export type BorrowFormPrintData = {
  organization: BorrowFormOrganization;
  property: ChurchProperty;
  borrow: PropertyBorrow;
  currency: SupportedCurrency;
};

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

function buildLetterhead(org: BorrowFormOrganization): string {
  const logoMarkup = org.logoUrl
    ? `<img src="${escapeHtml(org.logoUrl)}" alt="" class="logo" />`
    : `<div class="logo-fallback">${escapeHtml(org.name.charAt(0) || "C")}</div>`;

  const addressLine = org.address
    ? `<p class="org-detail">${escapeHtml(org.address)}</p>`
    : "";
  const phoneLine = org.phone
    ? `<p class="org-detail">${escapeHtml(org.phone)}</p>`
    : "";

  return `<div class="letterhead">
    ${logoMarkup}
    <div class="org-block">
      <p class="org-name">${escapeHtml(org.name)}</p>
      ${addressLine}
      ${phoneLine}
    </div>
  </div>
  <hr class="divider" />`;
}

export function buildBorrowFormHtml(data: BorrowFormPrintData): string {
  const { organization, property, borrow, currency } = data;
  const dueLabel = borrow.dueAt ? formatDate(borrow.dueAt) : "Not specified";
  const notesBlock = borrow.notes.trim()
    ? `<p class="notes"><strong>Notes:</strong> ${escapeHtml(borrow.notes)}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Property Borrow Form - ${escapeHtml(property.name)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: Georgia, "Times New Roman", serif;
        color: #0f172a;
        margin: 0;
        padding: 32px;
        line-height: 1.5;
      }
      .letterhead { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
      .logo { width: 56px; height: 56px; object-fit: contain; }
      .logo-fallback {
        width: 56px; height: 56px; border-radius: 12px;
        background: #e2e8f0; display: flex; align-items: center; justify-content: center;
        font-size: 24px; font-weight: 700; color: #475569;
      }
      .org-name { font-size: 20px; font-weight: 700; margin: 0; }
      .org-detail { font-size: 12px; color: #64748b; margin: 2px 0 0; }
      .divider { border: none; border-top: 2px solid #cbd5e1; margin: 16px 0 24px; }
      h1 { font-size: 22px; margin: 0 0 6px; text-align: center; }
      .meta { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 24px; }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px 24px;
        margin-bottom: 24px;
      }
      .field { border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
      .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
      .field-value { font-size: 15px; font-weight: 600; min-height: 1.4em; }
      .full-width { grid-column: 1 / -1; }
      .terms {
        margin-top: 28px;
        padding: 16px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 12px;
        color: #475569;
      }
      .signatures {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        margin-top: 40px;
      }
      .signature-block { text-align: center; }
      .signature-line {
        border-bottom: 1px solid #0f172a;
        height: 40px;
        margin-bottom: 6px;
      }
      .signature-label { font-size: 12px; color: #64748b; }
      .signature-name { font-size: 13px; font-weight: 600; }
      .notes { margin-top: 16px; font-size: 13px; color: #334155; }
      .footer { margin-top: 32px; font-size: 10px; color: #94a3b8; text-align: center; }
      @page { margin: 0.75in; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    ${buildLetterhead(organization)}

    <h1>Property Borrow Form</h1>
    <p class="meta">Generated ${escapeHtml(formatDate(new Date().toISOString().slice(0, 10)))}</p>

    <div class="form-grid">
      <div class="field full-width">
        <p class="field-label">Property / Item</p>
        <p class="field-value">${escapeHtml(property.name)} (${escapeHtml(property.typeName)})</p>
      </div>
      ${
        property.description.trim()
          ? `<div class="field full-width">
        <p class="field-label">Description</p>
        <p class="field-value">${escapeHtml(property.description)}</p>
      </div>`
          : ""
      }
      <div class="field">
        <p class="field-label">Estimated Value</p>
        <p class="field-value">${escapeHtml(formatCurrency(property.estimatedValue, currency))}</p>
      </div>
      <div class="field">
        <p class="field-label">Borrower</p>
        <p class="field-value">${escapeHtml(borrow.borrowerName)}</p>
      </div>
      <div class="field">
        <p class="field-label">Borrow Date</p>
        <p class="field-value">${escapeHtml(formatDate(borrow.borrowedAt))}</p>
      </div>
      <div class="field">
        <p class="field-label">Expected Return</p>
        <p class="field-value">${escapeHtml(dueLabel)}</p>
      </div>
      <div class="field">
        <p class="field-label">Return Date</p>
        <p class="field-value">${borrow.returnedAt ? escapeHtml(formatDate(borrow.returnedAt)) : "___________________"}</p>
      </div>
    </div>

    ${notesBlock}

    <div class="terms">
      I acknowledge receipt of the above property and agree to return it in good condition
      by the expected return date. I understand that I am responsible for any loss or damage
      while the item is in my care.
    </div>

    <div class="signatures">
      <div class="signature-block">
        <div class="signature-line"></div>
        <p class="signature-name">${escapeHtml(borrow.borrowerName)}</p>
        <p class="signature-label">Borrower signature & date</p>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <p class="signature-name">&nbsp;</p>
        <p class="signature-label">Authorized representative</p>
      </div>
    </div>

    <p class="footer">Property borrow form · ${escapeHtml(organization.name)}</p>
  </body>
</html>`;
}

export function openBorrowFormPrint(data: BorrowFormPrintData): void {
  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(buildBorrowFormHtml(data));
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  printWindow.addEventListener("load", triggerPrint);
  window.setTimeout(triggerPrint, 300);
}
