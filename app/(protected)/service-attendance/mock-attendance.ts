// components/attendance/mock-attendance.ts
export type AttendanceMember = {
  id: string;
  name: string;
  householdName?: string;
  membershipType?: string;
  status: "present" | "absent";
  notes?: string;
};

export type AttendanceRecord = {
  id: string;
  categoryId: string; // service type id, optional for now
  categoryName?: string; // e.g. "Sunday Service"
  name: string; // user-supplied name like "Nov 2 Morning Service"
  date: string; // YYYY-MM-DD
  attendees: AttendanceMember[]; // member list
  description?: string;
};

export const attendanceData: AttendanceRecord[] = [
  {
    id: "rec-2025-11-02-1",
    categoryId: "st1",
    categoryName: "Sunday Service",
    name: "Nov 2 Morning Service",
    date: "2025-11-02",
    description: "Morning worship — praise team led by Team A",
    attendees: [
      { id: "1", name: "Sarah Johnson", householdName: "Johnson Family", membershipType: "Worker", status: "present" },
      { id: "2", name: "Michael Johnson", householdName: "Johnson Family", membershipType: "Worker", status: "present" },
      { id: "3", name: "Emma Johnson", householdName: "Johnson Family", membershipType: "Member", status: "present" },
      { id: "14", name: "Alex Rivera", householdName: "Rivera", membershipType: "For Evangelism", status: "present", notes: "First-time" },
      { id: "15", name: "Sophia Kim", householdName: "Kim", membershipType: "For Evangelism", status: "absent" },
    ],
  },
  {
    id: "rec-2025-10-26-1",
    categoryId: "st1",
    categoryName: "Sunday Service",
    name: "Oct 26 Morning Service",
    date: "2025-10-26",
    description: "Morning worship — outreach emphasis",
    attendees: [
      { id: "1", name: "Sarah Johnson", householdName: "Johnson Family", membershipType: "Worker", status: "present" },
      { id: "4", name: "David Martinez", householdName: "Martinez Family", membershipType: "Member", status: "present" },
      { id: "12", name: "Mark Thompson", householdName: "Thompson", membershipType: "Attender", status: "absent" },
      { id: "13", name: "Rachel Green", householdName: "Green", membershipType: "Attender", status: "present" },
    ],
  },
  {
    id: "rec-2025-10-19-1",
    categoryId: "st2",
    categoryName: "Sunday School",
    name: "Oct 19 Sunday School",
    date: "2025-10-19",
    description: "Kids classes and Bible study",
    attendees: [
      { id: "3", name: "Emma Johnson", householdName: "Johnson Family", membershipType: "Member", status: "present" },
      { id: "11", name: "Emily Davis", householdName: "Brown Family", membershipType: "Member", status: "present" },
      { id: "8", name: "Robert Chen", householdName: "Chen Family", membershipType: "Worker", status: "absent" },
    ],
  },
];
