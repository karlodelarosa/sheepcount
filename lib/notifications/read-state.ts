const STORAGE_PREFIX = "sheepcount-notifications-read";

function getStorageKey(organizationId: string): string {
  return `${STORAGE_PREFIX}:${organizationId}`;
}

export function loadReadNotificationIds(
  organizationId: string | undefined,
): Set<string> {
  if (!organizationId || typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = localStorage.getItem(getStorageKey(organizationId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function saveReadNotificationIds(
  organizationId: string,
  ids: Set<string>,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    getStorageKey(organizationId),
    JSON.stringify([...ids]),
  );
}
