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

export type DedicationCertificateData = {
  childName: string;
  dedicatedAt: string;
  organizationName: string;
  organizationLogo?: string | null;
  location?: string;
  officiantName?: string | null;
  parentNames?: string;
  sponsors?: string;
  orientation?: CertificateOrientation;
};

export type DedicationCertificateProps = DedicationCertificateData & {
  className?: string;
};

function parseNames(names?: string): string[] {
  if (!names) return [];
  return names
    .split(/\r?\n|,/)
    .map(name => name.trim())
    .filter(Boolean);
}

function toCertificateData(data: DedicationCertificateData): CertificateData {
  const signatories = [
    ...(data.officiantName
      ? [{ name: data.officiantName, label: "Officiant" }]
      : []),
    ...parseNames(data.parentNames).map(name => ({
      name,
      label: "Parent",
    })),
    ...parseNames(data.sponsors).map(name => ({
      name,
      label: "Sponsor",
    })),
  ];

  return {
    eyebrow: "Certificate of Child Dedication",
    honoreeName: data.childName,
    leadText: "This certifies that",
    bodyText: "was dedicated to the Lord on",
    date: data.dedicatedAt,
    organizationName: data.organizationName,
    organizationLogo: data.organizationLogo,
    location: data.location,
    signatories: signatories.length ? signatories : undefined,
    verseText:
      "For this child I prayed, and the Lord has granted me my petition that I made to him.",
    verseRef: "1 Samuel 1:27",
    orientation: data.orientation,
  };
}

export function buildDedicationCertificateHtml(
  data: DedicationCertificateData,
): string {
  return buildCertificateHtml(toCertificateData(data));
}

export function openDedicationCertificatePrint(
  data: DedicationCertificateData,
): void {
  openCertificatePrint(toCertificateData(data));
}

export async function downloadDedicationCertificateImage(
  element: HTMLElement,
  data: DedicationCertificateData,
): Promise<void> {
  await downloadCertificateImage(
    element,
    toCertificateData(data),
    "dedication-certificate",
    ".dedication-certificate",
  );
}

export function DedicationCertificate({
  childName,
  dedicatedAt,
  organizationName,
  organizationLogo = null,
  location,
  officiantName,
  parentNames,
  sponsors,
  orientation,
  className,
}: DedicationCertificateProps) {
  return (
    <Certificate
      {...toCertificateData({
        childName,
        dedicatedAt,
        organizationName,
        organizationLogo,
        location,
        officiantName,
        parentNames,
        sponsors,
        orientation,
      })}
      className={`dedication-certificate ${className ?? ""}`.trim()}
    />
  );
}

export function DedicationCertificateWithTheme({
  childName,
  dedicatedAt,
  location,
  officiantName,
  parentNames,
  sponsors,
  orientation,
  className,
}: Omit<DedicationCertificateProps, "organizationName" | "organizationLogo">) {
  const { settings } = useTheme();

  return (
    <DedicationCertificate
      childName={childName}
      dedicatedAt={dedicatedAt}
      organizationName={settings.organizationName}
      organizationLogo={settings.organizationLogo}
      location={location}
      officiantName={officiantName}
      parentNames={parentNames}
      sponsors={sponsors}
      orientation={orientation}
      className={className}
    />
  );
}
