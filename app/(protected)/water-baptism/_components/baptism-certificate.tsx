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

export type BaptismCertificateData = {
  personName: string;
  baptizedAt: string;
  organizationName: string;
  organizationLogo?: string | null;
  location?: string;
  officiantName?: string | null;
  orientation?: CertificateOrientation;
};

export type BaptismCertificateProps = BaptismCertificateData & {
  className?: string;
};

function toCertificateData(data: BaptismCertificateData): CertificateData {
  return {
    eyebrow: "Certificate of Water Baptism",
    honoreeName: data.personName,
    leadText: "This certifies that",
    bodyText: "was baptized in water on",
    date: data.baptizedAt,
    organizationName: data.organizationName,
    organizationLogo: data.organizationLogo,
    location: data.location,
    signatories: data.officiantName
      ? [{ name: data.officiantName, label: "Officiant" }]
      : undefined,
    verseText:
      "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
    verseRef: "Matthew 28:19",
    orientation: data.orientation,
  };
}

export function buildBaptismCertificateHtml(
  data: BaptismCertificateData,
): string {
  return buildCertificateHtml(toCertificateData(data));
}

export function openBaptismCertificatePrint(
  data: BaptismCertificateData,
): void {
  openCertificatePrint(toCertificateData(data));
}

export async function downloadBaptismCertificateImage(
  element: HTMLElement,
  data: BaptismCertificateData,
): Promise<void> {
  await downloadCertificateImage(
    element,
    toCertificateData(data),
    "baptism-certificate",
    ".baptism-certificate",
  );
}

export function BaptismCertificate({
  personName,
  baptizedAt,
  organizationName,
  organizationLogo = null,
  location,
  officiantName,
  orientation,
  className,
}: BaptismCertificateProps) {
  return (
    <Certificate
      {...toCertificateData({
        personName,
        baptizedAt,
        organizationName,
        organizationLogo,
        location,
        officiantName,
        orientation,
      })}
      className={`baptism-certificate ${className ?? ""}`.trim()}
    />
  );
}

export function BaptismCertificateWithTheme({
  personName,
  baptizedAt,
  location,
  officiantName,
  orientation,
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
      orientation={orientation}
      className={className}
    />
  );
}
