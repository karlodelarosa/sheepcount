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

export type MemorialCertificateData = {
  deceasedName: string;
  deathDate: string;
  organizationName: string;
  organizationLogo?: string | null;
  location?: string;
  officiantName?: string | null;
  survivedBy?: string;
  orientation?: CertificateOrientation;
};

export type MemorialCertificateProps = MemorialCertificateData & {
  className?: string;
};

function toCertificateData(data: MemorialCertificateData): CertificateData {
  return {
    eyebrow: "In Loving Memory",
    honoreeName: data.deceasedName,
    leadText: "Forever in our hearts",
    bodyText: "was called home to be with the Lord on",
    date: data.deathDate,
    organizationName: data.organizationName,
    organizationLogo: data.organizationLogo,
    location: data.location,
    signatories: data.officiantName
      ? [{ name: data.officiantName, label: "Officiant" }]
      : undefined,
    verseText: "Blessed are those who mourn, for they will be comforted.",
    verseRef: "Matthew 5:4",
    orientation: data.orientation,
  };
}

export function buildMemorialCertificateHtml(
  data: MemorialCertificateData,
): string {
  return buildCertificateHtml(toCertificateData(data));
}

export function openMemorialCertificatePrint(
  data: MemorialCertificateData,
): void {
  openCertificatePrint(toCertificateData(data));
}

export async function downloadMemorialCertificateImage(
  element: HTMLElement,
  data: MemorialCertificateData,
): Promise<void> {
  await downloadCertificateImage(
    element,
    toCertificateData(data),
    "memorial-card",
    ".memorial-certificate",
  );
}

export function MemorialCertificate({
  deceasedName,
  deathDate,
  organizationName,
  organizationLogo = null,
  location,
  officiantName,
  orientation,
  className,
}: MemorialCertificateProps) {
  return (
    <Certificate
      {...toCertificateData({
        deceasedName,
        deathDate,
        organizationName,
        organizationLogo,
        location,
        officiantName,
        orientation,
      })}
      className={`memorial-certificate ${className ?? ""}`.trim()}
    />
  );
}

export function MemorialCertificateWithTheme({
  deceasedName,
  deathDate,
  location,
  officiantName,
  orientation,
  className,
}: Omit<MemorialCertificateProps, "organizationName" | "organizationLogo">) {
  const { settings } = useTheme();

  return (
    <MemorialCertificate
      deceasedName={deceasedName}
      deathDate={deathDate}
      organizationName={settings.organizationName}
      organizationLogo={settings.organizationLogo}
      location={location}
      officiantName={officiantName}
      orientation={orientation}
      className={className}
    />
  );
}
