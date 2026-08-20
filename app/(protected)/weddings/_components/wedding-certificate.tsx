"use client";

import { useTheme } from "@/context/theme-context";
import {
  Certificate,
  buildCertificateHtml,
  downloadCertificateImage,
  openCertificatePrint,
  type CertificateData,
  type CertificateOrientation,
} from "@/components/certificates/certificate";

export type WeddingCertificateData = {
  spouse1Name: string;
  spouse2Name: string;
  marriedAt: string;
  organizationName: string;
  organizationLogo?: string | null;
  location?: string;
  officiantName?: string | null;
  witnesses?: string;
  orientation?: CertificateOrientation;
};

export type WeddingCertificateProps = WeddingCertificateData & {
  className?: string;
};

function parseWitnesses(witnesses?: string): string[] {
  if (!witnesses) return [];
  return witnesses
    .split(/\r?\n|,/)
    .map(name => name.trim())
    .filter(Boolean);
}

function toCertificateData(data: WeddingCertificateData): CertificateData {
  const signatories = [
    ...(data.officiantName
      ? [{ name: data.officiantName, label: "Officiant" }]
      : []),
    ...parseWitnesses(data.witnesses).map(name => ({
      name,
      label: "Witness",
    })),
  ];

  return {
    eyebrow: "Certificate of Marriage",
    honoreeName: `${data.spouse1Name} & ${data.spouse2Name}`,
    leadText: "This certifies that",
    bodyText: "were united in marriage on",
    date: data.marriedAt,
    organizationName: data.organizationName,
    organizationLogo: data.organizationLogo,
    location: data.location,
    signatories: signatories.length ? signatories : undefined,
    verseText:
      "So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate.",
    verseRef: "Mark 10:8-9",
    orientation: data.orientation,
  };
}

export function buildWeddingCertificateHtml(
  data: WeddingCertificateData,
): string {
  return buildCertificateHtml(toCertificateData(data));
}

export function openWeddingCertificatePrint(
  data: WeddingCertificateData,
): void {
  openCertificatePrint(toCertificateData(data));
}

export async function downloadWeddingCertificateImage(
  element: HTMLElement,
  data: WeddingCertificateData,
): Promise<void> {
  await downloadCertificateImage(
    element,
    toCertificateData(data),
    "wedding-certificate",
    ".wedding-certificate",
  );
}

export function WeddingCertificate({
  spouse1Name,
  spouse2Name,
  marriedAt,
  organizationName,
  organizationLogo = null,
  location,
  officiantName,
  witnesses,
  orientation,
  className,
}: WeddingCertificateProps) {
  return (
    <Certificate
      {...toCertificateData({
        spouse1Name,
        spouse2Name,
        marriedAt,
        organizationName,
        organizationLogo,
        location,
        officiantName,
        witnesses,
        orientation,
      })}
      className={`wedding-certificate ${className ?? ""}`.trim()}
    />
  );
}

export function WeddingCertificateWithTheme({
  spouse1Name,
  spouse2Name,
  marriedAt,
  location,
  officiantName,
  witnesses,
  orientation,
  className,
}: Omit<WeddingCertificateProps, "organizationName" | "organizationLogo">) {
  const { settings } = useTheme();

  return (
    <WeddingCertificate
      spouse1Name={spouse1Name}
      spouse2Name={spouse2Name}
      marriedAt={marriedAt}
      organizationName={settings.organizationName}
      organizationLogo={settings.organizationLogo}
      location={location}
      officiantName={officiantName}
      witnesses={witnesses}
      orientation={orientation}
      className={className}
    />
  );
}
