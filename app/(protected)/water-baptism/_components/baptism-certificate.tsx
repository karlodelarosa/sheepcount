"use client";

import { toPng } from "html-to-image";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

export type BaptismCertificateData = {
  personName: string;
  baptizedAt: string;
  organizationName: string;
  organizationLogo?: string | null;
  location?: string;
  officiantName?: string | null;
};

export type BaptismCertificateProps = BaptismCertificateData & {
  className?: string;
};

function formatBaptismDate(baptizedAt: string): string {
  return new Date(baptizedAt).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildBaptismCertificateHtml(
  data: BaptismCertificateData,
): string {
  const formattedDate = formatBaptismDate(data.baptizedAt);
  const logoMarkup = data.organizationLogo
    ? `<img src="${data.organizationLogo}" alt="" style="width:64px;height:64px;border-radius:9999px;object-fit:cover;display:block;margin:0 auto 24px;" />`
    : `<div style="width:64px;height:64px;border-radius:9999px;background:#0f172a;color:#fff;font-size:24px;font-weight:600;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">${data.organizationName.charAt(0)}</div>`;

  const locationMarkup = data.location
    ? `<span style="display:block;margin-top:8px;font-size:14px;color:#64748b;">at ${data.location}</span>`
    : "";

  const officiantMarkup = data.officiantName
    ? `<div style="margin-top:40px;">
        <div style="width:192px;margin:0 auto;border-top:1px solid #94a3b8;padding-top:8px;font-size:14px;color:#334155;">
          ${data.officiantName}
        </div>
        <p style="margin-top:4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">
          Officiant
        </p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Baptism Certificate — ${data.personName}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: Georgia, "Times New Roman", serif;
        background: #f8fafc;
        color: #0f172a;
        padding: 32px;
      }
      .certificate {
        max-width: 900px;
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
      .person-name {
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
      .verse {
        margin-top: 40px;
        font-size: 12px;
        font-style: italic;
        color: #64748b;
      }
      .verse-ref {
        display: block;
        margin-top: 4px;
        font-style: normal;
      }
      @page { size: landscape; margin: 0.5in; }
      @media print {
        body { background: #fff; padding: 0; }
        .certificate { box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <div class="certificate">
      ${logoMarkup}
      <p class="subtitle">Certificate of Water Baptism</p>
      <h1 class="church-name">${data.organizationName}</h1>
      <p class="lead">This certifies that</p>
      <p class="person-name">${data.personName}</p>
      <p class="body-copy">
        was baptized in water on
        <span class="date">${formattedDate}</span>
        ${locationMarkup}
      </p>
      ${officiantMarkup}
      <p class="verse">
        &ldquo;Therefore go and make disciples of all nations, baptizing them in
        the name of the Father and of the Son and of the Holy Spirit.&rdquo;
        <span class="verse-ref">— Matthew 28:19</span>
      </p>
    </div>
  </body>
</html>`;
}

export function openBaptismCertificatePrint(data: BaptismCertificateData): void {
  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(buildBaptismCertificateHtml(data));
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  printWindow.addEventListener("load", triggerPrint);
  window.setTimeout(triggerPrint, 300);
}

function getCertificateFileName(data: BaptismCertificateData): string {
  const slug = data.personName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `baptism-certificate-${slug || "person"}-${data.baptizedAt}.png`;
}

export async function downloadBaptismCertificateImage(
  element: HTMLElement,
  data: BaptismCertificateData,
): Promise<void> {
  const target =
    element.querySelector<HTMLElement>(".baptism-certificate") ?? element;

  const dataUrl = await toPng(target, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const link = document.createElement("a");
  link.download = getCertificateFileName(data);
  link.href = dataUrl;
  link.click();
}

export function BaptismCertificate({
  personName,
  baptizedAt,
  organizationName,
  organizationLogo = null,
  location,
  officiantName,
  className,
}: BaptismCertificateProps) {
  const formattedDate = formatBaptismDate(baptizedAt);

  return (
    <div
      className={cn(
        "baptism-certificate mx-auto w-full max-w-3xl rounded-2xl border-4 border-double border-slate-300 bg-white p-10 text-center text-slate-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-50",
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
        Certificate of Water Baptism
      </p>
      <h1 className="mt-3 text-3xl font-serif font-semibold text-slate-900">
        {organizationName}
      </h1>
      <p className="mt-8 text-base text-slate-600">This certifies that</p>
      <p className="mt-3 text-4xl font-serif font-semibold text-slate-900">
        {personName}
      </p>
      <p className="mt-8 text-base leading-relaxed text-slate-600">
        was baptized in water on
        <span className="block mt-2 text-lg font-medium text-slate-900">
          {formattedDate}
        </span>
        {location ? (
          <span className="block mt-2 text-sm text-slate-500">at {location}</span>
        ) : null}
      </p>

      {officiantName ? (
        <div className="mt-10">
          <div className="mx-auto w-48 border-t border-slate-400 pt-2 text-sm text-slate-700">
            {officiantName}
          </div>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
            Officiant
          </p>
        </div>
      ) : null}

      <p className="mt-10 text-xs italic text-slate-500">
        &ldquo;Therefore go and make disciples of all nations, baptizing them in
        the name of the Father and of the Son and of the Holy Spirit.&rdquo;
        <span className="block mt-1 not-italic">— Matthew 28:19</span>
      </p>
    </div>
  );
}

export function BaptismCertificateWithTheme({
  personName,
  baptizedAt,
  location,
  officiantName,
  className,
}: Omit<BaptismCertificateProps, "organizationName" | "organizationLogo">) {
  const { settings } = useTheme();

  return (
    <BaptismCertificate
      personName={personName}
      baptizedAt={baptizedAt}
      organizationName={settings.organizationName}
      organizationLogo={settings.organizationLogo}
      location={location}
      officiantName={officiantName}
      className={className}
    />
  );
}
