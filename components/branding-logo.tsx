"use client";

import { BrandLogoIcon } from "@/components/brand-logo-icon";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

export function BrandingLogo({
  className,
  iconClassName,
  imageClassName,
}: {
  className?: string;
  iconClassName?: string;
  imageClassName?: string;
}) {
  const { settings } = useTheme();
  const showOrgLogo =
    settings.useOrganizationLogo && Boolean(settings.organizationLogo);

  if (showOrgLogo) {
    return (
      <img
        src={settings.organizationLogo!}
        alt={`${settings.organizationName} logo`}
        className={cn(
          "shrink-0 rounded-lg border border-border/60 object-cover",
          className,
          imageClassName,
        )}
      />
    );
  }

  return (
    <BrandLogoIcon className={className} iconClassName={iconClassName} />
  );
}
