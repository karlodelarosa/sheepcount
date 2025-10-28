import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  Home,
  Calendar,
  Users,
  Award,
} from "lucide-react";
import {
  mockPeople,
  mockMinistryAssignments,
  mockLifeGroupMembers,
  mockAttendance,
  mockMinistries,
  mockLifeGroups,
} from "@/components/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PersonDetailsProps {
  personId: string;
  onBack: () => void;
}

export function PersonDetails({ personId, onBack }: PersonDetailsProps) {
  const person = mockPeople.find(p => p.id === personId);

  // --- Start of Data Processing ---

  // Dark Mode Adjustments for Not Found State
  if (!person) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            // Dual-mode styling for back button in not-found state
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          {/* Dual-mode text for not-found state */}
          <h1 className="text-slate-900 dark:text-white">Person Not Found</h1>
        </div>
        <Card className="bg-white border-slate-200 dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className="p-8 text-center text-slate-500 dark:text-zinc-500">
            The requested person could not be found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const ministries = mockMinistryAssignments
    .filter(a => a.personId === personId)
    .map(a => ({
      ...a,
      ministry: mockMinistries.find(m => m.id === a.ministryId),
    }));

  const lifeGroups = mockLifeGroupMembers
    .filter(m => m.personId === personId)
    .map(m => ({
      ...m,
      group: mockLifeGroups.find(g => g.id === m.lifeGroupId),
    }));

  const attendanceRecords = mockAttendance.filter(r => r.personId === personId);

  const last12Weeks = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    return date;
  }).reverse();

  const weeklyAttendance = last12Weeks.map(week => {
    const attended = attendanceRecords.some(r => {
      const recordDate = new Date(r.date);
      // Check if the record date is within the current week's range (roughly)
      return (
        Math.abs(recordDate.getTime() - week.getTime()) <
        7 * 24 * 60 * 60 * 1000
      );
    });
    return {
      week: `Week ${last12Weeks.indexOf(week) + 1}`,
      attended: attended ? 1 : 0,
    };
  });

  const totalAttended = attendanceRecords.length;
  // Note: Assuming max 52 weeks/year for rate calculation
  const attendanceRate = Math.round((totalAttended / 52) * 100);

  // --- Dual-Mode Badge Colors ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
      case "Inactive":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300";
      case "Exited":
        return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case "Worker":
        return "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300";
      case "Member":
        return "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300";
      case "Attender":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
    }
  };

  const ACCENT_COLOR_LIGHT = "#6366f1"; // Indigo-500
  const ACCENT_COLOR_DARK = "#a78bfa"; // Violet-400

  // --- End of Data Processing ---

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          // Dual-mode styling for back button
          className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          {/* Dual-mode text colors */}
          <h1 className="text-slate-900 dark:text-white">Person Details</h1>
          <p className="text-slate-600 dark:text-zinc-400">
            Comprehensive view of member information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info Card */}
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Avatar color remains a static accent for prominence */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-500 dark:from-purple-700 dark:to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl">
                    {person.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900 dark:text-white">
                    {person.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    {person.role} • {person.age} years old
                  </CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      className={`rounded-lg ${getStatusColor(person.status)}`}
                    >
                      {person.status}
                    </Badge>
                    <Badge
                      className={`rounded-lg ${getMembershipColor(person.membershipType)}`}
                    >
                      {person.membershipType}
                    </Badge>
                  </div>
                </div>
              </div>
              {/* Edit Profile Button (Dual Mode) */}
              <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700">
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                  <div>
                    <p className="text-slate-500 dark:text-zinc-500">Email</p>
                    <p className="text-slate-900 dark:text-white">
                      {person.email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                  <div>
                    <p className="text-slate-500 dark:text-zinc-500">Phone</p>
                    <p className="text-slate-900 dark:text-white">
                      {person.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                  <div>
                    <p className="text-slate-500 dark:text-zinc-500">
                      Household
                    </p>
                    <p className="text-slate-900 dark:text-white">
                      {person.householdName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                  <div>
                    <p className="text-slate-500 dark:text-zinc-500">
                      Join Date
                    </p>
                    <p className="text-slate-900 dark:text-white">
                      {new Date(person.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-500">
                Ministries
              </span>
              <span className="text-slate-900 dark:text-white">
                {ministries.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-500">
                Life Groups
              </span>
              <span className="text-slate-900 dark:text-white">
                {lifeGroups.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-500">
                Attendance Rate
              </span>
              <span className="text-slate-900 dark:text-white">
                {attendanceRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-500">
                Total Attended
              </span>
              <span className="text-slate-900 dark:text-white">
                {totalAttended}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trend Card */}
      <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">
            Attendance Trend (Last 12 Weeks)
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-zinc-400">
            Weekly service attendance tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyAttendance}>
              {/* Chart grid lines and axis colors (Dual Mode) */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                className="dark:stroke-zinc-500"
              />
              <XAxis
                dataKey="week"
                stroke="#64748b"
                className="dark:stroke-zinc-400"
              />
              <YAxis stroke="#64748b" className="dark:stroke-zinc-400" />
              <Tooltip
                // Tooltip background and border must be styled using contentStyle object
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  color: "#0f172a", // slate-900
                }}
                wrapperClassName="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                formatter={(value: number) =>
                  value === 1 ? "Present" : "Absent"
                }
              />
              <Bar
                dataKey="attended"
                fill={ACCENT_COLOR_LIGHT}
                className="dark:fill-violet-400"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ministry Assignments Card */}
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white">
                Ministry Assignments
              </CardTitle>
              <Award className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
            </div>
          </CardHeader>
          <CardContent>
            {ministries.length === 0 ? (
              <p className="text-slate-500 dark:text-zinc-500 text-center py-8">
                Not assigned to any ministries
              </p>
            ) : (
              <div className="space-y-3">
                {ministries.map(assignment => (
                  <div
                    key={assignment.id}
                    // Dual-mode background for list item
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-slate-900 dark:text-white">
                        {assignment.ministry?.name}
                      </p>
                      <Badge variant="secondary" className="rounded-lg">
                        {assignment.role}
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 mt-1">
                      {assignment.ministry?.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Life Groups Card */}
        <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white">
                Life Groups
              </CardTitle>
              <Users className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
            </div>
          </CardHeader>
          <CardContent>
            {lifeGroups.length === 0 ? (
              <p className="text-slate-500 dark:text-zinc-500 text-center py-8">
                Not part of any life groups
              </p>
            ) : (
              <div className="space-y-3">
                {lifeGroups.map(membership => (
                  <div
                    key={membership.id}
                    // Dual-mode background for list item
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60"
                  >
                    <p className="text-slate-900 dark:text-white">
                      {membership.group?.name}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400 mt-1">
                      {membership.group?.description}
                    </p>
                    <p className="text-slate-500 dark:text-zinc-500 mt-2">
                      Joined:{" "}
                      {new Date(membership.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
