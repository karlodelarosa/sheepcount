"use client";

import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";

export type CertificateSignatory = {
  name: string;
  label: string;
};

export type CertificateOrientation = "landscape" | "portrait";

export type CertificateData = {
  eyebrow: string;
  honoreeName: string;
  leadText: string;
  bodyText: string;
  date: string;
  organizationName: string;
  organizationLogo?: string | null;
  location?: string;
  signatories?: CertificateSignatory[];
  verseText?: string;
  verseRef?: string;
  orientation?: CertificateOrientation;
};

export type CertificateProps = CertificateData & {
  className?: string;
};

export function formatCertificateDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildCertificateHtml(data: CertificateData): string {
  const orientation = data.orientation ?? "landscape";
  const formattedDate = formatCertificateDate(data.date);
  const logoMarkup = data.organizationLogo
    ? `<img src="${data.organizationLogo}" alt="" style="width:64px;height:64px;border-radius:9999px;object-fit:cover;display:block;margin:0 auto 24px;" />`
    : `<div style="width:64px;height:64px;border-radius:9999px;background:#0f172a;color:#fff;font-size:24px;font-weight:600;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">${data.organizationName.charAt(0)}</div>`;

  const locationMarkup = data.location
    ? `<span style="display:block;margin-top:8px;font-size:14px;color:#64748b;">at ${data.location}</span>`
    : "";

  const signatoriesMarkup = data.signatories?.length
    ? `<div style="margin-top:40px;display:flex;justify-content:center;gap:48px;flex-wrap:wrap;">
        ${data.signatories
          .map(
            signatory => `<div>
              <div style="width:192px;margin:0 auto;border-top:1px solid #94a3b8;padding-top:8px;font-size:14px;color:#334155;">
                ${signatory.name}
              </div>
              <p style="margin-top:4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">
                ${signatory.label}
              </p>
            </div>`,
          )
          .join("")}
      </div>`
    : "";

  const verseMarkup = data.verseText
    ? `<p style="margin-top:40px;font-size:12px;font-style:italic;color:#64748b;">
        &ldquo;${data.verseText}&rdquo;
        ${data.verseRef ? `<span style="display:block;margin-top:4px;font-style:normal;">— ${data.verseRef}</span>` : ""}
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${data.eyebrow} — ${data.honoreeName}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: Georgia, "Times New Roman", serif;
        background: #f8fafc;
        color: #0f172a;
        padding: 32px;
      }
      .certificate {
        max-width: ${orientation === "portrait" ? "640px" : "900px"};
        margin: 0 auto;
        border: 4px double #cbd5e1;
        border-radius: 16px;
        background: #fff;
        padding: 48px 40px;
        text-align: center;
      }
      .subtitle {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: #64748b;
      }
      .church-name {
        margin-top: 12px;
        font-size: 30px;
        font-weight: 600;
      }
      .lead {
        margin-top: 32px;
        font-size: 16px;
        color: #475569;
      }
      .honoree-name {
        margin-top: 12px;
        font-size: 36px;
        font-weight: 600;
      }
      .body-copy {
        margin-top: 32px;
        font-size: 16px;
        line-height: 1.6;
        color: #475569;
      }
      .date {
        display: block;
        margin-top: 8px;
        font-size: 18px;
        font-weight: 600;
        color: #0f172a;
      }
      @page { size: ${orientation}; margin: 0.5in; }
      @media print {
        body { background: #fff; padding: 0; }
        .certificate { box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <div class="certificate">
      ${logoMarkup}
      <p class="subtitle">${data.eyebrow}</p>
      <h1 class="church-name">${data.organizationName}</h1>
      <p class="lead">${data.leadText}</p>
      <p class="honoree-name">${data.honoreeName}</p>
      <p class="body-copy">
        ${data.bodyText}
        <span class="date">${formattedDate}</span>
        ${locationMarkup}
      </p>
      ${signatoriesMarkup}
      ${verseMarkup}
    </div>
  </body>
</html>`;
}

export function openCertificatePrint(data: CertificateData): void {
  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(buildCertificateHtml(data));
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  printWindow.addEventListener("load", triggerPrint);
  window.setTimeout(triggerPrint, 300);
}

function getCertificateFileName(
  data: CertificateData,
  filenamePrefix: string,
): string {
  const slug = data.honoreeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${filenamePrefix}-${slug || "record"}-${data.date}.png`;
}

export async function downloadCertificateImage(
  element: HTMLElement,
  data: CertificateData,
  filenamePrefix: string,
  selector = ".certificate-card",
): Promise<void> {
  const target = element.querySelector<HTMLElement>(selector) ?? element;

  const dataUrl = await toPng(target, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const link = document.createElement("a");
  link.download = getCertificateFileName(data, filenamePrefix);
  link.href = dataUrl;
  link.click();
}

export function Certificate({
  eyebrow,
  honoreeName,
  leadText,
  bodyText,
  date,
  organizationName,
  organizationLogo = null,
  location,
  signatories,
  verseText,
  verseRef,
  orientation = "landscape",
  className,
}: CertificateProps) {
  const formattedDate = formatCertificateDate(date);

  return (
    <div
      className={cn(
        "certificate-card mx-auto w-full rounded-2xl border-4 border-double border-slate-300 bg-white p-10 text-center text-slate-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-50",
        orientation === "portrait" ? "max-w-lg" : "max-w-3xl",
        className,
      )}
    >
      {organizationLogo ? (
        <img
          src={organizationLogo}
          alt=""
          className="mx-auto mb-6 h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white">
          {organizationName.charAt(0)}
        </div>
      )}

      <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-serif font-semibold text-slate-900">
        {organizationName}
      </h1>
      <p className="mt-8 text-base text-slate-600">{leadText}</p>
      <p className="mt-3 text-4xl font-serif font-semibold text-slate-900">
        {honoreeName}
      </p>
      <p className="mt-8 text-base leading-relaxed text-slate-600">
        {bodyText}
        <span className="block mt-2 text-lg font-medium text-slate-900">
          {formattedDate}
        </span>
        {location ? (
          <span className="block mt-2 text-sm text-slate-500">
            at {location}
          </span>
        ) : null}
      </p>

      {signatories?.length ? (
        <div className="mt-10 flex flex-wrap justify-center gap-10">
          {signatories.map(signatory => (
            <div key={`${signatory.label}-${signatory.name}`}>
              <div className="mx-auto w-48 border-t border-slate-400 pt-2 text-sm text-slate-700">
                {signatory.name}
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                {signatory.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {verseText ? (
        <p className="mt-10 text-xs italic text-slate-500">
          &ldquo;{verseText}&rdquo;
          {verseRef ? (
            <span className="block mt-1 not-italic">— {verseRef}</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
