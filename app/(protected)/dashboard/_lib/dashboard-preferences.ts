export const ATTENTION_EXPANDED_STORAGE_KEY =
  "ministry-lens.dashboard.needs-attention";

type ReadableStorage = Pick<Storage, "getItem">;

export function readAttentionExpanded(storage: ReadableStorage): boolean {
  try {
    return storage.getItem(ATTENTION_EXPANDED_STORAGE_KEY) === "expanded";
  } catch {
    return false;
  }
}
