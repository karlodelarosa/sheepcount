import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  fetchCellGroupLeadershipRoster,
  searchCellGroupLeaderCandidates,
  setCellGroupLeaderApprovals,
} from "./cell-group-leaders";

describe("cell group leader RPCs", () => {
  it("maps the leadership roster contract", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          personId: "person-1",
          fullName: "Jamie Rivera",
          email: "jamie@example.com",
          approvalStatus: "approved",
          activeGroupCount: 0,
          accountStatus: "none",
          accountKind: null,
          loginId: null,
        },
      ],
      error: null,
    });

    const result = await fetchCellGroupLeadershipRoster(
      {
        rpc,
      } as unknown as SupabaseClient,
      "org-1",
    );

    expect(rpc).toHaveBeenCalledWith("get_cell_group_leadership_roster", {
      p_organization_id: "org-1",
    });
    expect(result[0]).toEqual(
      expect.objectContaining({
        personId: "person-1",
        activeGroupCount: 0,
        accountStatus: "none",
      }),
    );
  });

  it("sends a bounded search query", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });

    await searchCellGroupLeaderCandidates(
      { rpc } as unknown as SupabaseClient,
      "org-1",
      "  Jamie  ",
    );

    expect(rpc).toHaveBeenCalledWith("search_cell_group_leader_candidates", {
      p_query: "Jamie",
      p_limit: 50,
      p_organization_id: "org-1",
    });
  });

  it("passes absolute approval intent for a bulk selection", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          personId: "person-1",
          fullName: "Jamie Rivera",
          ok: true,
          status: "approved",
          unchanged: false,
        },
      ],
      error: null,
    });

    const result = await setCellGroupLeaderApprovals(
      { rpc } as unknown as SupabaseClient,
      "org-1",
      ["person-1"],
      true,
    );

    expect(rpc).toHaveBeenCalledWith("set_cell_group_leader_approvals", {
      p_person_ids: ["person-1"],
      p_approved: true,
      p_organization_id: "org-1",
    });
    expect(result).toHaveLength(1);
  });
});
