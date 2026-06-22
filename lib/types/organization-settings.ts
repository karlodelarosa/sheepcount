export type OrganizationSettings = {
  waterBaptismEnabled?: boolean;
};

export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  waterBaptismEnabled: false,
};

export function parseOrganizationSettings(
  raw: unknown,
): OrganizationSettings {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_ORGANIZATION_SETTINGS };
  }

  const value = raw as Record<string, unknown>;
  return {
    waterBaptismEnabled:
      typeof value.waterBaptismEnabled === "boolean"
        ? value.waterBaptismEnabled
        : DEFAULT_ORGANIZATION_SETTINGS.waterBaptismEnabled,
  };
}
