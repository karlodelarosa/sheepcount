import { describe, expect, it } from "vitest";

import {
  ATTENTION_EXPANDED_STORAGE_KEY,
  readAttentionExpanded,
} from "./dashboard-preferences";

function createStorage(value: string | null): Pick<Storage, "getItem"> {
  return {
    getItem: key => (key === ATTENTION_EXPANDED_STORAGE_KEY ? value : null),
  };
}

describe("readAttentionExpanded", () => {
  it("defaults to collapsed when no preference has been stored", () => {
    expect(readAttentionExpanded(createStorage(null))).toBe(false);
  });

  it("restores a stored collapsed preference", () => {
    expect(readAttentionExpanded(createStorage("collapsed"))).toBe(false);
  });

  it("restores a stored expanded preference", () => {
    expect(readAttentionExpanded(createStorage("expanded"))).toBe(true);
  });

  it("falls back to collapsed for invalid stored values", () => {
    expect(readAttentionExpanded(createStorage("unknown"))).toBe(false);
  });

  it("falls back to collapsed when storage is unavailable", () => {
    const storage = {
      getItem() {
        throw new Error("storage unavailable");
      },
    };

    expect(readAttentionExpanded(storage)).toBe(false);
  });
});
