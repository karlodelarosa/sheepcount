import { describe, expect, it, vi } from "vitest";
import {
  isValidNewCellGroupAttendee,
  submitCellGroupAttendance,
} from "./submit-attendance";

describe("Cell Group attendance submission", () => {
  it("requires a full name and either phone or social contact", () => {
    expect(
      isValidNewCellGroupAttendee({
        firstName: "Ana",
        lastName: "Santos",
        phone: "",
        socialContact: "@ana",
        birthdate: "",
      }),
    ).toBe(true);
    expect(
      isValidNewCellGroupAttendee({
        firstName: "Ana",
        lastName: "Santos",
        phone: "",
        socialContact: "",
        birthdate: "",
      }),
    ).toBe(false);
  });

  it("creates and enrolls a new Prospect before recording attendance", async () => {
    const addPerson = vi.fn().mockResolvedValue({ id: "new-person" });
    const assignCellGroupMember = vi.fn().mockResolvedValue({ id: "member" });
    const recordCellGroupAttendance = vi.fn().mockResolvedValue(true);

    const result = await submitCellGroupAttendance({
      cellGroupId: "cell-1",
      date: "2026-10-16",
      leaderPersonId: "leader-1",
      leaderName: "Leader Name",
      location: "Santos residence",
      existingPersonIds: ["existing-1"],
      enrollExistingPersonIds: [],
      newAttendees: [
        {
          key: "new-1",
          firstName: "Ana",
          lastName: "Santos",
          phone: "09171234567",
          socialContact: "",
          birthdate: "",
        },
      ],
      addPerson,
      assignCellGroupMember,
      recordCellGroupAttendance,
    });

    expect(result).toBe(true);
    expect(addPerson).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipType: "Prospect",
        evangelismStage: "Small Group",
        firstAttendance: "2026-10-16",
      }),
      { quiet: true },
    );
    expect(assignCellGroupMember).toHaveBeenCalledWith(
      "cell-1",
      "new-person",
      "Member",
    );
    expect(recordCellGroupAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        personIds: ["existing-1", "new-person"],
      }),
    );
  });

  it("enrolls only existing attendees selected for membership", async () => {
    const assignCellGroupMember = vi.fn().mockResolvedValue({ id: "member" });
    const recordCellGroupAttendance = vi.fn().mockResolvedValue(true);

    await submitCellGroupAttendance({
      cellGroupId: "cell-1",
      date: "2026-10-16",
      leaderPersonId: "leader-1",
      leaderName: "Leader Name",
      location: "Main hall",
      existingPersonIds: ["person-1", "person-2"],
      enrollExistingPersonIds: ["person-2"],
      newAttendees: [],
      addPerson: vi.fn(),
      assignCellGroupMember,
      recordCellGroupAttendance,
    });

    expect(assignCellGroupMember).toHaveBeenCalledTimes(1);
    expect(assignCellGroupMember).toHaveBeenCalledWith(
      "cell-1",
      "person-2",
      "Member",
    );
  });
});
